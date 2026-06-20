import { describe, it, expect } from 'vitest';
import { stepPosition, PLAYER_SPEED, type MoveInput } from './movement';
import type { Bounds } from './coords';

const NONE: MoveInput = { up: false, down: false, left: false, right: false };
const BOUNDS: Bounds = { minX: -7, maxX: 7, minZ: -7, maxZ: 7 };

describe('stepPosition', () => {
  it('returns the same position when there is no input', () => {
    const p = stepPosition({ x: 1, z: 2 }, NONE, 1, BOUNDS);
    expect(p).toEqual({ x: 1, z: 2 });
  });

  it('moves +x at PLAYER_SPEED for the Right key over 1 second', () => {
    const p = stepPosition({ x: 0, z: 0 }, { ...NONE, right: true }, 1, BOUNDS);
    expect(p.x).toBeCloseTo(PLAYER_SPEED, 5);
    expect(p.z).toBeCloseTo(0, 5);
  });

  it('moves -z for the Up key', () => {
    const p = stepPosition({ x: 0, z: 0 }, { ...NONE, up: true }, 1, BOUNDS);
    expect(p.z).toBeCloseTo(-PLAYER_SPEED, 5);
  });

  it('normalises diagonals (speed is constant, not faster diagonally)', () => {
    const p = stepPosition({ x: 0, z: 0 }, { ...NONE, up: true, right: true }, 1, BOUNDS);
    const mag = Math.hypot(p.x, p.z);
    expect(mag).toBeCloseTo(PLAYER_SPEED, 5);
  });

  it('clamps to bounds', () => {
    const p = stepPosition({ x: 6.9, z: 0 }, { ...NONE, right: true }, 1, BOUNDS);
    expect(p.x).toBe(7);
  });

  it('scales by dt', () => {
    const p = stepPosition({ x: 0, z: 0 }, { ...NONE, right: true }, 0.5, BOUNDS);
    expect(p.x).toBeCloseTo(PLAYER_SPEED * 0.5, 5);
  });
});
