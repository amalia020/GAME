import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { toonifyMaterial } from '../render/toon';

export interface Placement {
  x: number;
  z: number;
  /** uniform scale */
  s: number;
  /** yaw, radians */
  r: number;
}

/**
 * A deep backdrop forest built from REAL kit tree models (not stand-in shapes),
 * drawn with InstancedMesh.
 *
 * Why instanced: a backdrop only reads as forest if there are hundreds of trees,
 * and the per-tree <GltfModel> path clones the scene AND builds fresh materials
 * for every copy — hundreds of draw calls plus hundreds of shadow casters. One
 * InstancedMesh per (variant × mesh) collapses that to ~10 draw calls with one
 * shared material each, so we can afford a genuinely dense treeline.
 */

/**
 * Flatten one kit child (e.g. "PineTree_3") into origin-space [geometry, material]
 * pairs, baking every transform down into the geometry so the pairs can be
 * instanced directly.
 */
function bakeChild(scene: THREE.Object3D, name: string): [THREE.BufferGeometry, THREE.Material][] {
  const src = scene.getObjectByName(name);
  if (!src) return [];
  src.updateWorldMatrix(true, false);

  // same normalization as <GltfModel>: keep the authored world rotation/scale,
  // drop the position so the model sits on its own origin
  const clone = src.clone(true);
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  src.matrixWorld.decompose(pos, quat, scl);
  clone.position.set(0, 0, 0);
  clone.quaternion.copy(quat);
  clone.scale.copy(scl);
  clone.updateMatrixWorld(true);

  const parts: [THREE.BufferGeometry, THREE.Material][] = [];
  clone.traverse((o: THREE.Object3D) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld); // bake the sub-mesh transform in
    const src0 = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    parts.push([geo, toonifyMaterial(src0, true)]); // curved: it lives in the far field
  });
  return parts;
}

export function ForestBackdrop({
  url,
  names,
  placements,
}: {
  url: string;
  names: string[];
  placements: Placement[];
}) {
  const { scene } = useGLTF(url);

  const meshes = useMemo(() => {
    const out: THREE.InstancedMesh[] = [];
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const s = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    names.forEach((name, vi) => {
      // deal the placements out across the variants so the mix stays even
      const items = placements.filter((_, i) => i % names.length === vi);
      if (!items.length) return;

      for (const [geo, mat] of bakeChild(scene, name)) {
        const im = new THREE.InstancedMesh(geo, mat, items.length);
        items.forEach((p, i) => {
          q.setFromAxisAngle(up, p.r);
          v.set(p.x, 0, p.z);
          s.setScalar(p.s);
          im.setMatrixAt(i, m4.compose(v, q, s));
        });
        im.instanceMatrix.needsUpdate = true;
        // backdrop: nothing walks behind it, so skip the shadow-map cost entirely
        im.castShadow = false;
        im.receiveShadow = false;
        im.frustumCulled = false; // one mesh rings the whole map
        out.push(im);
      }
    });
    return out;
  }, [scene, names, placements]);

  return (
    <>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
}
