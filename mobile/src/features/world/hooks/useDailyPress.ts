import { useCallback, useState } from 'react';

import { apiPost } from '../../../lib/api';
import type { DailyPressResponse } from '../../../lib/api-types';

export function useDailyPress(onSuccess?: () => void) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const press = useCallback(
    async (patientMedicationId: string) => {
      setPendingId(patientMedicationId);
      setError(null);
      try {
        const result = await apiPost<DailyPressResponse, Record<string, never>>(
          `/api/v1/me/trees/${patientMedicationId}/daily-press`,
          {},
        );
        onSuccess?.();
        return result;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Daily press failed'));
        return null;
      } finally {
        setPendingId(null);
      }
    },
    [onSuccess],
  );

  return { press, pendingId, error };
}
