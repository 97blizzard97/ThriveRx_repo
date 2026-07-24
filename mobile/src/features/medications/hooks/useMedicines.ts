import { useCallback, useEffect, useState } from 'react';

import { apiGet } from '../../../lib/api';
import type { MedicineDetail, PatientMedication } from '../../../lib/api-types';

export function useMedicines() {
  const [medicines, setMedicines] = useState<PatientMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiGet<PatientMedication[]>('/api/v1/me/medications')
      .then((data) => {
        if (!cancelled) {
          setMedicines(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMedicines([]);
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

  return { medicines, isLoading, error, refetch };
}

export function useMyMedicationDetails(medicines: PatientMedication[]) {
  const [detailsByMedicineId, setDetailsByMedicineId] = useState<
    Record<string, MedicineDetail>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (medicines.length === 0) {
      setDetailsByMedicineId({});
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    Promise.all(
      medicines.map((item) =>
        apiGet<MedicineDetail>(`/api/v1/medicines/${item.medicine_id}`),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        const next: Record<string, MedicineDetail> = {};
        for (const detail of results) {
          next[detail.id] = detail;
        }
        setDetailsByMedicineId(next);
      })
      .catch(() => {
        if (!cancelled) setDetailsByMedicineId({});
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [medicines]);

  return { detailsByMedicineId, isLoading };
}
