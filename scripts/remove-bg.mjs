/**
 * Remove the white "card" background from character PNGs.
 *
 * PASS 1 (edge fill): the avatars sit on a solid white box (sometimes inside a
 * transparent margin). The lab coat is ALSO white, so we can't key out every
 * white pixel. We flood-fill from the image borders, travelling through
 * transparent margin AND near-white background, clearing white to transparent,
 * and stopping at the character's darker silhouette. Interior white (coat) is
 * never reached, so it survives. A one-pixel feather softens the silhouette.
 *
 * PASS 2 (enclosed pockets): white sealed off by the character (e.g. the gap
 * BETWEEN the legs) is never reached by the edge fill, so it stays opaque white.
 * We label the remaining near-white blobs and clear only the ones that look like
 * a leg gap: small-ish, low on the body, and horizontally CENTRED — which spares
 * the white sneakers (off to the sides) and the coat (large, upper body).
 *
 * Usage: node scripts/remove-bg.mjs <dir-or-file> [...more]
 * Edits PNGs in place. Originals in docs/art-reference are untouched.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { PNG } from 'pngjs';

const WHITE = 236; // min(r,g,b) >= this  => background-white, cleared
const FEATHER_LO = 200; // [FEATHER_LO, WHITE) opaque edge pixels get partial alpha

// Pass 2 (enclosed pocket) thresholds
const POCKET_WHITE = 238; // near-white opaque considered a background pocket
const POCKET_MAX_AREA_FRAC = 0.04; // blob must be < this fraction of the image
const POCKET_MIN_AREA = 40; // ignore tiny specks
const POCKET_Y_MIN = 0.4; // blob centre must be in the lower body
const POCKET_Y_MAX = 0.95;
const POCKET_X_CENTRED = 0.14; // |centreX - 0.5| must be under this (between legs)

function collect(paths) {
  const files = [];
  for (const p of paths) {
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const f of readdirSync(p)) {
        if (extname(f).toLowerCase() === '.png') files.push(join(p, f));
      }
    } else if (extname(p).toLowerCase() === '.png') {
      files.push(p);
    }
  }
  return files;
}

function edgeFill(png) {
  const { width: w, height: h, data } = png;
  const visited = new Uint8Array(w * h);
  const stack = [];

  const idx = (x, y) => (y * w + x) * 4;
  const minRGB = (i) => Math.min(data[i], data[i + 1], data[i + 2]);

  const pushBorder = (x, y) => {
    const p = y * w + x;
    if (!visited[p]) {
      visited[p] = 1;
      stack.push(x, y);
    }
  };
  for (let x = 0; x < w; x++) {
    pushBorder(x, 0);
    pushBorder(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushBorder(0, y);
    pushBorder(w - 1, y);
  }

  let cleared = 0;
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    const i = idx(x, y);
    const a = data[i + 3];
    const m = minRGB(i);
    const traversable = a === 0 || m >= WHITE;

    if (!traversable) {
      // silhouette edge — feather light pixels that touch the background
      if (a > 0 && m >= FEATHER_LO) {
        const t = (m - FEATHER_LO) / (WHITE - FEATHER_LO); // 0..1
        data[i + 3] = Math.round(a * (1 - t));
      }
      continue;
    }
    if (a !== 0) {
      data[i + 3] = 0; // clear white background to transparent
      cleared++;
    }
    if (x > 0) pushBorder(x - 1, y);
    if (x < w - 1) pushBorder(x + 1, y);
    if (y > 0) pushBorder(x, y - 1);
    if (y < h - 1) pushBorder(x, y + 1);
  }
  return cleared;
}

/** Clear enclosed near-white blobs that look like the gap between the legs. */
function clearPockets(png) {
  const { width: w, height: h, data } = png;
  const minRGB = (i) => Math.min(data[i], data[i + 1], data[i + 2]);
  const isPocketWhite = (p) => data[p * 4 + 3] > 0 && minRGB(p * 4) >= POCKET_WHITE;

  const label = new Int32Array(w * h).fill(-1);
  const maxArea = w * h * POCKET_MAX_AREA_FRAC;
  let cleared = 0;

  for (let start = 0; start < w * h; start++) {
    if (label[start] !== -1 || !isPocketWhite(start)) continue;
    // BFS this near-white component
    const comp = [];
    const queue = [start];
    label[start] = start;
    let sumX = 0;
    let sumY = 0;
    while (queue.length) {
      const p = queue.pop();
      comp.push(p);
      const x = p % w;
      const y = (p / w) | 0;
      sumX += x;
      sumY += y;
      const nbrs = [
        x > 0 ? p - 1 : -1,
        x < w - 1 ? p + 1 : -1,
        y > 0 ? p - w : -1,
        y < h - 1 ? p + w : -1,
      ];
      for (const n of nbrs) {
        if (n >= 0 && label[n] === -1 && isPocketWhite(n)) {
          label[n] = start;
          queue.push(n);
        }
      }
    }

    const area = comp.length;
    if (area < POCKET_MIN_AREA || area > maxArea) continue;
    const cx = sumX / area / w;
    const cy = sumY / area / h;
    if (cy < POCKET_Y_MIN || cy > POCKET_Y_MAX) continue;
    if (Math.abs(cx - 0.5) > POCKET_X_CENTRED) continue;

    for (const p of comp) data[p * 4 + 3] = 0;
    cleared += area;
  }
  return cleared;
}

function processFile(file, doPockets) {
  const png = PNG.sync.read(readFileSync(file));
  const bg = edgeFill(png);
  // Pocket pass is OPT-IN (pass --pockets). It punched holes on some avatars,
  // so the default is the safe edge-fill-only behaviour.
  const pockets = doPockets ? clearPockets(png) : 0;
  writeFileSync(file, PNG.sync.write(png));
  return { bg, pockets };
}

const rawArgs = process.argv.slice(2);
const doPockets = rawArgs.includes('--pockets');
const args = rawArgs.filter((a) => !a.startsWith('--'));
if (args.length === 0) {
  console.error('Usage: node scripts/remove-bg.mjs <dir-or-file> [...] [--pockets]');
  process.exit(1);
}
for (const file of collect(args)) {
  const { bg, pockets } = processFile(file, doPockets);
  console.log(
    `${file}: bg ${bg.toLocaleString()} px · pockets ${pockets.toLocaleString()} px`,
  );
}
