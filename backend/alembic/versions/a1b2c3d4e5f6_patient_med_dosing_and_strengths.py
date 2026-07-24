"""patient med dosing and medicine common_strengths

Revision ID: a1b2c3d4e5f6
Revises: 5397f344a3a3
Create Date: 2026-07-24 20:15:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "5397f344a3a3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "medicines",
        sa.Column("common_strengths", sa.JSON(), nullable=True),
    )
    with op.batch_alter_table("patient_medications") as batch_op:
        batch_op.add_column(
            sa.Column(
                "form",
                sa.String(length=32),
                nullable=False,
                server_default="tablet",
            )
        )
        batch_op.add_column(
            sa.Column(
                "dose_amount",
                sa.Float(),
                nullable=False,
                server_default="0",
            )
        )
        batch_op.add_column(
            sa.Column(
                "dose_unit",
                sa.String(length=16),
                nullable=False,
                server_default="mg",
            )
        )
        batch_op.add_column(
            sa.Column(
                "frequency_code",
                sa.String(length=16),
                nullable=False,
                server_default="od",
            )
        )
        batch_op.add_column(sa.Column("with_food", sa.Boolean(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("patient_medications") as batch_op:
        batch_op.drop_column("with_food")
        batch_op.drop_column("frequency_code")
        batch_op.drop_column("dose_unit")
        batch_op.drop_column("dose_amount")
        batch_op.drop_column("form")
    op.drop_column("medicines", "common_strengths")
