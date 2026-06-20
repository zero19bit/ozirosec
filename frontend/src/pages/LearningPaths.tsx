import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore } from '../store/useAppStore';
import { labs } from '../data/labs';
import { BookOpen, Clock, ChevronRight, CheckCircle2, Lock } from 'lucide-react';

const paths = [
  {
    id: 'bug-bounty',
    title: 'Bug Bounty Hunter',
    emoji: '🎯',
    color: 'green',
    description: 'Complete bug bounty methodology from reconnaissance to reporting. Follow the exact workflow used by top bounty hunters.',
    estimatedHours: 40,
    level: 'All levels',
    labIds: ['sqli-001', 'sqli-002', 'xss-001', 'xss-002', 'ssrf-001', 'ssrf-002', 'csrf-001', 'idor-001', 'idor-002', 'cors-001'],
    modules: [
      { name: 'Reconnaissance & OSINT', labs: ['sqli-001', 'ssrf-001'], description: 'Find targets and gather information' },
      { name: 'Injection Vulnerabilities', labs: ['sqli-001', 'sqli-002', 'sqli-003'], description: 'SQL, NoSQL, Command injection' },
      { name: 'Client-Side Attacks', labs: ['xss-001', 'xss-002', 'xss-003', 'csrf-001', 'click-001'], description: 'XSS, CSRF, Clickjacking' },
      { name: 'Server-Side Vulnerabilities', labs: ['ssrf-001', 'ssrf-002', 'xxe-001', 'path-001'], description: 'SSRF, XXE, Path Traversal' },
      { name: 'Authentication & Authorization', labs: ['jwt-001', 'jwt-002', 'idor-001', 'auth-001'], description: 'JWT, IDOR, Auth bypass' },
      { name: 'Reporting', labs: [], description: 'Write professional vulnerability reports' },
    ]
  },
  {
    id: 'web-pentester',
    title: 'Web Pentester',
    emoji: '🔍',
    color: 'blue',
    description: 'Systematic web application penetration testing following OWASP Testing Guide methodology.',
    estimatedHours: 60,
    level: 'Intermediate',
    labIds: ['sqli-001', 'sqli-002', 'sqli-003', 'sqli-004', 'xss-001', 'xss-002', 'xss-003', 'csrf-001', 'ssrf-001', 'path-001', 'path-002'],
    modules: [
      { name: 'Information Gathering', labs: ['access-control-001'], description: 'Fingerprinting and enumeration' },
      { name: 'Configuration Testing', labs: ['cors-001', 'click-001'], description: 'Security headers and config flaws' },
      { name: 'Identity & Auth Testing', labs: ['auth-001', 'auth-002', 'jwt-001', 'jwt-002'], description: 'Authentication and session management' },
      { name: 'Authorization Testing', labs: ['idor-001', 'idor-002', 'access-control-001', 'access-control-002'], description: 'Access control flaws' },
      { name: 'Injection Testing', labs: ['sqli-001', 'sqli-002', 'sqli-003', 'cmdi-001'], description: 'All injection categories' },
      { name: 'Client-Side Testing', labs: ['xss-001', 'xss-002', 'xss-003', 'csrf-001'], description: 'Client-side vulnerabilities' },
    ]
  },
  {
    id: 'owasp-top10',
    title: 'OWASP Top 10',
    emoji: '📋',
    color: 'purple',
    description: 'Master all OWASP Top 10 2021 vulnerabilities with one lab per category, from injection to SSRF.',
    estimatedHours: 30,
    level: 'Beginner',
    labIds: ['sqli-001', 'access-control-001', 'xxe-001', 'xss-001', 'sqli-002', 'deser-001', 'fileupload-001', 'ssrf-001', 'jwt-001', 'nosqli-001'],
    modules: [
      { name: 'A01: Broken Access Control', labs: ['access-control-001', 'idor-001'], description: 'Most common OWASP vulnerability' },
      { name: 'A02: Cryptographic Failures', labs: ['jwt-001', 'jwt-002'], description: 'Weak crypto and JWT attacks' },
      { name: 'A03: Injection', labs: ['sqli-001', 'xss-001', 'cmdi-001', 'nosqli-001'], description: 'SQL, XSS, Command injection' },
      { name: 'A04: Insecure Design', labs: ['bizlogic-001', 'bizlogic-002'], description: 'Business logic flaws' },
      { name: 'A05: Security Misconfiguration', labs: ['cors-001', 'click-001'], description: 'Misconfigured security controls' },
      { name: 'A06: Vulnerable Components', labs: ['deser-001'], description: 'Outdated and vulnerable libraries' },
      { name: 'A07: Auth Failures', labs: ['auth-001', 'auth-002'], description: 'Authentication weaknesses' },
      { name: 'A08: Data Integrity', labs: ['deser-001', 'jwt-001'], description: 'Deserialization and integrity' },
      { name: 'A09: Logging Failures', labs: [], description: 'Insufficient logging and monitoring' },
      { name: 'A10: SSRF', labs: ['ssrf-001', 'ssrf-002'], description: 'Server-Side Request Forgery' },
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Researcher',
    emoji: '🔬',
    color: 'red',
    description: 'Master Expert-level vulnerabilities: HTTP Smuggling, Race Conditions, Cache Poisoning, Advanced SSTI, Algorithm Confusion.',
    estimatedHours: 80,
    level: 'Expert',
    labIds: ['jwt-003', 'ssti-002', 'sqli-005', 'xss-005', 'cache-001', 'smuggling-001', 'race-001'],
    modules: [
      { name: 'Advanced Injection', labs: ['sqli-005', 'sqli-006', 'ssti-001', 'ssti-002'], description: 'Blind, time-based, SSTI to RCE' },
      { name: 'JWT Advanced', labs: ['jwt-003'], description: 'Algorithm confusion and jwk injection' },
      { name: 'HTTP Desync', labs: ['smuggling-001'], description: 'CL.TE and TE.CL smuggling' },
      { name: 'Cache Attacks', labs: ['cache-001'], description: 'Web cache poisoning to XSS' },
      { name: 'Race Conditions', labs: ['race-001'], description: 'Concurrent request exploitation' },
      { name: 'CSP Bypass', labs: ['xss-005'], description: 'Content Security Policy evasion' },
    ]
  }
];

export function LearningPaths() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode, completedLabs } = useAppStore();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Learning Paths')}</h1>
          </div>
          <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {tx('Structured curricula designed for different goals and skill levels')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {paths.map(path => {
          const pathLabs = labs.filter(l => path.labIds.includes(l.id));
          const completedCount = pathLabs.filter(l => completedLabs.includes(l.id)).length;
          const pct = pathLabs.length > 0 ? (completedCount / pathLabs.length) * 100 : 0;

          return (
            <div key={path.id} className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`p-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{path.emoji}</span>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(path.title)}</h2>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          {tx(path.level)}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{tx(path.description)}</p>
                      <div className={`flex items-center gap-4 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className="flex items-center gap-1"><Clock size={12} />{path.estimatedHours}h {tx('estimated')}</span>
                        <span>{tx('labsCount', { count: pathLabs.length })}</span>
                        <span className="text-green-400 font-semibold">{completedCount}/{pathLabs.length} {tx('completed')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="p-6">
                <h3 className={`font-bold text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Curriculum')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {path.modules.map((module, index) => {
                    const moduleLabs = labs.filter(l => module.labs.includes(l.id));
                    const moduleCompleted = moduleLabs.filter(l => completedLabs.includes(l.id)).length;
                    const allDone = moduleLabs.length > 0 && moduleCompleted === moduleLabs.length;

                    return (
                      <div key={index} className={`p-4 rounded-xl border ${
                        allDone
                          ? darkMode ? 'border-green-500/30 bg-green-500/5' : 'border-green-300 bg-green-50'
                          : darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{tx('Module')} {index + 1}</div>
                          {allDone
                            ? <CheckCircle2 size={14} className="text-green-400" />
                            : moduleLabs.length === 0
                              ? <Lock size={14} className={darkMode ? 'text-slate-600' : 'text-slate-300'} />
                              : <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{moduleCompleted}/{moduleLabs.length}</span>}
                        </div>
                        <h4 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(module.name)}</h4>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx(module.description)}</p>
                        {moduleLabs.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {moduleLabs.slice(0, 3).map(lab => (
                              <Link
                                key={lab.id}
                                to={`/labs/${lab.slug}`}
                                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                                  completedLabs.includes(lab.id)
                                    ? 'bg-green-500/20 text-green-400'
                                    : darkMode ? 'bg-slate-700 text-slate-400 hover:text-white' : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                                }`}>
                                {completedLabs.includes(lab.id) && <CheckCircle2 size={10} />}
                                {lab.difficulty[0]}
                              </Link>
                            ))}
                            {moduleLabs.length > 3 && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>+{moduleLabs.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const nextLab = pathLabs.find(l => !completedLabs.includes(l.id));
                  return nextLab ? (
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('Next up')}: {tx(nextLab.title)}</span>
                      <Link
                        to={`/labs/${nextLab.slug}`}
                        className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 font-medium">
                        {tx('Continue')} <ChevronRight size={14} />
                      </Link>
                    </div>
                  ) : pathLabs.length > 0 ? (
                    <div className="mt-4 flex items-center gap-2 text-green-400">
                      <CheckCircle2 size={16} />
                      <span className="text-sm font-semibold">{tx('Path Complete!')} 🎉</span>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

