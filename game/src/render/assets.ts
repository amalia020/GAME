/**
 * Image-asset registry + loader for the high-fidelity raster art (scenes,
 * characters, MORPHO). These are your generated pixel-art PNGs — loaded as
 * PixiJS textures with LINEAR filtering so they downscale cleanly (the opposite
 * of the code-defined sprites, which use nearest-neighbour).
 *
 * Paths are served from game/public/art, so they resolve at the site root.
 */
import { Assets, Texture } from 'pixi.js';

export const SCENES = {
  entrance: '/art/scenes/AI_Lab_enterance_lockdown.png',
  lab: '/art/scenes/background_lab.png',
  cvLab: '/art/scenes/computer_vision_lab.png',
} as const;
export type SceneId = keyof typeof SCENES;

/** The 12 selectable interns (badge-photo roster). */
export const INTERNS = Array.from(
  { length: 12 },
  (_, i) => `/art/avatars/intern${i + 1}.png`,
);

export const CHARACTERS = {
  morpho: '/art/avatars/morpho_Avatar.png',
  profAmalia: '/art/avatars/PROFESSOR_AMALIA.png',
  profJazz: '/art/avatars/professor_jazz.png',
} as const;

/** Load one texture by URL, cached by PIXI.Assets, with linear scaling. */
export async function loadTexture(url: string): Promise<Texture> {
  const tex = (await Assets.load(url)) as Texture;
  tex.source.scaleMode = 'linear';
  return tex;
}

export async function loadMany(urls: string[]): Promise<Texture[]> {
  return Promise.all(urls.map(loadTexture));
}
