import { GltfModel } from './GltfModel';

export type BuildingModel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

/** native model heights (Blender units) — used to float the name sign above the roof. */
export const BUILDING_NATIVE_H: Record<BuildingModel, number> = {
  A: 1.65, B: 1.65, C: 2.98, D: 2.97, E: 2.35, F: 2.35, G: 2.98, H: 3.05,
};

const URL: Record<BuildingModel, string> = {
  A: '/models/kits/buildings/building_A.gltf',
  B: '/models/kits/buildings/building_B.gltf',
  C: '/models/kits/buildings/building_C.gltf',
  D: '/models/kits/buildings/building_D.gltf',
  E: '/models/kits/buildings/building_E.gltf',
  F: '/models/kits/buildings/building_F.gltf',
  G: '/models/kits/buildings/building_G.gltf',
  H: '/models/kits/buildings/building_H.gltf',
};

/** A KayKit City-Builder building, toon-shaded to match the world. 2×2 base;
 *  scale ~3 turns it into a house. `yaw` rotates the door toward the plaza. */
export function Building({
  model,
  position,
  yaw = 0,
  scale = 3.2,
}: {
  model: BuildingModel;
  position: [number, number, number];
  yaw?: number;
  scale?: number;
}) {
  return <GltfModel url={URL[model]} position={position} rotation={[0, yaw, 0]} scale={scale} />;
}
