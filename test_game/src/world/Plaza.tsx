import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InkCyl, InkSphere } from './Inked';
import { PALETTE } from '../render/toon';

/** Animated fountain water: gently bobbing pools, a spinning + pulsing spout orb,
 *  and thin falling streams that "flow". Props have no baked animation, so the
 *  motion is procedural. */
function FountainWater() {
  const lowerPool = useRef<THREE.Group>(null);
  const upperPool = useRef<THREE.Group>(null);
  const orb = useRef<THREE.Group>(null);
  const streams = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (lowerPool.current) lowerPool.current.position.y = 0.66 + Math.sin(t * 2) * 0.03;
    if (upperPool.current) upperPool.current.position.y = 1.5 + Math.sin(t * 2 + 1) * 0.03;
    if (orb.current) {
      orb.current.rotation.y = t * 0.9;
      orb.current.position.y = 2.4 + Math.sin(t * 3) * 0.07;
      const s = 1 + Math.sin(t * 4) * 0.08;
      orb.current.scale.setScalar(s);
    }
    if (streams.current) {
      // scroll the falling streams downward + wobble to fake flow
      streams.current.children.forEach((c, i) => {
        c.position.y = 1.9 - (((t * 1.6 + i * 0.33) % 1) * 1.2);
        c.scale.y = 0.6 + 0.4 * Math.sin(t * 6 + i);
      });
    }
  });

  return (
    <>
      <group ref={lowerPool}>
        <InkCyl args={[1.7, 1.7, 0.12, 24]} color={PALETTE.accentBlue} glow={1.3} position={[0, 0, 0]} />
      </group>
      <group ref={upperPool}>
        <InkCyl args={[1.0, 1.0, 0.12, 20]} color={PALETTE.accentBlue} glow={1.2} position={[0, 0, 0]} />
      </group>
      {/* falling water streams around the spout */}
      <group ref={streams}>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.5, 1.6, Math.sin(a) * 0.5]}>
              <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
              <meshBasicMaterial color={PALETTE.glassCool} />
            </mesh>
          );
        })}
      </group>
      <group ref={orb}>
        <InkSphere args={[0.34, 12, 10]} color={PALETTE.glassCool} glow={1.8} position={[0, 0, 0]} />
      </group>
    </>
  );
}

/**
 * The central plaza landmark — an animated stylized fountain on a round paved
 * base. Gives the town a lively focal point (instead of a central house).
 */
export function Plaza({ position = [0, 0, -4] as [number, number, number] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* round paved plaza slab */}
      <InkCyl args={[6.4, 6.4, 0.12, 32]} color={PALETTE.road} position={[0, 0.04, 0]} outline={false} />
      <InkCyl args={[6.7, 6.7, 0.18, 32]} color={PALETTE.concrete} position={[0, 0.02, 0]} outline={false} />

      {/* fountain stone: basin + tiered pedestal */}
      <InkCyl args={[2.0, 2.2, 0.7, 24]} color={PALETTE.concrete} position={[0, 0.35, 0]} />
      <InkCyl args={[0.5, 0.7, 1.1, 16]} color={PALETTE.concrete} position={[0, 1.1, 0]} />
      <InkCyl args={[0.28, 0.42, 0.8, 14]} color={PALETTE.concrete} position={[0, 1.9, 0]} />

      <FountainWater />

      {/* planters ringing the fountain */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const x = Math.cos(a) * 3.4;
        const z = Math.sin(a) * 3.4;
        return (
          <group key={i} position={[x, 0, z]}>
            <InkCyl args={[0.6, 0.7, 0.5, 12]} color={PALETTE.woodDark} position={[0, 0.25, 0]} />
            <InkSphere args={[0.55, 8, 6]} color={i % 2 ? PALETTE.leaf : PALETTE.leafLight} position={[0, 0.7, 0]} />
            <InkSphere args={[0.2, 6, 5]} color={PALETTE.flower} position={[0.3, 0.85, 0.1]} />
          </group>
        );
      })}
    </group>
  );
}
