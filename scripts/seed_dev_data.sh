#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"

if [ ! -d "$ROOT_DIR/backend" ]; then
  echo "Backend directory not found."
  exit 1
fi

if [ -d "$ROOT_DIR/backend/venv" ]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/backend/venv/bin/activate"
else
  echo "Backend venv not found. Run ./scripts/bootstrap_dev.sh first."
  exit 1
fi

echo "== Seeding demo data =="
cd "$ROOT_DIR/backend"
PYTHONPATH="$ROOT_DIR/backend" python3 -m app.scripts.seed_inventory
