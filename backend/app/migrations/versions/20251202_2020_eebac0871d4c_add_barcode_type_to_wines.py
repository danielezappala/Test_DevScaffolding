"""add_barcode_type_to_wines

Revision ID: eebac0871d4c
Revises: 26cc63715751
Create Date: 2025-12-02 20:20:55.679783+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eebac0871d4c'
down_revision: Union[str, None] = '26cc63715751'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade database schema"""
    # Add barcode_type column with default value 'EAN13'
    op.add_column('wines', sa.Column('barcode_type', sa.String(length=20), nullable=True, server_default='EAN13'))
    
    # Update existing NULL values to 'EAN13' for consistency
    op.execute("UPDATE wines SET barcode_type = 'EAN13' WHERE barcode_type IS NULL")
    
    # Ensure barcode column has correct length constraint (20 characters)
    # Note: The barcode column already exists with unique index from initial migration


def downgrade() -> None:
    """Downgrade database schema"""
    # Remove barcode_type column
    op.drop_column('wines', 'barcode_type')
