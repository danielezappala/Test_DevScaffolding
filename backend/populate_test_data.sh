#!/bin/bash
# Popola database con dati di test per API Inventario Vini

API_URL="http://localhost/inventory/api/v1/inventory"

echo "🌱 Popolamento database di test..."
echo ""

# Crea fornitori
echo "📦 Creando fornitori..."
SUPPLIER1=$(curl -s -X POST "$API_URL/suppliers" -H "Content-Type: application/json" \
  -d '{
    "name": "Cantina Sociale di Alba",
    "contact_email": "info@cantinaalba.it",
    "phone": "+39 0173 123456",
    "address": "Via Roma 1, 12051 Alba (CN)",
    "vat_number": "IT12345678901"
  }')

SUPPLIER2=$(curl -s -X POST "$API_URL/suppliers" -H "Content-Type: application/json" \
  -d '{
    "name": "Tenuta di Montalcino",
    "contact_email": "info@montalcino.it",
    "phone": "+39 0577 654321",
    "address": "Località Montalcino, 53024 Montalcino (SI)",
    "vat_number": "IT98765432109"
  }')

SUPPLIER3=$(curl -s -X POST "$API_URL/suppliers" -H "Content-Type: application/json" \
  -d '{
    "name": "Azienda Vinicola Gavi",
    "contact_email": "info@gavi.it"
  }')

echo "✅ Creati 3 fornitori"

# Crea vini
echo ""
echo "🍷 Creando vini..."

# Vini rossi
curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{
    "name": "Barolo DOCG Riserva",
    "vintage": 2018,
    "type": "red",
    "denomination": "DOCG",
    "price": 45.50,
    "threshold": 10,
    "barcode": "8001234567890",
    "supplier_id": 1,
    "notes": "Invecchiato 5 anni in botte"
  }' > /dev/null

curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{
    "name": "Brunello di Montalcino DOCG",
    "vintage": 2017,
    "type": "red",
    "denomination": "DOCG",
    "price": 55.00,
    "threshold": 8,
    "supplier_id": 2
  }' > /dev/null

curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{
    "name": "Barbaresco DOCG",
    "vintage": 2019,
    "type": "red",
    "denomination": "DOCG",
    "price": 42.00,
    "threshold": 12,
    "supplier_id": 1
  }' > /dev/null

# Vini bianchi
curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{
    "name": "Gavi DOCG",
    "vintage": 2022,
    "type": "white",
    "denomination": "DOCG",
    "price": 18.00,
    "threshold": 15,
    "supplier_id": 3
  }' > /dev/null

curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{
    "name": "Vermentino di Gallura DOCG",
    "vintage": 2023,
    "type": "white",
    "denomination": "DOCG",
    "price": 16.50,
    "threshold": 20
  }' > /dev/null

# Vini rosati e spumanti
curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{
    "name": "Chiaretto DOC",
    "vintage": 2023,
    "type": "rose",
    "denomination": "DOC",
    "price": 12.50,
    "threshold": 18
  }' > /dev/null

curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{
    "name": "Franciacorta DOCG Brut",
    "vintage": 2020,
    "type": "sparkling",
    "denomination": "DOCG",
    "price": 28.00,
    "threshold": 10
  }' > /dev/null

echo "✅ Creati 7 vini"

# Crea movimenti
echo ""
echo "📊 Creando movimenti di stock..."

# Carichi iniziali
curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 1, "type": "in", "quantity": 24, "note": "Carico iniziale", "reference": "ORD-2024-001"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 2, "type": "in", "quantity": 12, "note": "Carico iniziale", "reference": "ORD-2024-002"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 3, "type": "in", "quantity": 18, "note": "Carico iniziale"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 4, "type": "in", "quantity": 36, "note": "Carico iniziale"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 5, "type": "in", "quantity": 48, "note": "Carico iniziale"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 6, "type": "in", "quantity": 30, "note": "Carico iniziale"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 7, "type": "in", "quantity": 15, "note": "Carico iniziale"}' > /dev/null

# Alcuni scarichi per simulare vendite
curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 1, "type": "out", "quantity": 6, "note": "Vendita ristorante"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 4, "type": "out", "quantity": 12, "note": "Vendita enoteca"}' > /dev/null

curl -s -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 5, "type": "out", "quantity": 24, "note": "Grande ordine"}' > /dev/null

# Crea un vino sotto soglia per test critical
curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{
    "name": "Vino Sotto Soglia",
    "vintage": 2021,
    "type": "red",
    "price": 20.00,
    "quantity": 3,
    "threshold": 15
  }' > /dev/null

# Crea un vino esaurito per test critical
curl -s -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{
    "name": "Vino Esaurito",
    "vintage": 2020,
    "type": "white",
    "price": 25.00,
    "quantity": 0,
    "threshold": 10
  }' > /dev/null

echo "✅ Creati 10 movimenti"

echo ""
echo "🎉 Database popolato con successo!"
echo ""
echo "📊 Statistiche finali:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Conta elementi
WINES_COUNT=$(curl -s "$API_URL/wines" | jq 'length')
SUPPLIERS_COUNT=$(curl -s "$API_URL/suppliers" | jq 'length')
MOVEMENTS_COUNT=$(curl -s "$API_URL/movements" | jq 'length')
CRITICAL_COUNT=$(curl -s "$API_URL/critical" | jq 'length')

echo "🍷 Vini totali:        $WINES_COUNT"
echo "📦 Fornitori totali:   $SUPPLIERS_COUNT"
echo "📊 Movimenti totali:   $MOVEMENTS_COUNT"
echo "⚠️  Stock critici:      $CRITICAL_COUNT"
echo ""
echo "✅ Pronto per i test!"
echo ""
echo "💡 Suggerimenti:"
echo "  - Apri Swagger UI: http://localhost/inventory/api/docs"
echo "  - Vedi stock critici: curl http://localhost/inventory/api/v1/inventory/critical | jq"
echo "  - Lista vini: curl http://localhost/inventory/api/v1/inventory/wines | jq"
