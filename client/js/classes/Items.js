import { generateHexId, isInEquipArea, isInRenderArea } from '../utils/utils.js';
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

  drawAllVisibleItems() {
    this.allItems.forEach(item => {
      if (isInRenderArea(item) && item.category === 'world') {
        this.draw(item);
      };

      if (isInEquipArea(item) && item.category === 'equipped' && ui.state.activeToggle === 'inventory') {
        this.draw(item);
      };
    });    
  };
};

export const items = new Items();