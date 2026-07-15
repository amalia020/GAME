import { NPC_RIGS, type CharacterRig } from '../player/characterModel';
import { PALETTE } from '../render/toon';

export interface Task {
  title: string;
  body: string;
}

export interface HouseContent {
  id: string;
  /** who lives here (NPC display name). */
  npcName: string;
  npcRig: CharacterRig;
  /** interior glow accent (door lintel etc.). */
  accent: string;
  /** lines the NPC says, shown one at a time. Placeholder — real copy added later. */
  dialogue: string[];
  /** placeholder tasks/challenges revealed after the dialogue. */
  tasks: Task[];
}

const PLACEHOLDER_TASKS: Task[] = [
  { title: 'Task 1 — (placeholder)', body: 'A challenge will go here. Content added later.' },
  { title: 'Task 2 — (placeholder)', body: 'Another placeholder task for this house.' },
];

/**
 * Per-house content. Everything here is PLACEHOLDER — the structure is what
 * matters; real dialogue + tasks get dropped in later by editing this one file.
 * `main` is the home-base hub (no challenge). The 7 others each have an NPC.
 */
export const HOUSE_CONTENT: Record<string, HouseContent> = {
  main: {
    id: 'main',
    npcName: 'Guide',
    npcRig: NPC_RIGS.knight,
    accent: PALETTE.accentAmber,
    dialogue: [
      'Welcome home, traveller.',
      'This is your base — come back here any time between challenges.',
      '(Placeholder dialogue. Real content coming soon.)',
    ],
    tasks: [],
  },
  h1: {
    id: 'h1', npcName: 'R(placeholder)', npcRig: NPC_RIGS.rogue, accent: PALETTE.accentBlue,
    dialogue: ['Hello! This is House 1.', '(Placeholder conversation — content added later.)'],
    tasks: PLACEHOLDER_TASKS,
  },
  h2: {
    id: 'h2', npcName: 'RH (placeholder)', npcRig: NPC_RIGS.rogueHooded, accent: PALETTE.accentAmber,
    dialogue: ['Welcome to House 2.', '(Placeholder conversation — content added later.)'],
    tasks: PLACEHOLDER_TASKS,
  },
  h3: {
    id: 'h3', npcName: 'B (placeholder)', npcRig: NPC_RIGS.barbarian, accent: PALETTE.accentBlue,
    dialogue: ['House 3 greets you.', '(Placeholder conversation — content added later.)'],
    tasks: PLACEHOLDER_TASKS,
  },
  h4: {
    id: 'h4', npcName: 'SW (placeholder)', npcRig: NPC_RIGS.skeletonWarrior, accent: PALETTE.accentAmber,
    dialogue: ['You entered House 4.', '(Placeholder conversation — content added later.)'],
    tasks: PLACEHOLDER_TASKS,
  },
  h5: {
    id: 'h5', npcName: 'SM (placeholder)', npcRig: NPC_RIGS.skeletonMage, accent: PALETTE.accentBlue,
    dialogue: ['House 5 awaits.', '(Placeholder conversation — content added later.)'],
    tasks: PLACEHOLDER_TASKS,
  },
  h6: {
    id: 'h6', npcName: 'SR (placeholder)', npcRig: NPC_RIGS.skeletonRogue, accent: PALETTE.accentAmber,
    dialogue: ['This is House 6.', '(Placeholder conversation — content added later.)'],
    tasks: PLACEHOLDER_TASKS,
  },
  h7: {
    id: 'h7', npcName: 'SMi (placeholder)', npcRig: NPC_RIGS.skeletonMinion, accent: PALETTE.accentBlue,
    dialogue: ['House 7, the last one.', '(Placeholder conversation — content added later.)'],
    tasks: PLACEHOLDER_TASKS,
  },
};

export function houseContent(id: string | undefined): HouseContent {
  return (id && HOUSE_CONTENT[id]) || HOUSE_CONTENT.main;
}
