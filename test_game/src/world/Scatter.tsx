import { GltfModel } from './GltfModel';
import { Sway } from './Sway';
import { ROCK_VARIANT, GRASS_VARIANT, FLOWER_VARIANT, type Variant } from './nature';
import { PLAZA_POS } from './townData';
import { onGrass } from './placement';

/** deterministic 0..1 hash so scatter is stable across renders. */
const rng = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/** Ground-detail points, kept strictly on grass (off plaza/paths/buildings). We
 *  over-sample and keep only the ones that land on grass, so density stays high. */
function points(count: number, seed: number, rMin: number, rMax: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < count * 3 && pts.length < count; i++) {
    const a = rng(seed + i) * Math.PI * 2;
    const r = rMin + rng(seed + i + 99) * (rMax - rMin);
    const x = PLAZA_POS[0] + Math.cos(a) * r;
    const z = PLAZA_POS[2] + Math.sin(a) * r;
    if (!onGrass(x, z, 0.6)) continue;
    pts.push([x, z]);
  }
  return pts;
}

function Detail({ variant, pts, base, jitter, sway, seed }: {
  variant: Variant; pts: [number, number][]; base: number; jitter: number; sway: boolean; seed: number;
}) {
  return (
    <>
      {pts.map(([x, z], i) => {
        const name = variant.names[i % variant.names.length];
        const scale = base + rng(seed + i) * jitter;
        const yaw = rng(seed + i + 7) * Math.PI * 2;
        const model = <GltfModel url={variant.url} name={name} scale={scale} rotation={[0, yaw, 0]} />;
        return (
          <group key={i} position={[x, 0, z]}>
            {sway ? <Sway amount={0.06} speed={1.3} phase={i * 1.9}>{model}</Sway> : model}
          </group>
        );
      })}
    </>
  );
}

/** Ground dressing: scattered rocks, grass tufts, and flower clumps for a lusher,
 *  more detailed world (all CC0 Quaternius nature). */
export function Scatter() {
  return (
    <>
      <Detail variant={ROCK_VARIANT} pts={points(10, 1, 8, 26)} base={0.7} jitter={0.7} sway={false} seed={11} />
      {/* dense grass tufts across the whole lawn so it isn't a flat green plane */}
      <Detail variant={GRASS_VARIANT} pts={points(90, 20, 7, 30)} base={1.0} jitter={0.9} sway seed={31} />
      <Detail variant={FLOWER_VARIANT} pts={points(40, 40, 7, 28)} base={0.8} jitter={0.6} sway seed={53} />
    </>
  );
}
