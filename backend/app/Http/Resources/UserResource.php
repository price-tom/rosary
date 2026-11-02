<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for User model.
 *
 * Transforms user data for API responses with conditional fields based on
 * whether the user is viewing their own profile. Includes HATEOAS links.
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request  The current HTTP request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->when($request->user() && $request->user()->id === $this->id, $this->email),

            // Only include when the user is viewing their own profile
            'email_verified_at' => $this->when($request->user() && $request->user()->id === $this->id,
                $this->email_verified_at),
            'created_at' => $this->when($request->user() && $request->user()->id === $this->id,
                $this->created_at),
            'updated_at' => $this->when($request->user() && $request->user()->id === $this->id,
                $this->updated_at),

            // Add links for HATEOAS
            'links' => [
                'self' => route('users.me'),
            ],
        ];
    }
}
