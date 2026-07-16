import { useSyncExternalStore } from 'react';

/** Which level's prompt-block puzzle is open (null = none). */
export interface PuzzleTarget {
  houseId: string;
  taskIndex: number;
  title: string;
}

let target: PuzzleTarget | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openPuzzle(t: PuzzleTarget) {
  target = t;
  emit();
}
export function closePuzzle() {
  target = null;
  emit();
}
export function usePuzzle(): PuzzleTarget | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => target,
    () => target,
  );
}
