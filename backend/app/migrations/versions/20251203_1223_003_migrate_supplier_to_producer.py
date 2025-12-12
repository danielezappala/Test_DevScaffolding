"""Migrate existing supplier_id data to producer_id

Revision ID: 003_migrate_supplier_to_producer
Revises: 002_add_producer_to_wines
Create Date: 2025-12-03 12:23:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '003_migrate_supplier_to_producer'
down_revision: Union[str, None] = '002_add_producer_to_wines'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Copia i valori da supplier_id a producer_id per i vini esistenti
    # Questo assume che il fornitore attuale sia anche il produttore
    op.execute("""
        UPDATE wines 
        SET producer_id = supplier_id 
        WHERE supplier_id IS NOT NULL AND producer_id IS NULL
    """)


def downgrade() -> None:
    # Non è necessario fare nulla nel downgrade
    # I dati in producer_id verranno semplicemente ignorati
    pass
