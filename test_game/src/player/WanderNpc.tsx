import { useEffect, useMemo, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildCharacterModel, type CharacterRig } from './characterModel';

function lerpAngle(a: number, b: number, t: number): number {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/**
 * An NPC that gently wanders around a home point: strolls to a random nearby
 * spot, pauses (idle), then picks another — crossfading walk/idle. Used for town
 * pedestrians and the (now moving) interior residents.
 */
export function WanderNpc({
  rig,
  home,
  radius = 3,
  speed = 1.3,
}: {
  rig: CharacterRig;
  home: [number, number, number];
  radius?: number;
  speed?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(rig.url);
  const model = useMemo(() => buildCharacterModel(scene, rig), [scene, rig]);
  const { actions } = useAnimations(animations, group);

  const target = useRef(new THREE.Vector3(home[0], 0, home[2]));
  const pause = useRef(1 + Math.random() * 2);
  const clip = useRef('');

  const play = (name: string) => {
    if (name === clip.current) return;
    const next = actions[name];
    if (!next) return;
    actions[clip.current]?.fadeOut(0.2);
    next.reset().fadeIn(0.2).play();
    clip.current = name;
  };

  useEffect(() => {
    actions[rig.clips.idle]?.reset().play();
    clip.current = rig.clips.idle;
  }, [actions, rig]);

  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 1 / 30);

    if (pause.current > 0) {
      pause.current -= dt;
      play(rig.clips.idle);
      return;
    }

    const dx = target.current.x - g.position.x;
    const dz = target.current.z - g.position.z;
    const d = Math.hypot(dx, dz);

    if (d < 0.25) {
      // arrived → rest, then choose a new nearby target
      pause.current = 1.2 + Math.random() * 2.5;
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      target.current.set(home[0] + Math.cos(a) * r, 0, home[2] + Math.sin(a) * r);
      play(rig.clips.idle);
      return;
    }

    const vx = (dx / d) * speed;
    const vz = (dz / d) * speed;
    g.position.x += vx * dt;
    g.position.z += vz * dt;
    g.rotation.y = lerpAngle(g.rotation.y, Math.atan2(-vx, -vz), 1 - Math.exp(-10 * dt));
    play(rig.clips.walk);
  });

  return (
    <group ref={group} position={home}>
      <primitive object={model} scale={rig.scale} rotation={[0, rig.yaw ?? 0, 0]} />
    </group>
  );
}
