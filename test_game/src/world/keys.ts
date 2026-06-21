import { useEffect, useRef, type MutableRefObject } from 'react';

export interface KeyState {
  f: boolean; // forward
  b: boolean; // back
  l: boolean; // left
  r: boolean; // right
  run: boolean;
  jump: boolean;
}

/** Tracks WASD + arrow keys (+ shift to run, space to jump) in a ref, no re-renders. */
export function useKeys(): MutableRefObject<KeyState> {
  const keys = useRef<KeyState>({ f: false, b: false, l: false, r: false, run: false, jump: false });

  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': keys.current.f = v; e.preventDefault(); break;
        case 's': case 'arrowdown': keys.current.b = v; e.preventDefault(); break;
        case 'a': case 'arrowleft': keys.current.l = v; e.preventDefault(); break;
        case 'd': case 'arrowright': keys.current.r = v; e.preventDefault(); break;
        case 'shift': keys.current.run = v; break;
        case ' ': case 'spacebar': keys.current.jump = v; e.preventDefault(); break;
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

  return keys;
}
