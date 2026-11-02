<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyCodeRequest extends FormRequest
{
    /**
     * Sign-in needs a session, which Sanctum only starts for SANCTUM_STATEFUL_DOMAINS.
     * Refusing here means a misconfigured origin can't use up a valid code.
     */
    public function authorize(): bool
    {
        return $this->hasSession();
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'code' => ['required', 'numeric', 'digits:6'],
        ];

    }
}
