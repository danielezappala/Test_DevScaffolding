#!/bin/bash

PORT=8000

# Funzione per controllare e liberare la porta
check_and_free_port() {
    local port=$1
    local pid=$(lsof -ti :$port)

    if [ -n "$pid" ]; then
        echo "⚠️  La porta $port è occupata dal processo PID $pid."
        # Ottieni il nome del processo per info
        local process_name=$(ps -p $pid -o comm=)
        echo "   Processo: $process_name"
        
        echo "🔄 Sto terminando il processo per liberare la porta..."
        kill -9 $pid
        sleep 1
        
        # Verifica se è stato terminato
        if lsof -ti :$port > /dev/null; then
            echo "❌ Impossibile liberare la porta $port. Verifica i permessi."
            exit 1
        else
            echo "✅ Porta $port liberata con successo."
        fi
    else
        echo "✅ Porta $port libera."
    fi
}

echo "🚀 Avvio ambiente di sviluppo Backend..."
echo "----------------------------------------"

# Attiva virtual environment se esiste
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Virtual environment non trovato in ./venv"
    exit 1
fi

# Libera la porta
check_and_free_port $PORT

echo "🔥 Avvio server Uvicorn su http://localhost:$PORT..."
echo "----------------------------------------"

# Avvia uvicorn
uvicorn app.main:app --reload --port $PORT
