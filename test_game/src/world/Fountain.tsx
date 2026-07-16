import { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { toonifyMaterial, makeToon, PALETTE } from '../render/toon';

const FOUNTAIN_URL = '/models/kits/props/fountain_zsky.glb';

/** Animated water pool sitting in the fountain's basin: a translucent blue disc
 *  that gently shimmers + bobs (real-water feel, not a neon blob). */
function WaterPool({ y, r }: { y: number; r: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => {
    const m = makeToon({ color: PALETTE.glassCool });
    m.transparent = true;
    m.opacity = 0.85;
    m.emissive = new THREE.Color(PALETTE.accentBlue);
    m.emissiveIntensity = 0.35;
    return m;
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    (mat as THREE.MeshToonMaterial).emissiveIntensity = 0.3 + Math.sin(t * 2.5) * 0.18;
    if (ref.current) ref.current.position.y = y + Math.sin(t * 2) * 0.015;
  });
  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat}>
      <circleGeometry args={[r, 32]} />
    </mesh>
  );
}

/**
 * The plaza fountain — a classic tiered garden fountain (CC-BY, Zsky) toon-shaded
 * to match the world, with an animated water pool in the basin.
 */
export function Fountain({
  position = [0, 0, 0] as [number, number, number],
  scale = 1.35,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(FOUNTAIN_URL);

  const model = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => toonifyMaterial(m, true))
          : toonifyMaterial(mesh.material as THREE.Material, true);
      }
    });
    return cloned;
  }, [scene]);

  return (
    <group position={position}>
      <group scale={scale}>
        <primitive object={model} />
      </group>
      {/* water pool in the base basin (world-space, tuned to the model) */}
      <WaterPool y={0.5} r={1.15} />
    </group>
  );
}

useGLTF.preload(FOUNTAIN_URL);
