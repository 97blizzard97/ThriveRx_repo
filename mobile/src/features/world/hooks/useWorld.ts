import { useCallback, useEffect, useState } from 'react';

import { apiGet } from '../../../lib/api';
import type { WorldSummary } from '../../../lib/api-types';

export function useWorld() {
  const [world, setWorld] = useState<WorldSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiGet<WorldSummary>('/api/v1/me/world')
      .then((data) => {
        if (!cancelled) {
          setWorld(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setWorld(null);
          setError(err instanceof Error ? err : new Error('Request failed'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { world, isLoading, error, refetch };
}
