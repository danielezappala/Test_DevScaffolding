"""Tests for Pydantic schemas"""

import pytest
from datetime import date, datetime
from decimal import Decimal
from pydantic import ValidationError

from app.schemas.inventory import (
    WineCreate, WineUpdate, WineRead,
    SupplierCreate, SupplierUpdate, SupplierRead,
    LotCreate, LotUpdate,
    StockMovementCreate,
    WineType, MovementType
)


class TestWineSchemas:
    """Test Wine Pydantic schemas"""

    def test_wine_create_valid(self):
        """Test creating wine with valid data"""
        wine_data = {
            "name": "Barolo DOCG",
            "vintage": 2018,
            "type": WineType.RED,
            "denomination": "DOCG",
            "price": Decimal("45.50"),
            "quantity": 10,
            "threshold": 5,
            "barcode": "8001234567890",
            "supplier_id": 1,
            "notes": "Riserva speciale"
        }
        wine = WineCreate(**wine_data)
        assert wine.name == "Barolo DOCG"
        assert wine.vintage == 2018
        assert wine.price == Decimal("45.50")
        assert wine.threshold == 5

    def test_wine_create_minimal(self):
        """Test creating wine with minimal required fields"""
        wine = WineCreate(
            name="Chianti",
            vintage=2020,
            price=Decimal("12.00")
        )
        assert wine.name == "Chianti"
        assert wine.quantity == 0  # default
        assert wine.threshold == 10  # default
        assert wine.type == WineType.OTHER  # default

    def test_wine_create_name_too_short(self):
        """Test validation fails for name too short"""
        with pytest.raises(ValidationError) as exc_info:
            WineCreate(
                name="X",  # Too short
                vintage=2020,
                price=Decimal("12.00")
            )
        assert "at least 2 characters" in str(exc_info.value).lower()

    def test_wine_create_vintage_too_old(self):
        """Test validation fails for vintage too old"""
        with pytest.raises(ValidationError):
            WineCreate(
                name="Ancient Wine",
                vintage=1800,  # Before 1900
                price=Decimal("100.00")
            )

    def test_wine_create_vintage_future(self):
        """Test validation fails for vintage too far in future"""
        future_year = datetime.now().year + 5
        with pytest.raises(ValidationError) as exc_info:
            WineCreate(
                name="Future Wine",
                vintage=future_year,
                price=Decimal("50.00")
            )
        assert "future" in str(exc_info.value).lower()

    def test_wine_create_price_negative(self):
        """Test validation fails for negative price"""
        with pytest.raises(ValidationError):
            WineCreate(
                name="Free Wine",
                vintage=2020,
                price=Decimal("-10.00")
            )

    def test_wine_create_price_zero(self):
        """Test validation fails for zero price"""
        with pytest.raises(ValidationError):
            WineCreate(
                name="Free Wine",
                vintage=2020,
                price=Decimal("0.00")
            )

    def test_wine_create_quantity_negative(self):
        """Test validation fails for negative quantity"""
        with pytest.raises(ValidationError):
            WineCreate(
                name="Wine",
                vintage=2020,
                price=Decimal("10.00"),
                quantity=-5
            )

    def test_wine_update_partial(self):
        """Test partial update with WineUpdate schema"""
        update = WineUpdate(
            price=Decimal("55.00"),
            quantity=20
        )
        assert update.price == Decimal("55.00")
        assert update.quantity == 20
        assert update.name is None  # Not updated


class TestSupplierSchemas:
    """Test Supplier Pydantic schemas"""

    def test_supplier_create_valid(self):
        """Test creating supplier with valid data"""
        supplier = SupplierCreate(
            name="Cantina Sociale",
            contact_email="info@cantina.it",
            phone="+39 0123 456789",
            address="Via Roma 1, Alba (CN)",
            vat_number="IT12345678901",
            notes="Fornitore principale"
        )
        assert supplier.name == "Cantina Sociale"
        assert supplier.vat_number == "IT12345678901"

    def test_supplier_create_minimal(self):
        """Test creating supplier with minimal fields"""
        supplier = SupplierCreate(name="Simple Supplier")
        assert supplier.name == "Simple Supplier"
        assert supplier.contact_email is None
        assert supplier.vat_number is None

    def test_supplier_create_name_too_short(self):
        """Test validation fails for name too short"""
        with pytest.raises(ValidationError):
            SupplierCreate(name="X")

    def test_supplier_update_partial(self):
        """Test partial update"""
        update = SupplierUpdate(
            contact_email="new@email.com",
            phone="+39 999 999999"
        )
        assert update.contact_email == "new@email.com"
        assert update.name is None


class TestLotSchemas:
    """Test Lot Pydantic schemas"""

    def test_lot_create_valid(self):
        """Test creating lot with valid data"""
        lot = LotCreate(
            wine_id=1,
            quantity=24,
            received_date=date(2024, 1, 15),
            expiry_date=date(2030, 12, 31),
            order_id=5,
            notes="First delivery"
        )
        assert lot.wine_id == 1
        assert lot.quantity == 24
        assert lot.received_date == date(2024, 1, 15)

    def test_lot_create_expiry_before_received(self):
        """Test validation fails when expiry is before received date"""
        with pytest.raises(ValidationError) as exc_info:
            LotCreate(
                wine_id=1,
                quantity=24,
                received_date=date(2024, 1, 15),
                expiry_date=date(2023, 12, 31)  # Before received
            )
        assert "before received" in str(exc_info.value).lower()

    def test_lot_create_no_expiry(self):
        """Test creating lot without expiry date"""
        lot = LotCreate(
            wine_id=1,
            quantity=12,
            received_date=date(2024, 1, 15)
        )
        assert lot.expiry_date is None


class TestMovementSchemas:
    """Test StockMovement Pydantic schemas"""

    def test_movement_create_in(self):
        """Test creating IN movement"""
        movement = StockMovementCreate(
            wine_id=1,
            type=MovementType.IN,
            quantity=12,
            note="Weekly delivery",
            reference="ORD-2024-001"
        )
        assert movement.type == MovementType.IN
        assert movement.quantity == 12
        assert movement.reference == "ORD-2024-001"

    def test_movement_create_out(self):
        """Test creating OUT movement"""
        movement = StockMovementCreate(
            wine_id=1,
            type=MovementType.OUT,
            quantity=6,
            lot_id=3
        )
        assert movement.type == MovementType.OUT
        assert movement.lot_id == 3

    def test_movement_create_quantity_zero(self):
        """Test validation fails for zero quantity"""
        with pytest.raises(ValidationError):
            StockMovementCreate(
                wine_id=1,
                type=MovementType.IN,
                quantity=0
            )

    def test_movement_create_quantity_negative(self):
        """Test validation fails for negative quantity"""
        with pytest.raises(ValidationError):
            StockMovementCreate(
                wine_id=1,
                type=MovementType.OUT,
                quantity=-5
            )
