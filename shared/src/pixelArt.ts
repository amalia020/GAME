/**
 * Code-defined pixel art.
 *
 * A sprite is pure data: a color palette plus a 2D grid of palette indices.
 * No external image files exist anywhere in this project — every sprite, tile,
 * and avatar layer is authored as one of these grids and rasterized at runtime.
 *
 *   index  -1  → transparent
 *   index >=0  → palette[index]
 *
 * This module is framework-agnostic (no PixiJS). It rasterizes a grid to a
 * <canvas>, which the game layer wraps into a cached PIXI.Texture.
 */

export interface Sprite {
  /** Hex colors ('#rrggbb' or '#rrggbbaa'). Index into this from `pixels`. */
  palette: string[];
  /** Row-major grid of palette indices; -1 = transparent. */
  pixels: number[][];
}

/** A stack of sprites composited top-of-list last (later = drawn on top). */
export interface LayeredSprite {
  width: number;
  height: number;
  layers: Sprite[];
}

export function spriteWidth(sprite: Sprite): number {
  return sprite.pixels[0]?.length ?? 0;
}

export function spriteHeight(sprite: Sprite): number {
  return sprite.pixels.length;
}

/**
 * Author a sprite compactly from a string map: one char per pixel, one row per
 * line. `legend` maps each char to a palette hex; '.' (or space) = transparent.
 *
 *   sprp(['#ff0000', '#000000'], { X: 0, o: 1 }, [
 *     '.XX.',
 *     'XooX',
 *   ])
 *
 * Keeps hand-authored sprites readable instead of a wall of numbers.
 */
export function sprp(
  legend: Record<string, string>,
  rows: string[],
): Sprite {
  const palette: string[] = [];
  const indexOf = new Map<string, number>();
  for (const hex of Object.values(legend)) {
    if (!indexOf.has(hex)) {
      indexOf.set(hex, palette.length);
      palette.push(hex);
    }
  }
  const pixels = rows.map((row) =>
    [...row].map((ch) => {
      if (ch === '.' || ch === ' ') return -1;
      const hex = legend[ch];
      if (hex === undefined) {
        throw new Error(`sprp: char '${ch}' not found in legend`);
      }
      return indexOf.get(hex)!;
    }),
  );
  return { palette, pixels };
}

type CanvasLike = HTMLCanvasElement | OffscreenCanvas;

function makeCanvas(w: number, h: number): CanvasLike {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(w, h);
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Rasterize a sprite to a canvas at integer `scale` (nearest-neighbour — every
 * source pixel becomes a scale×scale block, so it stays crisp). Returns the
 * canvas; the game layer turns it into a texture.
 */
export function rasterize(sprite: Sprite, scale = 1): CanvasLike {
  const w = spriteWidth(sprite);
  const h = spriteHeight(sprite);
  const canvas = makeCanvas(w * scale, h * scale);
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) throw new Error('rasterize: 2D context unavailable');
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < h; y++) {
    const row = sprite.pixels[y];
    for (let x = 0; x < w; x++) {
      const idx = row[x];
      if (idx < 0) continue;
      ctx.fillStyle = sprite.palette[idx];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return canvas;
}

/** Composite a layered sprite onto one canvas, drawing layers in order. */
export function rasterizeLayered(layered: LayeredSprite, scale = 1): CanvasLike {
  const canvas = makeCanvas(layered.width * scale, layered.height * scale);
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) throw new Error('rasterizeLayered: 2D context unavailable');
  ctx.imageSmoothingEnabled = false;

  for (const layer of layered.layers) {
    const h = spriteHeight(layer);
    const w = spriteWidth(layer);
    for (let y = 0; y < h; y++) {
      const row = layer.pixels[y];
      for (let x = 0; x < w; x++) {
        const i = row[x];
        if (i < 0) continue;
        ctx.fillStyle = layer.palette[i];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  return canvas;
}

/**
 * Recolor a sprite by remapping palette entries. Used for rank-based coat color
 * swaps and skin/hair customization — same pixel grid, different palette.
 */
export function recolor(sprite: Sprite, remap: Record<number, string>): Sprite {
  return {
    palette: sprite.palette.map((hex, i) => remap[i] ?? hex),
    pixels: sprite.pixels,
  };
}

/** Stable cache key for a sprite at a scale (palette+dims; good enough here). */
export function spriteKey(sprite: Sprite, scale: number): string {
  return `${sprite.palette.join(',')}|${spriteWidth(sprite)}x${spriteHeight(
    sprite,
  )}|s${scale}|${hashGrid(sprite.pixels)}`;
}

function hashGrid(pixels: number[][]): number {
  let h = 2166136261;
  for (const row of pixels) {
    for (const v of row) {
      h ^= v + 2;
      h = Math.imul(h, 16777619);
    }
  }
  return h >>> 0;
}
