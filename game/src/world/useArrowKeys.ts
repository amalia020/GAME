import { useEffect, useRef } from 'react';
import type { MoveInput } from './movement';

const KEY_MAP: Record<string, keyof MoveInput> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Tracks arrow-key state in a ref (read every frame, no re-renders). */
export function useArrowKeys() {
  const ref = useRef<MoveInput>({ up: false, down: false, left: false, right: false });
  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      const k = KEY_MAP[e.key];
      if (k) {
        ref.current[k] = v;
        e.preventDefault();
      }
    };
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
  return ref;
}
