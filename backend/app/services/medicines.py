"""Medication catalog and patient list — med core module."""

from uuid import UUID

from app.schemas.medications import (
    MedicineDetail,
    MedicineSummary,
    PatientMedication,
    PatientMedicationCreate,
)


def search_medicines(query: str) -> list[MedicineSummary]:
    _ = query
    return []


def get_medicine(medicine_id: UUID) -> MedicineDetail | None:
    _ = medicine_id
    return None


def list_patient_medications(user_id: UUID) -> list[PatientMedication]:
    _ = user_id
    return []


def add_patient_medication(
    user_id: UUID, payload: PatientMedicationCreate
) -> PatientMedication:
    _ = user_id, payload
    raise NotImplementedError("Stub — implement with DB")


def remove_patient_medication(user_id: UUID, patient_medication_id: UUID) -> None:
    _ = user_id, patient_medication_id
    raise NotImplementedError("Stub — implement with DB")
