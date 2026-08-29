<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Services\RewardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    protected RewardService $rewardService;

    public function __construct(RewardService $rewardService)
    {
        $this->rewardService = $rewardService;
    }

    public function index(): JsonResponse
    {
        $userId = auth()->id();

        $comments = Comment::with('user')
            ->withCount('likes')
            ->withExists(['likes as liked_by_user' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }])
            ->latest()
            ->get();

        return response()->json(['data' => $comments]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['text' => 'required|string|max:1000']);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'text' => $request->text,
        ]);

        $this->rewardService->handleNewComment($comment);

        return response()->json([
            'message' => 'Comment created',
            'comment' => $comment->load('user', 'likes'),
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