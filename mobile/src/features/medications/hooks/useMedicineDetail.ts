import { useCallback, useEffect, useState } from 'react';

import { apiGet } from '../../../lib/api';
import type { MedicineDetail } from '../../../lib/api-types';

export function useMedicineDetail(medicineId: string | null) {
  const [detail, setDetail] = useState<MedicineDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<MedicineDetail>(`/api/v1/medicines/${id}`);
      setDetail(data);
    } catch (err: unknown) {
      setDetail(null);
      setError(err instanceof Error ? err : new Error('Load failed'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!medicineId) {
      setDetail(null);
      setError(null);
      return;
    }
    load(medicineId);
  }, [load, medicineId]);

  return { detail, isLoading, error };
}
