<?php

namespace App\Actions\PrayerRoom;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Returns a RealtimeKit participant token that lets the user join the shared
 * prayer room. Each user is added to the meeting once; the token is cached
 * because participant tokens stay valid for 100 days.
 */
class JoinPrayerRoomAction
{
    private const TOKEN_TTL_DAYS = 90;

    public function __invoke(User $user): string
    {
        $config = config('services.realtimekit');

        foreach (['account_id', 'app_id', 'token', 'meeting_id'] as $key) {
            if (empty($config[$key])) {
                throw new RuntimeException("RealtimeKit is not configured: services.realtimekit.{$key} is missing.");
            }
        }

        return Cache::remember(
            "prayer-room-token:{$config['meeting_id']}:{$user->id}",
            now()->addDays(self::TOKEN_TTL_DAYS),
            fn () => $this->addParticipant($user, $config),
        );
    }

    private function addParticipant(User $user, array $config): string
    {
        $url = sprintf(
            'https://api.cloudflare.com/client/v4/accounts/%s/realtime/kit/%s/meetings/%s/participants',
            $config['account_id'],
            $config['app_id'],
            $config['meeting_id'],
        );

        $response = Http::withToken($config['token'])
            ->acceptJson()
            ->post($url, [
                'name' => $user->name ?: Str::before($user->email, '@'),
                'preset_name' => $config['preset'],
                'custom_participant_id' => $user->id,
            ])
            ->throw();

        $token = $response->json('data.token');

        if (! is_string($token) || $token === '') {
            throw new RuntimeException('RealtimeKit did not return a participant token.');
        }

        return $token;
    }
}
