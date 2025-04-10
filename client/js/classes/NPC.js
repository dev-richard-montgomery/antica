import { ctx } from '../CONST.js';
import { player } from './Player.js';
import { addMessage } from '../components/chatbox.js';

export class NPC {
  constructor(name, spritePositions, worldPosition, validMovePositions, responses, speed) {
    this.image = new Image();
    this.image.src = './assets/sprites/player-assets.png';
    this.name = name;
    this.spritePositions = spritePositions;
    this.worldPosition = worldPosition;
    this.validMovePositions = validMovePositions;
    this.responses = responses;
    this.speed = speed;
    this.isMoving = true;
    this.pixels = 64;
    this.direction = this.spritePositions.down;
    this.drawPosition = { x: 0, y: 0 }; // Prevents undefined errors
    this.lastMoveTime = 0; // Initialize timestamp tracking
    this.engagementTimeout = null;
  }

  // draw functions
  draw() {
    if (!this.direction) return; // Prevents errors if direction is missing
    ctx.drawImage(
      this.image,
      this.direction.x,
      this.direction.y,
      this.pixels + this.pixels,
      this.pixels + this.pixels,
      this.drawPosition.x - this.pixels,
      this.drawPosition.y - this.pixels,
      this.pixels + this.pixels,
      this.pixels + this.pixels
    );
  };

  updateDrawPosition() {
    const pixels = 64;
    this.drawPosition.x = (this.worldPosition.x - player.worldPosition.x) * pixels + 384;
    this.drawPosition.y = (this.worldPosition.y - player.worldPosition.y) * pixels + 320;
  };

  isVisibleOnScreen() {
    const visibleXStart = player.worldPosition.x - 6;
    const visibleXEnd = player.worldPosition.x + 6;
    const visibleYStart = player.worldPosition.y - 5;
    const visibleYEnd = player.worldPosition.y + 5;

    return (
      this.worldPosition.x >= visibleXStart &&
      this.worldPosition.x <= visibleXEnd &&
      this.worldPosition.y >= visibleYStart &&
      this.worldPosition.y <= visibleYEnd
    );
  };

  // player interaction
  isPlayerNearby() {
    const distance = Math.abs(this.worldPosition.x - player.worldPosition.x) +
                     Math.abs(this.worldPosition.y - player.worldPosition.y);
    return distance <= 3;
  };

  checkPlayerDistance() {
    if (!this.moving && !this.isPlayerNearby()) {
      this.resumeMovement();
    };
  };

  turnToFacePlayer() {
    if (player.worldPosition.x > this.worldPosition.x) {
      this.direction = this.spritePositions.right;
    } else if (player.worldPosition.x < this.worldPosition.x) {
      this.direction = this.spritePositions.left;
    } else if (player.worldPosition.y > this.worldPosition.y) {
      this.direction = this.spritePositions.down;
    } else {
      this.direction = this.spritePositions.up;
    };
  };

  interact() {
    this.isMoving = false;
    this.turnToFacePlayer();

    this.engagementTimeout = setTimeout(() => {
      this.isMoving = true;
    }, 120000); // 2 minutes
  };

  resumeMovement() {
    this.isMoving = true;
    clearTimeout(this.engagementTimeout);
  };

  // npc movement
  move(currentTime) {
    if (!this.isMoving) return;

    // Only move if enough time has passed
    if (currentTime - this.lastMoveTime < this.speed) return;

    // Update the last move time
    this.lastMoveTime = currentTime;

    const adjacentPositions = this.validMovePositions.filter(pos => 
      Math.abs(pos.x - this.worldPosition.x) + Math.abs(pos.y - this.worldPosition.y) === 1
    );

    if (adjacentPositions.length === 0) return;

    const newPosition = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
    if (newPosition.x === player.worldPosition.x && newPosition.y === player.worldPosition.y) return;

    if (newPosition.x > this.worldPosition.x) {
      this.direction = this.spritePositions.right;
    } else if (newPosition.x < this.worldPosition.x) {
      this.direction = this.spritePositions.left;
    } else if (newPosition.y > this.worldPosition.y) {
      this.direction = this.spritePositions.down;
    } else {
      this.direction = this.spritePositions.up;
    };

    this.worldPosition = newPosition;
    this.updateDrawPosition();
  };
};