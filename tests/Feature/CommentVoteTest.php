<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Like;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentVoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_dislikes_are_private_and_do_not_award_points(): void
    {
        $author = User::factory()->create();
        $voter = User::factory()->create();
        $comment = Comment::create([
            'user_id' => $author->id,
            'text' => 'A comment to evaluate',
        ]);
        $token = $voter->createToken('vote-test')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/comments/{$comment->id}/vote", ['type' => 'dislike'])
            ->assertOk()
            ->assertJsonPath('viewer_vote', 'dislike')
            ->assertJsonPath('likes_count', 0)
            ->assertJsonMissingPath('dislikes_count');

        $this->assertDatabaseHas('likes', [
            'user_id' => $voter->id,
            'comment_id' => $comment->id,
            'vote_type' => 'dislike',
        ]);
        $this->assertSame(0, $voter->fresh()->points);

        $this->withToken($token)
            ->getJson('/api/comments')
            ->assertOk()
            ->assertJsonPath('data.0.viewer_vote', 'dislike')
            ->assertJsonPath('data.0.likes_count', 0)
            ->assertJsonMissingPath('data.0.dislikes_count');
    }

    public function test_a_user_can_change_or_remove_their_single_vote(): void
    {
        $author = User::factory()->create();
        $voter = User::factory()->create();
        $comment = Comment::create([
            'user_id' => $author->id,
            'text' => 'A comment to vote on',
        ]);
        $token = $voter->createToken('vote-transition')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/comments/{$comment->id}/vote", ['type' => 'like'])
            ->assertOk()
            ->assertJsonPath('viewer_vote', 'like')
            ->assertJsonPath('likes_count', 1);

        $this->withToken($token)
            ->postJson("/api/comments/{$comment->id}/vote", ['type' => 'dislike'])
            ->assertOk()
            ->assertJsonPath('viewer_vote', 'dislike')
            ->assertJsonPath('likes_count', 0);

        $this->assertSame(1, Like::where('user_id', $voter->id)->where('comment_id', $comment->id)->count());

        $this->withToken($token)
            ->deleteJson("/api/comments/{$comment->id}/vote")
            ->assertOk()
            ->assertJsonPath('viewer_vote', null)
            ->assertJsonPath('likes_count', 0);

        $this->assertDatabaseMissing('likes', [
            'user_id' => $voter->id,
            'comment_id' => $comment->id,
        ]);
    }

    public function test_repeating_the_same_vote_is_idempotent(): void
    {
        $author = User::factory()->create();
        $voter = User::factory()->create();
        $comment = Comment::create([
            'user_id' => $author->id,
            'text' => 'A comment with repeated input',
        ]);
        $token = $voter->createToken('vote-idempotency')->plainTextToken;

        foreach (range(1, 2) as $attempt) {
            $this->withToken($token)
                ->postJson("/api/comments/{$comment->id}/vote", ['type' => 'like'])
                ->assertOk()
                ->assertJsonPath('viewer_vote', 'like')
                ->assertJsonPath('likes_count', 1);
        }

        $this->assertSame(1, Like::where('user_id', $voter->id)->where('comment_id', $comment->id)->count());
    }

    public function test_changing_a_dislike_to_a_like_counts_towards_the_existing_like_reward(): void
    {
        $voter = User::factory()->create();
        $author = User::factory()->create();

        foreach (range(1, 9) as $number) {
            $comment = Comment::create([
                'user_id' => $author->id,
                'text' => "Existing like {$number}",
            ]);

            Like::create([
                'user_id' => $voter->id,
                'comment_id' => $comment->id,
            ]);
        }

        $target = Comment::create([
            'user_id' => $author->id,
            'text' => 'The tenth like',
        ]);
        $token = $voter->createToken('vote-reward')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/comments/{$target->id}/vote", ['type' => 'dislike'])
            ->assertOk();

        $this->assertSame(0, $voter->fresh()->points);

        $this->withToken($token)
            ->postJson("/api/comments/{$target->id}/vote", ['type' => 'like'])
            ->assertOk()
            ->assertJsonPath('viewer_vote', 'like');

        $this->assertSame(500, $voter->fresh()->points);
    }

    public function test_invalid_vote_types_are_rejected(): void
    {
        $author = User::factory()->create();
        $voter = User::factory()->create();
        $comment = Comment::create([
            'user_id' => $author->id,
            'text' => 'A comment with invalid vote input',
        ]);
        $token = $voter->createToken('vote-validation')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/comments/{$comment->id}/vote", ['type' => 'neutral'])
            ->assertUnprocessable();
    }
}
