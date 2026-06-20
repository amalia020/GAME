/**
 * Game state — the single source of truth, persisted to localStorage so a
 * student can close the tab and resume (the save/resume seam the design doc
 * wants). Plain-TS modules (the Pixi scenes) read/write it via
 * `useGame.getState()`; React components subscribe with the hook.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Phase = 'title' | 'badge' | 'room' | 'level' | 'reward';

export interface RankDef {
  id: string;
  name: string;
  minXp: number;
}

/** Academic ladder (design doc §5). Thresholds are first-pass, tunable. */
export const RANKS: RankDef[] = [
  { id: 'intern', name: 'Intern', minXp: 0 },
  { id: 'junior', name: 'Junior Researcher', minXp: 100 },
  { id: 'researcher', name: 'Researcher', minXp: 300 },
  { id: 'senior', name: 'Senior Researcher', minXp: 600 },
  { id: 'director', name: 'Lab Director', minXp: 1000 },
];

export function rankForXp(xp: number): RankDef {
  let r = RANKS[0];
  for (const def of RANKS) if (xp >= def.minXp) r = def;
  return r;
}

interface GameState {
  phase: Phase;
  internIndex: number | null;
  xp: number;
  completedLevels: string[];
  activeLevelId: string | null;
  /** transient: xp gained in the last completion, for the reward toast */
  lastReward: number;

  startBadge: () => void;
  pickIntern: (i: number) => void;
  openLevel: (id: string) => void;
  closeLevel: () => void;
  completeLevel: (id: string, xp: number) => void;
  dismissReward: () => void;
  reset: () => void;
}

const initial = {
  phase: 'title' as Phase,
  internIndex: null as number | null,
  xp: 0,
  completedLevels: [] as string[],
  activeLevelId: null as string | null,
  lastReward: 0,
};

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initial,

      startBadge: () => set({ phase: 'badge' }),
      pickIntern: (i) => set({ internIndex: i, phase: 'room' }),
      openLevel: (id) => set({ activeLevelId: id, phase: 'level' }),
      closeLevel: () => set({ phase: 'room', activeLevelId: null }),

      completeLevel: (id, xp) => {
        const done = get().completedLevels;
        set({
          completedLevels: done.includes(id) ? done : [...done, id],
          xp: get().xp + xp,
          lastReward: xp,
          phase: 'reward',
        });
      },

      dismissReward: () => set({ phase: 'room', activeLevelId: null, lastReward: 0 }),
      reset: () => set({ ...initial }),
    }),
    {
      name: 'morpho-save-v1',
      // Don't persist transient routing; keep progress + identity.
      partialize: (s) => ({
        internIndex: s.internIndex,
        xp: s.xp,
        completedLevels: s.completedLevels,
      }),
    },
  ),
);

/** Convenience selectors. */
export const isLevelDone = (id: string) =>
  useGame.getState().completedLevels.includes(id);
