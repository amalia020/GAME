---
noteId: "a2e1edd06cb211f1b0b095ffea814799"
tags: []

---

# MORPHO Pixel-3D Vertical Slice (Level 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the PixiJS room with one interactive pixel-3D room (react-three-fiber) where the player walks with arrow keys, approaches MORPHO, and triggers the existing puzzle/reward loop — proving the "I entered a world" feeling at 30fps on a school Chromebook.

**Architecture:** A new `game/src/world/` module renders a low-poly 3D room inside an r3f `<Canvas>`, deliberately rendered at low internal resolution and CSS-upscaled with `image-rendering: pixelated` (the *Lunistice/Demon Turf* look — and the cheap-on-Chromebook win). Characters are Amalia's existing PNGs drawn as camera-facing **billboards** (drei `<Billboard>`). All game state, the puzzle panel, HUD, and reward toast are untouched: the world calls `useGame.getState().openLevel('1-1')` on interaction, exactly like the old Pixi `RoomScene` did. Pure movement/proximity logic lives in unit-tested TS modules; rendering is verified by running the app.

**Tech Stack:** Vite 5, React 18, TypeScript 5.7, Zustand 5, Vitest 2 (jsdom) — all already present. New: `three`, `@react-three/fiber@^8`, `@react-three/drei@^9`.

## Global Constraints

- **React 18 compatibility is mandatory.** Use `@react-three/fiber@^8` and `@react-three/drei@^9`. (fiber v9 / drei v10 require React 19 — do NOT install those.) Copy these version floors verbatim.
- **Target device: low-end school Chromebooks.** Everything renders through the low-res pixel pass; keep draw calls and texture sizes low. Target a steady **30fps on integrated graphics** (verified in Task 8).
- **Web-only, €0 assets.** No paid assets. Slice uses primitive geometry for props; CC0 glTF is a later (out-of-slice) task.
- **The game brain is rendering-agnostic and reused unchanged:** `state/store.ts`, `ui/PuzzlePanel.tsx`, `ui/Hud.tsx`, `ui/RewardToast.tsx`, `game/ruleEngine.ts`, `content/`. Do not modify them in this plan except `App.tsx`.
- **The interaction contract is fixed:** approaching MORPHO + pressing Enter calls `useGame.getState().openLevel('1-1')`. Solving is handled by the existing `PuzzlePanel`/`completeLevel`. Movement and interaction are frozen unless `useGame.getState().phase === 'room'`.
- **Commands run from `game/`** (the pnpm workspace package): `pnpm dev` (serves http://localhost:5180), `pnpm test`, `pnpm typecheck`.
- **Coordinates:** world is the XZ plane (`x` = right, `z` = depth). Arrow Up = −z (away from camera), Down = +z, Left = −x, Right = +x. `y` is up.

---

## File Structure

**Create:**
- `game/src/world/coords.ts` — shared `Vec2` (x,z), `Bounds` types.
- `game/src/world/movement.ts` — pure `stepPosition()` (arrow input → clamped move). Unit-tested.
- `game/src/world/movement.test.ts`
- `game/src/world/proximity.ts` — pure `distanceXZ()`, `isNear()`, `nearestInteractable()`. Unit-tested.
- `game/src/world/proximity.test.ts`
- `game/src/world/interactables.ts` — data: MORPHO/terminal position + level id.
- `game/src/world/useArrowKeys.ts` — keyboard hook → live `MoveInput` ref.
- `game/src/world/textures.ts` — `useBillboardTexture()` (NearestFilter for crisp pixels).
- `game/src/world/Billboard.tsx` — `<CharacterBillboard>` (PNG plane, drei Billboard).
- `game/src/world/LabRoom.tsx` — floor + walls + placeholder desk boxes.
- `game/src/world/Player.tsx` — player billboard, movement, camera follow, interact.
- `game/src/world/WorldScene.tsx` — composes room + MORPHO + player + lights; owns "nearby" state + prompt.
- `game/src/world/WorldCanvas.tsx` — the `<Canvas>` (pixel dpr), Suspense loader, fade-in.
- `game/src/world/world.css` — `image-rendering: pixelated`, fade-in keyframes.

**Modify:**
- `game/package.json` — add deps (via pnpm; do not hand-edit versions).
- `game/src/App.tsx` — mount `<WorldCanvas>` instead of `<PixiStage>` for room/level/reward.

**Parked (left in place, no longer imported by App):** `render/PixiStage.tsx`, `scenes/RoomScene.ts`, `scenes/DemoScene.ts`.

---

## Task 1: Install r3f and render an empty pixelated room

**Files:**
- Modify: `game/package.json` (via pnpm)
- Create: `game/src/world/world.css`
- Create: `game/src/world/LabRoom.tsx`
- Create: `game/src/world/WorldCanvas.tsx`
- Modify: `game/src/App.tsx`

**Interfaces:**
- Produces: `WorldCanvas` (default-exported React component, props `{ internIndex: number }`), `LabRoom` (named export, no props), `PIXEL_DPR` constant exported from `WorldCanvas`.

- [ ] **Step 1: Install dependencies**

Run (from `game/`):
```bash
pnpm add three @react-three/fiber@^8 @react-three/drei@^9
pnpm add -D @types/three
```
Expected: `package.json` now lists `three`, `@react-three/fiber` (8.x), `@react-three/drei` (9.x); `@types/three` under devDependencies. Verify with:
```bash
pnpm ls @react-three/fiber @react-three/drei
```
Expected: fiber resolves to a `8.x` version, drei to a `9.x` version.

- [ ] **Step 2: Write the pixelation CSS**

Create `game/src/world/world.css`:
```css
.world-canvas-wrap {
  position: absolute;
  inset: 0;
  background: #0a0e1a;
}
/* r3f puts the className on the <canvas>; nearest-neighbour upscaling = crisp pixels */
.world-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
.world-canvas-wrap.fade-in {
  animation: world-fade 600ms ease-out both;
}
@keyframes world-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

- [ ] **Step 3: Write the placeholder room**

Create `game/src/world/LabRoom.tsx`:
```tsx
/**
 * Slice room: a floor, two back walls, and a few boxes standing in for desks.
 * Primitive geometry only (CC0 glTF props are a later, out-of-slice task).
 */
export function LabRoom() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#3a4a6b" />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 2, -8]}>
        <boxGeometry args={[16, 4, 0.4]} />
        <meshStandardMaterial color="#2a3550" />
      </mesh>
      {/* side wall */}
      <mesh position={[-8, 2, 0]}>
        <boxGeometry args={[0.4, 4, 16]} />
        <meshStandardMaterial color="#313c5c" />
      </mesh>
      {/* desks (placeholder boxes) */}
      <mesh position={[3, 0.5, -3]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color="#52608a" />
      </mesh>
      <mesh position={[-3, 0.5, -2]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color="#52608a" />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 4: Write the Canvas wrapper**

Create `game/src/world/WorldCanvas.tsx`:
```tsx
import { Canvas } from '@react-three/fiber';
import { LabRoom } from './LabRoom';
import './world.css';

/** Low internal resolution → big GPU savings + the chunky pixel look. */
export const PIXEL_DPR = 0.25;

export default function WorldCanvas({ internIndex }: { internIndex: number }) {
  void internIndex; // used in later tasks (player texture)
  return (
    <div className="world-canvas-wrap fade-in">
      <Canvas
        className="world-canvas"
        dpr={PIXEL_DPR}
        gl={{ antialias: false }}
        camera={{ position: [0, 6, 7], fov: 45 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.1} />
        <LabRoom />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 5: Mount it in App**

In `game/src/App.tsx`, replace the `PixiStage` import and usage. Change the import block top:
```tsx
import WorldCanvas from './world/WorldCanvas';
import { useGame } from './state/store';
import { TitleScreen } from './ui/TitleScreen';
import { BadgePhoto } from './ui/BadgePhoto';
import { Hud } from './ui/Hud';
import { PuzzlePanel } from './ui/PuzzlePanel';
import { RewardToast } from './ui/RewardToast';
import './styles/ui.css';
```
And replace the returned world block:
```tsx
  return (
    <div className="app-root">
      <WorldCanvas internIndex={internIndex ?? 0} />
      <Hud />
      {phase === 'level' && <PuzzlePanel />}
      {phase === 'reward' && <RewardToast />}
    </div>
  );
```
(Delete the old `PixiStage`/`buildRoomScene` imports and the `<PixiStage .../>` JSX. Leave the `title`/`badge` early returns as-is.)

- [ ] **Step 6: Verify it renders (manual)**

Run (from `game/`):
```bash
pnpm dev
```
Open http://localhost:5180, click through Title → Begin → pick an intern. Expected: a **visibly pixelated** 3D room (floor, walls, two desk boxes) at an angled camera. Confirm `pnpm typecheck` passes:
```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add game/package.json game/pnpm-lock.yaml ../pnpm-lock.yaml game/src/world game/src/App.tsx
git commit -m "feat(world): pixelated r3f room replaces Pixi stage"
```

---

## Task 2: Pure movement logic (arrow keys → clamped position)

**Files:**
- Create: `game/src/world/coords.ts`
- Create: `game/src/world/movement.ts`
- Test: `game/src/world/movement.test.ts`

**Interfaces:**
- Produces:
  - `coords.ts`: `interface Vec2 { x: number; z: number }`, `interface Bounds { minX: number; maxX: number; minZ: number; maxZ: number }`
  - `movement.ts`: `interface MoveInput { up: boolean; down: boolean; left: boolean; right: boolean }`, `const PLAYER_SPEED = 4`, `function stepPosition(pos: Vec2, input: MoveInput, dt: number, bounds: Bounds, speed?: number): Vec2`

- [ ] **Step 1: Write the failing test**

Create `game/src/world/movement.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { stepPosition, PLAYER_SPEED, type MoveInput } from './movement';
import type { Bounds } from './coords';

const NONE: MoveInput = { up: false, down: false, left: false, right: false };
const BOUNDS: Bounds = { minX: -7, maxX: 7, minZ: -7, maxZ: 7 };

describe('stepPosition', () => {
  it('returns the same position when there is no input', () => {
    const p = stepPosition({ x: 1, z: 2 }, NONE, 1, BOUNDS);
    expect(p).toEqual({ x: 1, z: 2 });
  });

  it('moves +x at PLAYER_SPEED for the Right key over 1 second', () => {
    const p = stepPosition({ x: 0, z: 0 }, { ...NONE, right: true }, 1, BOUNDS);
    expect(p.x).toBeCloseTo(PLAYER_SPEED, 5);
    expect(p.z).toBeCloseTo(0, 5);
  });

  it('moves -z for the Up key', () => {
    const p = stepPosition({ x: 0, z: 0 }, { ...NONE, up: true }, 1, BOUNDS);
    expect(p.z).toBeCloseTo(-PLAYER_SPEED, 5);
  });

  it('normalises diagonals (speed is constant, not faster diagonally)', () => {
    const p = stepPosition({ x: 0, z: 0 }, { ...NONE, up: true, right: true }, 1, BOUNDS);
    const mag = Math.hypot(p.x, p.z);
    expect(mag).toBeCloseTo(PLAYER_SPEED, 5);
  });

  it('clamps to bounds', () => {
    const p = stepPosition({ x: 6.9, z: 0 }, { ...NONE, right: true }, 1, BOUNDS);
    expect(p.x).toBe(7);
  });

  it('scales by dt', () => {
    const p = stepPosition({ x: 0, z: 0 }, { ...NONE, right: true }, 0.5, BOUNDS);
    expect(p.x).toBeCloseTo(PLAYER_SPEED * 0.5, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `game/`):
```bash
pnpm test -- movement
```
Expected: FAIL — cannot resolve `./movement` / `./coords`.

- [ ] **Step 3: Write the implementation**

Create `game/src/world/coords.ts`:
```ts
export interface Vec2 {
  x: number;
  z: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
```

Create `game/src/world/movement.ts`:
```ts
import { clamp, type Bounds, type Vec2 } from './coords';

export interface MoveInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/** World units per second. */
export const PLAYER_SPEED = 4;

export function stepPosition(
  pos: Vec2,
  input: MoveInput,
  dt: number,
  bounds: Bounds,
  speed: number = PLAYER_SPEED,
): Vec2 {
  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dz = (input.down ? 1 : 0) - (input.up ? 1 : 0);

  if (dx === 0 && dz === 0) return { x: pos.x, z: pos.z };

  const len = Math.hypot(dx, dz);
  dx /= len;
  dz /= len;

  return {
    x: clamp(pos.x + dx * speed * dt, bounds.minX, bounds.maxX),
    z: clamp(pos.z + dz * speed * dt, bounds.minZ, bounds.maxZ),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- movement`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add game/src/world/coords.ts game/src/world/movement.ts game/src/world/movement.test.ts
git commit -m "feat(world): pure arrow-key movement with bounds clamp"
```

---

## Task 3: Pure proximity logic

**Files:**
- Create: `game/src/world/proximity.ts`
- Create: `game/src/world/interactables.ts`
- Test: `game/src/world/proximity.test.ts`

**Interfaces:**
- Consumes: `Vec2` from `./coords`.
- Produces:
  - `interactables.ts`: `interface Interactable { id: string; levelId: string; pos: Vec2; radius: number; label: string }`, `const INTERACTABLES: Interactable[]`
  - `proximity.ts`: `function distanceXZ(a: Vec2, b: Vec2): number`, `function isNear(a: Vec2, b: Vec2, radius: number): boolean`, `function nearestInteractable(pos: Vec2, list: Interactable[]): Interactable | null`

- [ ] **Step 1: Write the failing test**

Create `game/src/world/proximity.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { distanceXZ, isNear, nearestInteractable } from './proximity';
import type { Interactable } from './interactables';

describe('proximity', () => {
  it('computes XZ distance', () => {
    expect(distanceXZ({ x: 0, z: 0 }, { x: 3, z: 4 })).toBeCloseTo(5, 5);
  });

  it('isNear is true inside the radius, false outside', () => {
    expect(isNear({ x: 0, z: 0 }, { x: 1, z: 0 }, 1.5)).toBe(true);
    expect(isNear({ x: 0, z: 0 }, { x: 2, z: 0 }, 1.5)).toBe(false);
  });

  it('nearestInteractable returns the closest in-range item, or null', () => {
    const list: Interactable[] = [
      { id: 'a', levelId: '1-1', pos: { x: 0, z: -1 }, radius: 1.5, label: 'A' },
      { id: 'b', levelId: '1-2', pos: { x: 5, z: 5 }, radius: 1.5, label: 'B' },
    ];
    expect(nearestInteractable({ x: 0, z: 0 }, list)?.id).toBe('a');
    expect(nearestInteractable({ x: 10, z: 10 }, list)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- proximity`
Expected: FAIL — cannot resolve `./proximity` / `./interactables`.

- [ ] **Step 3: Write the implementation**

Create `game/src/world/interactables.ts`:
```ts
import type { Vec2 } from './coords';

export interface Interactable {
  id: string;
  /** Level id passed to useGame.openLevel(). */
  levelId: string;
  pos: Vec2;
  radius: number;
  /** Prompt text shown when the player is in range. */
  label: string;
}

/** Slice: one interactable — MORPHO, who opens level 1-1. */
export const INTERACTABLES: Interactable[] = [
  {
    id: 'morpho',
    levelId: '1-1',
    pos: { x: 0, z: -1.5 },
    radius: 1.8,
    label: 'Talk to MORPHO  (Enter)',
  },
];
```

Create `game/src/world/proximity.ts`:
```ts
import type { Vec2 } from './coords';
import type { Interactable } from './interactables';

export function distanceXZ(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function isNear(a: Vec2, b: Vec2, radius: number): boolean {
  return distanceXZ(a, b) <= radius;
}

export function nearestInteractable(
  pos: Vec2,
  list: Interactable[],
): Interactable | null {
  let best: Interactable | null = null;
  let bestD = Infinity;
  for (const it of list) {
    const d = distanceXZ(pos, it.pos);
    if (d <= it.radius && d < bestD) {
      best = it;
      bestD = d;
    }
  }
  return best;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- proximity`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add game/src/world/proximity.ts game/src/world/interactables.ts game/src/world/proximity.test.ts
git commit -m "feat(world): pure proximity + interactable lookup"
```

---

## Task 4: Billboard characters + the keyboard hook

**Files:**
- Create: `game/src/world/textures.ts`
- Create: `game/src/world/Billboard.tsx`
- Create: `game/src/world/useArrowKeys.ts`

**Interfaces:**
- Consumes: `INTERNS`, `CHARACTERS` from `../render/assets`; `MoveInput` from `./movement`.
- Produces:
  - `textures.ts`: `function useBillboardTexture(url: string): THREE.Texture`
  - `Billboard.tsx`: `<CharacterBillboard url={string} position={[number,number,number]} height={number} />`
  - `useArrowKeys.ts`: `function useArrowKeys(): React.MutableRefObject<MoveInput>`

- [ ] **Step 1: Write the texture loader**

Create `game/src/world/textures.ts`:
```ts
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/** Loads a PNG and forces nearest-neighbour filtering so it stays crisp under
 *  the pixel pass (no blurry edges on the billboards). */
export function useBillboardTexture(url: string): THREE.Texture {
  const tex = useTexture(url);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
```

- [ ] **Step 2: Write the billboard component**

Create `game/src/world/Billboard.tsx`:
```tsx
import { Billboard } from '@react-three/drei';
import { useBillboardTexture } from './textures';

/** A camera-facing card showing a character PNG (Demon Turf style). The plane
 *  width is derived from the texture aspect ratio so art isn't stretched. */
export function CharacterBillboard({
  url,
  position,
  height = 2,
}: {
  url: string;
  position: [number, number, number];
  height?: number;
}) {
  const tex = useBillboardTexture(url);
  const img = tex.image as { width: number; height: number } | undefined;
  const aspect = img && img.height ? img.width / img.height : 1;
  const width = height * aspect;
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.5} />
      </mesh>
    </Billboard>
  );
}
```

- [ ] **Step 3: Write the keyboard hook**

Create `game/src/world/useArrowKeys.ts`:
```ts
import { useEffect, useRef } from 'react';
import type { MoveInput } from './movement';

const KEY_MAP: Record<string, keyof MoveInput> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Tracks arrow-key state in a ref (read every frame, no re-renders). */
export function useArrowKeys() {
  const ref = useRef<MoveInput>({ up: false, down: false, left: false, right: false });
  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      const k = KEY_MAP[e.key];
      if (k) {
        ref.current[k] = v;
        e.preventDefault();
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
  return ref;
}
```

- [ ] **Step 4: Verify it compiles**

Run (from `game/`): `pnpm typecheck`
Expected: no errors. (These are consumed in Task 5; no standalone visual yet.)

- [ ] **Step 5: Commit**

```bash
git add game/src/world/textures.ts game/src/world/Billboard.tsx game/src/world/useArrowKeys.ts
git commit -m "feat(world): billboard character component + arrow-key hook"
```

---

## Task 5: Player movement, camera follow, MORPHO, and the interaction loop

**Files:**
- Create: `game/src/world/Player.tsx`
- Create: `game/src/world/WorldScene.tsx`
- Modify: `game/src/world/WorldCanvas.tsx`

**Interfaces:**
- Consumes: `stepPosition`/`MoveInput` (movement), `useArrowKeys`, `nearestInteractable`+`INTERACTABLES`, `CharacterBillboard`, `LabRoom`, `useGame` from `../state/store`, `INTERNS`/`CHARACTERS` from `../render/assets`.
- Produces:
  - `Player.tsx`: `<Player internIndex={number} bounds={Bounds} onNearChange={(it: Interactable | null) => void} />`
  - `WorldScene.tsx`: `<WorldScene internIndex={number} />` (renders room + MORPHO + Player, owns prompt DOM).

- [ ] **Step 1: Write the Player**

Create `game/src/world/Player.tsx`:
```tsx
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterBillboard } from './Billboard';
import { useArrowKeys } from './useArrowKeys';
import { stepPosition } from './movement';
import { nearestInteractable } from './proximity';
import { INTERACTABLES, type Interactable } from './interactables';
import type { Bounds, Vec2 } from './coords';
import { INTERNS } from '../render/assets';
import { useGame } from '../state/store';

const START: Vec2 = { x: 0, z: 3 };

export function Player({
  internIndex,
  bounds,
  onNearChange,
}: {
  internIndex: number;
  bounds: Bounds;
  onNearChange: (it: Interactable | null) => void;
}) {
  const keys = useArrowKeys();
  const groupRef = useRef<THREE.Group>(null);
  const pos = useRef<Vec2>({ ...START });
  const near = useRef<Interactable | null>(null);
  const enterWasDown = useRef(false);
  const { camera } = useThree();

  useFrame((_state, dt) => {
    const frozen = useGame.getState().phase !== 'room';

    if (!frozen) {
      pos.current = stepPosition(pos.current, keys.current, Math.min(dt, 0.05), bounds);
    }
    const g = groupRef.current;
    if (g) g.position.set(pos.current.x, 0, pos.current.z);

    // camera gently follows the player (fixed offset)
    const targetCam = new THREE.Vector3(pos.current.x, 6, pos.current.z + 7);
    camera.position.lerp(targetCam, 0.08);
    camera.lookAt(pos.current.x, 1, pos.current.z);

    // proximity → prompt
    const hit = nearestInteractable(pos.current, INTERACTABLES);
    if (hit?.id !== near.current?.id) {
      near.current = hit;
      onNearChange(hit);
    }

    // Enter to interact (edge-triggered), only when not frozen
    const enterDown = isEnterDown();
    if (!frozen && hit && enterDown && !enterWasDown.current) {
      useGame.getState().openLevel(hit.levelId);
    }
    enterWasDown.current = enterDown;
  });

  return (
    <group ref={groupRef}>
      <CharacterBillboard
        url={INTERNS[internIndex]}
        position={[0, 1, 0]}
        height={2}
      />
      {/* contact shadow so the billboard sits in the room, not on top of it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// Module-level Enter tracking (separate from arrow keys to keep that hook pure-ish)
let enterHeld = false;
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enterHeld = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') enterHeld = false;
  });
}
function isEnterDown() {
  return enterHeld;
}
```

- [ ] **Step 2: Write the WorldScene (room + MORPHO + player + prompt)**

Create `game/src/world/WorldScene.tsx`:
```tsx
import { useState } from 'react';
import { Html } from '@react-three/drei';
import { LabRoom } from './LabRoom';
import { Player } from './Player';
import { CharacterBillboard } from './Billboard';
import { INTERACTABLES, type Interactable } from './interactables';
import type { Bounds } from './coords';
import { CHARACTERS } from '../render/assets';

const BOUNDS: Bounds = { minX: -7, maxX: 7, minZ: -7, maxZ: 7 };
const MORPHO = INTERACTABLES[0];

export function WorldScene({ internIndex }: { internIndex: number }) {
  const [near, setNear] = useState<Interactable | null>(null);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.1} />
      <LabRoom />

      {/* MORPHO billboard at the interactable spot */}
      <CharacterBillboard
        url={CHARACTERS.morpho}
        position={[MORPHO.pos.x, 1, MORPHO.pos.z]}
        height={1.6}
      />

      <Player internIndex={internIndex} bounds={BOUNDS} onNearChange={setNear} />

      {near && (
        <Html center position={[near.pos.x, 2.4, near.pos.z]} distanceFactor={10}>
          <div className="world-prompt">{near.label}</div>
        </Html>
      )}
    </>
  );
}
```

Add to `game/src/world/world.css`:
```css
.world-prompt {
  white-space: nowrap;
  font-family: monospace;
  font-size: 13px;
  color: #e8ecf8;
  background: rgba(10, 14, 26, 0.92);
  border: 1px solid #6ad0ff;
  border-radius: 8px;
  padding: 6px 12px;
  pointer-events: none;
}
```

- [ ] **Step 3: Swap WorldScene into the Canvas**

In `game/src/world/WorldCanvas.tsx`, replace the body lights+LabRoom with `<WorldScene>`:
```tsx
import { Canvas } from '@react-three/fiber';
import { WorldScene } from './WorldScene';
import './world.css';

export const PIXEL_DPR = 0.25;

export default function WorldCanvas({ internIndex }: { internIndex: number }) {
  return (
    <div className="world-canvas-wrap fade-in">
      <Canvas
        className="world-canvas"
        dpr={PIXEL_DPR}
        gl={{ antialias: false }}
        camera={{ position: [0, 6, 10], fov: 45 }}
      >
        <WorldScene internIndex={internIndex} />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 4: Verify the full loop (manual)**

Run (from `game/`): `pnpm dev` → http://localhost:5180 → Title → Begin → pick intern.
Expected, in order:
1. Pixelated room with your intern (a billboard) and MORPHO standing ahead.
2. **Arrow keys** walk the intern; the camera follows; the intern stays inside the floor.
3. Walking up to MORPHO shows the **"Talk to MORPHO (Enter)"** prompt.
4. Pressing **Enter** opens the existing `PuzzlePanel` over the world (world still visible behind it).
5. Clicking **"Solve (debug)"** fires the existing `RewardToast`; dismissing returns you to the room, still standing where you were.

Also run `pnpm typecheck` → no errors.

- [ ] **Step 5: Commit**

```bash
git add game/src/world/Player.tsx game/src/world/WorldScene.tsx game/src/world/WorldCanvas.tsx game/src/world/world.css
git commit -m "feat(world): walk, follow-cam, MORPHO proximity, interact->openLevel"
```

---

## Task 6: In-world loading + the "enter the world" transition

**Files:**
- Modify: `game/src/world/WorldCanvas.tsx`
- Modify: `game/src/world/world.css`

**Interfaces:**
- Consumes: drei `useProgress` / `Html`. No new exports.

- [ ] **Step 1: Add a Suspense loader and keep the fade**

Replace `game/src/world/WorldCanvas.tsx` with:
```tsx
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress } from '@react-three/drei';
import { WorldScene } from './WorldScene';
import './world.css';

export const PIXEL_DPR = 0.25;

function Loader() {
  const { active } = useProgress();
  return (
    <Html center>
      <div className="world-loading">{active ? 'Entering the lab…' : ''}</div>
    </Html>
  );
}

export default function WorldCanvas({ internIndex }: { internIndex: number }) {
  return (
    <div className="world-canvas-wrap fade-in">
      <Canvas
        className="world-canvas"
        dpr={PIXEL_DPR}
        gl={{ antialias: false }}
        camera={{ position: [0, 6, 10], fov: 45 }}
      >
        <Suspense fallback={<Loader />}>
          <WorldScene internIndex={internIndex} />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

Add to `game/src/world/world.css`:
```css
.world-loading {
  font-family: monospace;
  font-size: 16px;
  color: #6ad0ff;
  white-space: nowrap;
}
```

- [ ] **Step 2: Verify (manual)**

Run `pnpm dev`, hard-reload (disable cache) and enter the room. Expected: a brief **"Entering the lab…"** while textures load, then the room fades in over ~600ms. No flash of an empty/blank canvas with characters missing.

- [ ] **Step 3: Commit**

```bash
git add game/src/world/WorldCanvas.tsx game/src/world/world.css
git commit -m "feat(world): in-world loading + fade-into-world transition"
```

---

## Task 7: Full test + typecheck gate

**Files:** none (verification task).

- [ ] **Step 1: Run the whole test suite**

Run (from `game/`): `pnpm test`
Expected: all tests pass, including `movement.test.ts` (6) and `proximity.test.ts` (3), plus any pre-existing tests.

- [ ] **Step 2: Typecheck + build**

Run: `pnpm typecheck` then `pnpm build`
Expected: both succeed (the build also runs `tsc --noEmit`).

- [ ] **Step 3: Commit (if anything changed)**

```bash
git commit -am "chore(world): green tests + typecheck for the slice" || echo "nothing to commit"
```

---

## Task 8: Chromebook performance verification

**Files:**
- Modify: `game/src/world/WorldCanvas.tsx` (temporary dev `<Stats/>`)

**Interfaces:** none (verification + tuning task).

- [ ] **Step 1: Add an FPS meter (dev only)**

In `game/src/world/WorldCanvas.tsx`, import and render drei `<Stats/>` inside the Canvas:
```tsx
import { Stats } from '@react-three/drei';
// ...inside <Canvas>, after <Suspense>:
{import.meta.env.DEV && <Stats />}
```

- [ ] **Step 2: Measure under throttling (manual)**

Run `pnpm dev`, open http://localhost:5180 in Chrome, open DevTools → Performance → set **CPU: 6× slowdown**, and (Rendering tab) note GPU. Walk around the room for ~20 seconds.
Expected: the Stats FPS holds **≥ 30**. Record the observed number in the commit message.

- [ ] **Step 3: If below 30fps, tune (apply in order until ≥30)**

1. Lower `PIXEL_DPR` to `0.2` then `0.15` in `WorldCanvas.tsx`.
2. Reduce light count to a single `ambientLight` (drop the directional).
3. Remove the contact-shadow circle meshes from `Player.tsx`.
Re-measure after each change.

- [ ] **Step 4: Leave Stats dev-gated and commit**

Confirm `<Stats/>` is wrapped in `import.meta.env.DEV` so it never ships to students.
```bash
git add game/src/world/WorldCanvas.tsx
git commit -m "perf(world): dev FPS meter + verified 30fps under 6x CPU throttle"
```

---

## Out of slice (next levels / follow-ups, not in this plan)

- Swap primitive props for **CC0 low-poly glTF** (Kenney/Quaternius) via drei `useGLTF`.
- **Curated palette + dithering** post-process for the full artsy look (spec §4).
- The **messages** system (read messages → move → enter challenges).
- The real **drag-drop prompt-block puzzle** (replaces the `PuzzlePanel` stub — separate plan, Checkpoint C3).
- Walk-area as the authored **polygon** (`content/scenes.ts`) instead of a rectangle.
- Additional rooms/levels + professors/interns as more billboards.

---

## Self-Review

**Spec coverage (vs `2026-06-20-morpho-3d-hub-design.md`):**
- §2 pixel-3D + billboards + €0 → Tasks 1 (pixel render), 4 (billboards). ✓
- §3 Chromebook 30fps via low-res render → `PIXEL_DPR` (Task 1) + Task 8 verification/tuning. ✓
- §4 r3f Canvas, billboards, arrow movement, overlay UI, reused logic → Tasks 1,4,5; App.tsx is the only game-brain file touched. ✓
- §5 Amalia's PNGs as billboards + contact-shadow grounding + player = picked intern → Tasks 4,5. ✓
- §6 continuity flow (enter world → approach → panel over world → reward → still in place) → Task 5 Step 4 + Task 6. ✓
- §7 vertical slice scope (one room, two characters, arrow walk, PuzzlePanel, XP juice, 30fps) → Tasks 1–8. ✓
- Curated palette/dither (§4) and messages (§6) are explicitly deferred to "Out of slice" — consistent with the spec's own §8/§9 open items.

**Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output. (LabRoom uses primitive boxes by deliberate, stated decision — not a placeholder for missing logic.)

**Type consistency:** `Vec2 {x,z}` and `Bounds` defined once in `coords.ts`, imported everywhere. `MoveInput` defined in `movement.ts`, used by `useArrowKeys` + `Player`. `Interactable` defined in `interactables.ts`, used by `proximity` + `WorldScene` + `Player`. `stepPosition` / `nearestInteractable` signatures match their call sites. `WorldCanvas` is default-exported and imported as default in `App.tsx` and re-exported through Tasks 5/6 unchanged.
