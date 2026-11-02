<?php

namespace App\Http\Controllers;

use App\Actions\Auth\RegisterUserAction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;
use Throwable;

/**
 * Google sign-in for the web SPA:
 *
 * browser -> /auth/google/redirect -> Google -> /auth/google/callback
 * -> session login -> FRONTEND_URL/a/home
 */
class GoogleAuthController extends Controller
{
    public function redirect(Request $request): SymfonyRedirect
    {
        return Socialite::driver('google')
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function callback(
        Request $request,
        RegisterUserAction $registerUser,
    ): RedirectResponse {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            Log::error('Google OAuth callback failed', ['error' => $e]);

            return $this->failureRedirect('google_failed');
        }

        $user = $this->resolveUser($googleUser, $registerUser);

        if (! $user) {
            // Could not resolve or create a user (e.g. unverified Google email).
            return $this->failureRedirect('no_account');
        }

        Auth::guard('web')->login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->away($this->frontendUrl('/a/home'));
    }

    /**
     * Match by google_id, then by verified email (linking the account).
     * Creates a new user when a verified Google sign-in has no existing account.
     */
    private function resolveUser(
        SocialiteUser $googleUser,
        RegisterUserAction $registerUser,
    ): ?User {
        $emailVerified = (bool) ($googleUser->getRaw()['email_verified'] ?? false);

        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user && $emailVerified && $googleUser->getEmail()) {
            $user = User::where('email', $googleUser->getEmail())->first();
        }

        if ($user) {
            $user->google_id = $googleUser->getId();
            $user->name = $user->name ?: (string) $googleUser->getName();
            $user->email_verified_at ??= $emailVerified ? now() : null;
            $user->save();

            return $user;
        }

        if (! $emailVerified || ! $googleUser->getEmail()) {
            return null;
        }

        return DB::transaction(function () use ($googleUser, $registerUser) {

            return $registerUser(
                email: $googleUser->getEmail(),
                name: $googleUser->getName(),
                googleId: $googleUser->getId(),
                emailVerified: true,
            );
        });
    }

    private function failureRedirect(string $error): RedirectResponse
    {
        return redirect()->away($this->frontendUrl('/a/hello?'.http_build_query(['error' => $error])));
    }

    private function frontendUrl(string $path): string
    {
        return rtrim(config('app.frontend_url'), '/').$path;
    }
}
