"""Helpers to fetch localized labels from the database."""

from __future__ import annotations

from typing import Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.translation import Translation, TranslationCategory
from app.schemas.localization import Localization


async def get_translation_map(
    db: AsyncSession, category: TranslationCategory
) -> Dict[str, Localization]:
    result = await db.execute(
        select(Translation).where(Translation.category == category.value)
    )
    translations = {}
    for row in result.scalars():
        translations[row.code] = Localization(it=row.label_it, en=row.label_en)
    return translations
