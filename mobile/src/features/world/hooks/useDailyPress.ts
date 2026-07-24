import { useCallback, useState } from 'react';

import { apiPost } from '../../../lib/api';
import type { DailyPressResponse } from '../../../lib/api-types';

export function useDailyPress(onSuccess?: (result: DailyPressResponse) => void) {
  const [isPressing, setIsPressing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const press = useCallback(
    async (patientMedicationId: string) => {
      setIsPressing(true);
      setError(null);
      try {
        const result = await apiPost<DailyPressResponse>(
          `/api/v1/me/trees/${patientMedicationId}/daily-press`,
          {},
        );
        onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        const asError = err instanceof Error ? err : new Error('Press failed');
        setError(asError);
        return null;
      } finally {
        setIsPressing(false);
      }
    },
    [onSuccess],
  );

  return { press, isPressing, error };
}
