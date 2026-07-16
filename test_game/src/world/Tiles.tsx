import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { makeToon } from '../render/toon';

/** warm stone pavers (subtle variation) sitting on a darker mortar base. */
const STONE = ['#ccc2ac', '#c4baa2', '#d2c9b4', '#bdb39b'];
const GROUT = '#9c937f'; // mortar shown in the joints (never grass)

const TILE = 1.0; // paver size
const GAP = 0.16; // joint width (mortar shows here)
const STEP = TILE + GAP;
const BASE_TOP = 0.12; // mortar surface height
const TILE_TOP = 0.16; // paver top (a hair above the mortar → crisp, shallow joints)

/** Set instanced paver matrices + subtle per-tile shade. */
function fill(
  mesh: THREE.InstancedMesh | null,
  tiles: { x: number; z: number; c: number }[],
) {
  if (!mesh) return;
  const o = new THREE.Object3D();
  const col = new THREE.Color();
  tiles.forEach((t, i) => {
    o.position.set(t.x, TILE_TOP / 2, t.z);
    o.scale.set(1, TILE_TOP, 1);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    col.set(STONE[t.c]);
    mesh.setColorAt(i, col);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

/**
 * A tiled stone path from `from` → `to`: a solid mortar strip + neat, uniform
 * pavers on top (tight joints show mortar, never grass). No jitter — clean.
 */
export function TilePath({ from, to, width = 2.8 }: { from: [number, number]; to: [number, number]; width?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => makeToon({ color: STONE[0] }), []);
  const baseMat = useMemo(() => makeToon({ color: GROUT }), []);

  const { count, angle, len, cols, tiles } = useMemo(() => {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz); // local +Z toward `to`
    const rows = Math.max(1, Math.round(len / STEP));
    const cols = Math.max(1, Math.round(width / STEP));
    const tiles: { x: number; z: number; c: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({ x: (c - (cols - 1) / 2) * STEP, z: r * STEP + STEP / 2, c: (r * 3 + c * 2) % STONE.length });
      }
    }
    return { count: tiles.length, angle, len, cols, tiles };
  }, [from, to, width]);

  useLayoutEffect(() => fill(ref.current, tiles), [tiles]);

  return (
    <group position={[from[0], 0.03, from[1]]} rotation={[0, angle, 0]}>
      {/* mortar base strip */}
      <mesh position={[0, BASE_TOP / 2, len / 2]} material={baseMat} receiveShadow>
        <boxGeometry args={[cols * STEP, BASE_TOP, len + STEP * 0.5]} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={mat} receiveShadow>
        <boxGeometry args={[TILE, 1, TILE]} />
      </instancedMesh>
    </group>
  );
}

/**
 * A cobbled circular plaza: a solid mortar disc, neat pavers clipped inside the
 * circle (none poke past the edge), and a raised stone curb ring framing it.
 */
export function TileDisc({ radius = 6.6 }: { radius?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => makeToon({ color: STONE[0] }), []);
  const baseMat = useMemo(() => makeToon({ color: GROUT }), []);
  const curbMat = useMemo(() => makeToon({ color: '#b7ad97' }), []);

  const { count, tiles } = useMemo(() => {
    const n = Math.ceil(radius / STEP) + 1;
    const tiles: { x: number; z: number; c: number }[] = [];
    for (let r = -n; r <= n; r++) {
      for (let c = -n; c <= n; c++) {
        const x = c * STEP;
        const z = r * STEP;
        // keep pavers fully inside the circle (no square poke-out past the rim)
        if (Math.hypot(x, z) > radius - TILE * 0.7) continue;
        tiles.push({ x, z, c: ((r * 3 + c * 2) % STONE.length + STONE.length) % STONE.length });
      }
    }
    return { count: tiles.length, tiles };
  }, [radius]);

  useLayoutEffect(() => fill(ref.current, tiles), [tiles]);

  return (
    <group position={[0, 0.03, 0]}>
      {/* mortar disc (its clean round edge IS the plaza edge) */}
      <mesh position={[0, BASE_TOP / 2, 0]} material={baseMat} receiveShadow>
        <cylinderGeometry args={[radius, radius, BASE_TOP, 48]} />
      </mesh>
      {/* raised stone curb ring framing the circle */}
      <mesh position={[0, BASE_TOP, 0]} rotation={[-Math.PI / 2, 0, 0]} material={curbMat}>
        <ringGeometry args={[radius - 0.25, radius + 0.15, 48]} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} material={mat} receiveShadow>
        <boxGeometry args={[TILE, 1, TILE]} />
      </instancedMesh>
    </group>
  );
}
