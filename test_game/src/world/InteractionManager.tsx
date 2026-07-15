import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { playerPos, setPrompt } from '../state/interaction';

export interface InteractPoint {
  id: string;
  label: string;
  x: number;
  z: number;
  radius?: number;
  onActivate: () => void;
}

/**
 * Watches the live player position each frame; when inside a point's radius it
 * publishes that point's prompt (rendered by the DOM <InteractionPrompt>), and
 * pressing E / Enter activates the nearest one. Reused by town (house doors) and
 * interiors (exit door / NPC).
 */
export function InteractionManager({ points }: { points: InteractPoint[] }) {
  const active = useRef<InteractPoint | null>(null);

  useFrame(() => {
    let best: InteractPoint | null = null;
    let bestD = Infinity;
    for (const p of points) {
      const r = p.radius ?? 2.6;
      const dx = playerPos.x - p.x;
      const dz = playerPos.z - p.z;
      const d = dx * dx + dz * dz;
      if (d < r * r && d < bestD) {
        bestD = d;
        best = p;
      }
    }
    if (best?.id !== active.current?.id) {
      active.current = best;
      setPrompt(best ? { id: best.id, label: best.label } : null);
    }
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'Enter') && active.current) active.current.onActivate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // clear the prompt when this scene unmounts
  useEffect(() => () => setPrompt(null), []);

  return null;
}
