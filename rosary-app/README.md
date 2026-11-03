# rosary-app Helm chart

Installs the Rosary backend: Laravel API (Octane), Redis and a CloudNativePG Postgres cluster. Secrets come from Doppler via the Doppler operator.

Production is installed with `helm`; development environments are installed by `devspace dev`, which uses this chart with `values-dev.yaml`.

## Cluster prerequisites

Installed once per cluster:

- CloudNativePG operator
- Doppler operator, plus its token in `doppler-operator-system`:
  ```sh
  kubectl create secret generic doppler-token-secret \
    --from-literal=serviceToken=<doppler-service-token> \
    -n doppler-operator-system
  ```
- Traefik with the `traefik-gateway` Gateway (production HTTPRoute)
- Tailscale operator with HTTPS enabled for the tailnet (dev environments)

Per namespace, a pull secret for the private GHCR images (token needs `read:packages`):

```sh
kubectl create secret docker-registry ghcr-login-secret \
  --docker-server=https://ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<github-personal-access-token> \
  -n <namespace>
```

Doppler must provide `DB_USERNAME` and `DB_PASSWORD` for `db-secret`, along with the application variables listed in the root `README.md`.

## Production

```sh
kubectl create namespace rosary
devspace run deploy-api
```

which runs:

```sh
doppler run --config prd -- sh -c 'helm upgrade --install rosary-app ./rosary-app \
  --namespace rosary --set doppler.config=prd --set "httpRoute.hostnames[0]=$APP_NAME"'
```

The database starts empty. Run migrations with `php artisan migrate --force` in the web pod.

## Development

```sh
devspace dev                          # namespace joseph, Doppler config dev_joseph
```

This deploys the chart with `values-dev.yaml`, which:

- syncs `./backend` and `./frontend` into the pods
- starts with an empty database and adds a `testing` database
- exposes the app on the tailnet only:
  - PWA: `https://<namespace>.<tailnet>.ts.net`
  - API: `https://<namespace>-api.<tailnet>.ts.net`

The environment's Doppler config needs matching values, for example:

```
FRONTEND_URL=https://<namespace>.<tailnet>.ts.net
VITE_API_BASE_URL=https://<namespace>-api.<tailnet>.ts.net
SANCTUM_STATEFUL_DOMAINS=<namespace>.<tailnet>.ts.net
SESSION_DOMAIN=.<tailnet>.ts.net
```
