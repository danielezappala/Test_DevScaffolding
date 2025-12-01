#!/bin/bash

# Script per riavviare Colima con configurazione ottimizzata
# Uso: ./scripts/restart_colima.sh

set -e

echo "🔄 Stopping Colima..."
colima stop || true

echo "🧹 Cleaning up stale processes..."
sleep 2

echo "🚀 Starting Colima with optimized settings..."
colima start \
  --cpu 4 \
  --memory 6 \
  --disk 100 \
  --vm-type=vz \
  --mount-type=virtiofs \
  --mount-inotify=false

echo "🔧 Setting Docker context to Colima..."
docker context use colima

echo "✅ Colima started successfully!"
echo ""
echo "📊 Status:"
colima status
echo ""
docker ps
