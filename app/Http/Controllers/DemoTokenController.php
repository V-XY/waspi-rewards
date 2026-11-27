<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class DemoTokenController extends Controller
{
    public const TOKEN_NAME = 'public-demo';

    public const LIFETIME_MINUTES = 60;

    public function __invoke(): JsonResponse
    {
        abort_unless(config('waspi.demo_access_enabled'), 404);

        $user = User::where('email', config('waspi.demo_user_email'))->first();

        abort_unless($user, 503, 'Demo account is not configured.');

        // Each visit issues a new token. Removing the expired ones keeps the
        // token table from growing without limit.
        $user->tokens()
            ->where('name', self::TOKEN_NAME)
            ->where('expires_at', '<', now())
            ->delete();

        $token = $user->createToken(
            self::TOKEN_NAME,
            ['*'],
            now()->addMinutes(self::LIFETIME_MINUTES),
        );

        return response()->json([
            'token' => $token->plainTextToken,
            'expires_in' => self::LIFETIME_MINUTES * 60,
        ]);
    }
}