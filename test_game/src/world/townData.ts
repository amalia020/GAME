import { PALETTE } from '../render/toon';

export type RoofType = 'pitch' | 'flat' | 'stepped';

export interface Building {
  pos: [number, number];
  size: [number, number, number];
  color: string;
  roof: string;
  /** glow accent (cyan porthole / amber). */
  accent: string;
  roofType: RoofType;
}
export interface TreeDef { pos: [number, number]; scale: number; flower?: boolean }
export interface BushDef { pos: [number, number]; scale: number }
export interface PropDef { pos: [number, number]; kind: 'lamp' }

const BLUE = PALETTE.accentBlue;
const AMBER = PALETTE.accentAmber;

/** Solarpunk villas ringing the square — warm cream/concrete bodies, terracotta
 *  or slate roofs, cyan/amber glow accents, mixed roof styles. */
export const BUILDINGS: Building[] = [
  { pos: [-11, -12], size: [6, 6, 6], color: PALETTE.cream, roof: PALETTE.roofRust, accent: BLUE, roofType: 'pitch' },
  { pos: [-12, -1], size: [5, 5, 8], color: PALETTE.concrete, roof: PALETTE.roofBlue, accent: AMBER, roofType: 'flat' },
  { pos: [-12, 10], size: [6, 5, 6], color: PALETTE.cream, roof: PALETTE.roofRust, accent: BLUE, roofType: 'pitch' },
  { pos: [11, -13], size: [7, 8, 6], color: PALETTE.concrete, roof: PALETTE.roofBlue, accent: BLUE, roofType: 'stepped' },
  { pos: [13, -1], size: [5, 6, 9], color: PALETTE.cream, roof: PALETTE.roofRust, accent: AMBER, roofType: 'pitch' },
  { pos: [12, 11], size: [6, 6, 7], color: PALETTE.blue, roof: PALETTE.roofBlue, accent: BLUE, roofType: 'flat' },
  { pos: [0, -21], size: [11, 9, 7], color: PALETTE.cream, roof: PALETTE.roofRust, accent: BLUE, roofType: 'stepped' },
  { pos: [-23, 4], size: [7, 7, 11], color: PALETTE.concrete, roof: PALETTE.roofBlue, accent: AMBER, roofType: 'flat' },
  { pos: [23, 5], size: [7, 7, 11], color: PALETTE.cream, roof: PALETTE.roofRust, accent: BLUE, roofType: 'pitch' },
  { pos: [0, 23], size: [9, 7, 7], color: PALETTE.blue, roof: PALETTE.roofBlue, accent: AMBER, roofType: 'stepped' },
];

/** Trees — denser, some flowering (pink blossoms). */
export const TREES: TreeDef[] = [
  { pos: [-6, 4], scale: 1.0, flower: true }, { pos: [6, -6], scale: 1.2 },
  { pos: [-5, -9], scale: 0.9 }, { pos: [7, 9], scale: 1.1, flower: true },
  { pos: [-17, -7], scale: 1.0 }, { pos: [18, -8], scale: 1.2, flower: true },
  { pos: [-9, 17], scale: 1.0 }, { pos: [9, 18], scale: 0.9 },
  { pos: [16, 16], scale: 1.1, flower: true }, { pos: [-18, 14], scale: 1.0 },
  { pos: [4, 14], scale: 0.85 }, { pos: [-4, -16], scale: 0.95, flower: true },
];

/** Low bushes for groundcover lushness — kept OFF the central walking paths. */
export const BUSHES: BushDef[] = [
  { pos: [7, 4], scale: 0.9 }, { pos: [-7, 3], scale: 0.8 }, { pos: [9, 8], scale: 1.0 },
  { pos: [-8, 7], scale: 0.9 }, { pos: [8, -3], scale: 0.85 }, { pos: [-9, -4], scale: 1.0 },
  { pos: [10, -10], scale: 0.9 }, { pos: [-10, 10], scale: 0.95 }, { pos: [14, 3], scale: 0.85 },
  { pos: [-14, -6], scale: 1.0 }, { pos: [6, -16], scale: 0.9 }, { pos: [-6, 16], scale: 0.9 },
];

export const PROPS: PropDef[] = [
  { pos: [-4, 5], kind: 'lamp' }, { pos: [5, -4], kind: 'lamp' },
  { pos: [-6, -13], kind: 'lamp' }, { pos: [6, 13], kind: 'lamp' },
];

export interface Collider { minX: number; maxX: number; minZ: number; maxZ: number; }

const fromBuilding = (b: Building): Collider => ({
  minX: b.pos[0] - b.size[0] / 2, maxX: b.pos[0] + b.size[0] / 2,
  minZ: b.pos[1] - b.size[2] / 2, maxZ: b.pos[1] + b.size[2] / 2,
});
const fromCircle = (x: number, z: number, r: number): Collider => ({
  minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r,
});

/** Building footprints — used for both collision and camera occlusion. */
export const BUILDING_COLLIDERS: Collider[] = BUILDINGS.map(fromBuilding);

/** What the camera pulls in for: buildings + tree canopies (so foliage never
 *  buries the view of the character). */
export const CAMERA_OCCLUDERS: Collider[] = [
  ...BUILDING_COLLIDERS,
  ...TREES.map((t) => fromCircle(t.pos[0], t.pos[1], 1.2 * t.scale)),
];

/** Footprints the player can't walk through (buildings, tree trunks, lamps). */
export const COLLIDERS: Collider[] = [
  ...BUILDING_COLLIDERS,
  ...TREES.map((t) => fromCircle(t.pos[0], t.pos[1], 0.5 * t.scale)),
  ...PROPS.map((p) => fromCircle(p.pos[0], p.pos[1], 0.3)),
];
