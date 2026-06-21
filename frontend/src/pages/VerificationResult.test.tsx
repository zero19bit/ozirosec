import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { VerificationError } from './VerificationError';
import { VerificationSuccess } from './VerificationSuccess';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}

function renderResult(path: string, element: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/verify-email/success" element={element} />
          <Route path="/verify-email/error" element={element} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Verification result pages', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('shows success even when the verification link was opened outside an authenticated browser session', async () => {
    renderResult('/verify-email/success', <VerificationSuccess />);

    await expect(screen.findByText('Email verified')).resolves.toBeInTheDocument();
    expect(screen.getByText('Log in to continue')).toBeInTheDocument();
  });

  it('explains expired links without exposing backend details', async () => {
    renderResult('/verify-email/error?reason=expired', <VerificationError />);

    await expect(screen.findByText('Verification link unavailable')).resolves.toBeInTheDocument();
    expect(screen.getByText(/has expired/i)).toBeInTheDocument();
    expect(screen.getByText('Log in to request a new link')).toBeInTheDocument();
  });
});
