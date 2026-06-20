import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface LabTimer {
  labId: string;
  bestTime: number; // seconds
  lastTime: number;
}

export interface UserNote {
  labId: string;
  content: string;
  updatedAt: string;
}

export interface ServerProgressSnapshot {
  completed_labs: string[];
  total_xp: number;
}

interface AppState {
  // User
  userName: string;
  userXP: number;
  completedLabs: string[];
  badges: Badge[];
  labTimers: LabTimer[];
  notes: UserNote[];
  darkMode: boolean;
  language: 'en' | 'fa';
  isAuthenticated: boolean;
  userEmail: string;

  // Actions
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setAuthenticated: (val: boolean) => void;
  syncServerProgress: (progress: ServerProgressSnapshot) => void;
  completeLab: (labId: string, xp: number, difficulty: string) => void;
  awardBadge: (badge: Badge) => void;
  saveBestTime: (labId: string, seconds: number) => void;
  saveNote: (labId: string, content: string) => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: 'en' | 'fa') => void;
  resetProgress: () => void;
  resetLabTimer: (labId: string) => void;
  clearAllTimers: () => void;
  getNote: (labId: string) => string;
  getBestTime: (labId: string) => number | null;
  getLevel: () => number;
  getXPProgress: () => { current: number; next: number; percent: number };
}

const ALL_BADGES: Badge[] = [
  { id: 'first-blood', name: 'First Blood', description: 'Complete your first lab', icon: '🩸' },
  { id: 'sqli-master', name: 'SQLi Master', description: 'Complete all SQL Injection labs', icon: '🗄️' },
  { id: 'xss-vanquisher', name: 'XSS Vanquisher', description: 'Complete all XSS labs', icon: '💉' },
  { id: 'centurion', name: 'Centurion', description: 'Earn 100+ XP', icon: '💯' },
  { id: 'speedrunner', name: 'Speedrunner', description: 'Complete a lab in under 2 minutes', icon: '⚡' },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Complete 10 labs', icon: '⭐' },
  { id: 'veteran', name: 'Veteran', description: 'Complete 25 labs', icon: '🎖️' },
  { id: 'expert-hacker', name: 'Expert Hacker', description: 'Complete an Expert difficulty lab', icon: '🎯' },
  { id: 'csrf-defender', name: 'CSRF Defender', description: 'Complete all CSRF labs', icon: '🔄' },
  { id: 'no-hints', name: 'No Hints Needed', description: 'Complete a lab without viewing hints', icon: '🧠' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userName: '',
      userXP: 0,
      completedLabs: [],
      badges: [],
      labTimers: [],
      notes: [],
      darkMode: true,
      language: 'en',
      isAuthenticated: false,
      userEmail: '',

      setUserName: (name) => set({ userName: name }),
      setUserEmail: (email) => set({ userEmail: email }),
      setAuthenticated: (val) => set({ isAuthenticated: val }),

      syncServerProgress: (progress) => {
        const newCompleted = [...new Set(progress.completed_labs)];
        const newXP = Math.max(0, progress.total_xp);
        const newBadges: Badge[] = [];

        const hasBadge = (id: string) => newBadges.some(b => b.id === id);

        if (!hasBadge('first-blood') && newCompleted.length === 1) {
          const badge = ALL_BADGES.find(b => b.id === 'first-blood')!;
          newBadges.push({ ...badge, unlockedAt: new Date().toISOString() });
        }
        if (!hasBadge('centurion') && newXP >= 100) {
          const badge = ALL_BADGES.find(b => b.id === 'centurion')!;
          newBadges.push({ ...badge, unlockedAt: new Date().toISOString() });
        }
        if (!hasBadge('perfectionist') && newCompleted.length >= 10) {
          const badge = ALL_BADGES.find(b => b.id === 'perfectionist')!;
          newBadges.push({ ...badge, unlockedAt: new Date().toISOString() });
        }
        if (!hasBadge('veteran') && newCompleted.length >= 25) {
          const badge = ALL_BADGES.find(b => b.id === 'veteran')!;
          newBadges.push({ ...badge, unlockedAt: new Date().toISOString() });
        }

        set({ completedLabs: newCompleted, userXP: newXP, badges: newBadges });
      },

      completeLab: () => {
        // Server-authoritative progress: browser-only lab completion is intentionally ignored.
      },

      awardBadge: (badge) => {
        const state = get();
        if (state.badges.some(b => b.id === badge.id)) return;
        set({ badges: [...state.badges, { ...badge, unlockedAt: new Date().toISOString() }] });
      },

      saveBestTime: (labId, seconds) => {
        const state = get();
        const existing = state.labTimers.find(t => t.labId === labId);
        let newTimers: LabTimer[];

        if (existing) {
          newTimers = state.labTimers.map(t =>
            t.labId === labId
              ? { ...t, lastTime: seconds, bestTime: Math.min(t.bestTime, seconds) }
              : t
          );
        } else {
          newTimers = [...state.labTimers, { labId, bestTime: seconds, lastTime: seconds }];
        }

        // Check speedrunner badge
        const newBadges = [...state.badges];
        if (!newBadges.some(b => b.id === 'speedrunner') && seconds < 120) {
          const badge = ALL_BADGES.find(b => b.id === 'speedrunner')!;
          newBadges.push({ ...badge, unlockedAt: new Date().toISOString() });
        }

        set({ labTimers: newTimers, badges: newBadges });
      },

      saveNote: (labId, content) => {
        const state = get();
        const existing = state.notes.find(n => n.labId === labId);
        if (existing) {
          set({
            notes: state.notes.map(n =>
              n.labId === labId ? { ...n, content, updatedAt: new Date().toISOString() } : n
            )
          });
        } else {
          set({ notes: [...state.notes, { labId, content, updatedAt: new Date().toISOString() }] });
        }
      },

      toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
      setLanguage: (lang) => set({ language: lang }),

      resetProgress: () => set({
        userXP: 0,
        completedLabs: [],
        badges: [],
        labTimers: [],
        notes: []
      }),

      resetLabTimer: (labId) => {
        set(s => ({ labTimers: s.labTimers.filter(t => t.labId !== labId) }));
      },

      clearAllTimers: () => set({ labTimers: [] }),

      getNote: (labId) => get().notes.find(n => n.labId === labId)?.content ?? '',
      getBestTime: (labId) => get().labTimers.find(t => t.labId === labId)?.bestTime ?? null,
      getLevel: () => Math.min(Math.floor(get().userXP / 100) + 1, 10),
      getXPProgress: () => {
        const xp = get().userXP;
        const level = Math.min(Math.floor(xp / 100) + 1, 10);
        const currentLevelXP = (level - 1) * 100;
        const nextLevelXP = level * 100;
        const current = xp - currentLevelXP;
        const next = nextLevelXP - currentLevelXP;
        const percent = Math.min((current / next) * 100, 100);
        return { current, next, percent };
      }
    }),
    { name: 'hackpath-store' }
  )
);

export { ALL_BADGES };

