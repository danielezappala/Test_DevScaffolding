#!/bin/bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 /path/to/dump.sql"
  exit 1
fi

DUMP_FILE="$1"
DB_HOST="${DB_HOST:-172.19.0.1}"
DB_USER="${DB_USER:-eno_inventory_user}"
DB_NAME="${DB_NAME:-eno_inventory_db}"

psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<'SQL'
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO eno_inventory_user;
GRANT ALL ON SCHEMA public TO public;
SQL

psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" < "$DUMP_FILE"

echo "Restore completato da: $DUMP_FILE"
