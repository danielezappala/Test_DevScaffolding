# Panoramica Informale del Progetto

Questa guida spiega in modo discorsivo come e perche' e' strutturato il progetto, cosa offre e come scorre lo sviluppo fino alla CI.

## Architettura in breve

Pensa allo stack come a una piccola "citta'":
- **Traefik** e' il "vigile urbano": riceve le richieste in HTTPS e decide dove mandarle.
- **Frontend (Next.js)** e' la vetrina: serve le pagine e parla con il backend.
- **Backend (FastAPI)** e' l'officina: espone le API e gestisce la logica.
- **PostgreSQL + PgBouncer** sono il magazzino: dati e connessioni ottimizzate.
- **Redis** e' il taccuino veloce: sessioni e dati temporanei.
- **Prometheus** tiene d'occhio la salute.

Se usi la modalita' "subpath", tutto vive sotto `/inventory`:
- Frontend: `https://test.example.com/inventory`
- API: `https://test.example.com/inventory/api/v1`

In locale puoi lavorare:
- **Diretto**: backend su `http://localhost:8000`, frontend su `http://localhost:3000`
- **Via Traefik**: `http://localhost/inventory`

## Funzionalita' principali

- **Backend FastAPI** con routing versionato e OpenAPI automatico.
- **Frontend Next.js** con App Router, UI moderna e build standalone.
- **Autenticazione session-based** con Redis.
- **Observability**: metriche Prometheus e logging JSON.
- **Infra pronta per produzione**: Traefik + HTTPS automatico.
- **Test e quality gates**: pytest per backend, Vitest per frontend.

## Pipeline di sviluppo (come gira il lavoro)

### 1) Dev quotidiano

Di solito si lavora cosi':
- Avvii stack Docker: `make up`
- Oppure sviluppo locale separato:
  - Backend: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
  - Frontend: `npm run dev`

Quando serve, fai migrazioni con `make migrate`.
Se vuoi partire rapido con lo stack completo e le porte libere, c'e' `./scripts/start_services.sh`.

### 2) QA locale

Prima di pushare, conviene lanciare:
- Backend: `ruff check .`, `mypy .`, `pytest`
- Frontend: `npm run lint`, `npm run type-check`, `npm test`

### 3) CI automatica

In GitHub Actions partono in parallelo:
- Lint e type-check backend
- Test backend con coverage
- Lint e type-check frontend
- Test frontend
- Build immagini Docker
- Integration tests

Se qualcosa fallisce, la CI ti dice cosa lanciare localmente per riprodurre.

### Script utili gia' pronti

- `./scripts/build_and_push_images.sh`: build e push immagini (se configurato il registry).
- `./scripts/release.sh`: crea una release (aggiorna versione e tag).
- `./scripts/backup-db.sh`: backup del database.
- `./scripts/restart_colima.sh` e `./scripts/fix_colima.sh`: helper per Colima.

### Script aggiuntivi per la pipeline

Questi coprono parti della pipeline di sviluppo che non erano automatizzate:
- `./scripts/bootstrap_dev.sh`: prepara venv, dipendenze frontend e `.env`.
- `./scripts/check_all.sh`: lancia lint + type-check + test per backend e frontend.
- `./scripts/verify_subpath.sh`: verifica routing `/inventory` con curl e Traefik.
- `./scripts/seed_dev_data.sh`: popola il database con dati di demo.
- `./scripts/reset_stack.sh`: stop servizi e pulizia mirata dei volumi del progetto.
- `./scripts/release_preflight.sh`: controlli pre-release (versione, changelog, git pulito).

### Legenda (pipeline di sviluppo)

- **Bootstrap**: setup iniziale ambiente locale e variabili.
- **Dev loop**: avvio stack, hot reload, migrazioni.
- **Quality gate**: lint, type-check, test prima del push.
- **Release**: build, tag, push immagini.
- **Ops**: backup, restore, troubleshooting ambiente.

## In due parole

L'architettura punta a essere solida ma semplice: un backend pulito, un frontend moderno, un'infrastruttura affidabile e una pipeline che evita regressioni.
