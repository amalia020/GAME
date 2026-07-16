import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { makeToon } from '../render/toon';

/** stone shades for per-tile variation (cobble look). */
const STONE = ['#cec7b4', '#c1b9a6', '#d4cdbc', '#b7af9d', '#c8c1ae'];

const TILE = 1.1;
const GAP = 0.14;
const STEP = TILE + GAP;

/**
 * A tiled stone path from `from` → `to` (world x/z). One InstancedMesh (cheap):
 * a grid of slightly jittered, varied-shade slabs — reads as cobbled pavement and
 * toon-shades / curves with the rest of the world.
 */
export function TilePath({ from, to, width = 2.6 }: { from: [number, number]; to: [number, number]; width?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => makeToon({ color: STONE[0] }), []);

  const { count, angle, tiles } = useMemo(() => {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz); // local +Z points toward `to`
    const rows = Math.max(1, Math.round(len / STEP));
    const cols = Math.max(1, Math.round(width / STEP));
    const tiles: { x: number; z: number; h: number; rot: number; c: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({
          x: (c - (cols - 1) / 2) * STEP + Math.sin(r * 3.1 + c) * 0.04,
          z: r * STEP + STEP / 2,
          h: 0.1 + ((r + c) % 2) * 0.03,
          rot: Math.sin(r * 1.7 + c * 2.3) * 0.06,
          c: (r * 3 + c * 2) % STONE.length,
        });
      }
    }
    return { count: tiles.length, angle, tiles };
  }, [from, to, width]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    tiles.forEach((t, i) => {
      o.position.set(t.x, t.h / 2, t.z);
      o.rotation.set(0, t.rot, 0);
      o.scale.set(1, t.h, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      col.set(STONE[t.c]);
      m.setColorAt(i, col);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [tiles]);

  return (
    <group position={[from[0], 0.05, from[1]]} rotation={[0, angle, 0]}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={mat} receiveShadow>
        <boxGeometry args={[TILE, 1, TILE]} />
      </instancedMesh>
    </group>
  );
}

/** A cobbled circular plaza (same varied-stone tiles) — fills a disc of `radius`
 *  centred on its parent group. Used under/around the fountain. */
export function TileDisc({ radius = 6.4 }: { radius?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => makeToon({ color: STONE[0] }), []);

  const { count, tiles } = useMemo(() => {
    const n = Math.ceil(radius / STEP) + 1;
    const tiles: { x: number; z: number; h: number; rot: number; c: number }[] = [];
    for (let r = -n; r <= n; r++) {
      for (let c = -n; c <= n; c++) {
        const x = c * STEP + Math.sin(r * 3.1 + c) * 0.04;
        const z = r * STEP;
        if (Math.hypot(x, z) > radius - 0.3) continue;
        tiles.push({
          x,
          z,
          h: 0.1 + ((r + c) & 1) * 0.03,
          rot: Math.sin(r * 1.7 + c * 2.3) * 0.06,
          c: ((r * 3 + c * 2) % STONE.length + STONE.length) % STONE.length,
        });
      }
    }
    return { count: tiles.length, tiles };
  }, [radius]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    tiles.forEach((t, i) => {
      o.position.set(t.x, t.h / 2, t.z);
      o.rotation.set(0, t.rot, 0);
      o.scale.set(1, t.h, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      col.set(STONE[t.c]);
      m.setColorAt(i, col);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [tiles]);

  return (
    <group position={[0, 0.05, 0]}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={mat} receiveShadow>
        <boxGeometry args={[TILE, 1, TILE]} />
      </instancedMesh>
    </group>
  );
}
