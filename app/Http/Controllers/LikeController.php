<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Like;
use App\Services\RewardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LikeController extends Controller
{
    protected RewardService $rewardService;

    public function __construct(RewardService $rewardService)
    {
        $this->rewardService = $rewardService;
    }

    public function store(Request $request, Comment $comment): JsonResponse
    {
        $existing = Like::where('user_id', $request->user()->id)
            ->where('comment_id', $comment->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already liked'], 422);
        }

        $like = Like::create([
            'user_id' => $request->user()->id,
            'comment_id' => $comment->id,
        ]);

        $this->rewardService->handleNewLike($like);

        return response()->json([
            'message' => 'Liked',
            'like' => $like,
        ], 201);
    }

    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        $like = Like::where('user_id', $request->user()->id)
            ->where('comment_id', $comment->id)
            ->first();

        if (!$like) {
            return response()->json(['message' => 'Not liked'], 404);
        }

        $like->delete();

        return response()->json(['message' => 'Unliked']);
    }
}