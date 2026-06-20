/**
 * Checkpoint B room: a real lab background (your generated scene art) with a
 * walkable intern, the MORPHO companion, fake-isometric depth scaling, and one
 * proximity interaction hotspot (a terminal). Proves the world loop:
 *   walk the room  →  approach a terminal  →  prompt to interact.
 *
 * Rooms are background-image + walkable-band + hotspots, all data-drivable
 * later. This scene hardcodes one room to validate feel.
 */
import { Application, Container, Graphics, Sprite, Text } from 'pixi.js';
import {
  centroid,
  clampToPolygon,
  colors,
  hexToPixi,
  polyBounds,
  type Pt,
} from '@morpho/shared';
import { CHARACTERS, INTERNS, loadTexture, SCENES } from '../render/assets';
import { WalkingCharacter } from '../render/WalkingCharacter';
import { Companion } from '../render/Companion';
import { SCENE_DEFS } from '../content/scenes';
import { useGame } from '../state/store';

export interface RoomSceneOptions {
  /** Which intern (1–12) the player picked at the badge photo. */
  internIndex?: number;
  scene?: keyof typeof SCENES;
}

export function buildRoomScene(
  app: Application,
  opts: RoomSceneOptions = {},
): () => void {
  const internIndex = opts.internIndex ?? 0;
  const sceneId = opts.scene ?? 'cvLab';

  let disposed = false;
  const cleanups: Array<() => void> = [];

  // Loading placeholder
  const loading = new Text({
    text: 'Entering the lab…',
    style: { fill: colors.morpho, fontFamily: 'monospace', fontSize: 16 },
  });
  loading.position.set(24, 24);
  app.stage.addChild(loading);

  (async () => {
    const [bgTex, internTex, morphoTex] = await Promise.all([
      loadTexture(SCENES[sceneId]),
      loadTexture(INTERNS[internIndex]),
      loadTexture(CHARACTERS.morpho),
    ]);
    if (disposed) return;
    loading.destroy();

    // --- layers ---
    const bg = new Sprite(bgTex);
    app.stage.addChild(bg);

    const world = new Container();
    world.sortableChildren = true;
    app.stage.addChild(world);

    const fx = new Container();
    app.stage.addChild(fx);

    const ui = new Container();
    app.stage.addChild(ui);

    // --- walkable floor polygon + terminal anchor (normalized → screen) ---
    const def = SCENE_DEFS[sceneId];
    let screenPoly: Pt[] = [];
    let floorMinY = 0;
    let floorMaxY = 0;
    const hotspot = { x: 0, y: 0, r: 90 };

    const layout = () => {
      const sw = app.screen.width;
      const sh = app.screen.height;
      const scale = Math.max(sw / bgTex.width, sh / bgTex.height);
      bg.scale.set(scale);
      const bx = Math.round((sw - bgTex.width * scale) / 2);
      const by = Math.round((sh - bgTex.height * scale) / 2);
      bg.position.set(bx, by);

      const toScreen = (n: Pt): Pt => ({
        x: bx + n.x * bgTex.width * scale,
        y: by + n.y * bgTex.height * scale,
      });
      screenPoly = def.walkArea.map(toScreen);
      const b = polyBounds(screenPoly);
      floorMinY = b.minY;
      floorMaxY = b.maxY;
      const t = toScreen(def.terminal);
      hotspot.x = t.x;
      hotspot.y = t.y;
      hotspot.r = sh * 0.14;
    };
    layout();

    const clampFloor = (x: number, y: number) => clampToPolygon({ x, y }, screenPoly);
    const depthAt = (y: number) => {
      const t = (y - floorMinY) / (floorMaxY - floorMinY || 1);
      return 0.82 + Math.max(0, Math.min(1, t)) * 0.33;
    };

    // --- player + companion ---
    const start = centroid(screenPoly);
    const player = new WalkingCharacter(internTex, {
      targetHeight: 180,
      x: start.x,
      y: start.y,
    });
    world.addChild(player.view);

    const companion = new Companion(morphoTex, {
      targetHeight: 84,
      x: start.x + 90,
      y: start.y - 150,
    });
    world.addChild(companion.view);

    // --- interaction hotspot: a terminal (position set in layout) ---
    const ring = new Graphics();
    fx.addChild(ring);

    const prompt = new Container();
    const promptBg = new Graphics();
    const promptText = new Text({
      text: '▶  Examine terminal   (E)',
      style: { fill: colors.text, fontFamily: 'monospace', fontSize: 14 },
    });
    promptText.position.set(12, 7);
    promptBg
      .roundRect(0, 0, promptText.width + 24, 32, 8)
      .fill({ color: hexToPixi(colors.panel), alpha: 0.92 })
      .stroke({ color: hexToPixi(colors.morpho), width: 1 });
    prompt.addChild(promptBg, promptText);
    prompt.visible = false;
    ui.addChild(prompt);

    // --- in-world hint (the React HUD owns the top bar) ---
    const hint = new Text({
      text: 'Click to walk · approach the glowing terminal · press E',
      style: { fill: colors.textDim, fontFamily: 'monospace', fontSize: 12 },
    });
    hint.position.set(20, 48);
    ui.addChild(hint);

    let flash = 0;
    const interact = () => {
      flash = 1;
      useGame.getState().openLevel('1-1');
    };

    // --- input ---
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    const onTap = (e: { global: { x: number; y: number } }) => {
      const onHotspot =
        Math.hypot(e.global.x - hotspot.x, e.global.y - hotspot.y) < hotspot.r;
      const playerNear =
        Math.hypot(player.position.x - hotspot.x, player.position.y - hotspot.y) <
        hotspot.r;
      if (onHotspot && playerNear) {
        interact();
        return;
      }
      // walk toward the tap (or toward the terminal if its node was clicked)
      const dest = onHotspot ? { x: hotspot.x, y: hotspot.y + 40 } : e.global;
      const p = clampFloor(dest.x, dest.y);
      player.walkTo(p.x, p.y);
    };
    app.stage.on('pointertap', onTap);
    cleanups.push(() => app.stage.off('pointertap', onTap));

    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key);
      if (e.key === 'e' || e.key === 'E') {
        const near = Math.hypot(
          player.position.x - hotspot.x,
          player.position.y - hotspot.y,
        ) < hotspot.r;
        if (near) interact();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    cleanups.push(() => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    });

    const onResize = () => layout();
    app.renderer.on('resize', onResize);
    cleanups.push(() => app.renderer.off('resize', onResize));

    // --- main loop ---
    const tick = (ticker: { deltaTime: number }) => {
      const dt = ticker.deltaTime;

      // keyboard nudge
      let kdx = 0;
      let kdy = 0;
      if (keys.has('ArrowLeft')) kdx -= 1;
      if (keys.has('ArrowRight')) kdx += 1;
      if (keys.has('ArrowUp')) kdy -= 1;
      if (keys.has('ArrowDown')) kdy += 1;
      if (kdx || kdy) {
        const p = clampFloor(
          player.position.x + kdx * 6,
          player.position.y + kdy * 6,
        );
        player.walkTo(p.x, p.y);
      }

      player.depthScale = depthAt(player.position.y);
      player.update(dt);
      player.view.zIndex = player.position.y;

      // companion floats beside the player, on the trailing side, and turns
      // with the intern (facing tied to the player, not its own drift)
      const facing = player.isFacingRight;
      companion.update(
        dt,
        player.position.x + (facing ? 70 : -70),
        player.position.y - 150,
        facing,
      );
      companion.view.zIndex = player.position.y - 1;

      // hotspot ring pulse + proximity prompt
      const near =
        Math.hypot(player.position.x - hotspot.x, player.position.y - hotspot.y) <
        hotspot.r;
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 380);
      ring.clear();
      ring
        .ellipse(hotspot.x, hotspot.y, hotspot.r * 0.7, hotspot.r * 0.34)
        .stroke({
          color: hexToPixi(near ? colors.amber : colors.morpho),
          width: 2,
          alpha: 0.4 + pulse * 0.5,
        });
      if (flash > 0) {
        ring
          .ellipse(hotspot.x, hotspot.y, hotspot.r * 0.7, hotspot.r * 0.34)
          .fill({ color: hexToPixi(colors.amber), alpha: flash * 0.4 });
        flash = Math.max(0, flash - 0.04 * dt);
      }
      prompt.visible = near;
      if (near) prompt.position.set(hotspot.x - prompt.width / 2, hotspot.y - 80);
    };
    app.ticker.add(tick);
    cleanups.push(() => app.ticker.remove(tick));
    cleanups.push(() => {
      player.destroy();
      companion.destroy();
      bg.destroy();
      world.destroy({ children: true });
      fx.destroy({ children: true });
      ui.destroy({ children: true });
    });
  })();

  return () => {
    disposed = true;
    for (const c of cleanups) c();
  };
}
