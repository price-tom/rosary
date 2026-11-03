#!/usr/bin/env bash
# Prepares the local kind cluster. kind has no Doppler operator, so this copies
# the dev_local config into the cluster's secrets. No secrets are written to disk.
#
#   scripts/kind-setup.sh           build and load the app image, sync secrets
#   scripts/kind-setup.sh secrets   sync secrets only, after changing dev_local
set -euo pipefail

cd "$(dirname "$0")/.."

CONTEXT=kind
CLUSTER=kind
NAMESPACE=rosary-local
DOPPLER_PROJECT=rosary-app
DOPPLER_CONFIG=dev_local

k() { kubectl --context "$CONTEXT" "$@"; }

load_image() {
	docker build --file docker/app/Dockerfile --target dev --tag rosary-laravel:local .
	kind load docker-image --name "$CLUSTER" rosary-laravel:local
}

# Stands in for the Doppler operator, using the same mapping as managedSecrets
# in values.yaml
sync_secrets() {
	k create namespace "$NAMESPACE" --dry-run=client -o yaml | k apply -f - >/dev/null

	doppler secrets download --no-file --format json \
		--project "$DOPPLER_PROJECT" --config "$DOPPLER_CONFIG" |
		python3 -c '
import base64, json, sys

env = json.load(sys.stdin)

def secret(name, data):
    return {
        "apiVersion": "v1",
        "kind": "Secret",
        "metadata": {"name": name},
        "data": {k: base64.b64encode(v.encode()).decode() for k, v in data.items()},
    }

print(json.dumps({"apiVersion": "v1", "kind": "List", "items": [
    secret("app-secret", env),
    secret("db-secret", {"username": env["DB_USERNAME"], "password": env["DB_PASSWORD"]}),
]}))
' | k -n "$NAMESPACE" apply -f -

	# Postgres only reads db-secret when the cluster is first created, so an
	# existing database needs its password updated to match
	if k -n "$NAMESPACE" get pod db-1 >/dev/null 2>&1; then
		username=$(k -n "$NAMESPACE" get secret db-secret -o go-template='{{.data.username | base64decode}}')
		password=$(k -n "$NAMESPACE" get secret db-secret -o go-template='{{.data.password | base64decode}}')
		printf '%s\n' "SELECT format('ALTER ROLE %I PASSWORD %L', :'username', :'password') \\gexec" |
			k -n "$NAMESPACE" exec -i db-1 -c postgres -- \
				psql -q -U postgres -d postgres -v ON_ERROR_STOP=1 \
				-v "username=$username" -v "password=$password" >/dev/null
	fi

	echo "Secrets synced from $DOPPLER_PROJECT/$DOPPLER_CONFIG. Restart devspace dev to pick them up."
}

case "${1:-all}" in
all)
	load_image
	sync_secrets
	;;
secrets) sync_secrets ;;
*)
	echo "Usage: $0 [all|secrets]" >&2
	exit 1
	;;
esac
