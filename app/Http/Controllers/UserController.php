<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::withCount(['comments', 'likes']);

        if ($request->filled('points')) {
            $query->where('points', (int) $request->input('points'));
        }

        $users = $query->get();

        $type = $request->input('type', $request->input('badge'));

        if ($type) {
            $users = $users->filter(fn (User $user) => $user->badge === $type)->values();
        }

        $result = $users->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'points' => $user->points,
            'badge' => $user->badge,
            'next_badge' => $user->next_badge,
            'comments_count' => $user->comments_count,
            'likes_count' => $user->likes_count,
        ]);

        return response()->json([
            'data' => $result,
            'meta' => [
                'total' => $result->count(),
                'filters' => array_filter([
                    'type' => $type,
                    'points' => $request->input('points'),
                ], fn ($value) => $value !== null),
            ],
        ]);
    }
}