import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { ModelCharacter } from './ModelCharacter';
import { useThirdPersonController } from './useThirdPersonController';
import type { Collider } from '../world/townData';

/** The character + its controller (movement + follow camera), per-scene configurable. */
export function Player({
  colliders,
  occluders,
  bound,
  camFull,
  spawn = [0, 0, 0],
  faceYaw = 0,
}: {
  colliders?: Collider[];
  occluders?: Collider[];
  bound?: number;
  camFull?: number;
  spawn?: [number, number, number];
  /** initial facing (radians) so the player looks into the scene on spawn. */
  faceYaw?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const motion = useThirdPersonController(group, { colliders, occluders, bound, camFull });

  // place the player at the scene's spawn point on mount / scene change
  useLayoutEffect(() => {
    const g = group.current;
    if (g) {
      g.position.set(spawn[0], spawn[1], spawn[2]);
      g.rotation.y = faceYaw;
    }
    // spawn/faceYaw are primitive tuples; re-run when their values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spawn[0], spawn[1], spawn[2], faceYaw]);

  return (
    <group ref={group} position={spawn}>
      <ModelCharacter motion={motion} />
    </group>
  );
}
