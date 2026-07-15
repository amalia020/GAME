import { useEffect, useMemo, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { buildCharacterModel, type CharacterRig } from './characterModel';

/**
 * A stationary NPC: same look/build as the player (toonified, weapons hidden) but
 * no controller — it just plays its idle clip. Used to populate house interiors.
 */
export function Npc({
  rig,
  position = [0, 0, 0],
  yaw = 0,
}: {
  rig: CharacterRig;
  position?: [number, number, number];
  yaw?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(rig.url);
  const model = useMemo(() => buildCharacterModel(scene, rig), [scene, rig]);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const idle = actions[rig.clips.idle];
    idle?.reset().fadeIn(0.3).play();
    return () => { idle?.fadeOut(0.2); };
  }, [actions, rig]);

  return (
    <group ref={group} position={position} rotation={[0, yaw, 0]}>
      <primitive object={model} scale={rig.scale} rotation={[0, rig.yaw ?? 0, 0]} />
    </group>
  );
}
