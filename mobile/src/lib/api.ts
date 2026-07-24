const DEFAULT_API_URL = 'http://localhost:8000';

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, getApiBaseUrl());
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function parseError(response: Response, path: string): Promise<Error> {
  let detail = String(response.status);
  try {
    const body = (await response.json()) as { detail?: string };
    if (body.detail) detail = body.detail;
  } catch {
    // ignore non-JSON error bodies
  }
  return new Error(`API ${path} failed: ${detail}`);
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = params ? buildUrl(path, params) : `${getApiBaseUrl()}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw await parseError(response, path);
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T, B = unknown>(
  path: string,
  body: B,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw await parseError(response, path);
  }
  return response.json() as Promise<T>;
}

export async function apiPatch<T, B = unknown>(
  path: string,
  body: B,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw await parseError(response, path);
  }
  return response.json() as Promise<T>;
}

export async function apiPut<T, B = unknown>(
  path: string,
  body: B,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw await parseError(response, path);
  }
  return response.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw await parseError(response, path);
  }
  // 204/empty success bodies must not be JSON-parsed.
}
