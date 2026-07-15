import { useMemo } from 'react';
import { makeToon, PALETTE } from '../render/toon';
import { InkBox } from './Inked';
import { Player } from '../player/Player';
import { WanderNpc } from '../player/WanderNpc';
import { Furniture } from './Furniture';
import { InteractionManager } from './InteractionManager';
import { exitToTown } from '../state/location';
import { startTalk } from '../state/dialog';
import { houseContent } from '../content/houses';
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

export function InteriorScene({ houseId }: { houseId?: string }) {
  const floorMat = useMemo(() => makeToon({ color: PALETTE.cream }), []);
  const content = houseContent(houseId);
  const accent = content.accent;
  const npc = content.npcRig;
  const NPC_POS: [number, number, number] = [1.6, 0, -3.4];

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

      {/* --- furnishings (KayKit Furniture Bits) --- */}
      <Furniture item="rug_rectangle_A" position={[0, 0.02, -1]} />
      <Furniture item="couch" position={[0, 0, -R + 0.9]} yaw={0} />
      <Furniture item="table_low" position={[0, 0, -1.6]} />
      <Furniture item="chair_A" position={[-2.2, 0, -1.4]} yaw={Math.PI / 2} />
      <Furniture item="chair_A" position={[2.2, 0, -1.4]} yaw={-Math.PI / 2} />
      <Furniture item="cabinet_medium" position={[-R + 0.7, 0, -3.4]} yaw={Math.PI / 2} />
      <Furniture item="lamp_standing" position={[-R + 0.8, 0, -R + 0.8]} />
      <Furniture item="shelf_A_big" position={[R - 0.35, 1.5, -2.5]} yaw={-Math.PI / 2} />
      <Furniture item="pictureframe_large_A" position={[0, 2.1, -R + 0.25]} />

      {/* the resident NPC — gently pacing near the couch */}
      <WanderNpc rig={npc} home={NPC_POS} radius={1.5} speed={0.9} />

      <Player colliders={WALLS} occluders={WALLS} bound={R - 0.6} camFull={6} spawn={[0, 0, R - 1.5]} />

      {/* triggers: talk to the NPC, and leave by the door */}
      <InteractionManager
        points={[
          { id: 'talk', label: `Talk to ${content.npcName}  ·  press E`, x: NPC_POS[0], z: NPC_POS[2], radius: 3.4, onActivate: () => startTalk(content.id) },
          { id: 'exit', label: 'Leave  ·  press E', x: 0, z: R - 0.4, radius: 1.8, onActivate: () => exitToTown(houseId) },
        ]}
      />
    </>
  );
}
