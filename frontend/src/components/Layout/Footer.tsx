import { Link } from 'react-router-dom';
import { Shield, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../i18n/LanguageContext';
import { faLabel } from '../../utils/localizeContent';
import { useAppStore } from '../../store/useAppStore';

export function Footer() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode } = useAppStore();

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

  return (
    <footer className={`border-t mt-20 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Hack<span className="text-green-400">Path</span>
              </span>
            </Link>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('footerDescription')}
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-slate-100'}`}>
                GitHub
              </a>
              <a href="#" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-slate-100'}`}>
                Twitter
              </a>
            </div>
          </div>

          <div>
            <h3 className={`font-semibold text-sm uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('navLearn')}</h3>
            <ul className="space-y-2">
              {learnLinks.map(item => (
                <li key={item.href}>
                  <Link to={item.href} className={`text-sm transition-colors ${darkMode ? 'text-slate-400 hover:text-green-400' : 'text-slate-600 hover:text-green-600'}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`font-semibold text-sm uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('navTools')}</h3>
            <ul className="space-y-2">
              {toolLinks.map(item => (
                <li key={item.href}>
                  <Link to={item.href} className={`text-sm transition-colors ${darkMode ? 'text-slate-400 hover:text-green-400' : 'text-slate-600 hover:text-green-600'}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`font-semibold text-sm uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('footerCategories')}</h3>
            <ul className="space-y-2">
              {[
                'SQL Injection', 'XSS', 'CSRF', 'SSRF', 'XXE',
                'Path Traversal', 'IDOR', 'JWT'
              ].map(category => (
                <li key={category}>
                  <Link to="/vulnerabilities" className={`text-sm transition-colors ${darkMode ? 'text-slate-400 hover:text-green-400' : 'text-slate-600 hover:text-green-600'}`}>
                    {tx(category)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`mt-10 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <p className={`text-sm flex items-center gap-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('footerMadeFor')} <Heart size={14} className="text-red-400 fill-red-400" /> {t('footerCommunity')} • {t('footerEducationalOnly')}
          </p>
          <div className="flex gap-6">
            <span className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>© 2025 HackPath</span>
            <span className="text-sm px-2 py-0.5 rounded text-xs font-medium bg-green-400/10 text-green-400">
              {t('footerEducationalUseOnly')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

