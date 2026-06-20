import { createContext, useCallback, useContext, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import i18n, {
  getLocaleDirection,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from './i18n';

interface LanguageContextValue {
  locale: Locale;
  direction: 'ltr' | 'rtl';
  isRtl: boolean;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function applyDocumentLocale(locale: Locale) {
  if (typeof document === 'undefined') {
    return;
  }

  const direction = getLocaleDirection(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = direction;
  document.documentElement.dataset.locale = locale;
  document.body.dir = direction;
  document.body.dataset.locale = locale;
  document.documentElement.classList.toggle('font-persian', locale === 'fa');
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n: i18next } = useTranslation();
  const setStoreLanguage = useAppStore((state) => state.setLanguage);
  const resolvedLocale = isLocale(i18next.resolvedLanguage) ? i18next.resolvedLanguage : 'en';
  const direction = getLocaleDirection(resolvedLocale);

  useLayoutEffect(() => {
    applyDocumentLocale(resolvedLocale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, resolvedLocale);
    setStoreLanguage(resolvedLocale);
  }, [resolvedLocale, setStoreLanguage]);

  const setLocale = useCallback(async (nextLocale: Locale) => {
    if (i18n.language === nextLocale) {
      return;
    }

    await i18n.changeLanguage(nextLocale);
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    locale: resolvedLocale,
    direction,
    isRtl: direction === 'rtl',
    setLocale,
  }), [direction, resolvedLocale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}

export { LOCALE_STORAGE_KEY, type Locale };

