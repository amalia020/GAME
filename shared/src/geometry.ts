/**
 * Small 2D geometry helpers for walkable-floor clamping.
 *
 * Floors are authored as convex polygons (in normalized background-image
 * coordinates). We test point-in-polygon and, for clicks outside the floor,
 * snap to the nearest point on the floor boundary so the intern never stands on
 * walls/consoles/holograms.
 */

export interface Pt {
  x: number;
  y: number;
}

/** Ray-casting point-in-polygon. */
export function pointInPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    const intersects =
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Closest point to `p` on segment a→b. */
export function nearestOnSegment(p: Pt, a: Pt, b: Pt): Pt {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  if (len2 === 0) return { x: a.x, y: a.y };
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  return { x: a.x + t * abx, y: a.y + t * aby };
}

/** If `p` is inside `poly`, return it; otherwise snap to the nearest boundary point. */
export function clampToPolygon(p: Pt, poly: Pt[]): Pt {
  if (pointInPolygon(p, poly)) return p;
  let best: Pt = poly[0];
  let bestD = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const q = nearestOnSegment(p, poly[j], poly[i]);
    const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = q;
    }
  }
  return best;
}

/** Axis-aligned bounds of a polygon. */
export function polyBounds(poly: Pt[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of poly) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

export function centroid(poly: Pt[]): Pt {
  let x = 0;
  let y = 0;
  for (const p of poly) {
    x += p.x;
    y += p.y;
  }
  return { x: x / poly.length, y: y / poly.length };
}
