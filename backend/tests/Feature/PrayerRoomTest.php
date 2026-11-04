<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PrayerRoomTest extends TestCase
{
    use RefreshDatabase;

    private const PARTICIPANTS_URL = 'https://api.cloudflare.com/client/v4/accounts/acct/realtime/kit/app/meetings/meeting/participants';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.realtimekit' => [
            'account_id' => 'acct',
            'app_id' => 'app',
            'token' => 'rtk-api-token',
            'meeting_id' => 'meeting',
            'preset' => 'group_call_participant',
        ]]);

        Http::preventStrayRequests();
    }

    #[Test]
    public function guests_cannot_join(): void
    {
        $this->postJson('/api/prayer-room/join')->assertUnauthorized();
    }

    #[Test]
    public function a_signed_in_user_gets_a_participant_token(): void
    {
        Http::fake([self::PARTICIPANTS_URL => Http::response(['success' => true, 'data' => ['token' => 'participant-token']])]);
        $user = User::factory()->create(['name' => null, 'email' => 'mary@example.com']);

        $this->actingAs($user, 'web')
            ->asSpa()
            ->postJson('/api/prayer-room/join')
            ->assertOk()
            ->assertJsonPath('data.token', 'participant-token');

        Http::assertSent(fn (Request $request) => $request->url() === self::PARTICIPANTS_URL
            && $request->hasHeader('Authorization', 'Bearer rtk-api-token')
            && $request['name'] === 'mary'
            && $request['preset_name'] === 'group_call_participant'
            && $request['custom_participant_id'] === $user->id);
    }

    #[Test]
    public function rejoining_reuses_the_cached_token(): void
    {
        Http::fake([self::PARTICIPANTS_URL => Http::response(['success' => true, 'data' => ['token' => 'participant-token']])]);
        $user = User::factory()->create();

        $this->actingAs($user, 'web')->asSpa()->postJson('/api/prayer-room/join')->assertOk();
        $this->actingAs($user, 'web')->asSpa()->postJson('/api/prayer-room/join')
            ->assertOk()
            ->assertJsonPath('data.token', 'participant-token');

        Http::assertSentCount(1);
    }

    #[Test]
    public function a_realtimekit_error_is_not_cached(): void
    {
        Http::fakeSequence(self::PARTICIPANTS_URL)
            ->push(['success' => false], 500)
            ->push(['success' => true, 'data' => ['token' => 'participant-token']]);
        $user = User::factory()->create();

        $this->actingAs($user, 'web')->asSpa()->postJson('/api/prayer-room/join')->assertServerError();
        $this->actingAs($user, 'web')->asSpa()->postJson('/api/prayer-room/join')
            ->assertOk()
            ->assertJsonPath('data.token', 'participant-token');
    }
}
