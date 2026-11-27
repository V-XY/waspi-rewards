<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CommentFeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_feed_returns_the_default_page_size(): void
    {
        [$token] = $this->actingUserWithComments(25);

        $this->withToken($token)
            ->getJson('/api/comments')
            ->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('next_cursor', fn ($cursor) => $cursor !== null);
    }

    public function test_feed_pages_through_every_comment_without_repeats(): void
    {
        [$token] = $this->actingUserWithComments(25);

        $first = $this->withToken($token)->getJson('/api/comments?per_page=10')->assertOk();
        $second = $this->withToken($token)
            ->getJson('/api/comments?per_page=10&cursor='.urlencode($first->json('next_cursor')))
            ->assertOk();
        $third = $this->withToken($token)
            ->getJson('/api/comments?per_page=10&cursor='.urlencode($second->json('next_cursor')))
            ->assertOk();

        $this->assertCount(10, $first->json('data'));
        $this->assertCount(10, $second->json('data'));
        $this->assertCount(5, $third->json('data'));
        $this->assertNull($third->json('next_cursor'));

        $ids = collect([...$first->json('data'), ...$second->json('data'), ...$third->json('data')])
            ->pluck('id');

        $this->assertSame(25, $ids->unique()->count());
    }

    public function test_page_size_outside_the_allowed_range_is_rejected(): void
    {
        [$token] = $this->actingUserWithComments(1);

        $this->withToken($token)->getJson('/api/comments?per_page=0')->assertUnprocessable();
        $this->withToken($token)->getJson('/api/comments?per_page=51')->assertUnprocessable();
    }

    public function test_feed_query_count_does_not_grow_with_the_number_of_comments(): void
    {
        [$token, $author] = $this->actingUserWithComments(3);

        // The first request in a test resolves the authenticated user, which
        // adds queries that later requests do not repeat. Warm up before measuring.
        $this->withToken($token)->getJson('/api/comments')->assertOk();

        $small = $this->queryCountFor(fn () => $this->withToken($token)->getJson('/api/comments'));

        foreach (range(1, 17) as $number) {
            Comment::create(['user_id' => $author->id, 'text' => "Extra {$number}"]);
        }

        $large = $this->queryCountFor(fn () => $this->withToken($token)->getJson('/api/comments'));

        $this->assertSame($small, $large);
    }

    public function test_a_failed_reward_rolls_back_the_comment(): void
    {
        $this->mock(RewardService::class, function ($mock) {
            $mock->shouldReceive('handleNewComment')->andThrow(new \RuntimeException('Reward failure'));
        });

        $user = User::factory()->create();
        $token = $user->createToken('rollback')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/comments', ['text' => 'This comment must not persist'])
            ->assertStatus(500);

        $this->assertDatabaseMissing('comments', ['text' => 'This comment must not persist']);
    }

    public function test_created_comment_reports_zero_likes_and_no_viewer_like(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('create-shape')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/comments', ['text' => 'Shape check'])
            ->assertCreated()
            ->assertJsonPath('comment.likes_count', 0)
            ->assertJsonPath('comment.liked_by_user', false)
            ->assertJsonPath('comment.user.name', $user->name);
    }

    /**
     * @return array{0: string, 1: User}
     */
    private function actingUserWithComments(int $count): array
    {
        $viewer = User::factory()->create();
        $author = User::factory()->create();

        foreach (range(1, $count) as $number) {
            Comment::create(['user_id' => $author->id, 'text' => "Comment {$number}"]);
        }

        return [$viewer->createToken('feed')->plainTextToken, $author];
    }

    private function queryCountFor(callable $request): int
    {
        DB::flushQueryLog();
        DB::enableQueryLog();

        $request();

        $count = count(DB::getQueryLog());
        DB::disableQueryLog();

        return $count;
    }
}