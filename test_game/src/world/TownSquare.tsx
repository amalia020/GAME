import { InkBox, InkCyl, InkSphere } from './Inked';
import { PALETTE } from '../render/toon';
import { BUILDINGS, TREES, BUSHES, PROPS, type Building as B, type TreeDef, type BushDef } from './townData';

type V3 = [number, number, number];
const GLOW = 1.7;

/* ----------------------------- greenery parts ----------------------------- */

/** Rounded low bush — a couple of squashed leaf spheres. */
function Bush({ pos, scale = 1 }: { pos: [number, number]; scale?: number }) {
  const [x, z] = pos;
  return (
    <group position={[x, 0, z]} scale={[scale, scale * 0.8, scale]}>
      <InkSphere args={[0.5, 8, 6]} color={PALETTE.leaf} position={[0, 0.4, 0]} />
      <InkSphere args={[0.36, 8, 6]} color={PALETTE.leafLight} position={[0.26, 0.5, 0.16]} />
      <InkSphere args={[0.32, 8, 6]} color={PALETTE.leafDeep} position={[-0.26, 0.44, -0.12]} />
    </group>
  );
}

/** Lush tree — rounded canopy clusters, optional pink blossoms. */
function Tree({ t }: { t: TreeDef }) {
  const [x, z] = t.pos;
  return (
    <group position={[x, 0, z]} scale={t.scale}>
      <InkCyl args={[0.2, 0.28, 1.5, 6]} color={PALETTE.woodDark} position={[0, 0.75, 0]} />
      <InkSphere args={[1.3, 9, 7]} color={PALETTE.leafDeep} position={[0, 2.1, 0]} />
      <InkSphere args={[1.05, 9, 7]} color={PALETTE.leaf} position={[0.7, 2.5, 0.3]} />
      <InkSphere args={[0.95, 9, 7]} color={PALETTE.leafLight} position={[-0.6, 2.7, -0.2]} />
      {t.flower && [[-0.7, 2.2, 0.8], [0.9, 2.9, -0.4], [0.1, 3.2, 0.5], [-0.3, 2.6, -0.8]].map((p, i) => (
        <InkSphere key={i} args={[0.28, 6, 5]} color={PALETTE.flower} position={p as V3} />
      ))}
    </group>
  );
}

/** Planter box with soil, greenery, and a couple of blossoms. */
function Planter({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <InkBox args={[1.4, 0.5, 0.7]} color={PALETTE.woodDark} position={[0, 0.25, 0]} />
      <InkSphere args={[0.4, 8, 6]} color={PALETTE.leaf} position={[-0.4, 0.6, 0]} />
      <InkSphere args={[0.45, 8, 6]} color={PALETTE.leafLight} position={[0.2, 0.65, 0]} />
      <InkSphere args={[0.18, 6, 5]} color={PALETTE.flower} position={[0.45, 0.8, 0.1]} />
      <InkSphere args={[0.16, 6, 5]} color={PALETTE.flower} position={[-0.55, 0.85, -0.1]} />
    </group>
  );
}

/* ------------------------------- building -------------------------------- */

function Building({ b, index }: { b: B; index: number }) {
  const [x, z] = b.pos;
  const [w, h, d] = b.size;

  const faceX = Math.abs(x) >= Math.abs(z);
  const sign = faceX ? -Math.sign(x || 1) : -Math.sign(z || 1);
  const faceW = faceX ? d : w;
  const depthHalf = faceX ? w / 2 : d / 2;

  const place = (u: number, y: number, out: number): V3 =>
    faceX ? [sign * (depthHalf + out), y, u] : [u, y, sign * (depthHalf + out)];
  const flat = (pw: number, ph: number, t: number): V3 => (faceX ? [t, ph, pw] : [pw, ph, t]);
  // outward facing rotation for a flat disc (porthole)
  const discRot: V3 = faceX ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0];

  // window grid (big, glowing)
  const cols = Math.min(3, Math.max(2, Math.floor(faceW / 2.4)));
  const floors = Math.min(3, Math.max(1, Math.round(h / 3)));
  const colStep = faceW / (cols + 1);
  const floorStep = (h - 1.6) / (floors + 1);

  const windows: { u: number; y: number; cool: boolean }[] = [];
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      windows.push({
        u: -faceW / 2 + colStep * (c + 1),
        y: 1.6 + floorStep * (f + 1),
        cool: (f + c) % 3 === 0,
      });
    }
  }

  return (
    <group position={[x, 0, z]}>
      {/* plinth + body */}
      <InkBox args={[w + 0.4, 0.5, d + 0.4]} color={PALETTE.woodDark} position={[0, 0.25, 0]} />
      <InkBox args={[w, h, d]} color={b.color} position={[0, h / 2, 0]} />

      {/* corner posts (wood) */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <InkBox key={`post${i}`} args={[0.28, h, 0.28]} color={PALETTE.wood}
          position={[sx * (w / 2 - 0.04), h / 2, sz * (d / 2 - 0.04)]} />
      ))}

      {/* glowing windows: wood frame + lit glass */}
      {windows.map((win, i) => (
        <group key={`win${i}`}>
          <InkBox args={flat(1.1, 1.2, 0.06)} color={PALETTE.woodDark} position={place(win.u, win.y, 0.02)} />
          <InkBox args={flat(0.82, 0.92, 0.06)} color={win.cool ? PALETTE.glassCool : PALETTE.glass}
            glow={GLOW} position={place(win.u, win.y, 0.05)} />
          <InkBox args={flat(1.2, 0.12, 0.18)} color={PALETTE.wood} position={place(win.u, win.y - 0.66, 0.06)} />
        </group>
      ))}

      {/* signature glowing cyan porthole, centered high on the facade */}
      <InkCyl args={[0.7, 0.7, 0.16, 16]} color={b.accent} glow={1.9}
        rotation={discRot} position={place(0, h - 1.0, 0.05)} />

      {/* slim balcony + railing on the tallest villas only */}
      {h >= 7 && (
        <group>
          <InkBox args={flat(faceW * 0.62, 0.16, 0.65)} color={PALETTE.concrete} position={place(0, h * 0.5, 0.32)} />
          {[-1, 0, 1].map((s, i) => (
            <InkBox key={`rail${i}`} args={[0.09, 0.5, 0.09]} color={PALETTE.wood}
              position={place(s * faceW * 0.24, h * 0.5 + 0.33, 0.6)} />
          ))}
          <InkBox args={flat(faceW * 0.62, 0.09, 0.09)} color={PALETTE.wood} position={place(0, h * 0.5 + 0.56, 0.62)} />
        </group>
      )}

      {/* climbing ivy — leaf clusters up the wall (no pole) */}
      {[-faceW * 0.4, faceW * 0.4].map((u, i) => (
        <group key={`vine${i}`}>
          {[0.12, 0.28, 0.44, 0.6, 0.76].map((fy, j) => (
            <InkSphere key={j} args={[0.26, 7, 5]} color={[PALETTE.leafDeep, PALETTE.leaf, PALETTE.leafLight][j % 3]}
              position={place(u + (j % 2 ? 0.16 : -0.12), h * fy, 0.05)} />
          ))}
        </group>
      ))}

      {/* entrance: recessed door + glowing lintel + low step + flanking planters */}
      <InkBox args={flat(0.9, 1.5, 0.12)} color={PALETTE.woodDark} position={place(0, 0.75, 0.03)} />
      <InkBox args={flat(1.0, 0.12, 0.06)} color={b.accent} glow={1.6} position={place(0, 1.56, 0.05)} />
      <InkBox args={flat(1.3, 0.16, 0.35)} color={PALETTE.concrete} position={place(0, 0.1, 0.22)} />
      <Planter position={place(-faceW * 0.36, 0, 0.55)} />
      <Planter position={place(faceW * 0.36, 0, 0.55)} />

      <Roof b={b} index={index} faceX={faceX} place={place} />
    </group>
  );
}

/* --------------------------------- roofs --------------------------------- */

function SolarPanel({ position, rotation, size }: { position: V3; rotation: V3; size: [number, number] }) {
  const [sw, sd] = size;
  return (
    <group position={position} rotation={rotation}>
      <InkBox args={[sw, 0.12, sd]} color={PALETTE.solar} position={[0, 0, 0]} />
      {[-0.3, 0, 0.3].map((o, i) => (
        <InkBox key={i} args={[sw * 0.92, 0.14, 0.04]} color={PALETTE.solarGrid} position={[0, 0.02, o * sd]} />
      ))}
    </group>
  );
}

/** Rooftop garden tufts + soil bed. */
function RoofGarden({ y, w, d }: { y: number; w: number; d: number }) {
  return (
    <group position={[0, y, 0]}>
      <InkBox args={[w * 0.7, 0.2, d * 0.7]} color={PALETTE.woodDark} position={[0, 0.1, 0]} />
      {[[-w * 0.2, 0.3, d * 0.15], [w * 0.18, 0.35, -d * 0.1], [0, 0.3, d * 0.05]].map((p, i) => (
        <InkSphere key={i} args={[0.5, 8, 6]} color={i % 2 ? PALETTE.leaf : PALETTE.leafLight} position={p as V3} />
      ))}
    </group>
  );
}

function Roof({
  b, faceX, place,
}: {
  b: B; index: number; faceX: boolean;
  place: (u: number, y: number, out: number) => V3;
}) {
  const [w, h, d] = b.size;

  if (b.roofType === 'pitch') {
    return (
      <group>
        <InkCyl args={[0, Math.max(w, d) * 0.72, h * 0.34, 4]} color={b.roof}
          position={[0, h + h * 0.17, 0]} rotation={[0, Math.PI / 4, 0]} />
        {/* solar panel on the front slope */}
        <SolarPanel position={place(0, h + 0.5, 0.0)} rotation={[faceX ? 0 : -0.5, 0, faceX ? -0.5 : 0]}
          size={[Math.min(w, d) * 0.7, Math.max(w, d) * 0.3]} />
      </group>
    );
  }

  if (b.roofType === 'flat') {
    return (
      <group>
        <InkBox args={[w + 0.1, 0.3, d + 0.1]} color={b.roof} position={[0, h + 0.15, 0]} />
        <InkBox args={[w + 0.2, 0.5, 0.18]} color={b.roof} position={[0, h + 0.4, d / 2 + 0.05]} />
        <InkBox args={[w + 0.2, 0.5, 0.18]} color={b.roof} position={[0, h + 0.4, -(d / 2 + 0.05)]} />
        <InkBox args={[0.18, 0.5, d + 0.2]} color={b.roof} position={[w / 2 + 0.05, h + 0.4, 0]} />
        <InkBox args={[0.18, 0.5, d + 0.2]} color={b.roof} position={[-(w / 2 + 0.05), h + 0.4, 0]} />
        <SolarPanel position={[-w * 0.2, h + 0.4, 0]} rotation={[0, 0, 0]} size={[w * 0.5, d * 0.5]} />
        <RoofGarden y={h + 0.3} w={w * 0.6} d={d * 0.6} />
      </group>
    );
  }

  // stepped: flat base + setback upper tier (own windows) + rooftop garden
  const uw = w * 0.6, ud = d * 0.6, uh = h * 0.45;
  const upBase = h + 0.3;
  return (
    <group>
      <InkBox args={[w + 0.1, 0.3, d + 0.1]} color={b.roof} position={[0, h + 0.15, 0]} />
      <InkBox args={[uw, uh, ud]} color={b.color} position={[0, upBase + uh / 2, 0]} />
      <InkCyl args={[0.5, 0.5, 0.14, 16]} color={b.accent} glow={1.9}
        rotation={faceX ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]} position={place(0, upBase + uh * 0.6, 0.05)} />
      <SolarPanel position={[0, upBase + uh + 0.1, 0]} rotation={[0, 0, 0]} size={[uw * 0.7, ud * 0.7]} />
      <RoofGarden y={upBase + uh} w={uw * 0.7} d={ud * 0.7} />
    </group>
  );
}

/* ------------------------------- assembly -------------------------------- */

export function TownSquare() {
  return (
    <group>
      {BUILDINGS.map((b, i) => <Building key={`b${i}`} b={b} index={i} />)}
      {TREES.map((t, i) => <Tree key={`t${i}`} t={t} />)}
      {BUSHES.map((bs: BushDef, i) => <Bush key={`bush${i}`} pos={bs.pos} scale={bs.scale} />)}

      {PROPS.map((p, i) => (
        <group key={`p${i}`} position={[p.pos[0], 0, p.pos[1]]}>
          <InkBox args={[0.2, 3, 0.2]} color={PALETTE.hair} position={[0, 1.5, 0]} />
          <InkSphere args={[0.4, 10, 8]} color={PALETTE.accentAmber} glow={1.8} position={[0, 3.1, 0]} />
        </group>
      ))}
    </group>
  );
}
