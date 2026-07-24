"""add tree planet placement

Revision ID: 0bc8509f156c
Revises: 5397f344a3a3
Create Date: 2026-07-24 16:02:22.278594

"""
import math
import random
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0bc8509f156c'
down_revision: Union[str, Sequence[str], None] = '5397f344a3a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _random_lat_lon() -> tuple[float, float]:
    """Mirrors app.services.world_trees.random_point_on_sphere.

    Duplicated here (not imported) since Alembic migrations should stay
    self-contained and not depend on application code that may change later.
    """
    u, v = random.random(), random.random()
    lat = math.degrees(math.asin(2 * u - 1))
    lon = 360.0 * v - 180.0
    return lat, lon


def upgrade() -> None:
    """Upgrade schema."""
    # Nullable first so backfilling pre-existing rows (if any) doesn't fail
    # under SQLite's lack of ALTER TABLE ... ADD COLUMN NOT NULL without a
    # constant default.
    with op.batch_alter_table("trees") as batch_op:
        batch_op.add_column(sa.Column("planet_lat", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("planet_lon", sa.Float(), nullable=True))

    trees = sa.table(
        "trees",
        sa.column("id", sa.Uuid()),
        sa.column("planet_lat", sa.Float()),
        sa.column("planet_lon", sa.Float()),
    )
    bind = op.get_bind()
    existing_ids = [row[0] for row in bind.execute(sa.select(trees.c.id))]
    for tree_id in existing_ids:
        lat, lon = _random_lat_lon()
        bind.execute(
            trees.update()
            .where(trees.c.id == tree_id)
            .values(planet_lat=lat, planet_lon=lon)
        )

    with op.batch_alter_table("trees") as batch_op:
        batch_op.alter_column("planet_lat", nullable=False)
        batch_op.alter_column("planet_lon", nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("trees") as batch_op:
        batch_op.drop_column("planet_lon")
        batch_op.drop_column("planet_lat")
