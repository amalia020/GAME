import { useMemo } from 'react';
import * as THREE from 'three';
import { makeToon, PALETTE } from '../render/toon';
import { canvas2d, makeOverlay, rnd, texFrom, wrapBlob } from './groundTex';
import { InkCyl } from './Inked';

/**
 * The walkable ground: a big subdivided plane (so the curve shader can bend it
 * smoothly) in grass green, and a few distant curved hills filling the horizon.
 * Ground/hills carry no ink outline — only discrete props do — which sidesteps
 * outline drift on the curved far field.
 *
 * The lawn is built from THREE stacked layers (painterly, like hand-painted
 * ground in Ghibli-ish indie games) rather than one flat green:
 *   0.000  base      — grass green × a fine blade/tonal multiply map
 *   0.008  meadow    — big soft darker/lighter patches, so the field has shape
 *   0.016  flecks    — sparse clover + wildflower specks for close-up interest
 * The sandy road (<SandRoad>) stacks on top of these at 0.024+.
 */

/** LAYER 1 — fine detail: near-white base so it MULTIPLIES the grass colour,
 *  adding tonal mottle + blade strokes without washing the green out. */
function makeBladeTexture(): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = canvas2d(S);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, S, S);

  const patches = ['#cfe0c9', '#ffffff', '#dbead5', '#c3d8be'];
  for (let i = 0; i < 46; i++) {
    ctx.fillStyle = patches[i % patches.length];
    ctx.globalAlpha = 0.55;
    wrapBlob(ctx, S, rnd(i) * S, rnd(i + 99) * S, 16 + rnd(i + 7) * 40);
  }

  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = rnd(i + 3) > 0.5 ? '#ffffff' : '#b8cfb2';
    ctx.fillRect(rnd(i + 500) * S, rnd(i + 800) * S, 1.5, rnd(i + 11) > 0.6 ? 3.5 : 1.5);
  }
  ctx.globalAlpha = 1;
  return texFrom(c, 34); // ~7 world units per tile
}

/** LAYER 2 — macro meadow patches: large, very soft, semi-transparent washes of
 *  deeper / sun-bleached green. This is what stops the lawn reading as one tone
 *  from a distance. */
function makeMeadowTexture(): THREE.CanvasTexture {
  const S = 512;
  const [c, ctx] = canvas2d(S);
  const washes = ['#3f7f45', '#8cc46f', '#57a05a', '#a8cf82'];
  for (let i = 0; i < 26; i++) {
    const x = rnd(i + 17) * S;
    const y = rnd(i + 61) * S;
    const r = 40 + rnd(i + 5) * 120;
    // radial falloff → soft painterly edges instead of hard circles
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const col = washes[i % washes.length];
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.34;
    wrapBlob(ctx, S, x, y, r);
  }
  ctx.globalAlpha = 1;
  return texFrom(c, 7); // ~34 world units per tile — big, but still reads while walking
}

/** LAYER 3 — flecks: sparse clover leaves + tiny wildflowers, only readable up
 *  close (where the player actually is), so the grass has texture underfoot. */
function makeFleckTexture(): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = canvas2d(S);
  // clover / leaf tufts — kept in the grass family (a shade deeper or lighter,
  // never pale) so they read as texture underfoot, not confetti on a lawn
  for (let i = 0; i < 110; i++) {
    ctx.fillStyle = rnd(i + 2) > 0.5 ? '#3f8a4a' : '#63ab5f';
    ctx.globalAlpha = 0.5;
    const x = rnd(i + 13) * S;
    const y = rnd(i + 44) * S;
    for (let b = 0; b < 3; b++) {
      const a = (b / 3) * Math.PI * 2 + rnd(i + b) * 1.5;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * 1.4, y + Math.sin(a) * 1.4, 1.2, 0.8, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // wildflowers — a rare warm speck. Sparse + tiny: you notice them, they don't
  // decorate the field.
  const petals = ['#efdb92', '#eee9d8', '#dfa8bd'];
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = petals[i % petals.length];
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(rnd(i + 301) * S, rnd(i + 707) * S, 1.0 + rnd(i + 9) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return texFrom(c, 26); // ~9 world units per tile
}

export function Ground() {
  const grass = useMemo(() => {
    const m = makeToon({ color: PALETTE.grass }); // the map multiplies over this green
    m.map = makeBladeTexture();
    return m;
  }, []);
  const meadow = useMemo(() => makeOverlay(makeMeadowTexture(), 1, 0.85), []);
  const flecks = useMemo(() => makeOverlay(makeFleckTexture(), 2, 0.6), []);

  return (
    <group>
      {/* grass — high segment count for a smooth horizon bend. NOTE: 240/100 = 2.4
          units per segment; <SandRoad> must align to that grid or the curve shader
          tears the two surfaces apart at distance. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={grass} receiveShadow>
        <planeGeometry args={[240, 240, 100, 100]} />
      </mesh>
      {/* macro meadow wash */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} material={meadow} renderOrder={1}>
        <planeGeometry args={[240, 240, 100, 100]} />
      </mesh>
      {/* clover + wildflower flecks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]} material={flecks} renderOrder={2}>
        <planeGeometry args={[240, 240, 100, 100]} />
      </mesh>

      {/* distant hills (curved, no outline) — horizon silhouettes in vine greens */}
      <InkCyl args={[0, 9, 16, 7]} color={PALETTE.green} position={[-34, 0, -40]} outline={false} />
      <InkCyl args={[0, 12, 22, 7]} color={PALETTE.vine} position={[30, 0, -52]} outline={false} />
      <InkCyl args={[0, 7, 13, 6]} color={PALETTE.green} position={[48, 0, -20]} outline={false} />
      <InkCyl args={[0, 8, 15, 7]} color={PALETTE.vine} position={[-48, 0, -18]} outline={false} />
    </group>
  );
}
