"""Add denomination threshold notes to wines; add vat_number to suppliers; create lots table; add timestamps

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-11-20 16:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create suppliers table
    op.create_table('suppliers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('contact_email', sa.String(), nullable=True),
    sa.Column('phone', sa.String(), nullable=True),
    sa.Column('address', sa.Text(), nullable=True),
    sa.Column('vat_number', sa.String(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_suppliers_id'), 'suppliers', ['id'], unique=False)
    op.create_index(op.f('ix_suppliers_name'), 'suppliers', ['name'], unique=False)
    op.create_index(op.f('ix_suppliers_vat_number'), 'suppliers', ['vat_number'], unique=True)

    # Create wines table
    op.create_table('wines',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('vintage', sa.Integer(), nullable=False),
    sa.Column('type', sa.Enum('RED', 'WHITE', 'ROSE', 'SPARKLING', 'DESSERT', 'OTHER', name='winetype'), nullable=False),
    sa.Column('denomination', sa.String(), nullable=True),
    sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('threshold', sa.Integer(), nullable=True),
    sa.Column('barcode', sa.String(), nullable=True),
    sa.Column('supplier_id', sa.Integer(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_wines_barcode'), 'wines', ['barcode'], unique=True)
    op.create_index(op.f('ix_wines_denomination'), 'wines', ['denomination'], unique=False)
    op.create_index(op.f('ix_wines_id'), 'wines', ['id'], unique=False)
    op.create_index(op.f('ix_wines_name'), 'wines', ['name'], unique=False)
    op.create_index(op.f('ix_wines_supplier_id'), 'wines', ['supplier_id'], unique=False)
    op.create_index(op.f('ix_wines_type'), 'wines', ['type'], unique=False)
    op.create_index(op.f('ix_wines_vintage'), 'wines', ['vintage'], unique=False)

    # Create lots table
    op.create_table('lots',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('wine_id', sa.Integer(), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('received_date', sa.Date(), nullable=False),
    sa.Column('expiry_date', sa.Date(), nullable=True),
    sa.Column('order_id', sa.Integer(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['wine_id'], ['wines.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lots_id'), 'lots', ['id'], unique=False)
    op.create_index(op.f('ix_lots_received_date'), 'lots', ['received_date'], unique=False)
    op.create_index(op.f('ix_lots_wine_id'), 'lots', ['wine_id'], unique=False)

    # Create stock_movements table
    op.create_table('stock_movements',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('wine_id', sa.Integer(), nullable=False),
    sa.Column('lot_id', sa.Integer(), nullable=True),
    sa.Column('type', sa.Enum('IN', 'OUT', 'ADJUST', name='movementtype'), nullable=False),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('note', sa.Text(), nullable=True),
    sa.Column('reference', sa.String(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['lot_id'], ['lots.id'], ),
    sa.ForeignKeyConstraint(['wine_id'], ['wines.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stock_movements_id'), 'stock_movements', ['id'], unique=False)
    op.create_index(op.f('ix_stock_movements_lot_id'), 'stock_movements', ['lot_id'], unique=False)
    op.create_index(op.f('ix_stock_movements_reference'), 'stock_movements', ['reference'], unique=False)
    op.create_index(op.f('ix_stock_movements_timestamp'), 'stock_movements', ['timestamp'], unique=False)
    op.create_index(op.f('ix_stock_movements_type'), 'stock_movements', ['type'], unique=False)
    op.create_index(op.f('ix_stock_movements_wine_id'), 'stock_movements', ['wine_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_stock_movements_wine_id'), table_name='stock_movements')
    op.drop_index(op.f('ix_stock_movements_type'), table_name='stock_movements')
    op.drop_index(op.f('ix_stock_movements_timestamp'), table_name='stock_movements')
    op.drop_index(op.f('ix_stock_movements_reference'), table_name='stock_movements')
    op.drop_index(op.f('ix_stock_movements_lot_id'), table_name='stock_movements')
    op.drop_index(op.f('ix_stock_movements_id'), table_name='stock_movements')
    op.drop_table('stock_movements')
    
    op.drop_index(op.f('ix_lots_wine_id'), table_name='lots')
    op.drop_index(op.f('ix_lots_received_date'), table_name='lots')
    op.drop_index(op.f('ix_lots_id'), table_name='lots')
    op.drop_table('lots')
    
    op.drop_index(op.f('ix_wines_vintage'), table_name='wines')
    op.drop_index(op.f('ix_wines_type'), table_name='wines')
    op.drop_index(op.f('ix_wines_supplier_id'), table_name='wines')
    op.drop_index(op.f('ix_wines_name'), table_name='wines')
    op.drop_index(op.f('ix_wines_id'), table_name='wines')
    op.drop_index(op.f('ix_wines_denomination'), table_name='wines')
    op.drop_index(op.f('ix_wines_barcode'), table_name='wines')
    op.drop_table('wines')
    
    op.drop_index(op.f('ix_suppliers_vat_number'), table_name='suppliers')
    op.drop_index(op.f('ix_suppliers_name'), table_name='suppliers')
    op.drop_index(op.f('ix_suppliers_id'), table_name='suppliers')
    op.drop_table('suppliers')
