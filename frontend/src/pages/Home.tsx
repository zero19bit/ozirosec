import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../i18n/LanguageContext';
import { faLabel } from '../utils/localizeContent';
import { useAppStore } from '../store/useAppStore';
import { FloatingHero } from '../components/animations/FloatingHero';
import { MagneticButton } from '../components/animations/MagneticButton';
import { TiltCard } from '../components/animations/TiltCard';
import { labs, weeklyLab } from '../data/labs';
import { vulnerabilities } from '../data/vulnerabilities';
import {
  Shield, FlaskConical, Trophy, Star, ArrowRight,
  Zap, Target, BookOpen, Clock, ChevronRight, AlertTriangle
} from 'lucide-react';

function XPBar() {
  const { t } = useTranslation();
  const { userXP, completedLabs, getLevel, getXPProgress, darkMode } = useAppStore();
  const level = getLevel();
  const { current, next, percent } = getXPProgress();

  return (
    <Link
      aria-label={t('viewProgress')}
      className={`block rounded-2xl border p-5 transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:border-green-500/40' : 'bg-slate-50 border-slate-200 hover:border-green-400'}`}
      to="/dashboard"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Star size={16} className="text-white" />
          </div>
          <div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('yourProgress')}</div>
            <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{userXP} XP • {t('level')} {level}</div>
          </div>
        </div>
        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('labsCount', { count: completedLabs.length })}</div>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className={`flex justify-between text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        <span>{t('xpToLevel', { current, next, level: Math.min(level + 1, 10) })}</span>
        <span>{Math.round(percent)}%</span>
      </div>
    </Link>
  );
}

function SmartRecommender() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { completedLabs, darkMode } = useAppStore();

  const categories = [...new Set(labs.map(l => l.categoryId))];
  const completionRates = categories.map(cat => {
    const catLabs = labs.filter(l => l.categoryId === cat);
    const completed = catLabs.filter(l => completedLabs.includes(l.id)).length;
    return { categoryId: cat, rate: completed / catLabs.length, total: catLabs.length, completed };
  });

  const lowest = completionRates.sort((a, b) => a.rate - b.rate)[0];
  const categoryLabs = labs.filter(l => l.categoryId === lowest.categoryId && !completedLabs.includes(l.id));
  const recommended = categoryLabs.sort((a, b) => {
    const order = { Apprentice: 0, Practitioner: 1, Expert: 2 };
    return order[a.difficulty] - order[b.difficulty];
  })[0];

  const allDone = completedLabs.length >= labs.length;

  if (allDone) {
    return (
      <div className={`rounded-2xl p-5 border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t('allLabsCompleted')}</div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('allLabsCompletedDesc')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!recommended) return null;

  const difficultyColor = { Apprentice: 'green', Practitioner: 'yellow', Expert: 'red' }[recommended.difficulty];
  const recommendedPath = `/labs/${recommended.slug}`;
  const openRecommended = () => navigate(recommendedPath);
  const openRecommendedFromKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openRecommended();
    }
  };

  return (
    <div
      className={`cursor-pointer rounded-2xl border p-5 transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:border-green-500/40' : 'bg-slate-50 border-slate-200 hover:border-green-400'}`}
      onClick={openRecommended}
      onKeyDown={openRecommendedFromKeyboard}
      role="link"
      tabIndex={0}
    >
      <div className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <Target size={12} />
        {t('recommendedForYou')}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(recommended.title)}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-${difficultyColor}-400/10 text-${difficultyColor}-400`}>
              {tx(recommended.difficulty)}
            </span>
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx(recommended.category)}</span>
            <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Clock size={10} />{recommended.estimatedMinutes}m
            </span>
          </div>
          <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('categoryProgress', { completed: lowest.completed, total: lowest.total })}
          </div>
        </div>
        <button
          className="shrink-0 flex items-center gap-1 bg-green-500 hover:bg-green-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          onClick={(event) => {
            event.stopPropagation();
            openRecommended();
          }}
          type="button"
        >
          {t('start')} <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode, completedLabs } = useAppStore();
  const totalLabs = labs.length;
  const weeklyLabPath = `/labs/${weeklyLab.slug}`;
  const openWeeklyLab = () => navigate(weeklyLabPath);
  const openWeeklyLabFromKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openWeeklyLab();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="relative overflow-hidden">
        <FloatingHero darkMode={darkMode} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">{t('homeBadge')}</span>
              </div>

              <h1 className={`text-5xl sm:text-6xl font-black leading-tight mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {t('homeHeroPrefix')}{' '}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {t('homeHeroHighlight')}
                </span>
                {' '}{t('homeHeroSuffix')}
              </h1>

              <p className={`text-lg leading-relaxed mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('homeHeroDescription')}
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <MagneticButton to="/labs" className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/30">
                  <FlaskConical size={18} />
                  {t('startLearning')}
                  <ArrowRight size={18} />
                </MagneticButton>
                <MagneticButton to="/vulnerabilities" className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-xl border transition-colors ${
                  darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}>
                  <BookOpen size={18} />
                  {t('browseVulnerabilities')}
                </MagneticButton>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: '60+', label: t('interactiveLabs'), icon: FlaskConical, color: 'text-green-400' },
                  { value: '20+', label: t('vulnCategories'), icon: Shield, color: 'text-blue-400' },
                  { value: '10+', label: t('liveSimulations'), icon: Zap, color: 'text-yellow-400' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-3xl font-black ${stat.color} mb-1`}>{stat.value}</div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <TiltCard>
                <XPBar />
              </TiltCard>
              <TiltCard>
                <SmartRecommender />
              </TiltCard>

              <TiltCard maxTilt={7}>
                <div
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 transition-colors ${darkMode ? 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-400/60' : 'border-yellow-400/30 bg-yellow-50 hover:border-yellow-500/70'}`}
                  onClick={openWeeklyLab}
                  onKeyDown={openWeeklyLabFromKeyboard}
                  role="link"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={16} className="text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">{t('weeklyChallenge')}</span>
                    <span className="ml-auto text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">2x XP</span>
                  </div>
                  <div className={`font-semibold text-sm mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx(weeklyLab.title)}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx(weeklyLab.category)} • {tx(weeklyLab.difficulty)}</span>
                    <button
                      className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-medium"
                      onClick={(event) => {
                        event.stopPropagation();
                        openWeeklyLab();
                      }}
                      type="button"
                    >
                      {t('attempt')} <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12`}>
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${darkMode ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-300 bg-amber-50'}`}>
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className={`text-sm ${darkMode ? 'text-amber-200/80' : 'text-amber-700'}`}>
            <strong>{t('educationalPurposeOnly')}</strong> {t('educationalDisclaimer')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t('vulnerabilityCategories')}</h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('vulnerabilityCategoriesDesc')}</p>
          </div>
          <Link to="/vulnerabilities" className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium">
            {t('viewAll')} <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {vulnerabilities.slice(0, 12).map((vuln) => (
            <TiltCard key={vuln.id} maxTilt={8}>
              <Link
                to={`/vulnerabilities/${vuln.slug}`}
                className={`group block h-full p-4 rounded-xl border text-center transition-colors ${
                  darkMode
                    ? 'bg-slate-800/50 border-slate-700 hover:border-green-500/50 hover:bg-slate-800'
                    : 'bg-white border-slate-200 hover:border-green-400'
                }`}>
                <div className="text-2xl mb-2">{vuln.icon}</div>
                <div className={`text-xs font-semibold leading-tight ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {tx(vuln.title)}
                </div>
                <div className={`mt-1.5 text-xs px-1.5 py-0.5 rounded-full inline-block font-medium ${
                  vuln.severity === 'Critical' ? 'bg-red-400/10 text-red-400' :
                  vuln.severity === 'High' ? 'bg-orange-400/10 text-orange-400' :
                  vuln.severity === 'Medium' ? 'bg-yellow-400/10 text-yellow-400' :
                  'bg-green-400/10 text-green-400'
                }`}>
                  {tx(vuln.severity)}
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      </div>

      <div className={`py-16 ${darkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t('featuredLabs')}</h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('featuredLabsDesc')}</p>
            </div>
            <Link to="/labs" className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium">
              {t('allLabs', { count: totalLabs })} <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {labs.filter(l => l.isSimulated).slice(0, 6).map((lab) => {
              const isCompleted = completedLabs.includes(lab.id);
              const diffColor = { Apprentice: 'green', Practitioner: 'yellow', Expert: 'red' }[lab.difficulty];

              return (
                <TiltCard key={lab.id}>
                  <Link
                    to={`/labs/${lab.slug}`}
                    className={`group block h-full p-5 rounded-xl border transition-colors ${
                      darkMode
                        ? 'bg-slate-800/50 border-slate-700 hover:border-green-500/40'
                        : 'bg-white border-slate-200 hover:border-green-400'
                    }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-${diffColor}-400/10 text-${diffColor}-400`}>
                          {tx(lab.difficulty)}
                        </span>
                        {lab.isWeekly && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-400/10 text-yellow-400">{t('weekly')}</span>}
                        {lab.isSimulated && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-400/10 text-blue-400">{t('live')}</span>}
                      </div>
                      {isCompleted && <span className="text-green-400 text-lg">✓</span>}
                    </div>
                    <h3 className={`font-semibold text-sm mb-2 line-clamp-2 group-hover:text-green-400 transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {tx(lab.title)}
                    </h3>
                    <p className={`text-xs line-clamp-2 mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {tx(lab.description)}
                    </p>
                    <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span>{tx(lab.category)}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock size={10} />{lab.estimatedMinutes}m</span>
                        <span className="text-yellow-400 font-medium">+{lab.points} XP</span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t('learningPathsTitle')}</h2>
          <Link to="/paths" className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium">
            {t('viewAll')} <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: t('pathBugBountyTitle'),
              description: t('pathBugBountyDesc'),
              labs: 25, time: '40h', level: t('allLevels'), emoji: '🎯', color: 'green'
            },
            {
              title: t('pathWebPentesterTitle'),
              description: t('pathWebPentesterDesc'),
              labs: 35, time: '60h', level: t('intermediate'), emoji: '🔍', color: 'blue'
            },
            {
              title: t('pathOwaspTitle'),
              description: t('pathOwaspDesc'),
              labs: 20, time: '30h', level: t('beginner'), emoji: '📋', color: 'purple'
            }
          ].map(path => (
            <TiltCard key={path.title}>
              <Link
                to="/paths"
                className={`block h-full p-6 rounded-2xl border transition-colors ${
                  darkMode
                    ? 'bg-slate-800/50 border-slate-700 hover:border-green-500/40'
                    : 'bg-white border-slate-200 hover:border-green-400'
                }`}>
                <div className="text-3xl mb-3">{path.emoji}</div>
                <h3 className={`font-bold text-base mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{path.title}</h3>
                <p className={`text-sm mb-4 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{path.description}</p>
                <div className={`flex items-center gap-4 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>{t('labsCount', { count: path.labs })}</span>
                  <span>{path.time}</span>
                  <span>{path.level}</span>
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      </div>

      <div className={`py-16 ${darkMode ? 'bg-gradient-to-r from-green-900/20 to-slate-900' : 'bg-gradient-to-r from-green-50 to-slate-50'}`}>
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className={`text-3xl font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {t('readyTitlePrefix')}{' '}
            <span className="text-green-400">{t('readyTitleHighlight')}</span>?
          </h2>
          <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('readyDescription')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <MagneticButton to="/labs" className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-green-500/30 text-lg">
              {t('startHackingNow')} <ArrowRight size={20} />
            </MagneticButton>
            <MagneticButton to="/dashboard" className={`flex items-center gap-2 font-bold px-8 py-4 rounded-xl border text-lg transition-colors ${
              darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}>
              {t('viewProgress')}
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}

