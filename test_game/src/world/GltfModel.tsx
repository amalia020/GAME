import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { toonifyMaterial } from '../render/toon';

/**
 * Renders one named child of a GLB kit cluster (e.g. "NormalTree_2" from
 * trees.glb), toon-shaded + curved so it matches the inked, curved world. The
 * child's authored world rotation/scale are preserved but its position is
 * zeroed, so it lands at this component's `position`.
 */
export function GltfModel({
  url,
  name,
  curve = true,
  ...rest
}: { url: string; name?: string; curve?: boolean } & ThreeElements['group']) {
  const { scene } = useGLTF(url);

  const obj = useMemo(() => {
    const src = name ? scene.getObjectByName(name) : scene;
    if (!src) return new THREE.Group();
    src.updateWorldMatrix(true, false);
    const clone = src.clone(true);
    // keep world rotation+scale (parent transforms baked), drop position → origin
    const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3();
    src.matrixWorld.decompose(pos, quat, scl);
    clone.position.set(0, 0, 0);
    clone.quaternion.copy(quat);
    clone.scale.copy(scl);
    clone.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => toonifyMaterial(m, curve))
          : toonifyMaterial(mesh.material as THREE.Material, curve);
      }
    });
    return clone;
  }, [scene, name, curve]);

  return (
    <group {...rest}>
      <primitive object={obj} />
    </group>
  );
}
