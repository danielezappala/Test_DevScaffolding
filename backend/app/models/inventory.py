from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base

class WineType(str, enum.Enum):
    RED = "red"
    WHITE = "white"
    ROSE = "rose"
    SPARKLING = "sparkling"
    DESSERT = "dessert"
    OTHER = "other"

class UnitOfMeasure(str, enum.Enum):
    BOTTLE = "BOTTLE"
    PACKAGE = "PACKAGE"

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    contact_email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    vat_number = Column(String, unique=True, nullable=True, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    wines = relationship("Wine", back_populates="supplier")

class Wine(Base):
    __tablename__ = "wines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    vintage = Column(Integer, nullable=False, index=True)
    type = Column(Enum(WineType), nullable=False, default=WineType.OTHER, index=True)
    denomination = Column(String, nullable=True, index=True)  # DOCG, DOC, IGT, etc.
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)  # Always stored in bottles
    threshold = Column(Integer, nullable=True, default=10)  # Soglia minima stock (in bottles)
    bottles_per_package = Column(Integer, nullable=False, default=6)  # Bottles per package/case
    barcode = Column(String, unique=True, nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    supplier = relationship("Supplier", back_populates="wines")
    movements = relationship("StockMovement", back_populates="wine", cascade="all, delete-orphan")
    lots = relationship("Lot", back_populates="wine", cascade="all, delete-orphan")

class Lot(Base):
    """Lotto/partita di vino per tracciabilità FIFO"""
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    wine_id = Column(Integer, ForeignKey("wines.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=0)
    received_date = Column(Date, nullable=False, index=True)
    expiry_date = Column(Date, nullable=True)
    order_id = Column(Integer, nullable=True)  # Riferimento a ordine (future)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    wine = relationship("Wine", back_populates="lots")

class MovementType(str, enum.Enum):
    IN = "in"
    OUT = "out"
    ADJUST = "adjust"

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    wine_id = Column(Integer, ForeignKey("wines.id"), nullable=False, index=True)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=True, index=True)
    type = Column(Enum(MovementType), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)  # Always stored in bottles
    unit = Column(Enum(UnitOfMeasure), nullable=False, default=UnitOfMeasure.BOTTLE)  # Unit used for input
    quantity_in_unit = Column(Integer, nullable=False)  # Original quantity in the specified unit
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    note = Column(Text, nullable=True)
    reference = Column(String, nullable=True, index=True)  # Riferimento ordine/documento
    user_id = Column(Integer, nullable=True)  # ID utente che ha fatto il movimento

    wine = relationship("Wine", back_populates="movements")
    lot = relationship("Lot")
