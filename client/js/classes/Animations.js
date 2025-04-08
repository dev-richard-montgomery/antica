import { ctx, state } from "../CONST.js";

export class Animation {
  constructor({ spritePositions, frameSize = 64, frameDuration = 100 }) {
    this.image = new Image();
    this.image.src = './assets/sprites/animation-assets.png';
    
    this.spritePositions = spritePositions;
    this.frameSize = frameSize;
    this.frameDuration = frameDuration;

    this.currentFrame = 0;
    this.startTime = null;
    this.x = 0;
    this.y = 0;
    this.done = false;
  };

  start(x, y) {
    this.x = x;
    this.y = y;
    this.currentFrame = 0;
    this.startTime = performance.now();
    this.done = false;
    state.activeAnimations.push(this);
  };

  update(now) {
    if (this.done || this.startTime === null) return;

    const elapsed = now - this.startTime;
    this.currentFrame = Math.floor(elapsed / this.frameDuration);

    if (this.currentFrame >= this.spritePositions.length) {
      this.done = true;
    };
  };

  draw() {
    if (this.done || !this.image.complete) return;

    const frame = this.spritePositions[this.currentFrame];
    if (!frame) return;

    ctx.drawImage(
      this.image,
      frame.x, frame.y,
      this.frameSize, this.frameSize,
      this.x, this.y,
      this.frameSize, this.frameSize
    );
  };
};

export const splash = new Animation({
  spritePositions: [{ x: 0, y: 256 }, { x: 64, y: 256 }, { x: 128, y: 256 }, { x: 192, y: 256 }],
  frameSize: 64,
  frameDuration: 100
});