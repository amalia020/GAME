/**
 * MORPHO's butterfly-drone companion — a hovering follower that eases toward a
 * target offset beside the player, bobs in the air, banks slightly when moving,
 * and faces the player's travel direction. (Design doc: the Floor-4 agent /
 * MORPHO drone hovers beside the avatar.)
 */
import { Container, Sprite, Texture } from 'pixi.js';

export class Companion {
  readonly view: Container;
  private sprite: Sprite;
  private x: number;
  private y: number;
  private t = 0;

  constructor(texture: Texture, opts: { targetHeight: number; x: number; y: number }) {
    this.view = new Container();
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5, 0.5);
    const s = opts.targetHeight / texture.height;
    this.sprite.scale.set(s);
    this.view.addChild(this.sprite);
    this.x = opts.x;
    this.y = opts.y;
  }

  /**
   * Follow a point beside the player. `facingRight` is the PLAYER's facing, so
   * MORPHO turns with the intern instead of drifting on its own.
   */
  update(dt: number, followX: number, followY: number, facingRight: boolean) {
    this.t += 0.06 * dt;
    const ease = 0.08 * dt;
    const prevX = this.x;
    this.x += (followX - this.x) * ease;
    this.y += (followY - this.y) * ease;

    const hover = Math.sin(this.t) * 5;
    const bank = (this.x - prevX) * 0.04; // tilt into motion
    // MORPHO's source art faces the opposite way, so invert to match the intern
    this.sprite.scale.x = Math.abs(this.sprite.scale.x) * (facingRight ? -1 : 1);
    this.view.position.set(Math.round(this.x), Math.round(this.y + hover));
    this.sprite.rotation = bank;
  }

  destroy() {
    this.view.destroy({ children: true });
  }
}
