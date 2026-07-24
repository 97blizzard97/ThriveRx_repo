import { useCallback, useEffect, useState } from 'react';

import { apiGet } from '../../../lib/api';
import type { Locale } from '../../../i18n';
import type { TodayDoseMedication } from '../../../lib/api-types';

export function useTodayDoses(locale: Locale) {
  const [doses, setDoses] = useState<TodayDoseMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<TodayDoseMedication[]>(
        '/api/v1/me/doses/today',
        { locale },
      );
      setDoses(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Load doses failed'));
      setDoses([]);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { doses, isLoading, error, refetch };
}
