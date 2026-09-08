#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
runtime_image="${N8N_TEST_IMAGE:-docker.n8n.io/n8nio/n8n:2.38.1}"
run_name="ironfang-webhook-runtime-$$"
fixture_dir=$(mktemp -d)
chmod 777 "$fixture_dir"
cleanup() {
 docker rm -f "$run_name-node" >/dev/null 2>&1 || true
 docker exec "$run_name-api" node -e 'require("node:fs").rmSync("/output/user",{recursive:true,force:true})' >/dev/null 2>&1 || true
 docker rm -f "$run_name-api" >/dev/null 2>&1 || true
 docker network rm "$run_name" >/dev/null 2>&1 || true
 rm -rf "$fixture_dir"
}
trap cleanup EXIT
node tests/runtime/webhook.cjs generate "$fixture_dir"
docker network create "$run_name" >/dev/null
docker run -d --name "$run_name-api" --network "$run_name" --network-alias fixture-api -v "$PWD/tests/runtime/webhook.cjs:/fixture.cjs:ro" -v "$fixture_dir:/output" node:24-alpine node /fixture.cjs server >/dev/null
docker run -d --name "$run_name-node" --network "$run_name" --network-alias n8n-runtime --entrypoint sh \
 -e N8N_CUSTOM_EXTENSIONS=/extensions -e N8N_DIAGNOSTICS_ENABLED=false \
 -e N8N_VERSION_NOTIFICATIONS_ENABLED=false -e N8N_TEMPLATES_ENABLED=false \
 -e N8N_USER_FOLDER=/fixtures/user -e N8N_ENCRYPTION_KEY=synthetic-webhook-fixture-key \
 -v "$PWD/dist:/extensions:ro" -v "$fixture_dir:/fixtures" "$runtime_image" \
 -c 'if [ ! -f /fixtures/initialized ]; then n8n import:credentials --input=/fixtures/credentials.json >/fixtures/import.log 2>&1 && n8n import:workflow --input=/fixtures/workflow.json >>/fixtures/import.log 2>&1 && n8n publish:workflow --id=trigger-fixture >>/fixtures/import.log 2>&1 && touch /fixtures/initialized || exit 1; fi; exec n8n start' >/dev/null
if ! docker exec "$run_name-api" node /fixture.cjs probe; then cat "$fixture_dir/import.log"; docker logs "$run_name-node"; exit 1; fi
docker restart "$run_name-node" >/dev/null
if ! docker exec "$run_name-api" node /fixture.cjs restart; then docker logs "$run_name-node"; exit 1; fi
