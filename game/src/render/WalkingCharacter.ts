/**
 * A character that walks around the room with procedural "alive" animation,
 * built from a SINGLE front-facing pose (your generated avatars). No walk-cycle
 * frames required: we sell motion with bob + squash/stretch + sway + a dynamic
 * ground shadow, and flip horizontally to face left/right. Reads as cozy,
 * Pokémon-style movement. (Real 4-direction frames can drop in later.)
 */
import { Container, Graphics, Sprite, Texture } from 'pixi.js';

const WALK_SPEED = 2.6; // px per frame-tick at 60fps baseline
const ARRIVE_DIST = 3;
const BOB_PX = 7;
const STEP_RATE = 0.28; // walk-cycle phase advance per tick

export class WalkingCharacter {
  readonly view: Container;
  private sprite: Sprite;
  private shadow: Graphics;
  private baseScale: number;
  private feetX: number;
  private feetY: number;
  private targetX: number;
  private targetY: number;
  private facingRight = true;
  private phase = 0;
  private idleT = 0;
  private moving = false;

  /** depthScale lets the room shrink the avatar with distance (fake iso depth). */
  depthScale = 1;

  constructor(texture: Texture, opts: { targetHeight: number; x: number; y: number }) {
    this.view = new Container();

    this.shadow = new Graphics();
    this.view.addChild(this.shadow);

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5, 1); // feet at the container origin
    this.baseScale = opts.targetHeight / texture.height;
    this.view.addChild(this.sprite);

    this.feetX = this.targetX = opts.x;
    this.feetY = this.targetY = opts.y;
    this.view.position.set(opts.x, opts.y);
  }

  get position() {
    return { x: this.feetX, y: this.feetY };
  }

  get isFacingRight() {
    return this.facingRight;
  }

  walkTo(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
  }

  /** Nudge by a velocity vector (arrow keys). */
  nudge(dx: number, dy: number) {
    this.targetX = this.feetX + dx;
    this.targetY = this.feetY + dy;
  }

  update(dt: number) {
    const dx = this.targetX - this.feetX;
    const dy = this.targetY - this.feetY;
    const dist = Math.hypot(dx, dy);
    this.moving = dist > ARRIVE_DIST;

    if (this.moving) {
      const step = Math.min(WALK_SPEED * dt, dist);
      this.feetX += (dx / dist) * step;
      this.feetY += (dy / dist) * step;
      if (Math.abs(dx) > 0.5) this.facingRight = dx > 0;
      this.phase += STEP_RATE * dt;
    } else {
      this.idleT += 0.05 * dt;
    }

    this.view.position.set(Math.round(this.feetX), Math.round(this.feetY));

    // --- procedural pose ---
    const s = this.baseScale * this.depthScale;
    let bob = 0;
    let squashY = 0;
    let sway = 0;

    if (this.moving) {
      const w = Math.sin(this.phase);
      bob = Math.abs(w) * BOB_PX; // two footfalls per cycle
      squashY = (Math.abs(w) - 0.5) * 0.08; // stretch up, squash on plant
      sway = Math.sin(this.phase * 0.5) * 0.035; // gentle waddle
    } else {
      bob = (Math.sin(this.idleT) * 0.5 + 0.5) * 1.5; // soft breathing
      squashY = Math.sin(this.idleT) * 0.012;
    }

    this.sprite.y = -bob;
    this.sprite.rotation = sway;
    this.sprite.scale.set(
      s * (this.facingRight ? 1 : -1) * (1 - squashY * 0.6),
      s * (1 + squashY),
    );

    // --- dynamic shadow: shrinks + fades as the body lifts ---
    const lift = bob / BOB_PX; // 0 grounded .. 1 peak
    const shW = this.sprite.texture.width * s * 0.42 * (1 - lift * 0.25);
    this.shadow.clear();
    this.shadow
      .ellipse(0, -2, shW, shW * 0.32)
      .fill({ color: 0x000000, alpha: 0.38 * (1 - lift * 0.35) });
  }

  destroy() {
    this.view.destroy({ children: true });
  }
}
