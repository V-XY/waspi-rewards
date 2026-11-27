<?php

namespace App\Http\Controllers;

use App\Models\Comment;
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
        ]);

        $userId = $request->user()->id;

        // Ordering by id keeps the cursor stable and matches creation order.
        $comments = Comment::query()
            ->with('user:id,name')
            ->withCount('likes')
            ->withExists(['likes as liked_by_user' => fn ($query) => $query->where('user_id', $userId)])
            ->orderByDesc('id')
            ->cursorPaginate($validated['per_page'] ?? self::DEFAULT_PAGE_SIZE);

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