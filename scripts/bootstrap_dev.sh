#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"

echo "== Bootstrap dev environment =="

if [ ! -f "$ROOT_DIR/.env" ]; then
  if [ -f "$ROOT_DIR/.env.example" ]; then
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    echo "Created .env from .env.example"
  else
    echo "Missing .env.example; skipping .env creation"
  fi
else
  echo ".env already present"
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 not found. Install Python 3.12+"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Install Node.js 20+"
  exit 1
fi

echo "Setting up backend virtualenv and deps..."
"$ROOT_DIR/backend/setup.sh"

echo "Installing frontend dependencies..."
if [ -f "$ROOT_DIR/frontend/package-lock.json" ]; then
  (cd "$ROOT_DIR/frontend" && npm ci)
else
  (cd "$ROOT_DIR/frontend" && npm install)
fi

echo ""
echo "Bootstrap complete."
echo "Next steps:"
echo "  - Start services: make up"
echo "  - Or run locally:"
echo "      backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo "      frontend: cd frontend && npm run dev"
