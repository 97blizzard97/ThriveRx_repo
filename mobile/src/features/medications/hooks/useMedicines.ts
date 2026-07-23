import { useEffect, useState } from 'react';

import { apiGet } from '../../../lib/api';

interface PatientMedication {
  id: string;
  medicine_id: string;
  indication_key: string | null;
  added_at: string;
}

/** Med core — GET /api/v1/me/medications */
export function useMedicines() {
  const [medicines, setMedicines] = useState<PatientMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
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
  }, []);

  return { medicines, isLoading, error };
}
