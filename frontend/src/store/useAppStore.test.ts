import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './useAppStore';

describe('useAppStore server-authoritative progress behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({
      userXP: 0,
      completedLabs: [],
      badges: [],
      labTimers: [],
      notes: [],
    });
  });

  it('ignores browser-only lab completion attempts', () => {
    useAppStore.getState().completeLab('forged-lab', 9999, 'Expert');

    expect(useAppStore.getState().completedLabs).toEqual([]);
    expect(useAppStore.getState().userXP).toBe(0);
  });

  it('server progress overwrites forged local progress', () => {
    useAppStore.setState({
      completedLabs: ['forged-lab'],
      userXP: 9999,
      badges: [],
    });

    useAppStore.getState().syncServerProgress({
      completed_labs: ['server-lab'],
      total_xp: 40,
    });

    expect(useAppStore.getState().completedLabs).toEqual(['server-lab']);
    expect(useAppStore.getState().userXP).toBe(40);
  });

  it('deduplicates server labs and clamps negative xp', () => {
    useAppStore.getState().syncServerProgress({
      completed_labs: ['lab-1', 'lab-1'],
      total_xp: -50,
    });

    expect(useAppStore.getState().completedLabs).toEqual(['lab-1']);
    expect(useAppStore.getState().userXP).toBe(0);
  });
});

