import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MAGE_RIG, buildCharacterModel, type CharacterRig } from './characterModel';
import type { Motion } from './useThirdPersonController';

export type { CharacterRig } from './characterModel';
export { MAGE_RIG } from './characterModel';

export function ModelCharacter({
  motion,
  rig = MAGE_RIG,
}: {
  motion: RefObject<Motion>;
  rig?: CharacterRig;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(rig.url);

  // clone (skeleton-aware) so we own the instance, and toonify its materials
  const model = useMemo(() => buildCharacterModel(scene, rig), [scene, rig]);

  const { actions } = useAnimations(animations, group);
  const currentClip = useRef('');

  // start in idle
  useEffect(() => {
    const idle = actions[rig.clips.idle];
    idle?.reset().play();
    currentClip.current = rig.clips.idle;
    return () => { idle?.stop(); };
  }, [actions, rig]);

  useFrame(() => {
    const a = motion.current?.amount ?? 0;
    const airborne = motion.current?.airborne ?? false;
    const want = airborne && rig.clips.jump
      ? rig.clips.jump
      : a < 0.1 ? rig.clips.idle : a < 0.7 ? rig.clips.walk : rig.clips.run;
    const next = actions[want];
    // self-healing: switch on change OR restart if the wanted clip isn't actually
    // running (recovers from HMR / mixer resets that would otherwise leave it gliding)
    if (next && (want !== currentClip.current || !next.isRunning())) {
      const prev = currentClip.current ? actions[currentClip.current] : null;
      next.reset().fadeIn(0.18).play();
      if (prev && prev !== next) prev.fadeOut(0.18);
      currentClip.current = want;
    }
    // nudge the locomotion clip's playback so feet match ground speed
    const moving = actions[currentClip.current];
    if (moving && currentClip.current !== rig.clips.idle) {
      moving.timeScale = THREE.MathUtils.clamp(0.7 + a * 0.8, 0.7, 1.6);
    }
  });

  return (
    <group ref={group}>
      <primitive object={model} scale={rig.scale} rotation={[0, rig.yaw ?? 0, 0]} />
    </group>
  );
}

useGLTF.preload(MAGE_RIG.url);
