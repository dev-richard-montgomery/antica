import { canvas, equipSlots, inventory, state, visibleArea } from './CONST.js';
import { player } from './classes/Player.js';
import { mapArea } from './classes/MapArea.js';
import { items } from './classes/Items.js';
import { ui } from './classes/UserInterface.js';
import { splash } from './classes/Animations.js';
import { 
  attemptFishing, 
  clearHoverStates,
  drawInventory,
  handleInventory,
  isCursorOverItem,
  isStackableItemInInventory,
  moveToEquip, 
  moveToInventory,
  moveToVisibleArea, 
  updateItemHoverState, 
} from './utils/utils.js';

export const handleMouseMove = (e) => {
  const { offsetX, offsetY } = e;

  // Fishing mode overrides everything
  if (player.isFishing) {
    canvas.style.cursor = 'crosshair';
    return;
  };

  // UI cursor override
  const uiCursor = ui.handleUiStates(e);
  if (uiCursor) {
    canvas.style.cursor = uiCursor;
    return;
  };

  // Held item
  if (state.heldItem) {
    canvas.style.cursor = "grabbing";
    return;
  };

  // Hover over item
  if (updateItemHoverState(offsetX, offsetY)) {
    return;
  };

  // Default cursor
  canvas.style.cursor = "pointer";
};

export const handleMouseDown = (e) => {
  if (e.button !== 0) return; // Only handle left-click

  const { offsetX, offsetY } = e;
  clearHoverStates();
  updateItemHoverState(offsetX, offsetY);

  const pixels = 64;
  const playerLocation = player.worldPosition;

  const newFrameX = playerLocation.x + Math.floor((offsetX - 384) / pixels);
  const newFrameY = playerLocation.y + Math.floor((offsetY - 320) / pixels);
  const isWaterTile = items.checkTileCollision(mapArea.waterTiles, newFrameX, newFrameY);

  const drawX = (newFrameX - playerLocation.x) * pixels + 384;
  const drawY = (newFrameY - playerLocation.y) * pixels + 320;

  const hoveredItem = items.allItems.find(item => item.hover);
  const isShift = e.shiftKey;

  // Shift + Left Click = Uncombine
  if (hoveredItem && isShift) {
    hoveredItem.hover = false;
    items.uncombineItems(hoveredItem);
    canvas.style.cursor = "grabbing";
    return;
  };

  // Pick up item
  if (hoveredItem && !state.heldItem) {
    hoveredItem.hover = false;
    state.lastValidPosition = { ...hoveredItem.drawPosition };
    state.heldItem = hoveredItem;
    canvas.style.cursor = "grabbing";
  };

  // Fishing logic
  if (player.isFishing) {
    if (isWaterTile) {
      attemptFishing();
      splash.start(drawX, drawY);
    }
    player.isFishing = false;
    canvas.style.cursor = 'pointer';
  };
};

export const handleMouseUp = (e) => {
  if (!state.heldItem) return;

  const { offsetX, offsetY } = e;
  const pixels = 64;
  const playerLocation = player.worldPosition;

  // Calculate world frame and draw position
  const newFrameX = playerLocation.x + Math.floor((offsetX - 384) / pixels);
  const newFrameY = playerLocation.y + Math.floor((offsetY - 320) / pixels);
  const drawX = (newFrameX - playerLocation.x) * pixels + 384;
  const drawY = (newFrameY - playerLocation.y) * pixels + 320;

  // Location checks
  const inVisibleArea = offsetX >= 0 && offsetX < 832 && offsetY >= 0 && offsetY < 704;

  const inEquipSlot = Object.keys(equipSlots).find(slot => {
    const { x, y } = equipSlots[slot];
    return offsetX >= x && offsetX < x + 64 && offsetY >= y && offsetY < y + 64;
  });

  const inFirstInventory = offsetX >= visibleArea.width &&
    offsetX < visibleArea.width + 192 &&
    offsetY >= inventory.one.start + 32 &&
    offsetY < inventory.one.start + 32 + inventory.one.size;

  const inSecondInventory = offsetX >= visibleArea.width &&
  offsetX < visibleArea.width + 192 &&
  offsetY >= inventory.two.start + 32 &&
  offsetY < inventory.two.start + 32 + inventory.two.size;

  const isBoundaryTile = items.checkTileCollision(mapArea.boundaryTiles, newFrameX, newFrameY);
  const isWaterTile = items.checkTileCollision(mapArea.waterTiles, newFrameX, newFrameY);

  // 🌟 Handle equip
  if (ui.state.activeToggle === 'inventory' && inEquipSlot) {
    moveToEquip(state.heldItem, inEquipSlot);

  // 🎒 Handle first inventory slot
  } else if ((inventory.one.open && !inventory.two.open) || (inFirstInventory && inventory.one.open)) {
    const stackableItem = items.allItems.find(item =>
      item !== state.heldItem &&
      isStackableItemInInventory(item, state.heldItem, offsetX, offsetY)
    );

    if (stackableItem) {
      items.combineItems(stackableItem, state.heldItem);
    } else {
      moveToInventory(state.heldItem, inventory.one.item);
    }

  // 🎒 Handle second inventory slot
  } else if (inSecondInventory && inventory.two.open) {
    const stackableItem = items.allItems.find(item =>
      item !== state.heldItem &&
      isStackableItemInInventory(item, state.heldItem, offsetX, offsetY)
    );

    if (stackableItem) {
      items.combineItems(stackableItem, state.heldItem);
    } else {
      moveToInventory(state.heldItem, inventory.two.item);
    }

  // 🌊 Handle dropping in the world
  } else if (inVisibleArea) {
    if (isWaterTile) {
      console.log(`Dropped ${state.heldItem.name} in water.`);
      splash.start(drawX, drawY);
      items.deleteItem(state.heldItem);
    } else if (isBoundaryTile) {
      items.resetItemPosition(state.heldItem, state.lastValidPosition);
    } else {
      moveToVisibleArea(state.heldItem, newFrameX, newFrameY);
    }
  }

  // Reset
  state.heldItem = null;
  canvas.style.cursor = "pointer";
};

export const handleInventoryArrowClick = (offsetX, offsetY) => {
  const arrows = ui.state.inventoryArrows;

  const clicked = (arrow) =>
    offsetX >= arrow.x &&
    offsetX < arrow.x + arrow.width &&
    offsetY >= arrow.y &&
    offsetY < arrow.y + arrow.height;

  // Primary inventory
  if (arrows.primary.up && clicked(arrows.primary.up)) {
    inventory.one.scroll = Math.max(0, inventory.one.scroll - 1);
    drawInventory();
    return true;
  }
  if (arrows.primary.down && clicked(arrows.primary.down)) {
    const maxScroll = Math.ceil(inventory.one.item.stats.slots / 4) - (inventory.two.open ? 5 : 11);
    inventory.one.scroll = Math.min(maxScroll, inventory.one.scroll + 1);
    drawInventory();
    return true;
  }

  // Secondary inventory
  if (arrows.secondary.up && clicked(arrows.secondary.up)) {
    inventory.two.scroll = Math.max(0, inventory.two.scroll - 1);
    drawInventory();
    return true;
  }
  if (arrows.secondary.down && clicked(arrows.secondary.down)) {
    const maxScroll = Math.ceil(inventory.two.item.stats.slots / 4) - 5;
    inventory.two.scroll = Math.min(maxScroll, inventory.two.scroll + 1);
    drawInventory();
    return true;
  }

  return false;
};

export const handleRightClick = (e) => {
  e.preventDefault(); // Prevents the default right-click context menu

  const { offsetX, offsetY } = e;
  
  // top item
  let item = null;
  for (let i = items.allItems.length - 1; i >= 0; i--) {
    if (isCursorOverItem(items.allItems[i], offsetX, offsetY)) {
      item = items.allItems[i];
      break;
    };
  };

  // player fishing state
  if (item && item === player.equipped.mainhand && player.equipped.mainhand?.tool === 'fishing') {
    player.isFishing = true;
    canvas.style.cursor = "crosshair";
  };

  if (!item || !item.contents) return; // Only proceed if the item has a 'content' property
  
  // handles inventory state
  if (ui.state.activeToggle === 'inventory') {
    handleInventory(item);
  };
};