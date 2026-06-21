import { useRef } from 'react';
import * as THREE from 'three';
import { ModelCharacter } from './ModelCharacter';
import { useThirdPersonController } from './useThirdPersonController';

/** The character + its controller (movement + follow camera). */
export function Player() {
  const group = useRef<THREE.Group>(null);
  const motion = useThirdPersonController(group);
  return (
    <group ref={group} position={[0, 0, 0]}>
      <ModelCharacter motion={motion} />
    </group>
  );
}
