import { GltfModel } from './GltfModel';
import { Sway } from './Sway';
import { TREE_VARIANTS, BUSH_VARIANTS } from './nature';
import { EDGE_R } from './townData';

/** deterministic 0..1 hash so the treeline is stable across renders. */
const rng = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const TREES_N = 46; // dense enough to read as woods, not a fence of trees
const BUSH_N = 20;

/**
 * The forest edge ringing the village clearing: a jittered, multi-row treeline
 * (plus undergrowth) just outside the walkable radius — so the village feels
 * nestled in a clearing and the woods are what stop you, not an invisible wall.
 */
export function VillageEdge() {
  const trees = Array.from({ length: TREES_N }, (_, i) => {
    const a = (i / TREES_N) * Math.PI * 2 + (rng(i) - 0.5) * 0.1;
    const r = EDGE_R + rng(i + 71) * 3.2; // 2–3 rows deep
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, i };
  });

  const bushes = Array.from({ length: BUSH_N }, (_, i) => {
    const a = (i / BUSH_N) * Math.PI * 2 + rng(i + 200) * 0.28;
    const r = EDGE_R - 1.3 + rng(i + 250) * 1.8; // undergrowth softening the tree line
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, i };
  });

  return (
    <>
      {trees.map((t) => {
        const v = TREE_VARIANTS[t.i % TREE_VARIANTS.length];
        const name = v.names[(t.i * 3) % v.names.length];
        return (
          <group key={`et${t.i}`} position={[t.x, 0, t.z]}>
            <Sway amount={0.045} speed={0.7} phase={t.i * 1.1}>
              <GltfModel
                url={v.url}
                name={name}
                scale={1.6 * (0.95 + rng(t.i + 9) * 0.55)}
                rotation={[0, rng(t.i + 3) * Math.PI * 2, 0]}
              />
            </Sway>
          </group>
        );
      })}
      {bushes.map((b) => {
        const v = BUSH_VARIANTS[b.i % BUSH_VARIANTS.length];
        const name = v.names[b.i % v.names.length];
        return (
          <group key={`eb${b.i}`} position={[b.x, 0, b.z]}>
            <Sway amount={0.05} speed={1.1} phase={b.i * 1.7}>
              <GltfModel
                url={v.url}
                name={name}
                scale={1.2 * (0.9 + rng(b.i + 33) * 0.6)}
                rotation={[0, rng(b.i + 5) * Math.PI * 2, 0]}
              />
            </Sway>
          </group>
        );
      })}
    </>
  );
}
