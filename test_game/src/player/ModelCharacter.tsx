import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { toonifyMaterial } from '../render/toon';
import type { Motion } from './useThirdPersonController';

/**
 * Describes how to mount + animate a rigged character GLB. Swap your own MORPHO
 * model in later by adding a rig here (url + scale + clip names) — nothing else
 * in the game needs to change.
 */
export interface CharacterRig {
  url: string;
  scale: number;
  /** extra yaw if the model's "forward" isn't -Z (we read the character's back). */
  yaw?: number;
  clips: { idle: string; walk: string; run: string; jump?: string };
}

/** Placeholder rig — a CC0/MIT animated robot, stands in until MORPHO art lands. */
export const ROBOT_RIG: CharacterRig = {
  url: '/models/RobotExpressive.glb',
  scale: 0.32,
  yaw: Math.PI,
  clips: { idle: 'Idle', walk: 'Walking', run: 'Running', jump: 'Jump' },
};

export function ModelCharacter({
  motion,
  rig = ROBOT_RIG,
}: {
  motion: RefObject<Motion>;
  rig?: CharacterRig;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(rig.url);

  // clone (skeleton-aware) so we own the instance, and toonify its materials
  const model = useMemo(() => {
    const cloned = cloneSkeleton(scene);
    cloned.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(toonifyMaterial)
          : toonifyMaterial(mesh.material as THREE.Material);
      }
    });
    return cloned;
  }, [scene]);

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
    if (want !== currentClip.current) {
      const prev = actions[currentClip.current];
      const next = actions[want];
      if (next) {
        next.reset().fadeIn(0.18).play();
        prev?.fadeOut(0.18);
        currentClip.current = want;
      }
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

useGLTF.preload(ROBOT_RIG.url);
