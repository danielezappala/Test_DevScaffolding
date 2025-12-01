#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
COMPOSE_FILE="$ROOT_DIR/infrastructure/docker-compose.yml"
ENV_FILE="$ROOT_DIR/.env"

# Usa il database esterno se la porta 5432 è già occupata
USE_EXTERNAL_DB=false

# Verifica che Docker sia disponibile
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo "❌ Docker non trovato. Installa Docker o Colima."
    exit 1
  fi

  # Verifica se Colima è installato
  if command -v colima &> /dev/null; then
    echo "🔍 Verifico Colima..."
    
    # Controlla se Colima è running
    if ! colima status &> /dev/null; then
      echo "🚀 Avvio Colima..."
      colima start --cpu 4 --memory 6 --disk 100 --vm-type=vz --mount-type=virtiofs --mount-inotify=false
      sleep 3
    fi
    
    # Assicurati che il context sia corretto
    docker context use colima &> /dev/null || true
    
    # Test più robusto: verifica sia docker info che docker ps
    echo "⏳ Verifico connessione Docker..."
    local retries=0
    local max_retries=5
    while [ $retries -lt $max_retries ]; do
      if docker ps &> /dev/null; then
        echo "✅ Docker funziona correttamente."
        return 0
      fi
      retries=$((retries + 1))
      if [ $retries -lt $max_retries ]; then
        echo "   Tentativo $retries/$max_retries..."
        sleep 2
      fi
    done
    
    # Se arriviamo qui, Docker non risponde
    echo ""
    echo "❌ Docker non risponde. Colima è in uno stato inconsistente."
    echo ""
    read -p "Vuoi riavviare Colima automaticamente? (S/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
      echo "🔄 Riavvio Colima..."
      colima stop
      sleep 2
      colima start --cpu 4 --memory 6 --disk 100 --vm-type=vz --mount-type=virtiofs --mount-inotify=false
      docker context use colima
      sleep 3
      
      if docker ps &> /dev/null; then
        echo "✅ Docker funziona dopo il riavvio!"
        return 0
      else
        echo "❌ Ancora problemi. Prova: ./scripts/fix_colima.sh"
        exit 1
      fi
    else
      echo "❌ Impossibile procedere senza Docker funzionante."
      echo "   Prova: ./scripts/fix_colima.sh"
      exit 1
    fi
  else
    # Non è Colima, verifica Docker generico
    if ! docker ps &> /dev/null; then
      echo "❌ Docker daemon non raggiungibile."
      echo "   Installa Colima: brew install colima"
      echo "   Oppure avvia Docker Desktop"
      exit 1
    fi
    echo "✅ Docker daemon raggiungibile."
  fi
}

PORT_MAP=(
  "traefik-http:80"
  "traefik-https:443"
  "traefik-dashboard:8080"
  "backend:8000"
  "frontend:3000"
  "postgres:5432"
  "pgbouncer:6432"
  "redis:6379"
  "prometheus:9090"
)

cleanup_port() {
  local name="$1"
  local port="$2"

  # shellcheck disable=SC2009
  if ! lsof -nti tcp:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "✅ Porta $port libera (${name})."
    return 0
  fi

  echo "⚠️  Porta $port occupata (${name})."
  echo ""
  echo "Processi in esecuzione sulla porta $port:"
  # Mostra informazioni dettagliate sui processi
  lsof -nP -iTCP:"$port" -sTCP:LISTEN | tail -n +2 | while read -r line; do
    echo "   $line"
  done
  echo ""
  
  # Se è PostgreSQL, offri l'opzione di usare il database esterno
  if [ "$name" = "postgres" ]; then
    echo "💡 Sembra che PostgreSQL sia già in esecuzione (probabilmente condiviso con altre app)."
    read -p "Vuoi usare il database esterno invece di avviarne uno nuovo? (S/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
      echo "✅ Userò il database esterno sulla porta $port."
      USE_EXTERNAL_DB=true
      return 0
    fi
  fi
  
  local pids
  # Only target processes LISTENING on the port
  pids=$(lsof -nti tcp:"$port" -sTCP:LISTEN)
  
  if [ -z "$pids" ]; then
    echo "✅ Nessun processo in ascolto sulla porta $port."
    return 0
  fi
  
  # Chiedi conferma prima di killare
  read -p "Vuoi terminare questi processi? (s/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operazione annullata. Impossibile procedere con porta $port occupata."
    exit 1
  fi

  for pid in $pids; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      echo "   → SIGTERM al PID $pid"
      kill "$pid"
    fi
  done

  sleep 1

  for pid in $pids; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      echo "   → SIGKILL al PID $pid"
      kill -9 "$pid" || true
    fi
  done

  if lsof -nti tcp:"$port" >/dev/null 2>&1; then
    echo "❌ Impossibile liberare la porta $port. Interrompo."
    exit 1
  fi

  echo "✅ Porta $port liberata (${name})."
}

echo "🔍 Verifico Docker..."
check_docker

echo ""
echo "🔍 Controllo porte richieste..."
for entry in "${PORT_MAP[@]}"; do
  name="${entry%%:*}"
  port="${entry##*:}"
  cleanup_port "$name" "$port"
done

if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️  File .env non trovato. Uso .env.example"
  ENV_FILE="$ROOT_DIR/.env.example"
fi

echo "🚀 Avvio di tutti i servizi Docker..."
if [ "$USE_EXTERNAL_DB" = true ]; then
  echo "📌 Avvio senza container PostgreSQL (uso database esterno)..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d "$@"
else
  echo "📌 Avvio con container PostgreSQL dedicato..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile with-db up -d "$@"
fi
echo "✅ Tutti i servizi sono in esecuzione."

if [ "$USE_EXTERNAL_DB" = true ]; then
  echo ""
  echo "⚠️  IMPORTANTE: Stai usando un database esterno."
  echo "   Assicurati che DATABASE_URL nel file .env punti al database corretto."
  echo "   Esempio: postgresql+asyncpg://user:password@localhost:5432/dbname"
fi
