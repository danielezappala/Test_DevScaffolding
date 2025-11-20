# Quick Test Commands - API Inventario Vini

## Setup
```bash
export API_URL="http://localhost:8000/api/v1/inventory"
```

## Quick Tests

### 1. Health Check
```bash
curl http://localhost:8000/api/health
```

### 2. Create Supplier
```bash
curl -X POST "$API_URL/suppliers" -H "Content-Type: application/json" \
  -d '{"name": "Test Supplier", "contact_email": "test@example.com"}'
```

### 3. Create Wine
```bash
curl -X POST "$API_URL/wines" -H "Content-Type: application/json" \
  -d '{"name": "Test Wine", "vintage": 2020, "price": 20.00, "supplier_id": 1}'
```

### 4. List Wines
```bash
curl "$API_URL/wines" | jq
```

### 5. Stock IN
```bash
curl -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 1, "type": "in", "quantity": 24}'
```

### 6. Stock OUT
```bash
curl -X POST "$API_URL/movements" -H "Content-Type: application/json" \
  -d '{"wine_id": 1, "type": "out", "quantity": 6}'
```

### 7. Critical Stock
```bash
curl "$API_URL/critical" | jq
```

### 8. Search
```bash
curl "$API_URL/wines?search=Barolo" | jq
```

### 9. Filter by Type
```bash
curl "$API_URL/wines?type=red" | jq
```

### 10. Barcode Lookup
```bash
curl "$API_URL/barcode/8001234567890" | jq
```

## Populate Test Data
```bash
./populate_test_data.sh
```

## Open Swagger UI
```bash
open http://localhost:8000/api/docs
```
