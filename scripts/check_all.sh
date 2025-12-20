#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
COVERAGE_THRESHOLD="${COVERAGE_THRESHOLD:-80}"

backend_cmd() {
  if [ -d "$ROOT_DIR/backend/venv" ]; then
    # shellcheck disable=SC1091
    source "$ROOT_DIR/backend/venv/bin/activate"
  fi
  "$@"
}

echo "== Backend: lint + type-check =="
(cd "$ROOT_DIR/backend" && backend_cmd ruff check app/ tests/)
(cd "$ROOT_DIR/backend" && backend_cmd mypy app/ --ignore-missing-imports)

echo "== Backend: tests =="
(cd "$ROOT_DIR/backend" && backend_cmd pytest --cov=app --cov-report=term --cov-fail-under="$COVERAGE_THRESHOLD")

echo "== Frontend: lint + type-check =="
(cd "$ROOT_DIR/frontend" && npm run lint)
(cd "$ROOT_DIR/frontend" && npm run type-check)

echo "== Frontend: tests =="
(cd "$ROOT_DIR/frontend" && npm test)

echo ""
echo "All checks completed."
