/**
 * Mirror shapes from backend/app/schemas/ and docs/SCHEMA_AND_API_CONTRACT.md.
 * Prefer OpenAPI codegen later; hand-maintain until the API stabilises.
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
