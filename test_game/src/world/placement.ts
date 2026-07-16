import { HOUSES, houseDoor, PLAZA_POS, BUILDING_COLLIDERS } from './townData';

/**
 * Where props are allowed to sit. Keeps trees/bushes/rocks/flowers on GRASS only —
 * off the plaza, off the tiled paths, and out of house footprints. Mirrors the
 * path layout in Paths.tsx so the "on a path" test matches the actual tiles.
 */

const PLAZA_R = 7.4; // plaza disc + a little margin
const PATH_HALF = 2.1; // path half-width (TilePath width 2.8) + margin

// plaza→door segments, identical start point to Paths.tsx
const PATHS = HOUSES.map((h) => {
  const door = houseDoor(h);
  const dx = door[0] - PLAZA_POS[0];
  const dz = door[1] - PLAZA_POS[2];
  const len = Math.hypot(dx, dz) || 1;
  return {
    ax: PLAZA_POS[0] + (dx / len) * 5.6,
    az: PLAZA_POS[2] + (dz / len) * 5.6,
    bx: door[0],
    bz: door[1],
  };
});

function distToSeg(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  const l2 = dx * dx + dz * dz;
  let t = l2 ? ((px - ax) * dx + (pz - az) * dz) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

/** True only if (x,z) is on open grass (not plaza, path, or a building). */
export function onGrass(x: number, z: number, margin = 0): boolean {
  if (Math.hypot(x - PLAZA_POS[0], z - PLAZA_POS[2]) < PLAZA_R + margin) return false;
  for (const c of BUILDING_COLLIDERS) {
    if (x > c.minX - margin && x < c.maxX + margin && z > c.minZ - margin && z < c.maxZ + margin) return false;
  }
  for (const p of PATHS) {
    if (distToSeg(x, z, p.ax, p.az, p.bx, p.bz) < PATH_HALF + margin) return false;
  }
  return true;
}
