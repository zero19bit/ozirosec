import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, type AuthUser } from '../context/AuthContext';
import { VerificationPending } from './VerificationPending';

const unverifiedUser: AuthUser = {
  id: 11,
  username: 'pending-analyst',
  name: 'Pending Analyst',
  email: 'pending@example.test',
  role: 'user',
  suspended_at: null,
  email_verified_at: null,
};

const verifiedUser: AuthUser = {
  ...unverifiedUser,
  email_verified_at: '2026-06-17T12:00:00+00:00',
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
  document.cookie = 'XSRF-TOKEN=verify-xsrf';

  return Promise.resolve(new Response(null, { status: 204 }));
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

function renderPending(initialPath = '/verify-email') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/verify-email" element={<VerificationPending />} />
          <Route path="/dashboard" element={<div>dashboard</div>} />
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('VerificationPending', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'XSRF-TOKEN=; Max-Age=0';
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders the pending page with the authenticated email address', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { user: unverifiedUser } }))
      .mockResolvedValueOnce(progressResponse());

    renderPending();

    await expect(screen.findByText('Verify your email address')).resolves.toBeInTheDocument();
    expect(screen.getByText('pending@example.test')).toBeInTheDocument();
  });

  it('supports resend flow and cooldown', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { user: unverifiedUser } }))
      .mockResolvedValueOnce(progressResponse())
      .mockImplementationOnce(csrfResponse)
      .mockResolvedValueOnce(jsonResponse({ message: 'Verification link sent.', data: { verified: false } }));

    renderPending();

    await screen.findByText('Resend email');
    fireEvent.click(screen.getByText('Resend email'));

    await expect(screen.findByText('Verification email sent. Check your inbox.')).resolves.toBeInTheDocument();
    expect(screen.getByText('Resend in 60s')).toBeDisabled();
  });

  it('refreshes verification status and redirects when verified', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { user: unverifiedUser } }))
      .mockResolvedValueOnce(progressResponse())
      .mockResolvedValueOnce(jsonResponse({
        data: {
          verified: true,
          email: unverifiedUser.email,
          email_verified_at: verifiedUser.email_verified_at,
        },
      }))
      .mockResolvedValueOnce(jsonResponse({ data: { user: verifiedUser } }))
      .mockResolvedValueOnce(progressResponse());

    renderPending();

    await screen.findByText('I verified my email');
    fireEvent.click(screen.getByText('I verified my email'));

    await expect(screen.findByText('dashboard')).resolves.toBeInTheDocument();
  });

  it('redirects verified users away from the pending page', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: { user: verifiedUser } }))
      .mockResolvedValueOnce(progressResponse());

    renderPending();

    await expect(screen.findByText('dashboard')).resolves.toBeInTheDocument();
  });

  it('handles an expired authenticated session', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }));

    renderPending();

    await expect(screen.findByText('login-page')).resolves.toBeInTheDocument();
  });
});

