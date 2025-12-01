"""Utility script to populate the inventory tables with demo data."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime
from typing import Sequence

from sqlalchemy import func, select

from app.database import AsyncSessionLocal
from app.models.inventory import (
    MovementType,
    StockMovement,
    Supplier,
    Wine,
    WineType,
)


@dataclass(frozen=True)
class SupplierSeed:
    name: str
    contact_email: str | None = None
    phone: str | None = None
    address: str | None = None
    vat_number: str | None = None
    notes: str | None = None


@dataclass(frozen=True)
class WineSeed:
    name: str
    vintage: int
    wine_type: WineType
    price: float
    quantity: int
    threshold: int
    supplier_name: str | None = None
    denomination: str | None = None
    barcode: str | None = None
    notes: str | None = None


@dataclass(frozen=True)
class MovementSeed:
    wine_name: str
    movement_type: MovementType
    quantity: int
    note: str
    reference: str


SUPPLIERS: Sequence[SupplierSeed] = (
    SupplierSeed(
        name="Cantina Sociale di Alba",
        contact_email="info@cantinaalba.it",
        phone="+39 0173 123456",
        address="Via Roma 1, 12051 Alba (CN)",
        vat_number="IT12345678901",
    ),
    SupplierSeed(
        name="Tenuta di Montalcino",
        contact_email="info@montalcino.it",
        phone="+39 0577 654321",
        address="Località Montalcino, 53024 Montalcino (SI)",
        vat_number="IT98765432109",
    ),
    SupplierSeed(
        name="Azienda Vinicola Gavi",
        contact_email="info@gavi.it",
        address="Strada del Vino 5, Gavi (AL)",
    ),
)


WINES: Sequence[WineSeed] = (
    WineSeed(
        name="Barolo DOCG Riserva",
        vintage=2018,
        wine_type=WineType.RED,
        price=45.5,
        quantity=24,
        threshold=10,
        supplier_name="Cantina Sociale di Alba",
        denomination="DOCG",
        notes="Invecchiato 5 anni in botte",
    ),
    WineSeed(
        name="Brunello di Montalcino DOCG",
        vintage=2017,
        wine_type=WineType.RED,
        price=55.0,
        quantity=12,
        threshold=8,
        supplier_name="Tenuta di Montalcino",
        denomination="DOCG",
    ),
    WineSeed(
        name="Barbaresco DOCG",
        vintage=2019,
        wine_type=WineType.RED,
        price=42.0,
        quantity=18,
        threshold=12,
        supplier_name="Cantina Sociale di Alba",
        denomination="DOCG",
    ),
    WineSeed(
        name="Gavi DOCG",
        vintage=2022,
        wine_type=WineType.WHITE,
        price=18.0,
        quantity=36,
        threshold=15,
        supplier_name="Azienda Vinicola Gavi",
        denomination="DOCG",
    ),
    WineSeed(
        name="Vermentino di Gallura DOCG",
        vintage=2023,
        wine_type=WineType.WHITE,
        price=16.5,
        quantity=48,
        threshold=20,
    ),
    WineSeed(
        name="Chiaretto DOC",
        vintage=2023,
        wine_type=WineType.ROSE,
        price=12.5,
        quantity=30,
        threshold=18,
        denomination="DOC",
    ),
    WineSeed(
        name="Franciacorta DOCG Brut",
        vintage=2020,
        wine_type=WineType.SPARKLING,
        price=28.0,
        quantity=15,
        threshold=10,
        denomination="DOCG",
    ),
    WineSeed(
        name="Vino Sotto Soglia",
        vintage=2021,
        wine_type=WineType.RED,
        price=20.0,
        quantity=3,
        threshold=15,
    ),
    WineSeed(
        name="Vino Esaurito",
        vintage=2020,
        wine_type=WineType.WHITE,
        price=25.0,
        quantity=0,
        threshold=10,
    ),
)


MOVEMENTS: Sequence[MovementSeed] = (
    MovementSeed("Barolo DOCG Riserva", MovementType.IN, 24, "Carico iniziale", "ORD-2024-001"),
    MovementSeed("Brunello di Montalcino DOCG", MovementType.IN, 12, "Carico iniziale", "ORD-2024-002"),
    MovementSeed("Barbaresco DOCG", MovementType.IN, 18, "Carico iniziale", "ORD-2024-003"),
    MovementSeed("Gavi DOCG", MovementType.IN, 36, "Carico iniziale", "ORD-2024-004"),
    MovementSeed("Vermentino di Gallura DOCG", MovementType.IN, 48, "Carico iniziale", "ORD-2024-005"),
    MovementSeed("Chiaretto DOC", MovementType.IN, 30, "Carico iniziale", "ORD-2024-006"),
    MovementSeed("Franciacorta DOCG Brut", MovementType.IN, 15, "Carico iniziale", "ORD-2024-007"),
    MovementSeed("Barolo DOCG Riserva", MovementType.OUT, 6, "Vendita ristorante", "SALE-2024-001"),
    MovementSeed("Gavi DOCG", MovementType.OUT, 12, "Vendita enoteca", "SALE-2024-002"),
    MovementSeed("Vermentino di Gallura DOCG", MovementType.OUT, 24, "Grande ordine", "SALE-2024-003"),
)


async def seed_demo_data() -> None:
    async with AsyncSessionLocal() as session:
        supplier_names = set(
            (await session.execute(select(Supplier.name))).scalars().all()
        )

        supplier_map: dict[str, Supplier] = {}
        for item in SUPPLIERS:
            if item.name in supplier_names:
                supplier = (
                    await session.execute(
                        select(Supplier).where(Supplier.name == item.name)
                    )
                ).scalar_one()
            else:
                supplier = Supplier(
                    name=item.name,
                    contact_email=item.contact_email,
                    phone=item.phone,
                    address=item.address,
                    vat_number=item.vat_number,
                    notes=item.notes,
                )
                session.add(supplier)
            supplier_map[item.name] = supplier

        await session.flush()

        wine_names = set((await session.execute(select(Wine.name))).scalars().all())
        wine_map: dict[str, Wine] = {}
        for wine in WINES:
            if wine.name in wine_names:
                record = (
                    await session.execute(select(Wine).where(Wine.name == wine.name))
                ).scalar_one()
                record.quantity = wine.quantity
                record.threshold = wine.threshold
                record.price = wine.price
                wine_map[wine.name] = record
                continue

            record = Wine(
                name=wine.name,
                vintage=wine.vintage,
                type=wine.wine_type,
                price=wine.price,
                quantity=wine.quantity,
                threshold=wine.threshold,
                denomination=wine.denomination,
                barcode=wine.barcode,
                notes=wine.notes,
                supplier_id=supplier_map.get(wine.supplier_name).id if wine.supplier_name else None,
            )
            session.add(record)
            wine_map[wine.name] = record

        await session.flush()

        existing_references = set(
            (await session.execute(select(StockMovement.reference))).scalars().all()
        )

        for movement in MOVEMENTS:
            if movement.reference in existing_references:
                continue
            wine = wine_map[movement.wine_name]
            session.add(
                StockMovement(
                    wine_id=wine.id,
                    type=movement.movement_type,
                    quantity=movement.quantity,
                    note=movement.note,
                    reference=movement.reference,
                    timestamp=datetime.utcnow(),
                )
            )

        await session.commit()

        wine_count = (await session.execute(select(func.count(Wine.id)))).scalar_one()
        supplier_count = (await session.execute(select(func.count(Supplier.id)))).scalar_one()
        movement_count = (await session.execute(select(func.count(StockMovement.id)))).scalar_one()

        print("🎉 Dati di esempio creati/aggiornati con successo!")
        print(f"🍷 Vini totali: {wine_count}")
        print(f"📦 Fornitori totali: {supplier_count}")
        print(f"📊 Movimenti totali: {movement_count}")


def main() -> None:
    asyncio.run(seed_demo_data())


if __name__ == "__main__":
    main()
