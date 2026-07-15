import { useMemo } from 'react';
import { makeToon, PALETTE } from '../render/toon';
import { InkBox } from './Inked';
import { Player } from '../player/Player';
import type { Collider } from './townData';

/**
 * A simple walk-in interior room (stub for M2 — furniture + NPC come in M4). A
 * floor, four walls with a door gap on the +Z (front) side, the player spawning
 * just inside the door. Small bounds + a closer follow camera than the town.
 */
const R = 6; // room half-size (x/z)
const WALL_H = 3.6;
const WALL_T = 0.4;
const DOOR_HALF = 1.3; // half-width of the door gap on the front wall

// AABB colliders for the four walls (front wall split around the door gap)
const WALLS: Collider[] = [
  { minX: -R, maxX: R, minZ: -R - WALL_T, maxZ: -R }, // back (-Z)
  { minX: -R - WALL_T, maxX: -R, minZ: -R, maxZ: R }, // left (-X)
  { minX: R, maxX: R + WALL_T, minZ: -R, maxZ: R }, // right (+X)
  { minX: -R, maxX: -DOOR_HALF, minZ: R, maxZ: R + WALL_T }, // front-left
  { minX: DOOR_HALF, maxX: R, minZ: R, maxZ: R + WALL_T }, // front-right
];

export function InteriorScene({ accent = PALETTE.accentAmber }: { houseId?: string; accent?: string }) {
  const floorMat = useMemo(() => makeToon({ color: PALETTE.cream }), []);

  return (
    <>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={floorMat} receiveShadow>
        <planeGeometry args={[R * 2, R * 2]} />
      </mesh>

      {/* walls */}
      <InkBox args={[R * 2 + WALL_T, WALL_H, WALL_T]} color={PALETTE.concrete} position={[0, WALL_H / 2, -R]} />
      <InkBox args={[WALL_T, WALL_H, R * 2]} color={PALETTE.concrete} position={[-R, WALL_H / 2, 0]} />
      <InkBox args={[WALL_T, WALL_H, R * 2]} color={PALETTE.concrete} position={[R, WALL_H / 2, 0]} />
      {/* front wall halves (door gap in the middle) */}
      <InkBox args={[R - DOOR_HALF, WALL_H, WALL_T]} color={PALETTE.concrete} position={[-(R + DOOR_HALF) / 2, WALL_H / 2, R]} />
      <InkBox args={[R - DOOR_HALF, WALL_H, WALL_T]} color={PALETTE.concrete} position={[(R + DOOR_HALF) / 2, WALL_H / 2, R]} />
      {/* glowing lintel over the door so it reads as an exit */}
      <InkBox args={[DOOR_HALF * 2, 0.25, WALL_T]} color={accent} glow={1.6} position={[0, WALL_H - 0.3, R]} />

      <Player colliders={WALLS} occluders={WALLS} bound={R - 0.6} camFull={6} spawn={[0, 0, R - 1.5]} />
    </>
  );
}
