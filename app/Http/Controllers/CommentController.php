<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Like;
use App\Services\RewardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    public const DEFAULT_PAGE_SIZE = 20;

    public const MAX_PAGE_SIZE = 50;

    public function __construct(protected RewardService $rewardService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:'.self::MAX_PAGE_SIZE,
            'sort' => 'sometimes|in:best,newest,oldest',
        ]);

        $userId = $request->user()->id;
        $sort = $validated['sort'] ?? 'best';

        $voteCounts = DB::table('likes')
            ->select('comment_id')
            ->selectRaw("SUM(CASE WHEN vote_type = 'like' THEN 1 ELSE 0 END) AS likes_count")
            ->selectRaw('COUNT(*) AS total_votes')
            ->groupBy('comment_id');

        // Wilson's 95% lower confidence bound rewards consistent support, not raw vote volume.
        $positiveRate = '(CAST(vote_counts.likes_count AS REAL) / vote_counts.total_votes)';
        $wilsonScore = "CASE
            WHEN COALESCE(vote_counts.total_votes, 0) = 0 THEN 0.0
            ELSE (
                {$positiveRate}
                + (3.8416 / (2 * vote_counts.total_votes))
                - (1.96 * SQRT(
                    (({$positiveRate}) * (1 - ({$positiveRate})) + (3.8416 / (4 * vote_counts.total_votes)))
                    / vote_counts.total_votes
                ))
            ) / (1 + (3.8416 / vote_counts.total_votes))
        END";

        // A small 0.01 boost for recently supported comments improves discovery without dominating vote confidence.
        $freshCutoff = now()->subDays(7)->toDateTimeString();

        $rankedComments = DB::table('comments')
            ->leftJoinSub($voteCounts, 'vote_counts', 'vote_counts.comment_id', '=', 'comments.id')
            ->select('comments.*')
            ->selectRaw('COALESCE(vote_counts.likes_count, 0) AS likes_count')
            ->selectRaw('COALESCE(vote_counts.total_votes - vote_counts.likes_count, 0) AS dislikes_count')
            ->selectRaw(
                "({$wilsonScore}) + CASE WHEN COALESCE(vote_counts.likes_count, 0) > 0 AND comments.created_at >= ? THEN 0.01 ELSE 0.0 END AS best_score",
                [$freshCutoff]
            );

        // The derived table makes best_score a real column for keyset cursor predicates.
        $query = Comment::query()
            ->fromSub($rankedComments, 'comments')
            ->select('comments.*')
            ->with('user:id,name')
            ->withExists(['likes as liked_by_user' => fn ($query) => $query->where('user_id', $userId)])
            ->addSelect(['viewer_vote' => Like::query()
                ->select('vote_type')
                ->whereColumn('comment_id', 'comments.id')
                ->where('user_id', $userId)
                ->limit(1)]);

        match ($sort) {
            'newest' => $query->orderByDesc('comments.created_at')->orderByDesc('comments.id'),
            'oldest' => $query->orderBy('comments.created_at')->orderBy('comments.id'),
            default => $query->orderByDesc('best_score')
                ->orderByDesc('comments.created_at')
                ->orderByDesc('comments.id'),
        };

        $comments = $query->cursorPaginate($validated['per_page'] ?? self::DEFAULT_PAGE_SIZE);

        return response()->json($comments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(['text' => 'required|string|max:1000']);

        // The comment and its reward succeed or fail together.
        $comment = DB::transaction(function () use ($request, $validated) {
            $comment = Comment::create([
                'user_id' => $request->user()->id,
                'text' => $validated['text'],
                'timestamp_source' => 'native',
            ]);

            $this->rewardService->handleNewComment($comment);

            return $comment;
        });

        $comment->load('user:id,name')->loadCount('likes');
        $comment->setAttribute('liked_by_user', false);
        $comment->setAttribute('viewer_vote', null);

        return response()->json([
            'message' => 'Comment created',
            'comment' => $comment,
        ], 201);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        if ($comment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}