import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore } from '../store/useAppStore';
import { labs, Difficulty } from '../data/labs';
import { FlaskConical, Search, Filter, Clock, Star, CheckCircle2, Lock } from 'lucide-react';

const difficulties: Difficulty[] = ['Apprentice', 'Practitioner', 'Expert'];
const categories = [...new Set(labs.map(l => l.category))].sort();

const difficultyColor: Record<Difficulty, string> = {
  Apprentice: 'text-green-400 bg-green-400/10 border-green-400/20',
  Practitioner: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Expert: 'text-red-400 bg-red-400/10 border-red-400/20'
};

export function Labs() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode, completedLabs } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showSimulated, setShowSimulated] = useState(false);
  const switchThumbClass = (enabled: boolean) => locale === 'fa'
    ? enabled ? '-translate-x-4' : '-translate-x-0.5'
    : enabled ? 'translate-x-4' : 'translate-x-0.5';

  const filtered = useMemo(() => {
    return labs.filter(lab => {
      const matchSearch = !search || lab.title.toLowerCase().includes(search.toLowerCase()) || lab.category.toLowerCase().includes(search.toLowerCase());
      const matchDiff = selectedDifficulty === 'All' || lab.difficulty === selectedDifficulty;
      const matchCat = selectedCategory === 'All' || lab.category === selectedCategory;
      const matchCompleted = showCompleted || !completedLabs.includes(lab.id);
      const matchSimulated = !showSimulated || lab.isSimulated;
      return matchSearch && matchDiff && matchCat && matchCompleted && matchSimulated;
    });
  }, [search, selectedDifficulty, selectedCategory, showCompleted, showSimulated, completedLabs]);

  const stats = {
    total: labs.length,
    completed: completedLabs.length,
    apprentice: labs.filter(l => l.difficulty === 'Apprentice').length,
    practitioner: labs.filter(l => l.difficulty === 'Practitioner').length,
    expert: labs.filter(l => l.difficulty === 'Expert').length,
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FlaskConical size={20} className="text-white" />
                </div>
                <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Labs')}</h1>
              </div>
              <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {tx('Practice web security vulnerabilities with {{count}} interactive challenges', { count: stats.total })}
              </p>
            </div>
            {/* Progress */}
            <div className={`hidden sm:block text-right`}>
              <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.completed}/{stats.total}</div>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('Labs Completed')}</div>
              <div className={`h-1.5 w-32 rounded-full mt-2 ml-auto ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div className="h-full rounded-full bg-green-400" style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Difficulty stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { label: tx('Apprentice'), count: stats.apprentice, color: 'green', icon: '🟢' },
              { label: tx('Practitioner'), count: stats.practitioner, color: 'yellow', icon: '🟡' },
              { label: tx('Expert'), count: stats.expert, color: 'red', icon: '🔴' },
              { label: tx('Live Simulations'), count: labs.filter(l => l.isSimulated).length, color: 'blue', icon: '⚡' },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <span>{s.icon}</span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{s.count}</span>
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className={`p-4 rounded-2xl border mb-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-48 relative">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder={tx('Search labs...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm transition-colors ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-green-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-green-500'
                } outline-none`}
              />
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <Filter size={14} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
              {(['All', ...difficulties] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    selectedDifficulty === d
                      ? 'bg-green-500 border-green-500 text-white'
                      : darkMode
                        ? 'border-slate-700 text-slate-400 hover:border-slate-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                  {tx(d)}
                </button>
              ))}
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-green-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-green-500'
              } outline-none`}>
              <option value="All">{tx('All Categories')}</option>
              {categories.map(c => <option key={c}>{tx(c)}</option>)}
            </select>

            {/* Toggles */}
            <label className={`flex items-center gap-2 cursor-pointer text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <div
                onClick={() => setShowCompleted(!showCompleted)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${showCompleted ? 'bg-green-500' : darkMode ? 'bg-slate-700' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${switchThumbClass(showCompleted)}`} />
              </div>
              {tx('Show completed')}
            </label>
            <label className={`flex items-center gap-2 cursor-pointer text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <div
                onClick={() => setShowSimulated(!showSimulated)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${showSimulated ? 'bg-blue-500' : darkMode ? 'bg-slate-700' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${switchThumbClass(showSimulated)}`} />
              </div>
              {tx('Live only')}
            </label>
          </div>
        </div>

        {/* Results count */}
        <div className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {tx('Showing {{shown}} of {{total}} labs', { shown: filtered.length, total: labs.length })}
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lab) => {
            const isCompleted = completedLabs.includes(lab.id);

            return (
              <Link
                key={lab.id}
                to={`/labs/${lab.slug}`}
                className={`group relative p-5 rounded-xl border transition-all hover:scale-[1.02] ${
                  isCompleted
                    ? darkMode
                      ? 'bg-green-900/10 border-green-500/30'
                      : 'bg-green-50 border-green-300'
                    : darkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-green-500/40'
                      : 'bg-white border-slate-200 hover:border-green-400 hover:shadow-md'
                }`}>
                {/* Completed overlay */}
                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 size={18} className="text-green-400" />
                  </div>
                )}

                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${difficultyColor[lab.difficulty]}`}>
                    {tx(lab.difficulty)}
                  </span>
                  {lab.isWeekly && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">{tx('Weekly')} 2x</span>}
                  {lab.isSimulated && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-400/10 text-blue-400 border border-blue-400/20">{tx('Live')} ⚡</span>}
                  {!lab.isSimulated && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-400/10 text-slate-400 border border-slate-400/20 flex items-center gap-1"><Lock size={10} />{tx('Guide')}</span>}
                </div>

                <h3 className={`font-semibold text-sm mb-2 line-clamp-2 group-hover:text-green-400 transition-colors ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {tx(lab.title)}
                </h3>
                <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {tx(lab.description)}
                </p>

                <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{tx(lab.category)}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock size={10} />{lab.estimatedMinutes} {tx('min short')}</span>
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      <Star size={10} />+{lab.points}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <FlaskConical size={48} className={`mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
            <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('No labs found')}</p>
            <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{tx('Try adjusting your filters')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

