import { BUILDING_COLLIDERS } from './townData';
import { ROAD_EDGE_SLOP, onRoad } from './roadPlan';

/**
 * Where props are allowed to sit. Keeps trees/bushes/rocks/flowers on GRASS only —
 * off the sandy road, off the plaza, and out of house footprints.
 *
 * The road test comes from roadPlan.ts, the same module SandRoad rasterises, so
 * "on a path" can't drift away from the road that's actually painted.
 */

/** True only if (x,z) is on open grass (not road, plaza, or a building). */
export function onGrass(x: number, z: number, margin = 0): boolean {
  // clear the road's fuzzy painted margin, not just its ideal edge
  if (onRoad(x, z, margin + ROAD_EDGE_SLOP)) return false;
  for (const c of BUILDING_COLLIDERS) {
    if (x > c.minX - margin && x < c.maxX + margin && z > c.minZ - margin && z < c.maxZ + margin) return false;
  }
  return true;
}
