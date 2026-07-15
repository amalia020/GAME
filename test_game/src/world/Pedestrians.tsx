import { WanderNpc } from '../player/WanderNpc';
import { NPC_RIGS } from '../player/characterModel';

/** A few townsfolk strolling the plaza so the world feels alive. */
const PEDS: { rig: (typeof NPC_RIGS)[keyof typeof NPC_RIGS]; home: [number, number, number]; radius: number; speed: number }[] = [
  { rig: NPC_RIGS.rogue, home: [5, 0, 3], radius: 3.5, speed: 1.3 },
  { rig: NPC_RIGS.barbarian, home: [-5, 0, 5], radius: 3.5, speed: 1.15 },
  { rig: NPC_RIGS.rogueHooded, home: [6, 0, -5], radius: 3, speed: 1.4 },
  { rig: NPC_RIGS.knight, home: [-6, 0, -4], radius: 3, speed: 1.2 },
  { rig: NPC_RIGS.skeletonWarrior, home: [0, 0, 14], radius: 3.5, speed: 1.25 },
];

export function Pedestrians() {
  return (
    <>
      {PEDS.map((p, i) => (
        <WanderNpc key={i} rig={p.rig} home={p.home} radius={p.radius} speed={p.speed} />
      ))}
    </>
  );
}
