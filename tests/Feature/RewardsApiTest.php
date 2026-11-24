<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RewardsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_comment_routes_reject_requests_without_authentication(): void
    {
        $comment = Comment::create(['user_id' => User::factory()->create()->id, 'text' => 'Test comment']);

        $this->getJson('/api/comments')->assertUnauthorized();
        $this->postJson('/api/comments', ['text' => 'A comment'])->assertUnauthorized();
        $this->deleteJson("/api/comments/{$comment->id}")->assertUnauthorized();
        $this->postJson("/api/comments/{$comment->id}/like")->assertUnauthorized();
        $this->deleteJson("/api/comments/{$comment->id}/like")->assertUnauthorized();
    }

    public function test_bearer_token_authenticates_comment_routes(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/comments')
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_comment_creation_validates_text_and_awards_the_first_comment_points(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/comments', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['text']);

        $this->withToken($token)
            ->postJson('/api/comments', ['text' => str_repeat('x', 1001)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['text']);

        $this->withToken($token)
            ->postJson('/api/comments', ['text' => 'A valid comment'])
            ->assertCreated()
            ->assertJsonPath('comment.text', 'A valid comment')
            ->assertJsonPath('comment.user_id', $user->id);

        $this->assertDatabaseHas('comments', [
            'user_id' => $user->id,
            'text' => 'A valid comment',
        ]);

        $this->assertSame(50, $user->fresh()->points);
    }

    public function test_tenth_like_awards_points_through_the_api_and_duplicate_likes_do_not(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $token = $user->createToken('api-test')->plainTextToken;
        $comments = collect(range(1, 10))->map(fn (int $number) => Comment::create([
            'user_id' => $owner->id,
            'text' => "Comment {$number}",
        ]));

        foreach ($comments as $comment) {
            $this->withToken($token)
                ->postJson("/api/comments/{$comment->id}/like")
                ->assertCreated();
        }

        $this->assertSame(500, $user->fresh()->points);
        $this->assertDatabaseCount('likes', 10);

        $this->withToken($token)
            ->postJson("/api/comments/{$comments->first()->id}/like")
            ->assertStatus(422);

        $this->assertDatabaseCount('likes', 10);
        $this->assertSame(500, $user->fresh()->points);
    }

    public function test_comment_owner_can_delete_comment_but_another_user_cannot(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $comment = Comment::create(['user_id' => $owner->id, 'text' => 'Owned comment']);

        $otherToken = $otherUser->createToken('other-user')->plainTextToken;

        $this->withToken($otherToken)
            ->deleteJson("/api/comments/{$comment->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('comments', ['id' => $comment->id]);

        $ownerToken = $owner->createToken('owner')->plainTextToken;

        $this->withToken($ownerToken)
            ->deleteJson("/api/comments/{$comment->id}")
            ->assertOk();

        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    }

    public function test_like_can_be_removed_without_changing_the_earned_reward(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $token = $user->createToken('api-test')->plainTextToken;
        $comments = collect(range(1, 10))->map(fn (int $number) => Comment::create([
            'user_id' => $owner->id,
            'text' => "Comment {$number}",
        ]));

        foreach ($comments as $comment) {
            $this->withToken($token)->postJson("/api/comments/{$comment->id}/like")->assertCreated();
        }

        $this->withToken($token)
            ->deleteJson("/api/comments/{$comments->first()->id}/like")
            ->assertOk();

        $this->assertDatabaseCount('likes', 9);
        $this->assertSame(500, $user->fresh()->points);
    }

    public function test_users_endpoint_accepts_a_bearer_token_and_does_not_expose_credentials(): void
    {
        $user = User::factory()->create(['points' => 3000]);
        $token = $user->createToken('api-test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonPath('data.0.id', $user->id)
            ->assertJsonPath('data.0.badge', 'top-fan')
            ->assertJsonPath('data.0.next_badge', 'super-fan')
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonMissingPath('data.0.remember_token');
    }

    public function test_expired_access_tokens_are_rejected_by_the_users_endpoint(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('expired-token', ['*'], now()->subMinute())->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/users')
            ->assertUnauthorized();
    }

    public function test_unknown_comment_returns_not_found_for_like_actions(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/comments/999999/like')
            ->assertNotFound();
    }
}
