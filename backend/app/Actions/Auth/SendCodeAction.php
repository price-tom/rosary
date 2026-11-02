<?php

namespace App\Actions\Auth;

use App\Mail\AuthCode;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendCodeAction
{
    public function __invoke(string $email): void
    {
        try {
            DB::table('auth_codes')
                ->where('email', $email)
                ->delete();

            $code = $this->generateSecureCode();
            DB::table('auth_codes')->insert(values: [
                'email' => $email,
                'code' => $code,
                'expiry' => Carbon::now()->add(5, 'minute'),
            ]);

            Mail::to($email)->send(new AuthCode($code));
        } catch (Exception $e) {
            Log::error("Unable to send auth code {$e->getMessage()}", ['data' => $e]);
        }
    }

    private function generateSecureCode(): string
    {
        $code = random_int(0, 999999);

        return sprintf('%06d', $code);
    }
}
