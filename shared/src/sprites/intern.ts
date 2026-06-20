/**
 * The Intern avatar — modular layered pixel rig.
 *
 * Layers composite in order: body → coat → hair → accessory. Each is a 16×20
 * grid authored with sprp(). Customization (skin/hair/accessory at the badge
 * photo) and rank-based coat color reuse this one rig via recolor().
 *
 * This is a front-facing idle frame. Walk-cycle / 4-direction frames land in
 * Checkpoint B; the rig structure here is what they build on.
 */
import { sprp, type Sprite } from '../pixelArt';

export const SKIN_TONES: Record<string, string> = {
  porcelain: '#f3d3bd',
  light: '#e8b894',
  tan: '#c98a5e',
  brown: '#8d5524',
  deep: '#5c3a21',
};

export const HAIR_COLORS: Record<string, string> = {
  black: '#1c1c22',
  brown: '#5a3a1e',
  blonde: '#d9a441',
  red: '#a63a26',
  blue: '#38bdf8',
};

// --- Body (skin + simple face), placeholder color filled at build time ---
export function internBody(skin: string): Sprite {
  const o = '#0a0e1a'; // outline
  const e = '#0a0e1a'; // eyes
  return sprp(
    { S: skin, o, e },
    [
      '................',
      '......oooo......',
      '.....oSSSSo.....',
      '....oSSSSSSo....',
      '....oSeSSeSo....',
      '....oSSSSSSo....',
      '....oSSooSSo....',
      '.....oSSSSo.....',
      '......oSSo......',
      '......oSSo......',
      '.....SSSSSS.....',
      '....SSSSSSSS....',
      '....SSSSSSSS....',
      '....SSSSSSSS....',
      '.....SS..SS.....',
      '.....SS..SS.....',
      '.....SS..SS.....',
      '....oSS..SSo....',
      '....ooo..ooo....',
      '................',
    ],
  );
}

// --- Coat (rank-colored over torso/arms) ---
export function internCoat(coat: string): Sprite {
  const o = '#0a0e1a';
  const sh = '#000000'; // shadow fold
  return sprp(
    { C: coat, o, h: sh },
    [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '...o....o.......',
      '...oCCCCCCo.....',
      '..oCCCChCCCo....',
      '..oCCCChCCCo....',
      '..oCCCChCCCo....',
      '..oCCChhCCCo....',
      '...oCC..CCo.....',
      '................',
      '................',
      '................',
      '................',
    ],
  );
}

// --- Hair (a simple short style; swappable later) ---
export function internHair(hair: string): Sprite {
  const o = '#0a0e1a';
  return sprp(
    { H: hair, o },
    [
      '................',
      '......oooo......',
      '.....oHHHHo.....',
      '....oHHHHHHo....',
      '....oHHHHHHo....',
      '....oH....Ho....',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  );
}

// --- Accessory: clearance badge that glows on the coat (amber by default) ---
export function internBadge(color = '#fbbf24'): Sprite {
  const o = '#0a0e1a';
  return sprp(
    { B: color, o },
    [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '...oB...........',
      '...oB...........',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  );
}

export interface InternLook {
  skin: string;
  hair: string;
  coat: string;
  badge?: string;
}

export function internLayers(look: InternLook): Sprite[] {
  const layers = [
    internBody(look.skin),
    internCoat(look.coat),
    internHair(look.hair),
  ];
  if (look.badge) layers.push(internBadge(look.badge));
  return layers;
}
