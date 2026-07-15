import { InkBox, InkSphere } from './Inked';
import { GltfModel } from './GltfModel';
import { TREE_VARIANTS, BUSH_VARIANTS } from './nature';
import { PALETTE } from '../render/toon';
import { TREES, BUSHES, PROPS, type TreeDef, type BushDef } from './townData';

const TREE_SCALE = 1.6;
const BUSH_SCALE = 1.2;

/** A CC0 kit bush variant, placed + toon-shaded. */
function Bush({ b, i }: { b: BushDef; i: number }) {
  const v = BUSH_VARIANTS[i % BUSH_VARIANTS.length];
  const name = v.names[i % v.names.length];
  return (
    <GltfModel url={v.url} name={name}
      position={[b.pos[0], 0, b.pos[1]]}
      scale={BUSH_SCALE * b.scale}
      rotation={[0, (i * 2.1) % (Math.PI * 2), 0]} />
  );
}

/** A CC0 kit tree variant (rotating tree types for variety). */
function Tree({ t, i }: { t: TreeDef; i: number }) {
  const v = TREE_VARIANTS[i % TREE_VARIANTS.length];
  const name = v.names[(i * 2) % v.names.length];
  return (
    <GltfModel url={v.url} name={name}
      position={[t.pos[0], 0, t.pos[1]]}
      scale={TREE_SCALE * t.scale}
      rotation={[0, (i * 1.3) % (Math.PI * 2), 0]} />
  );
}

/** Greenery + lamps that dress the plaza. The buildings themselves are KayKit
 *  GLBs rendered by <Houses> (see TownScene). */
export function TownSquare() {
  return (
    <group>
      {TREES.map((t, i) => <Tree key={`t${i}`} t={t} i={i} />)}
      {BUSHES.map((b, i) => <Bush key={`bush${i}`} b={b} i={i} />)}

      {PROPS.map((p, i) => (
        <group key={`p${i}`} position={[p.pos[0], 0, p.pos[1]]}>
          <InkBox args={[0.2, 3, 0.2]} color={PALETTE.hair} position={[0, 1.5, 0]} />
          <InkSphere args={[0.4, 10, 8]} color={PALETTE.accentAmber} glow={1.8} position={[0, 3.1, 0]} />
        </group>
      ))}
    </group>
  );
}
