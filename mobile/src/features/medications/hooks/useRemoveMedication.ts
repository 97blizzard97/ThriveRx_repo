import { useCallback, useState } from 'react';

import { apiDelete } from '../../../lib/api';

export function useRemoveMedication(onSuccess?: () => void) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const removeMedication = useCallback(
    async (patientMedicationId: string) => {
      setIsRemoving(true);
      setError(null);
      try {
        await apiDelete(`/api/v1/me/medications/${patientMedicationId}`);
        onSuccess?.();
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Remove failed'));
        return false;
      } finally {
        setIsRemoving(false);
      }
    },
    [onSuccess],
  );

  return { removeMedication, isRemoving, error };
}
