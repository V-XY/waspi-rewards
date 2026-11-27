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

    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        $like = Like::where('user_id', $request->user()->id)
            ->where('comment_id', $comment->id)
            ->first();

        if (! $like) {
            return response()->json(['message' => 'Not liked'], 404);
        }

        $like->delete();

        return response()->json(['message' => 'Unliked']);
    }
}