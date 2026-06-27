import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import i18n from '../i18n/i18n';
import type { Writeup } from '../lib/writeupApi';
import { WriteupDetail, Writeups } from './Writeups';

type MockUtterance = SpeechSynthesisUtterance & {
  text: string;
};

const speechCancel = vi.fn();
const speechSpeak = vi.fn();

class MockSpeechSynthesisUtterance {
  lang = '';
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: ((this: SpeechSynthesisUtterance, event: SpeechSynthesisEvent) => void) | null = null;
  onend: ((this: SpeechSynthesisUtterance, event: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((this: SpeechSynthesisUtterance, event: SpeechSynthesisErrorEvent) => void) | null = null;

  constructor(public text: string) {}
}

function writeup(overrides: Partial<Writeup>): Writeup {
  return {
    id: 1,
    original_title: 'Original title',
    original_language: 'en',
    status: 'published',
    ingestion_method: 'manual',
    translations: [],
    tags: [],
    vulnerabilities: [],
    labs: [],
    ...overrides,
  };
}

const englishWriteup = writeup({
  id: 10,
  original_title: 'Stored XSS original',
  translations: [
    {
      locale: 'en',
      slug: 'stored-xss',
      title: 'Stored XSS analysis',
      short_summary: 'A **stored XSS** summary with [OWASP](https://owasp.org).',
      key_findings: ['Payload reaches viewers.'],
      technical_overview: '## Flow\n\nUser content is rendered later.',
    },
  ],
  source: { name: 'HackPath', slug: 'hackpath' },
  difficulty: 'intermediate',
  reading_time_minutes: 4,
});

const persianWriteup = writeup({
  id: 10,
  original_title: 'Stored XSS original',
  translations: [
    {
      locale: 'fa',
      slug: 'stored-xss-fa',
      title: 'تحلیل XSS ذخیره‌شده',
      short_summary: 'این یک خلاصه درباره **XSS** و [OWASP](https://owasp.org) است.',
      key_findings: ['Payload برای کاربران نمایش داده می‌شود.'],
      technical_overview: '## جریان\n\nمحتوای کاربر بعدا رندر می‌شود.',
    },
  ],
  source: { name: 'HackPath', slug: 'hackpath' },
  difficulty: 'intermediate',
  reading_time_minutes: 4,
});

const secondWriteup = writeup({
  id: 20,
  original_title: 'SSRF original',
  translations: [
    {
      locale: 'en',
      slug: 'ssrf-case',
      title: 'SSRF case study',
      short_summary: 'Server-side requests reach internal systems.',
    },
  ],
});

const emptyWriteup = writeup({
  id: 30,
  original_title: '',
  translations: [
    {
      locale: 'en',
      slug: 'empty',
      title: '',
      short_summary: '',
    },
  ],
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function mockWriteupFetch() {
  vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('/writeups/stored-xss') && url.includes('locale=fa')) {
      return Promise.resolve(jsonResponse({ data: persianWriteup }));
    }

    if (url.includes('/writeups/stored-xss')) {
      return Promise.resolve(jsonResponse({ data: englishWriteup }));
    }

    if (url.includes('/writeups/ssrf-case')) {
      return Promise.resolve(jsonResponse({ data: secondWriteup }));
    }

    if (url.includes('/writeups/empty')) {
      return Promise.resolve(jsonResponse({ data: emptyWriteup }));
    }

    if (url.includes('/writeups?')) {
      return Promise.resolve(jsonResponse({ data: [englishWriteup] }));
    }

    return Promise.resolve(jsonResponse({ data: englishWriteup }));
  }));
}

function mockSpeech() {
  speechCancel.mockReset();
  speechSpeak.mockReset();

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: MockSpeechSynthesisUtterance,
  });

  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      cancel: speechCancel,
      pause: vi.fn(),
      resume: vi.fn(),
      speak: speechSpeak,
      getVoices: vi.fn(() => []),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
}

function NavigateToSecondWriteup() {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate('/writeups/ssrf-case')}>
      Next write-up
    </button>
  );
}

function renderWriteupRoute(initialEntry: string) {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/writeups" element={<Writeups />} />
          <Route
            path="/writeups/:slug"
            element={(
              <>
                <NavigateToSecondWriteup />
                <WriteupDetail />
              </>
            )}
          />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe('write-up article reader integration', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    mockWriteupFetch();
    mockSpeech();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the reader on a full write-up detail page', async () => {
    const { container } = renderWriteupRoute('/writeups/stored-xss');

    expect(await screen.findByRole('heading', { name: 'Stored XSS analysis', level: 1 })).toBeInTheDocument();
    expect(container.querySelector('section[aria-label="Article reader"]')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText(/Estimated listening time: about \d+ min/)).toBeInTheDocument();
  });

  it('does not render the reader on the write-up list page', async () => {
    const { container } = renderWriteupRoute('/writeups');

    expect(await screen.findByRole('heading', { name: 'Latest research' })).toBeInTheDocument();
    expect(container.querySelector('section[aria-label="Article reader"]')).not.toBeInTheDocument();
  });

  it('passes English detail content to speech with en-US', async () => {
    renderWriteupRoute('/writeups/stored-xss');

    fireEvent.click(await screen.findByRole('button', { name: 'Start reading' }));

    await waitFor(() => expect(speechSpeak).toHaveBeenCalled());
    expect(screen.getByRole('progressbar', { name: 'Approximate reading progress' })).toHaveAttribute('aria-valuemin', '0');
    expect(screen.getByRole('progressbar', { name: 'Approximate reading progress' })).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByRole('progressbar', { name: 'Approximate reading progress' })).toHaveAttribute('aria-valuenow');
    const utterance = speechSpeak.mock.calls[0][0] as MockUtterance;

    expect(utterance.lang).toBe('en-US');
    expect(utterance.text).toContain('Stored XSS analysis');
    act(() => utterance.onend?.({} as SpeechSynthesisEvent));
    const bodyUtterance = speechSpeak.mock.calls[1][0] as MockUtterance;
    expect(bodyUtterance.text).toContain('A stored XSS summary with OWASP.');
    expect(bodyUtterance.text).not.toContain('https://owasp.org');
    expect(bodyUtterance.text).not.toContain('**');
  });

  it('passes Persian detail content to speech with fa-IR', async () => {
    await i18n.changeLanguage('fa');
    renderWriteupRoute('/writeups/stored-xss');

    fireEvent.click(await screen.findByRole('button', { name: 'شروع خواندن' }));

    await waitFor(() => expect(speechSpeak).toHaveBeenCalled());
    const utterance = speechSpeak.mock.calls[0][0] as MockUtterance;

    expect(utterance.lang).toBe('fa-IR');
    expect(utterance.text).toContain('تحلیل XSS ذخیره‌شده');
    act(() => utterance.onend?.({} as SpeechSynthesisEvent));
    const bodyUtterance = speechSpeak.mock.calls[1][0] as MockUtterance;
    expect(bodyUtterance.text).toContain('این یک خلاصه درباره XSS و OWASP است.');
  });

  it('stops playback and prepares the selected translation when language changes', async () => {
    const rendered = renderWriteupRoute('/writeups/stored-xss');

    fireEvent.click(await screen.findByRole('button', { name: 'Start reading' }));
    await waitFor(() => expect(speechSpeak).toHaveBeenCalled());
    const cancelCount = speechCancel.mock.calls.length;

    await i18n.changeLanguage('fa');
    rendered.rerender(
      <LanguageProvider>
        <MemoryRouter initialEntries={['/writeups/stored-xss']}>
          <Routes>
            <Route path="/writeups/:slug" element={<WriteupDetail />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'تحلیل XSS ذخیره‌شده', level: 1 })).toBeInTheDocument();
    expect(speechCancel.mock.calls.length).toBeGreaterThan(cancelCount);
    expect(speechSpeak).toHaveBeenCalledTimes(1);
  });

  it('stops playback and resets when navigating to another write-up', async () => {
    renderWriteupRoute('/writeups/stored-xss');

    fireEvent.click(await screen.findByRole('button', { name: 'Start reading' }));
    await waitFor(() => expect(speechSpeak).toHaveBeenCalled());
    const cancelCount = speechCancel.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: 'Next write-up' }));

    expect(await screen.findByRole('heading', { name: 'SSRF case study', level: 1 })).toBeInTheDocument();
    expect(speechCancel.mock.calls.length).toBeGreaterThan(cancelCount);
  });

  it('handles empty write-up content without crashing', async () => {
    renderWriteupRoute('/writeups/empty');

    expect(await screen.findByRole('button', { name: 'Start reading' })).toBeDisabled();
    expect(screen.getByText('Ready to read')).toBeInTheDocument();
  });
});
