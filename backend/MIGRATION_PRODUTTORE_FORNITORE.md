# Migrazione: Separazione Produttore e Fornitore

## Modifiche Implementate

### 1. Database

#### Tabella `suppliers` → `companies`
- Rinominata la tabella `suppliers` in `companies` per gestire sia Produttori che Fornitori/Distributori
- L'anagrafica è unificata: la stessa azienda può essere sia Produttore che Fornitore
- **Nuovo campo**: `category` (Enum: PRODUCER, DISTRIBUTOR, BOTH) - Categoria dell'azienda

#### Tabella `wines`
- **Nuovo campo**: `producer_id` (Integer, FK a `companies.id`) - Chi produce il vino
- **Campo esistente**: `supplier_id` (Integer, FK a `companies.id`) - Da chi si acquista (distributore)
- I due campi possono coincidere quando si acquista direttamente dal produttore

### 2. Modelli Python

#### `Company` (ex `Supplier`)
```python
class CompanyCategory(str, enum.Enum):
    PRODUCER = "PRODUCER"  # Produttore
    DISTRIBUTOR = "DISTRIBUTOR"  # Distributore/Fornitore
    BOTH = "BOTH"  # Sia Produttore che Distributore

class Company(Base):
    """Anagrafica unificata per Produttori e Fornitori/Distributori"""
    __tablename__ = "companies"
    
    category = Column(Enum(CompanyCategory), nullable=False, default=CompanyCategory.BOTH)
    
    # Relationships
    wines_as_producer = relationship("Wine", foreign_keys="Wine.producer_id")
    wines_as_supplier = relationship("Wine", foreign_keys="Wine.supplier_id")

# Alias per retrocompatibilità
Supplier = Company
```

#### `Wine`
```python
class Wine(Base):
    producer_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    
    producer = relationship("Company", foreign_keys=[producer_id])
    supplier = relationship("Company", foreign_keys=[supplier_id])
```

### 3. Schemi Pydantic

- `CompanyCategory` - Enum per categoria azienda (PRODUCER, DISTRIBUTOR, BOTH)
- `CompanyBase`, `CompanyCreate`, `CompanyUpdate`, `CompanyRead` - Nuovi schemi con campo `category`
- Alias per retrocompatibilità: `SupplierBase = CompanyBase`, ecc.
- `WineBase`, `WineCreate`, `WineUpdate` - Aggiunto campo `producer_id`
- `WineReadWithSupplier` - Ora include sia `producer` che `supplier`
- `WineCriticalStock` - Ora include sia `producer` che `supplier`

### 4. API Endpoints

#### Nuovi endpoint
- `POST /api/v1/inventory/companies` - Crea azienda
- `GET /api/v1/inventory/companies` - Lista aziende
- `PATCH /api/v1/inventory/companies/{id}` - Aggiorna azienda

#### Endpoint esistenti (retrocompatibilità)
- `POST /api/v1/inventory/suppliers` - Alias per companies
- `GET /api/v1/inventory/suppliers` - Alias per companies
- `PATCH /api/v1/inventory/suppliers/{id}` - Alias per companies

### 5. Migrations

#### `002_add_producer_to_wines.py`
- Rinomina tabella `suppliers` → `companies`
- Rinomina indici
- Aggiunge campo `producer_id` a `wines`
- Aggiorna foreign keys

#### `003_migrate_supplier_to_producer.py`
- Copia i valori esistenti da `supplier_id` a `producer_id`
- Assume che il fornitore attuale sia anche il produttore per i dati esistenti

#### `004_add_category_to_companies.py`
- Aggiunge campo `category` alla tabella `companies`
- Crea enum type `CompanyCategory` (PRODUCER, DISTRIBUTOR, BOTH)
- Default: BOTH (sia produttore che distributore)

## Come Applicare le Modifiche

### 1. Eseguire le migrations

```bash
cd backend
alembic upgrade head
```

### 2. Verificare i dati

```sql
-- Verifica che le aziende siano state migrate
SELECT * FROM companies LIMIT 10;

-- Verifica che i vini abbiano producer_id popolato
SELECT id, name, producer_id, supplier_id FROM wines LIMIT 10;
```

## Uso nell'Applicazione

### Creare un'azienda (Produttore/Fornitore)

```python
# Nuovo endpoint - Produttore
POST /api/v1/inventory/companies
{
    "name": "Cantina Sociale",
    "category": "PRODUCER",
    "contact_email": "info@cantina.it",
    "vat_number": "IT12345678901"
}

# Distributore
POST /api/v1/inventory/companies
{
    "name": "Vini & Distribuzione SRL",
    "category": "DISTRIBUTOR",
    "contact_email": "ordini@vinidist.it"
}

# Sia Produttore che Distributore (default)
POST /api/v1/inventory/companies
{
    "name": "Azienda Vinicola",
    "category": "BOTH",  # oppure ometti per usare il default
    "contact_email": "info@azienda.it"
}

# Vecchio endpoint (ancora funzionante, usa default BOTH)
POST /api/v1/inventory/suppliers
{...}
```

### Creare un vino con Produttore e Fornitore

```python
POST /api/v1/inventory/wines
{
    "name": "Barolo DOCG",
    "vintage": 2020,
    "price": 45.00,
    "producer_id": 1,    # Chi produce il vino
    "supplier_id": 2,    # Da chi si acquista
    ...
}

# Se si acquista direttamente dal produttore
{
    "name": "Barolo DOCG",
    "vintage": 2020,
    "price": 45.00,
    "producer_id": 1,
    "supplier_id": 1,    # Stesso ID del produttore
    ...
}
```

### Filtrare vini per Produttore o Fornitore

```python
# Per fornitore (esistente)
GET /api/v1/inventory/wines?supplier_id=1

# Per produttore (da implementare se necessario)
GET /api/v1/inventory/wines?producer_id=1
```

### Filtrare aziende per categoria

```python
# Tutte le aziende
GET /api/v1/inventory/companies

# Solo produttori (da implementare se necessario)
GET /api/v1/inventory/companies?category=PRODUCER

# Solo distributori (da implementare se necessario)
GET /api/v1/inventory/companies?category=DISTRIBUTOR
```

## Retrocompatibilità

- Gli endpoint `/suppliers` continuano a funzionare come alias di `/companies`
- Il modello `Supplier` è un alias di `Company`
- Gli schemi `Supplier*` sono alias di `Company*`
- Il codice esistente continua a funzionare senza modifiche

## Note

- L'anagrafica è unificata: un'unica tabella `companies` per Produttori e Fornitori
- Il campo `category` indica se l'azienda è:
  - `PRODUCER`: Solo produttore
  - `DISTRIBUTOR`: Solo distributore/fornitore
  - `BOTH`: Sia produttore che distributore (default)
- La distinzione a livello di vino avviene tramite `producer_id` vs `supplier_id`
- Un'azienda può essere sia Produttore che Fornitore per vini diversi
- Un'azienda può essere sia Produttore che Fornitore dello stesso vino (acquisto diretto)
- Il campo `category` è informativo e non vincola l'uso dell'azienda come producer o supplier nei vini
