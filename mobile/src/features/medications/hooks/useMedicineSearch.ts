import { useCallback, useEffect, useRef, useState } from 'react';

import { apiGet } from '../../../lib/api';
import type { Locale } from '../../../i18n';
import type { MedicineSummary } from '../../../lib/api-types';

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 1;

export function useMedicineSearch(locale: Locale) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MedicineSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const runSearch = useCallback(
    async (searchQuery: string) => {
      const q = searchQuery.trim();
      const requestId = ++requestIdRef.current;

      if (q.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setError(null);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setError(null);
      try {
        const data = await apiGet<MedicineSummary[]>(
          '/api/v1/medicines/search',
          { q, locale },
        );
        if (requestId !== requestIdRef.current) return;
        setResults(data);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        setResults([]);
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        if (requestId === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    },
    [locale],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      void runSearch(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query, runSearch]);

  const searchNow = useCallback(() => {
    void runSearch(query);
  }, [query, runSearch]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    search: searchNow,
  };
}
