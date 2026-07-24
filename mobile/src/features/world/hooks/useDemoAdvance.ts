import { useCallback, useState } from 'react';

import { apiPost } from '../../../lib/api';
import type { DemoAdvanceResponse } from '../../../lib/api-types';

export function useDemoAdvance(onSuccess?: () => void) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const advance = useCallback(
    async (days: number) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await apiPost<DemoAdvanceResponse, { days: number }>(
          '/api/v1/me/world/demo/advance',
          { days },
        );
        onSuccess?.();
        return result;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Demo advance failed'));
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [onSuccess],
  );

  return { advance, isPending, error };
}
