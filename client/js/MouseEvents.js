import { canvas, equipSlots, inventory, inventorySlots, state } from './CONST.js';
import { player } from './classes/Player.js';
import { mapArea } from './classes/MapArea.js';
import { items } from './classes/Items.js';
import { ui } from './classes/UserInterface.js';
import { splash } from './classes/Animations.js';
import { 
  attemptFishing, 
  clearHoverStates, 
  findItemContainer,
  handleInventory,
  isCursorOverItem,
  moveToEquip, 
  moveToInventory,
  moveToVisibleArea, 
  updateItemHoverState, 
  updateItemsArray} from './utils/utils.js';

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
  const playerLocation = player.worldPosition;
  const pixels = 64;

  const newFrameX = player.worldPosition.x + Math.floor((offsetX - 384) / 64);
  const newFrameY = player.worldPosition.y + Math.floor((offsetY - 320) / 64);
  const drawX = (newFrameX - playerLocation.x) * pixels + 384;
  const drawY = (newFrameY - playerLocation.y) * pixels + 320;

  // Check valid drop locations
  const inVisibleArea = offsetX >= 0 && offsetX < 832 && offsetY >= 0 && offsetY < 704;

  const inEquipSlot = Object.keys(equipSlots).find(slot => {
    const { x, y } = equipSlots[slot];
    return offsetX >= x && offsetX < x + 64 && offsetY >= y && offsetY < y + 64 ? slot : null;
  });

  const inFirstInventory = 
    offsetX >= inventorySlots.primary.slots.x && 
    offsetX < inventorySlots.primary.slots.x + inventorySlots.primary.slots.width && 
    offsetY >= inventorySlots.primary.slots.y && 
    offsetY < inventorySlots.primary.slots.y + inventorySlots.primary.slots.height;

  const inFirstInventoryExpanded = 
    offsetX >= inventorySlots.primary.slots.x && 
    offsetX < inventorySlots.primary.slots.x + inventorySlots.primary.slots.width && 
    offsetY >= inventorySlots.primary.slots.y && 
    offsetY < inventorySlots.primary.slots.y + inventorySlots.primary.slots.expandedHeight;

  const inSecondInventory = 
    offsetX >= inventorySlots.secondary.slots.x && 
    offsetX < inventorySlots.secondary.slots.x + inventorySlots.secondary.slots.width && 
    offsetY >= inventorySlots.secondary.slots.y && 
    offsetY < inventorySlots.secondary.slots.y + inventorySlots.secondary.slots.height;
  
  if (ui.state.activeToggle === 'inventory' && inEquipSlot) {
    moveToEquip(state.heldItem, inEquipSlot);
    player.manageModifiers();
    } else if ((inFirstInventoryExpanded && inventory.one.open && !inventory.two.open) || (inFirstInventory && inventory.one.open)) {
      moveToInventory(state.heldItem, inventory.one.item);
      updateItemsArray(state.heldItem, inventory.one.item.contents);
      // console.log(state.heldItem, ' in First Inventory');
    } else if (inSecondInventory && inventory.two.open) {
      moveToInventory(state.heldItem, inventory.two.item);
      updateItemsArray(state.heldItem, inventory.two.item.contents);
      // console.log(state.heldItem, ' in Second Inventory');
    } else if (inVisibleArea) {
      const isBoundaryTile = items.checkTileCollision(mapArea.boundaryTiles, newFrameX, newFrameY);
      const isWaterTile = items.checkTileCollision(mapArea.waterTiles, newFrameX, newFrameY);
  
    if (isWaterTile) {
      console.log(`Dropped ${state.heldItem.name} in water.`);
      splash.start(drawX, drawY);

      // Remove from equip or inventory before deleting
      const equippedItem = Object.values(player.equipped).find(equipped => equipped && equipped.id === state.heldItem.id);
      if (equippedItem) {
        player.equipped[equippedItem.type] = null;
      };

      const container = findItemContainer(state.heldItem, items.allItems);
      if (container && container.contents) {
        const index = container.contents.findIndex(i => i.id === state.heldItem.id);
        if (index > -1) container.contents.splice(index, 1);
      };

      items.deleteItem(state.heldItem);
      state.heldItem = null;
    } else if (isBoundaryTile) {
      items.resetItemPosition(state.heldItem, state.lastValidPosition);
    } else {
      moveToVisibleArea(state.heldItem, newFrameX, newFrameY);
    };
  };

  // Handle moving between inventory and equip slots
  if (state.heldItem?.category === 'inventory' && inEquipSlot) {
    moveToEquip(state.heldItem, inEquipSlot);
    console.log(state.heldItem, ' equipped');
  };

  // Clear held state
  state.heldItem = null;
  canvas.style.cursor = "pointer";
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