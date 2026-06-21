import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useKeys } from '../world/keys';
import { COLLIDERS, CAMERA_OCCLUDERS, type Collider } from '../world/townData';

const WALK = 4.2;
const RUN = 8.5;
const BOUND = 42; // keep the character from wandering off the curved edge
const RADIUS = 0.5; // collision radius around the character
const GRAVITY = 24;
const JUMP_V = 8.4;

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
function resolveCollisions(px: number, pz: number, r: number): [number, number] {
  for (const c of COLLIDERS as Collider[]) {
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
 * Entry fraction (0..1) where the segment (px,pz)→(px+dx,pz+dz) first enters an
 * AABB inflated by r, or Infinity if it misses. Used for camera occlusion: if a
 * building sits between the character and the camera, we pull the camera in.
 */
function segEntryT(px: number, pz: number, dx: number, dz: number, c: Collider, r: number): number {
  const minX = c.minX - r, maxX = c.maxX + r, minZ = c.minZ - r, maxZ = c.maxZ + r;
  let tmin = 0, tmax = 1;
  if (Math.abs(dx) < 1e-6) { if (px < minX || px > maxX) return Infinity; }
  else { let t1 = (minX - px) / dx, t2 = (maxX - px) / dx; if (t1 > t2) { const t = t1; t1 = t2; t2 = t; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); }
  if (Math.abs(dz) < 1e-6) { if (pz < minZ || pz > maxZ) return Infinity; }
  else { let t1 = (minZ - pz) / dz, t2 = (maxZ - pz) / dz; if (t1 > t2) { const t = t1; t1 = t2; t2 = t; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); }
  if (tmax < tmin) return Infinity;
  return tmin < 0 ? 0 : tmin;
}

/**
 * Momentum movement (world-axis: forward = into the scene, away from camera) +
 * jump, AABB collision, and a smooth third-person follow camera. Returns a
 * Motion ref so the character mesh can pick idle/walk/run/jump.
 */
export function useThirdPersonController(group: RefObject<THREE.Group>) {
  const keys = useKeys();
  const vel = useRef(new THREE.Vector3());
  const vy = useRef(0);
  const grounded = useRef(true);
  const wasJump = useRef(false);
  const motion = useRef<Motion>({ amount: 0, phase: 0, airborne: false });
  const tmp = useRef(new THREE.Vector3());
  const camDist = useRef(8.5); // smoothed camera distance (shrinks when occluded)

  useFrame((state, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 1 / 30); // clamp big frame gaps
    const k = keys.current;

    // ---- horizontal movement (momentum) ----
    const dir = tmp.current.set(
      (k.r ? 1 : 0) - (k.l ? 1 : 0),
      0,
      (k.b ? 1 : 0) - (k.f ? 1 : 0),
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
    nx = THREE.MathUtils.clamp(nx, -BOUND, BOUND);
    nz = THREE.MathUtils.clamp(nz, -BOUND, BOUND);
    [nx, nz] = resolveCollisions(nx, nz, RADIUS);
    g.position.x = nx;
    g.position.z = nz;

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

    // follow camera — sits behind (+Z) and above. If a building occludes the
    // character, pull the camera IN so the character is always visible (no more
    // looking through walls into building interiors).
    const FULL = 8.5;
    const camR = 0.7;
    let allowed = FULL;
    for (const c of CAMERA_OCCLUDERS) {
      const t = segEntryT(g.position.x, g.position.z, 0, FULL, c, camR);
      if (t !== Infinity) allowed = Math.min(allowed, t * FULL - 0.4);
    }
    allowed = THREE.MathUtils.clamp(allowed, 2.6, FULL);
    // pull in fast (don't let a wall fill the screen); ease back out gently
    const camK = allowed < camDist.current ? 20 : 4;
    camDist.current += (allowed - camDist.current) * (1 - Math.exp(-camK * dt));
    const frac = camDist.current / FULL;
    // keep height on the ground baseline (jumps don't jerk the cam); lower it as
    // the camera pulls in so it stays behind the character, not above it.
    const camGoal = tmp.current.set(g.position.x, 3.6 + 2.6 * frac, g.position.z + camDist.current);
    state.camera.position.lerp(camGoal, 1 - Math.exp(-6 * dt));
    state.camera.lookAt(g.position.x, 1.2, g.position.z);
  });

  return motion;
}
