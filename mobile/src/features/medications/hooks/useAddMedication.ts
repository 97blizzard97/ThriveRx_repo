import { useCallback, useState } from 'react';

import { apiPost } from '../../../lib/api';
import type {
  PatientMedication,
  PatientMedicationCreate,
} from '../../../lib/api-types';

export function useAddMedication(onSuccess?: () => void) {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addMedication = useCallback(
    async (payload: PatientMedicationCreate) => {
      setIsAdding(true);
      setError(null);
      try {
        await apiPost<PatientMedication, PatientMedicationCreate>(
          '/api/v1/me/medications',
          payload,
        );
        onSuccess?.();
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Add failed'));
        return false;
      } finally {
        setIsAdding(false);
      }
    },
    [onSuccess],
  );

  return { addMedication, isAdding, error };
}
