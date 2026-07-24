import { useCallback, useState } from 'react';

import { apiPut } from '../../../lib/api';
import type { ReminderSchedule } from '../../../lib/api-types';

const DEFAULT_TIMEZONE = 'Australia/Sydney';

export function useSaveReminder() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveReminder = useCallback(
    async (patientMedicationId: string, timesLocal: string[]) => {
      setIsSaving(true);
      setError(null);
      try {
        await apiPut<ReminderSchedule, ReminderSchedule>(
          `/api/v1/me/reminders/${patientMedicationId}`,
          {
            patient_medication_id: patientMedicationId,
            times_local: timesLocal,
            timezone: DEFAULT_TIMEZONE,
          },
        );
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Save times failed'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return { saveReminder, isSaving, error };
}
