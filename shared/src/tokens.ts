/**
 * Design tokens — the single source of visual truth for PROJECT MORPHO.
 *
 * These feed BOTH the PixiJS world and the React/CSS UI so the game and its
 * interface always match. Worlds 2 & 3 reskin the engine by swapping this file
 * (plus the sprite palettes), touching no engine code.
 *
 * Palette per design doc §6 Art Direction.
 */

export const colors = {
  // Dark industrial base
  bgDeep: '#0a0e1a',
  bg: '#0f1626',
  bgRaised: '#1a2332',
  panel: '#141d2e',
  panelBorder: '#243046',

  // MORPHO electric blue — the hero accent
  morpho: '#38bdf8',
  morphoDeep: '#0ea5e9',
  morphoGlow: '#7dd3fc',

  // Warm amber — interactive elements
  amber: '#fbbf24',
  amberDeep: '#f59e0b',

  // Danger red — reserved for lockdown moments only
  danger: '#ef4444',
  dangerDeep: '#b91c1c',

  // Rainforest greens — creep in near windows/atria
  vine: '#3f9d5a',
  vineDeep: '#1f5e33',

  // Text
  text: '#e6edf6',
  textMuted: '#8a9bbd',
  textDim: '#56657f',

  // Signal-strength meter ramp (weak → strong)
  signalWeak: '#b91c1c',
  signalMid: '#fbbf24',
  signalStrong: '#38bdf8',
} as const;

export type ColorToken = keyof typeof colors;

/** Convert a #rrggbb string to the 0xRRGGBB number PixiJS expects. */
export function hexToPixi(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 14,
} as const;

export const font = {
  // Pixel/mono display feel; system fallbacks until we bundle a webfont.
  display: '"Press Start 2P", "Courier New", monospace',
  ui: 'system-ui, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", "Courier New", monospace',
} as const;

/** Rank → lab-coat accent color (drives avatar coat palette swap). */
export const rankCoat = {
  intern: '#9aa7bd',
  junior: '#5b8db8',
  researcher: '#0ea5e9',
  senior: '#38bdf8',
  director: '#7dd3fc',
} as const;
