import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { getLabBySlug, getXPForDifficulty } from '../data/labs';
import { LabSimulator } from '../components/LabSimulator';
import { useLabTimer } from '../hooks/useLabTimer';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft, CheckCircle2, Clock, Star, BookOpen, ChevronDown,
  ChevronUp, FileText, Terminal, Tag, Lock, Shield, Eye, EyeOff,
  Timer, RotateCcw
} from 'lucide-react';

export function LabDetail() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { slug } = useParams<{ slug: string }>();
  const { darkMode, completedLabs, saveNote, getNote } = useAppStore();
  const [showSolution, setShowSolution] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notePreview, setNotePreview] = useState(false);

  const lab = slug ? getLabBySlug(slug) : null;
  const timer = useLabTimer(lab?.id ?? '');

  if (!lab) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Lab Not Found')}</h2>
          <Link to="/labs" className="text-green-400 hover:underline">← {tx('Back to Labs')}</Link>
        </div>
      </div>
    );
  }

  if (!noteLoaded) {
    setNoteContent(getNote(lab.id));
    setNoteLoaded(true);
  }

  const isCompleted = completedLabs.includes(lab.id);
  const xp = getXPForDifficulty(lab.difficulty, lab.isWeekly);

  const diffColor = {
    Apprentice: { badge: 'text-green-400 bg-green-400/10 border-green-400/20', dot: 'bg-green-400' },
    Practitioner: { badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400' },
    Expert: { badge: 'text-red-400 bg-red-400/10 border-red-400/20', dot: 'bg-red-400' }
  }[lab.difficulty];

  const handleGuidedTimerClick = () => {
    if (timer.isActive) {
      timer.resetTimer();
    } else {
      timer.startTimer();
    }
  };

  const handleSaveNote = () => {
    saveNote(lab.id, noteContent);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/labs" className={`inline-flex items-center gap-1.5 text-sm mb-4 transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <ArrowLeft size={16} /> {tx('Back to Labs')}
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${diffColor.badge}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${diffColor.dot}`} />
                  {tx(lab.difficulty)}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {tx(lab.category)}
                </span>
                {lab.isWeekly && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                    ⭐ {tx('Weekly')} 2× XP
                  </span>
                )}
                {lab.isSimulated && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-400/10 text-blue-400 border border-blue-400/20">
                    ⚡ {tx('Interactive Lab')}
                  </span>
                )}
                {!lab.isSimulated && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    <Lock size={10} /> {tx('Guided')}
                  </span>
                )}
                {isCompleted && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-400/10 text-green-400 border border-green-400/20 flex items-center gap-1">
                    <CheckCircle2 size={12} /> {tx('Completed')}
                  </span>
                )}
              </div>

              <h1 className={`text-2xl font-black mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {tx(lab.title)}
              </h1>

              <div className={`flex flex-wrap items-center gap-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="flex items-center gap-1.5"><Clock size={14} />{lab.estimatedMinutes} {tx('min')}</span>
                <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-400" />+{xp} XP</span>
                <span className="flex items-center gap-1.5"><Tag size={14} />{tx('payloadsCount', { count: lab.payloads.length })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-green-400" />
                <h2 className={`font-bold text-sm uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Lab Description')}</h2>
              </div>
              <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{tx(lab.description)}</p>
            </div>

            {lab.isSimulated ? (
              <LabSimulator lab={lab} />
            ) : (
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl border ${darkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                  <Shield size={16} className="text-amber-400" />
                  <span className={`text-sm ${darkMode ? 'text-amber-200/80' : 'text-amber-700'}`}>
                    {tx('This is a guided lab. Practice on PortSwigger Web Security Academy or your own vulnerable instance.')}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Terminal size={14} className="text-blue-400" /> {tx('Reference Payloads')}
                  </h3>
                  <div className="space-y-2">
                    {lab.payloads.map((payload, index) => (
                      <code key={index} className={`technical-ltr block px-3 py-2 rounded-lg text-xs font-mono ${darkMode ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-blue-700'}`}>
                        {payload}
                      </code>
                    ))}
                  </div>
                </div>

                <div className={`flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-xl border ${
                  darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {timer.isActive && (
                      <div className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded ${
                        timer.isRunning ? 'bg-green-500/20 text-green-400' : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                      }`}>
                        <Timer size={12} />
                        {timer.formattedTime}
                      </div>
                    )}
                    {timer.formattedBestTime && (
                      <div className={`text-xs font-mono px-2 py-1 rounded ${darkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                        {tx('Best')}: {timer.formattedBestTime}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGuidedTimerClick}
                    disabled={isCompleted && !timer.isActive}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      timer.isActive
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : isCompleted
                          ? 'bg-slate-500/10 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}>
                    {timer.isActive ? <RotateCcw size={12} /> : <Timer size={12} />}
                    {timer.isActive ? tx('Reset Timer') : tx('Start Timer')}
                  </button>
                </div>

                <button
                  disabled
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                    isCompleted
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 cursor-not-allowed'
                  }`}>
                  {isCompleted ? `✓ ${tx('Lab Marked Complete')}` : tx('Server verification required')}
                </button>
              </div>
            )}

            <div className={`rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="w-full flex items-center justify-between p-5">
                <div className="flex items-center gap-2">
                  {showSolution ? <EyeOff size={16} className="text-slate-400" /> : <Eye size={16} className="text-slate-400" />}
                  <span className={`font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {showSolution ? tx('Hide Solution') : tx('View Solution')}
                  </span>
                  {!isCompleted && <span className="text-xs text-amber-400 ml-2">({tx('Try on your own first!')})</span>}
                </div>
                {showSolution ? <ChevronUp size={16} className={darkMode ? 'text-slate-400' : 'text-slate-500'} /> : <ChevronDown size={16} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />}
              </button>

              {showSolution && (
                <div className={`px-5 pb-5 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div className={`mt-4 p-4 rounded-xl text-sm leading-relaxed ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                    {tx(lab.solution)}
                  </div>
                </div>
              )}
            </div>

            <div className={`rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="w-full flex items-center justify-between p-5">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-purple-400" />
                  <span className={`font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Personal Notes')}</span>
                  {noteContent && <span className="text-xs text-purple-400">{tx('charsCount', { count: noteContent.length })}</span>}
                </div>
                {showNotes ? <ChevronUp size={16} className={darkMode ? 'text-slate-400' : 'text-slate-500'} /> : <ChevronDown size={16} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />}
              </button>

              {showNotes && (
                <div className={`px-5 pb-5 border-t space-y-3 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => setNotePreview(false)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${!notePreview ? 'bg-purple-500 text-white' : darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                      {tx('Edit')}
                    </button>
                    <button
                      onClick={() => setNotePreview(true)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${notePreview ? 'bg-purple-500 text-white' : darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                      {tx('Preview')}
                    </button>
                  </div>

                  {notePreview ? (
                    <div className={`min-h-32 p-4 rounded-xl prose prose-sm max-w-none ${
                      darkMode ? 'prose-invert bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-700'
                    }`}>
                      {noteContent ? <ReactMarkdown>{noteContent}</ReactMarkdown> : <span className="text-slate-400 text-sm italic">{tx('No notes yet...')}</span>}
                    </div>
                  ) : (
                    <textarea
                      value={noteContent}
                      onChange={event => setNoteContent(event.target.value)}
                      placeholder={tx('Write your notes in Markdown... # Heading, **bold**, `code`, etc.')}
                      rows={6}
                      className={`w-full px-4 py-3 rounded-xl border font-mono text-sm resize-y outline-none transition-colors ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-purple-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500'
                      }`}
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {tx('{{count}} characters • Markdown supported', { count: noteContent.length })}
                    </span>
                    <button
                      onClick={handleSaveNote}
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                        noteSaved
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-purple-500 hover:bg-purple-400 text-white'
                      }`}>
                      {noteSaved ? `✓ ${tx('Saved!')}` : tx('Save Notes')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Lab Info')}</h3>
              <div className="space-y-3">
                {[
                  { label: tx('Category'), value: tx(lab.category) },
                  { label: tx('Difficulty'), value: tx(lab.difficulty) },
                  { label: tx('Est. Time'), value: `${lab.estimatedMinutes} ${tx('min')}` },
                  { label: tx('XP Reward'), value: `+${xp} XP${lab.isWeekly ? ' (2x)' : ''}` },
                  { label: tx('Type'), value: lab.isSimulated ? tx('Interactive') : tx('Guided') },
                  { label: tx('Status'), value: isCompleted ? `${tx('Completed')} ✓` : tx('Not completed') },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</span>
                    <span className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Related Resource')}</h3>
              <Link
                to="/vulnerabilities"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                <BookOpen size={14} />
                {tx('View {{category}} Guide', { category: tx(lab.category) })} →
              </Link>
            </div>

            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Hints Available')}</h3>
              <div className="flex gap-2 flex-wrap">
                {lab.hints.map((_, index) => (
                  <div key={index} className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${darkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/labs"
              className={`flex items-center gap-2 p-4 rounded-2xl border text-sm font-medium transition-colors ${darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
              <ArrowLeft size={16} /> {tx('All Labs')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

