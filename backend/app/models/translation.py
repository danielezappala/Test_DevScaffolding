"""Models for localized lookup values."""

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TranslationCategory(str, Enum):
    WINE_TYPE = "wine_type"


class Translation(Base):
    __tablename__ = "translations"
    __table_args__ = (UniqueConstraint("category", "code", name="uq_translation_category_code"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    label_it: Mapped[str] = mapped_column(String(255), nullable=False)
    label_en: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
