"""Add unit of measure support

Revision ID: 26cc63715751
Revises: 20251127_1550
Create Date: 2025-11-30 17:14:05.192973+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '26cc63715751'
down_revision: Union[str, None] = '20251127_1550'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade database schema"""
    # Add bottles_per_package to wines table
    op.add_column('wines', sa.Column('bottles_per_package', sa.Integer(), nullable=False, server_default='6'))
    
    # Create enum type for unit of measure
    op.execute("CREATE TYPE unitofmeasure AS ENUM ('BOTTLE', 'PACKAGE')")
    
    # Add unit and quantity_in_unit to stock_movements table
    op.add_column('stock_movements', sa.Column('unit', sa.Enum('BOTTLE', 'PACKAGE', name='unitofmeasure'), nullable=False, server_default='BOTTLE'))
    op.add_column('stock_movements', sa.Column('quantity_in_unit', sa.Integer(), nullable=False, server_default='0'))
    
    # Update quantity_in_unit to match quantity for existing records
    op.execute("UPDATE stock_movements SET quantity_in_unit = quantity WHERE quantity_in_unit = 0")


def downgrade() -> None:
    """Downgrade database schema"""
    # Remove columns from stock_movements
    op.drop_column('stock_movements', 'quantity_in_unit')
    op.drop_column('stock_movements', 'unit')
    
    # Drop enum type
    op.execute("DROP TYPE unitofmeasure")
    
    # Remove column from wines
    op.drop_column('wines', 'bottles_per_package')
