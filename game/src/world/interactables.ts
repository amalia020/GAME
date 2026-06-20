import type { Vec2 } from './coords';

export interface Interactable {
  id: string;
  /** Level id passed to useGame.openLevel(). */
  levelId: string;
  pos: Vec2;
  radius: number;
  /** Prompt text shown when the player is in range. */
  label: string;
}

/** Slice: one interactable — MORPHO, who opens level 1-1. */
export const INTERACTABLES: Interactable[] = [
  {
    id: 'morpho',
    levelId: '1-1',
    pos: { x: 0, z: -1.5 },
    radius: 1.8,
    label: 'Talk to MORPHO  (Enter)',
  },
];
