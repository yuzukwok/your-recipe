"""Add main_image_id to Recipe model

Revision ID: fb19c131c0ee
Revises: d53f4632bc0b
Create Date: 2025-03-01 21:36:12.498133

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fb19c131c0ee'
down_revision = 'd53f4632bc0b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('recipes', sa.Column('main_image_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'recipes', 'images', ['main_image_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'recipes', type_='foreignkey')
    op.drop_column('recipes', 'main_image_id')
    # ### end Alembic commands ### 