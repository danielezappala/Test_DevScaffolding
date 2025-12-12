"""Add category to companies table

Revision ID: 004_add_category_to_companies
Revises: 003_migrate_supplier_to_producer
Create Date: 2025-12-03 12:32:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '004_add_category_to_companies'
down_revision: Union[str, None] = '003_migrate_supplier_to_producer'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum type for company category
    op.execute("CREATE TYPE companycategory AS ENUM ('PRODUCER', 'DISTRIBUTOR', 'BOTH')")
    
    # Add category column with default 'BOTH'
    op.add_column('companies', sa.Column('category', sa.Enum('PRODUCER', 'DISTRIBUTOR', 'BOTH', name='companycategory'), nullable=False, server_default='BOTH'))
    
    # Create index for category
    op.create_index(op.f('ix_companies_category'), 'companies', ['category'], unique=False)


def downgrade() -> None:
    # Drop index
    op.drop_index(op.f('ix_companies_category'), table_name='companies')
    
    # Drop column
    op.drop_column('companies', 'category')
    
    # Drop enum type
    op.execute("DROP TYPE companycategory")
