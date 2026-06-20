import { clamp, type Bounds, type Vec2 } from './coords';

export interface MoveInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/** World units per second. */
export const PLAYER_SPEED = 4;

export function stepPosition(
  pos: Vec2,
  input: MoveInput,
  dt: number,
  bounds: Bounds,
  speed: number = PLAYER_SPEED,
): Vec2 {
  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dz = (input.down ? 1 : 0) - (input.up ? 1 : 0);

  if (dx === 0 && dz === 0) return { x: pos.x, z: pos.z };

  const len = Math.hypot(dx, dz);
  dx /= len;
  dz /= len;

  return {
    x: clamp(pos.x + dx * speed * dt, bounds.minX, bounds.maxX),
    z: clamp(pos.z + dz * speed * dt, bounds.minZ, bounds.maxZ),
  };
}
