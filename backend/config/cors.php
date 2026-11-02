<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     * Credentialed requests forbid a wildcard origin, so every origin must be
     * listed explicitly.
     */
    'allowed_origins' => array_values(array_unique(array_filter(array_map('trim', [
        env('FRONTEND_URL', 'http://localhost:3000'),
        ...explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
    ])))),

    // Any localhost port during local development.
    'allowed_origins_patterns' => env('APP_ENV') === 'local'
        ? ['#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#']
        : [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
