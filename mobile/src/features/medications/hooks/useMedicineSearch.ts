import { useCallback, useState } from 'react';

import { apiGet } from '../../../lib/api';
import type { MedicineSummary } from '../../../lib/api-types';

export function useMedicineSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MedicineSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    setIsSearching(true);
    setError(null);
    try {
      const data = await apiGet<MedicineSummary[]>('/api/v1/medicines/search', {
        q,
      });
      setResults(data);
    } catch (err: unknown) {
      setResults([]);
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  return { query, setQuery, results, isSearching, error, search };
}
