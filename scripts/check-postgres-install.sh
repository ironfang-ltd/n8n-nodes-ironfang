#!/usr/bin/env bash
# Installs this build through n8n's community-package API on PostgreSQL, from a
# throwaway local registry. The other runtime checks load dist/ as a custom
# extension on SQLite, which never records the package in the database: that is
# how a fractional newest node version reached npm although n8n before 2.33
# cannot save one on PostgreSQL. Nothing is published outside this machine.
set -euo pipefail
cd "$(dirname "$0")/.."
runtime_image="${N8N_INSTALL_TEST_IMAGE:-docker.n8n.io/n8nio/n8n:2.32.4}"
run_name="ironfang-install-$$"
work=$(mktemp -d)
chmod 755 "$work"
cleanup() { docker rm -f "$run_name-registry" "$run_name-pg" "$run_name-node" >/dev/null 2>&1 || true; docker network rm "$run_name" >/dev/null 2>&1 || true; rm -rf "$work"; }
trap cleanup EXIT
wait_for() { for _ in $(seq 1 120); do if "$@" >/dev/null 2>&1; then return 0; fi; sleep 2; done; echo "Timed out waiting for: $*"; return 1; }
mkdir -p "$work/conf"
cat > "$work/conf/config.yaml" <<'CONFIG'
storage: /verdaccio/storage
packages:
  '@ironfang/*': { access: $all, publish: $all }
log: { type: stdout, format: pretty, level: warn }
CONFIG
printf '@ironfang:registry=http://registry:4873/\n' > "$work/scoped.npmrc"
chmod 644 "$work/conf/config.yaml" "$work/scoped.npmrc"
docker network create "$run_name" >/dev/null
docker run -d --name "$run_name-registry" --network "$run_name" --network-alias registry -p 127.0.0.1::4873 -v "$work/conf:/verdaccio/conf:ro" verdaccio/verdaccio:6 >/dev/null
docker run -d --name "$run_name-pg" --network "$run_name" --network-alias pg -e POSTGRES_PASSWORD=fixture -e POSTGRES_DB=n8n postgres:16-alpine >/dev/null
registry="http://127.0.0.1:$(docker port "$run_name-registry" 4873 | head -1 | sed 's/.*://')"
wait_for curl -sf -m 2 "$registry/-/ping"
printf '%s\n' "//${registry#http://}/:_authToken=fixture" > "$work/publish.npmrc"
npm publish --registry "$registry" --userconfig "$work/publish.npmrc" --provenance=false --cache "$work/cache" >/dev/null 2>&1
docker run -d --name "$run_name-node" --network "$run_name" -p 127.0.0.1::5678 \
 -e DB_TYPE=postgresdb -e DB_POSTGRESDB_HOST=pg -e DB_POSTGRESDB_DATABASE=n8n -e DB_POSTGRESDB_USER=postgres -e DB_POSTGRESDB_PASSWORD=fixture \
 -e N8N_DIAGNOSTICS_ENABLED=false -e N8N_VERSION_NOTIFICATIONS_ENABLED=false -e N8N_SECURE_COOKIE=false \
 -v "$work/scoped.npmrc:/home/node/.npmrc:ro" "$runtime_image" >/dev/null
n8n="http://127.0.0.1:$(docker port "$run_name-node" 5678 | head -1 | sed 's/.*://')"
wait_for sh -c "curl -s -m 3 $n8n/rest/settings | grep -q '\"data\"'"
curl -sf -m 30 -c "$work/jar" -o /dev/null -H 'content-type: application/json' -d '{"email":"fixture@example.com","firstName":"Fixture","lastName":"Owner","password":"Fixture-Passw0rd"}' "$n8n/rest/owner/setup"
version=$(node -p "require('./package.json').version")
response=$(curl -s -m 300 -b "$work/jar" -H 'content-type: application/json' -H 'browser-id: fixture' -d '{"name":"@ironfang/n8n-nodes-ironfang"}' "$n8n/rest/community-packages")
if ! node -e 'const r=JSON.parse(process.argv[1]);const n=r.data?.installedNodes??[];if(r.data?.installedVersion!==process.argv[2]||n.length!==2||!n.every(x=>Number.isInteger(x.latestVersion)))process.exit(1)' "$response" "$version"; then
 echo "Install failed: $response"; docker logs "$run_name-node" 2>&1 | tail -20; exit 1
fi
echo "Real n8n install: $version installed through the community-package API on PostgreSQL (${runtime_image##*:}) and both nodes were recorded"
