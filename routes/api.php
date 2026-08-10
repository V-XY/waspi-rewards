<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AuthenticateWithAccessToken;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/token', function () {
    $user = User::first();

    if (!$user) {
        return response()->json(['error' => 'No users found. Run seeder.'], 404);
    }

    return response()->json([
        'token' => $user->createToken('web')->plainTextToken,
    ]);
});

Route::get('/users', [UserController::class, 'index'])
    ->middleware(AuthenticateWithAccessToken::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('/comments/{comment}/like', [LikeController::class, 'store']);
    Route::delete('/comments/{comment}/like', [LikeController::class, 'destroy']);
});