<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Like;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LikeTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_failed_reward_rolls_back_the_like(): void
    {
        $this->mock(RewardService::class, function ($mock) {
            $mock->shouldReceive('handleNewLike')
                ->once()
                ->andThrow(new \RuntimeException('Reward failure'));
        });

        $author = User::factory()->create();
        $comment = Comment::create([
            'user_id' => $author->id,
            'text' => 'A comment to like',
        ]);

        $viewer = User::factory()->create();
        $token = $viewer->createToken('like-rollback')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/comments/{$comment->id}/like")
            ->assertStatus(500);

        $this->assertDatabaseMissing('likes', [
            'user_id' => $viewer->id,
            'comment_id' => $comment->id,
        ]);

        $this->assertSame(0, Like::where('comment_id', $comment->id)->count());
    }
}
