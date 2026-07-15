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
  /** node names matching this are hidden (e.g. equipped weapons we don't want). */
  hideNodes?: RegExp;
}

/** Placeholder rig — a CC0/MIT animated robot, stands in until MORPHO art lands. */
export const ROBOT_RIG: CharacterRig = {
  url: '/models/RobotExpressive.glb',
  scale: 0.32,
  yaw: Math.PI,
  clips: { idle: 'Idle', walk: 'Walking', run: 'Running', jump: 'Jump' },
};

/**
 * KayKit "Mage" — CC0 stylized adventurer (hat + cape, gradient-atlas texture
 * that cel-shades beautifully). 76 baked clips; we use idle/walk/run/jump. The
 * equipped staff/wand/spellbook are hidden so it reads as a gentle wanderer, not
 * a combatant. Placeholder until MORPHO's own 3D art lands — swap `url` + clips.
 */
export const MAGE_RIG: CharacterRig = {
  url: '/models/kits/characters/Mage.glb',
  scale: 0.5,
  yaw: Math.PI, // KayKit forward is +Z; flip so it faces its travel direction (−Z)
  clips: { idle: 'Idle', walk: 'Walking_A', run: 'Running_A', jump: 'Jump_Idle' },
  hideNodes: /wand|staff|spellbook|sword|shield|axe|dagger|crossbow|quiver|arrow|knife|mug|smoke/i,
};

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
  const model = useMemo(() => {
    const cloned = cloneSkeleton(scene);
    cloned.traverse((o: THREE.Object3D) => {
      // hide equipped props (weapons/held items) so the character walks empty-handed
      if (rig.hideNodes && o.name && rig.hideNodes.test(o.name)) {
        o.visible = false;
        return;
      }
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => toonifyMaterial(m))
          : toonifyMaterial(mesh.material as THREE.Material);
      }
    });
    return cloned;
  }, [scene, rig]);

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
