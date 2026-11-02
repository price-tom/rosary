<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function protected_routes_require_authentication(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
    }

    #[Test]
    public function a_signed_in_user_can_fetch_their_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->asSpa()
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email);
    }

    #[Test]
    public function bearer_tokens_are_ignored(): void
    {
        DB::enableQueryLog();

        $this->withToken('1|not-a-real-token')->getJson('/api/me')->assertUnauthorized();

        $this->assertEmpty(array_filter(
            DB::getQueryLog(),
            fn (array $query) => str_contains($query['query'], 'personal_access_tokens'),
        ));
    }

    #[Test]
    public function a_web_logout_ends_the_session(): void
    {
        $this->actingAs(User::factory()->create(), 'web');

        $this->asSpa()->postJson('/api/logout')->assertNoContent();

        $this->assertGuest('web');
    }
}
