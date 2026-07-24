/**
 * Mirror shapes from backend/app/schemas/ and docs/SCHEMA_AND_API_CONTRACT.md.
 */

export type GrowthStage = 'budding' | 'small' | 'large' | 'mature';

/** Mirrors TREE_SPECIES in backend/app/services/world_trees.py. */
export type TreeSpecies = 'oak' | 'maple' | 'birch' | 'willow' | 'cedar';

export interface TreeState {
  patient_medication_id: string;
  species_key: TreeSpecies;
  growth_stage: GrowthStage;
  /** 1-5 while budding (day 2/4/7/10/13 thresholds); null otherwise. */
  budding_substage: number | null;
  /** 0-1 progress through the current stage; always 1 once mature. */
  stage_progress: number;
  accumulated_growth_days: number;
  can_press_today: boolean;
  last_press_date: string | null;
  /** Random position on the world/planet sphere, fixed at tree creation. */
  planet_lat: number;
  planet_lon: number;
}

export interface WorldSummary {
  trees: TreeState[];
  world_expansion_level: number;
}

export interface DailyPressResponse {
  tree: TreeState;
  pressed: boolean;
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
