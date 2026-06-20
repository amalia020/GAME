import { useState } from 'react';
import { Html } from '@react-three/drei';
import { LabRoom } from './LabRoom';
import { HoloCube } from './HoloCube';
import { Player } from './Player';
import { CharacterBillboard } from './Billboard';
import { INTERACTABLES, type Interactable } from './interactables';
import type { Bounds } from './coords';
import { CHARACTERS } from '../render/assets';

const BOUNDS: Bounds = { minX: -7, maxX: 7, minZ: -5, maxZ: 7 };
const MORPHO = INTERACTABLES[0];

export function WorldScene({ internIndex }: { internIndex: number }) {
  const [near, setNear] = useState<Interactable | null>(null);

  return (
    <>
      {/* atmosphere: coloured background + fog so edges melt into the world */}
      <color attach="background" args={['#1b2a52']} />
      <fog attach="fog" args={['#1b2a52', 16, 40]} />

      {/* lighting: lifted ambient so nothing is a black hole, warm key, neon accents */}
      <ambientLight intensity={0.55} color="#5566aa" />
      <hemisphereLight args={['#cdddff', '#2a2036', 1.0]} />
      <directionalLight position={[6, 10, 4]} intensity={1.25} color="#ffe0b0" />
      <pointLight position={[-4, 3, 2]} intensity={0.7} color="#5fd9ff" />
      <pointLight position={[5, 3, 1]} intensity={0.45} color="#ff7eb6" />

      <LabRoom />
      <HoloCube />

      {/* MORPHO billboard at the interactable spot */}
      <CharacterBillboard
        url={CHARACTERS.morpho}
        position={[MORPHO.pos.x, 1, MORPHO.pos.z]}
        height={1.6}
      />

      <Player internIndex={internIndex} bounds={BOUNDS} onNearChange={setNear} />

      {near && (
        <Html center position={[near.pos.x, 2.4, near.pos.z]} distanceFactor={10}>
          <div className="world-prompt">{near.label}</div>
        </Html>
      )}
    </>
  );
}
