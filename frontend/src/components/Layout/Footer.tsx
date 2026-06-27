import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../i18n/LanguageContext';
import { faLabel } from '../../utils/localizeContent';
import { useAppStore } from '../../store/useAppStore';
import oziroSecMarkDark from '../../assets/oziro-sec-mark-dark.png';
import oziroSecMarkLight from '../../assets/oziro-sec-mark-light.png';

export function Footer() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { darkMode } = useAppStore();

  const tx = (value: string, replacements: Record<string, string | number> = {}) =>
    locale === 'fa'
      ? faLabel(value, replacements)
      : Object.entries(replacements).reduce(
          (text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)),
          value,
        );

  const learnLinks = [
    { label: t('navVulnerabilities'), href: '/vulnerabilities' },
    { label: t('navLabs'), href: '/labs' },
    { label: t('navLearningPaths'), href: '/paths' },
    { label: t('navGlossary'), href: '/glossary' },
    { label: t('navResources'), href: '/resources' },
  ];

  const toolLinks = [
    { label: t('navEncoder'), href: '/tools/encoder' },
    { label: t('navInterceptor'), href: '/tools/interceptor' },
    { label: t('navReportGenerator'), href: '/tools/report-generator' },
    { label: t('navDashboard'), href: '/dashboard' },
    { label: t('navLeaderboard'), href: '/leaderboard' },
  ];

  const socialLinks = [
    { label: 'GitHub', href: 'https://github.com/zero19bit' },
    { label: 'Twitter', href: 'https://x.com/AminEbrahi38093' },
    { label: 'Instagram', href: 'https://instagram.com/ozirosec' },
    { label: 'Telegram', href: 'https://t.me/ozirosec' },
  ];

  return (
    <footer className={`mt-20 border-t ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="min-w-0 md:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-slate-950">
                <img
                  src={darkMode ? oziroSecMarkDark : oziroSecMarkLight}
                  alt="Oziro Sec"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Oziro <span className="text-green-400">Sec</span>
              </span>
            </Link>

            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('footerDescription')}
            </p>

            <div className="mt-4 grid max-w-full grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-center text-xs font-medium transition-colors ${
                    darkMode
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('navLearn')}
            </h3>
            <ul className="space-y-2">
              {learnLinks.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className={`text-sm transition-colors ${darkMode ? 'text-slate-400 hover:text-green-400' : 'text-slate-600 hover:text-green-600'}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('navTools')}
            </h3>
            <ul className="space-y-2">
              {toolLinks.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className={`text-sm transition-colors ${darkMode ? 'text-slate-400 hover:text-green-400' : 'text-slate-600 hover:text-green-600'}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('footerCategories')}
            </h3>
            <ul className="space-y-2">
              {['SQL Injection', 'XSS', 'CSRF', 'SSRF', 'XXE', 'Path Traversal', 'IDOR', 'JWT'].map((category) => (
                <li key={category}>
                  <Link to="/vulnerabilities" className={`text-sm transition-colors ${darkMode ? 'text-slate-400 hover:text-green-400' : 'text-slate-600 hover:text-green-600'}`}>
                    {tx(category)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <p className={`flex items-center gap-1.5 text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('footerMadeFor')} <Heart size={14} className="fill-red-400 text-red-400" /> {t('footerCommunity')} • {t('footerEducationalOnly')}
          </p>

          <div className="flex gap-6">
            <span className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>© 2026 Oziro Sec</span>
            <span className="rounded bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-400">
              {t('footerEducationalUseOnly')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
