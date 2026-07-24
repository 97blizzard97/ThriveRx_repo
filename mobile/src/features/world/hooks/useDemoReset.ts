import { useCallback, useState } from 'react';

import { apiPost } from '../../../lib/api';
import type { DemoResetResponse } from '../../../lib/api-types';

export function useDemoReset(onSuccess?: () => void) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(async () => {
    setIsPending(true);
    setError(null);
    try {
      const result = await apiPost<DemoResetResponse, Record<string, never>>(
        '/api/v1/me/world/demo/reset',
        {},
      );
      onSuccess?.();
      return result;
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Demo reset failed'));
      return null;
    } finally {
      setIsPending(false);
    }
  }, [onSuccess]);

  return { reset, isPending, error };
}
