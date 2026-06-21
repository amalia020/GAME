import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InkBox } from '../world/Inked';
import { PALETTE } from '../render/toon';
import type { Motion } from './useThirdPersonController';

/**
 * A chunky kid with a backpack, facing -Z (away from the follow-cam so we read
 * their back, like abeto). Limbs hang from hip/shoulder pivot groups so a
 * procedural walk cycle can swing them — this is what kills the "gliding".
 */
export function Character({ motion }: { motion: RefObject<Motion> }) {
  const { yellow, skin, hair, bag } = PALETTE;
  const shorts = '#7e7a4e';
  const shoes = '#2a2a30';

  const bob = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const amt = useRef(0); // smoothed walk amount

  useFrame((state, dt) => {
    const m = motion.current;
    if (!m || !bob.current) return;
    // ease the walk amount in/out so starts & stops aren't instant
    const target = Math.min(m.amount, 1);
    amt.current += (target - amt.current) * (1 - Math.exp(-12 * dt));
    const w = amt.current;
    const t = m.phase;

    const legSwing = Math.sin(t) * 0.8 * w;
    const armSwing = Math.sin(t) * 0.55 * w;
    if (legL.current) legL.current.rotation.x = legSwing;
    if (legR.current) legR.current.rotation.x = -legSwing;
    if (armL.current) armL.current.rotation.x = -armSwing;
    if (armR.current) armR.current.rotation.x = armSwing;

    // double-bounce body bob while walking + gentle idle breathing when still
    const walkBob = Math.abs(Math.sin(t)) * 0.08 * w;
    const idle = Math.sin(state.clock.elapsedTime * 2.2) * 0.015 * (1 - w);
    bob.current.position.y = walkBob + idle;
    bob.current.rotation.x = w * 0.07; // slight forward lean into the walk
  });

  return (
    <group ref={bob}>
      {/* head — oversized for a cute, abeto-ish proportion */}
      <InkBox args={[0.56, 0.5, 0.5]} color={skin} position={[0, 1.92, 0]} />
      <InkBox args={[0.62, 0.3, 0.58]} color={hair} position={[0, 2.16, 0.02]} />
      <InkBox args={[0.62, 0.34, 0.18]} color={hair} position={[0, 1.96, 0.2]} />

      {/* torso + backpack */}
      <InkBox args={[0.64, 0.6, 0.36]} color={yellow} position={[0, 1.34, 0]} />
      <InkBox args={[0.52, 0.52, 0.22]} color={bag} position={[0, 1.32, 0.26]} />
      {/* shorts */}
      <InkBox args={[0.6, 0.32, 0.36]} color={shorts} position={[0, 0.92, 0]} />

      {/* arms — pivot at the shoulder */}
      <group ref={armL} position={[-0.42, 1.56, 0]}>
        <InkBox args={[0.18, 0.46, 0.2]} color={yellow} position={[0, -0.2, 0]} />
        <InkBox args={[0.17, 0.18, 0.19]} color={skin} position={[0, -0.46, 0]} />
      </group>
      <group ref={armR} position={[0.42, 1.56, 0]}>
        <InkBox args={[0.18, 0.46, 0.2]} color={yellow} position={[0, -0.2, 0]} />
        <InkBox args={[0.17, 0.18, 0.19]} color={skin} position={[0, -0.46, 0]} />
      </group>

      {/* legs — pivot at the hip; mesh hangs down so the foot reaches the floor */}
      <group ref={legL} position={[-0.16, 0.78, 0]}>
        <InkBox args={[0.24, 0.6, 0.26]} color={skin} position={[0, -0.32, 0]} />
        <InkBox args={[0.27, 0.18, 0.42]} color={shoes} position={[0, -0.66, 0.06]} />
      </group>
      <group ref={legR} position={[0.16, 0.78, 0]}>
        <InkBox args={[0.24, 0.6, 0.26]} color={skin} position={[0, -0.32, 0]} />
        <InkBox args={[0.27, 0.18, 0.42]} color={shoes} position={[0, -0.66, 0.06]} />
      </group>
    </group>
  );
}
