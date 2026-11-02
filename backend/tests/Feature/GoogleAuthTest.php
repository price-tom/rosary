<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGoogleUser(string $email, bool $verified = true): void
    {
        $googleUser = (new SocialiteUser)
            ->setRaw(['email_verified' => $verified])
            ->map(['id' => 'google-123', 'name' => 'Google Reader', 'email' => $email]);

        $provider = Mockery::mock(GoogleProvider::class);
        $provider->shouldReceive('user')->andReturn($googleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    #[Test]
    public function the_callback_logs_in_an_existing_user_and_links_google(): void
    {
        $user = User::factory()->create(['email' => 'reader@example.com', 'google_id' => null]);
        $this->fakeGoogleUser('reader@example.com');

        $this->get('/auth/google/callback')->assertRedirect(config('app.frontend_url').'/a/home');

        $this->assertAuthenticatedAs($user, 'web');
        $this->assertSame('google-123', $user->fresh()->google_id);
    }

    #[Test]
    public function the_callback_creates_a_verified_user_when_none_exists(): void
    {
        $this->fakeGoogleUser('stranger@example.com');

        $this->get('/auth/google/callback')->assertRedirect(config('app.frontend_url').'/a/home');

        $user = User::where('email', 'stranger@example.com')->firstOrFail();
        $this->assertAuthenticatedAs($user, 'web');
        $this->assertSame('google-123', $user->google_id);
        $this->assertNotNull($user->email_verified_at);
    }

    #[Test]
    public function the_callback_does_not_link_by_unverified_email(): void
    {
        User::factory()->create(['email' => 'reader@example.com']);
        $this->fakeGoogleUser('reader@example.com', verified: false);

        $this->get('/auth/google/callback')
            ->assertRedirect(config('app.frontend_url').'/a/hello?error=no_account');

        $this->assertGuest('web');
    }
}
