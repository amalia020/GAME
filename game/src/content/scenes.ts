/**
 * Per-scene walkable floor + interaction anchors, in NORMALIZED background-image
 * coordinates (0..1). Locked to the art, so they survive any viewport size.
 * The floor is a convex polygon (straight-line walking stays inside).
 *
 * (Authored by eye against the scene art; refine as needed. Moves to
 * content/scenes.json behind the Zod loader in C3.)
 */
import type { Pt } from '@morpho/shared';
import type { SceneId } from '../render/assets';

export interface SceneDef {
  /** Convex walkable polygon in normalized image coords. */
  walkArea: Pt[];
  /** Terminal hotspot anchor in normalized image coords. */
  terminal: Pt;
}

export const SCENE_DEFS: Record<SceneId, SceneDef> = {
  cvLab: {
    // central/lower open floor, below the holo-cube, inside the consoles
    walkArea: [
      { x: 0.34, y: 0.56 },
      { x: 0.6, y: 0.56 },
      { x: 0.82, y: 0.72 },
      { x: 0.58, y: 0.94 },
      { x: 0.24, y: 0.94 },
      { x: 0.12, y: 0.7 },
    ],
    terminal: { x: 0.45, y: 0.72 },
  },
  lab: {
    walkArea: [
      { x: 0.32, y: 0.56 },
      { x: 0.62, y: 0.56 },
      { x: 0.82, y: 0.72 },
      { x: 0.58, y: 0.94 },
      { x: 0.22, y: 0.94 },
      { x: 0.12, y: 0.7 },
    ],
    terminal: { x: 0.48, y: 0.72 },
  },
  entrance: {
    walkArea: [
      { x: 0.3, y: 0.58 },
      { x: 0.64, y: 0.58 },
      { x: 0.82, y: 0.74 },
      { x: 0.56, y: 0.94 },
      { x: 0.22, y: 0.94 },
      { x: 0.14, y: 0.72 },
    ],
    terminal: { x: 0.5, y: 0.74 },
  },
};
