import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../i18n/LanguageContext';
import { Login } from './Login';
import { Register } from './Register';

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
  document.cookie = 'XSRF-TOKEN=form-xsrf';

  return Promise.resolve(new Response(null, { status: 204 }));
}

function renderAuthPage(path: '/login' | '/register') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<div>dashboard</div>} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

async function waitForInitialUserRequest(fetchMock: ReturnType<typeof vi.fn<typeof fetch>>) {
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/user'),
    expect.objectContaining({ credentials: 'include' }),
  ));
}

describe('authentication form API error rendering', () => {
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
  });

  it('renders login validation errors from the API envelope', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }))
      .mockImplementationOnce(csrfResponse)
      .mockResolvedValueOnce(jsonResponse({
        message: 'The given data was invalid.',
        errors: {
          email: ['These credentials do not match our records.'],
        },
      }, { status: 422 }));

    renderAuthPage('/login');

    await screen.findByText('Welcome back');
    await waitForInitialUserRequest(fetchMock);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@example.test' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'WrongPass!42' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await expect(screen.findByText('These credentials do not match our records.')).resolves.toBeInTheDocument();
  });

  it('renders registration validation errors from the API envelope', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }))
      .mockImplementationOnce(csrfResponse)
      .mockResolvedValueOnce(jsonResponse({
        message: 'The given data was invalid.',
        errors: {
          username: ['The username has already been taken.'],
        },
      }, { status: 422 }));

    renderAuthPage('/register');

    await screen.findByText('Create your HackPath account');
    await waitForInitialUserRequest(fetchMock);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'takenuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'taken@example.test' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'StrongPass!42' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/register'),
      expect.objectContaining({ credentials: 'include' }),
    ));
    await expect(screen.findByText('The username has already been taken.')).resolves.toBeInTheDocument();
  });
});

