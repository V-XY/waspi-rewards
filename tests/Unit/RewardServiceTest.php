<?php

namespace Tests\Unit;

use App\Models\Comment;
use App\Models\Like;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RewardServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_comment_rewards_are_awarded_only_at_the_defined_milestones(): void
    {
        $user = User::factory()->create();
        $service = app(RewardService::class);

        $expectedPoints = [
            1 => 50,
            29 => 50,
            30 => 2500,
            31 => 2500,
            49 => 2500,
            50 => 5000,
            51 => 5000,
        ];

        for ($count = 1; $count <= 51; $count++) {
            $comment = Comment::create([
                'user_id' => $user->id,
                'text' => "Comment {$count}",
            ]);

            $service->handleNewComment($comment);

            if (array_key_exists($count, $expectedPoints)) {
                $this->assertSame(
                    $expectedPoints[$count],
                    $user->fresh()->points,
                    "Unexpected points after comment {$count}."
                );
            }
        }
    }

    public function test_comment_rewards_are_added_to_existing_points(): void
    {
        $user = User::factory()->create(['points' => 125]);
        $comment = Comment::create(['user_id' => $user->id, 'text' => 'First comment']);

        app(RewardService::class)->handleNewComment($comment);

        $this->assertSame(175, $user->fresh()->points);
    }

    public function test_like_reward_is_awarded_on_the_tenth_like_only(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $service = app(RewardService::class);

        for ($count = 1; $count <= 11; $count++) {
            $comment = Comment::create([
                'user_id' => $owner->id,
                'text' => "Comment {$count}",
            ]);

            $like = Like::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
            ]);

            $service->handleNewLike($like);

            if ($count === 9) {
                $this->assertSame(0, $user->fresh()->points);
            }

            if ($count === 10 || $count === 11) {
                $this->assertSame(500, $user->fresh()->points);
            }
        }
    }

    public function test_like_rewards_are_added_to_existing_points(): void
    {
        $user = User::factory()->create(['points' => 75]);
        $owner = User::factory()->create();
        $service = app(RewardService::class);

        for ($count = 1; $count <= 10; $count++) {
            $comment = Comment::create([
                'user_id' => $owner->id,
                'text' => "Comment {$count}",
            ]);

            $like = Like::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
            ]);

            $service->handleNewLike($like);
        }

        $this->assertSame(575, $user->fresh()->points);
    }
}
