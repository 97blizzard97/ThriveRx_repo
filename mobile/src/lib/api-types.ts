/**
 * Mirror shapes from backend/app/schemas/ and docs/SCHEMA_AND_API_CONTRACT.md.
 */

export type GrowthStage = 'budding' | 'small' | 'large' | 'mature';

export interface TreeState {
  patient_medication_id: string;
  species_key: string;
  growth_stage: GrowthStage;
  accumulated_growth_days: number;
  can_press_today: boolean;
  last_press_date: string | null;
}

export interface WorldSummary {
  trees: TreeState[];
  world_expansion_level: number;
}

export interface MedicineSummary {
  id: string;
  display_name: string;
}

export interface MedicineDetail extends MedicineSummary {
  what_its_for: string;
  how_usually_taken: string;
  common_side_effects: string;
  check_with_pharmacist_if: string;
  translation_reviewed: boolean;
}

export interface PatientMedication {
  id: string;
  medicine_id: string;
  indication_key: string | null;
  added_at: string;
}

export interface PatientMedicationCreate {
  medicine_id: string;
  indication_key?: string | null;
}
