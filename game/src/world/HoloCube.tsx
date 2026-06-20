import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/** The glowing holographic AI core — the room's focal point and main color
 *  source. Slowly rotates + floats (the "aliveness" lever). */
export function HoloCube({
  position = [0, 2.6, -3.5] as [number, number, number],
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_s, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.5;
      ref.current.rotation.x += dt * 0.18;
    }
  });
  return (
    <Float speed={1.6} floatIntensity={0.7} rotationIntensity={0.2}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial
          color="#7fe0ff"
          emissive="#39b6ff"
          emissiveIntensity={1.5}
          flatShading
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>
      <pointLight position={position} color="#5fd9ff" intensity={5} distance={14} />
    </Float>
  );
}
