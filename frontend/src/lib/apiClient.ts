export type ApiFetchOptions = RequestInit & {
  skipUnauthorizedHandler?: boolean;
  skipCsrfRefresh?: boolean;
  onUnauthorized?: () => void;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

const defaultBackendOrigin = typeof window === 'undefined'
  ? 'http://localhost:8000'
  : `${window.location.protocol}//${window.location.hostname}:8000`;

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? `${defaultBackendOrigin}/api/v1`;

export const SANCTUM_CSRF_URL =
  (import.meta.env.VITE_SANCTUM_CSRF_URL as string | undefined) ?? `${defaultBackendOrigin}/sanctum/csrf-cookie`;

function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function shouldUseCsrf(method: string): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

export async function ensureCsrfCookie(): Promise<void> {
  const response = await fetch(SANCTUM_CSRF_URL, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to initialize secure session.');
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('Content-Type') ?? '';

  return contentType.includes('application/json') ? response.json() : null;
}

function validationMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || !('errors' in payload)) {
    return null;
  }

  const errors = (payload as { errors?: Record<string, unknown> }).errors;

  if (!errors) {
    return null;
  }

  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
}

async function request<T>(path: string, options: ApiFetchOptions, csrfRetryUsed: boolean): Promise<T> {
  const {
    skipUnauthorizedHandler,
    skipCsrfRefresh,
    onUnauthorized,
    headers,
    ...init
  } = options;
  const method = init.method ?? 'GET';

  if (shouldUseCsrf(method) && !skipCsrfRefresh) {
    await ensureCsrfCookie();
  }

  const requestHeaders = new Headers(headers);
  const xsrfToken = getCookie('XSRF-TOKEN');

  requestHeaders.set('Accept', 'application/json');

  if (!(init.body instanceof FormData) && init.body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (xsrfToken && !requestHeaders.has('X-XSRF-TOKEN')) {
    requestHeaders.set('X-XSRF-TOKEN', xsrfToken);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: 'include',
    headers: requestHeaders,
  });

  if (response.status === 419 && !csrfRetryUsed && shouldUseCsrf(method)) {
    await ensureCsrfCookie();

    return request<T>(path, { ...options, skipCsrfRefresh: true }, true);
  }

  if (response.status === 401 && !skipUnauthorizedHandler) {
    onUnauthorized?.();
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      validationMessage(payload) ||
      (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : 'Request failed.');

    const code = payload && typeof payload === 'object' && 'code' in payload && typeof payload.code === 'string'
      ? payload.code
      : undefined;

    throw new ApiRequestError(message, response.status, code);
  }

  return payload as T;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return request<T>(path, options, false);
}

