import { canvas, equipSlots, state } from './CONST.js';
import { attemptFishing, clearHoverStates, moveToEquip, moveToVisibleArea, updateItemHoverState } from './utils/utils.js';
import { player } from './classes/Player.js';
import { mapArea } from './classes/MapArea.js';
import { items } from './classes/Items.js';
import { ui } from './classes/UserInterface.js';
import { splash } from './classes/Animations.js';

export const handleMouseMove = (e) => {
  const { offsetX, offsetY } = e;

  const uiCursor = ui.handleUiStates(e); // move this up

  if (player.isFishing) {
    canvas.style.cursor = 'crosshair';
    return;
  } else if (uiCursor) {
    canvas.style.cursor = uiCursor;
    return;
  };

  // Default cursor state
  canvas.style.cursor = "pointer";

  // If an item is held, update its position and cursor state
  if (state.heldItem) {
    canvas.style.cursor = "grabbing";
    return;
  };

  // Update hover states for in-game items
  if (updateItemHoverState(offsetX, offsetY)) return;
};

export const handleMouseDown = (e) => {
  if (e.button !== 0) return; // Left click only

  // Ensure only one hovered item
  clearHoverStates();
  const { offsetX, offsetY } = e;
  updateItemHoverState(offsetX, offsetY);
  
  const playerLocation = player.worldPosition;
  const pixels = 64;
  
  const newFrameX = player.worldPosition.x + Math.floor((offsetX - 384) / pixels);
  const newFrameY = player.worldPosition.y + Math.floor((offsetY - 320) / pixels);
  const isWaterTile = items.checkTileCollision(mapArea.waterTiles, newFrameX, newFrameY);
  const drawX = (newFrameX - playerLocation.x) * pixels + 384;
  const drawY = (newFrameY - playerLocation.y) * pixels + 320;
  
  // Find hovered item to hold
  const hoveredItem = items.allItems.find(item => item.hover);

  // Ensure a valid item is found and prevent holding multiple items
  if (hoveredItem && !state.heldItem) {
    hoveredItem.held = true;
    hoveredItem.hover = false;
    state.lastValidPosition = { ...hoveredItem.drawPosition };
    state.heldItem = hoveredItem;
    canvas.style.cursor = "grabbing";
  };

  // Fishing functions
  if (player.isFishing && e.button === 0) {
    
    // Check if the clicked area is a water tile
    if (isWaterTile) {
      attemptFishing();  // Attempt to fish
      splash.start(drawX, drawY);
    };
    
    // Reset fishing mode and cursor
    player.isFishing = false;
    canvas.style.cursor = 'pointer'; // Reset cursor to default
  }
};

export const handleMouseUp = (e) => {
  if (!state.heldItem) return;

  const { offsetX, offsetY } = e;
  const playerLocation = player.worldPosition;
  const pixels = 64;

  const newFrameX = player.worldPosition.x + Math.floor((offsetX - 384) / 64);
  const newFrameY = player.worldPosition.y + Math.floor((offsetY - 320) / 64);
  const drawX = (newFrameX - playerLocation.x) * pixels + 384;
  const drawY = (newFrameY - playerLocation.y) * pixels + 320;

  // Check valid drop locations
  const inRenderArea = offsetX >= 0 && offsetX < 832 && offsetY >= 0 && offsetY < 704;

  const inEquipSlot = Object.keys(equipSlots).find(slot => {
    const { x, y } = equipSlots[slot];
    return offsetX >= x && offsetX < x + 64 && offsetY >= y && offsetY < y + 64 ? slot : null;
  });

  // const inFirstInventory = 
  //   offsetX >= inventorySlots.primary.slots.x && 
  //   offsetX < inventorySlots.primary.slots.x + inventorySlots.primary.slots.width && 
  //   offsetY >= inventorySlots.primary.slots.y && 
  //   offsetY < inventorySlots.primary.slots.y + inventorySlots.primary.slots.height;

  // const inFirstInventoryExpanded = 
  //   offsetX >= inventorySlots.primary.slots.x && 
  //   offsetX < inventorySlots.primary.slots.x + inventorySlots.primary.slots.width && 
  //   offsetY >= inventorySlots.primary.slots.y && 
  //   offsetY < inventorySlots.primary.slots.expandedHeight;

  // const inSecondInventory = 
  //   offsetX >= inventorySlots.secondary.slots.x && 
  //   offsetX < inventorySlots.secondary.slots.x + inventorySlots.secondary.slots.width && 
  //   offsetY >= inventorySlots.secondary.slots.y && 
  //   offsetY < inventorySlots.secondary.slots.y + inventorySlots.secondary.slots.height;
  
  if (ui.state.activeToggle === 'inventory' && inEquipSlot) {
    moveToEquip(state.heldItem, inEquipSlot);
    player.manageModifiers();
    // } else if ((inFirstInventoryExpanded && inventory.one.open && !inventory.two.open) || (inFirstInventory && inventory.one.open)) {
    //   moveToInventory(heldItem, inventory.one.item);
    //   console.log(heldItem, ' in First Inventory');
    // } else if (inSecondInventory && inventory.two.open) {
    //   moveToInventory(heldItem, inventory.two.item);
    //   console.log(heldItem, ' in Second Inventory');
  } else if (inRenderArea) {
    const isBoundaryTile = items.checkTileCollision(mapArea.boundaryTiles, newFrameX, newFrameY);
    const isWaterTile = items.checkTileCollision(mapArea.waterTiles, newFrameX, newFrameY);

    if (isWaterTile) {
      console.log(`Dropped ${state.heldItem.name} in water.`);
      splash.start(drawX, drawY);
      items.deleteItem(state.heldItem);
      state.heldItem = null;
    } else if (isBoundaryTile) {
      items.resetItemPosition(state.heldItem, state.lastValidPosition);
    } else {
      moveToVisibleArea(state.heldItem, newFrameX, newFrameY);
    };
  } else {
    items.resetItemPosition(state.heldItem, state.lastValidPosition);
  };
  // Handle moving between inventory and equip slots
  // if (heldItem.category === 'inventory' && inEquipSlot) {
  //   moveToEquip(heldItem, inEquipSlot);
  //   console.log(heldItem, ' equipped');
  // };
//   console.log("Mouse Up at:", offsetX, offsetY);
// console.log("Equip Slot Bounds:", equipSlots);
// console.log("inRenderArea:", inRenderArea);
// console.log("inEquipSlot:", inEquipSlot);

  // Clear held state
  state.heldItem = null;
  canvas.style.cursor = "pointer";
};

const handleRightClick = (e) => {
  e.preventDefault(); // Prevents the default right-click context menu

  const { offsetX, offsetY } = e;
  const item = inGameItems.find(item => isCursorOverItem(item, offsetX, offsetY));

  if (!item || !item.contents) return; // Only proceed if the item has a 'content' property
  
  if (uiState === 'inventory') {
    if(isInRangeOfPlayer(item) || player.data.details.equipped.back === item) {
      if (!inventory.one.item) {
        inventory.one.item = item;
        inventory.one.open = true;
        inventory.expanded = true;
      } else if (item !== inventory.one.item && !inventory.two.item) {
        inventory.two.item = item;
        inventory.two.open = true;
        inventory.expanded = false;
      } else if (inventory.one.item === item) {
        inventory.one.item = null;
        inventory.one.open = false;
        inventory.expanded = false;
    
        if (inventory.two.item) {
          inventory.one.item = inventory.two.item;
          inventory.one.open = inventory.two.open;
          inventory.two.item = null;
          inventory.two.open = false;
          inventory.expanded = true;
        }
      } else if (inventory.two.item === item) {
        inventory.two.item = null;
        inventory.two.open = false;
        inventory.expanded = true;
      };
      console.log("Inventory state updated:", inventory);
      drawInventory();
    };
  };
};