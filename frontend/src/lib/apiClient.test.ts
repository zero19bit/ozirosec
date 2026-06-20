import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from './apiClient';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

describe('apiFetch', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    document.cookie = 'XSRF-TOKEN=secure-xsrf';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    document.cookie = 'XSRF-TOKEN=; Max-Age=0';
  });

  it('includes credentials and csrf headers without bearer authorization', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ data: { ok: true } }));

    await expect(apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'analyst@example.test', password: 'StrongPass!42' }),
    })).resolves.toEqual({ data: { ok: true } });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:8000/api/v1/login',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.any(Headers),
      }),
    );

    const headers = fetchMock.mock.calls[1][1]?.headers as Headers;
    expect(headers.get('X-XSRF-TOKEN')).toBe('secure-xsrf');
    expect(headers.has('Authorization')).toBe(false);
  });

  it('refreshes csrf once after a 419 response', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'CSRF token mismatch.' }, { status: 419 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ data: { ok: true } }));

    await expect(apiFetch('/logout', { method: 'POST' })).resolves.toEqual({ data: { ok: true } });

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('calls the unauthorized handler for 401 responses', async () => {
    const onUnauthorized = vi.fn();

    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }));

    await expect(apiFetch('/user', { onUnauthorized })).rejects.toThrow('Unauthenticated.');

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
});

