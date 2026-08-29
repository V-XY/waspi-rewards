<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Like;

class RewardService
{
    public function handleNewComment(Comment $comment): void
    {
        $user = $comment->user;
        $count = $user->comments()->count();

        if ($count === 1) {
            $user->addPoints(50);
        } elseif ($count === 30) {
            // 2,500 points is the total comment reward at this milestone.
            $user->addPoints(2450);
        } elseif ($count === 50) {
            // 5,000 points is the total comment reward at this milestone.
            $user->addPoints(2500);
        }
    }

    public function handleNewLike(Like $like): void
    {
        $user = $like->user;
        $count = $user->likes()->count();

        if ($count === 10) {
            $user->addPoints(500);
        }
    }
}
