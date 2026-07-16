import { useMemo } from 'react';
import * as THREE from 'three';
import { GltfModel } from './GltfModel';
import { Sway } from './Sway';
import { ForestBackdrop, type Placement } from './ForestBackdrop';
import { ProximityFade } from './ProximityFade';
import { makeToon } from '../render/toon';
import { TREE_VARIANTS, BUSH_VARIANTS } from './nature';
import { EDGE_R } from './townData';

/** deterministic 0..1 hash so the treeline is stable across renders. */
const rng = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const FLOOR_SPAN = 150; // plane size; the gradient is authored in its UV space

/**
 * Deep shade under the woods: a soft radial darkening that starts at the
 * treeline and deepens outward. Authored as a canvas gradient rather than a
 * hard ring so the clearing's edge stays soft — a crisp circle of dark would
 * read as a painted-on decal.
 */
function ForestFloor() {
  const mat = useMemo(() => {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d')!;
    const half = S / 2;
    const g = ctx.createRadialGradient(half, half, 0, half, half, half);
    // clear over the village, ramping to deep shade past the treeline
    const inner = (EDGE_R - 2) / (FLOOR_SPAN / 2);
    const outer = (EDGE_R + 7) / (FLOOR_SPAN / 2);
    g.addColorStop(0, 'rgba(20,38,24,0)');
    g.addColorStop(inner, 'rgba(20,38,24,0)');
    g.addColorStop(outer, 'rgba(20,38,24,0.88)');
    g.addColorStop(1, 'rgba(12,24,16,0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    const m = makeToon({ color: '#ffffff' });
    m.map = tex;
    m.transparent = true;
    m.depthWrite = false;
    m.polygonOffset = true;
    m.polygonOffsetFactor = -4;
    m.polygonOffsetUnits = -4;
    return m;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={mat} renderOrder={3}>
      <planeGeometry args={[FLOOR_SPAN, FLOOR_SPAN, 60, 60]} />
    </mesh>
  );
}

const TREES_N = 96; // PACKED — overlapping canopies across several rows, no gaps to see through
const BUSH_N = 34; // undergrowth filling the gaps at ground level
const BACK_ROWS = 5; // depth of the instanced backdrop forest
const BACK_PER_ROW = 58; // trees per row — tight enough that trunks overlap
const SCRUB_ROWS = 6; // undergrowth rows — what actually blocks the eye-level view
const SCRUB_PER_ROW = 76;

/** Pines read best as a deep forest mass; broadleaf mixed in breaks up the ridge. */
const BACK_PINE = { url: '/models/kits/nature/pine-trees.glb', names: ['PineTree_1', 'PineTree_2', 'PineTree_3', 'PineTree_4', 'PineTree_5'] };
const BACK_LEAF = { url: '/models/kits/nature/trees.glb', names: ['NormalTree_1', 'NormalTree_3', 'NormalTree_5'] };
/** Undergrowth. Trunks alone leave eye-level gaps you can see straight through —
 *  packed scrub between them is what makes the woods actually opaque. */
// 'Bush' twice = weighted: mostly plain scrub. Deep woods shouldn't be in bloom —
// the flowering variants everywhere read tropical, not forest.
const BACK_SCRUB = { url: '/models/kits/nature/bushes.glb', names: ['Bush', 'Bush', 'Plant_1'] };

/**
 * The forest edge ringing the village clearing, built in depth:
 *   1. an instanced backdrop forest of REAL pine + broadleaf models, five rows
 *      deep — this is what makes the woods opaque, so no sky leaks between trunks
 *   2. a jittered, multi-row treeline of detailed swaying models in front of it
 *   3. undergrowth filling the gaps at ground level
 * So the village feels nestled in a clearing and the woods are what stop you,
 * not an invisible wall.
 */
export function VillageEdge() {
  // Backdrop rows: staggered so each row plugs the gaps of the one in front.
  // Instanced, so hundreds of real trees cost about ten draw calls.
  const back: Placement[] = [];
  for (let row = 0; row < BACK_ROWS; row++) {
    for (let i = 0; i < BACK_PER_ROW; i++) {
      const seed = row * 997 + i;
      // half-step offset per row = no radial "corridors" to see down
      const a = ((i + (row % 2) * 0.5) / BACK_PER_ROW) * Math.PI * 2 + (rng(seed) - 0.5) * 0.05;
      const r = EDGE_R + 5.5 + row * 3.4 + rng(seed + 11) * 1.8;
      back.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        s: 2.4 + rng(seed + 23) * 1.5, // big: they must clear the front treeline
        r: rng(seed + 31) * Math.PI * 2,
      });
    }
  }
  // pines carry the mass; every 4th tree is broadleaf so the ridge isn't uniform
  const backPine = back.filter((_, i) => i % 4 !== 0);
  const backLeaf = back.filter((_, i) => i % 4 === 0);

  // Undergrowth: starts just inside the treeline and runs all the way back, big
  // and heavily overlapped, so every horizontal sightline dies in foliage.
  const scrub: Placement[] = [];
  for (let row = 0; row < SCRUB_ROWS; row++) {
    for (let i = 0; i < SCRUB_PER_ROW; i++) {
      const seed = row * 613 + i + 7000;
      const a = ((i + (row % 2) * 0.5) / SCRUB_PER_ROW) * Math.PI * 2 + (rng(seed) - 0.5) * 0.06;
      const r = EDGE_R - 0.5 + row * 2.3 + rng(seed + 3) * 1.4;
      scrub.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        s: 2.2 + rng(seed + 5) * 1.8,
        r: rng(seed + 9) * Math.PI * 2,
      });
    }
  }

  // staggered rows: each tree gets a jittered angle + depth so canopies overlap
  // and there is no straight line of sight out of the clearing
  const trees = Array.from({ length: TREES_N }, (_, i) => {
    const a = (i / TREES_N) * Math.PI * 2 + (rng(i) - 0.5) * 0.055;
    const r = EDGE_R + rng(i + 71) * 6.5; // ~4 rows deep (28.4 → 35)
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, i };
  });

  const bushes = Array.from({ length: BUSH_N }, (_, i) => {
    const a = (i / BUSH_N) * Math.PI * 2 + rng(i + 200) * 0.2;
    const r = EDGE_R - 1.4 + rng(i + 250) * 2.6; // undergrowth softening the tree line
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, i };
  });

  return (
    <>
      {/* 0. deep shade on the forest floor — the village is a LIT clearing, the
          woods are dark. Without this the gaps between trunks show bright meadow
          and the treeline reads as trees standing on a lawn. */}
      <ForestFloor />
      {/* 1. the opaque forest mass — real trees, instanced, behind everything */}
      <ForestBackdrop url={BACK_PINE.url} names={BACK_PINE.names} placements={backPine} />
      <ForestBackdrop url={BACK_LEAF.url} names={BACK_LEAF.names} placements={backLeaf} />
      {/* 2. undergrowth — kills the eye-level sightlines between the trunks */}
      <ForestBackdrop url={BACK_SCRUB.url} names={BACK_SCRUB.names} placements={scrub} />
      {trees.map((t) => {
        const v = TREE_VARIANTS[t.i % TREE_VARIANTS.length];
        const name = v.names[(t.i * 3) % v.names.length];
        return (
          <group key={`et${t.i}`} position={[t.x, 0, t.z]}>
            <ProximityFade>
              <Sway amount={0.045} speed={0.7} phase={t.i * 1.1}>
                <GltfModel
                  url={v.url}
                  name={name}
                  scale={1.6 * (0.95 + rng(t.i + 9) * 0.55)}
                  rotation={[0, rng(t.i + 3) * Math.PI * 2, 0]}
                />
              </Sway>
            </ProximityFade>
          </group>
        );
      })}
      {bushes.map((b) => {
        const v = BUSH_VARIANTS[b.i % BUSH_VARIANTS.length];
        const name = v.names[b.i % v.names.length];
        return (
          <group key={`eb${b.i}`} position={[b.x, 0, b.z]}>
            <Sway amount={0.05} speed={1.1} phase={b.i * 1.7}>
              <GltfModel
                url={v.url}
                name={name}
                scale={1.2 * (0.9 + rng(b.i + 33) * 0.6)}
                rotation={[0, rng(b.i + 5) * Math.PI * 2, 0]}
              />
            </Sway>
          </group>
        );
      })}
    </>
  );
}
