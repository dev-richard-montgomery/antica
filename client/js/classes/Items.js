import { findTopMostStackableItemAtPosition, generateHexId, isInEquipArea, isInInventoryArea, isInRenderArea } from '../utils/utils.js';
import { resources } from '../utils/resources.js';
import { player } from './Player.js';
import { ui } from './UserInterface.js';
import { ctx, state } from '../CONST.js';


class Items {
  constructor() {
    this.image = new Image();
    this.image.src = './assets/sprites/item-assets.png';
    this.allItems = [];
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load area image.'));
    });
  };

  initAllItems() {
    if (!Array.isArray(resources.itemData.itemsInGame)) {
      console.error("Error: itemsInGame is not an array.");
      return;
    };
  
    this.allItems = [...resources.itemData.itemsInGame];
  };

  createItem(name, worldPosition = null, category = 'world') {
    const baseItem = resources.itemData.items.find(it => it.name === name);
    if (!baseItem) {
      console.error(`Item "${name}" not found in itemData.`);
      return null;
    };
  
    const newItem = structuredClone(baseItem);
    newItem.id = generateHexId();
    newItem.category = category;
    newItem.worldPosition = worldPosition;
    newItem.drawPosition = { x: 0, y: 0 };
    newItem.hover = false;
    newItem.held = false;
  
    this.updateItemDrawPosition(newItem);
  
    // Attempt auto-stack if placing in world
    if (worldPosition) {
      const topItem = findTopMostStackableItemAtPosition(newItem);
      if (topItem && this.combineItems(topItem, newItem)) {
        return topItem;
      };
    };
  
    this.allItems.push(newItem);
    return newItem;
  };

  combineItems(item1, item2) {
    if (
      !item1 || !item2 ||
      item1.id === item2.id ||
      item1.name !== item2.name ||
      !item1.stats?.size || !item2.stats?.size
    ) return false;
  
    item1.stats.size += item2.stats.size;
    item1.stats.weight += item2.stats.weight;
  
    this.deleteItem(item2);
    return true;
  };

  deleteItem(item) {
    const index = this.allItems.findIndex(curr => curr.id === item.id);

    if(index > -1) {
      this.allItems.splice(index, 1);
    };
  };

  updateItemDrawPosition(item) {
    if (!item || item.worldPosition === null ) return;
  
    const playerLocation = player.worldPosition;
    const pixels = 64;
  
    item.drawPosition.x = (item.worldPosition.x - playerLocation.x) * pixels + 384;
    item.drawPosition.y = (item.worldPosition.y - playerLocation.y) * pixels + 320;
  };

  resetItemPosition(item, lastValidPosition = state.lastValidPosition) {
    if (!item || !lastValidPosition) return;
  
    const { x, y } = lastValidPosition;
  
    item.drawPosition.x = x;
    item.drawPosition.y = y;
    item.held = false;
    item.hover = false;
  
    const index = this.allItems.findIndex(curr => curr.id === item.id);
  
    this.allItems.splice(index, 1);
    this.allItems.push(item);
  };

  checkTileCollision(tileArray, newX, newY) {
    const playerLocation = player.worldPosition;
    const pixels = 64;
    const x = (newX - playerLocation.x) * pixels + 384;
    const y = (newY - playerLocation.y) * pixels + 320;
  
    const collision = tileArray.some(tile => {
      const match = x === tile.dx && y === tile.dy;
      return match;
    });
  
    return collision; // Returns true if there's a collision
  };

  draw(item) {
    if (!item) return;
    if (item.worldPosition) this.updateItemDrawPosition(item);
    
    const { spritePosition, drawPosition } = item;
    const size = 64;
    
    ctx.drawImage(
      items.image,
      spritePosition.x,
      spritePosition.y,
      size,
      size,
      drawPosition.x,
      drawPosition.y,
      size,
      size
    );

    if (item?.stats?.size > 1) {
      ctx.font = "10px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "right";
      ctx.fillText(item.stats.size, item.drawPosition.x + 56, item.drawPosition.y + 56);
    };
  };

  drawAllVisibleItems() {
    this.allItems.forEach(item => {
      if (isInRenderArea(item) && item.category === 'world') {
        this.draw(item);
      };

      if (isInEquipArea(item) && item.category === 'equipped' && ui.state.activeToggle === 'inventory') {
        this.draw(item);
      };

      if (isInInventoryArea(item) && item.category === 'inventory' && ui.state.activeToggle === 'inventory') {
        this.draw(item);
      }
    });    
  };
};

export const items = new Items();