import { generateHexId } from '../utils/utils.js';
import { resources } from '../utils/resources.js';
import { player } from './Player.js';
import { ctx } from '../CONST.js';

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

  createItem(name, category = 'world', worldPosition = null) {
    const baseItem = resources.itemData.items.find(it => it.name === name);
    if (!baseItem) {
        console.error(`Item "${name}" not found in itemData.`);
        return null;
    };

    const newItem = {
        ...baseItem,
        id: generateHexId(),
        category,
        worldPosition,
        hover: false,
        held: false
    };

    this.allItems.push(newItem);
    return newItem;
  };

  updateItemDrawPosition(item) {
    if (!item || item.worldPosition === null) return;
  
    const playerLocation = player.worldPosition;
    const pixels = 64;
  
    item.drawPosition.x = (item.worldPosition.x - playerLocation.x) * pixels + 384;
    item.drawPosition.y = (item.worldPosition.y - playerLocation.y) * pixels + 320;
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
  };
};

export const items = new Items();