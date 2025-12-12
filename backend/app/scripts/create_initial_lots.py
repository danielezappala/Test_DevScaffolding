"""
Script to create initial lots for wines with quantity but no lots.
This ensures all wines can be used with the barcode scanning system.

Run with: python -m app.scripts.create_initial_lots
"""

import asyncio
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models.inventory import Wine, Lot


async def create_initial_lots():
    """Create initial lots for wines with quantity but no lots."""
    async with AsyncSessionLocal() as db:
        # Find all wines with quantity > 0
        result = await db.execute(
            select(Wine).where(Wine.quantity > 0)
        )
        wines = result.scalars().all()
        
        created_count = 0
        skipped_count = 0
        
        for wine in wines:
            # Check if wine already has lots
            lots_result = await db.execute(
                select(Lot).where(Lot.wine_id == wine.id)
            )
            existing_lots = lots_result.scalars().all()
            
            if existing_lots:
                print(f"✓ Wine '{wine.name}' already has {len(existing_lots)} lot(s), skipping")
                skipped_count += 1
                continue
            
            # Create initial lot with current quantity
            initial_lot = Lot(
                wine_id=wine.id,
                quantity=wine.quantity,
                received_date=date.today(),
                notes="Lotto iniziale creato automaticamente per giacenza esistente"
            )
            db.add(initial_lot)
            created_count += 1
            print(f"✓ Created initial lot for '{wine.name}' with {wine.quantity} bottles")
        
        # Commit all changes
        await db.commit()
        
        print(f"\n{'='*60}")
        print(f"Migration completed!")
        print(f"  - Created: {created_count} initial lots")
        print(f"  - Skipped: {skipped_count} wines (already have lots)")
        print(f"{'='*60}")


if __name__ == "__main__":
    print("Creating initial lots for wines with quantity but no lots...")
    print(f"{'='*60}\n")
    asyncio.run(create_initial_lots())
