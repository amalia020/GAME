import { describe, it, expect } from 'vitest';
import { distanceXZ, isNear, nearestInteractable } from './proximity';
import type { Interactable } from './interactables';

describe('proximity', () => {
  it('computes XZ distance', () => {
    expect(distanceXZ({ x: 0, z: 0 }, { x: 3, z: 4 })).toBeCloseTo(5, 5);
  });

  it('isNear is true inside the radius, false outside', () => {
    expect(isNear({ x: 0, z: 0 }, { x: 1, z: 0 }, 1.5)).toBe(true);
    expect(isNear({ x: 0, z: 0 }, { x: 2, z: 0 }, 1.5)).toBe(false);
  });

  it('nearestInteractable returns the closest in-range item, or null', () => {
    const list: Interactable[] = [
      { id: 'a', levelId: '1-1', pos: { x: 0, z: -1 }, radius: 1.5, label: 'A' },
      { id: 'b', levelId: '1-2', pos: { x: 5, z: 5 }, radius: 1.5, label: 'B' },
    ];
    expect(nearestInteractable({ x: 0, z: 0 }, list)?.id).toBe('a');
    expect(nearestInteractable({ x: 10, z: 10 }, list)).toBeNull();
  });
});
