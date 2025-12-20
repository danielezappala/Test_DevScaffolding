#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
COMPOSE_FILE="$ROOT_DIR/infrastructure/docker-compose.yml"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found."
  exit 1
fi

echo "== Reset stack =="
echo "This will stop containers for this project."
read -r -p "Continue? [y/N]: " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

docker compose -f "$COMPOSE_FILE" down

read -r -p "Remove project volumes? This deletes local DB data. [y/N]: " REMOVE_VOLUMES
if [[ $REMOVE_VOLUMES =~ ^[Yy]$ ]]; then
  docker compose -f "$COMPOSE_FILE" down -v
  echo "Volumes removed."
fi

echo "Reset completed."
