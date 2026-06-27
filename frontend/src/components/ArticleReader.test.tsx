import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../i18n/i18n';
import { ArticleReader } from './ArticleReader';
import { articleReaderSpeedStorageKey } from '../hooks/useSpeechSynthesis';

type MockUtterance = SpeechSynthesisUtterance & {
  text: string;
};

const cancelMock = vi.fn();
const speakMock = vi.fn();

class MockSpeechSynthesisUtterance {
  lang = '';
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  onboundary: ((this: SpeechSynthesisUtterance, event: SpeechSynthesisEvent) => void) | null = null;
  onend: ((this: SpeechSynthesisUtterance, event: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((this: SpeechSynthesisUtterance, event: SpeechSynthesisErrorEvent) => void) | null = null;
  onstart: ((this: SpeechSynthesisUtterance, event: SpeechSynthesisEvent) => void) | null = null;

  constructor(public text: string) {}
}

function installSpeechMocks() {
  cancelMock.mockReset();
  speakMock.mockReset();

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: MockSpeechSynthesisUtterance,
  });

  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      addEventListener: vi.fn(),
      cancel: cancelMock,
      getVoices: vi.fn(() => []),
      pause: vi.fn(),
      removeEventListener: vi.fn(),
      resume: vi.fn(),
      speak: speakMock,
    },
  });
}

function utteranceAt(index: number): MockUtterance {
  return speakMock.mock.calls[index][0] as MockUtterance;
}

function renderReader(text: string) {
  return render(
    <MemoryRouter initialEntries={['/writeups/test-article']}>
      <ArticleReader
        articleId="test-article"
        language="en-US"
        text={text}
        title="Reader test article"
      />
    </MemoryRouter>,
  );
}

describe('ArticleReader', () => {
  beforeEach(() => {
    window.localStorage.clear();
    installSpeechMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shows an approximate localized listening duration based on speed', () => {
    const text = Array.from({ length: 180 }, (_, index) => `word${index}`).join(' ');
    renderReader(text);

    expect(screen.getByText('Estimated listening time: about 2 min')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Playback speed'), { target: { value: '2' } });

    expect(screen.getByText('Estimated listening time: about 1 min')).toBeInTheDocument();
    expect(window.localStorage.getItem(articleReaderSpeedStorageKey)).toBe('2');
  });

  it('renders an approximate semantic progressbar after playback starts', () => {
    renderReader('First sentence is readable. Second sentence is readable.');

    fireEvent.click(screen.getByRole('button', { name: 'Start reading' }));
    act(() => utteranceAt(0).onboundary?.({ charIndex: 15 } as SpeechSynthesisEvent));

    const progressbar = screen.getByRole('progressbar', { name: 'Approximate reading progress' });

    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow');
    expect(progressbar).toHaveAttribute('aria-valuetext', expect.stringContaining('About'));
    expect(screen.getByText(/About \d+%/)).toBeInTheDocument();
  });
});
