import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  articleReaderSpeedStorageKey,
  isPlaybackSpeed,
  splitSpeechText,
  useSpeechSynthesis,
  type ArticleReaderLanguage,
} from './useSpeechSynthesis';

type MockUtterance = SpeechSynthesisUtterance & {
  text: string;
};

const cancelMock = vi.fn();
const pauseMock = vi.fn();
const resumeMock = vi.fn();
const speakMock = vi.fn();
const addEventListenerMock = vi.fn();
const removeEventListenerMock = vi.fn();
let mockVoices: SpeechSynthesisVoice[] = [];
let voicesChangedListener: (() => void) | null = null;

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

interface HarnessProps {
  articleId?: string | number;
  language?: ArticleReaderLanguage;
  maxChunkLength?: number;
  resetKey?: string;
  text: string;
}

function SpeechHarness({
  articleId = 'article-1',
  language = 'en-US',
  maxChunkLength = 80,
  resetKey,
  text,
}: HarnessProps) {
  const speech = useSpeechSynthesis({
    articleId,
    language,
    maxChunkLength,
    resetKey,
    text,
  });

  return (
    <div>
      <output aria-label="status">{speech.status}</output>
      <output aria-label="progress">{speech.progress.percent}</output>
      <output aria-label="current speed">{speech.speed}</output>
      <button disabled={!speech.canStart} onClick={speech.start} type="button">
        start
      </button>
      <button onClick={speech.pause} type="button">
        pause
      </button>
      <button onClick={speech.resume} type="button">
        resume
      </button>
      <button onClick={() => speech.stop()} type="button">
        stop
      </button>
      <select
        aria-label="speed"
        onChange={(event) => {
          const nextSpeed = Number(event.target.value);

          if (isPlaybackSpeed(nextSpeed)) {
            speech.setSpeed(nextSpeed);
          }
        }}
        value={speech.speed}
      >
        <option value={0.75}>0.75</option>
        <option value={1}>1</option>
        <option value={1.25}>1.25</option>
        <option value={1.5}>1.5</option>
        <option value={2}>2</option>
      </select>
    </div>
  );
}

function installSpeechMocks() {
  cancelMock.mockReset();
  pauseMock.mockReset();
  resumeMock.mockReset();
  speakMock.mockReset();
  addEventListenerMock.mockReset();
  removeEventListenerMock.mockReset();
  mockVoices = [];
  voicesChangedListener = null;

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: MockSpeechSynthesisUtterance,
  });

  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      addEventListener: addEventListenerMock.mockImplementation((eventName: string, listener: EventListenerOrEventListenerObject) => {
        if (eventName === 'voiceschanged' && typeof listener === 'function') {
          voicesChangedListener = listener as () => void;
        }
      }),
      cancel: cancelMock,
      getVoices: vi.fn(() => mockVoices),
      pause: pauseMock,
      removeEventListener: removeEventListenerMock,
      resume: resumeMock,
      speak: speakMock,
    },
  });
}

function utteranceAt(index: number): MockUtterance {
  return speakMock.mock.calls[index][0] as MockUtterance;
}

function mockVoice(lang: string): SpeechSynthesisVoice {
  return {
    default: false,
    lang,
    localService: true,
    name: `Voice ${lang}`,
    voiceURI: `voice-${lang}`,
  };
}

describe('splitSpeechText', () => {
  it('keeps short text in one chunk', () => {
    expect(splitSpeechText('Short security note.', 1000)).toEqual(['Short security note.']);
  });

  it('splits very long text into conservative chunks', () => {
    const text = Array.from({ length: 80 }, (_, index) => `Sentence ${index + 1} explains SQL Injection clearly.`).join(' ');
    const chunks = splitSpeechText(text, 180);

    expect(chunks.length).toBeGreaterThan(5);
    expect(chunks.every((chunk) => chunk.length <= 180)).toBe(true);
  });

  it('prefers paragraph boundaries', () => {
    expect(splitSpeechText('First paragraph sentence.\n\nSecond paragraph sentence.', 1000)).toEqual([
      'First paragraph sentence.',
      'Second paragraph sentence.',
    ]);
  });

  it('handles Persian text', () => {
    expect(splitSpeechText('این یک جمله فارسی است. جمله دوم درباره XSS است.', 1000)).toEqual([
      'این یک جمله فارسی است. جمله دوم درباره XSS است.',
    ]);
  });

  it('splits Persian question sentences at natural boundaries', () => {
    expect(splitSpeechText('آیا CVE-2026-1234 مهم است؟ بله، اولویت دارد.', 30)).toEqual([
      'آیا CVE-2026-1234 مهم است؟',
      'بله، اولویت دارد.',
    ]);
  });

  it('handles English and mixed-language text without damaging terms', () => {
    const chunks = splitSpeechText('CVE-2026-1234 affects OAuth 2.0 flows. این بخش درباره JWT است.', 40);
    const joined = chunks.join(' ');

    expect(joined).toContain('CVE-2026-1234');
    expect(joined).toContain('OAuth 2.0');
    expect(joined).toContain('JWT');
  });
});

describe('useSpeechSynthesis', () => {
  beforeEach(() => {
    window.localStorage.clear();
    installSpeechMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('speaks chunks sequentially and completes without boundary events', () => {
    render(<SpeechHarness text="First sentence is readable. Second sentence is readable. Third sentence is readable." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    expect(speakMock).toHaveBeenCalledTimes(1);

    act(() => utteranceAt(0).onstart?.({} as SpeechSynthesisEvent));
    expect(screen.getByLabelText('status')).toHaveTextContent('speaking');

    act(() => utteranceAt(0).onend?.({} as SpeechSynthesisEvent));
    expect(speakMock).toHaveBeenCalledTimes(2);

    act(() => utteranceAt(1).onend?.({} as SpeechSynthesisEvent));
    expect(screen.getByLabelText('status')).toHaveTextContent('completed');
    expect(screen.getByLabelText('progress')).toHaveTextContent('100');
  });

  it('tracks approximate boundary progress when available', () => {
    render(<SpeechHarness maxChunkLength={1000} text="Boundary progress should move forward." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    act(() => utteranceAt(0).onboundary?.({ charIndex: 20 } as SpeechSynthesisEvent));

    expect(Number(screen.getByLabelText('progress').textContent)).toBeGreaterThan(0);
  });

  it('stops during the first chunk and ignores stale onend callbacks', () => {
    render(<SpeechHarness text="First sentence is readable. Second sentence is readable. Third sentence is readable." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    const firstUtterance = utteranceAt(0);
    fireEvent.click(screen.getByRole('button', { name: 'stop' }));

    expect(cancelMock).toHaveBeenCalled();
    expect(screen.getByLabelText('status')).toHaveTextContent('idle');
    expect(screen.getByLabelText('progress')).toHaveTextContent('0');

    act(() => firstUtterance.onend?.({} as SpeechSynthesisEvent));
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('stops during a later chunk and ignores stale onend callbacks', () => {
    render(<SpeechHarness text="First sentence is readable. Second sentence is readable. Third sentence is readable." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    act(() => utteranceAt(0).onend?.({} as SpeechSynthesisEvent));
    const secondUtterance = utteranceAt(1);
    fireEvent.click(screen.getByRole('button', { name: 'stop' }));

    act(() => secondUtterance.onend?.({} as SpeechSynthesisEvent));
    expect(speakMock).toHaveBeenCalledTimes(2);
  });

  it('pauses and resumes the active chunk', () => {
    render(<SpeechHarness text="Pause and resume this sentence." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    act(() => utteranceAt(0).onstart?.({} as SpeechSynthesisEvent));
    fireEvent.click(screen.getByRole('button', { name: 'pause' }));
    fireEvent.click(screen.getByRole('button', { name: 'resume' }));

    expect(pauseMock).toHaveBeenCalledTimes(1);
    expect(resumeMock).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('status')).toHaveTextContent('speaking');
  });

  it('rapid restart invalidates the previous queue', () => {
    render(<SpeechHarness text="First sentence is readable. Second sentence is readable. Third sentence is readable." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    const staleUtterance = utteranceAt(0);
    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    expect(speakMock).toHaveBeenCalledTimes(2);

    act(() => staleUtterance.onend?.({} as SpeechSynthesisEvent));
    expect(speakMock).toHaveBeenCalledTimes(2);
  });

  it('article replacement cancels speech and ignores stale callbacks', () => {
    const rendered = render(<SpeechHarness articleId="a" text="First sentence is readable. Second sentence is readable." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    const staleUtterance = utteranceAt(0);
    rendered.rerender(<SpeechHarness articleId="b" text="Replacement article text." />);

    expect(cancelMock).toHaveBeenCalled();
    act(() => staleUtterance.onend?.({} as SpeechSynthesisEvent));
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('language replacement cancels speech and clears the queue', () => {
    const rendered = render(<SpeechHarness language="en-US" text="English article sentence." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    rendered.rerender(<SpeechHarness language="fa-IR" text="متن فارسی مقاله." />);

    expect(cancelMock).toHaveBeenCalled();
    expect(screen.getByLabelText('status')).toHaveTextContent('idle');
  });

  it('route reset replacement cancels speech and clears stale callbacks', () => {
    const rendered = render(<SpeechHarness resetKey="/writeups/one" text="Route one text. Route one more text." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    const staleUtterance = utteranceAt(0);
    rendered.rerender(<SpeechHarness resetKey="/writeups/two" text="Route two text." />);

    expect(cancelMock).toHaveBeenCalled();
    expect(screen.getByLabelText('status')).toHaveTextContent('idle');

    act(() => staleUtterance.onend?.({} as SpeechSynthesisEvent));
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('component unmount cancels speech and stale callbacks do not restart playback', () => {
    const rendered = render(<SpeechHarness text="First sentence is readable. Second sentence is readable." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    const staleUtterance = utteranceAt(0);
    rendered.unmount();

    expect(cancelMock).toHaveBeenCalled();
    act(() => staleUtterance.onend?.({} as SpeechSynthesisEvent));
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('cleans up voiceschanged listener on unmount', () => {
    const rendered = render(<SpeechHarness text="Voice listener cleanup." />);

    expect(addEventListenerMock).toHaveBeenCalledWith('voiceschanged', expect.any(Function));

    rendered.unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('voiceschanged', expect.any(Function));
  });

  it('handles React Strict Mode mount cleanup without stale playback', () => {
    const rendered = render(
      <StrictMode>
        <SpeechHarness text="Strict mode should not leak callbacks. Another sentence follows." />
      </StrictMode>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    const staleUtterance = utteranceAt(0);
    rendered.unmount();

    expect(cancelMock).toHaveBeenCalled();

    act(() => staleUtterance.onend?.({} as SpeechSynthesisEvent));
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('speed changes restart from the current chunk predictably', () => {
    render(<SpeechHarness text="First sentence is readable. Second sentence is readable. Third sentence is readable." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    act(() => utteranceAt(0).onend?.({} as SpeechSynthesisEvent));
    const currentChunk = utteranceAt(1).text;
    fireEvent.change(screen.getByLabelText('speed'), { target: { value: '1.5' } });

    expect(cancelMock).toHaveBeenCalled();
    expect(utteranceAt(2).text).toBe(currentChunk);
    expect(utteranceAt(2).rate).toBe(1.5);
  });

  it('uses a delayed exact voice match after voices load', () => {
    render(<SpeechHarness language="fa-IR" text="Delayed Persian voice." />);

    mockVoices = [mockVoice('en-US'), mockVoice('fa-IR')];

    act(() => {
      voicesChangedListener?.();
    });

    fireEvent.click(screen.getByRole('button', { name: 'start' }));

    expect(utteranceAt(0).voice?.lang).toBe('fa-IR');
  });

  it('falls back to a base language voice match when exact locale is unavailable', () => {
    mockVoices = [mockVoice('en-GB')];

    render(<SpeechHarness language="en-US" text="Base language fallback voice." />);
    fireEvent.click(screen.getByRole('button', { name: 'start' }));

    expect(utteranceAt(0).voice?.lang).toBe('en-GB');
  });

  it('allows browser default voice when no matching voice exists', () => {
    mockVoices = [mockVoice('de-DE')];

    render(<SpeechHarness language="fa-IR" text="No matching voice available." />);
    fireEvent.click(screen.getByRole('button', { name: 'start' }));

    expect(utteranceAt(0).voice).toBeNull();
  });

  it('handles browser speech errors safely', () => {
    render(<SpeechHarness text="Speech error should not crash." />);

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    act(() => utteranceAt(0).onerror?.({ error: 'synthesis-failed' } as SpeechSynthesisErrorEvent));

    expect(screen.getByLabelText('status')).toHaveTextContent('error');
  });

  it('loads a valid persisted playback speed', () => {
    window.localStorage.setItem(articleReaderSpeedStorageKey, '1.25');

    render(<SpeechHarness text="Stored speed should load." />);

    expect(screen.getByLabelText('current speed')).toHaveTextContent('1.25');
  });

  it('ignores malformed or unsupported persisted playback speeds', () => {
    window.localStorage.setItem(articleReaderSpeedStorageKey, '999');
    const rendered = render(<SpeechHarness text="Bad speed should fall back." />);

    expect(screen.getByLabelText('current speed')).toHaveTextContent('1');

    rendered.unmount();
    window.localStorage.setItem(articleReaderSpeedStorageKey, '{"speed":2}');
    render(<SpeechHarness text="Malformed speed should fall back." />);

    expect(screen.getByLabelText('current speed')).toHaveTextContent('1');
  });

  it('falls back to the default speed when storage reads fail', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    render(<SpeechHarness text="Storage can be unavailable." />);

    expect(screen.getByLabelText('current speed')).toHaveTextContent('1');
  });

  it('stores only the selected playback speed preference', () => {
    render(<SpeechHarness text="Private article content must not be stored." />);

    fireEvent.change(screen.getByLabelText('speed'), { target: { value: '2' } });

    const storedEntries = Array.from({ length: window.localStorage.length }, (_, index) => {
      const key = window.localStorage.key(index);

      return [key, key ? window.localStorage.getItem(key) : null];
    });

    expect(storedEntries).toEqual([[articleReaderSpeedStorageKey, '2']]);
    expect(JSON.stringify(storedEntries)).not.toContain('Private article content');
  });

  it('keeps the selected speed in memory when storage writes fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    render(<SpeechHarness text="Storage writes can fail." />);

    fireEvent.change(screen.getByLabelText('speed'), { target: { value: '1.5' } });

    expect(screen.getByLabelText('current speed')).toHaveTextContent('1.5');
  });

  it('reports unsupported browser environments', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: undefined,
    });

    render(<SpeechHarness text="Unsupported browser text." />);

    expect(screen.getByLabelText('status')).toHaveTextContent('unsupported');
    expect(screen.getByRole('button', { name: 'start' })).toBeDisabled();
  });
});
