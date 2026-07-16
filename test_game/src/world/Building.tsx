import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GltfModel } from './GltfModel';
import { playerPos } from '../state/interaction';
import type { Box3 } from './townData';

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

const GHOST = 0.16; // how solid an in-the-way house stays

/** Does segment a→b pass through the box? Slab method, in 3D: a camera that has
 *  climbed above the roofline is NOT blocked, and shouldn't ghost the house. */
function segHitsBox(a: THREE.Vector3, b: THREE.Vector3, box: Box3): boolean {
  let tmin = 0;
  let tmax = 1;
  const lo = [box.minX, 0, box.minZ];
  const hi = [box.maxX, box.maxY, box.maxZ];
  const o = [a.x, a.y, a.z];
  const d = [b.x - a.x, b.y - a.y, b.z - a.z];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-6) {
      if (o[i] < lo[i] || o[i] > hi[i]) return false; // parallel and outside
      continue;
    }
    let t1 = (lo[i] - o[i]) / d[i];
    let t2 = (hi[i] - o[i]) / d[i];
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmax < tmin) return false;
  }
  return true;
}

/** A KayKit City-Builder building, toon-shaded to match the world. 2×2 base;
 *  scale ~3 turns it into a house. `yaw` rotates the door toward the plaza.
 *
 *  If `box` is given, the house fades to a ghost whenever it stands between the
 *  character and the camera, then fades back — so you are never hidden behind
 *  your own scenery and the camera never has to flinch. */
export function Building({
  model,
  position,
  yaw = 0,
  scale = 3.2,
  box,
}: {
  model: BuildingModel;
  position: [number, number, number];
  yaw?: number;
  scale?: number;
  box?: Box3;
}) {
  const ref = useRef<THREE.Group>(null);
  const opacity = useRef(1);
  const head = useRef(new THREE.Vector3());

  useFrame((state, dtRaw) => {
    const g = ref.current;
    if (!g || !box) return;
    const dt = Math.min(dtRaw, 1 / 30);

    head.current.set(playerPos.x, playerPos.y + 1.4, playerPos.z);
    const want = segHitsBox(head.current, state.camera.position, box) ? GHOST : 1;
    // fade out fast (don't spend a second staring at a wall), fade back in gently
    const k = want < opacity.current ? 14 : 5;
    const next = opacity.current + (want - opacity.current) * (1 - Math.exp(-k * dt));
    if (Math.abs(next - opacity.current) < 0.001) return;
    opacity.current = next;

    const solid = next > 0.985;
    g.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        m.opacity = next;
        // a ghost must not write depth, or it would still hide the character it
        // is being faded for. `transparent` is set once at mount — toggling it
        // recompiles the shader and hitches.
        m.depthWrite = solid;
      }
    });
  });

  return (
    <group
      ref={ref}
      onUpdate={(g: THREE.Group) => {
        // materials are cloned per building by <GltfModel>, so this is safe
        g.traverse((o: THREE.Object3D) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh || !mesh.material) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) m.transparent = true;
        });
      }}
    >
      <GltfModel url={URL[model]} position={position} rotation={[0, yaw, 0]} scale={scale} />
    </group>
  );
}
