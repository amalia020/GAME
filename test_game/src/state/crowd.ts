/**
 * Live positions of walking NPCs, so the player can't walk through them. Each
 * WanderNpc registers a slot and updates it every frame; the controller ejects
 * the player out of these circles. Module singleton (crosses the Canvas boundary).
 */
export interface CrowdMember {
  x: number;
  z: number;
  r: number;
}

const members: CrowdMember[] = [];

export function addCrowdMember(r: number): CrowdMember {
  const m: CrowdMember = { x: 1e6, z: 1e6, r };
  members.push(m);
  return m;
}

export function removeCrowdMember(m: CrowdMember) {
  const i = members.indexOf(m);
  if (i >= 0) members.splice(i, 1);
}

export function crowdMembers(): CrowdMember[] {
  return members;
}
