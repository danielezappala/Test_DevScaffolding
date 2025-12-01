# Colima Troubleshooting Guide

## ⚠️ PROBLEMA COMUNE: Instabilità su macOS 15

Se Colima si blocca frequentemente o Docker non risponde anche se Colima è "running", il problema è **mountInotify** (feature sperimentale).

**Fix immediato:**
```bash
sed -i.bak 's/mountInotify: true/mountInotify: false/' ~/.colima/default/colima.yaml
colima stop && colima start
```

Tutti gli script in questo progetto ora usano `--mount-inotify=false` per evitare il problema.

## Configurazione Ottimizzata

Il progetto richiede risorse adeguate per eseguire tutti i servizi (Traefik, Backend, Frontend, Postgres, Redis, Prometheus).

### Configurazione Raccomandata

```bash
colima start \
  --cpu 4 \
  --memory 6 \
  --disk 100 \
  --vm-type=vz \
  --mount-type=virtiofs \
  --mount-inotify=false
```

**Parametri:**
- `--cpu 4`: 4 CPU cores (minimo raccomandato per lo stack completo)
- `--memory 6`: 6GB RAM (minimo raccomandato)
- `--disk 100`: 100GB disco
- `--vm-type=vz`: Usa macOS Virtualization.Framework (più performante)
- `--mount-type=virtiofs`: Mount più veloci e stabili
- `--mount-inotify=false`: **IMPORTANTE** - Disabilita inotify sperimentale che causa instabilità

## Problemi Comuni

### 1. Colima running ma Docker non risponde (PROBLEMA PIÙ COMUNE)

**Sintomo:**
```
Cannot connect to the Docker daemon at unix:///Users/xxx/.colima/default/docker.sock
```
Ma `colima status` dice che è running.

**Causa:** Bug noto di Colima - stato inconsistente tra VM e Docker daemon

**Causa principale:** `mountInotify: true` (sperimentale) causa instabilità su macOS 15

**Soluzione rapida:**
```bash
./scripts/fix_colima.sh
```

**Soluzione manuale:**
```bash
# Disabilita inotify nel config
sed -i.bak 's/mountInotify: true/mountInotify: false/' ~/.colima/default/colima.yaml

# Riavvia Colima
colima stop
colima start
docker context use colima
```

**Oppure ricrea da zero:**
```bash
colima stop
colima delete
colima start --cpu 4 --memory 6 --disk 100 --vm-type=vz --mount-type=virtiofs --mount-inotify=false
docker context use colima
```

### 2. Errore "disk in use by instance"

**Sintomo:**
```
failed to run attach disk "colima", in use by instance "colima"
```

**Soluzione:**
```bash
colima stop
colima delete
colima start --cpu 4 --memory 6 --disk 100 --vm-type=vz --mount-type=virtiofs
```

### 3. Colima si blocca o diventa instabile

**Cause comuni:**
- Risorse insufficienti (CPU/RAM)
- Mac messo in sleep con container attivi
- Interferenze con VPN
- Troppi container in esecuzione

**Soluzione rapida:**
```bash
./scripts/restart_colima.sh
```

### 3. Docker non risponde / "Cannot connect to Docker daemon"

**Sintomo:**
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Causa:** Docker context non impostato su Colima

**Soluzione:**
```bash
docker context use colima
docker ps
```

**Se persiste, riavvio completo:**
```bash
colima stop
colima start --cpu 4 --memory 6 --vm-type=vz --mount-type=virtiofs
docker context use colima
```

### 5. Problemi di rete dopo VPN

Alcuni VPN possono interferire con il networking di Docker.

**Soluzione:**
```bash
colima stop
# Disconnetti VPN
colima start --cpu 4 --memory 6 --vm-type=vz --mount-type=virtiofs
# Riconnetti VPN
```

### 6. Performance lente

**Verifica risorse allocate:**
```bash
colima list
```

**Aumenta risorse se necessario:**
```bash
colima stop
colima start --cpu 6 --memory 8 --vm-type=vz --mount-type=virtiofs
```

## Script Utili

### Diagnostica e Fix Automatico (RACCOMANDATO)
```bash
./scripts/fix_colima.sh
```
Questo script:
- Rileva automaticamente il problema
- Propone la soluzione migliore
- Può riparare Colima automaticamente

### Riavvio Rapido
```bash
./scripts/restart_colima.sh
```

### Reset Completo
```bash
colima stop
colima delete
colima start --cpu 4 --memory 6 --disk 100 --vm-type=vz --mount-type=virtiofs
```

### Verifica Stato
```bash
colima status
colima list
docker ps
```

## Best Practices

1. **Non mettere il Mac in sleep con container attivi**
   - Ferma i container prima: `docker-compose down`
   - Oppure ferma Colima: `colima stop`

2. **Monitora l'uso delle risorse**
   ```bash
   docker stats
   ```

3. **Pulisci regolarmente**
   ```bash
   docker system prune -a --volumes
   ```

4. **Usa profili Docker Compose**
   - Avvia solo i servizi necessari
   - Esempio: `docker-compose up` (senza Postgres se usi DB esterno)

5. **Verifica i log in caso di problemi**
   ```bash
   cat ~/.colima/_lima/colima/ha.stderr.log
   cat ~/.colima/_lima/colima/serial.log
   ```

## Requisiti Sistema

**Minimo:**
- macOS con Apple Silicon (M1/M2/M3)
- 8GB RAM totali
- 50GB spazio disco

**Raccomandato:**
- 16GB+ RAM totali
- 100GB+ spazio disco
- Colima configurato con almeno 4 CPU e 6GB RAM

## Rosetta

Rosetta **non è necessaria** per questo progetto. Tutte le immagini Docker usate hanno supporto nativo arm64:
- traefik:v3
- postgres:17-alpine
- redis:7-alpine
- prom/prometheus:latest
- edoburu/pgbouncer:latest

Se hai Rosetta abilitata, non causa problemi ma non viene utilizzata.

## Supporto

Se i problemi persistono:
1. Controlla i log: `~/.colima/_lima/colima/ha.stderr.log`
2. Verifica versione Colima: `colima version`
3. Aggiorna Colima: `brew upgrade colima`
4. Considera alternative come OrbStack se i problemi continuano
