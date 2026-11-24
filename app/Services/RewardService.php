<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Like;
use App\Models\RewardGrant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RewardService
{
    public function handleNewComment(Comment $comment): void
    {
        $user = $comment->user;
        $count = $user->comments()->count();

        if ($count === 1) {
            $this->grantOnce($user, 'first-comment', 50);
        } elseif ($count === 30) {
            $this->grantOnce($user, 'thirty-comments', 2450);
        } elseif ($count === 50) {
            $this->grantOnce($user, 'fifty-comments', 2500);
        }
    }

    public function handleNewLike(Like $like): void
    {
        $user = $like->user;
        $count = $user->likes()->count();

        if ($count === 10) {
            $this->grantOnce($user, 'ten-likes', 500);
        }
    }

    private function grantOnce(User $user, string $rewardKey, int $points): void
    {
        DB::transaction(function () use ($user, $rewardKey, $points): void {
            $grant = RewardGrant::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'reward_key' => $rewardKey,
                ],
                ['points' => $points]
            );

            if ($grant->wasRecentlyCreated) {
                $user->addPoints($points);
            }
        });
    }
}
