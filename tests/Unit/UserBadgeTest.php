<?php

namespace Tests\Unit;

use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserBadgeTest extends TestCase
{
    public function test_badge_and_next_badge_thresholds_are_consistent(): void
    {
        $cases = [
            0 => [null, 'beginner-badge'],
            49 => [null, 'beginner-badge'],
            50 => ['beginner-badge', 'top-fan'],
            2499 => ['beginner-badge', 'top-fan'],
            2500 => ['top-fan', 'super-fan'],
            4999 => ['top-fan', 'super-fan'],
            5000 => ['super-fan', null],
        ];

        foreach ($cases as $points => [$badge, $nextBadge]) {
            $user = new User(['points' => $points]);

            $this->assertSame($badge, $user->badge, "Incorrect badge at {$points} points.");
            $this->assertSame($nextBadge, $user->next_badge, "Incorrect next badge at {$points} points.");
        }
    }
}
