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

        $maximumLengthText = str_repeat('x', 1000);

        $this->withToken($token)
            ->postJson('/api/comments', ['text' => $maximumLengthText])
            ->assertCreated()
            ->assertJsonPath('comment.text', $maximumLengthText)
            ->assertJsonPath('comment.user_id', $user->id);

        $this->assertDatabaseHas('comments', [
            'user_id' => $user->id,
            'text' => $maximumLengthText,
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

    public function test_another_user_cannot_delete_a_comment(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $comment = Comment::create(['user_id' => $owner->id, 'text' => 'Owned comment']);
        $token = $otherUser->createToken('other-user')->plainTextToken;

        $this->withToken($token)
            ->deleteJson("/api/comments/{$comment->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('comments', ['id' => $comment->id]);
    }

    public function test_comment_owner_can_delete_their_comment(): void
    {
        $owner = User::factory()->create();
        $comment = Comment::create(['user_id' => $owner->id, 'text' => 'Owned comment']);
        $token = $owner->createToken('owner')->plainTextToken;

        $this->withToken($token)
            ->deleteJson("/api/comments/{$comment->id}")
            ->assertOk();

        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    }

    public function test_unliking_removes_the_like_record(): void
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
    }

    public function test_unliking_and_reliking_does_not_award_the_tenth_like_reward_twice(): void
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

        $this->withToken($token)
            ->deleteJson("/api/comments/{$comments->first()->id}/like")
            ->assertOk();

        $this->withToken($token)
            ->postJson("/api/comments/{$comments->first()->id}/like")
            ->assertCreated();

        $this->assertSame(500, $user->fresh()->points);
        $this->assertDatabaseCount('reward_grants', 1);
    }

    public function test_comments_feed_includes_author_like_count_and_viewer_like_state(): void
    {
        $author = User::factory()->create();
        $viewer = User::factory()->create();
        $comment = Comment::create([
            'user_id' => $author->id,
            'text' => 'A comment with a like',
        ]);

        $comment->likes()->create(['user_id' => $viewer->id]);
        $token = $viewer->createToken('feed-viewer')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/comments')
            ->assertOk()
            ->assertJsonPath('data.0.id', $comment->id)
            ->assertJsonPath('data.0.user.id', $author->id)
            ->assertJsonPath('data.0.likes_count', 1)
            ->assertJsonPath('data.0.liked_by_user', true);
    }

    public function test_query_string_tokens_are_not_accepted(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('query-token')->plainTextToken;

        $this->getJson('/api/users?access_token='.$token)
            ->assertUnauthorized();
    }

    public function test_seeder_creates_the_dedicated_demo_account(): void
    {
        $this->seed(\Database\Seeders\UserSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => config('waspi.demo_user_email'),
            'name' => 'Demo User',
        ]);

        $demoUser = User::where('email', config('waspi.demo_user_email'))->firstOrFail();

        $this->assertNotSame('password', $demoUser->password);
        $this->assertDatabaseHas('comments', [
            'user_id' => User::where('email', 'maxime@example.com')->value('id'),
            'timestamp_source' => 'seeded',
        ]);
    }

    public function test_demo_token_endpoint_is_disabled_by_default(): void
    {
        config(['waspi.demo_access_enabled' => false]);

        $this->postJson('/api/demo-token')->assertNotFound();
        $this->getJson('/api/token')->assertNotFound();
    }

    public function test_demo_token_endpoint_requires_the_configured_demo_account(): void
    {
        config([
            'waspi.demo_access_enabled' => true,
            'waspi.demo_user_email' => 'demo@waspi-rewards.test',
        ]);

        $this->postJson('/api/demo-token')->assertStatus(503);
    }

    public function test_demo_token_endpoint_is_rate_limited(): void
    {
        config([
            'waspi.demo_access_enabled' => true,
            'waspi.demo_user_email' => 'demo@waspi-rewards.test',
        ]);

        User::factory()->create(['email' => 'demo@waspi-rewards.test']);

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/demo-token')->assertOk();
        }

        $this->postJson('/api/demo-token')->assertStatus(429);
    }

    public function test_demo_token_is_issued_only_for_the_configured_demo_account(): void
    {
        config([
            'waspi.demo_access_enabled' => true,
            'waspi.demo_user_email' => 'demo@waspi-rewards.test',
        ]);

        $ordinaryUser = User::factory()->create();
        $demoUser = User::factory()->create(['email' => 'demo@waspi-rewards.test']);

        $response = $this->postJson('/api/demo-token')->assertOk();
        $this->assertSame(3600, $response->json('expires_in'));

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $demoUser->id,
            'name' => 'public-demo',
        ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $ordinaryUser->id,
            'name' => 'public-demo',
        ]);

        $this->withToken($response->json('token'))
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonPath('meta.authenticated_user_id', $demoUser->id);
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
            ->assertJsonPath('meta.authenticated_user_id', $user->id)
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

    public function test_tokens_older_than_the_configured_sanctum_lifetime_are_rejected(): void
    {
        config(['sanctum.expiration' => 60]);

        $user = User::factory()->create();
        $createdToken = $user->createToken('stale-token');
        $createdToken->accessToken->forceFill([
            'created_at' => now()->subHours(2),
        ])->save();

        $this->withToken($createdToken->plainTextToken)
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
