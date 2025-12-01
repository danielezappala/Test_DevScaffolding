#!/bin/bash

# Script per rilevare e risolvere problemi comuni di Colima
# Uso: ./scripts/fix_colima.sh

set -e

echo "🔍 Diagnostica Colima..."

# Verifica se Colima è installato
if ! command -v colima &> /dev/null; then
    echo "❌ Colima non installato."
    echo "   Installa con: brew install colima"
    exit 1
fi

# Verifica stato Colima
echo ""
echo "📊 Status Colima:"
if colima status &> /dev/null; then
    colima status
    COLIMA_RUNNING=true
else
    echo "⚠️  Colima non è in esecuzione"
    COLIMA_RUNNING=false
fi

# Verifica Docker context
echo ""
echo "🔧 Docker context:"
docker context show

# Verifica connessione Docker
echo ""
echo "🐳 Test connessione Docker:"
if docker info &> /dev/null 2>&1; then
    echo "✅ docker info funziona"
    DOCKER_INFO_OK=true
else
    echo "❌ docker info fallisce"
    DOCKER_INFO_OK=false
fi

if docker ps &> /dev/null 2>&1; then
    echo "✅ docker ps funziona"
    DOCKER_PS_OK=true
else
    echo "❌ docker ps fallisce"
    DOCKER_PS_OK=false
fi

# Determina il problema
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$COLIMA_RUNNING" = false ]; then
    echo "🔧 PROBLEMA: Colima non è in esecuzione"
    echo ""
    read -p "Vuoi avviare Colima? (S/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo "🚀 Avvio Colima..."
        colima start --cpu 4 --memory 6 --disk 100 --vm-type=vz --mount-type=virtiofs --mount-inotify=false
        docker context use colima
        echo "✅ Fatto!"
    fi
    exit 0
fi

if [ "$DOCKER_INFO_OK" = false ] || [ "$DOCKER_PS_OK" = false ]; then
    echo "🔧 PROBLEMA: Colima è running ma Docker non risponde"
    echo "   Questo è un bug noto di Colima - stato inconsistente"
    echo ""
    echo "Soluzioni possibili:"
    echo "  1. Riavvio completo (raccomandato)"
    echo "  2. Solo restart"
    echo "  3. Delete e ricrea"
    echo ""
    read -p "Scegli (1/2/3): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            echo "🔄 Riavvio completo..."
            colima stop
            sleep 2
            colima start --cpu 4 --memory 6 --disk 100 --vm-type=vz --mount-type=virtiofs --mount-inotify=false
            docker context use colima
            ;;
        2)
            echo "🔄 Restart..."
            colima restart
            docker context use colima
            ;;
        3)
            echo "🗑️  Delete e ricrea..."
            colima stop
            colima delete
            colima start --cpu 4 --memory 6 --disk 100 --vm-type=vz --mount-type=virtiofs --mount-inotify=false
            docker context use colima
            ;;
        *)
            echo "❌ Operazione annullata"
            exit 1
            ;;
    esac
    
    echo ""
    echo "⏳ Attendo che Docker sia pronto..."
    sleep 3
    
    if docker ps &> /dev/null; then
        echo "✅ Docker funziona!"
    else
        echo "❌ Docker ancora non risponde"
        echo "   Prova manualmente: ./scripts/restart_colima.sh"
        exit 1
    fi
else
    echo "✅ Tutto OK! Colima e Docker funzionano correttamente."
fi

echo ""
echo "📊 Container attivi:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
