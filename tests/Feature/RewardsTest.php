<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Like;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RewardsTest extends TestCase
{
    use RefreshDatabase;

    public function test_first_comment_awards_50_points_and_beginner_badge(): void
    {
        $user = User::factory()->create();
        $comment = Comment::create(['user_id' => $user->id, 'text' => 'Test comment']);

        app(RewardService::class)->handleNewComment($comment);
        $user->refresh();

        $this->assertSame(50, $user->points);
        $this->assertSame('beginner-badge', $user->badge);
        $this->assertSame('top-fan', $user->next_badge);
    }

    public function test_thirtieth_comment_brings_comment_points_to_2500(): void
    {
        $user = User::factory()->create();
        $service = app(RewardService::class);

        for ($i = 0; $i < 30; $i++) {
            $comment = Comment::create(['user_id' => $user->id, 'text' => 'Test comment']);
            $service->handleNewComment($comment);
        }

        $user->refresh();

        $this->assertSame(2500, $user->points);
        $this->assertSame('top-fan', $user->badge);
        $this->assertSame('super-fan', $user->next_badge);
    }

    public function test_fiftieth_comment_brings_comment_points_to_5000(): void
    {
        $user = User::factory()->create();
        $service = app(RewardService::class);

        for ($i = 0; $i < 50; $i++) {
            $comment = Comment::create(['user_id' => $user->id, 'text' => 'Test comment']);
            $service->handleNewComment($comment);
        }

        $user->refresh();

        $this->assertSame(5000, $user->points);
        $this->assertSame('super-fan', $user->badge);
        $this->assertNull($user->next_badge);
    }

    public function test_tenth_like_awards_500_points(): void
    {
        $user = User::factory()->create();
        $commentOwner = User::factory()->create();
        $service = app(RewardService::class);

        $comments = collect(range(1, 10))->map(fn () => Comment::create([
            'user_id' => $commentOwner->id,
            'text' => 'Test comment',
        ]));

        foreach ($comments as $comment) {
            $like = Like::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
            ]);
            $service->handleNewLike($like);
        }

        $user->refresh();

        $this->assertSame(500, $user->points);
        $this->assertSame('beginner-badge', $user->badge);
    }

    public function test_3000_points_is_top_fan_and_next_badge_is_super_fan(): void
    {
        $user = User::factory()->create(['points' => 3000]);

        $this->assertSame('top-fan', $user->badge);
        $this->assertSame('super-fan', $user->next_badge);
    }

    public function test_users_endpoint_requires_access_token(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
        $this->getJson('/api/users?access_token=wrong-token')->assertUnauthorized();
    }

    public function test_users_endpoint_accepts_access_token_and_filters_by_type_and_points(): void
    {
        $topFan = User::factory()->create(['points' => 3000]);
        User::factory()->create(['points' => 50]);
        $token = $topFan->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/users?type=top-fan')
            ->assertOk()
            ->assertJsonPath('data.0.id', $topFan->id)
            ->assertJsonPath('data.0.next_badge', 'super-fan');

        $this->withToken($token)
            ->getJson('/api/users?points=3000')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.points', 3000);
    }

    public function test_user_can_create_delete_and_toggle_a_like_on_a_comment(): void
    {
        $user = User::factory()->create();
        $comment = Comment::create(['user_id' => $user->id, 'text' => 'Test comment']);
        Sanctum::actingAs($user);

        $this->postJson('/api/comments', ['text' => 'A new comment'])
            ->assertCreated();

        $this->postJson('/api/comments/'.$comment->id.'/like')
            ->assertCreated();

        $this->postJson('/api/comments/'.$comment->id.'/like')
            ->assertStatus(422);

        $this->deleteJson('/api/comments/'.$comment->id.'/like')
            ->assertOk();

        $this->deleteJson('/api/comments/'.$comment->id)
            ->assertOk();
    }

    public function test_non_owner_cannot_delete_comment(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $comment = Comment::create(['user_id' => $owner->id, 'text' => 'Owner comment']);
        Sanctum::actingAs($other);

        $this->deleteJson('/api/comments/'.$comment->id)
            ->assertForbidden();
    }

    public function test_unliking_a_comment_not_liked_returns_404(): void
    {
        $user = User::factory()->create();
        $comment = Comment::create(['user_id' => $user->id, 'text' => 'Test']);
        Sanctum::actingAs($user);

        $this->deleteJson('/api/comments/'.$comment->id.'/like')
            ->assertNotFound();
    }

    public function test_comments_endpoint_returns_data(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        foreach (['First comment', 'Another comment', 'One more comment'] as $text) {
            Comment::create(['user_id' => $user->id, 'text' => $text]);
        }

        $this->getJson('/api/comments')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
