import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AuthProvider, useAuth, type AuthUser } from './AuthContext';

const user: AuthUser = {
  id: 7,
  username: 'security-analyst',
  name: 'Security Analyst',
  email: 'analyst@example.test',
  role: 'user',
  suspended_at: null,
  email_verified_at: null,
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

function csrfResponse() {
  document.cookie = 'XSRF-TOKEN=context-xsrf';

  return Promise.resolve(new Response(null, { status: 204 }));
}

function progressResponse() {
  return jsonResponse({
    data: {
      completed_labs: ['authority-lab'],
      total_xp: 40,
      progress: [],
    },
  });
}

function Harness() {
  const { user: currentUser, isAuthenticated, isLoading, login, logout, logoutAllDevices, register } = useAuth();

  if (isLoading) {
    return <div>loading</div>;
  }

  return (
    <div>
      <div data-testid="status">{isAuthenticated ? 'authenticated' : 'guest'}</div>
      <div data-testid="name">{currentUser?.name ?? 'none'}</div>
      <button onClick={() => login({ email: 'analyst@example.test', password: 'StrongPass!42' })}>login</button>
      <button onClick={() => register({ username: 'newanalyst', email: 'new@example.test', password: 'StrongPass!42' })}>register</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => logoutAllDevices('StrongPass!42')}>logout-all</button>
    </div>
  );
}

function renderAuth(ui = <Harness />, route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

describe('AuthProvider cookie session flow', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'XSRF-TOKEN=; Max-Age=0';
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('hydrates the current user from the server on startup', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { user } }))
      .mockResolvedValueOnce(progressResponse());

    renderAuth();

    await expect(screen.findByTestId('name')).resolves.toHaveTextContent('Security Analyst');
    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
  });

  it('handles the login flow without writing auth tokens to browser storage', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }))
      .mockImplementationOnce(csrfResponse)
      .mockResolvedValueOnce(jsonResponse({ data: { user } }))
      .mockResolvedValueOnce(progressResponse());

    renderAuth();

    await screen.findByText('guest');
    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(sessionStorage.getItem('hackpath-auth-token')).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('handles registration without expecting token fields', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }))
      .mockImplementationOnce(csrfResponse)
      .mockResolvedValueOnce(jsonResponse({ data: { user: { ...user, name: 'New Analyst' } } }))
      .mockResolvedValueOnce(progressResponse());

    renderAuth();

    await screen.findByText('guest');
    fireEvent.click(screen.getByText('register'));

    await expect(screen.findByText('New Analyst')).resolves.toBeInTheDocument();
    expect(sessionStorage.getItem('hackpath-auth-token')).toBeNull();
  });

  it('clears user state after an expired session or 401 response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }));

    renderAuth();

    await expect(screen.findByTestId('status')).resolves.toHaveTextContent('guest');
  });

  it('refreshes csrf and clears state on logout', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { user } }))
      .mockResolvedValueOnce(progressResponse())
      .mockImplementationOnce(csrfResponse)
      .mockResolvedValueOnce(jsonResponse({ data: { authenticated: false } }));

    renderAuth();

    await screen.findByText('authenticated');
    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('guest'));
  });

  it('logs out all devices with current password and clears only auth state', async () => {
    localStorage.setItem('hackpath-locale', 'fa');
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { user } }))
      .mockResolvedValueOnce(progressResponse())
      .mockImplementationOnce(csrfResponse)
      .mockResolvedValueOnce(jsonResponse({ data: { authenticated: false } }));

    renderAuth();

    await screen.findByText('authenticated');
    fireEvent.click(screen.getByText('logout-all'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('guest'));
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/auth/logout-all'),
      expect.objectContaining({
        credentials: 'include',
        body: JSON.stringify({ current_password: 'StrongPass!42' }),
      }),
    );
    expect(localStorage.getItem('hackpath-locale')).toBe('fa');
  });

  it('keeps protected routes dependent on server-confirmed authentication', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>dashboard</div>} />
            </Route>
            <Route path="/login" element={<div>login-page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await expect(screen.findByText('login-page')).resolves.toBeInTheDocument();
  });
});

