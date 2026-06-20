import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore } from '../store/useAppStore';
import { labs } from '../data/labs';
import { Trophy, Timer, RotateCcw, Trash2, Zap } from 'lucide-react';

export function Leaderboard() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode, labTimers, resetLabTimer, clearAllTimers } = useAppStore();

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const timedLabs = labTimers
    .filter(t => t.bestTime > 0)
    .map(t => {
      const lab = labs.find(l => l.id === t.labId);
      return { ...t, lab };
    })
    .filter(t => t.lab)
    .sort((a, b) => a.bestTime - b.bestTime);

  const avgTime = timedLabs.length > 0
    ? Math.round(timedLabs.reduce((a, b) => a + b.bestTime, 0) / timedLabs.length)
    : 0;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Leaderboard')}</h1>
          </div>
          <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('Your personal time trial records')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: tx('Timed Labs'), value: timedLabs.length, icon: <Timer size={18} className="text-blue-400" /> },
            { label: tx('Average Time'), value: timedLabs.length > 0 ? formatTime(avgTime) : '--:--', icon: <Zap size={18} className="text-yellow-400" /> },
            { label: tx('Fastest Time'), value: timedLabs.length > 0 ? formatTime(timedLabs[0]?.bestTime ?? 0) : '--:--', icon: <Trophy size={18} className="text-green-400" /> },
          ].map(stat => (
            <div key={stat.label} className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              {stat.icon}
              <div className={`text-2xl font-black mt-2 mb-1 font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={clearAllTimers}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-2 rounded-lg hover:bg-red-500/5 transition-colors">
            <Trash2 size={14} />
            {tx('Clear All Records')}
          </button>
        </div>

        {/* Records table */}
        {timedLabs.length === 0 ? (
          <div className={`text-center py-20 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border`}>
            <Timer size={56} className={`mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('No time records yet')}</h3>
            <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {tx('Enable the timer in any lab and complete it to record your time!')}
            </p>
          </div>
        ) : (
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <table className="w-full">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Lab</th>
                  <th className="px-6 py-4 text-left">Difficulty</th>
                  <th className="px-6 py-4 text-right">Best Time</th>
                  <th className="px-6 py-4 text-right">Last Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timedLabs.map((entry, index) => (
                  <tr key={entry.labId} className={`border-b last:border-0 ${darkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className={`px-6 py-4 text-sm font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-orange-400' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {entry.lab?.title}
                      </div>
                      <div className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {entry.lab?.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        entry.lab?.difficulty === 'Apprentice' ? 'text-green-400 bg-green-400/10' :
                        entry.lab?.difficulty === 'Practitioner' ? 'text-yellow-400 bg-yellow-400/10' :
                        'text-red-400 bg-red-400/10'
                      }`}>
                        {entry.lab?.difficulty}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono text-sm font-bold ${index === 0 ? 'text-yellow-400' : darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatTime(entry.bestTime)}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatTime(entry.lastTime)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => resetLabTimer(entry.labId)}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}>
                        <RotateCcw size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info */}
        <div className={`p-4 rounded-xl border text-sm ${darkMode ? 'border-blue-500/20 bg-blue-500/5 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
          <strong>How to record times:</strong> Open any lab, click the ⏱ timer icon in the simulator, then complete the lab. Your best time is automatically saved!
        </div>
      </div>
    </div>
  );
}

