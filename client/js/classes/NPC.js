import { ctx } from '../CONST.js';
import { player } from './Player.js';

export class NPC {
  constructor(name, spritePositions, worldPosition, validMovePositions, responses, speed) {
    this.image = new Image();
    this.image.src = './assets/sprites/player-assets.png';
    this.name = name;
    this.spritePositions = spritePositions;
    this.worldPosition = worldPosition;
    this.drawPosition = { x: 0, y: 0 }; // Prevents undefined errors
    this.validMovePositions = validMovePositions;
    this.responses = responses;
    this.isMoving = true;
    this.pixels = 64;

    // Start NPC movement loop
    this.movementInterval = setInterval(() => this.move(), speed);
  }

  draw(direction) {
    if (!direction) return; // Prevents errors if direction is missing
    ctx.drawImage(
      this.image,
      direction.x,
      direction.y,
      this.pixels + this.pixels,
      this.pixels + this.pixels,
      this.drawPosition.x - this.pixels,
      this.drawPosition.y - this.pixels,
      this.pixels + this.pixels,
      this.pixels + this.pixels
    );
  }

  updateDrawPosition() {
    const pixels = 64;
    this.drawPosition.x = (this.worldPosition.x - player.worldPosition.x) * pixels + 384;
    this.drawPosition.y = (this.worldPosition.y - player.worldPosition.y) * pixels + 320;
  }

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
  }

  move() {
    if (!this.isMoving) return;
    
    // Get valid adjacent positions (1 tile away)
    const adjacentPositions = this.validMovePositions.filter(pos => 
      Math.abs(pos.x - this.worldPosition.x) + Math.abs(pos.y - this.worldPosition.y) === 1
    );

    if (adjacentPositions.length === 0) return; // No valid moves

    // Pick a random valid adjacent position
    const newPosition = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];

    // Determine movement direction
    let direction;
    if (newPosition.x > this.worldPosition.x) {
      direction = this.spritePositions.right;
    } else if (newPosition.x < this.worldPosition.x) {
      direction = this.spritePositions.left;
    } else if (newPosition.y > this.worldPosition.y) {
      direction = this.spritePositions.down;
    } else {
      direction = this.spritePositions.up;
    }

    // Update NPC position and sprite
    this.worldPosition = newPosition;
    this.updateDrawPosition();

    // Draw only if the NPC is visible on screen
    if (this.isVisibleOnScreen()) this.draw(direction);
  }
}

const npcList = {
  heremal: {
    name: "Heremal",
    description: "Warpriest",
    spritePositions: { up: { x: 128, y: 0 }, down: { x: 0, y: 0 }, left: { x: 256, y: 0 }, right: { x: 384, y: 0 } },
    worldPosition: { x: 153, y: 187 },
    validMovePositions: [
      { x: 153, y: 187 }, { x: 154, y: 187 }, { x: 155, y: 187 }, { x: 156, y: 187 }, { x: 157, y: 187 }, 
      { x: 153, y: 188 }, { x: 154, y: 188 }, { x: 155, y: 188 }, { x: 156, y: 188 }, { x: 154, y: 188 },
      { x: 153, y: 189 }, { x: 154, y: 189 }, { x: 156, y: 189 }, { x: 157, y: 189 }, 
      { x: 153, y: 190 }, { x: 154, y: 190 }, { x: 155, y: 190 }, { x: 156, y: 190 }, { x: 154, y: 190 },
      { x: 153, y: 191 }, { x: 154, y: 191 }, { x: 155, y: 191 }, { x: 156, y: 191 }, { x: 157, y: 191 }, 
    ],
    responses: {
      greetings: {
        "hi": "Greetings to Genus, Antican.",
        "hello": "Greetings to Genus, Antican.",
        "hey": "Greetings to Genus, Antican.",
      },
      help: {
        "help": "Ass ass titties titties."
      },
      bye: {
        "thanks": "You're welcome.",
        "thx": "Come again.",
        "bye": "Take care.",
        "goodbye": "Safe travels."
      },
    },
    speed: 2000
  }
};

const { heremal } = npcList;
export const warpriest = new NPC(heremal.name, heremal.spritePositions, heremal.worldPosition, heremal.validMovePositions, heremal.responses, heremal.speed);




  // stopMoving() {
  //   this.isMoving = false;
  // }

  // resumeMoving() {
  //   this.isMoving = true;
  // }

  // respondToPlayer(message) {
  //   const response = this.responses[Math.floor(Math.random() * this.responses.length)];
  //   console.log(`${this.name}: ${response}`);
  // }

  // stopAndFace(playerPosition) {
  //   this.isMoving = false;
  //   console.log(`${this.name} turns to face the player at`, playerPosition);
    
  //   // Restart movement after a short delay
  //   setTimeout(() => this.resumeMovement(), 5000);
  // }

  // respondInChat() {
  //   const responses = [
  //     "Hello, traveler!",
  //     "Nice weather today, isn't it?",
  //     "Stay safe out there!",
  //     "Watch your step!"
  //   ];
  //   const response = responses[Math.floor(Math.random() * responses.length)];
    
  //   addMessage(this.name, response); // Assuming you have an addMessage function
  // }


// Check if an NPC is near the player when chat is used
// function checkNPCChatInteraction(playerPosition, message) {
//   npcList.forEach(npc => {
//     const distance = Math.abs(npc.worldPosition.x - playerPosition.x) + 
//                      Math.abs(npc.worldPosition.y - playerPosition.y);

//     if (distance <= 2) { // Within range to hear the player
//       npc.stopAndFace(playerPosition);
//       npc.respondInChat();
//     }
//   });
// }

// Example NPCs