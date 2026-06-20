import type { Vec2 } from './coords';
import type { Interactable } from './interactables';

export function distanceXZ(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function isNear(a: Vec2, b: Vec2, radius: number): boolean {
  return distanceXZ(a, b) <= radius;
}

export function nearestInteractable(
  pos: Vec2,
  list: Interactable[],
): Interactable | null {
  let best: Interactable | null = null;
  let bestD = Infinity;
  for (const it of list) {
    const d = distanceXZ(pos, it.pos);
    if (d <= it.radius && d < bestD) {
      best = it;
      bestD = d;
    }
  }
  return best;
}
