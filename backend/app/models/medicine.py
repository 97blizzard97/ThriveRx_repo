import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    String,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database import Base

if TYPE_CHECKING:
    from app.models.tree import Tree


class Medicine(Base):
    __tablename__ = "medicines"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    names: Mapped[dict] = mapped_column(JSON, default=dict)
    content: Mapped[dict] = mapped_column(JSON, default=dict)
    source_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    common_strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)


class PatientMedication(Base):
    __tablename__ = "patient_medications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    medicine_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("medicines.id", ondelete="RESTRICT"), index=True
    )
    indication_key: Mapped[str | None] = mapped_column(String(64), nullable=True)
    form: Mapped[str] = mapped_column(String(32), nullable=False)
    dose_amount: Mapped[float] = mapped_column(Float, nullable=False)
    dose_unit: Mapped[str] = mapped_column(String(16), nullable=False)
    frequency_code: Mapped[str] = mapped_column(String(16), nullable=False)
    with_food: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    tree: Mapped["Tree | None"] = relationship(
        "Tree", back_populates="patient_medication", uselist=False
    )


class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    patient_medication_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("patient_medications.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )
    times_local: Mapped[list] = mapped_column(JSON, default=list)
    timezone: Mapped[str] = mapped_column(String(64), default="Australia/Sydney")


class DoseEvent(Base):
    """Today's slot outcome for a patient med (schedule UX, not scoring)."""

    __tablename__ = "dose_events"
    __table_args__ = (
        UniqueConstraint(
            "patient_medication_id",
            "local_date",
            "time_local",
            name="uq_dose_events_med_date_time",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    patient_medication_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("patient_medications.id", ondelete="CASCADE"),
        index=True,
    )
    local_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    time_local: Mapped[str] = mapped_column(String(5), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
