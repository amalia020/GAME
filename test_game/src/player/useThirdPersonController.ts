import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useKeys } from '../world/keys';
import { COLLIDERS, type Collider } from '../world/townData';
import { playerPos } from '../state/interaction';
import { isTalking } from '../state/dialog';
import { crowdMembers } from '../state/crowd';

const WALK = 4.2;
const RUN = 8.5;
const RADIUS = 0.5; // collision radius around the character
const GRAVITY = 24;
const JUMP_V = 8.4;

/** Per-scene movement config. Defaults to the town so existing callers are unchanged. */
export interface ControllerOpts {
  colliders?: Collider[];
  /** half-extent clamp (square) keeping the player inside the scene. */
  bound?: number;
  /** circular play area (overrides the square bound) — keeps the player in the
   *  village clearing instead of wandering into empty grass. */
  boundCircle?: { cx: number; cz: number; r: number };
  /** base follow distance; interiors want a closer camera. */
  camFull?: number;
  /** if set, use a FIXED camera (no follow) — for enclosed interior rooms. */
  fixedCam?: { pos: [number, number, number]; look: [number, number, number] };
}

/** Shared motion state the character mesh reads to drive its animation. */
export interface Motion {
  /** 0 = still, ~0.5 = walking, 1 = running (normalized speed). */
  amount: number;
  /** ever-increasing stride phase (radians), advances with distance walked. */
  phase: number;
  /** true while off the ground (jumping/falling). */
  airborne: boolean;
}

/** Shortest-path angle lerp (handles wrap-around). */
function lerpAngle(a: number, b: number, t: number): number {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/** Push a circle (px,pz,r) out of any AABB it overlaps; returns resolved x/z. */
function resolveCollisions(px: number, pz: number, r: number, colliders: Collider[]): [number, number] {
  for (const c of colliders) {
    const minX = c.minX - r, maxX = c.maxX + r;
    const minZ = c.minZ - r, maxZ = c.maxZ + r;
    if (px > minX && px < maxX && pz > minZ && pz < maxZ) {
      // inside the inflated box → eject along the shallowest axis (enables sliding)
      const dL = px - minX, dR = maxX - px, dN = pz - minZ, dF = maxZ - pz;
      const m = Math.min(dL, dR, dN, dF);
      if (m === dL) px = minX;
      else if (m === dR) px = maxX;
      else if (m === dN) pz = minZ;
      else pz = maxZ;
    }
  }
  return [px, pz];
}

/**
 * Momentum movement (world-axis: forward = into the scene, away from camera) +
 * jump, AABB collision, and a smooth third-person follow camera. Returns a
 * Motion ref so the character mesh can pick idle/walk/run/jump.
 */
export function useThirdPersonController(group: RefObject<THREE.Group>, opts: ControllerOpts = {}) {
  const colliders = opts.colliders ?? (COLLIDERS as Collider[]);
  const BOUND = opts.bound ?? 42;
  const FULL = opts.camFull ?? 8.5;
  const keys = useKeys();
  const vel = useRef(new THREE.Vector3());
  const vy = useRef(0);
  const grounded = useRef(true);
  const wasJump = useRef(false);
  const motion = useRef<Motion>({ amount: 0, phase: 0, airborne: false });
  const tmp = useRef(new THREE.Vector3());

  useFrame((state, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 1 / 30); // clamp big frame gaps
    const k = keys.current;

    // ---- horizontal movement (momentum) ----
    // freeze input while a dialogue is open so the player can't wander off mid-talk
    const frozen = isTalking();
    const dir = tmp.current.set(
      frozen ? 0 : (k.r ? 1 : 0) - (k.l ? 1 : 0),
      0,
      frozen ? 0 : (k.b ? 1 : 0) - (k.f ? 1 : 0),
    );
    const moving = dir.lengthSq() > 0;
    if (moving) dir.normalize();
    dir.multiplyScalar(k.run ? RUN : WALK);

    const ease = 1 - Math.exp(-9 * dt);
    vel.current.lerp(dir, ease);
    if (vel.current.lengthSq() < 1e-4) vel.current.set(0, 0, 0);

    const dist = vel.current.length() * dt;
    let nx = g.position.x + vel.current.x * dt;
    let nz = g.position.z + vel.current.z * dt;
    if (opts.boundCircle) {
      // circular clearing: slide along the tree line instead of a square wall
      const { cx, cz, r } = opts.boundCircle;
      const ox = nx - cx;
      const oz = nz - cz;
      const d = Math.hypot(ox, oz);
      if (d > r) {
        nx = cx + (ox / d) * r;
        nz = cz + (oz / d) * r;
      }
    } else {
      nx = THREE.MathUtils.clamp(nx, -BOUND, BOUND);
      nz = THREE.MathUtils.clamp(nz, -BOUND, BOUND);
    }
    [nx, nz] = resolveCollisions(nx, nz, RADIUS, colliders);
    // push out of other NPCs (crowd) so you can't walk through them
    for (const m of crowdMembers()) {
      const ex = nx - m.x;
      const ez = nz - m.z;
      const ed = Math.hypot(ex, ez);
      const min = RADIUS + m.r;
      if (ed < min && ed > 1e-4) {
        nx = m.x + (ex / ed) * min;
        nz = m.z + (ez / ed) * min;
      }
    }
    g.position.x = nx;
    g.position.z = nz;
    playerPos.copy(g.position); // publish live position for proximity/interaction

    // ---- jump + gravity ----
    if (k.jump && !wasJump.current && grounded.current) {
      vy.current = JUMP_V;
      grounded.current = false;
    }
    wasJump.current = k.jump;
    vy.current -= GRAVITY * dt;
    g.position.y += vy.current * dt;
    if (g.position.y <= 0) {
      g.position.y = 0;
      vy.current = 0;
      grounded.current = true;
    }

    // ---- drive animation state ----
    motion.current.amount = THREE.MathUtils.clamp(vel.current.length() / WALK, 0, 1.3);
    motion.current.phase += dist * 3.4;
    motion.current.airborne = !grounded.current;

    // face heading. Mesh forward is -Z, so desired = atan2(-vx, -vz).
    if (vel.current.lengthSq() > 0.4) {
      const desired = Math.atan2(-vel.current.x, -vel.current.z);
      g.rotation.y = lerpAngle(g.rotation.y, desired, 1 - Math.exp(-12 * dt));
    }

    // ---- camera ----
    if (opts.fixedCam) {
      // fixed room camera (enclosed interior): frame the whole room, don't follow
      const fc = opts.fixedCam;
      state.camera.position.set(fc.pos[0], fc.pos[1], fc.pos[2]);
      state.camera.lookAt(fc.look[0], fc.look[1], fc.look[2]);
      return;
    }

    // Follow camera — sits behind (+Z) and above, at a CONSTANT distance.
    //
    // It deliberately does nothing about obstacles. The camera is locked behind
    // the character, so when a house sits a couple of units back there is no
    // distance that both frames the character and clears the wall: pulling in
    // means top-down, staying put means looking through a roof. Instead the
    // house ghosts itself out of the way (see <Building>), which leaves the
    // framing — and the world-axis controls that depend on it — untouched.
    const camGoal = tmp.current.set(g.position.x, 6.2, g.position.z + FULL);
    state.camera.position.lerp(camGoal, 1 - Math.exp(-6 * dt));
    state.camera.lookAt(g.position.x, 1.2, g.position.z);
  });

  return motion;
}
