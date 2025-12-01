"""add translations table for localized labels

Revision ID: 20251127_1550
Revises: 001_initial_schema
Create Date: 2025-11-27 17:50:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String

# revision identifiers, used by Alembic.
revision = '20251127_1550'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'translations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('code', sa.String(length=100), nullable=False),
        sa.Column('label_it', sa.String(length=255), nullable=False),
        sa.Column('label_en', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.UniqueConstraint('category', 'code', name='uq_translation_category_code')
    )
    op.create_index('ix_translations_category', 'translations', ['category'])
    op.create_index('ix_translations_code', 'translations', ['code'])

    translation_table = table(
        'translations',
        column('category', String(50)),
        column('code', String(100)),
        column('label_it', String(255)),
        column('label_en', String(255)),
    )

    op.bulk_insert(
        translation_table,
        [
            {'category': 'wine_type', 'code': 'red', 'label_it': 'Rosso', 'label_en': 'Red'},
            {'category': 'wine_type', 'code': 'white', 'label_it': 'Bianco', 'label_en': 'White'},
            {'category': 'wine_type', 'code': 'rose', 'label_it': 'Rosato', 'label_en': 'Rosé'},
            {'category': 'wine_type', 'code': 'sparkling', 'label_it': 'Spumante', 'label_en': 'Sparkling'},
            {'category': 'wine_type', 'code': 'dessert', 'label_it': 'Passito', 'label_en': 'Dessert'},
            {'category': 'wine_type', 'code': 'other', 'label_it': 'Altro', 'label_en': 'Other'},
        ]
    )


def downgrade() -> None:
    op.drop_index('ix_translations_code', table_name='translations')
    op.drop_index('ix_translations_category', table_name='translations')
    op.drop_table('translations')
