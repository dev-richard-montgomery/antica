import { resources } from '../utils/resources.js';
import { ctx, visibleArea } from '../CONST.js';
import { generateHexId } from '../utils/utils.js';

class Player {
  constructor() {
    this.image = new Image();
    this.image.src = '../../client/assets/sprites/player-assets.png';
    this.pixels = 64;
    this.direction = { x: 0, y: 128 };
    this.cooldown = false;
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
      Object.assign(this, existingPlayer); // Assign existing player properties to `this`
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

    Object.assign(this, newPlayer);
  };

  draw() {
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

export const player = new Player();