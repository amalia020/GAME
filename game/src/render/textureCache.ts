/**
 * Bridges shared's framework-agnostic pixel-art rasterizer to PixiJS textures.
 *
 * `shared` knows nothing about Pixi — it produces canvases. This module wraps
 * those canvases into PIXI.Textures and caches them so each unique sprite (at a
 * given scale) rasterizes exactly once for the whole session.
 */
import { Texture } from 'pixi.js';
import {
  rasterize,
  rasterizeLayered,
  spriteKey,
  type LayeredSprite,
  type Sprite,
} from '@morpho/shared';

const cache = new Map<string, Texture>();

function canvasToTexture(canvas: HTMLCanvasElement | OffscreenCanvas): Texture {
  const tex = Texture.from(canvas as HTMLCanvasElement);
  // Nearest-neighbour scaling keeps pixels crisp when the world zooms.
  tex.source.scaleMode = 'nearest';
  return tex;
}

/** Texture for a single sprite at integer `scale`, cached by content. */
export function spriteTexture(sprite: Sprite, scale = 1): Texture {
  const key = spriteKey(sprite, scale);
  let tex = cache.get(key);
  if (!tex) {
    tex = canvasToTexture(rasterize(sprite, scale));
    cache.set(key, tex);
  }
  return tex;
}

/** Texture for a composited layered sprite. `cacheKey` must be unique per look. */
export function layeredTexture(
  layered: LayeredSprite,
  scale: number,
  cacheKey: string,
): Texture {
  const key = `layered:${cacheKey}:s${scale}`;
  let tex = cache.get(key);
  if (!tex) {
    tex = canvasToTexture(rasterizeLayered(layered, scale));
    cache.set(key, tex);
  }
  return tex;
}

/** Clear the texture cache (e.g. when reskinning to another World). */
export function clearTextureCache(): void {
  for (const tex of cache.values()) tex.destroy(true);
  cache.clear();
}
