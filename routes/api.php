<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\DemoTokenController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AuthenticateWithAccessToken;
use Illuminate\Support\Facades\Route;

Route::post('/demo-token', DemoTokenController::class)
    ->middleware('throttle:5,1');

Route::get('/users', [UserController::class, 'index'])
    ->middleware(AuthenticateWithAccessToken::class);

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('/comments/{comment}/like', [LikeController::class, 'store']);
    Route::delete('/comments/{comment}/like', [LikeController::class, 'destroy']);
});