import { useSyncExternalStore } from 'react';

/** Which house's NPC we're currently talking to (null = not talking). Drives the
 *  dialogue/tasks overlay and freezes player movement while open. */
let talking: string | null = null;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function startTalk(houseId: string) {
  talking = houseId;
  emit();
}
export function endTalk() {
  talking = null;
  emit();
}
export function isTalking(): boolean {
  return talking !== null;
}
export function getTalking(): string | null {
  return talking;
}
export function useTalking(): string | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getTalking,
    getTalking,
  );
}
