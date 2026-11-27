<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Like;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\Cursor;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class CommentRankingTest extends TestCase
{
    use RefreshDatabase;

    public function test_best_sort_uses_vote_confidence_and_keeps_dislike_totals_private(): void
    {
        $author = User::factory()->create();
        $voters = User::factory()->count(10)->create();

        $popular = Comment::create(['user_id' => $author->id, 'text' => 'Consistently supported']);
        $moderate = Comment::create(['user_id' => $author->id, 'text' => 'Some support']);
        $contested = Comment::create(['user_id' => $author->id, 'text' => 'Contested']);

        $popular->forceFill(['created_at' => now()->subDays(30), 'updated_at' => now()->subDays(30)])->save();
        $moderate->forceFill(['created_at' => now()->subDay(), 'updated_at' => now()->subDay()])->save();
        $contested->forceFill(['created_at' => now()->subHour(), 'updated_at' => now()->subHour()])->save();

        foreach ($voters as $voter) {
            Like::create([
                'user_id' => $voter->id,
                'comment_id' => $popular->id,
                'vote_type' => 'like',
            ]);
        }

        Like::create([
            'user_id' => $voters[0]->id,
            'comment_id' => $moderate->id,
            'vote_type' => 'like',
        ]);

        Like::create([
            'user_id' => $voters[0]->id,
            'comment_id' => $contested->id,
            'vote_type' => 'like',
        ]);

        foreach ([1, 2, 3] as $index) {
            Like::create([
                'user_id' => $voters[$index]->id,
                'comment_id' => $contested->id,
                'vote_type' => 'dislike',
            ]);
        }

        $viewer = User::factory()->create();
        $token = $viewer->createToken('best-sort')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/comments?sort=best')
            ->assertOk()
            ->assertJsonMissingPath('data.0.dislikes_count')
            ->assertJsonMissingPath('data.0.best_score');

        $this->assertSame(
            [$popular->id, $moderate->id, $contested->id],
            collect($response->json('data'))->pluck('id')->all()
        );
    }

    public function test_newest_and_oldest_sort_by_original_creation_time(): void
    {
        $author = User::factory()->create();
        $older = Comment::create(['user_id' => $author->id, 'text' => 'Older comment']);
        $newer = Comment::create(['user_id' => $author->id, 'text' => 'Newer comment']);

        $older->forceFill(['created_at' => now()->subDays(3), 'updated_at' => now()->subDays(3)])->save();
        $newer->forceFill(['created_at' => now()->subDay(), 'updated_at' => now()->subDay()])->save();

        $viewer = User::factory()->create();
        $token = $viewer->createToken('chronological-sort')->plainTextToken;

        $newest = $this->withToken($token)
            ->getJson('/api/comments?sort=newest')
            ->assertOk();

        $oldest = $this->withToken($token)
            ->getJson('/api/comments?sort=oldest')
            ->assertOk();

        $this->assertSame([$newer->id, $older->id], collect($newest->json('data'))->pluck('id')->all());
        $this->assertSame([$older->id, $newer->id], collect($oldest->json('data'))->pluck('id')->all());
    }

    public function test_cursor_is_encrypted_and_invalid_cursors_are_rejected(): void
    {
        [$token] = $this->actingUserWithComments(2);

        $response = $this->withToken($token)
            ->getJson('/api/comments?per_page=1')
            ->assertOk();

        $cursor = $response->json('next_cursor');

        $this->assertIsString($cursor);
        $this->assertStringNotContainsString('best_score', $cursor);
        $this->assertNotNull(Cursor::fromEncoded(Crypt::decryptString($cursor)));

        $this->withToken($token)
            ->getJson('/api/comments?per_page=1&cursor=not-a-valid-cursor')
            ->assertUnprocessable();
    }

    public function test_unknown_sort_modes_are_rejected(): void
    {
        $viewer = User::factory()->create();
        $token = $viewer->createToken('invalid-sort')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/comments?sort=controversial')
            ->assertUnprocessable();
    }

    public function test_freshness_is_a_small_tie_breaking_boost_not_a_replacement_for_vote_confidence(): void
    {
        $author = User::factory()->create();
        $voter = User::factory()->create();

        $older = Comment::create(['user_id' => $author->id, 'text' => 'Older supported comment']);
        $newer = Comment::create(['user_id' => $author->id, 'text' => 'Newer supported comment']);

        $older->forceFill(['created_at' => now()->subDays(14), 'updated_at' => now()->subDays(14)])->save();
        $newer->forceFill(['created_at' => now()->subDay(), 'updated_at' => now()->subDay()])->save();

        foreach ([$older, $newer] as $comment) {
            Like::create([
                'user_id' => $voter->id,
                'comment_id' => $comment->id,
                'vote_type' => 'like',
            ]);
        }

        $viewer = User::factory()->create();
        $token = $viewer->createToken('freshness-sort')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/comments?sort=best')
            ->assertOk();

        $this->assertSame([$newer->id, $older->id], collect($response->json('data'))->pluck('id')->all());
    }
}
