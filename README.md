# Rosary

A starter application with user sign-in and nothing else: a Laravel API and a SvelteKit SPA. Users sign in with Google or with a code sent to their email, using a Sanctum session cookie. Build your application on the signed-in page at `frontend/src/routes/a/(bootstrap)/home/`.

## Tech Stack

- **Backend**: Laravel 13 on Octane/FrankenPHP with PostgreSQL and Redis
- **Frontend**: SvelteKit (Svelte 5) SPA, installable as a PWA, with Tailwind CSS
- **Authentication**: Laravel Sanctum session cookies, Google OAuth through Socialite, and emailed sign-in codes
- **Infrastructure**: Kubernetes with Helm and DevSpace, Doppler for secrets, Cloudflare for the frontend
- **Monitoring**: Sentry

## Configuration

Create a Doppler project named `rosary-app`, or change `doppler.project` in `rosary-app/values.yaml`, with configs for each environment. The backend needs:

| Variable | Purpose |
|---|---|
| `APP_KEY`, `APP_URL` | Laravel application key and the API's URL |
| `FRONTEND_URL` | Where the SPA is served; used for CORS and sign-in redirects |
| `SANCTUM_STATEFUL_DOMAINS` | SPA host and port; requests from anywhere else can't sign in |
| `SESSION_DOMAIN` | Parent domain shared by the API and SPA, such as `.example.com` |
| `DB_CONNECTION`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Postgres connection |
| `REDIS_HOST`, `QUEUE_CONNECTION` | Redis connection and queue driver |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google OAuth; the redirect is `<APP_URL>/auth/google/callback` |
| `MAIL_FROM_ADDRESS`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_KEY` | Sender address and Cloudflare credentials for sign-in emails |
| `REALTIMEKIT_APP_ID`, `REALTIMEKIT_API_TOKEN`, `PRAYER_ROOM_MEETING_ID` | Cloudflare RealtimeKit app, an API token with the Realtime permission, and the shared prayer room's meeting |

The frontend needs `VITE_API_BASE_URL`, the API's URL, at build time.

`POST /api/auth/send-code` returns success even when the email can't be sent, and only logs the failure, so check the API logs if codes don't arrive. `devspace run auth-code` reads current codes from the database.

## Development

Development runs in Kubernetes through DevSpace, with files synced into the pods.

```bash
brew install devspace kubectl tailscale dopplerhq/cli/doppler
doppler login
devspace use context callandor
devspace dev                         # namespace `joseph`, Doppler config `dev_joseph`
```

The PWA is at `https://<namespace>.<tailnet>.ts.net` and the API at `https://<namespace>-api.<tailnet>.ts.net`. See `rosary-app/README.md` for cluster prerequisites.

To use a local [kind](https://kind.sigs.k8s.io/) cluster, which uses namespace `rosary-local` and Doppler config `dev_local`:

```bash
scripts/kind-setup.sh                # build the image and sync secrets
devspace use context kind
devspace dev
```

The PWA is at `http://localhost:5174` and the API at `http://localhost:8001`. After changing `dev_local`, run `scripts/kind-setup.sh secrets`.

## Task Commands

`devspace list commands` shows them all.

```bash
devspace run test-laravel   # backend tests, always against the `testing` database
devspace run test-pwa       # frontend tests
devspace run format         # Pint and Prettier
devspace run db-migrate
devspace run db-seed
```

## Deployment

Production runs in the `rosary` namespace. `devspace run deploy-api` and `devspace run deploy-pwa` deploy to production.

## Project Structure

```bash
├── backend/        # Laravel API
├── frontend/       # SvelteKit SPA
├── rosary-app/     # Helm chart
├── docker/         # Docker configuration
└── devspace.yaml   # Development environment and commands
```

## License

Proprietary - All rights reserved
