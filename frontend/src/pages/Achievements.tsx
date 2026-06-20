import { useAppStore, ALL_BADGES } from '../store/useAppStore';
import { Trophy, Lock } from 'lucide-react';

export function Achievements() {
  const { darkMode, badges, userXP, completedLabs } = useAppStore();

  const isUnlocked = (badgeId: string) => badges.some(b => b.id === badgeId);
  const getUnlockedDate = (badgeId: string) => badges.find(b => b.id === badgeId)?.unlockedAt;

  const badgeRequirements: Record<string, string> = {
    'first-blood': 'Complete your first lab',
    'sqli-master': 'Complete 5 SQL Injection labs',
    'xss-vanquisher': 'Complete 5 XSS labs',
    'centurion': `Earn 100+ XP (current: ${userXP} XP)`,
    'speedrunner': 'Complete a lab in under 2 minutes',
    'perfectionist': `Complete 10 labs (current: ${completedLabs.length})`,
    'veteran': `Complete 25 labs (current: ${completedLabs.length})`,
    'expert-hacker': 'Complete an Expert difficulty lab',
    'csrf-defender': 'Complete all CSRF labs',
    'no-hints': 'Complete a lab without viewing hints',
  };

  const unlockedCount = badges.length;
  const totalCount = ALL_BADGES.length;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Achievements</h1>
          </div>
          <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {unlockedCount}/{totalCount} badges unlocked
          </p>

          <div className={`mt-4 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_BADGES.map(badge => {
            const unlocked = isUnlocked(badge.id);
            const date = getUnlockedDate(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all ${
                  unlocked
                    ? darkMode
                      ? 'bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-500/30'
                      : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                    : darkMode
                      ? 'bg-slate-900 border-slate-800 opacity-60'
                      : 'bg-white border-slate-200 opacity-60'
                }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-4xl ${!unlocked ? 'grayscale opacity-40' : ''}`}>
                    {badge.icon}
                  </div>
                  {unlocked
                    ? <span className="text-xs bg-green-400/10 text-green-400 border border-green-400/20 px-2 py-0.5 rounded-full font-semibold">Unlocked</span>
                    : <Lock size={16} className={darkMode ? 'text-slate-600' : 'text-slate-300'} />
                  }
                </div>
                <h3 className={`font-bold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{badge.name}</h3>
                <p className={`text-xs mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{badge.description}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {unlocked && date
                    ? `Earned: ${new Date(date).toLocaleDateString()}`
                    : badgeRequirements[badge.id] ?? 'Keep hacking!'}
                </p>
              </div>
            );
          })}
        </div>

        {unlockedCount === 0 && (
          <div className="text-center py-16">
            <Trophy size={56} className={`mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No badges yet</h3>
            <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Complete labs to unlock your first badge!</p>
          </div>
        )}
      </div>
    </div>
  );
}

