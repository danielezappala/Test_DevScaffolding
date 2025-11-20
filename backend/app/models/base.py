"""Base SQLAlchemy model with common fields"""

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base as DeclarativeBase


class Base(DeclarativeBase):
    """
    Base model class with common fields for all models.
    
    Provides:
    - id: Primary key
    - created_at: Timestamp of creation
    - updated_at: Timestamp of last update
    """
    
    __abstract__ = True
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def dict(self) -> dict[str, Any]:
        """Convert model to dictionary"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def __repr__(self) -> str:
        """String representation of model"""
        attrs = ", ".join(
            f"{key}={value!r}"
            for key, value in self.dict().items()
        )
        return f"{self.__class__.__name__}({attrs})"
