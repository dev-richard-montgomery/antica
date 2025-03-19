// general functions
export const generateHexId = () => {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
};

export const updateCursorAfterMove = () => {
  const event = new MouseEvent("mousemove", {
    clientX: lastMouseX, 
    clientY: lastMouseY
  });
  canvas.dispatchEvent(event);
};

// space validation
const isMouseOnCanvas = (x, y) => (
  Number.isFinite(x) && Number.isFinite(y) &&
  x >= 0 && x < canvas.width &&
  y >= 0 && y < canvas.height
);

const isCursorOverItem = (item, offsetX, offsetY, size = 64) => {
  return (
    offsetX >= item.drawPosition.x &&
    offsetX <= item.drawPosition.x + size &&
    offsetY >= item.drawPosition.y &&
    offsetY <= item.drawPosition.y + size
  );
};

const isInRangeOfPlayer = (item) => {
  const playerFrameX = player.data.details.location.x;
  const playerFrameY = player.data.details.location.y;

  const dx = item.worldPosition && Math.abs(item.worldPosition.x - playerFrameX);
  const dy = item.worldPosition && Math.abs(item.worldPosition.y - playerFrameY);
  
  return dx <= 1 && dy <= 1; // Ensures the item is in the player's frame or an adjacent frame
};

const isInRenderArea = (item) => {
  // Ensure worldPosition exists and has valid numbers for x and y
  if (
    !item.worldPosition || 
    typeof item.worldPosition.x !== 'number' || 
    typeof item.worldPosition.y !== 'number'
  ) {
    return false;
  };

  const { x, y } = item.worldPosition;
  const playerX = player.data.details.location.x;
  const playerY = player.data.details.location.y;

  // Calculate the render area's boundaries
  const startX = playerX - Math.floor(renderArea.size.col / 2);
  const endX = playerX + Math.floor(renderArea.size.col / 2); 
  const startY = playerY - Math.floor(renderArea.size.row / 2);
  const endY = playerY + Math.floor(renderArea.size.row / 2);

  // Check if the item is within the render area
  return x >= startX && x <= endX && y >= startY && y <= endY;
};

const isInEquipArea = (item) => {
  const { x, y } = item.drawPosition;
  
  return Object.values(equipSlots).some(slot =>
    x === slot.x && y === slot.y && uiState === 'inventory'
  );
};

const isInInventoryArea = (item) => {
  const slotSize = 32; // Assuming each inventory slot is 32x32 pixels
  const slotsPerRow = 6;

  // First inventory area
  const firstStartX = 832;
  const firstStartY = 288;
  const firstSlots = inventory.one.item?.stats?.slots ?? 0; // Check available slots

  // Second inventory area
  const secondStartX = 832;
  const secondStartY = 448;
  const secondSlots = inventory.two.item?.stats?.slots ?? 0; // Check available slots

  const isInSlot = (startX, startY, slots, itemX, itemY) => {
    for (let i = 0; i < slots; i++) {
      const row = Math.floor(i / slotsPerRow);
      const col = i % slotsPerRow;

      const slotX = startX + col * slotSize;
      const slotY = startY + row * slotSize;

      if (itemX >= slotX && itemX < slotX + slotSize &&
          itemY >= slotY && itemY < slotY + slotSize) {
        return true; // Item is within this slot
      }
    }
    return false;
  };

  return isInSlot(firstStartX, firstStartY, firstSlots, item.x, item.y) ||
         isInSlot(secondStartX, secondStartY, secondSlots, item.x, item.y);
};

const handleOutOfRange = () => {
  const closeIfOutOfRange = (slot) => {
    if (inventory[slot].open && 
        !isInEquipArea(inventory[slot].item) && 
        !isInRangeOfPlayer(inventory[slot].item)) {
      inventory[slot].open = false;
      inventory[slot].item = null;
      return true;
    }
    return false;
  };

  // Close second slot if item is out of range
  closeIfOutOfRange("two");

  // Close first slot if item is out of range
  if (closeIfOutOfRange("one") && inventory.two.open) {
    // Move second slot item to first slot if it's valid
    if (isInRangeOfPlayer(inventory.two.item) || isInEquipArea(inventory.two.item)) {
      inventory.one.open = true;
      inventory.one.item = inventory.two.item;
      inventory.two.open = false;
      inventory.two.item = null;
    }
  }
};