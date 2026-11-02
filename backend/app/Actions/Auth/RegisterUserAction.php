<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Str;
use Psr\Log\LoggerInterface;

class RegisterUserAction
{
    public function __construct(
        private LoggerInterface $logger,
    ) {}

    /**
     * Create a new user.
     */
    public function __invoke(
        string $email,
        ?string $name = null,
        ?string $googleId = null,
        bool $emailVerified = false,
    ): User {
        $user = User::create([
            'email' => $email,
            'name' => $name ?: Str::before($email, '@'),
            'google_id' => $googleId,
        ]);

        if ($emailVerified) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $this->logger->info('New user registered', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return $user;
    }
}
