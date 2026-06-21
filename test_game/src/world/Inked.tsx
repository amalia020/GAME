import { useMemo } from 'react';
import { Outlines } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { makeToon, INK } from '../render/toon';

const cache = new Map<string, ReturnType<typeof makeToon>>();
function toon(color: string, curve: boolean, emissive: number) {
  const key = `${color}|${curve}|${emissive}`;
  let m = cache.get(key);
  if (!m) { m = makeToon({ color, curve, emissive }); cache.set(key, m); }
  return m;
}

type InkBoxProps = {
  args: [number, number, number];
  color: string;
  curve?: boolean;
  outline?: boolean;
  ink?: number;
  /** emissive intensity (>1 → glows via the targeted bloom). */
  glow?: number;
} & Omit<ThreeElements['mesh'], 'args'>;

/** Cel-shaded box with an ink silhouette; optional emissive glow. */
export function InkBox({ args, color, curve = true, outline = false, ink = 0.019, glow = 0, ...rest }: InkBoxProps) {
  const mat = useMemo(() => toon(color, curve, glow), [color, curve, glow]);
  return (
    <mesh material={mat} {...rest}>
      <boxGeometry args={args} />
      {outline && <Outlines thickness={ink} color={INK} screenspace />}
    </mesh>
  );
}

type InkCylProps = {
  args: [number, number, number, number];
  color: string;
  curve?: boolean;
  outline?: boolean;
  ink?: number;
  glow?: number;
} & Omit<ThreeElements['mesh'], 'args'>;

/** Cel-shaded cylinder/cone with ink outline; optional emissive glow. */
export function InkCyl({ args, color, curve = true, outline = false, ink = 0.019, glow = 0, ...rest }: InkCylProps) {
  const mat = useMemo(() => toon(color, curve, glow), [color, curve, glow]);
  return (
    <mesh material={mat} {...rest}>
      <cylinderGeometry args={args} />
      {outline && <Outlines thickness={ink} color={INK} screenspace />}
    </mesh>
  );
}

type InkSphereProps = {
  args: [number, number, number];
  color: string;
  curve?: boolean;
  glow?: number;
} & Omit<ThreeElements['mesh'], 'args'>;

/** Cel-shaded low-poly sphere — rounded foliage (bushes, tree canopies, blossoms). */
export function InkSphere({ args, color, curve = true, glow = 0, ...rest }: InkSphereProps) {
  const mat = useMemo(() => toon(color, curve, glow), [color, curve, glow]);
  return (
    <mesh material={mat} {...rest}>
      <sphereGeometry args={args} />
    </mesh>
  );
}
