import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore } from '../store/useAppStore';
import { labs } from '../data/labs';
import { vulnerabilities } from '../data/vulnerabilities';
import { glossaryTerms } from '../data/glossary';
import { Search as SearchIcon, FlaskConical, Shield, BookOpen } from 'lucide-react';

export function Search() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa'
    ? faLabel(value, replacements)
    : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode } = useAppStore();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase().trim();

  const labResults = q ? labs.filter((lab) =>
    lab.title.toLowerCase().includes(q) ||
    lab.category.toLowerCase().includes(q) ||
    lab.description.toLowerCase().includes(q)
  ).slice(0, 6) : [];

  const vulnResults = q ? vulnerabilities.filter((vulnerability) =>
    vulnerability.title.toLowerCase().includes(q) ||
    vulnerability.description.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const glossaryResults = q ? glossaryTerms.filter((term) =>
    term.term.toLowerCase().includes(q) ||
    term.definition.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const totalResults = labResults.length + vulnResults.length + glossaryResults.length;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className={`text-3xl font-black mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Search')}</h1>
          <div className="relative">
            <SearchIcon size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              autoFocus
              type="text"
              placeholder={tx('Search labs, vulnerabilities, glossary...')}
              value={query}
              onChange={event => setQuery(event.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border text-base outline-none transition-colors ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-green-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-500'
              }`}
            />
          </div>
          {q && (
            <p className={`text-sm mt-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {tx('{{count}} results for "{{query}}"', { count: totalResults, query })}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {q === '' && (
          <div className="text-center py-20">
            <SearchIcon size={56} className={`mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
            <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('Start typing to search labs, vulnerabilities, and glossary terms')}</p>
          </div>
        )}

        {labResults.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical size={16} className="text-green-400" />
              <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Labs')} ({labResults.length})</h2>
            </div>
            <div className="space-y-2">
              {labResults.map((lab) => (
                <Link
                  key={lab.id}
                  to={`/labs/${lab.slug}`}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-green-500/40' : 'bg-white border-slate-200 hover:border-green-400'
                  }`}
                >
                  <div>
                    <div className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(lab.title)}</div>
                    <div className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx(lab.category)} · {tx(lab.difficulty)}</div>
                  </div>
                  <span className={`text-xs ${lab.isSimulated ? 'text-blue-400' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {lab.isSimulated ? `⚡ ${tx('Live')}` : tx('Guide')}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {vulnResults.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-red-400" />
              <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Vulnerabilities')} ({vulnResults.length})</h2>
            </div>
            <div className="space-y-2">
              {vulnResults.map((vulnerability) => (
                <Link
                  key={vulnerability.id}
                  to={`/vulnerabilities/${vulnerability.slug}`}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-red-500/40' : 'bg-white border-slate-200 hover:border-red-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{vulnerability.icon}</span>
                    <div>
                      <div className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(vulnerability.title)}</div>
                      <div className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx(vulnerability.description).substring(0, 80)}...</div>
                    </div>
                  </div>
                  <span className={`text-xs shrink-0 ml-3 ${vulnerability.severity === 'Critical' ? 'text-red-400' : vulnerability.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {tx(vulnerability.severity)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {glossaryResults.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-purple-400" />
              <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Glossary')} ({glossaryResults.length})</h2>
            </div>
            <div className="space-y-2">
              {glossaryResults.map((term) => (
                <Link
                  key={term.id}
                  to="/glossary"
                  className={`flex items-start p-4 rounded-xl border transition-colors ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-purple-500/40' : 'bg-white border-slate-200 hover:border-purple-400'
                  }`}
                >
                  <div>
                    <div className={`font-bold text-sm mb-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(term.term)}</div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx(term.shortDef)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {q && totalResults === 0 && (
          <div className="text-center py-20">
            <SearchIcon size={48} className={`mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
            <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('No results found')}</p>
            <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{tx('Try different keywords')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

