import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Uuid
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
