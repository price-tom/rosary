<?php

namespace Tests\Unit;

use App\Actions\Auth\SendCodeAction;
use App\Mail\AuthCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SendCodeActionTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_replaces_any_previous_code_and_mails_a_new_one(): void
    {
        Mail::fake();
        $action = app(SendCodeAction::class);

        $action('reader@example.com');
        $action('reader@example.com');

        $codes = DB::table('auth_codes')->where('email', 'reader@example.com')->pluck('code');
        $this->assertCount(1, $codes);
        $this->assertMatchesRegularExpression('/^\d{6}$/', $codes[0]);
        Mail::assertSent(AuthCode::class, 2);
    }
}
