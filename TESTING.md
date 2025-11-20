# 📚 Guide di Test - API Inventario Vini

Questa directory contiene le guide per testare le API del sistema di gestione inventario vini.

## 📄 File Disponibili

### Guide Principali

1. **[TESTING_GUIDE.md](./backend/TESTING_GUIDE.md)** 📖
   - Guida completa per testare le API
   - Comandi curl per tutti gli endpoint
   - Esempi di scenari reali
   - Tips & tricks per debugging

2. **[QUICK_TEST.md](./backend/QUICK_TEST.md)** ⚡
   - Quick reference con comandi più usati
   - Perfetto per test rapidi

### Script Utility

3. **[populate_test_data.sh](./backend/populate_test_data.sh)** 🌱
   - Script per popolare il database con dati di test
   - Crea fornitori, vini e movimenti di esempio
   - Eseguibile: `./backend/populate_test_data.sh`

4. **[curl-format.txt](./backend/curl-format.txt)** ⏱️
   - Template per misurare performance delle API
   - Uso: `curl -w "@backend/curl-format.txt" -o /dev/null -s URL`

## 🚀 Quick Start

### Opzione 1: Swagger UI (Consigliato per Principianti)

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Poi apri nel browser: **http://localhost:8000/api/docs**

### Opzione 2: curl (Per Utenti Avanzati)

```bash
cd backend

# Avvia server
source venv/bin/activate
uvicorn app.main:app --reload &

# In un altro terminale
cd backend
./populate_test_data.sh

# Testa API
curl http://localhost:8000/api/v1/inventory/wines | jq
```

## 📊 Cosa Puoi Testare

- ✅ **Suppliers** - Gestione fornitori
- ✅ **Wines** - CRUD vini con 7 filtri avanzati
- ✅ **Movements** - Carichi/scarichi con gestione lotti FIFO
- ✅ **Critical Stock** - Alert per stock sotto soglia
- ✅ **Barcode Lookup** - Ricerca rapida per barcode

## 📖 Documentazione Completa

Per la guida completa, apri: **[backend/TESTING_GUIDE.md](./backend/TESTING_GUIDE.md)**

## 🎯 Test Rapidi

```bash
# Health check
curl http://localhost:8000/api/health

# Lista vini
curl http://localhost:8000/api/v1/inventory/wines | jq

# Stock critici
curl http://localhost:8000/api/v1/inventory/critical | jq

# Ricerca
curl "http://localhost:8000/api/v1/inventory/wines?search=Barolo" | jq
```

## 🆘 Problemi?

1. **Server non parte?**
   - Verifica che il venv sia attivato: `source backend/venv/bin/activate`
   - Verifica porta 8000 libera: `lsof -i :8000`

2. **jq non installato?**
   - macOS: `brew install jq`
   - Linux: `sudo apt-get install jq`

3. **Errori 404?**
   - Verifica URL: `http://localhost:8000/api/v1/inventory/...`
   - Controlla che il server sia avviato

## 📁 Struttura File

```
backend/
├── TESTING_GUIDE.md          # Guida completa
├── QUICK_TEST.md             # Quick reference
├── populate_test_data.sh     # Script popolamento DB
├── curl-format.txt           # Template timing
└── app/
    └── main.py               # Server FastAPI
```

---

**Buon testing! 🚀**

Per domande o problemi, consulta la [guida completa](./backend/TESTING_GUIDE.md).
