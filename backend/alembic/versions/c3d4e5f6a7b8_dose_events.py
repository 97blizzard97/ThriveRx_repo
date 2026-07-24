"""dose_events for today's Taken/Skip slots

Revision ID: c3d4e5f6a7b8
Revises: a1b2c3d4e5f6
Create Date: 2026-07-24 20:55:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "dose_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("patient_medication_id", sa.Uuid(), nullable=False),
        sa.Column("local_date", sa.Date(), nullable=False),
        sa.Column("time_local", sa.String(length=5), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["patient_medication_id"],
            ["patient_medications.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "patient_medication_id",
            "local_date",
            "time_local",
            name="uq_dose_events_med_date_time",
        ),
    )
    op.create_index(
        op.f("ix_dose_events_patient_medication_id"),
        "dose_events",
        ["patient_medication_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_dose_events_local_date"),
        "dose_events",
        ["local_date"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_dose_events_local_date"), table_name="dose_events")
    op.drop_index(
        op.f("ix_dose_events_patient_medication_id"), table_name="dose_events"
    )
    op.drop_table("dose_events")
