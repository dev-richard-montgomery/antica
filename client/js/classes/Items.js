import { 
  findItemContainer, 
  findTopMostStackableItemAtPosition, 
  generateHexId, 
  isInEquipArea, 
  isInInventoryArea, 
  isInRenderArea, 
  showCustomPrompt,
  updatePlayerCapacity 
} from '../utils/utils.js';
import { resources } from '../utils/resources.js';
import { player } from './Player.js';
import { ui } from './UserInterface.js';
import { ctx, inventory, state } from '../CONST.js';

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
  
    if (inventory.one.open && inventory.one.item?.contents.includes(item2)) {
      const index = inventory.one.item.contents.findIndex(curr => curr.id === item2.id);
      if(index > -1) {
        inventory.one.item.contents.splice(index, 1);
      };  
    } else if (inventory.two.open && inventory.two.item?.contents.includes(item2)) {
      const index = inventory.two.item.contents.findIndex(curr => curr.id === item2.id);
      if(index > -1) {
        inventory.two.item.contents.splice(index, 1);
      };  
    };

    this.deleteItemFromAllItems(item2);
    updatePlayerCapacity();
    return true;
  };

  uncombineItems(item) {
    if (!item || !item.stats?.size || item.stats.size <= 1) return false;
  
    showCustomPrompt(`How many ${item.name}s do you want to separate? (1 - ${item.stats.size - 1})`, (amount) => {
      if (isNaN(amount) || amount <= 0 || amount >= item.stats.size) {
        alert("Invalid amount.");
        return false;
      };

      // Reduce original item's size and weight
      item.stats.size -= amount;
      const weightPerUnit = item.stats.weight / (item.stats.size + amount); // total weight before reduction
      item.stats.weight = weightPerUnit * item.stats.size;
    
      // Create new item with split amount and weight
      const newItem = this.createItem(item.name);
      newItem.stats.size = amount;
      newItem.stats.weight = weightPerUnit * amount;
      state.heldItem = newItem;
      updatePlayerCapacity();
      return true;
    });  
  };

  deleteItemFromAllItems(item) {
    const index = this.allItems.findIndex(curr => curr.id === item.id);

    if(index > -1) {
      this.allItems.splice(index, 1);
    };
  };

  removeItemFromAnywhere(item) {
    if (!item) return;
  
    // Unequip if it's currently equipped
    const equippedSlot = Object.keys(player.equipped).find(slot => {
      return player.equipped[slot]?.id === item.id;
    });
  
    if (equippedSlot) {
      player.equipped[equippedSlot] = null;
      console.log(`Unequipped ${item.name} from ${equippedSlot}.`);
    }
  
    // Remove from any inventory container it's in
    const container = findItemContainer(item, items.allItems);
    if (container?.contents) {
      const index = container.contents.findIndex(i => i.id === item.id);
      if (index > -1) {
        container.contents.splice(index, 1);
        console.log(`Removed ${item.name} from container.`);
      }
    }
    updatePlayerCapacity();
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
  
    const drawStackNumber = (x, y, number, fontSize, color) => {
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText(number, x, y);
    };
  
    if (item?.stats?.size > 1) {
      if (item.category === 'world') {
        drawStackNumber(item.drawPosition.x + 60, item.drawPosition.y + 60, item.stats.size, 10, "#fff");
      } else if (item.category === 'inventory') {
        drawStackNumber(item.drawPosition.x + 28, item.drawPosition.y + 28, item.stats.size, 10, "black");
      };
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