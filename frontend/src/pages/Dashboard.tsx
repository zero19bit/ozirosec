import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore, ALL_BADGES } from '../store/useAppStore';
import { labs } from '../data/labs';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BarChart3, Trophy, Star, FlaskConical, Clock,
  Download, Target, Zap
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export function Dashboard() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode, userXP, completedLabs, badges, userName, getLevel, getXPProgress, labTimers } = useAppStore();
  const level = getLevel();
  const { percent } = getXPProgress();

  const categories = [...new Set(labs.map(l => l.category))];
  const categoryData = categories.map(cat => {
    const catLabs = labs.filter(l => l.category === cat);
    const done = catLabs.filter(l => completedLabs.includes(l.id)).length;
    const localized = tx(cat);
    return {
      name: localized.length > 12 ? localized.substring(0, 12) + '…' : localized,
      total: catLabs.length,
      completed: done
    };
  }).sort((a, b) => b.completed - a.completed);

  const difficultyData = [
    { name: tx('Apprentice'), value: completedLabs.filter(id => labs.find(l => l.id === id)?.difficulty === 'Apprentice').length, total: labs.filter(l => l.difficulty === 'Apprentice').length },
    { name: tx('Practitioner'), value: completedLabs.filter(id => labs.find(l => l.id === id)?.difficulty === 'Practitioner').length, total: labs.filter(l => l.difficulty === 'Practitioner').length },
    { name: tx('Expert'), value: completedLabs.filter(id => labs.find(l => l.id === id)?.difficulty === 'Expert').length, total: labs.filter(l => l.difficulty === 'Expert').length },
  ];

  const timedLabs = labTimers.filter(t => t.bestTime > 0);
  const avgTime = timedLabs.length > 0 ? Math.round(timedLabs.reduce((a, b) => a + b.bestTime, 0) / timedLabs.length) : 0;
  const fastestTime = timedLabs.length > 0 ? Math.min(...timedLabs.map(t => t.bestTime)) : 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const canGetCertificate = completedLabs.length >= 50;

  const downloadCertificate = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const name = userName || 'Security Researcher';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 297, 210, 'F');

    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    doc.setTextColor(34, 197, 94);
    doc.setFontSize(12);
    doc.text('HACKPATH SECURITY ACADEMY', 148.5, 35, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text('Certificate of Achievement', 148.5, 55, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(148, 163, 184);
    doc.text('This is to certify that', 148.5, 75, { align: 'center' });

    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(name, 148.5, 95, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(148, 163, 184);
    doc.text('has successfully completed', 148.5, 112, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94);
    doc.text(`${completedLabs.length} Labs • ${userXP} XP • Level ${level}`, 148.5, 128, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(148, 163, 184);
    doc.text('demonstrating proficiency in web security and bug bounty methodology', 148.5, 142, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Issued: ${date} • HackPath Security Lab • Educational Certificate`, 148.5, 175, { align: 'center' });

    doc.save(`HackPath-Certificate-${name.replace(/\s+/g, '-')}.pdf`);
  };

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px',
    color: darkMode ? '#e2e8f0' : '#1e293b'
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Dashboard')}</h1>
              </div>
              <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('Your security learning progress and statistics')}</p>
            </div>
            {canGetCertificate && (
              <button
                onClick={downloadCertificate}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 transition-all text-sm">
                <Download size={16} />
                {tx('Download Certificate')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Star size={20} className="text-yellow-400" />, value: userXP, label: tx('Total XP'), sub: `${tx('level')} ${level}` },
            { icon: <FlaskConical size={20} className="text-green-400" />, value: completedLabs.length, label: tx('Labs Done'), sub: `${tx('of')} ${labs.length}` },
            { icon: <Trophy size={20} className="text-purple-400" />, value: badges.length, label: tx('Badges'), sub: `${tx('of')} ${ALL_BADGES.length}` },
            { icon: <Clock size={20} className="text-blue-400" />, value: timedLabs.length, label: tx('Timed Runs'), sub: timedLabs.length > 0 ? `${tx('Best')}: ${formatTime(fastestTime)}` : tx('Start timing!') },
          ].map(stat => (
            <div key={stat.label} className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                {stat.icon}
              </div>
              <div className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
              <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{stat.label}</div>
              <div className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('XP Progress')} • {tx('level')} {level}</h2>
            <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{Math.round(percent)}% {tx('to Level {{level}}', { level: Math.min(level + 1, 10) })}</span>
          </div>
          <div className={`h-4 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>

          {!canGetCertificate && (
            <div className={`mt-4 flex items-center gap-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Trophy size={14} className="text-yellow-400" />
              {tx('Complete {{count}} more labs to unlock your certificate!', { count: 50 - completedLabs.length })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className={`font-bold mb-5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Completion by Category')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="completed" name={tx('Completed')} fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name={tx('Total')} fill={darkMode ? '#334155' : '#e2e8f0'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className={`font-bold mb-5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Completion by Difficulty')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {difficultyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#22c55e', '#f59e0b', '#ef4444'][index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className={`font-bold mb-5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Difficulty Breakdown')}</h2>
          <div className="space-y-4">
            {difficultyData.map((diff, index) => {
              const pct = diff.total > 0 ? (diff.value / diff.total) * 100 : 0;
              const colors = ['#22c55e', '#f59e0b', '#ef4444'];
              return (
                <div key={diff.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{diff.name}</span>
                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{diff.value}/{diff.total}</span>
                  </div>
                  <div className={`h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: colors[index] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Recent Badges')}</h2>
            <Link to="/achievements" className="text-sm text-purple-400 hover:text-purple-300">{tx('View all')} →</Link>
          </div>
          {badges.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <Trophy size={32} className="mx-auto mb-2 opacity-30" />
              {tx('Complete labs to earn badges!')}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {badges.slice(-6).reverse().map(badge => (
                <div key={badge.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${darkMode ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{badge.name}</div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {timedLabs.length > 0 && (
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Time Trial Stats')}</h2>
              <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>{tx('Avg')}: {formatTime(avgTime)}</span>
                <span>{tx('Best')}: {formatTime(fastestTime)}</span>
              </div>
            </div>
            <div className="space-y-2">
              {timedLabs.slice(0, 5).map(timer => {
                const lab = labs.find(l => l.id === timer.labId);
                return lab ? (
                  <div key={timer.labId} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx(lab.title)}</span>
                      <span className={`ml-2 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{tx(lab.difficulty)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('Best')}: {formatTime(timer.bestTime)}</span>
                      <Zap size={14} className="text-yellow-400" />
                    </div>
                  </div>
                ) : null;
              })}
            </div>
            <Link to="/leaderboard" className="block mt-4 text-center text-sm text-blue-400 hover:underline">
              {tx('View Full Leaderboard')} →
            </Link>
          </div>
        )}

        {!canGetCertificate && (
          <div className={`p-6 rounded-2xl border-2 border-dashed ${darkMode ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-yellow-400/30 bg-yellow-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Target size={20} className="text-yellow-400" />
              <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Certificate Progress')}</h3>
            </div>
            <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {tx("Complete 50 labs to earn your HackPath Certificate of Achievement. You've completed {{count}}/50 labs.", { count: completedLabs.length })}
            </p>
            <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min((completedLabs.length / 50) * 100, 100)}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

