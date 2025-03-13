import { visibleMap } from '../CONST';

export class Player {
  constructor() {
    this.image = new Image();
    this.image.src = '../assets/sprites/player-assets.png';
    this.pixels = 64;
    this.direction = { x: 0, y: 128 };
    this.cooldown = false;
    this.drawTo = { 
      x: (visibleMap.width / 2) - (this.pixels / 2 + this.pixels),
      y: (visibleMap.height / 2) - (this.pixels / 2 + this.pixels)
    };
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load player image.'));
    });
  };

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.direction.x,
      this.direction.y,
      this.pixels + this.pixels,
      this.pixels + this.pixels,
      this.drawTo.x,
      this.drawTo.y,
      this.pixels + this.pixels,
      this.pixels + this.pixels
    );
  };
};