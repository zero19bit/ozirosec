import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore } from '../store/useAppStore';
import { glossaryTerms } from '../data/glossary';
import { BookOpen, Search, ExternalLink } from 'lucide-react';

export function Glossary() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = glossaryTerms.filter(t =>
    !search ||
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Security Glossary')}</h1>
          </div>
          <p className={`text-base mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {tx('{{count}} essential web security terms defined and explained', { count: glossaryTerms.length })}
          </p>

          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder={tx('Search terms...')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-purple-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500'
              } outline-none`}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {filtered.map(term => (
          <div
            key={term.id}
            className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(term.term)}</h2>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx(term.shortDef)}</p>
              </div>
              {term.relatedCategoryId && (
                <Link
                  to={`/vulnerabilities/${term.relatedCategoryId.replace(/\s+/g, '-').toLowerCase()}`}
                  className="shrink-0 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
                  <ExternalLink size={12} /> {tx('Deep dive')}
                </Link>
              )}
            </div>
            <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{tx(term.definition)}</p>
            <div className={`p-3 rounded-xl text-sm ${darkMode ? 'bg-slate-800 border-l-2 border-purple-500' : 'bg-purple-50 border-l-2 border-purple-400'}`}>
              <span className="font-semibold text-purple-400 text-xs uppercase tracking-wider">{tx('Example')}: </span>
              <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{tx(term.example)}</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={48} className={`mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
            <p className={`text-lg font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('No terms found')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

