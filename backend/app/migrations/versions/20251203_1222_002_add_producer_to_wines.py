"""Add producer_id to wines table and rename suppliers to companies

Revision ID: 002_add_producer_to_wines
Revises: 001_initial_schema
Create Date: 2025-12-03 12:22:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_add_producer_to_wines'
down_revision: Union[str, None] = 'eebac0871d4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename suppliers table to companies
    op.rename_table('suppliers', 'companies')
    
    # Rename indexes
    op.execute('ALTER INDEX ix_suppliers_id RENAME TO ix_companies_id')
    op.execute('ALTER INDEX ix_suppliers_name RENAME TO ix_companies_name')
    op.execute('ALTER INDEX ix_suppliers_vat_number RENAME TO ix_companies_vat_number')
    
    # Add producer_id column to wines table
    op.add_column('wines', sa.Column('producer_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_wines_producer_id'), 'wines', ['producer_id'], unique=False)
    op.create_foreign_key('fk_wines_producer_id', 'wines', 'companies', ['producer_id'], ['id'])
    
    # Update the existing foreign key name for supplier_id
    op.drop_constraint('wines_supplier_id_fkey', 'wines', type_='foreignkey')
    op.create_foreign_key('fk_wines_supplier_id', 'wines', 'companies', ['supplier_id'], ['id'])


def downgrade() -> None:
    # Remove producer_id from wines
    op.drop_constraint('fk_wines_producer_id', 'wines', type_='foreignkey')
    op.drop_index(op.f('ix_wines_producer_id'), table_name='wines')
    op.drop_column('wines', 'producer_id')
    
    # Restore original foreign key name
    op.drop_constraint('fk_wines_supplier_id', 'wines', type_='foreignkey')
    op.create_foreign_key('wines_supplier_id_fkey', 'wines', 'companies', ['supplier_id'], ['id'])
    
    # Rename indexes back
    op.execute('ALTER INDEX ix_companies_vat_number RENAME TO ix_suppliers_vat_number')
    op.execute('ALTER INDEX ix_companies_name RENAME TO ix_suppliers_name')
    op.execute('ALTER INDEX ix_companies_id RENAME TO ix_suppliers_id')
    
    # Rename companies table back to suppliers
    op.rename_table('companies', 'suppliers')
