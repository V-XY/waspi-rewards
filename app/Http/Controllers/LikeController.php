<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Like;
use App\Services\RewardService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LikeController extends Controller
{
    public function __construct(protected RewardService $rewardService)
    {
    }

    public function store(Request $request, Comment $comment): JsonResponse
    {
        try {
            $like = DB::transaction(function () use ($request, $comment) {
                $like = Like::create([
                    'user_id' => $request->user()->id,
                    'comment_id' => $comment->id,
                    'vote_type' => 'like',
                ]);

                // A reward failure must not leave a persisted like without its
                // corresponding reward decision.
                $this->rewardService->handleNewLike($like);

                return $like;
            });
        } catch (UniqueConstraintViolationException) {
            // The unique index is the final guard against concurrent duplicate likes.
            return response()->json(['message' => 'Already liked'], 422);
        }

        return response()->json([
            'message' => 'Liked',
            'like' => $like,
        ], 201);
    }

    public function vote(Request $request, Comment $comment): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:like,dislike',
        ]);

        $type = $validated['type'];

        try {
            $vote = DB::transaction(function () use ($request, $comment, $type) {
                $vote = Like::query()
                    ->where('user_id', $request->user()->id)
                    ->where('comment_id', $comment->id)
                    ->lockForUpdate()
                    ->first();

                if (! $vote) {
                    $vote = Like::create([
                        'user_id' => $request->user()->id,
                        'comment_id' => $comment->id,
                        'vote_type' => $type,
                    ]);

                    if ($type === 'like') {
                        $this->rewardService->handleNewLike($vote);
                    }

                    return $vote;
                }

                if ($vote->vote_type !== $type) {
                    $vote->update(['vote_type' => $type]);

                    if ($type === 'like') {
                        $this->rewardService->handleNewLike($vote);
                    }
                }

                return $vote;
            });
        } catch (UniqueConstraintViolationException) {
            // A concurrent request may have created the unique vote first.
            $vote = Like::query()
                ->where('user_id', $request->user()->id)
                ->where('comment_id', $comment->id)
                ->firstOrFail();

            if ($vote->vote_type !== $type) {
                DB::transaction(function () use ($vote, $type) {
                    $vote->update(['vote_type' => $type]);

                    if ($type === 'like') {
                        $this->rewardService->handleNewLike($vote);
                    }
                });
            }
        }

        $comment->loadCount('likes');

        return response()->json([
            'message' => 'Vote saved',
            'viewer_vote' => $vote->vote_type,
            'likes_count' => $comment->likes_count,
        ]);
    }

    public function removeVote(Request $request, Comment $comment): JsonResponse
    {
        DB::transaction(function () use ($request, $comment) {
            Like::query()
                ->where('user_id', $request->user()->id)
                ->where('comment_id', $comment->id)
                ->lockForUpdate()
                ->first()
                ?->delete();
        });

        $comment->loadCount('likes');

        return response()->json([
            'message' => 'Vote removed',
            'viewer_vote' => null,
            'likes_count' => $comment->likes_count,
        ]);
    }

    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        $like = Like::where('user_id', $request->user()->id)
            ->where('comment_id', $comment->id)
            ->where('vote_type', 'like')
            ->first();

        if (! $like) {
            return response()->json(['message' => 'Not liked'], 404);
        }

        $like->delete();

        return response()->json(['message' => 'Unliked']);
    }
}