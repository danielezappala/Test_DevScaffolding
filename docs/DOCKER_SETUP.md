# Docker Setup e Best Practices

## Gestione Colima Multi-Progetto

Colima è **globale** - una sola istanza per tutto il sistema. Questo significa che tutti i tuoi progetti condividono la stessa VM Docker.

### Configurazione Raccomandata (Globale)

```bash
colima start --cpu 4 --memory 6 --disk 100 --vm-type=vz --mount-type=virtiofs
```

Questa configurazione funziona per la maggior parte dei progetti. Se lavori su progetti molto pesanti, aumenta le risorse:

```bash
colima start --cpu 6 --memory 8 --disk 100 --vm-type=vz --mount-type=virtiofs
```

### Best Practices Multi-Progetto

#### 1. Mantieni Colima sempre attivo

Non serve fermare Colima quando cambi progetto. Lascialo girare:

```bash
# ✅ CORRETTO - Colima resta attivo
cd ~/progetto-a
docker compose up -d
cd ~/progetto-b
docker compose up -d
```

#### 2. Ferma solo i container, non Colima

Quando finisci di lavorare su un progetto:

```bash
# ✅ CORRETTO - Ferma solo i container del progetto
docker compose down

# ❌ EVITA - Non serve fermare Colima
colima stop
```

#### 3. Usa nomi univoci per i container

Nel `docker-compose.yml`, usa sempre `container_name` con prefisso progetto:

```yaml
services:
  backend:
    container_name: mio-progetto-backend  # ✅ Nome univoco
    # ...
```

Questo evita conflitti tra progetti.

#### 4. Usa network separati per progetto

```yaml
networks:
  mio-progetto-network:  # ✅ Network dedicato
    driver: bridge
```

#### 5. Gestisci le porte

Se due progetti usano la stessa porta, avvia solo uno alla volta:

```bash
# Progetto A (usa porta 8000)
cd ~/progetto-a
docker compose up -d

# Per lavorare su Progetto B (usa anche porta 8000)
cd ~/progetto-a
docker compose down  # Ferma Progetto A
cd ~/progetto-b
docker compose up -d  # Avvia Progetto B
```

Oppure configura porte diverse:

```yaml
# Progetto A
ports:
  - "8000:8000"

# Progetto B
ports:
  - "8001:8000"  # Porta esterna diversa
```

### Verifica Docker Context

Colima crea un Docker context. Assicurati di usarlo:

```bash
# Verifica context attivo
docker context ls

# Se necessario, cambia a Colima
docker context use colima

# Verifica connessione
docker ps
```

### Quando Riavviare Colima

Riavvia Colima solo se:
- Docker non risponde (`docker ps` fallisce)
- Dopo sleep/ibernazione del Mac con problemi
- Dopo cambio VPN con problemi di rete
- Errori strani nei container

```bash
./scripts/restart_colima.sh
```

### Pulizia Periodica

Con più progetti, lo spazio disco si riempie. Pulisci regolarmente:

```bash
# Rimuovi container, network, immagini non usate
docker system prune -a

# Rimuovi anche i volumi (ATTENZIONE: cancella dati!)
docker system prune -a --volumes

# Verifica spazio usato
docker system df
```

### Monitoraggio Risorse

Controlla l'uso di risorse se hai molti container attivi:

```bash
# Risorse per container
docker stats

# Container attivi
docker ps

# Tutti i container (anche fermati)
docker ps -a
```

### Script di Progetto

Ogni progetto dovrebbe avere il suo script di avvio che:
1. Verifica che Docker sia disponibile
2. Avvia Colima se necessario
3. Imposta il context corretto
4. Avvia i container del progetto

Esempio: `scripts/start_services.sh` in questo progetto.

### Alternative a Colima

Se Colima continua a dare problemi, considera:

1. **OrbStack** (raccomandato)
   - Più stabile di Colima
   - Più veloce
   - UI migliore
   - `brew install orbstack`

2. **Docker Desktop**
   - Ufficiale ma più pesante
   - Richiede licenza per uso aziendale

3. **Podman Desktop**
   - Open source
   - Compatibile con Docker

### Troubleshooting Multi-Progetto

#### Container di progetti diversi in conflitto

```bash
# Lista tutti i container
docker ps -a

# Ferma container specifici
docker stop container-name

# Rimuovi container vecchi
docker container prune
```

#### Porte occupate da container di altri progetti

```bash
# Trova quale container usa la porta
docker ps --filter "publish=8000"

# Ferma quel container
docker stop container-id
```

#### Troppi container attivi

```bash
# Ferma tutti i container
docker stop $(docker ps -q)

# Riavvia solo quelli del progetto corrente
docker compose up -d
```

#### Spazio disco esaurito

```bash
# Verifica uso disco
docker system df

# Pulizia aggressiva
docker system prune -a --volumes

# Se serve, aumenta disco Colima
colima stop
colima start --cpu 4 --memory 6 --disk 150 --vm-type=vz
```

### Configurazione Shell (Opzionale)

Aggiungi al tuo `~/.zshrc` per avere sempre il context corretto:

```bash
# Auto-usa Colima context se disponibile
if command -v colima &> /dev/null; then
  if colima status &> /dev/null 2>&1; then
    docker context use colima &> /dev/null || true
  fi
fi
```

### Checklist Cambio Progetto

- [ ] Ferma container progetto precedente: `docker compose down`
- [ ] Vai nella directory nuovo progetto: `cd ~/nuovo-progetto`
- [ ] Verifica Docker: `docker ps`
- [ ] Avvia nuovo progetto: `./scripts/start_services.sh` o `docker compose up -d`

### Reset Pulito dello Stack (opzionale)

Se vuoi ripartire da zero con i volumi del progetto:

```bash
./scripts/reset_stack.sh
```

### Risorse Consigliate per Scenario

**Sviluppo leggero (1-2 progetti piccoli):**
- CPU: 2-4
- RAM: 4-6 GB
- Disk: 60 GB

**Sviluppo medio (2-3 progetti medi):**
- CPU: 4-6
- RAM: 6-8 GB
- Disk: 100 GB

**Sviluppo pesante (3+ progetti o progetti complessi):**
- CPU: 6-8
- RAM: 8-12 GB
- Disk: 150+ GB

### Comandi Utili

```bash
# Status Colima
colima status

# Lista profili Colima (se usi profili multipli)
colima list

# Info Docker
docker info

# Context attivo
docker context show

# Spazio usato
docker system df

# Container attivi
docker ps

# Tutti i container
docker ps -a

# Pulizia
docker system prune -a
```
