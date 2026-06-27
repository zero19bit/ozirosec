import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ArticleReaderLanguage = 'fa-IR' | 'en-US';

export type SpeechStatus =
  | 'idle'
  | 'preparing'
  | 'speaking'
  | 'paused'
  | 'completed'
  | 'unsupported'
  | 'error';

export type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5 | 2;

export interface SpeechProgress {
  completedChunks: number;
  currentChunk: number;
  totalChunks: number;
  currentChunkCharIndex: number;
  percent: number;
}

interface UseSpeechSynthesisOptions {
  articleId?: string | number;
  language: ArticleReaderLanguage;
  maxChunkLength?: number;
  resetKey?: string;
  text: string;
}

export const playbackSpeeds: PlaybackSpeed[] = [0.75, 1, 1.25, 1.5, 2];
export const defaultSpeechChunkLength = 1000;
export const articleReaderSpeedStorageKey = 'hackpath.articleReader.playbackSpeed';

const sentenceAbbreviations = new Set([
  'dr',
  'mr',
  'mrs',
  'ms',
  'prof',
  'sr',
  'jr',
  'vs',
  'etc',
  'e.g',
  'i.e',
  'fig',
  'no',
  'st',
]);
const sentenceBoundaryCharacters = new Set(['.', '!', '?', '\u061f', '\u3002']);

function isSpeechSupported(): boolean {
  return typeof window !== 'undefined'
    && typeof window.speechSynthesis === 'object'
    && window.speechSynthesis !== null
    && typeof window.SpeechSynthesisUtterance === 'function';
}

function getMatchingVoice(voices: SpeechSynthesisVoice[], language: ArticleReaderLanguage) {
  const exactMatch = voices.find((voice) => voice.lang.toLowerCase() === language.toLowerCase());

  if (exactMatch) {
    return exactMatch;
  }

  const baseLanguage = language.split('-')[0].toLowerCase();

  return voices.find((voice) => voice.lang.toLowerCase().startsWith(baseLanguage));
}

function getPreviousToken(value: string, index: number): string {
  const before = value.slice(0, index).trimEnd();
  const match = before.match(/([\p{L}.]+)$/u);

  return match?.[1].toLowerCase() ?? '';
}

function canBreakSentence(value: string, index: number): boolean {
  const char = value[index];
  const previous = value[index - 1] ?? '';
  const next = value[index + 1] ?? '';

  if (char === '.' && /\d/.test(previous) && /\d/.test(next)) {
    return false;
  }

  if (char === '.' && sentenceAbbreviations.has(getPreviousToken(value, index))) {
    return false;
  }

  return next === '' || /\s/.test(next);
}

function splitParagraphIntoSentences(paragraph: string): string[] {
  const sentences: string[] = [];
  let start = 0;

  for (let index = 0; index < paragraph.length; index += 1) {
    if (!sentenceBoundaryCharacters.has(paragraph[index])) {
      continue;
    }

    if (!canBreakSentence(paragraph, index)) {
      continue;
    }

    const sentence = paragraph.slice(start, index + 1).trim();

    if (sentence) {
      sentences.push(sentence);
    }

    start = index + 1;
  }

  const rest = paragraph.slice(start).trim();

  if (rest) {
    sentences.push(rest);
  }

  return sentences;
}

function splitLongSegment(segment: string, maxChunkLength: number): string[] {
  if (segment.length <= maxChunkLength) {
    return [segment];
  }

  const chunks: string[] = [];
  let current = '';

  for (const token of segment.split(/\s+/)) {
    if (!token) {
      continue;
    }

    const next = current ? `${current} ${token}` : token;

    if (next.length <= maxChunkLength) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    current = token;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

export function splitSpeechText(text: string, maxChunkLength = defaultSpeechChunkLength): string[] {
  const normalized = text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];

  for (const paragraph of normalized.split(/\n{2,}/)) {
    const cleanParagraph = paragraph.replace(/\n+/g, ' ').trim();

    if (!cleanParagraph) {
      continue;
    }

    const sentences = splitParagraphIntoSentences(cleanParagraph).flatMap((sentence) =>
      splitLongSegment(sentence, maxChunkLength),
    );

    let current = '';

    for (const sentence of sentences) {
      const next = current ? `${current} ${sentence}` : sentence;

      if (next.length <= maxChunkLength) {
        current = next;
        continue;
      }

      if (current) {
        chunks.push(current);
      }

      current = sentence;
    }

    if (current) {
      chunks.push(current);
    }
  }

  return chunks;
}

function createProgress(
  completedChunks: number,
  currentChunk: number,
  totalChunks: number,
  currentChunkCharIndex = 0,
): SpeechProgress {
  const currentChunkProgress = totalChunks > 0 && currentChunk < totalChunks
    ? Math.min(Math.max(currentChunkCharIndex, 0), 1000) / 1000
    : 0;
  const percent = totalChunks === 0
    ? 0
    : Math.min(100, Math.round(((completedChunks + currentChunkProgress) / totalChunks) * 100));

  return {
    completedChunks,
    currentChunk,
    totalChunks,
    currentChunkCharIndex,
    percent,
  };
}

export function isPlaybackSpeed(value: number): value is PlaybackSpeed {
  return playbackSpeeds.some((speed) => speed === value);
}

function readStoredPlaybackSpeed(): PlaybackSpeed {
  if (typeof window === 'undefined') {
    return 1;
  }

  let storedValue: string | null = null;

  try {
    storedValue = window.localStorage.getItem(articleReaderSpeedStorageKey);
  } catch {
    return 1;
  }

  if (!storedValue) {
    return 1;
  }

  const parsedValue = Number(storedValue);

  return isPlaybackSpeed(parsedValue) ? parsedValue : 1;
}

function storePlaybackSpeed(speed: PlaybackSpeed): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(articleReaderSpeedStorageKey, String(speed));
  } catch {
    // Browsers can disable storage; speech controls should keep working in-memory.
  }
}

export function useSpeechSynthesis({
  articleId,
  language,
  maxChunkLength = defaultSpeechChunkLength,
  resetKey,
  text,
}: UseSpeechSynthesisOptions) {
  const [status, setStatus] = useState<SpeechStatus>(() =>
    isSpeechSupported() ? 'idle' : 'unsupported',
  );
  const [speed, setSpeedState] = useState<PlaybackSpeed>(() => readStoredPlaybackSpeed());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [progress, setProgress] = useState<SpeechProgress>(() => createProgress(0, 0, 0));
  const chunks = useMemo(() => splitSpeechText(text, maxChunkLength), [maxChunkLength, text]);
  const canUseSpeech = isSpeechSupported();
  const canStart = canUseSpeech && chunks.length > 0;
  const isActive = status === 'preparing' || status === 'speaking' || status === 'paused';
  const selectedVoice = useMemo(() => getMatchingVoice(voices, language), [language, voices]);
  const mountedRef = useRef(false);
  const sessionRef = useRef(0);
  const chunksRef = useRef<string[]>(chunks);
  const currentIndexRef = useRef(0);
  const speedRef = useRef(speed);
  const languageRef = useRef(language);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | undefined>(selectedVoice);

  const safeSetStatus = useCallback((nextStatus: SpeechStatus) => {
    if (mountedRef.current) {
      setStatus(nextStatus);
    }
  }, []);

  const safeSetProgress = useCallback((nextProgress: SpeechProgress) => {
    if (mountedRef.current) {
      setProgress(nextProgress);
    }
  }, []);

  const stop = useCallback((nextStatus: SpeechStatus = canUseSpeech ? 'idle' : 'unsupported') => {
    sessionRef.current += 1;
    currentIndexRef.current = 0;
    chunksRef.current = [];

    if (canUseSpeech) {
      window.speechSynthesis.cancel();
    }

    safeSetProgress(createProgress(0, 0, 0));
    safeSetStatus(nextStatus);
  }, [canUseSpeech, safeSetProgress, safeSetStatus]);

  const speakChunk = useCallback((sessionId: number, index: number) => {
    if (!canUseSpeech || sessionId !== sessionRef.current) {
      return;
    }

    const currentChunks = chunksRef.current;
    const chunk = currentChunks[index];

    if (!chunk) {
      currentIndexRef.current = 0;
      safeSetProgress(createProgress(currentChunks.length, currentChunks.length, currentChunks.length));
      safeSetStatus('completed');
      return;
    }

    currentIndexRef.current = index;
    safeSetProgress(createProgress(index, index, currentChunks.length));
    safeSetStatus('preparing');

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = languageRef.current;
    utterance.rate = speedRef.current;

    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }

    utterance.onstart = () => {
      if (sessionId === sessionRef.current) {
        safeSetStatus('speaking');
      }
    };

    utterance.onboundary = (event) => {
      if (sessionId !== sessionRef.current) {
        return;
      }

      const charIndex = typeof event.charIndex === 'number' ? event.charIndex : 0;
      const scaledIndex = chunk.length > 0 ? Math.round((charIndex / chunk.length) * 1000) : 0;
      safeSetProgress(createProgress(index, index, currentChunks.length, scaledIndex));
    };

    utterance.onend = () => {
      if (sessionId !== sessionRef.current) {
        return;
      }

      const nextIndex = index + 1;
      safeSetProgress(createProgress(nextIndex, nextIndex, currentChunks.length));
      speakChunk(sessionId, nextIndex);
    };

    utterance.onerror = (event) => {
      if (sessionId !== sessionRef.current) {
        return;
      }

      if (event.error === 'interrupted' || event.error === 'canceled') {
        return;
      }

      safeSetStatus('error');
    };

    window.speechSynthesis.speak(utterance);
  }, [canUseSpeech, safeSetProgress, safeSetStatus]);

  const start = useCallback(() => {
    if (!canStart) {
      safeSetStatus(canUseSpeech ? 'error' : 'unsupported');
      return;
    }

    sessionRef.current += 1;

    if (canUseSpeech) {
      window.speechSynthesis.cancel();
    }

    const sessionId = sessionRef.current;
    chunksRef.current = chunks;
    currentIndexRef.current = 0;
    speakChunk(sessionId, 0);
  }, [canStart, canUseSpeech, chunks, safeSetStatus, speakChunk]);

  const pause = useCallback(() => {
    if (!canUseSpeech || status !== 'speaking') {
      return;
    }

    window.speechSynthesis.pause();
    safeSetStatus('paused');
  }, [canUseSpeech, safeSetStatus, status]);

  const resume = useCallback(() => {
    if (!canUseSpeech || status !== 'paused') {
      return;
    }

    window.speechSynthesis.resume();
    safeSetStatus('speaking');
  }, [canUseSpeech, safeSetStatus, status]);

  const setSpeed = useCallback((nextSpeed: PlaybackSpeed) => {
    speedRef.current = nextSpeed;
    setSpeedState(nextSpeed);
    storePlaybackSpeed(nextSpeed);

    if (!isActive || chunksRef.current.length === 0 || !canUseSpeech) {
      return;
    }

    // Predictable speed changes: restart the current chunk instead of resuming mid-utterance.
    const restartIndex = currentIndexRef.current;
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    speakChunk(sessionRef.current, restartIndex);
  }, [canUseSpeech, isActive, speakChunk]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      sessionRef.current += 1;

      if (isSpeechSupported()) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    if (!canUseSpeech) {
      setStatus('unsupported');
      return;
    }

    const updateVoices = () => {
      if (mountedRef.current) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, [canUseSpeech]);

  useEffect(() => {
    stop(canUseSpeech ? 'idle' : 'unsupported');
  }, [articleId, canUseSpeech, language, resetKey, stop]);

  return {
    canStart,
    isActive,
    pause,
    progress,
    resume,
    setSpeed,
    speed,
    start,
    status,
    stop,
  };
}
