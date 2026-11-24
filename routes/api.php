<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AuthenticateWithAccessToken;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::post('/demo-token', function () {
    abort_unless(config('waspi.demo_access_enabled'), 404);

    $user = User::where('email', config('waspi.demo_user_email'))->first();

    abort_unless($user, 503, 'Demo account is not configured.');

    return response()->json([
        'token' => $user->createToken('public-demo', ['*'], now()->addHour())->plainTextToken,
        'expires_in' => 3600,
    ]);
})->middleware('throttle:5,1');

Route::get('/users', [UserController::class, 'index'])
    ->middleware(AuthenticateWithAccessToken::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('/comments/{comment}/like', [LikeController::class, 'store']);
    Route::delete('/comments/{comment}/like', [LikeController::class, 'destroy']);
});
