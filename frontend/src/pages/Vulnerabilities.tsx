import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore } from '../store/useAppStore';
import { vulnerabilities, Vulnerability } from '../data/vulnerabilities';
import { labs } from '../data/labs';
import { SyntaxHighlighter } from '../components/SyntaxHighlighter';
import { VulnerabilityCard } from '../components/VulnerabilityCard';
import { VulnerabilityArticle } from '../components/VulnerabilityArticle';
import { vulnerabilityArticles } from '../content/vulnerabilities';
import {
  Shield, Search, ArrowLeft, ExternalLink,
  AlertTriangle, CheckCircle2, Code2, Eye, Target, BookOpen
} from 'lucide-react';

function SeverityBadge({ severity }: { severity: Vulnerability['severity'] }) {
  const { locale } = useLanguage();
  const label = locale === 'fa' ? faLabel(severity) : severity;
  const colors: Record<string, string> = {
    Critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
    High: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    Low: 'bg-green-500/10 text-green-400 border border-green-500/20'
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${colors[severity]}`}>
      {label}
    </span>
  );
}

export function Vulnerabilities() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const filtered = vulnerabilities.filter(v => {
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.description.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = selectedSeverity === 'All' || v.severity === selectedSeverity;
    return matchSearch && matchSeverity;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Vulnerabilities')}</h1>
          </div>
          <p className={`text-base mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {tx('In-depth coverage of {{count}}+ web security vulnerability categories', { count: vulnerabilities.length })}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48 relative">
              <Search size={16} className={`absolute start-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder={tx('Search vulnerabilities...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full ps-9 pe-4 py-2.5 rounded-xl border text-sm ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-red-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-500'
                } outline-none`}
              />
            </div>
            <div className="flex items-center gap-2">
              {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSeverity(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    selectedSeverity === s
                      ? 'bg-red-500 border-red-500 text-white'
                      : darkMode
                        ? 'border-slate-700 text-slate-400 hover:border-slate-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                  {tx(s)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(vuln => {
            const relatedLabs = labs.filter(l => l.categoryId === vuln.id);
            return (
              <VulnerabilityCard
                key={vuln.id}
                vulnerability={vuln}
                relatedLabCount={relatedLabs.length}
                darkMode={darkMode}
              />
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Shield size={48} className={`mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
            <p className={`text-lg font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('No vulnerabilities found')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function VulnerabilityDetail() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { slug } = useParams<{ slug: string }>();
  const { darkMode } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'detection' | 'labs'>('overview');

  const vuln = vulnerabilities.find(v => v.slug === slug);
  const relatedLabs = labs.filter(l => l.categoryId === vuln?.id);
  const completedArticle = vuln
    ? vulnerabilityArticles.find(article => article.id === vuln.id && article.status.english === 'complete' && article.status.persian === 'complete')
    : undefined;

  if (!vuln) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Vulnerability Not Found')}</h2>
          <Link to="/vulnerabilities" className="text-red-400 hover:underline">← Back</Link>
        </div>
      </div>
    );
  }

  if (completedArticle) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <Link to="/vulnerabilities" className={`inline-flex items-center gap-1.5 rounded-lg text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              <ArrowLeft size={16} /> {tx('All Vulnerabilities')}
            </Link>
          </div>
        </div>
        <VulnerabilityArticle article={completedArticle} />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: tx('Overview'), icon: <BookOpen size={14} /> },
    { id: 'code', label: tx('Code Examples'), icon: <Code2 size={14} /> },
    { id: 'detection', label: tx('Detection'), icon: <Eye size={14} /> },
    { id: 'labs', label: `${tx('Labs')} (${relatedLabs.length})`, icon: <Target size={14} /> },
  ] as const;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/vulnerabilities" className={`inline-flex items-center gap-1.5 text-sm mb-5 transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <ArrowLeft size={16} /> {tx('All Vulnerabilities')}
          </Link>

          <div className="flex items-start gap-4">
            <div className="text-4xl">{vuln.icon}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(vuln.title)}</h1>
                <SeverityBadge severity={vuln.severity} />
              </div>
              <p className={`text-base leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {tx(vuln.description)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-transparent">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : darkMode
                      ? 'border-transparent text-slate-400 hover:text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Impact */}
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-orange-400" />
                  <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Impact')}</h2>
                </div>
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{tx(vuln.impact)}</p>
              </div>

              {/* Attack Scenarios */}
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Target size={16} className="text-red-400" />
                  <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Attack Scenarios')}</h2>
                </div>
                <ul className="space-y-3">
                  {vuln.attackScenarios.map((scenario, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-red-400 text-sm mt-0.5 shrink-0">→</span>
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{tx(scenario)}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Common Developer Mistakes')}</h2>
                </div>
                <ul className="space-y-2">
                  {vuln.commonMistakes.map((mistake, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
                      {tx(mistake)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payload Examples */}
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Example Payloads')}</h2>
                <div className="space-y-2">
                  {vuln.examples.map((ex, i) => (
                    <code key={i} className={`technical-ltr block px-4 py-2.5 rounded-lg font-mono text-sm break-all ${darkMode ? 'bg-slate-800 text-green-300' : 'bg-slate-100 text-green-700'}`}>
                      {ex}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Remediation */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <h3 className={`font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Remediation')}</h3>
                </div>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{tx(vuln.remediation)}</p>
              </div>

              {/* References */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className={`font-bold text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('References')}</h3>
                <ul className="space-y-2">
                  {vuln.references.map((ref, i) => (
                    <li key={i}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <ExternalLink size={12} />
                        {tx(ref.title)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Links */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className={`font-bold text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Quick Practice')}</h3>
                {relatedLabs.slice(0, 3).map(lab => (
                  <Link
                    key={lab.id}
                    to={`/labs/${lab.slug}`}
                    className={`flex items-center justify-between p-2.5 rounded-lg mb-2 text-sm transition-colors ${
                      darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}>
                    <span className="text-xs line-clamp-1 flex-1">{tx(lab.title)}</span>
                    <span className={`text-xs ml-2 shrink-0 ${
                      lab.difficulty === 'Apprentice' ? 'text-green-400' :
                      lab.difficulty === 'Practitioner' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{tx(lab.difficulty)}</span>
                  </Link>
                ))}
                {relatedLabs.length > 3 && (
                  <Link to="/labs" className="text-xs text-red-400 hover:underline">View all →</Link>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 p-4 border-b border-red-500/20 bg-red-500/5">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-red-400 font-bold text-sm">{tx('Vulnerable Code')}</span>
              </div>
              <div className="p-4">
                <SyntaxHighlighter code={vuln.codeExamples.vulnerable} language={vuln.codeExamples.language} />
              </div>
            </div>
            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 p-4 border-b border-green-500/20 bg-green-500/5">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-green-400 font-bold text-sm">{tx('Fixed Code')}</span>
              </div>
              <div className="p-4">
                <SyntaxHighlighter code={vuln.codeExamples.fixed} language={vuln.codeExamples.language} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detection' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Eye size={16} className="text-blue-400" /> {tx('Manual Detection')}
              </h3>
              <ul className="space-y-3">
                {vuln.detectionMethods.manual.map((m, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="text-blue-400 shrink-0 font-mono font-bold mt-0.5">{i + 1}.</span>
                    {tx(m)}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Target size={16} className="text-purple-400" /> {tx('Automated Tools')}
              </h3>
              <ul className="space-y-3">
                {vuln.detectionMethods.automated.map((a, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="text-purple-400 shrink-0 mt-0.5">⚙</span>
                    <code className={`technical-ltr text-xs break-all ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{a}</code>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="space-y-4">
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {tx('Labs related to {{title}}: {{count}}', { title: tx(vuln.title), count: relatedLabs.length })}
            </p>
            {relatedLabs.length === 0 ? (
              <div className={`text-center py-12 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Coming soon — labs for this category are in development.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedLabs.map(lab => (
                  <Link
                    key={lab.id}
                    to={`/labs/${lab.slug}`}
                    className={`p-5 rounded-xl border transition-all hover:scale-[1.02] ${
                      darkMode
                        ? 'bg-slate-900 border-slate-800 hover:border-green-500/40'
                        : 'bg-white border-slate-200 hover:border-green-400 hover:shadow-md'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        lab.difficulty === 'Apprentice' ? 'text-green-400 bg-green-400/10' :
                        lab.difficulty === 'Practitioner' ? 'text-yellow-400 bg-yellow-400/10' :
                        'text-red-400 bg-red-400/10'
                      }`}>{tx(lab.difficulty)}</span>
                      {lab.isSimulated && <span className="text-xs text-blue-400">⚡ Live</span>}
                    </div>
                    <h3 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(lab.title)}</h3>
                    <p className={`text-xs line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx(lab.description)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

