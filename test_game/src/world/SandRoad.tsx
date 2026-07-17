import { useMemo } from 'react';
import * as THREE from 'three';
import { makeToon, PALETTE } from '../render/toon';
import { canvas2d, makeOverlay, rnd, texFrom, wrapBlob } from './groundTex';
import { ROAD_DISCS, ROAD_SEGS, ROAD_WOBBLE } from './roadPlan';

/**
 * The sandy road: the plaza and all eight walkways as ONE continuous surface,
 * painted flat onto the lawn instead of built as geometry.
 *
 * Why painted: the old tiles were raised boxes (mortar slab at y=0.12, pavers at
 * 0.16), and that height is exactly why they ended in a lip instead of meeting the
 * houses. Flat decals have no edge to catch.
 *
 * Why ONE mask: the road's shape is rasterised into a single world-space image
 * (plaza + capsules + doorstep aprons, unioned). One image means no seams anywhere —
 * "smooth and fully connected" falls out of the representation instead of having to
 * be chased per-segment.
 *
 * Each layer uses TWO textures, which three.js applies with independent UV
 * transforms (`mapTransform` vs `alphaMapTransform` — verified in the r184 source):
 *   map      — a small TILING sand texture  (repeat ~20) → detail underfoot
 *   alphaMap — the big WORLD-SPACE road mask (repeat 1)  → the road's shape
 *
 * Layers, matching the lawn's approach (grass 0 / meadow 0.008 / flecks 0.016):
 *   0.024  base    — sand colour × grain
 *   0.030  mottle  — big soft tonal washes, so it isn't one flat beige
 *   0.036  detail  — pebbles + faint ruts, only readable up close
 */

/** World span the mask covers, centred on the origin. MUST keep the plane's
 *  half-extent an integer multiple of the lawn's 2.4-unit segment pitch (36/2.4 =
 *  15) — otherwise the curve shader, which displaces per-vertex by view-distance²
 *  and interpolates linearly between them, tears sand and grass apart at distance.
 *  Road extent is x ±15.4, z −23.4..25.4, so ±36 covers it with margin. */
const SPAN = 72;
const SEGS = 30; // 72/30 = 2.4 — the lawn's pitch exactly
const MASK = 2048; // 28.4 px per world unit
const K = MASK / SPAN;

const wx = (x: number) => (x + SPAN / 2) * K;
const wz = (z: number) => (z + SPAN / 2) * K;

/**
 * The road's shape as a greyscale mask.
 *
 * CRITICAL: `alphaMap` samples the GREEN channel (`alphamap_fragment.glsl.js` does
 * `diffuseColor.a *= texture2D(alphaMap, vAlphaMapUv).g`), and canvas uploads are
 * un-premultiplied — so white-on-transparent would arrive as green=255 everywhere
 * and collapse every soft edge into a hard binary one. Painting opaque white on
 * opaque black keeps the coverage ramp in RGB, where the shader can read it.
 */
function makeRoadMask(): THREE.CanvasTexture {
  // --- canvas A: the hard union -------------------------------------------------
  const [ca, a] = canvas2d(MASK);
  a.fillStyle = '#000000';
  a.fillRect(0, 0, MASK, MASK);
  a.fillStyle = '#ffffff';
  a.strokeStyle = '#ffffff';
  a.lineCap = 'round';
  a.lineJoin = 'round';

  for (const c of ROAD_DISCS) {
    a.beginPath();
    a.arc(wx(c.cx), wz(c.cz), c.r * K, 0, Math.PI * 2);
    a.fill();
  }

  // capsules drawn as wobbly polylines — a perfectly straight edge reads as a
  // drawn line, not a trodden path
  ROAD_SEGS.forEach((s, si) => {
    const dx = s.bx - s.ax;
    const dz = s.bz - s.az;
    const len = Math.hypot(dx, dz);
    if (len < 1e-3) return;
    const nx = -dz / len;
    const nz = dx / len;
    const steps = Math.max(2, Math.ceil(len / 1.5));
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      const off = (t: number, k: number) => (rnd(si * 31 + k) - 0.5) * 2 * ROAD_WOBBLE * Math.sin(t * Math.PI);
      const o0 = off(t0, i);
      const o1 = off(t1, i + 1);
      a.lineWidth = s.half * 2 * (0.88 + rnd(si * 17 + i) * 0.24) * K;
      a.beginPath();
      a.moveTo(wx(s.ax + dx * t0 + nx * o0), wz(s.az + dz * t0 + nz * o0));
      a.lineTo(wx(s.ax + dx * t1 + nx * o1), wz(s.az + dz * t1 + nz * o1));
      a.stroke();
    }
  });

  // irregular bite: sand spilling out, grass creeping in. Opaque white is
  // idempotent under source-over, so overlaps union exactly — no seams.
  for (let i = 0; i < 320; i++) {
    const s = ROAD_SEGS[i % ROAD_SEGS.length];
    const t = rnd(i + 5);
    const dx = s.bx - s.ax;
    const dz = s.bz - s.az;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    const side = rnd(i + 61) > 0.5 ? 1 : -1;
    const out = i % 2 === 0;
    const off = side * (s.half + (out ? 0.1 : -0.35));
    a.fillStyle = out ? '#ffffff' : '#000000';
    a.beginPath();
    a.arc(
      wx(s.ax + dx * t + nx * off),
      wz(s.az + dz * t + nz * off),
      (0.3 + rnd(i + 13) * 0.6) * K,
      0,
      Math.PI * 2,
    );
    a.fill();
  }

  // --- canvas B: one soft edge over the finished union ---------------------------
  // Blurring per-shape would brighten every overlap into a visible seam; blurring
  // the union once cannot.
  const [cb, b] = canvas2d(MASK);
  b.fillStyle = '#000000';
  b.fillRect(0, 0, MASK, MASK);
  b.filter = `blur(${Math.round(0.5 * K)}px)`; // ~0.5 world units of feather
  b.drawImage(ca, 0, 0);
  b.filter = 'none';

  const tex = new THREE.CanvasTexture(cb);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; // one shot, never tiled
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** LAYER 1 — grain. Opaque: `map` multiplies the full RGBA, so any transparency
 *  here would punch holes straight through the road. */
function makeSandGrainTexture(): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = canvas2d(S);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, S, S);

  const patches = ['#efe4cd', '#d6c3a0', '#e8dabc', '#ffffff'];
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = patches[i % patches.length];
    ctx.globalAlpha = 0.5;
    wrapBlob(ctx, S, rnd(i + 41) * S, rnd(i + 77) * S, 14 + rnd(i + 3) * 36);
  }
  // fine grit
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = rnd(i + 9) > 0.5 ? '#ffffff' : '#cbb694';
    ctx.fillRect(rnd(i + 601) * S, rnd(i + 903) * S, 1.4, 1.4);
  }
  ctx.globalAlpha = 1;
  return texFrom(c, 20); // ~3.6 world units per tile
}

/** LAYER 2 — big soft washes of lighter/darker sand, so the road has shape from
 *  a distance instead of reading as one flat beige ribbon. */
function makeSandMottleTexture(): THREE.CanvasTexture {
  const S = 512;
  const [c, ctx] = canvas2d(S);
  // Keep the washes CLOSE in tone. High-contrast washes at this scale stop reading
  // as drifting sand and start reading as a field of soft bubbles.
  const washes = ['#d9c49c', '#eadfc4', '#d2bb92', '#e6d8b6'];
  for (let i = 0; i < 40; i++) {
    const x = rnd(i + 23) * S;
    const y = rnd(i + 89) * S;
    const r = 60 + rnd(i + 11) * 150; // bigger + more of them = they blend, not dot
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, washes[i % washes.length]);
    g.addColorStop(0.55, washes[i % washes.length]);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.22;
    wrapBlob(ctx, S, x, y, r);
  }
  ctx.globalAlpha = 1;
  return texFrom(c, 4); // ~18 world units per tile
}

/** LAYER 3 — pebbles + grit, only readable where the player actually walks. */
function makeSandDetailTexture(): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = canvas2d(S);
  // pebbles
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = rnd(i + 7) > 0.5 ? '#b9a781' : '#efe6d0';
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(
      rnd(i + 19) * S,
      rnd(i + 53) * S,
      1.1 + rnd(i + 2) * 1.4,
      0.9 + rnd(i + 4) * 1.0,
      rnd(i + 6) * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  // faint ruts / scuffs
  ctx.globalAlpha = 0.28;
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = rnd(i + 31) > 0.5 ? '#c3b190' : '#f0e7d2';
    ctx.fillRect(rnd(i + 211) * S, rnd(i + 307) * S, 3 + rnd(i + 8) * 7, 1.1);
  }
  ctx.globalAlpha = 1;
  return texFrom(c, 26); // ~2.8 world units per tile
}

export function SandRoad() {
  const mask = useMemo(() => makeRoadMask(), []);

  const base = useMemo(() => {
    const m = makeToon({ color: PALETTE.road }); // warm pale sand; grain multiplies over it
    m.map = makeSandGrainTexture();
    m.alphaMap = mask;
    m.transparent = true; // without this, `#ifdef OPAQUE` forces a=1 → a sand SQUARE
    m.depthWrite = false;
    m.polygonOffset = true;
    m.polygonOffsetFactor = -4;
    m.polygonOffsetUnits = -4;
    return m;
  }, [mask]);

  const mottle = useMemo(() => {
    const m = makeOverlay(makeSandMottleTexture(), 5, 0.5);
    m.alphaMap = mask;
    return m;
  }, [mask]);

  const detail = useMemo(() => {
    const m = makeOverlay(makeSandDetailTexture(), 6, 0.55);
    m.alphaMap = mask;
    return m;
  }, [mask]);

  // every layer receives shadows: makeOverlay builds a LIT white material, so an
  // unshadowed layer on top would wash the character's own shadow back out
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.024, 0]} material={base} renderOrder={4} receiveShadow>
        <planeGeometry args={[SPAN, SPAN, SEGS, SEGS]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} material={mottle} renderOrder={5} receiveShadow>
        <planeGeometry args={[SPAN, SPAN, SEGS, SEGS]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.036, 0]} material={detail} renderOrder={6} receiveShadow>
        <planeGeometry args={[SPAN, SPAN, SEGS, SEGS]} />
      </mesh>
    </group>
  );
}
