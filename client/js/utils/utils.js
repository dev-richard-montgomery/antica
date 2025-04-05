import { canvas, ctx, equipSlots, equipSlotsHighlightSpriteLocations, state, visibleArea } from "../CONST.js";
import { status } from '../Status.js';
import { ui } from '../classes/UserInterface.js';
import { mapArea } from '../classes/MapArea.js';
import { items } from '../classes/Items.js';
import { player } from '../classes/Player.js';
import { addMessage } from "../components/chatbox.js";;

// general functions
export const drawAll = () => {
  status();
  ui.draw();
  state.heldItem && equipSlotHighlight();
  mapArea.drawArea();
  items.drawAllVisibleItems();
  player.draw();
  mapArea.drawUpperMostTiles();
};

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

export const updateItemsArray = (item, array = items.allItems) => {
  const index = array.findIndex(curr => curr.id === item.id);

  if(index > -1) {
    array.splice(index, 1);
    array.push(item);
  };
};

export const clearHoverStates = (array = items.allItems) => {
  array.forEach(item => item.hover = false);
};

export const updateItemHoverState = (offsetX, offsetY, array = items.allItems) => {
  clearHoverStates(); // Clear all hover states first
  let hoverDetected = false;

  // Iterate from topmost to bottommost for accurate hover detection
  for (let i = array.length - 1; i >= 0; i--) {
    const item = array[i];

    // Check if the item is in the equip area or within the player's range
    // const isHoverable = isInEquipArea(item) || isInInventoryArea(item) || isInRangeOfPlayer(item);
    const isHoverable = isInRangeOfPlayer(item);
    if (!isHoverable) continue;

    // Check if the cursor is over the item
    if (isCursorOverItem(item, offsetX, offsetY)) {
      item.hover = true;
      canvas.style.cursor = "grab";
      hoverDetected = true;
      break; // Stop at the first hovered item (topmost)
    };
  };

  return hoverDetected;
};

// check valid areas
export const isInRenderArea = (item) => {
  // Ensure worldPosition exists and has valid numbers for x and y
  if (
    !item.worldPosition || 
    typeof item.worldPosition.x !== 'number' || 
    typeof item.worldPosition.y !== 'number'
  ) {
    return false;
  };

  const { x, y } = item.worldPosition;
  const playerX = player.worldPosition.x;
  const playerY = player.worldPosition.y;

  // Calculate the render area's boundaries
  const startX = playerX - Math.floor(visibleArea.frames.col / 2);
  const endX = playerX + Math.floor(visibleArea.frames.col / 2); 
  const startY = playerY - Math.floor(visibleArea.frames.row / 2);
  const endY = playerY + Math.floor(visibleArea.frames.row / 2);

  // Check if the item is within the render area
  return x >= startX && x <= endX && y >= startY && y <= endY;
};

export const isInEquipArea = (item) => {
  const { x, y } = item.drawPosition;
  
  return Object.values(equipSlots).some(slot =>
    x === slot.x && y === slot.y && ui.state.activeToggle === 'inventory'
  );
};

// export const isInInventoryArea = (item) => {
//   const slotSize = 32; // Assuming each inventory slot is 32x32 pixels
//   const slotsPerRow = 6;

//   // First inventory area
//   const firstStartX = 832;
//   const firstStartY = 288;
//   const firstSlots = inventory.one.item?.stats?.slots ?? 0; // Check available slots

//   // Second inventory area
//   const secondStartX = 832;
//   const secondStartY = 448;
//   const secondSlots = inventory.two.item?.stats?.slots ?? 0; // Check available slots

//   const isInSlot = (startX, startY, slots, itemX, itemY) => {
//     for (let i = 0; i < slots; i++) {
//       const row = Math.floor(i / slotsPerRow);
//       const col = i % slotsPerRow;

//       const slotX = startX + col * slotSize;
//       const slotY = startY + row * slotSize;

//       if (itemX >= slotX && itemX < slotX + slotSize &&
//           itemY >= slotY && itemY < slotY + slotSize) {
//         return true; // Item is within this slot
//       }
//     }
//     return false;
//   };

//   return isInSlot(firstStartX, firstStartY, firstSlots, item.x, item.y) ||
//          isInSlot(secondStartX, secondStartY, secondSlots, item.x, item.y);
// };

export const isInRangeOfPlayer = (item) => {
  const playerFrameX = player.worldPosition.x;
  const playerFrameY = player.worldPosition.y;

  const dx = item.worldPosition && Math.abs(item.worldPosition.x - playerFrameX);
  const dy = item.worldPosition && Math.abs(item.worldPosition.y - playerFrameY);
  
  return dx <= 1 && dy <= 1; // Ensures the item is in the player's frame or an adjacent frame
};

export const isCursorOverItem = (item, offsetX, offsetY, size = 64) => {
  return (
    offsetX >= item.drawPosition.x &&
    offsetX <= item.drawPosition.x + size &&
    offsetY >= item.drawPosition.y &&
    offsetY <= item.drawPosition.y + size
  );
};

export const findTopMostItemAtPosition = (currItem) => {
  for (let i = items.allItems.length - 1; i >= 0; i--) {
    const item = items.allItems[i];

    if (
      item.id !== currItem.id && // Don't compare with itself
      item.worldPosition &&
      item.worldPosition.x === currItem.worldPosition.x &&
      item.worldPosition.y === currItem.worldPosition.y &&
      item.name === currItem.name &&
      item.stats?.size !== undefined &&
      currItem.stats?.size !== undefined
    ) {
      return item;
    }
  }
  return null;
};

// move destinations :: equip area, inventory, on visible map, out of range
export const moveToVisibleArea = (item, newFrameX, newFrameY) => {
  if (!item) return; // Ensure item exists before proceeding

  const equippedItem = Object.values(player.equipped).find(equippedItem => equippedItem && equippedItem.id === item.id);
  if (equippedItem) {
    player.equipped[equippedItem.type] = null;
  };

  // if (item.category === 'equipped') {
  //   player.equipped[item.type] = null; // Use null for consistency
  // } else if (item.category === 'inventory') {
  //   const container = findItemContainer(item, inGameItems);
  //   if (container && container.contents) { // Ensure container exists
  //     const index = container.contents.findIndex(curr => curr.id === item.id);
  //     if (index > -1) container.contents.splice(index, 1);
  //   }
  // }

  item.category = 'world';
  item.worldPosition = { x: newFrameX, y: newFrameY };
  item.held = false;

  if (item?.stats?.size) {
    const topmost = findTopMostItemAtPosition(item);

    if (topmost && topmost.id !== item.id) {
      items.stackItems(topmost, item);
      items.updateItemDrawPosition(topmost);
      updateItemsArray(topmost);
    }
    
  } else {
    items.updateItemDrawPosition(item);
    updateItemsArray(item);
  };

};

const unequipItem = (equippedItem, newItem) => {
  if (!equippedItem) return;

  equippedItem.category = 'world';
  equippedItem.worldPosition = { ...newItem.worldPosition };
  equippedItem.held = false;

  player.equipped[equippedItem.type] = null;
  items.updateItemDrawPosition(equippedItem);
  updateItemsArray(equippedItem);
};

export const moveToEquip = (item, slot) => {
  if (!item || item.type !== slot) return; // Ensure valid item type

  // Unequip offhand if equipping a two-handed weapon
  if (item?.stats?.twohander && player.equipped.offhand) {
    unequipItem(player.equipped.offhand, item);
  };

  // Unequip mainhand if equipping an offhand while mainhand is two-handed
  if (item.type === 'offhand' && player.equipped.mainhand?.stats?.twohander) {
    unequipItem(player.equipped.mainhand, item);
  };

  // Unequip and swap existing item in the slot
  if (player.equipped[slot] && player.equipped[slot].id !== item.id) {
    unequipItem(player.equipped[slot], item);
  };

  // Equip new item
  item.category = 'equipped';
  item.worldPosition = null;
  item.drawPosition = { x: equipSlots[slot].x, y: equipSlots[slot].y };
  item.held = false;

  console.log(`Equipped ${item.name} in ${slot} slot.`);
  player.equipped[slot] = item;
  updateItemsArray(item);
};

// export const handleOutOfRange = () => {
  //   const closeIfOutOfRange = (slot) => {
    //     if (inventory[slot].open && 
    //         !isInEquipArea(inventory[slot].item) && 
//         !isInRangeOfPlayer(inventory[slot].item)) {
//       inventory[slot].open = false;
//       inventory[slot].item = null;
//       return true;
//     }
//     return false;
//   };

//   // Close second slot if item is out of range
//   closeIfOutOfRange("two");

//   // Close first slot if item is out of range
//   if (closeIfOutOfRange("one") && inventory.two.open) {
//     // Move second slot item to first slot if it's valid
//     if (isInRangeOfPlayer(inventory.two.item) || isInEquipArea(inventory.two.item)) {
//       inventory.one.open = true;
//       inventory.one.item = inventory.two.item;
//       inventory.two.open = false;
//       inventory.two.item = null;
//     }
//   }
// };

const equipSlotHighlight = () => {
  if (!state.heldItem?.type) return;

  const { type } = state.heldItem;
  const isSlotEmpty = !player.equipped[type];

  if (isSlotEmpty) {
    const highlightPos = equipSlotsHighlightSpriteLocations[type];
    const equipPos = equipSlots[type];

    ctx.drawImage(
      ui.image,
      highlightPos.x, highlightPos.y, ui.btnSize, ui.btnSize,
      equipPos.x, equipPos.y, ui.btnSize, ui.btnSize
    );
  };
};

// space validation
// const isMouseOnCanvas = (x, y) => (
//   Number.isFinite(x) && Number.isFinite(y) &&
//   x >= 0 && x < canvas.width &&
//   y >= 0 && y < canvas.height
// );

// fishing functions
const getCatchChance = () => {
  const min = 0.18;
  const max = 0.99;
  const k = 0.06; // controls the curve steepness
  const x0 = 50;  // the midpoint (center of curve)
  
  const sigmoid = 1 / (1 + Math.exp(-k * (player.skills.fishing - x0)));
  return min + (max - min) * sigmoid;
};

const getRareCatchChance = () => {
  return 1 / (1 + Math.exp(-0.07 * (player.skills.fishing - 85)));  
};

const getXPRequired = () => {
  return 20 * Math.pow(1.1, player.skills.fishing - 10);
};

// Example: Check if a fishing attempt is successful
export const attemptFishing = () => {
  let xpGained = 0; // Default small XP for failed attempts

  if (Math.random() < getCatchChance()) {
    xpGained = 1; // Standard catch XP
    addMessage("You caught a", "Silverscale!");
    items.createItem("silverscale", { x: player.worldPosition.x, y: player.worldPosition.y });

    if (Math.random() < getRareCatchChance()) {
      addMessage("You caught a", "Flarefin!");
      items.createItem("flarefin", { x: player.worldPosition.x, y: player.worldPosition.y });
      xpGained = 5; // Rare catch overrides normal XP
    };
  } else {
    console.log("You failed to catch anything.");
  };

  player.experience.fishing += xpGained;
  // console.log(`${(getCatchChance() * 100).toFixed(2)}%`)
  // console.log(`${(getXPRequired() - player.experience.fishing).toFixed(2)} xp til next level`)

  // Level up check with XP rollover
  while (player.experience.fishing >= getXPRequired()) {
    player.experience.fishing -= getXPRequired();
    player.skills.fishing++;
    addMessage("You leveled up! Fishing skill", `${player.skills.fishing}`);
  };
};