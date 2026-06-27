import { Pause, Play, RotateCcw, Square, Volume2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  type ArticleReaderLanguage,
  isPlaybackSpeed,
  playbackSpeeds,
  useSpeechSynthesis,
  type SpeechStatus,
} from '../hooks/useSpeechSynthesis';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

export type { ArticleReaderLanguage } from '../hooks/useSpeechSynthesis';

interface ArticleReaderProps {
  text: string;
  language: ArticleReaderLanguage;
  title?: string;
  className?: string;
  articleId?: string | number;
}

const estimatedWordsPerMinute = 170;

function statusTranslationKey(status: SpeechStatus): string {
  switch (status) {
    case 'preparing':
      return 'articleReaderPreparing';
    case 'speaking':
      return 'articleReaderReading';
    case 'paused':
      return 'articleReaderPaused';
    case 'completed':
      return 'articleReaderCompleted';
    case 'unsupported':
      return 'articleReaderUnsupported';
    case 'error':
      return 'articleReaderError';
    case 'idle':
    default:
      return 'articleReaderIdle';
  }
}

function countWords(text: string): number {
  const words = text.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu);

  return words?.length ?? 0;
}

function estimatedDurationMinutes(text: string, speed: number): number {
  const words = countWords(text);

  if (words === 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(words / (estimatedWordsPerMinute * speed)));
}

export function ArticleReader({
  text,
  language,
  title,
  className,
  articleId,
}: ArticleReaderProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { darkMode } = useAppStore();
  const {
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
  } = useSpeechSynthesis({
    articleId,
    language,
    resetKey: `${location.pathname}?${location.search}`,
    text,
  });
  const statusLabel = t(statusTranslationKey(status));
  const estimateMinutes = estimatedDurationMinutes(text, speed);
  const primaryLabel = status === 'speaking'
    ? t('articleReaderPause')
    : status === 'paused'
      ? t('articleReaderResume')
      : t('articleReaderReadArticle');
  const primaryAriaLabel = status === 'speaking'
    ? t('articleReaderPause')
    : status === 'paused'
      ? t('articleReaderResume')
      : t('articleReaderStart');
  const handlePrimaryAction = () => {
    if (status === 'speaking') {
      pause();
      return;
    }

    if (status === 'paused') {
      resume();
      return;
    }

    start();
  };

  return (
    <section
      className={cn(
        'w-full rounded-2xl border p-4 sm:p-5',
        darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white',
        className,
      )}
      aria-label={t('articleReaderLabel')}
      dir={language === 'fa-IR' ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="shrink-0 text-green-400" aria-hidden="true" />
            <h2 className={cn('overflow-anywhere text-sm font-bold', darkMode ? 'text-white' : 'text-slate-900')}>
              {t('articleReaderReadArticle')}
            </h2>
          </div>
          {title && (
            <p className={cn('overflow-anywhere mt-1 line-clamp-1 text-xs', darkMode ? 'text-slate-400' : 'text-slate-500')}>
              {title}
            </p>
          )}
          {estimateMinutes > 0 && (
            <p className={cn('mt-1 text-xs', darkMode ? 'text-slate-400' : 'text-slate-500')}>
              {t('articleReaderEstimatedDuration', { count: estimateMinutes })}
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={!canStart || status === 'preparing'}
            aria-label={primaryAriaLabel}
            aria-pressed={status === 'speaking'}
            className="inline-flex min-h-10 min-w-0 items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            {status === 'speaking' ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            <span className="truncate">{primaryLabel}</span>
          </button>

          <button
            type="button"
            onClick={pause}
            disabled={status !== 'speaking'}
            aria-label={t('articleReaderPause')}
            aria-pressed={status === 'paused'}
            className={cn(
              'inline-flex min-h-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
              darkMode ? 'border-slate-700 text-slate-200 hover:border-green-400' : 'border-slate-300 text-slate-700 hover:border-green-500',
            )}
          >
            <Pause size={16} aria-hidden="true" />
            <span className="sr-only">{t('articleReaderPause')}</span>
          </button>

          <button
            type="button"
            onClick={resume}
            disabled={status !== 'paused'}
            aria-label={t('articleReaderResume')}
            className={cn(
              'inline-flex min-h-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
              darkMode ? 'border-slate-700 text-slate-200 hover:border-green-400' : 'border-slate-300 text-slate-700 hover:border-green-500',
            )}
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span className="sr-only">{t('articleReaderResume')}</span>
          </button>

          <button
            type="button"
            onClick={() => stop()}
            disabled={!isActive}
            aria-label={t('articleReaderStop')}
            className={cn(
              'inline-flex min-h-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
              darkMode ? 'border-slate-700 text-slate-200 hover:border-red-400' : 'border-slate-300 text-slate-700 hover:border-red-500',
            )}
          >
            <Square size={15} aria-hidden="true" />
            <span className="sr-only">{t('articleReaderStop')}</span>
          </button>

          <label className={cn('flex min-w-0 items-center gap-2 text-sm', darkMode ? 'text-slate-300' : 'text-slate-600')}>
            <span className="shrink-0">{t('articleReaderSpeed')}</span>
            <select
              value={speed}
              onChange={(event) => {
                const nextSpeed = Number(event.target.value);

                if (isPlaybackSpeed(nextSpeed)) {
                  setSpeed(nextSpeed);
                }
              }}
              aria-label={t('articleReaderSpeed')}
              className={cn(
                'min-h-10 rounded-xl border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400',
                darkMode ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900',
              )}
            >
              {playbackSpeeds.map((option) => (
                <option key={option} value={option}>
                  {option}x
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div
        className={cn(
          'mt-3 rounded-xl border px-3 py-2 text-sm',
          status === 'error' || status === 'unsupported'
            ? 'border-red-500/30 bg-red-500/10 text-red-200'
            : darkMode
              ? 'border-slate-800 bg-slate-950/70 text-slate-300'
              : 'border-slate-200 bg-slate-50 text-slate-600',
        )}
        role="status"
        aria-live="polite"
      >
        {statusLabel}
        {progress.totalChunks > 0 && (
          <span className="ms-2">
            {t('articleReaderApproxProgress', { percent: progress.percent })} - {Math.min(progress.currentChunk + 1, progress.totalChunks)} / {progress.totalChunks}
          </span>
        )}
      </div>

      {progress.totalChunks > 0 && (
        <progress
          aria-label={t('articleReaderProgressLabel')}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress.percent}
          aria-valuetext={t('articleReaderApproxProgress', { percent: progress.percent })}
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full accent-green-400"
          max={100}
          value={progress.percent}
        />
      )}
    </section>
  );
}
