<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithAccessToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $accessToken = PersonalAccessToken::findToken($token);

        if (
            !$accessToken
            || !$accessToken->tokenable
            || ($accessToken->expires_at && $accessToken->expires_at->isPast())
            || (
                config('sanctum.expiration')
                && $accessToken->created_at->lte(now()->subMinutes(config('sanctum.expiration')))
            )
        ) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->setUserResolver(fn () => $accessToken->tokenable);

        return $next($request);
    }
}
