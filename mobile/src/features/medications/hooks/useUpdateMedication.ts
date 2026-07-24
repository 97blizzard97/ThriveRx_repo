import { useCallback, useState } from 'react';

import { apiPatch } from '../../../lib/api';
import type {
  PatientMedication,
  PatientMedicationUpdate,
} from '../../../lib/api-types';

export function useUpdateMedication(onSuccess?: () => void) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMedication = useCallback(
    async (patientMedicationId: string, payload: PatientMedicationUpdate) => {
      setIsUpdating(true);
      setError(null);
      try {
        await apiPatch<PatientMedication, PatientMedicationUpdate>(
          `/api/v1/me/medications/${patientMedicationId}`,
          payload,
        );
        onSuccess?.();
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Update failed'));
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [onSuccess],
  );

  return { updateMedication, isUpdating, error };
}
