<?php

namespace App\Http\Controllers\Api;

use App\Actions\Auth\SendCodeAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\SendCodeRequest;
use App\Http\Requests\VerifyCodeRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;

class AuthCodeController extends Controller
{
    public function send(SendCodeRequest $request, SendCodeAction $action)
    {
        RateLimiter::attempt(
            'send-message:'.$request->email,
            $perMinute = 1,
            function () use ($action, $request) {
                $action($request->email);
            }
        );

    }

    public function verify(VerifyCodeRequest $request)
    {
        $email = $request->email;
        $code = $request->code;

        // Check and consume in one transaction. The row lock stops two
        // simultaneous requests from both using the same code.
        $matched = DB::transaction(function () use ($email, $code) {
            $valid = DB::table('auth_codes')
                ->where('email', $email)
                ->where('code', $code)
                ->where('expiry', '>', now())
                ->lockForUpdate()
                ->exists();

            // Codes are single-use: remove them whether or not they matched.
            DB::table('auth_codes')->where('email', $email)->delete();

            return $valid;
        });

        if (! $matched) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
        }

        // Register the user on first sign-in.
        $user = User::firstOrCreate(['email' => $email]);

        Auth::guard('web')->login($user, remember: true);
        $request->session()->regenerate();

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }
}
