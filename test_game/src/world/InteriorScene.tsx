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
 * A cozy walk-in interior: fully enclosed (4 walls + ceiling) so you're truly
 * INSIDE — a FIXED camera sits just inside the front wall and looks across the
 * room toward the furnished back wall (no dollhouse view, no black void, no
 * exterior). Warm wood floor, cream walls with skirting + rail, KayKit furniture.
 */
const R = 6; // room half-size (x/z)
const WALL_H = 3.6;
const WALL_T = 0.4;
const DOOR_HALF = 1.3;

/** fixed room camera: stand just inside the front wall, tilted down so the player
 *  and the exit mat in the foreground stay in view along with the furnished back. */
const CAM = { pos: [0, 3.4, 5.7] as [number, number, number], look: [0, 0.7, -1.8] as [number, number, number] };

const WALLS: Collider[] = [
  { minX: -R, maxX: R, minZ: -R - WALL_T, maxZ: -R },
  { minX: -R - WALL_T, maxX: -R, minZ: -R, maxZ: R },
  { minX: R, maxX: R + WALL_T, minZ: -R, maxZ: R },
  { minX: -R, maxX: -DOOR_HALF, minZ: R, maxZ: R + WALL_T },
  { minX: DOOR_HALF, maxX: R, minZ: R, maxZ: R + WALL_T },
];

const WALL = '#e7dcc4'; // warm cream wall
const FLOOR = '#c8a878'; // warm wood floor

/** A small, subtle in-style exit doormat: a woven mat + a soft glowing accent
 *  chevron pointing out (toward the door). Matches the house's toon look. */
function ExitMat({ z, accent }: { z: number; accent: string }) {
  return (
    <group position={[0, 0, z]}>
      {/* woven mat */}
      <InkBox args={[1.5, 0.06, 1.0]} color="#7a5c3d" position={[0, 0.03, 0]} />
      {/* two soft glowing chevrons pointing +Z (out toward the door / the viewer) */}
      {[-0.16, 0.12].map((cz, i) => (
        <group key={i} position={[0, 0.07, cz]}>
          <InkBox args={[0.42, 0.04, 0.11]} color={accent} glow={0.85} position={[-0.13, 0, 0]} rotation={[0, -Math.PI / 4, 0]} />
          <InkBox args={[0.42, 0.04, 0.11]} color={accent} glow={0.85} position={[0.13, 0, 0]} rotation={[0, Math.PI / 4, 0]} />
        </group>
      ))}
    </group>
  );
}

/** One wall with a skirting board at the base + a wood trim rail. */
function Wall({ args, position }: { args: [number, number, number]; position: [number, number, number] }) {
  const [w, h, d] = args;
  const horizontal = w > d;
  return (
    <group position={position}>
      <InkBox args={args} color={WALL} />
      {/* skirting board along the base (inner face) */}
      <InkBox args={horizontal ? [w, 0.3, d + 0.06] : [w + 0.06, 0.3, d]} color={PALETTE.woodDark} position={[0, -h / 2 + 0.15, 0]} />
      {/* trim rail ~2/3 up */}
      <InkBox args={horizontal ? [w, 0.1, d + 0.05] : [w + 0.05, 0.1, d]} color={PALETTE.wood} position={[0, h * 0.16, 0]} />
    </group>
  );
}

export function InteriorScene({ houseId }: { houseId?: string }) {
  const floorMat = useMemo(() => makeToon({ color: FLOOR }), []);
  const ceilMat = useMemo(() => makeToon({ color: '#d8ccb2' }), []);
  const content = houseContent(houseId);
  const accent = content.accent;
  const npc = content.npcRig;
  const NPC_POS: [number, number, number] = [2.4, 0, -3.2];

  return (
    <>
      {/* warm interior lights for coziness */}
      <pointLight position={[0, 3.2, -1]} intensity={0.7} color="#ffd9a0" distance={20} />
      <pointLight position={[0, 3.2, 3.5]} intensity={0.35} color="#ffd9a0" distance={14} />

      {/* wood floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={floorMat} receiveShadow>
        <planeGeometry args={[R * 2, R * 2]} />
      </mesh>

      {/* ceiling (faces down into the room) — encloses the space */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_H, 0]} material={ceilMat}>
        <planeGeometry args={[R * 2 + WALL_T, R * 2 + WALL_T]} />
      </mesh>

      {/* walls with skirting + rail */}
      <Wall args={[R * 2 + WALL_T, WALL_H, WALL_T]} position={[0, WALL_H / 2, -R]} />
      <Wall args={[WALL_T, WALL_H, R * 2]} position={[-R, WALL_H / 2, 0]} />
      <Wall args={[WALL_T, WALL_H, R * 2]} position={[R, WALL_H / 2, 0]} />
      <Wall args={[R - DOOR_HALF, WALL_H, WALL_T]} position={[-(R + DOOR_HALF) / 2, WALL_H / 2, R]} />
      <Wall args={[R - DOOR_HALF, WALL_H, WALL_T]} position={[(R + DOOR_HALF) / 2, WALL_H / 2, R]} />

      {/* framed door: wood posts + glowing lintel */}
      <InkBox args={[0.2, WALL_H, 0.5]} color={PALETTE.woodDark} position={[-DOOR_HALF, WALL_H / 2, R]} />
      <InkBox args={[0.2, WALL_H, 0.5]} color={PALETTE.woodDark} position={[DOOR_HALF, WALL_H / 2, R]} />
      <InkBox args={[DOOR_HALF * 2 + 0.4, 0.3, 0.5]} color={accent} glow={1.6} position={[0, WALL_H - 0.35, R]} />

      {/* a lit window on the left wall (warm glow) with a wood frame */}
      <group position={[-R + 0.06, 2.0, -1.2]}>
        <InkBox args={[0.14, 1.5, 2.0]} color={PALETTE.woodDark} />
        <InkBox args={[0.08, 1.2, 1.7]} color={PALETTE.glass} glow={1.5} />
      </group>

      {/* --- furnishings (KayKit Furniture Bits) --- */}
      <Furniture item="rug_rectangle_A" position={[0, 0.02, -1]} scale={1.1} />
      <Furniture item="couch_pillows" position={[0, 0, -R + 0.9]} yaw={0} />
      <Furniture item="armchair" position={[-3, 0, -1.2]} yaw={Math.PI / 2} />
      <Furniture item="table_low" position={[0, 0, -1.8]} />
      <Furniture item="book_set" position={[0, 0.42, -1.8]} scale={0.9} />
      <Furniture item="chair_A" position={[2.4, 0, -1.4]} yaw={-Math.PI / 2} />
      <Furniture item="cabinet_medium" position={[-R + 0.7, 0, -4.2]} yaw={Math.PI / 2} />
      <Furniture item="lamp_table" position={[-R + 0.8, 1.0, -4.2]} scale={0.9} />
      <Furniture item="lamp_standing" position={[R - 0.9, 0, -R + 0.9]} />
      <Furniture item="shelf_A_big" position={[R - 0.35, 1.6, -2.5]} yaw={-Math.PI / 2} />
      <Furniture item="pictureframe_large_A" position={[0, 2.2, -R + 0.26]} />

      {/* subtle in-style exit doormat in the foreground */}
      <ExitMat z={1.6} accent={accent} />

      {/* the resident NPC — gently pacing near the couch */}
      <WanderNpc rig={npc} home={NPC_POS} radius={1.4} speed={0.9} />

      {/* fixed camera inside the room → you're truly inside, no dollhouse/black */}
      <Player colliders={WALLS} bound={R - 0.6} fixedCam={CAM} spawn={[0, 0, -0.3]} />

      {/* triggers: talk to the NPC, and leave via the exit mat (in view) */}
      <InteractionManager
        points={[
          { id: 'talk', label: `Talk to ${content.npcName}  ·  press E`, x: NPC_POS[0], z: NPC_POS[2], radius: 3.4, onActivate: () => startTalk(content.id) },
          { id: 'exit', label: 'Leave  ·  press E', x: 0, z: 1.4, radius: 1.5, onActivate: () => exitToTown(houseId) },
        ]}
      />
    </>
  );
}
