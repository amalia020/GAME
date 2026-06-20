/**
 * Environment props authored as code pixel art — a CRT terminal and a floor
 * tile. These prove the same system that draws the avatar draws the world.
 */
import { sprp, type Sprite } from '../pixelArt';

/** A CRT terminal the player walks up to. Morpho-blue screen glow. */
export function terminal(screen = '#38bdf8'): Sprite {
  const o = '#0a0e1a';
  const f = '#243046'; // frame
  const f2 = '#141d2e'; // frame dark
  const g = '#7dd3fc'; // screen highlight
  const a = '#0ea5e9'; // screen deep
  return sprp(
    { o, f, F: f2, S: screen, G: g, A: a },
    [
      '..oooooooooooo..',
      '.oFFFFFFFFFFFFo.',
      '.oFSSSSSSSSSSFo.',
      '.oFSGGSSSSSSSFo.',
      '.oFSSSSSSSAASFo.',
      '.oFSSSSSSSAASFo.',
      '.oFSSSSSSSSSSFo.',
      '.oFSSSSSSSSSSFo.',
      '.oFFFFFFFFFFFFo.',
      '.oFFFFFFFFFFFFo.',
      '..oFFFFFFFFFFo..',
      '...oFFFFFFFFo...',
      '...oFFFFFFFFo...',
      '...oFFFFFFFFo...',
      '..ooFFFFFFFFoo..',
      '..oo........oo..',
    ],
  );
}

/** An isometric-ish dark floor tile with a subtle grid line. */
export function floorTile(): Sprite {
  const a = '#0f1626';
  const b = '#141d2e';
  const line = '#1a2332';
  return sprp(
    { a, b, l: line },
    [
      'aaaaaaaaaaaaaaaa',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'abbbbbbbbbbbbbba',
      'llllllllllllllll',
    ],
  );
}

/** MORPHO's monitor glyph — a glitching wing/eye. Floor 1 = fragmented. */
export function morphoGlyph(): Sprite {
  const o = '#0a0e1a';
  const b = '#38bdf8';
  const d = '#0ea5e9';
  const g = '#7dd3fc';
  return sprp(
    { o, b, d, g },
    [
      '................',
      '....b.......b...',
      '...bd.......db..',
      '..bdd...g...ddb.',
      '.bdd...ggg...ddb',
      '.bd...gg.gg...db',
      '.b...gg...gg...b',
      '....gg.....gg...',
      '...gg.......gg..',
      '..d...........d.',
      '.b.............b',
      '................',
      '....d.......d...',
      '.....b.....b....',
      '................',
      '................',
    ],
  );
}
