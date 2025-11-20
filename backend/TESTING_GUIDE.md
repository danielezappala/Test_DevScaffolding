# Guida Test Operativi API Inventario Vini

## 🚀 Avvio del Server

```bash
cd backend
# Lo script attiva il venv, libera la porta 8000 e avvia il server
./start_dev.sh
```

Il server sarà disponibile su: `http://localhost:8000`
*   **API Base URL**: `http://localhost:8000/api/v1`
*   **Documentazione**: `http://localhost:8000/api/docs`

> **Nota:** Lo script `./start_dev.sh` gestisce automaticamente la chiusura di eventuali processi che occupano la porta 8000.

---

## 📚 Documentazione Interattiva (Consigliato!)

FastAPI genera automaticamente una documentazione interattiva Swagger:

**Apri nel browser:** http://localhost:8000/api/docs

Qui puoi:
- ✅ Vedere tutti gli endpoint disponibili
- ✅ Testare le API direttamente dal browser
- ✅ Vedere gli schema request/response
- ✅ Eseguire chiamate senza scrivere curl

**Alternativa ReDoc:** http://localhost:8000/api/redoc

---

## 🧪 Test con curl

### Setup Variabili

```bash
# Base URL
export API_URL="http://localhost:8000/api/v1/inventory"

# Headers (l'autenticazione è mockdata nei test)
export HEADERS='-H "Content-Type: application/json"'
```

---

## 1️⃣ Test Base - Suppliers

### Creare un Fornitore

```bash
curl -X POST "$API_URL/suppliers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cantina Sociale di Alba",
    "contact_email": "info@cantinaalba.it",
    "phone": "+39 0173 123456",
    "address": "Via Roma 1, 12051 Alba (CN)",
    "vat_number": "IT12345678901",
    "notes": "Fornitore principale per Barolo e Barbaresco"
  }'
```

**Response attesa:**
```json
{
  "id": 1,
  "name": "Cantina Sociale di Alba",
  "contact_email": "info@cantinaalba.it",
  "phone": "+39 0173 123456",
  "address": "Via Roma 1, 12051 Alba (CN)",
  "vat_number": "IT12345678901",
  "notes": "Fornitore principale per Barolo e Barbaresco",
  "created_at": "2025-11-20T17:00:00Z",
  "updated_at": "2025-11-20T17:00:00Z"
}
```

### Listar Fornitori

```bash
curl "$API_URL/suppliers"
```

---

## 2️⃣ Test Wines - CRUD Completo

### Creare un Vino

```bash
# Salva l'ID del supplier dalla risposta precedente
SUPPLIER_ID=1

curl -X POST "$API_URL/wines" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Barolo DOCG Riserva",
    "vintage": 2018,
    "type": "red",
    "denomination": "DOCG",
    "price": 45.50,
    "quantity": 0,
    "threshold": 10,
    "barcode": "8001234567890",
    "supplier_id": 1,
    "notes": "Invecchiato 5 anni in botte"
  }'
```

**Response attesa:**
```json
{
  "id": 1,
  "name": "Barolo DOCG Riserva",
  "vintage": 2018,
  "type": "red",
  "denomination": "DOCG",
  "price": "45.50",
  "quantity": 0,
  "threshold": 10,
  "barcode": "8001234567890",
  "supplier_id": 1,
  "notes": "Invecchiato 5 anni in botte",
  "created_at": "2025-11-20T17:01:00Z",
  "updated_at": "2025-11-20T17:01:00Z"
}
```

### Creare Altri Vini per Test

```bash
# Vino 2 - Bianco
curl -X POST "$API_URL/wines" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gavi DOCG",
    "vintage": 2022,
    "type": "white",
    "denomination": "DOCG",
    "price": 18.00,
    "quantity": 0,
    "threshold": 15,
    "supplier_id": 1
  }'

# Vino 3 - Rosato
curl -X POST "$API_URL/wines" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chiaretto DOC",
    "vintage": 2023,
    "type": "rose",
    "denomination": "DOC",
    "price": 12.50,
    "quantity": 0,
    "threshold": 20
  }'
```

### Listar Tutti i Vini

```bash
curl "$API_URL/wines"
```

### Listar Vini con Filtri

```bash
# Solo vini rossi
curl "$API_URL/wines?type=red"

# Solo vini DOCG
curl "$API_URL/wines?denomination=DOCG"

# Vini del 2022
curl "$API_URL/wines?vintage=2022"

# Vini di un fornitore specifico
curl "$API_URL/wines?supplier_id=1"

# Solo vini disponibili (quantity > 0)
curl "$API_URL/wines?available_only=true"

# Solo vini sotto soglia
curl "$API_URL/wines?below_threshold=true"

# Ricerca testuale
curl "$API_URL/wines?search=Barolo"

# Combinazione filtri
curl "$API_URL/wines?type=red&denomination=DOCG&vintage=2018"

# Con paginazione
curl "$API_URL/wines?skip=0&limit=10"
```

### Dettaglio Vino per ID

```bash
WINE_ID=1
curl "$API_URL/wines/$WINE_ID"
```

### Lookup per Barcode

```bash
curl "$API_URL/barcode/8001234567890"
```

---

## 3️⃣ Test Movements - Gestione Stock

### Movimento IN (Carico)

```bash
WINE_ID=1

curl -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d '{
    "wine_id": 1,
    "type": "in",
    "quantity": 24,
    "note": "Consegna settimanale",
    "reference": "ORD-2024-001"
  }'
```

**Response attesa:**
```json
{
  "id": 1,
  "wine_id": 1,
  "lot_id": 1,
  "type": "in",
  "quantity": 24,
  "timestamp": "2025-11-20T17:05:00Z",
  "note": "Consegna settimanale",
  "reference": "ORD-2024-001",
  "user_id": 1,
  "wine_name": "Barolo DOCG Riserva",
  "wine_vintage": 2018
}
```

**Nota:** Il lotto viene creato automaticamente!

### Verificare Stock Aggiornato

```bash
curl "$API_URL/wines/1"
# quantity dovrebbe essere 24
```

### Movimento OUT (Scarico)

```bash
# Scarico automatico FIFO (usa lotto più vecchio)
curl -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d '{
    "wine_id": 1,
    "type": "out",
    "quantity": 6,
    "note": "Vendita al ristorante"
  }'
```

**Response attesa:**
```json
{
  "id": 2,
  "wine_id": 1,
  "lot_id": 1,
  "type": "out",
  "quantity": 6,
  "timestamp": "2025-11-20T17:06:00Z",
  "note": "Vendita al ristorante",
  "reference": null,
  "user_id": 1,
  "wine_name": "Barolo DOCG Riserva",
  "wine_vintage": 2018
}
```

### Verificare Stock Aggiornato

```bash
curl "$API_URL/wines/1"
# quantity dovrebbe essere 18 (24 - 6)
```

### Movimento OUT da Lotto Specifico

```bash
# Prima ottieni l'ID del lotto
LOT_ID=1

curl -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d '{
    "wine_id": 1,
    "type": "out",
    "quantity": 3,
    "lot_id": 1,
    "note": "Vendita da lotto specifico"
  }'
```

### Test FIFO Multi-Lotto

```bash
# Crea secondo lotto (nuovo carico)
curl -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d '{
    "wine_id": 1,
    "type": "in",
    "quantity": 12,
    "note": "Seconda consegna"
  }'

# Ora abbiamo 2 lotti
# Lotto 1: 15 bottiglie (18 - 3)
# Lotto 2: 12 bottiglie
# Totale: 27 bottiglie

# Scarico 20 bottiglie (userà FIFO: prima lotto 1, poi lotto 2)
curl -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d '{
    "wine_id": 1,
    "type": "out",
    "quantity": 20,
    "note": "Grande ordine - usa FIFO"
  }'

# Risultato atteso:
# Lotto 1: 0 bottiglie (scaricato tutto)
# Lotto 2: 7 bottiglie (12 - 5)
# Totale: 7 bottiglie
```

### Movimento ADJUST (Solo Admin)

```bash
curl -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d '{
    "wine_id": 1,
    "type": "adjust",
    "quantity": 3,
    "note": "Correzione inventario - bottiglie trovate in magazzino"
  }'
```

### Listar Movimenti

```bash
# Tutti i movimenti
curl "$API_URL/movements"

# Movimenti di un vino specifico
curl "$API_URL/movements?wine_id=1"

# Solo movimenti IN
curl "$API_URL/movements?type=in"

# Solo movimenti OUT
curl "$API_URL/movements?type=out"

# Con paginazione
curl "$API_URL/movements?skip=0&limit=10"
```

---

## 4️⃣ Test Stock Critico

### Preparare Dati per Test

```bash
# Crea vino con stock critico (quantity = 0)
curl -X POST "$API_URL/wines" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vino Esaurito",
    "vintage": 2020,
    "type": "red",
    "price": 25.00,
    "quantity": 0,
    "threshold": 10
  }'

# Crea vino con stock warning (quantity < threshold)
curl -X POST "$API_URL/wines" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vino Sotto Soglia",
    "vintage": 2021,
    "type": "white",
    "price": 20.00,
    "quantity": 5,
    "threshold": 15
  }'

# Crea vino con stock OK
curl -X POST "$API_URL/wines" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vino OK",
    "vintage": 2022,
    "type": "rose",
    "price": 15.00,
    "quantity": 30,
    "threshold": 10
  }'
```

### Ottenere Lista Stock Critici

```bash
# Tutti i vini critici (critical + warning)
curl "$API_URL/critical"
```

**Response attesa:**
```json
[
  {
    "id": 4,
    "name": "Vino Esaurito",
    "vintage": 2020,
    "quantity": 0,
    "threshold": 10,
    "severity": "critical",
    "supplier": null
  },
  {
    "id": 5,
    "name": "Vino Sotto Soglia",
    "vintage": 2021,
    "quantity": 5,
    "threshold": 15,
    "severity": "warning",
    "supplier": null
  }
]
```

### Filtrare per Severity

```bash
# Solo vini esauriti (critical)
curl "$API_URL/critical?severity=critical"

# Solo vini sotto soglia (warning)
curl "$API_URL/critical?severity=warning"
```

---

## 5️⃣ Test Validazioni ed Errori

### Barcode Duplicato (400)

```bash
curl -X POST "$API_URL/wines" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vino Duplicato",
    "vintage": 2020,
    "price": 20.00,
    "barcode": "8001234567890"
  }'
```

**Response attesa:**
```json
{
  "detail": "Barcode already exists"
}
```

### Supplier Non Esistente (404)

```bash
curl -X POST "$API_URL/wines" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vino Senza Fornitore",
    "vintage": 2020,
    "price": 20.00,
    "supplier_id": 99999
  }'
```

**Response attesa:**
```json
{
  "detail": "Supplier not found"
}
```

### Stock Insufficiente (400)

```bash
# Prova a scaricare più di quanto disponibile
curl -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d '{
    "wine_id": 1,
    "type": "out",
    "quantity": 1000
  }'
```

**Response attesa:**
```json
{
  "detail": "Insufficient stock. Available: 10, requested: 1000"
}
```

### Vino Non Trovato (404)

```bash
curl "$API_URL/wines/99999"
```

**Response attesa:**
```json
{
  "detail": "Wine not found"
}
```

---

## 6️⃣ Scenario Completo - Flusso Reale

### Scenario: Gestione Completa di un Vino

```bash
# 1. Crea fornitore
SUPPLIER=$(curl -s -X POST "$API_URL/suppliers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tenuta Esempio",
    "contact_email": "info@tenutaesempio.it"
  }')

SUPPLIER_ID=$(echo $SUPPLIER | jq -r '.id')
echo "Supplier ID: $SUPPLIER_ID"

# 2. Crea vino
WINE=$(curl -s -X POST "$API_URL/wines" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Nebbiolo d'Alba DOC\",
    \"vintage\": 2020,
    \"type\": \"red\",
    \"denomination\": \"DOC\",
    \"price\": 28.50,
    \"threshold\": 12,
    \"supplier_id\": $SUPPLIER_ID
  }")

WINE_ID=$(echo $WINE | jq -r '.id')
echo "Wine ID: $WINE_ID"

# 3. Primo carico (24 bottiglie)
curl -s -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d "{
    \"wine_id\": $WINE_ID,
    \"type\": \"in\",
    \"quantity\": 24,
    \"note\": \"Primo carico\",
    \"reference\": \"ORD-001\"
  }" | jq

# 4. Verifica stock
curl -s "$API_URL/wines/$WINE_ID" | jq '.quantity'
# Output: 24

# 5. Vendita (6 bottiglie)
curl -s -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d "{
    \"wine_id\": $WINE_ID,
    \"type\": \"out\",
    \"quantity\": 6,
    \"note\": \"Vendita ristorante\"
  }" | jq

# 6. Verifica stock
curl -s "$API_URL/wines/$WINE_ID" | jq '.quantity'
# Output: 18

# 7. Secondo carico (12 bottiglie)
curl -s -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d "{
    \"wine_id\": $WINE_ID,
    \"type\": \"in\",
    \"quantity\": 12,
    \"note\": \"Secondo carico\"
  }" | jq

# 8. Verifica stock
curl -s "$API_URL/wines/$WINE_ID" | jq '.quantity'
# Output: 30

# 9. Grande vendita (25 bottiglie - usa FIFO)
curl -s -X POST "$API_URL/movements" \
  -H "Content-Type: application/json" \
  -d "{
    \"wine_id\": $WINE_ID,
    \"type\": \"out\",
    \"quantity\": 25,
    \"note\": \"Grande ordine\"
  }" | jq

# 10. Verifica stock finale
curl -s "$API_URL/wines/$WINE_ID" | jq '.quantity'
# Output: 5 (sotto soglia di 12!)

# 11. Verifica che appare nei critici
curl -s "$API_URL/critical" | jq
# Dovrebbe includere questo vino con severity: "warning"

# 12. Storico movimenti del vino
curl -s "$API_URL/movements?wine_id=$WINE_ID" | jq
```

---

## 🔧 Utility Scripts

### Script per Reset Database (Test)

Crea file `reset_db.sh`:

```bash
#!/bin/bash
# Reset database per test

cd backend
source venv/bin/activate

# Stop server se in esecuzione
pkill -f "uvicorn app.main:app"

# Rimuovi database SQLite (se usi SQLite per dev)
rm -f test.db

# Riavvia server
uvicorn app.main:app --reload &

echo "Database reset completato!"
```

### Script per Popolare Dati di Test

Crea file `populate_test_data.sh`:

```bash
#!/bin/bash
# Popola database con dati di test

API_URL="http://localhost:8000/api/v1/inventory"

echo "🌱 Popolamento database di test..."

# Crea fornitori
echo "📦 Creando fornitori..."
curl -s -X POST "$API_URL/suppliers" -H "Content-Type: application/json" \
  -d '{"name": "Cantina Alba", "contact_email": "info@alba.it"}' > /dev/null

curl -s -X POST "$API_URL/suppliers" -H "Content-Type: application/json" \
  -d '{"name": "Tenuta Montalcino", "contact_email": "info@montalcino.it"}' > /dev/null

# Crea vini
echo "🍷 Creando vini..."
curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{"name": "Barolo DOCG", "vintage": 2018, "type": "red", "denomination": "DOCG", "price": 45.00, "threshold": 10, "supplier_id": 1}' > /dev/null

curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{"name": "Brunello DOCG", "vintage": 2017, "type": "red", "denomination": "DOCG", "price": 55.00, "threshold": 8, "supplier_id": 2}' > /dev/null

curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{"name": "Gavi DOCG", "vintage": 2022, "type": "white", "denomination": "DOCG", "price": 18.00, "threshold": 15, "supplier_id": 1}' > /dev/null

# Crea movimenti
echo "📊 Creando movimenti..."
curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 1, "type": "in", "quantity": 24, "note": "Carico iniziale"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 2, "type": "in", "quantity": 12, "note": "Carico iniziale"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 3, "type": "in", "quantity": 36, "note": "Carico iniziale"}' > /dev/null

echo "✅ Database popolato con successo!"
echo ""
echo "📊 Statistiche:"
curl -s "$API_URL/wines" | jq 'length' | xargs echo "Vini creati:"
curl -s "$API_URL/suppliers" | jq 'length' | xargs echo "Fornitori creati:"
curl -s "$API_URL/movements" | jq 'length' | xargs echo "Movimenti creati:"
```

Rendi eseguibili:
```bash
chmod +x reset_db.sh populate_test_data.sh
```

---

## 📝 Tips & Tricks

### Formattare Output JSON con jq

```bash
# Installa jq se non presente
brew install jq  # macOS
# oppure
sudo apt-get install jq  # Linux

# Usa con curl
curl "$API_URL/wines" | jq

# Filtra campi specifici
curl "$API_URL/wines" | jq '.[].name'

# Conta risultati
curl "$API_URL/wines" | jq 'length'
```

### Salvare Response in File

```bash
curl "$API_URL/wines" > wines.json
curl "$API_URL/movements" > movements.json
```

### Testare Performance

```bash
# Tempo di risposta
time curl "$API_URL/wines"

# Con dettagli timing
curl -w "@curl-format.txt" -o /dev/null -s "$API_URL/wines"
```

Crea `curl-format.txt`:
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

---

## ✅ Checklist Test Completi

- [ ] ✅ Server avviato e raggiungibile
- [ ] ✅ Swagger UI accessibile (http://localhost:8000/api/docs)
- [ ] ✅ Creare fornitore
- [ ] ✅ Listar fornitori
- [ ] ✅ Creare vino
- [ ] ✅ Listar vini
- [ ] ✅ Filtrare vini (type, vintage, denomination)
- [ ] ✅ Dettaglio vino per ID
- [ ] ✅ Lookup barcode
- [ ] ✅ Movimento IN (carico)
- [ ] ✅ Verificare stock incrementato
- [ ] ✅ Movimento OUT (scarico)
- [ ] ✅ Verificare stock decrementato
- [ ] ✅ Test FIFO multi-lotto
- [ ] ✅ Movimento ADJUST
- [ ] ✅ Listar movimenti
- [ ] ✅ Filtrare movimenti
- [ ] ✅ Stock critico
- [ ] ✅ Filtrare per severity
- [ ] ✅ Test errori (barcode duplicato, stock insufficiente)

---

**Buon testing! 🚀**

Per qualsiasi problema, controlla i log del server o usa Swagger UI per un'esperienza più user-friendly.
