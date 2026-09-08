#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
runtime_image="${N8N_TEST_IMAGE:-docker.n8n.io/n8nio/n8n:2.38.1}"
run_name="ironfang-n8n-runtime-$$"
fixture_dir=$(mktemp -d)
chmod 777 "$fixture_dir"
cleanup() { docker exec "$run_name-api" node -e 'require("node:fs").rmSync("/output/binary",{recursive:true,force:true})' >/dev/null 2>&1 || true; docker rm -f "$run_name-api" "$run_name-node" >/dev/null 2>&1 || true; docker network rm "$run_name" >/dev/null 2>&1 || true; rm -rf "$fixture_dir"; }
trap cleanup EXIT
node scripts/runtime-fixtures.cjs "$fixture_dir"
docker network create "$run_name" >/dev/null
docker run -d --name "$run_name-api" --network "$run_name" --network-alias fixture-api -v "$PWD/tests/runtime/server.cjs:/server.cjs:ro" -v "$PWD/scripts/runtime-fixtures.cjs:/checker.cjs:ro" -v "$fixture_dir:/output" node:24-alpine node /server.cjs >/dev/null
docker run --rm --name "$run_name-node" --network "$run_name" --entrypoint sh \
 -e N8N_CUSTOM_EXTENSIONS=/extensions -e N8N_DIAGNOSTICS_ENABLED=false \
 -e N8N_VERSION_NOTIFICATIONS_ENABLED=false -e N8N_TEMPLATES_ENABLED=false \
 -e N8N_BINARY_DATA_STORAGE_PATH=/fixtures/binary \
 -e N8N_ENCRYPTION_KEY=synthetic-runtime-fixture-encryption-key \
 -v "$PWD/dist:/extensions:ro" -v "$fixture_dir:/fixtures" "$runtime_image" \
 -c 'n8n import:credentials --input=/fixtures/credentials.json >/fixtures/import.log 2>&1 && n8n import:workflow --input=/fixtures/workflow.json >>/fixtures/import.log 2>&1 && n8n execute --id=runtime-fixture --rawOutput >/fixtures/execution.log 2>&1' || { cat "$fixture_dir/import.log" "$fixture_dir/execution.log"; exit 1; }
docker exec "$run_name-api" node /checker.cjs /output verify || { cat "$fixture_dir/execution.log"; docker logs "$run_name-api"; exit 1; }
