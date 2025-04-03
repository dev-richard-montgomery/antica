import { resources } from '../utils/resources.js';
import { chat, ctx, game, selected, sprites, spriteTabs, visibleArea } from '../CONST.js';
import { spriteManager } from '../components/create-player.js';
import { mapArea } from './MapArea.js'; 
import { generateHexId } from '../utils/utils.js';
import { getNpcList } from './NPCManager.js';

// get npc list
const npcList = getNpcList();

class Player {
  constructor() {
    this.image = new Image();
    this.image.src = './assets/sprites/player-assets.png';
    this.pixels = 64;
    this.currentDirection = 0;
    this.worldPosition = { x: 155, y: 189 };
    this.cooldown = false;
    this.speed = 0.5;
    this.drawTo = { 
      x: (visibleArea.width / 2) - (this.pixels / 2 + this.pixels),
      y: (visibleArea.height / 2) - (this.pixels / 2 + this.pixels)
    };
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load player image.'));
    });
  };

  getWorldPosition() {
    return this.worldPosition;
  };

  playerExists(playername) {
    return Array.isArray(resources.playerData.playerlist) &&
           resources.playerData.playerlist.some(player => player.name === playername);
  };

  createPlayer(playername) {
    if (!Array.isArray(resources.playerData.playerlist)) {
      resources.playerData.playerlist = [];
    };

    let existingPlayer = resources.playerData.playerlist.find(player => player.name === playername);
    if (existingPlayer) {
      console.log(`Logged in as ${playername}.`);
      Object.assign(this, existingPlayer);
      return;
    };

    let newId;
    do {
      newId = generateHexId();
    } while (resources.playerData.playerlist.some(player => player.id === newId));

    const newPlayer = {
      id: newId,
      name: playername,
      ...resources.playerData.newplayer
    };

    resources.playerData.playerlist.push(newPlayer);
    console.log(`New player ${playername} added.`);
    console.log(`Logged in as ${playername}.`);
    
    Object.assign(this, newPlayer);
  };

  draw() {
    spriteTabs.forEach(tab => {
      const sprite = spriteManager.getSprite(tab);
      if (sprite) {
        ctx.drawImage(
          sprite,
          this.currentDirection * sprites.frames.size,
          selected[tab] * sprites.frames.size,
          sprites.frames.size,
          sprites.frames.size,
          this.drawTo.x,
          this.drawTo.y,
          sprites.frames.size,
          sprites.frames.size
        );
      };
    });
  };

  isNpcAtPosition(targetX, targetY) {
    return npcList.some(npc => npc.drawPosition.x === targetX && npc.drawPosition.y === targetY);
  };

  canMove = (boundaryTiles, newX, newY) => {
    return !boundaryTiles.some(boundary => 
      newX === boundary.dx && newY === boundary.dy
    );
  };
  
  playerMove = e => {
    if (!game.on || chat.on || this.cooldown) return;
  
    const movementOffsets = {
      'w': { x: 0, y: -this.pixels },
      's': { x: 0, y: this.pixels },
      'a': { x: -this.pixels, y: 0 },
      'd': { x: this.pixels, y: 0 }
    };
  
    const direction = {
      'w': 1,
      's': 0,
      'a': 2,
      'd': 3
    };
  
    const key = e.key.toLowerCase();
    if (!movementOffsets[key]) return;
  
    this.currentDirection = direction[key];
  
    if (e.shiftKey) {
      return;
    };
    
    const newX = 384 + movementOffsets[key].x;
    const newY = 320 + movementOffsets[key].y;
    
    if (this.isNpcAtPosition(newX, newY)) return;
  
    if (this.canMove(mapArea.boundaryTiles, newX, newY)) {
      this.worldPosition.x += movementOffsets[key].x / this.pixels;
      this.worldPosition.y += movementOffsets[key].y / this.pixels;
    };
  
    // handleOutOfRange(); // this function checks if inventories or opened items are in range or not
    // updateCursorAfterMove(); // Simulate mouse movement to update cursor after movement
  
    this.cooldown = true;
    setTimeout(() => this.cooldown = false, this.speed * 1000);
  };
};

export const player = new Player();