<?php

namespace Tests;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Refuse to boot against anything but the `testing` database.
     *
     * This runs before traits like RefreshDatabase are set up, so it stops the
     * run before any migrate:fresh can wipe the app's database. phpunit.xml
     * forces DB_DATABASE=testing; this catches it being bypassed (e.g. a
     * cached config).
     */
    public function createApplication()
    {
        $app = parent::createApplication();

        $config = $app['config'];
        $database = $config->get('database.connections.'.$config->get('database.default').'.database');

        if ($database !== 'testing') {
            throw new \RuntimeException("Refusing to run tests against the '{$database}' database; expected 'testing'.");
        }

        return $app;
    }

    /**
     * Send requests the way the SPA does, from a stateful origin that gets a session.
     */
    protected function asSpa(): static
    {
        config(['sanctum.stateful' => ['spa.test']]);

        return $this->withHeaders(['Origin' => 'https://spa.test', 'Referer' => 'https://spa.test/a/hello'])
            ->withoutMiddleware(ValidateCsrfToken::class);
    }
}
