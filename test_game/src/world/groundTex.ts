import * as THREE from 'three';
import { makeToon } from '../render/toon';

/**
 * Shared canvas-texture helpers for the painterly ground surfaces (the lawn in
 * Ground.tsx, the sand in SandRoad.tsx). Both build their look the same way:
 * stack flat decal layers over the base plane rather than modelling geometry.
 */

/** deterministic 0..1 hash — keeps every layer stable across reloads. */
export const rnd = (n: number) => {
  const x = Math.sin(n * 91.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Draw a blob 9x (offset by ±S) so it wraps seamlessly across tile edges. */
export function wrapBlob(ctx: CanvasRenderingContext2D, S: number, x: number, y: number, r: number) {
  for (const ox of [-S, 0, S]) {
    for (const oy of [-S, 0, S]) {
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function canvas2d(S: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  return [c, c.getContext('2d')!];
}

/** A tiling canvas texture. */
export function texFrom(c: HTMLCanvasElement, repeat: number): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** A transparent decal layer floating just over a base surface. */
export function makeOverlay(map: THREE.CanvasTexture, order: number, opacity = 1): THREE.MeshToonMaterial {
  const m = makeToon({ color: '#ffffff' }); // the map carries its own colour
  m.map = map;
  m.transparent = true;
  m.opacity = opacity;
  m.depthWrite = false; // stack cleanly without fighting each other
  m.polygonOffset = true;
  m.polygonOffsetFactor = -order;
  m.polygonOffsetUnits = -order;
  return m;
}
