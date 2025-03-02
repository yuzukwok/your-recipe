"""add_actual_time_to_cooking_record

Revision ID: 0fea094ba168
Revises: e7c9c14b46af
Create Date: 2025-03-01 23:35:26.534244

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0fea094ba168'
down_revision = 'e7c9c14b46af'
branch_labels = None
depends_on = None


def upgrade():
    # 向烹饪记录表添加actual_time字段
    op.add_column('cooking_records', sa.Column('actual_time', sa.Integer(), nullable=True))


def downgrade():
    # 从烹饪记录表中删除actual_time字段
    op.drop_column('cooking_records', 'actual_time') 