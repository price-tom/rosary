# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Rosary is a starter application that provides user sign-in. The monorepo contains:

- `backend/`: Laravel 13 API on Octane/FrankenPHP, with Postgres, Redis and a queue worker
- `frontend/`: SvelteKit (Svelte 5 runes) SPA, shipped as a PWA on Cloudflare
- `rosary-app/`: Helm chart for the API, worker, scheduler, Redis and CloudNativePG Postgres

## Commands

Development runs in Kubernetes through DevSpace, with Doppler for secrets and Tailscale for cluster access. Production is the `rosary` namespace, so check the active namespace before running anything against the cluster. `devspace dev` deploys the chart with `rosary-app/values-dev.yaml` and syncs `backend/` and `frontend/` into the pods. Backend commands run inside the pods:

```sh
devspace run test-laravel    # all backend tests
devspace enter --label-selector=app.kubernetes.io/component=web -- php artisan test --filter=AuthTest    # one test
devspace run test-pwa        # all frontend tests, in the pod
devspace run format          # Pint and Prettier
devspace run db-migrate
```

Frontend commands can also run locally from `frontend/`:

```sh
npm run test -- --run                      # all tests, once (plain `npm test` watches)
npm run test -- --run src/lib/core/api.test.ts    # one file
npm run check                              # svelte-check; CI runs this before the tests
npm run format
```

`devspace.yaml` also defines `deploy-api`, `deploy-pwa` and `restore-db-prod`, which act on production. Only run them when explicitly asked.

## Backend tests and the database

Tests must only ever run against the `testing` database, because `RefreshDatabase` wipes whatever database it connects to. `phpunit.xml` forces `DB_DATABASE=testing` using `<server>` entries, and `tests/TestCase.php` refuses to boot against any other database. Don't weaken either safeguard. The `rosary` database is the app's data.

## Backend architecture

- **HTTP:** API controllers in `app/Http/Controllers/Api` stay thin and delegate to `app/Actions` (single-purpose classes).
- **Auth:** the SPA uses a Sanctum session cookie with CSRF. Users sign in with an emailed code (`AuthCodeController`) or Google OAuth (`GoogleAuthController`). There are no passwords, and bearer tokens are deliberately ignored in `AppServiceProvider`. Only requests from `SANCTUM_STATEFUL_DOMAINS` get a session, so `/api/auth/verify-code` refuses any others.
- **Queues:** the worker runs `queue:work`, which keeps code in memory, as does Octane. DevSpace restarts or reloads them when synced files change.

## Frontend architecture

The app is a client-only SPA (`ssr = false`, `adapter-static`). App routes are under `src/routes/a/`, and those that need a signed-in user are in the `(bootstrap)` group, whose layout runs `app.initialize()` from `lib/core/app.svelte.ts` and redirects signed-out users to `/a/hello`. The signed-in user is in `app.state.user`.

- `lib/core/api.ts` is the API client. Route authenticated requests through `api` rather than bare `fetch`, because it handles cookies and CSRF.
- `lib/domain/users/sanctum-service.ts` handles sign-in, sign-out and fetching the current user.
- `src/service-worker.js` caches static assets and must never cache `/api/` responses.

Prettier settings: tabs, single quotes, no semicolons, no trailing commas, 100 columns.
