import { useSyncExternalStore } from 'react';

/**
 * Where the player currently is. A module-level external store (NOT React
 * context) so it can be read/written both outside AND inside the R3F <Canvas>
 * (context doesn't cross the reconciler boundary; an external store does).
 *
 * World model: one TOWN (hub) + house INTERIORS. `spawnAt` on the town lets us
 * drop the player back next to the door of the house they just left.
 */
export type Location =
  | { kind: 'town'; spawnAt?: string }
  | { kind: 'interior'; houseId: string };

let state: Location = { kind: 'town' };
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function getLocation(): Location {
  return state;
}
export function setLocation(next: Location) {
  state = next;
  emit();
}
export function enterHouse(houseId: string) {
  setLocation({ kind: 'interior', houseId });
}
export function exitToTown(nearHouseId?: string) {
  setLocation({ kind: 'town', spawnAt: nearHouseId });
}

export function useLocation(): Location {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getLocation,
    getLocation,
  );
}
