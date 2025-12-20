#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DUMP_DIR="${DUMP_DIR:-$ROOT_DIR/db_dumps}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DUMP_FILE="$DUMP_DIR/eno_inventory_${TIMESTAMP}.sql"

PG_DUMP_BIN="${PG_DUMP_BIN:-/Applications/Postgres.app/Contents/Versions/18/bin/pg_dump}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_USER="${DB_USER:-test-devscaffolding_user}"
DB_NAME="${DB_NAME:-test-devscaffolding_db}"

mkdir -p "$DUMP_DIR"

"$PG_DUMP_BIN" -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$DUMP_FILE"

echo "Dump creato: $DUMP_FILE"
