<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up'
    )
    ->withMiddleware(function (Middleware $middleware) {

        // Sanctum: requests from SANCTUM_STATEFUL_DOMAINS get session + CSRF
        // middleware (cookie auth); everything else falls through to bearer tokens.
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // Always return safe, terse JSON for API errors to avoid leaking stack traces
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                // Let Laravel handle ValidationExceptions (they return structured 422 JSON).
                // Checked before logging: these are expected user input errors, not failures.
                if ($e instanceof ValidationException) {
                    return null;
                }

                // Determine the status code
                $status = match (true) {
                    method_exists($e, 'getStatusCode') => $e->getStatusCode(),
                    $e instanceof ModelNotFoundException => 404,
                    $e instanceof AuthenticationException => 401,
                    $e instanceof AuthorizationException => 403,
                    default => 500,
                };

                // Log server errors internally so they're visible in laravel.log;
                // 4xx responses (unauthenticated, not found, ...) are expected traffic.
                if ($status >= 500) {
                    Log::error($e->getMessage(), [
                        'exception' => get_class($e),
                        'trace' => $e->getTraceAsString(),
                        'url' => $request->fullUrl(),
                    ]);
                }

                // Use standard HTTP status texts for terse, safe messages (e.g. 404 -> "Not Found")
                $message = Response::$statusTexts[$status] ?? 'Server Error';

                return response()->json([
                    'message' => $message,
                ], $status);
            }

            return null;
        });
    })
    ->create();
