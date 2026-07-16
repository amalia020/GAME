import { InkSphere } from './Inked';
import { GltfModel } from './GltfModel';
import { Sway } from './Sway';
import { TREE_VARIANTS, BUSH_VARIANTS } from './nature';
import { PALETTE } from '../render/toon';
import { TREES, BUSHES, PROPS, type TreeDef, type BushDef } from './townData';
import { onGrass } from './placement';

// keep foliage on grass only — never on the plaza or tiled paths
const GRASS_TREES = TREES.filter((t) => onGrass(t.pos[0], t.pos[1], 0.8));
const GRASS_BUSHES = BUSHES.filter((b) => onGrass(b.pos[0], b.pos[1], 0.5));

const TREE_SCALE = 1.6;
const BUSH_SCALE = 1.2;

/** A CC0 kit bush variant, placed + toon-shaded, with a light wind sway. */
function Bush({ b, i }: { b: BushDef; i: number }) {
  const v = BUSH_VARIANTS[i % BUSH_VARIANTS.length];
  const name = v.names[i % v.names.length];
  return (
    <group position={[b.pos[0], 0, b.pos[1]]}>
      <Sway amount={0.04} speed={1.1} phase={i * 1.7}>
        <GltfModel url={v.url} name={name} scale={BUSH_SCALE * b.scale} rotation={[0, (i * 2.1) % (Math.PI * 2), 0]} />
      </Sway>
    </group>
  );
}

/** A CC0 kit tree variant (rotating tree types for variety), swaying in the wind. */
function Tree({ t, i }: { t: TreeDef; i: number }) {
  const v = TREE_VARIANTS[i % TREE_VARIANTS.length];
  const name = v.names[(i * 2) % v.names.length];
  return (
    <group position={[t.pos[0], 0, t.pos[1]]}>
      <Sway amount={0.05} speed={0.8} phase={i * 1.3}>
        <GltfModel url={v.url} name={name} scale={TREE_SCALE * t.scale} rotation={[0, (i * 1.3) % (Math.PI * 2), 0]} />
      </Sway>
    </group>
  );
}

/** Greenery + lamps that dress the plaza. The buildings themselves are KayKit
 *  GLBs rendered by <Houses> (see TownScene). */
export function TownSquare() {
  return (
    <group>
      {GRASS_TREES.map((t, i) => <Tree key={`t${i}`} t={t} i={i} />)}
      {GRASS_BUSHES.map((b, i) => <Bush key={`bush${i}`} b={b} i={i} />)}

      {PROPS.map((p, i) => (
        <group key={`p${i}`} position={[p.pos[0], 0, p.pos[1]]} rotation={[0, (i * 1.7) % (Math.PI * 2), 0]}>
          {/* KayKit streetlight + a warm glowing bulb at the lamp head */}
          <GltfModel url="/models/kits/buildings/streetlight.gltf" scale={3.2} />
          <InkSphere args={[0.28, 10, 8]} color={PALETTE.accentAmber} glow={2.2} position={[0, 2.95, 0.55]} />
        </group>
      ))}
    </group>
  );
}
