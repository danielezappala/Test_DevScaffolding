#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
HOST="${1:-localhost}"
SCHEME="${2:-http}"

BASE_PATH="/inventory"
if [ -f "$ROOT_DIR/.env" ]; then
  ENV_BASE_PATH="$(grep '^BASE_PATH=' "$ROOT_DIR/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'")"
  if [ -n "${ENV_BASE_PATH:-}" ]; then
    BASE_PATH="$ENV_BASE_PATH"
  fi
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl not found."
  exit 1
fi

echo "== Verify subpath routing =="
echo "Host: $HOST"
echo "Scheme: $SCHEME"
echo "Base path: $BASE_PATH"

FRONTEND_URL="${SCHEME}://${HOST}${BASE_PATH}/"
API_HEALTH_URL="${SCHEME}://${HOST}${BASE_PATH}/api/v1/health"
DOCS_URL="${SCHEME}://${HOST}${BASE_PATH}/api/docs"

echo ""
echo "Checking frontend..."
curl -fsSI "$FRONTEND_URL" | head -n 1

echo "Checking API health..."
curl -fsS "$API_HEALTH_URL" | head -n 1

echo "Checking API docs..."
curl -fsSI "$DOCS_URL" | head -n 1

echo ""
echo "Subpath verification completed."
