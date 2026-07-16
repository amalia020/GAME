import { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { toonifyMaterial, PALETTE } from '../render/toon';

/**
 * A real kit fountain (Isa Lousberg "Tiny Treats", CC0) — toon-shaded to match
 * the world, with the water mesh given a glowing cyan material that gently pulses
 * so it reads as running/shimmering water.
 */
export function Fountain({
  position = [0, 0, 0] as [number, number, number],
  scale = 1.6,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF('/models/kits/props/fountain.glb');
  const water = useRef<THREE.Mesh | null>(null);
  const waterBaseY = useRef(0);

  const model = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const isWater = /water/i.test(o.name);
        mesh.castShadow = !isWater;
        mesh.receiveShadow = true;
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => toonifyMaterial(m, true))
          : toonifyMaterial(mesh.material as THREE.Material, true);
        if (isWater) {
          const wm = mesh.material as THREE.MeshToonMaterial;
          wm.color = new THREE.Color(PALETTE.glassCool);
          wm.emissive = new THREE.Color(PALETTE.accentBlue);
          wm.emissiveIntensity = 1.3; // HDR → catches the bloom
          water.current = mesh;
          waterBaseY.current = mesh.position.y;
        }
      }
    });
    return cloned;
  }, [scene]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const w = water.current;
    if (w) {
      // gentle shimmer: pulse the emissive + a tiny vertical bob
      const m = w.material as THREE.MeshToonMaterial;
      m.emissiveIntensity = 1.15 + Math.sin(t * 4) * 0.35;
      w.position.y = waterBaseY.current + Math.sin(t * 3) * 0.004;
    }
  });

  return (
    <group position={position} scale={scale}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload('/models/kits/props/fountain.glb');
