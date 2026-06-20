import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterBillboard } from './Billboard';
import { useArrowKeys } from './useArrowKeys';
import { stepPosition } from './movement';
import { nearestInteractable } from './proximity';
import { INTERACTABLES, type Interactable } from './interactables';
import type { Bounds, Vec2 } from './coords';
import { INTERNS } from '../render/assets';
import { useGame } from '../state/store';

const START: Vec2 = { x: 0, z: 3 };

export function Player({
  internIndex,
  bounds,
  onNearChange,
}: {
  internIndex: number;
  bounds: Bounds;
  onNearChange: (it: Interactable | null) => void;
}) {
  const keys = useArrowKeys();
  const groupRef = useRef<THREE.Group>(null);
  const pos = useRef<Vec2>({ ...START });
  const near = useRef<Interactable | null>(null);
  const { camera } = useThree();

  // Interact on Enter — event-driven so a fast tap is never missed between frames.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (useGame.getState().phase !== 'room') return;
      const hit = near.current;
      if (hit) useGame.getState().openLevel(hit.levelId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useFrame((_state, dt) => {
    const frozen = useGame.getState().phase !== 'room';

    if (!frozen) {
      pos.current = stepPosition(pos.current, keys.current, Math.min(dt, 0.05), bounds);
    }
    const g = groupRef.current;
    if (g) g.position.set(pos.current.x, 0, pos.current.z);

    // camera gently follows the player (fixed offset)
    const targetCam = new THREE.Vector3(pos.current.x, 6, pos.current.z + 7);
    camera.position.lerp(targetCam, 0.08);
    camera.lookAt(pos.current.x, 1, pos.current.z);

    // proximity → prompt
    const hit = nearestInteractable(pos.current, INTERACTABLES);
    if (hit?.id !== near.current?.id) {
      near.current = hit;
      onNearChange(hit);
    }
  });

  return (
    <group ref={groupRef}>
      <CharacterBillboard url={INTERNS[internIndex]} position={[0, 1, 0]} height={2} />
      {/* contact shadow so the billboard sits in the room, not on top of it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
