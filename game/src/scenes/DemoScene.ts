/**
 * Checkpoint A proof scene: renders the code-defined pixel art so the art
 * approach can be reviewed before the world is built on it. Shows the modular
 * intern avatar (a few skin/hair/coat combos), a CRT terminal, a floor tile,
 * and MORPHO's glitch glyph — all rasterized from pixel-grid data, zero image
 * files. The avatar idle-bobs and MORPHO's glyph flickers to prove it's live.
 */
import { Application, Container, Sprite as PixiSprite, Text } from 'pixi.js';
import {
  colors,
  floorTile,
  HAIR_COLORS,
  internLayers,
  morphoGlyph,
  SKIN_TONES,
  terminal,
  rankCoat,
  type InternLook,
} from '@morpho/shared';
import { layeredTexture, spriteTexture } from '../render/textureCache';

const SCALE = 6;

function makeIntern(look: InternLook, key: string): PixiSprite {
  const layers = internLayers(look);
  const tex = layeredTexture(
    { width: 16, height: 20, layers },
    SCALE,
    key,
  );
  return new PixiSprite(tex);
}

function label(text: string, x: number, y: number): Text {
  const t = new Text({
    text,
    style: {
      fill: colors.textMuted,
      fontFamily: 'monospace',
      fontSize: 12,
    },
  });
  t.x = x;
  t.y = y;
  return t;
}

export function buildDemoScene(app: Application): () => void {
  const root = new Container();
  app.stage.addChild(root);

  const title = new Text({
    text: 'PROJECT MORPHO — code-defined pixel art',
    style: { fill: colors.morpho, fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold' },
  });
  title.x = 24;
  title.y = 20;
  root.addChild(title);

  const sub = new Text({
    text: 'Every sprite below is a palette + pixel grid in TypeScript. No image files.',
    style: { fill: colors.textDim, fontFamily: 'monospace', fontSize: 12 },
  });
  sub.x = 24;
  sub.y = 46;
  root.addChild(sub);

  // --- Row of intern variants (modular rig + recolor) ---
  const looks: { look: InternLook; name: string }[] = [
    { look: { skin: SKIN_TONES.light, hair: HAIR_COLORS.brown, coat: rankCoat.intern, badge: colors.amber }, name: 'Intern' },
    { look: { skin: SKIN_TONES.deep, hair: HAIR_COLORS.black, coat: rankCoat.researcher, badge: colors.morpho }, name: 'Researcher' },
    { look: { skin: SKIN_TONES.tan, hair: HAIR_COLORS.blue, coat: rankCoat.director, badge: colors.morphoGlow }, name: 'Director' },
    { look: { skin: SKIN_TONES.porcelain, hair: HAIR_COLORS.red, coat: rankCoat.junior, badge: colors.amber }, name: 'Junior' },
  ];

  const interns: PixiSprite[] = [];
  looks.forEach((entry, i) => {
    const s = makeIntern(entry.look, `demo-${entry.name}`);
    s.x = 30 + i * (16 * SCALE + 40);
    s.y = 100;
    root.addChild(s);
    root.addChild(label(entry.name, s.x, s.y + 20 * SCALE + 6));
    interns.push(s);
  });

  // --- Props row: terminal + floor tile ---
  const term = new PixiSprite(spriteTexture(terminal(colors.morpho), SCALE));
  term.x = 30;
  term.y = 100 + 20 * SCALE + 70;
  root.addChild(term);
  root.addChild(label('CRT terminal', term.x, term.y + 16 * SCALE + 6));

  const tile = new PixiSprite(spriteTexture(floorTile(), SCALE));
  tile.x = term.x + 16 * SCALE + 50;
  tile.y = term.y;
  root.addChild(tile);
  root.addChild(label('floor tile', tile.x, tile.y + 16 * SCALE + 6));

  const glyph = new PixiSprite(spriteTexture(morphoGlyph(), SCALE));
  glyph.x = tile.x + 16 * SCALE + 50;
  glyph.y = term.y;
  root.addChild(glyph);
  root.addChild(label('MORPHO (Floor 1: fragmented)', glyph.x, glyph.y + 16 * SCALE + 6));

  // --- Liveliness: avatar idle-bob + glyph flicker ---
  let t = 0;
  const tick = (ticker: { deltaTime: number }) => {
    t += ticker.deltaTime;
    interns.forEach((s, i) => {
      s.y = 100 + Math.round(Math.sin(t * 0.08 + i) * 2);
    });
    glyph.alpha = 0.55 + 0.45 * Math.abs(Math.sin(t * 0.12));
  };
  app.ticker.add(tick);

  return () => {
    app.ticker.remove(tick);
    root.destroy({ children: true });
  };
}
