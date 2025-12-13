#!/usr/bin/env bash

# Script per creare database e utente sul PostgreSQL esterno

set -euo pipefail

DB_NAME="eno_inventory_db"
DB_USER="eno_inventory_user"
DB_PASSWORD="2Mj1NJXxlERRfn7ue8HNcLZ-OGPXB-sV"

echo "🔧 Creazione database e utente su PostgreSQL esterno..."
echo ""
echo "Esegui questi comandi sul tuo PostgreSQL (come superuser):"
echo ""
echo "psql -U postgres -c \"CREATE USER \\\"${DB_USER}\\\" WITH PASSWORD '${DB_PASSWORD}';\""
echo "psql -U postgres -c \"CREATE DATABASE \\\"${DB_NAME}\\\" OWNER \\\"${DB_USER}\\\";\""
echo "psql -U postgres -c \"GRANT ALL PRIVILEGES ON DATABASE \\\"${DB_NAME}\\\" TO \\\"${DB_USER}\\\";\""
echo ""
echo "Oppure esegui direttamente:"
echo ""

# Prova a eseguire direttamente
if command -v psql &> /dev/null; then
    read -p "Vuoi che lo script esegua questi comandi ora? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        psql -U postgres -c "CREATE USER \"${DB_USER}\" WITH PASSWORD '${DB_PASSWORD}';" || echo "⚠️  Utente già esistente o errore"
        psql -U postgres -c "CREATE DATABASE \"${DB_NAME}\" OWNER \"${DB_USER}\";" || echo "⚠️  Database già esistente o errore"
        psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"${DB_NAME}\" TO \"${DB_USER}\";" || echo "⚠️  Errore nei permessi"
        echo "✅ Setup completato!"
    fi
else
    echo "⚠️  psql non trovato. Esegui i comandi manualmente."
fi
