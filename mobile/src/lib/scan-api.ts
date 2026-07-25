import { Platform } from 'react-native';

import { getApiBaseUrl } from './api';
import type { ScanScriptResponse } from './api-types';

async function parseError(response: Response, path: string): Promise<Error> {
  let detail = String(response.status);
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === 'string') {
      detail = body.detail;
    } else if (body.detail != null) {
      detail = JSON.stringify(body.detail);
    }
  } catch {
    // ignore
  }
  return new Error(`API ${path} failed: ${detail}`);
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Could not read the selected photo');
  }
  return response.blob();
}

/** Resize + JPEG-encode in the browser so HEIC/large camera shots upload reliably. */
async function blobToJpegBase64(
  blob: Blob,
  maxEdge = 1600,
  quality = 0.72,
): Promise<string> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob);
    try {
      const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.drawImage(bitmap, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      return dataUrl;
    } finally {
      bitmap.close();
    }
  }

  // Fallback: raw base64 without resize.
  const buffer = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return `data:${blob.type || 'image/jpeg'};base64,${btoa(binary)}`;
}

/** multipart upload for script scan (image and/or text_hint). */
export async function apiScanScript(options: {
  uri?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
  textHint?: string;
}): Promise<ScanScriptResponse> {
  const path = '/api/v1/scan/script';
  const form = new FormData();
  const hint = options.textHint?.trim() ?? '';
  if (hint) {
    form.append('text_hint', hint);
  }

  if (options.uri) {
    const name = options.fileName ?? 'script.jpg';
    const type = options.mimeType ?? 'image/jpeg';
    if (Platform.OS === 'web') {
      // Prefer base64 string fields — mobile Safari / Cloudflare often strip
      // multipart filenames so FastAPI rejects the file part as a string.
      const blob = await uriToBlob(options.uri);
      const dataUrl = await blobToJpegBase64(blob);
      form.append('image_base64', dataUrl);
    } else {
      form.append('file', {
        uri: options.uri,
        name,
        type,
      } as unknown as Blob);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw await parseError(response, path);
    }
    return response.json() as Promise<ScanScriptResponse>;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Scan timed out — try a clearer, closer photo');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
