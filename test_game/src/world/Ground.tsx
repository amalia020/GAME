import { useMemo } from 'react';
import { makeToon, PALETTE } from '../render/toon';
import { InkCyl } from './Inked';

/**
 * The walkable ground: a big subdivided plane (so the curve shader can bend it
 * smoothly) in grass green, a grey road strip through it, and a few distant
 * curved hills filling the horizon. Ground/hills carry no ink outline — only
 * discrete props do — which sidesteps outline drift on the curved far field.
 */
export function Ground() {
  const grass = useMemo(() => makeToon({ color: PALETTE.grass }), []);
  const road = useMemo(() => makeToon({ color: PALETTE.road }), []);

  return (
    <group>
      {/* grass — high segment count for a smooth horizon bend */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={grass} receiveShadow>
        <planeGeometry args={[240, 240, 100, 100]} />
      </mesh>

      {/* road strip running into the distance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={road}>
        <planeGeometry args={[7, 240, 8, 100]} />
      </mesh>
      {/* a crossing road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, -8]} material={road}>
        <planeGeometry args={[60, 6, 60, 8]} />
      </mesh>

      {/* distant hills (curved, no outline) — horizon silhouettes in vine greens */}
      <InkCyl args={[0, 9, 16, 7]} color={PALETTE.green} position={[-34, 0, -40]} outline={false} />
      <InkCyl args={[0, 12, 22, 7]} color={PALETTE.vine} position={[30, 0, -52]} outline={false} />
      <InkCyl args={[0, 7, 13, 6]} color={PALETTE.green} position={[48, 0, -20]} outline={false} />
      <InkCyl args={[0, 8, 15, 7]} color={PALETTE.vine} position={[-48, 0, -18]} outline={false} />
    </group>
  );
}
