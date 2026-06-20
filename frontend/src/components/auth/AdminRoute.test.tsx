import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, type AuthUser } from '../../context/AuthContext';
import { AdminRoute } from './AdminRoute';

const baseUser: AuthUser = {
  id: 1,
  username: 'analyst',
  name: 'Analyst',
  email: 'analyst@example.test',
  role: 'user',
  suspended_at: null,
  email_verified_at: '2026-06-18T00:00:00+00:00',
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

function progressResponse() {
  return jsonResponse({
    data: {
      completed_labs: [],
      total_xp: 0,
      progress: [],
    },
  });
}

function renderAdminRoute(userResponse: Response) {
  const fetchMock = vi.fn<typeof fetch>()
    .mockResolvedValueOnce(userResponse)
    .mockResolvedValueOnce(progressResponse());

  vi.stubGlobal('fetch', fetchMock);

  render(
    <MemoryRouter initialEntries={['/admin']}>
      <AuthProvider>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<div>admin-panel</div>} />
          </Route>
          <Route path="/dashboard" element={<div>dashboard</div>} />
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AdminRoute', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('allows server-confirmed administrators into admin UI', async () => {
    renderAdminRoute(jsonResponse({ data: { user: { ...baseUser, role: 'admin' } } }));

    await expect(screen.findByText('admin-panel')).resolves.toBeInTheDocument();
  });

  it('redirects regular authenticated users away from admin UI', async () => {
    renderAdminRoute(jsonResponse({ data: { user: baseUser } }));

    await expect(screen.findByText('dashboard')).resolves.toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }));

    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div>admin-panel</div>} />
            </Route>
            <Route path="/dashboard" element={<div>dashboard</div>} />
            <Route path="/login" element={<div>login-page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await expect(screen.findByText('login-page')).resolves.toBeInTheDocument();
  });
});

