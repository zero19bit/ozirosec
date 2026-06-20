import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage, type Locale } from '../i18n/LanguageContext';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

const languages: Array<{ locale: Locale; label: string; nativeLabel: string }> = [
  { locale: 'en', label: 'EN', nativeLabel: 'English' },
  { locale: 'fa', label: 'FA', nativeLabel: '\u0641\u0627\u0631\u0633\u06cc' },
];

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();
  const darkMode = useAppStore((state) => state.darkMode);

  const handleLocaleChange = (nextLocale: Locale) => {
    if (nextLocale !== locale) {
      setLocale(nextLocale);
    }
  };

  return (
    <div
      aria-label={t('selectLanguage')}
      className={cn(
        'inline-flex items-center rounded-xl border p-1 shadow-sm transition-colors',
        darkMode
          ? 'border-slate-700 bg-slate-900/80'
          : 'border-slate-200 bg-white/90',
        className,
      )}
      role="group"
    >
      {languages.map((language) => {
        const isActive = language.locale === locale;

        return (
          <button
            key={language.locale}
            aria-label={t('switchTo', { language: language.nativeLabel })}
            aria-pressed={isActive}
            className={cn(
              'relative isolate min-w-10 rounded-lg px-2.5 py-1.5 text-xs font-black tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2',
              darkMode ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white',
              isActive
                ? 'text-slate-950'
                : darkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900',
              compact && 'min-w-12 py-2 text-sm',
            )}
            onClick={() => handleLocaleChange(language.locale)}
            type="button"
          >
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.span
                  className="absolute inset-0 -z-10 rounded-lg bg-green-400 shadow-lg shadow-green-500/20"
                  layoutId="language-switcher-active"
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
            <motion.span
              animate={{ opacity: isActive ? 1 : 0.72 }}
              className="block"
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {language.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}

