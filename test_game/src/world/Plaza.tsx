import { InkCyl, InkSphere } from './Inked';
import { Fountain } from './Fountain';
import { PALETTE } from '../render/toon';

/**
 * The central plaza landmark — a real kit fountain standing on the open sand.
 * Gives the town a lively focal point (instead of a central house). The plaza
 * SURFACE itself is painted by <SandRoad>, which treats it as one continuous
 * shape with the walkways so there's no seam where a road meets the square.
 */
export function Plaza({ position = [0, 0, -4] as [number, number, number] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* the kit fountain (toon-shaded, glowing animated water). Sits at y=0: the
          old 0.1 lift existed only to clear the tiles' mortar slab. */}
      <Fountain position={[0, 0, 0]} scale={1.6} />

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
