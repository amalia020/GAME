import { HOUSES, houseDoor, PLAZA_POS } from './townData';

/**
 * WHERE THE ROAD IS — the single source of truth for the sandy road's shape.
 *
 * Both the painted road (SandRoad.tsx, which rasterises this into an alpha mask)
 * and the foliage exclusion test (placement.ts `onGrass`) read from here. They used
 * to carry separate copies of the layout maths, which could silently drift apart and
 * leave grass tufts sprouting through the walkway.
 */

export const ROAD_HALF = 1.6; // half-width: a road reads wider than the old 2.8 tile path
export const ROAD_PLAZA_R = 6.8; // matches the tiled disc it replaces
export const ROAD_APRON_R = 2.6; // worn landing pad at each doorstep
export const ROAD_WOBBLE = 0.3; // how far the painted edge strays from the ideal line
export const ROAD_FEATHER = 0.5; // soft blur ramp into the grass
/** How far past the ideal edge the painted sand can actually reach. Foliage has to
 *  clear this, not just ROAD_HALF, or tufts sprout in the road's fuzzy margin. */
export const ROAD_EDGE_SLOP = ROAD_WOBBLE + ROAD_FEATHER;

export interface RoadSeg { ax: number; az: number; bx: number; bz: number; half: number }
export interface RoadDisc { cx: number; cz: number; r: number }

/** Open sand: the plaza, plus a landing pad at every doorstep. */
export const ROAD_DISCS: RoadDisc[] = [
  { cx: PLAZA_POS[0], cz: PLAZA_POS[2], r: ROAD_PLAZA_R },
  ...HOUSES.map((h) => {
    const d = houseDoor(h);
    return { cx: d[0], cz: d[1], r: ROAD_APRON_R };
  }),
];

/**
 * Two segments per house, and the second one is the whole point.
 *
 * `houseYaw` aims each door at the world ORIGIN (0,0), but the plaza sits at (0,-4).
 * So a single plaza→house line arrives about a metre off the door and enters at a
 * skew. Instead: plaza → doorstep, then doorstep → house CENTRE. The second segment
 * runs exactly along the door normal and dies under the foundation, which makes a
 * gap at the doorstep geometrically impossible. Half-width 1.6 against a 3.2
 * half-extent footprint means it never pokes out the sides of the house.
 */
export const ROAD_SEGS: RoadSeg[] = HOUSES.flatMap((h) => {
  const d = houseDoor(h);
  return [
    { ax: PLAZA_POS[0], az: PLAZA_POS[2], bx: d[0], bz: d[1], half: ROAD_HALF },
    { ax: d[0], az: d[1], bx: h.pos[0], bz: h.pos[1], half: ROAD_HALF },
  ];
});

/** Distance from (px,pz) to segment a→b. */
export function distToSeg(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  const l2 = dx * dx + dz * dz;
  let t = l2 ? ((px - ax) * dx + (pz - az) * dz) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

/** Signed distance to the road (union of discs + capsules). <= 0 means on the road. */
export function sdRoad(x: number, z: number): number {
  let d = Infinity;
  for (const c of ROAD_DISCS) d = Math.min(d, Math.hypot(x - c.cx, z - c.cz) - c.r);
  for (const s of ROAD_SEGS) d = Math.min(d, distToSeg(x, z, s.ax, s.az, s.bx, s.bz) - s.half);
  return d;
}

export function onRoad(x: number, z: number, margin = 0): boolean {
  return sdRoad(x, z) < margin;
}
