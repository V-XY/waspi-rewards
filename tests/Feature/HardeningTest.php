<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_pages_send_security_headers(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    public function test_content_security_policy_blocks_foreign_scripts(): void
    {
        $policy = $this->get('/')->headers->get('Content-Security-Policy');

        $this->assertStringContainsString("script-src 'self'", $policy);
        $this->assertStringContainsString("frame-ancestors 'none'", $policy);
    }

    public function test_users_endpoint_does_not_expose_email_addresses(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonPath('data.0.id', $user->id)
            ->assertJsonMissingPath('data.0.email');
    }

    public function test_expired_demo_tokens_are_removed_when_a_new_one_is_issued(): void
    {
        config([
            'waspi.demo_access_enabled' => true,
            'waspi.demo_user_email' => 'demo@waspi-rewards.test',
        ]);

        $demoUser = User::factory()->create(['email' => 'demo@waspi-rewards.test']);
        $expired = $demoUser->createToken('public-demo', ['*'], now()->subMinute());

        $this->postJson('/api/demo-token')
            ->assertOk()
            ->assertJsonPath('expires_in', 3600);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $expired->accessToken->id,
        ]);

        $this->assertSame(
            1,
            $demoUser->tokens()->where('name', 'public-demo')->count(),
        );
    }

    public function test_active_demo_tokens_are_kept_when_a_new_one_is_issued(): void
    {
        config([
            'waspi.demo_access_enabled' => true,
            'waspi.demo_user_email' => 'demo@waspi-rewards.test',
        ]);

        $demoUser = User::factory()->create(['email' => 'demo@waspi-rewards.test']);
        $active = $demoUser->createToken('public-demo', ['*'], now()->addMinutes(30));

        $this->postJson('/api/demo-token')->assertOk();

        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $active->accessToken->id,
        ]);
    }

    public function test_home_page_mounts_vue_into_the_app_element_once(): void
    {
        $html = $this->get('/')->getContent();

        $this->assertSame(1, substr_count($html, 'id="app"'));
    }
}