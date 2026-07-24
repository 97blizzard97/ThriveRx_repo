/**
 * Mirror shapes from backend/app/schemas/ and docs/SCHEMA_AND_API_CONTRACT.md.
 */

export type GrowthStage = 'budding' | 'small' | 'large' | 'mature';

export type MedicationForm = 'tablet' | 'capsule' | 'liquid' | 'inhaler';

export type DoseUnit = 'mg' | 'g' | 'mL' | 'mcg' | 'puff';

export type FrequencyCode = 'od' | 'bd' | 'tds' | 'qds' | 'mane' | 'nocte';

export type DoseStatus = 'taken' | 'skipped';

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

export interface CommonStrength {
  amount: number;
  unit: DoseUnit | string;
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
  common_strengths: CommonStrength[];
}

export interface PatientMedication {
  id: string;
  medicine_id: string;
  indication_key: string | null;
  form: MedicationForm;
  dose_amount: number;
  dose_unit: DoseUnit;
  frequency_code: FrequencyCode;
  with_food: boolean | null;
  added_at: string;
  times_local: string[];
}

export interface PatientMedicationCreate {
  medicine_id: string;
  indication_key?: string | null;
  form: MedicationForm;
  dose_amount: number;
  dose_unit: DoseUnit;
  frequency_code: FrequencyCode;
  with_food?: boolean | null;
}

export interface PatientMedicationUpdate {
  form: MedicationForm;
  dose_amount: number;
  dose_unit: DoseUnit;
  frequency_code: FrequencyCode;
  with_food?: boolean | null;
}

export interface ReminderSchedule {
  patient_medication_id: string;
  times_local: string[];
  timezone: string;
}

export interface DoseSlot {
  time_local: string;
  status: DoseStatus | null;
}

export interface TodayDoseMedication {
  patient_medication_id: string;
  medicine_id: string;
  display_name: string;
  local_date: string;
  slots: DoseSlot[];
  all_taken: boolean;
  can_grow_today: boolean;
}

export interface DoseMarkRequest {
  time_local: string;
  status: DoseStatus;
}

export interface DoseMarkResponse {
  patient_medication_id: string;
  local_date: string;
  time_local: string;
  status: DoseStatus;
  all_taken: boolean;
  daily_press_recorded: boolean;
}

/** Matches backend FREQUENCY_DEFAULT_TIMES — schedule prompts only. */
export const FREQUENCY_DEFAULT_TIMES: Record<FrequencyCode, string[]> = {
  od: ['08:00'],
  mane: ['08:00'],
  nocte: ['21:00'],
  bd: ['08:00', '20:00'],
  tds: ['08:00', '14:00', '20:00'],
  qds: ['08:00', '12:00', '16:00', '20:00'],
};

export function defaultTimesForFrequency(code: FrequencyCode): string[] {
  return [...FREQUENCY_DEFAULT_TIMES[code]];
}
