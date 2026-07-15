import type { BuildingModel } from './Building';

export interface TreeDef { pos: [number, number]; scale: number; flower?: boolean }
export interface BushDef { pos: [number, number]; scale: number }
export interface PropDef { pos: [number, number]; kind: 'lamp' }

/** A house = a KayKit building + identity. 1 MAIN (home-base hub) + 7 challenge
 *  houses ring the plaza; every door faces the centre. */
export interface House {
  id: string;
  name: string;
  model: BuildingModel;
  pos: [number, number];
  main?: boolean;
}

export const HOUSE_SCALE = 3.2;
const HALF = HOUSE_SCALE; // 2-unit building footprint → half-extent = scale

/** Door faces the building's local +Z; rotate that toward the plaza centre. */
export const houseYaw = (h: House): number => Math.atan2(-h.pos[0], -h.pos[1]);

/** World x/z of the entry trigger, just outside the door face. */
export const houseDoor = (h: House): [number, number] => {
  const t = houseYaw(h);
  const d = HALF + 1.3;
  return [h.pos[0] + Math.sin(t) * d, h.pos[1] + Math.cos(t) * d];
};

export const HOUSES: House[] = [
  { id: 'main', name: 'Home Base', model: 'H', pos: [0, -21], main: true },
  { id: 'h1', name: 'House 1', model: 'A', pos: [-11, -12] },
  { id: 'h2', name: 'House 2', model: 'C', pos: [-12, -1] },
  { id: 'h3', name: 'House 3', model: 'E', pos: [-12, 10] },
  { id: 'h4', name: 'House 4', model: 'B', pos: [11, -13] },
  { id: 'h5', name: 'House 5', model: 'D', pos: [13, -1] },
  { id: 'h6', name: 'House 6', model: 'F', pos: [12, 11] },
  { id: 'h7', name: 'House 7', model: 'G', pos: [0, 23] },
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

const fromHouse = (h: House): Collider => ({
  minX: h.pos[0] - HALF, maxX: h.pos[0] + HALF,
  minZ: h.pos[1] - HALF, maxZ: h.pos[1] + HALF,
});
const fromCircle = (x: number, z: number, r: number): Collider => ({
  minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r,
});

/** House footprints — used for both collision and camera occlusion. */
export const BUILDING_COLLIDERS: Collider[] = HOUSES.map(fromHouse);

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
