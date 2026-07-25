import { useCallback, useState } from 'react';

import { apiScanScript } from '../../../lib/scan-api';
import type { ScanMatch, ScanScriptResponse } from '../../../lib/api-types';

export function useScanScript() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ScanScriptResponse | null>(null);

  const scan = useCallback(
    async (options: {
      uri?: string | null;
      mimeType?: string | null;
      fileName?: string | null;
      textHint?: string;
    }) => {
      setIsScanning(true);
      setError(null);
      try {
        const data = await apiScanScript(options);
        setResult(data);
        return data;
      } catch (err: unknown) {
        setResult(null);
        const next = err instanceof Error ? err : new Error('Scan failed');
        setError(next);
        return null;
      } finally {
        setIsScanning(false);
      }
    },
    [],
  );

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    scan,
    clear,
    isScanning,
    error,
    result,
    matches: (result?.matches ?? []) as ScanMatch[],
    extractedText: result?.extracted_text ?? '',
  };
}
