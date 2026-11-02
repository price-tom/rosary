<?php

namespace Tests\Unit;

use App\Actions\Auth\RegisterUserAction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterUserActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_unverified_user_by_default(): void
    {
        $user = app(RegisterUserAction::class)(email: 'test@example.com', name: 'Test User');

        $this->assertInstanceOf(User::class, $user);
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
        ]);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_it_defaults_the_name_to_the_email_local_part(): void
    {
        $user = app(RegisterUserAction::class)(email: 'reader@example.com');

        $this->assertSame('reader', $user->name);
    }

    public function test_it_creates_a_verified_oauth_user(): void
    {
        $user = app(RegisterUserAction::class)(
            email: 'google@example.com',
            name: 'Google User',
            googleId: 'google-123',
            emailVerified: true,
        );

        $user->refresh();

        $this->assertSame('google-123', $user->google_id);
        $this->assertNotNull($user->email_verified_at);
    }
}
