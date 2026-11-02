<?php

use App\Http\Controllers\Api\AuthCodeController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Authentication: the SPA signs in with a session cookie
Route::middleware('throttle:login')->group(function () {
    Route::post('auth/verify-code', [AuthCodeController::class, 'verify']);
});

Route::middleware('throttle:send-code')->group(function () {
    Route::post('auth/send-code', [AuthCodeController::class, 'send']);
});

// Authenticated routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('me', [AuthController::class, 'me'])->name('users.me');
    Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
});
