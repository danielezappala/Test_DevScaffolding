#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"

if ! command -v git >/dev/null 2>&1; then
  echo "git not found."
  exit 1
fi

cd "$ROOT_DIR"

echo "== Release preflight =="

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repository."
  exit 1
fi

if ! git diff-index --quiet HEAD --; then
  echo "Working tree not clean. Commit or stash changes."
  exit 1
fi

if [ ! -f "$ROOT_DIR/VERSION" ]; then
  echo "Missing VERSION file."
  exit 1
fi

VERSION="$(cat "$ROOT_DIR/VERSION")"
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "VERSION is not semantic (X.Y.Z): $VERSION"
  exit 1
fi

if git tag -l "v$VERSION" | grep -q "v$VERSION"; then
  echo "Tag v$VERSION already exists."
  exit 1
fi

ENV_VERSION=""
if [ -f "$ROOT_DIR/.env.example" ]; then
  ENV_VERSION="$(grep '^APP_VERSION=' "$ROOT_DIR/.env.example" | cut -d '=' -f2- | tr -d '"' | tr -d "'")"
fi

if [ -n "$ENV_VERSION" ] && [ "$ENV_VERSION" != "$VERSION" ]; then
  echo "Warning: .env.example APP_VERSION ($ENV_VERSION) does not match VERSION ($VERSION)."
fi

echo "OK: preflight checks passed."
echo "Suggested next steps:"
echo "  - ./scripts/check_all.sh"
echo "  - ./scripts/release.sh"
