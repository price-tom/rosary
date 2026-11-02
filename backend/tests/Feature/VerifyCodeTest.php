<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class VerifyCodeTest extends TestCase
{
    use RefreshDatabase;

    private function storeCode(string $email, string $code, ?Carbon $expiry = null): void
    {
        DB::table('auth_codes')->insert([
            'email' => $email,
            'code' => $code,
            'expiry' => $expiry ?? Carbon::now()->addMinutes(5),
        ]);
    }

    private function verify(string $email, string $code)
    {
        return $this->asSpa()->postJson('/api/auth/verify-code', [
            'email' => $email,
            'code' => $code,
        ]);
    }

    #[Test]
    public function a_valid_code_registers_a_new_user_once(): void
    {
        $this->storeCode('new@example.com', '123456');

        $this->verify('new@example.com', '123456')
            ->assertOk()
            ->assertJsonPath('user.email', 'new@example.com')
            ->assertJsonMissingPath('token');

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
        $this->assertAuthenticated('web');

        $this->verify('new@example.com', '123456')->assertStatus(422);
    }

    #[Test]
    public function a_valid_code_logs_in_an_existing_user(): void
    {
        $user = User::factory()->create();
        $this->storeCode($user->email, '654321');

        $this->verify($user->email, '654321')->assertOk()->assertJsonPath('user.id', $user->id);

        $this->assertDatabaseCount('users', 1);
    }

    #[Test]
    public function a_wrong_code_is_rejected(): void
    {
        $this->storeCode('wrong@example.com', '111111');

        $this->verify('wrong@example.com', '222222')->assertStatus(422);

        $this->assertDatabaseMissing('users', ['email' => 'wrong@example.com']);
    }

    #[Test]
    public function an_expired_code_is_rejected(): void
    {
        $this->storeCode('late@example.com', '333333', Carbon::now()->subMinute());

        $this->verify('late@example.com', '333333')->assertStatus(422);

        $this->assertDatabaseMissing('users', ['email' => 'late@example.com']);
    }

    #[Test]
    public function an_origin_without_a_session_is_refused_without_using_the_code(): void
    {
        $this->storeCode('elsewhere@example.com', '444444');

        $this->postJson('/api/auth/verify-code', [
            'email' => 'elsewhere@example.com',
            'code' => '444444',
        ])->assertForbidden();

        $this->assertDatabaseHas('auth_codes', ['email' => 'elsewhere@example.com']);
    }

    #[Test]
    public function repeated_guesses_are_throttled(): void
    {
        foreach (range(1, 5) as $attempt) {
            $this->verify('guess@example.com', '000000')->assertStatus(422);
        }

        $this->verify('guess@example.com', '000000')->assertTooManyRequests();
    }
}
