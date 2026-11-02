<?php

use App\Http\Controllers\GoogleAuthController;
use Illuminate\Support\Facades\Route;

// Google OAuth runs as top-level browser navigations so Socialite can keep
// its state in the session.
Route::middleware('throttle:20,1')->prefix('auth/google')->group(function () {
    Route::get('redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
});
