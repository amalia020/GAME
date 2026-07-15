import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Gentle procedural wind: tilts its children back and forth around their base so
 * trees/bushes breathe. Props have no baked animation, so this fakes wind cheaply.
 * Pivot is this group's origin — place it at the plant's base.
 */
export function Sway({
  children,
  amount = 0.05,
  speed = 0.8,
  phase = 0,
}: {
  children: ReactNode;
  amount?: number;
  speed?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    const g = ref.current;
    if (g) {
      g.rotation.z = Math.sin(t) * amount;
      g.rotation.x = Math.cos(t * 0.73) * amount * 0.6;
    }
  });
  return <group ref={ref}>{children}</group>;
}
