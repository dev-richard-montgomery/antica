export const handleMouseMove = (e) => {
  const { offsetX, offsetY } = e;

  // Check for UI interactions first
  const uiCursor = handleUiStates(e);
  if (uiCursor) {
    canvas.style.cursor = uiCursor;
    return;
  }

  // Default cursor state
  canvas.style.cursor = "crosshair";

  // If an item is held, update its position and cursor state
  if (heldItem) {
    canvas.style.cursor = "grabbing";
    return;
  }

  // Update hover states for in-game items
  if (updateItemHoverState(offsetX, offsetY)) return;
};

const handleMouseDown = (e) => {
  if (e.button !== 0) return; // Left click only

  // Ensure only one hovered item
  clearHoverStates();
  const { offsetX, offsetY } = e;
  updateItemHoverState(offsetX, offsetY);

  // Find hovered item to hold
  const hoveredItem = inGameItems.find(item => item.hover);

  // Ensure a valid item is found and prevent holding multiple items
  if (hoveredItem && !heldItem) {
    hoveredItem.held = true;
    hoveredItem.hover = false;
    hoveredItem.lastValidPosition = { ...hoveredItem.drawPosition };
    heldItem = hoveredItem;
    canvas.style.cursor = "grabbing";
  }
};

const handleMouseUp = (e) => {
  if (!heldItem) return;

  const { offsetX, offsetY } = e;
  const newFrameX = player.data.details.location.x + Math.floor((offsetX - 384) / 64);
  const newFrameY = player.data.details.location.y + Math.floor((offsetY - 320) / 64);

  // Check valid drop locations
  const inRenderArea = offsetX >= 0 && offsetX < 832 && offsetY >= 0 && offsetY < 704;

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
    offsetY < inventorySlots.primary.slots.expandedHeight;

  const inSecondInventory = 
    offsetX >= inventorySlots.secondary.slots.x && 
    offsetX < inventorySlots.secondary.slots.x + inventorySlots.secondary.slots.width && 
    offsetY >= inventorySlots.secondary.slots.y && 
    offsetY < inventorySlots.secondary.slots.y + inventorySlots.secondary.slots.height;

  // Handle inventory interactions
  if (uiState === 'inventory') {
    if (inEquipSlot) {
      moveToEquip(heldItem, inEquipSlot);
      console.log(heldItem, ' moved to Equip Area');
    } else if ((inFirstInventoryExpanded && inventory.one.open && !inventory.two.open) || (inFirstInventory && inventory.one.open)) {
      moveToInventory(heldItem, inventory.one.item);
      console.log(heldItem, ' in First Inventory');
    } else if (inSecondInventory && inventory.two.open) {
      moveToInventory(heldItem, inventory.two.item);
      console.log(heldItem, ' in Second Inventory');
    };
  };

  // Handle moving between inventory and equip slots
  if (heldItem.category === 'inventory' && inEquipSlot) {
    moveToEquip(heldItem, inEquipSlot);
    console.log(heldItem, ' equipped');
  };

  // Handle rendering area drop
  if (inRenderArea) {
    moveToRenderArea(heldItem, newFrameX, newFrameY);
    handleOutOfRange();
  } else {
    resetItemPosition(heldItem, lastValidPosition);
  };

  // Clear held state
  heldItem = null;
  canvas.style.cursor = "crosshair";
  drawAll();
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