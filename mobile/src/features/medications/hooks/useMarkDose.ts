import { useCallback, useState } from 'react';

import { apiPut } from '../../../lib/api';
import type {
  DoseMarkRequest,
  DoseMarkResponse,
  DoseStatus,
} from '../../../lib/api-types';

export function useMarkDose(onSuccess?: () => void) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const markDose = useCallback(
    async (
      patientMedicationId: string,
      timeLocal: string,
      status: DoseStatus,
    ) => {
      const key = `${patientMedicationId}:${timeLocal}`;
      setPendingKey(key);
      setError(null);
      try {
        const result = await apiPut<DoseMarkResponse, DoseMarkRequest>(
          `/api/v1/me/doses/${patientMedicationId}`,
          { time_local: timeLocal, status },
        );
        onSuccess?.();
        return result;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Mark dose failed'));
        return null;
      } finally {
        setPendingKey(null);
      }
    },
    [onSuccess],
  );

  return { markDose, pendingKey, error };
}
