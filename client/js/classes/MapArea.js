import { resources } from '../utils/resources.js';
import { player } from './Player.js';
import { ctx, visibleArea, uppermostTileIDs, waterTileIDs } from '../CONST.js'; 

class MapArea {
  constructor() {
    this.image = new Image();
    this.image.src = '../../client/assets/sprites/map-assets.png';
    this.mapSize = { row: 200, col: 200 };
    this.tileSize = 64;
    this.boundaryTiles = [];
    this.waterTiles = [];
    this.uppermostTiles = [];
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load area image.'));
    });
  };

  drawTile(image, { sx, sy, dx, dy }) {
    if (!ctx) {
      console.error('Canvas context (ctx) is not defined.');
      return;
    }
    ctx.drawImage(image, sx, sy, this.tileSize, this.tileSize, dx, dy, this.tileSize, this.tileSize);
  };
  
  drawArea(currentMap = resources.mapData?.isLoaded ? resources.mapData.genus01?.layers : []) {
    this.boundaryTiles = [];
    this.waterTiles = [];
    this.uppermostTiles = [];
  
    // Calculate starting tile based on the player position
    const pos = player.getWorldPosition();
    if (!pos) return;
    
    const startingTile = {
      x: pos.x - Math.floor(visibleArea.frames.col / 2),
      y: pos.y - Math.floor(visibleArea.frames.row / 2),
    };
    
    // Generate the visible map
    const visibleMap = currentMap.map(layer => {
      let tiles = [];
      let currentTileID = this.mapSize.col * (startingTile.y - 1) + startingTile.x;
      for (let i = 0; i < visibleArea.frames.row; i++) {
        tiles.push(...layer.data.slice(currentTileID, currentTileID + visibleArea.frames.col));
        currentTileID += this.mapSize.col;
      };
      return tiles;
    });
  
    // Draw tiles
    visibleMap.forEach(layer => {
      layer.forEach((tileID, i) => {
        if (tileID > 0) {
          const sx = Math.floor((tileID - 1) % 20) * this.tileSize; // Source x on spritesheet
          const sy = Math.floor((tileID - 1) / 20) * this.tileSize; // Source y on spritesheet
          const dx = Math.floor(i % visibleArea.frames.col) * this.tileSize; // Destination x on canvas
          const dy = Math.floor(i / visibleArea.frames.col) * this.tileSize; // Destination y on canvas
          const tileData = { sx, sy, dx, dy };

          if (tileID === 10 || tileID === 11) {
            this.boundaryTiles.push({ dx, dy });
          } else if (tileID > 0 && uppermostTileIDs.includes(tileID - 1)) {
            this.uppermostTiles.push(tileData);
          } else {
            this.drawTile(this.image, tileData);
            if (tileID > 0 && waterTileIDs.includes(tileID - 1)) {
              this.waterTiles.push(tileData);
            }
          }
        }
      });
    });
  };

  drawUpperMostTiles() {
    this.uppermostTiles.forEach(tile => this.drawTile(this.image, tile));
  };
};

export const mapArea = new MapArea();