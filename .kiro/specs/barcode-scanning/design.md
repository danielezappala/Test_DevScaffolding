# Design Document - Barcode Scanning System

## Overview

Il sistema di scansione barcode estende l'applicazione esistente di gestione enoteca con funzionalità di lettura barcode per velocizzare le operazioni di carico/scarico. Il design privilegia la semplicità d'uso e la compatibilità con dispositivi diversi (desktop con scanner USB, tablet, smartphone con camera).

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Desktop    │  │   Tablet     │  │  Mobile   │ │
│  │ (Scanner USB)│  │ (Camera/BT)  │  │ (Camera)  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         │                  │                │        │
│         └──────────────────┴────────────────┘        │
│                          │                           │
│              Next.js PWA (Responsive)                │
│         ┌────────────────────────────────┐           │
│         │  BarcodeScanner Component      │           │
│         │  - Hardware Input Handler      │           │
│         │  - Camera Scanner (QuaggaJS)   │           │
│         │  - Device Detection            │           │
│         └────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
                          │
                    HTTPS/REST API
                          │
┌─────────────────────────────────────────────────────┐
│                   SERVER LAYER                       │
│                  FastAPI Backend                     │
│  ┌────────────────────────────────────────────────┐ │
│  │  Barcode Endpoints                             │ │
│  │  - GET /wines/barcode/{barcode}                │ │
│  │  - POST /movements/barcode                     │ │
│  │  - POST /wines/{id}/barcode                    │ │
│  └────────────────────────────────────────────────┘ │
│                          │                           │
│  ┌────────────────────────────────────────────────┐ │
│  │  Business Logic                                │ │
│  │  - Barcode validation                          │ │
│  │  - Wine lookup                                 │ │
│  │  - Movement creation                           │ │
│  │  - Internal barcode generation                 │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│                   DATA LAYER                         │
│                PostgreSQL Database                   │
│  ┌────────────────────────────────────────────────┐ │
│  │  wines table                                   │ │
│  │  + barcode (VARCHAR(20), UNIQUE, INDEXED)     │ │
│  │  + barcode_type (VARCHAR(20))                 │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Scans Barcode
       │
       ├─ Hardware Scanner ──> Input Field ──> Auto-submit on Enter
       │
       └─ Camera Scanner ──> QuaggaJS ──> Auto-detect ──> Vibration
                                │
                                ▼
                    Frontend: BarcodeScanner Component
                                │
                                ▼
                    API Call: GET /wines/barcode/{code}
                                │
                                ▼
                    Backend: Search wine by barcode
                                │
                    ┌───────────┴───────────┐
                    │                       │
                Found                   Not Found
                    │                       │
                    ▼                       ▼
            Return Wine Data        Return 404 Error
                    │                       │
                    ▼                       ▼
        Display Wine + Actions      Display Error + Retry
                    │
                    ▼
        User Selects Action (Carico/Scarico)
                    │
                    ▼
        API Call: POST /movements/barcode
                    │
                    ▼
        Backend: Create Movement + Update Stock
                    │
                    ▼
        Return Success + Updated Quantity
                    │
                    ▼
        Display Success + Reset Scanner
```

## Components and Interfaces

### Backend Components

#### 1. Database Schema Extension

```python
# backend/app/models/inventory.py

class Wine(SQLModel, table=True):
    # ... existing fields ...
    barcode: str | None = Field(
        default=None, 
        max_length=20, 
        index=True,
        description="Product barcode (EAN-13, Code128, or internal)"
    )
    barcode_type: str | None = Field(
        default="EAN13",
        max_length=20,
        description="Type of barcode: EAN13, CODE128, QR, INTERNAL"
    )
```

#### 2. API Endpoints

```python
# backend/app/api/v1/endpoints/inventory.py

@router.get("/wines/barcode/{barcode}", response_model=WineRead)
async def get_wine_by_barcode(
    barcode: str,
    db: Session = Depends(get_db)
) -> Wine:
    """
    Search wine by barcode.
    Returns wine with full details if found, 404 otherwise.
    """
    pass

@router.post("/movements/barcode", response_model=MovementRead)
async def create_movement_by_barcode(
    movement: MovementBarcodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> StockMovement:
    """
    Create movement (in/out) by scanning barcode.
    Automatically finds wine and updates stock.
    """
    pass

@router.post("/wines/{wine_id}/barcode", response_model=WineRead)
async def assign_barcode_to_wine(
    wine_id: int,
    barcode_data: BarcodeAssign,
    db: Session = Depends(get_db)
) -> Wine:
    """
    Assign or update barcode for a wine.
    Validates uniqueness before assignment.
    """
    pass
```

#### 3. Schemas

```python
# backend/app/schemas/inventory.py

class BarcodeAssign(BaseModel):
    barcode: str = Field(..., min_length=1, max_length=20)
    barcode_type: str = Field(default="EAN13")

class MovementBarcodeCreate(BaseModel):
    barcode: str = Field(..., description="Wine barcode")
    type: MovementType = Field(..., description="in, out, or adjust")
    quantity: int = Field(..., gt=0)
    unit: UnitType = Field(default=UnitType.BOTTLE)
    note: str | None = None
    reference: str | None = None
```

### Frontend Components

#### 1. BarcodeScanner Component

```typescript
// frontend/src/components/barcode-scanner.tsx

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  mode?: "auto" | "camera" | "manual";
  autoFocus?: boolean;
}

export function BarcodeScanner(props: BarcodeScannerProps): JSX.Element
```

**Responsibilities**:
- Detect device type (mobile/tablet/desktop)
- Check camera availability
- Render appropriate input method (camera vs manual)
- Handle hardware scanner input (keyboard emulation)
- Integrate QuaggaJS for camera scanning
- Provide haptic feedback on successful scan

#### 2. QuickScan Page

```typescript
// frontend/src/app/dashboard/quick-scan/page.tsx

export default function QuickScanPage(): JSX.Element
```

**Responsibilities**:
- Render BarcodeScanner component
- Handle barcode scan events
- Call API to search wine
- Display wine details
- Provide quick action buttons (carico/scarico)
- Handle errors and loading states
- Reset state after successful operation

#### 3. Device Detection Utilities

```typescript
// frontend/src/lib/device-utils.ts

export function getDeviceType(): "mobile" | "tablet" | "desktop"
export function isMobileDevice(): boolean
export function hasCamera(): boolean
export function isStandalone(): boolean
```

## Data Models

### Database Migration

```sql
-- Add barcode columns to wines table
ALTER TABLE wines 
ADD COLUMN barcode VARCHAR(20) UNIQUE,
ADD COLUMN barcode_type VARCHAR(20) DEFAULT 'EAN13';

-- Create index for fast barcode lookups
CREATE INDEX idx_wines_barcode ON wines(barcode) WHERE barcode IS NOT NULL;
```

### Barcode Format Validation

**EAN-13**: `^[0-9]{13}$`
**Code128**: `^[A-Za-z0-9\-\.\ ]{1,20}$`
**Internal**: `^INT[0-9]{10}$` (e.g., INT0000000123)
**QR**: Any alphanumeric string up to 20 chars

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Barcode Uniqueness
*For any* two wines in the database, if both have barcodes assigned, their barcodes must be different.
**Validates: Requirements 1.3**

### Property 2: Barcode Search Consistency
*For any* valid barcode, searching for it should return the same wine every time (idempotent).
**Validates: Requirements 2.1, 2.2**

### Property 3: Movement Stock Update Correctness
*For any* wine and movement, after creating a movement of type "in" with quantity Q, the wine's stock should increase by exactly Q bottles.
**Validates: Requirements 3.4**

### Property 4: Movement Stock Update Correctness (Out)
*For any* wine and movement, after creating a movement of type "out" with quantity Q, the wine's stock should decrease by exactly Q bottles.
**Validates: Requirements 3.5**

### Property 5: Stock Non-Negative Invariant
*For any* wine, after any sequence of movements, the stock quantity must never be negative.
**Validates: Requirements 3.6**

### Property 6: Barcode Format Validation
*For any* barcode string, if it passes validation, it must match one of the accepted formats (EAN-13, Code128, Internal, QR).
**Validates: Requirements 9.1**

### Property 7: Internal Barcode Generation Uniqueness
*For any* wine without a barcode, generating an internal barcode should produce a unique code that doesn't conflict with existing barcodes.
**Validates: Requirements 8.3**

### Property 8: Scanner Input Auto-Submit
*For any* hardware scanner input followed by Enter key, the system should automatically submit the form without requiring manual button click.
**Validates: Requirements 4.2**

### Property 9: Camera Detection Fallback
*For any* device without camera or with denied camera permission, the system should fallback to manual input mode.
**Validates: Requirements 5.5**

### Property 10: Responsive Layout Adaptation
*For any* screen width, the UI should render the appropriate layout (desktop/tablet/mobile) without horizontal scrolling.
**Validates: Requirements 6.1, 6.2, 6.3**

## Error Handling

### Backend Error Responses

| Error Code | Scenario | Response |
|------------|----------|----------|
| 400 | Invalid barcode format | `{"detail": "Invalid barcode format"}` |
| 400 | Insufficient stock for scarico | `{"detail": "Insufficient stock. Available: X bottles"}` |
| 404 | Wine not found for barcode | `{"detail": "Wine not found for barcode {barcode}"}` |
| 409 | Barcode already assigned | `{"detail": "Barcode already assigned to wine {wine_name}"}` |
| 422 | Missing required fields | `{"detail": "Field {field} is required"}` |
| 500 | Database error | `{"detail": "Internal server error"}` |

### Frontend Error Handling

```typescript
try {
  const wine = await inventoryApi.searchByBarcode(barcode);
  setWine(wine);
} catch (error) {
  if (error.status === 404) {
    setError(`Barcode ${barcode} non trovato nel database`);
  } else if (error.status === 400) {
    setError(`Formato barcode non valido`);
  } else {
    setError(`Errore di connessione. Riprova.`);
  }
}
```

## Testing Strategy

### Unit Tests (Backend)

**Test Coverage**:
- Barcode validation functions
- Wine search by barcode
- Movement creation logic
- Internal barcode generation
- Stock update calculations

**Example**:
```python
def test_search_wine_by_barcode_found(client, db_session):
    """Test searching wine by existing barcode returns wine"""
    wine = create_test_wine(db_session, barcode="8012345678901")
    response = client.get(f"/api/v1/wines/barcode/{wine.barcode}")
    assert response.status_code == 200
    assert response.json()["id"] == wine.id

def test_search_wine_by_barcode_not_found(client):
    """Test searching wine by non-existing barcode returns 404"""
    response = client.get("/api/v1/wines/barcode/9999999999999")
    assert response.status_code == 404
```

### Property-Based Tests

**Framework**: Hypothesis (Python), fast-check (TypeScript)

**Property Test 1: Barcode Uniqueness**
```python
@given(st.lists(st.text(min_size=13, max_size=13, alphabet=st.characters(whitelist_categories=('Nd',))), unique=True))
def test_barcode_uniqueness_property(barcodes):
    """Property: All assigned barcodes must be unique"""
    # Generate wines with barcodes
    # Verify no duplicates in database
```

**Property Test 2: Stock Update Correctness**
```python
@given(st.integers(min_value=0, max_value=1000), st.integers(min_value=1, max_value=100))
def test_movement_in_increases_stock(initial_stock, quantity):
    """Property: Movement 'in' always increases stock by exact quantity"""
    wine = create_wine_with_stock(initial_stock)
    create_movement(wine.id, type="in", quantity=quantity)
    updated_wine = get_wine(wine.id)
    assert updated_wine.quantity == initial_stock + quantity
```

### Integration Tests

**Test Scenarios**:
1. End-to-end barcode scan → wine found → movement created
2. Barcode scan → wine not found → error displayed
3. Hardware scanner input → auto-submit → success
4. Camera scanner → barcode detected → wine displayed
5. Offline mode → movement queued → sync on reconnect

### Manual Testing Checklist

- [ ] Scanner USB: Scan multiple barcodes rapidly
- [ ] Camera mobile: Test in low light conditions
- [ ] Camera mobile: Test with damaged/reflective labels
- [ ] Responsive: Test on iPhone, Android, iPad, desktop
- [ ] PWA: Install on home screen and test offline
- [ ] Error handling: Test all error scenarios
- [ ] Performance: Measure scan-to-result time

## Performance Considerations

### Backend Optimization

1. **Database Index**: Barcode field indexed for O(log n) lookup
2. **Query Optimization**: Use `SELECT` with specific fields, avoid `SELECT *`
3. **Caching**: Consider Redis cache for frequently scanned wines
4. **Connection Pooling**: PgBouncer already configured

### Frontend Optimization

1. **Lazy Loading**: QuaggaJS loaded only when camera mode activated
2. **Debouncing**: Prevent duplicate scans within 1 second
3. **Image Optimization**: Compress camera feed for faster processing
4. **Service Worker**: Cache API responses for offline access

### Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Barcode API lookup | < 200ms | Backend response time |
| Hardware scanner processing | < 500ms | Scan to display |
| Camera barcode detection | < 2s | Camera activation to detection |
| Movement creation | < 500ms | API call to success |
| Page load (cached) | < 1s | First contentful paint |

## Security Considerations

### Input Validation

- Sanitize barcode input to prevent SQL injection
- Validate barcode format before database query
- Limit barcode length to prevent buffer overflow
- Rate limit API endpoints to prevent abuse

### Camera Permissions

- Request camera permission only when needed
- Handle permission denial gracefully
- Provide clear instructions for enabling camera
- Never store camera images on server

### Authentication

- All barcode endpoints require authentication
- Use existing JWT token system
- Validate user permissions for movement creation
- Log all barcode scans for audit trail

## Deployment Strategy

### Phase 1: Backend (Week 1)

1. Database migration (add barcode columns)
2. Implement barcode endpoints
3. Unit tests and property tests
4. Deploy to staging
5. Test with Postman/curl

### Phase 2: Frontend Desktop (Week 2)

1. Implement manual input mode
2. Hardware scanner support
3. Quick scan page (desktop layout)
4. Integration tests
5. Deploy to staging

### Phase 3: Frontend Mobile (Week 3)

1. Implement camera scanner (QuaggaJS)
2. Responsive layouts
3. PWA configuration
4. Mobile testing (iOS/Android)
5. Deploy to production

### Phase 4: Optimization (Week 4)

1. Performance tuning
2. Offline support
3. Error handling improvements
4. User feedback integration
5. Documentation

## Monitoring and Metrics

### Key Metrics

- **Scan Success Rate**: % of successful barcode scans
- **Scan Time**: Average time from scan to result
- **Error Rate**: % of failed scans by error type
- **Device Distribution**: % of scans by device type (desktop/mobile)
- **Barcode Coverage**: % of wines with barcodes assigned

### Logging

```python
logger.info(f"Barcode scan: {barcode} -> Wine: {wine.id} ({wine.name})")
logger.warning(f"Barcode not found: {barcode}")
logger.error(f"Barcode scan failed: {error}")
```

### Alerts

- Alert if scan error rate > 10%
- Alert if average scan time > 3 seconds
- Alert if camera permission denial rate > 50%

## Future Enhancements

### Phase 2 (Future)

1. **Batch Scanning**: Scan multiple bottles in sequence
2. **Barcode Generation**: Generate and print internal barcodes
3. **QR Code Support**: Enhanced QR codes with wine details
4. **Voice Commands**: "Carico 6 bottiglie" after scan
5. **Analytics Dashboard**: Scan statistics and trends
6. **Multi-language**: Support for English, French, German
7. **Bluetooth Scanner**: Native support for BT scanners
8. **Inventory Mode**: Rapid inventory counting via scans

## Dependencies

### Backend

- `python-barcode`: Barcode generation (if needed)
- `pyzbar`: Alternative barcode reading library
- Existing: FastAPI, SQLAlchemy, Pydantic

### Frontend

- `quagga`: Camera barcode scanning
- `next-pwa`: PWA support
- Existing: Next.js, React, Tailwind CSS

### Hardware (Optional)

- Inateck BCST-70 USB Scanner (~€25)
- Socket Mobile S700 Bluetooth Scanner (~€50)
- Brother QL-700 Label Printer (~€80)

## Conclusion

Il sistema di scansione barcode fornisce un'interfaccia unificata per gestire carichi e scarichi tramite barcode, supportando sia scanner hardware che camera smartphone. Il design privilegia la semplicità d'uso, la compatibilità multi-device e le performance, garantendo un'esperienza fluida per gli operatori dell'enoteca.
