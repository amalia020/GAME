import { useState } from 'react';
import { Html } from '@react-three/drei';
import { LabRoom } from './LabRoom';
import { Player } from './Player';
import { CharacterBillboard } from './Billboard';
import { INTERACTABLES, type Interactable } from './interactables';
import type { Bounds } from './coords';
import { CHARACTERS } from '../render/assets';

const BOUNDS: Bounds = { minX: -7, maxX: 7, minZ: -7, maxZ: 7 };
const MORPHO = INTERACTABLES[0];

export function WorldScene({ internIndex }: { internIndex: number }) {
  const [near, setNear] = useState<Interactable | null>(null);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.1} />
      <LabRoom />

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
