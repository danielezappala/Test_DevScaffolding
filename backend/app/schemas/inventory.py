from datetime import date, datetime
from enum import Enum
from typing import Optional
# from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict, field_validator

from app.schemas.localization import Localization

class WineType(str, Enum):
    RED = "red"
    WHITE = "white"
    ROSE = "rose"
    SPARKLING = "sparkling"
    DESSERT = "dessert"
    OTHER = "other"

class BarcodeType(str, Enum):
    EAN13 = "EAN13"
    CODE128 = "CODE128"
    QR = "QR"
    INTERNAL = "INTERNAL"

class CompanyCategory(str, Enum):
    PRODUCER = "PRODUCER"  # Produttore
    DISTRIBUTOR = "DISTRIBUTOR"  # Distributore/Fornitore
    BOTH = "BOTH"  # Sia Produttore che Distributore

# ===== Company Schemas (Produttori e Fornitori) =====

class CompanyBase(BaseModel):
    """Anagrafica unificata per Produttori e Fornitori/Distributori"""
    name: str = Field(..., min_length=2, max_length=200)
    category: CompanyCategory = Field(default=CompanyCategory.BOTH, description="Categoria: Produttore, Distributore, o entrambi")
    contact_email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    vat_number: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    category: Optional[CompanyCategory] = None
    contact_email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = None
    vat_number: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None

class CompanyRead(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Alias per retrocompatibilità
SupplierBase = CompanyBase
SupplierCreate = CompanyCreate
SupplierUpdate = CompanyUpdate
SupplierRead = CompanyRead

# ===== Wine Schemas =====

class WineBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    vintage: int = Field(..., ge=1900, le=2100)
    type: WineType = WineType.OTHER
    denomination: Optional[str] = Field(None, max_length=100)  # DOCG, DOC, IGT, etc.
    price: float = Field(..., gt=0)
    quantity: int = Field(default=0, ge=0)  # Always in bottles
    threshold: Optional[int] = Field(default=10, ge=0)  # In bottles
    bottles_per_package: int = Field(default=6, ge=1)  # Bottles per package/case
    barcode: Optional[str] = Field(None, max_length=20)
    barcode_type: Optional[BarcodeType] = Field(default=BarcodeType.EAN13)
    producer_id: Optional[int] = None  # Chi produce il vino
    supplier_id: Optional[int] = None  # Da chi si acquista (distributore)
    notes: Optional[str] = None

class WineCreate(WineBase):
    @field_validator('vintage')
    @classmethod
    def validate_vintage(cls, v: int) -> int:
        current_year = datetime.now().year
        if v > current_year + 1:
            raise ValueError(f'Vintage cannot be more than one year in the future (max: {current_year + 1})')
        return v
    
    @field_validator('barcode')
    @classmethod
    def validate_barcode(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() == '':
            raise ValueError('Barcode cannot be empty string')
        if v is not None and not v.replace('-', '').replace('.', '').replace(' ', '').isalnum():
            raise ValueError('Barcode must contain only alphanumeric characters, hyphens, dots, and spaces')
        return v

class WineUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    vintage: Optional[int] = Field(None, ge=1900, le=2100)
    type: Optional[WineType] = None
    denomination: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    threshold: Optional[int] = Field(None, ge=0)
    bottles_per_package: Optional[int] = Field(None, ge=1)
    barcode: Optional[str] = Field(None, max_length=20)
    barcode_type: Optional[BarcodeType] = None
    producer_id: Optional[int] = None
    supplier_id: Optional[int] = None
    notes: Optional[str] = None

class WineRead(WineBase):
    id: int
    created_at: datetime
    updated_at: datetime
    type_label: Localization | None = None

    model_config = ConfigDict(from_attributes=True)

class WineReadWithSupplier(WineRead):
    """Wine with supplier and producer details"""
    producer: Optional[CompanyRead] = None
    supplier: Optional[CompanyRead] = None

class WineCriticalStock(BaseModel):
    """Wine with critical stock information"""
    id: int
    name: str
    vintage: int
    quantity: int
    threshold: Optional[int]
    severity: str  # "critical" or "warning"
    producer: Optional[CompanyRead] = None
    supplier: Optional[CompanyRead] = None
    type_label: Localization | None = None
    
    model_config = ConfigDict(from_attributes=True)

# ===== Lot Schemas =====

class LotBase(BaseModel):
    wine_id: int
    quantity: int = Field(..., ge=0)
    received_date: date
    expiry_date: Optional[date] = None
    order_id: Optional[int] = None
    notes: Optional[str] = None

class LotCreate(LotBase):
    @field_validator('expiry_date')
    @classmethod
    def validate_expiry(cls, v: Optional[date], info) -> Optional[date]:
        if v and 'received_date' in info.data:
            if v < info.data['received_date']:
                raise ValueError('Expiry date cannot be before received date')
        return v

class LotUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=0)
    expiry_date: Optional[date] = None
    notes: Optional[str] = None

class LotRead(LotBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ===== Movement Schemas =====

class MovementType(str, Enum):
    IN = "in"
    OUT = "out"
    ADJUST = "adjust"

class UnitOfMeasure(str, Enum):
    BOTTLE = "BOTTLE"
    PACKAGE = "PACKAGE"

class StockMovementBase(BaseModel):
    wine_id: int
    type: MovementType
    quantity: int = Field(..., gt=0)  # Quantity in the specified unit
    unit: UnitOfMeasure = UnitOfMeasure.BOTTLE  # Unit of measure
    lot_id: Optional[int] = None
    note: Optional[str] = None
    reference: Optional[str] = Field(None, max_length=100)

class StockMovementCreate(StockMovementBase):
    pass

class StockMovementRead(StockMovementBase):
    id: int
    quantity_in_unit: int  # Original quantity in the specified unit
    timestamp: datetime
    user_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class StockMovementUpdate(BaseModel):
    """Schema for updating stock movement data"""
    note: Optional[str] = None
    reference: Optional[str] = Field(None, max_length=100)

    model_config = ConfigDict(from_attributes=True)

class MovementBarcodeCreate(BaseModel):
    """Schema for creating movement by barcode"""
    barcode: str = Field(..., description="Wine barcode")
    type: MovementType = Field(..., description="in, out, or adjust")
    quantity: int = Field(..., gt=0)
    unit: UnitOfMeasure = Field(default=UnitOfMeasure.BOTTLE)
    note: Optional[str] = None
    reference: Optional[str] = Field(None, max_length=100)

class BarcodeAssign(BaseModel):
    """Schema for assigning barcode to wine"""
    barcode: str = Field(..., min_length=1, max_length=20, description="Barcode to assign")
    barcode_type: BarcodeType = Field(default=BarcodeType.EAN13, description="Type of barcode")
    
    @field_validator('barcode')
    @classmethod
    def validate_barcode(cls, v: str) -> str:
        if v.strip() == '':
            raise ValueError('Barcode cannot be empty string')
        if not v.replace('-', '').replace('.', '').replace(' ', '').isalnum():
            raise ValueError('Barcode must contain only alphanumeric characters, hyphens, dots, and spaces')
        return v

class StockMovementReadWithWine(StockMovementRead):
    """Movement with wine details"""
    wine_name: Optional[str] = None
    wine_vintage: Optional[int] = None
