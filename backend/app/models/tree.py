import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.schemas.common import GrowthStage

if TYPE_CHECKING:
    from app.models.medicine import PatientMedication


class Tree(Base):
    __tablename__ = "trees"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    patient_medication_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("patient_medications.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )
    species_key: Mapped[str] = mapped_column(String(32))
    growth_stage: Mapped[str] = mapped_column(
        String(16), default=GrowthStage.budding.value
    )
    accumulated_growth_days: Mapped[int] = mapped_column(Integer, default=0)
    last_press_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    patient_medication: Mapped["PatientMedication"] = relationship(
        "PatientMedication", back_populates="tree"
    )
