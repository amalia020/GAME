import { InkCyl, InkSphere } from './Inked';
import { Fountain } from './Fountain';
import { PALETTE } from '../render/toon';

/**
 * The central plaza landmark — a real kit fountain on a round paved base. Gives
 * the town a lively focal point (instead of a central house).
 */
export function Plaza({ position = [0, 0, -4] as [number, number, number] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* round paved plaza slab */}
      <InkCyl args={[6.4, 6.4, 0.12, 32]} color={PALETTE.road} position={[0, 0.04, 0]} outline={false} />
      <InkCyl args={[6.7, 6.7, 0.18, 32]} color={PALETTE.concrete} position={[0, 0.02, 0]} outline={false} />

      {/* the kit fountain (toon-shaded, glowing animated water) */}
      <Fountain position={[0, 0.1, 0]} scale={1.6} />

      {/* planters ringing the fountain */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const x = Math.cos(a) * 3.4;
        const z = Math.sin(a) * 3.4;
        return (
          <group key={i} position={[x, 0, z]}>
            <InkCyl args={[0.6, 0.7, 0.5, 12]} color={PALETTE.woodDark} position={[0, 0.25, 0]} />
            <InkSphere args={[0.55, 8, 6]} color={i % 2 ? PALETTE.leaf : PALETTE.leafLight} position={[0, 0.7, 0]} />
            <InkSphere args={[0.2, 6, 5]} color={PALETTE.flower} position={[0.3, 0.85, 0.1]} />
          </group>
        );
      })}
    </group>
  );
}
