import { resources } from '../utils/resources.js';
import { chat, ctx, game, movement, selected, sprites, spriteTabs, visibleArea } from '../CONST.js';
import { spriteManager } from '../components/create-player.js';
import { mapArea } from './MapArea.js'; 
import { containerOutOfRange, generateHexId, getBagCapacity, showCenterMessage, updateCursorAfterMove } from '../utils/utils.js';
import { getNpcList } from './NPCManager.js';
import { addMessage } from '../components/chatbox.js';

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
    this.currentModifiers = { health: 0, magic: 0, capacity: 0, offense: 0, defense: 0, speed: 0 };
    this.baseStats = { health: 0, magic: 0, capacity: 0, offense: 0, defense: 0, speed: 0 };
    this.state = { health: 0, magic: 0, capacity: 0, offense: 0, defense: 0, speed: 0 };
    this.speed = 0.5;
    this.drawTo = { 
      x: (visibleArea.width / 2) - (this.pixels / 2 + this.pixels),
      y: (visibleArea.height / 2) - (this.pixels / 2 + this.pixels)
    };
    this.isFishing = false;
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

  // checks for valid spaces
  isNpcAtPosition(targetX, targetY) {
    return npcList.some(npc => npc.drawPosition.x === targetX && npc.drawPosition.y === targetY);
  };

  canMove (boundaryTiles, newX, newY) {
    return !boundaryTiles.some(boundary => 
      newX === boundary.dx && newY === boundary.dy
    );
  };
  
  // player move
  playerMove(e) {
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
  
    containerOutOfRange(); // this function checks if player stepped away from open container
    updateCursorAfterMove(movement.lastMouseX, movement.lastMouseY); // Simulate mouse movement to update cursor after movement
  
    this.cooldown = true;
    setTimeout(() => this.cooldown = false, this.speed * 1000);
  };

  applyDamage(amount) {
    if (this.state.health > amount) {
      this.state.health = Math.max(0, this.state.health - amount);
    } else {
      this.state.health = 0;
      showCenterMessage("You are dead.");
    };
  };

  useMagic(cost) {
    if (this.state.magic >= cost) {
      this.state.magic = Math.max(0, this.state.magic - cost);
    } else {
      addMessage("Magic","Insufficient.");
    };
  };
  
  // stat management
  manageModifiers() {
    // Initialize modifiers
    const updatedModifiers = {
      health: 0,
      magic: 0,
      capacity: 0,
      offense: 0,
      defense: 0,
      speed: 0
    };
  
    // Loop through equipped items and sum up their modifiers
    for (const slot in this.equipped) {
      const item = this.equipped[slot];
      if (!item || !item.stats) continue;
  
      for (const stat in item.stats) {
        if (updatedModifiers.hasOwnProperty(stat)) {
          updatedModifiers[stat] += item.stats[stat];
        };
      };
    };

    // Apply difference to player.state
    for (const stat in updatedModifiers) {
      const prev = this.currentModifiers[stat] || 0;
      const next = updatedModifiers[stat] || 0;
      const delta = next - prev;

      if (this.state.hasOwnProperty(stat)) {
        if (stat === "capacity" && this.state[stat] + delta > this.baseStats[stat]) {
          addMessage("Capacity", "Insufficient.");
        } else {
          this.state[stat] += delta;
        };
      };
    };
    
    this.currentModifiers = updatedModifiers;

    const capacity = getBagCapacity(this.equipped.back);
    if (this.state.capacity + capacity <= this.baseStats.capacity) {
      // this.state.capacity += capacity;
      this.currentModifiers.capacity += capacity;
    };
  };
};

export const player = new Player();