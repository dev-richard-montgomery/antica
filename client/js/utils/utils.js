import { arrows, canvas, centerMessage, ctx, equipSlots, inventory, equipSlotsHighlightSpriteLocations, movement, state, visibleArea } from "../CONST.js";
import { status } from '../Status.js';
import { ui } from '../classes/UserInterface.js';
import { mapArea } from '../classes/MapArea.js';
import { items } from '../classes/Items.js';
import { player } from '../classes/Player.js';
import { addMessage } from "../components/chatbox.js";

// general functions
export const drawAll = () => {
  status();
  ui.draw();
  drawInventory();
  state.heldItem && equipSlotHighlight();
  mapArea.drawArea();
  items.drawAllVisibleItems();
  player.draw();
  currentAnimation();
  mapArea.drawUpperMostTiles();
};

export const generateHexId = () => {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
};

export const updateCursorAfterMove = (lastMouseX, lastMouseY) => {
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

export const updatePlayerCapacity = () => {
  player.state.capacity = player.getEquippedCapacity() + player.getBagCapacity();
};

// messages
export const showCustomPrompt = (question, callback) => {
  const promptBox = document.getElementById("customPrompt");
  const promptText = document.getElementById("customPromptText");
  const input = document.getElementById("customPromptInput");
  const confirm = document.getElementById("customPromptConfirm");

  state.prompt = true;
  promptText.textContent = question;
  input.value = "";
  promptBox.style.display = "block";
  setTimeout(() => input.focus(), 0);

  const handleConfirm = () => {
    const value = parseInt(input.value, 10);
    promptBox.style.display = "none";
    input.removeEventListener("keydown", onEnter);
    state.prompt = false;
    callback(value);
  };

  const onEnter = (e) => {
    if (state.prompt && e.key === "Enter") {
      e.preventDefault();      // Prevent form submissions or default Enter behavior
      e.stopPropagation();     // Stop event from bubbling to chatbox or other handlers
      handleConfirm();
    }
  };

  confirm.onclick = handleConfirm;
  input.addEventListener("keydown", onEnter);
};

export const showCenterMessage = (message, duration = 2000) => {
  centerMessage.text = message;
  centerMessage.duration = duration;
  centerMessage.fadeDuration = 500; // fade in/out over 0.5s
  centerMessage.startTime = performance.now();
};

export const drawCenterMessage = () => {
  if (!centerMessage.startTime) return;

  const now = performance.now();
  const elapsed = now - centerMessage.startTime;
  const totalTime = centerMessage.duration + centerMessage.fadeDuration * 2;

  if (elapsed > totalTime) {
    centerMessage.startTime = null;
    return;
  }

  let alpha = 1;

  if (elapsed < centerMessage.fadeDuration) {
    // Fade in
    alpha = elapsed / centerMessage.fadeDuration;
  } else if (elapsed > centerMessage.fadeDuration + centerMessage.duration) {
    // Fade out
    alpha = 1 - ((elapsed - centerMessage.fadeDuration - centerMessage.duration) / centerMessage.fadeDuration);
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "white";
  ctx.strokeStyle = "gold";
  ctx.lineWidth = 3;
  ctx.font = "28px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const x = (canvas.width / 2) - (canvas.uiWidth / 2);
  const y = canvas.height / 2;

  ctx.strokeText(centerMessage.text, x, y);
  ctx.fillText(centerMessage.text, x, y);
  ctx.restore();
};

// animations
export const currentAnimation = () => {
  const now = performance.now();
  state.activeAnimations.forEach(anim => {
    anim.update(now);
    anim.draw();
  });

  for (let i = state.activeAnimations.length - 1; i >= 0; i--) {
    if (state.activeAnimations[i].done) {
      state.activeAnimations.splice(i, 1);
    };
  };
};

// validators
export const isInRenderArea = item => {
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

export const isInEquipArea = item => {
  const { x, y } = item.drawPosition;
  
  return Object.values(equipSlots).some(slot =>
    x === slot.x && y === slot.y && ui.state.activeToggle === 'inventory'
  );
};

export const isInInventoryArea = item => {
  const slotSize = 48; // Assuming each inventory slot is 32x32 pixels
  const slotsPerRow = 4;

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

export const isInRangeOfPlayer = item => {
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

export const findTopMostStackableItemAtPosition = currItem => {
  let topAtPosition = null;

  for (let i = items.allItems.length - 1; i >= 0; i--) {
    const item = items.allItems[i];

    if (
      item.id !== currItem.id && // Don't match itself
      item.worldPosition &&
      item.worldPosition.x === currItem.worldPosition.x &&
      item.worldPosition.y === currItem.worldPosition.y
    ) {
      // The first item we find in this loop at the position is the topmost
      topAtPosition = item;
      break;
    }
  }

  if (
    topAtPosition &&
    topAtPosition.name === currItem.name &&
    topAtPosition.stats?.size !== undefined &&
    currItem.stats?.size !== undefined
  ) {
    return topAtPosition;
  }

  return null;
};

export const findItemContainer = (item, itemList) => {
  // Check inside each item's 'contents' array (if it exists)
  for (const container of itemList) {
    if (Array.isArray(container.contents)) {
      const found = container.contents?.includes(item) && container;
      if (found) return found;
    };
  };
  
  return null; // If not found in any array
};

export const isStackableItemInInventory = (item1, item2, offsetX, offsetY, pixel = 32) => {
  if (
    !item1 || !item2 ||
    item1.name !== item2.name ||
    item1 === item2 ||
    !item1?.stats?.size || !item2?.stats?.size
  ) return false;

  const { x, y } = item1.drawPosition;

  return (
    offsetX >= x &&
    offsetX < x + pixel &&
    offsetY >= y &&
    offsetY < y + pixel
  );
};

export const ensureValidItemPlacement = item => {
  if (!item.category || (item.category === 'inventory' && !findItemContainer(item, items.allItems))) {
    console.warn(`Item "${item.name}" had no valid category or container. Moving to visible area.`);
    moveToVisibleArea(item, player.worldPosition.x, player.worldPosition.y);
  }
};

export const handleInventoryBackButtonClick = (mouseX, mouseY) => {
  const wasClicked = (inv) => {
    const { x, y, size } = inv.backBtn;
    return mouseX >= x && mouseX <= x + size &&
           mouseY >= y && mouseY <= y + size;
  };

  const closeTopItem = (inv) => {
    inv.stack.pop();
    inv.item = inv.stack.at(-1) || null;
    inv.open = !!inv.item;
  };

  // Handle back click in first inventory
  if (inventory.one.open && wasClicked(inventory.one)) {
    closeTopItem(inventory.one);

    // Promote second inventory if first is now empty
    if (!inventory.one.open && inventory.two.open) {
      inventory.one.item = inventory.two.item;
      inventory.one.stack = [...inventory.two.stack];
      inventory.one.open = true;

      inventory.two.item = null;
      inventory.two.stack = [];
      inventory.two.open = false;
    }

    return true;
  }

  // Handle back click in second inventory
  if (inventory.two.open && wasClicked(inventory.two)) {
    closeTopItem(inventory.two);
    return true;
  }

  return false;
};

export const weightCheck = (item, remove = 0) => {
  const equippedWeight = player.getEquippedCapacity();
  const inventoryWeight = player.getBagCapacity();
  const itemWeight = item.category === 'world' ? item?.stats?.capacity : 0; // this makes sure the weight is not already accounted for, equipped or already in the inventory

  const totalWeight = equippedWeight + inventoryWeight + itemWeight - remove;
  return totalWeight <= player.baseStats.capacity;
};

// move destinations :: equip area, inventory, on visible map, out of range
export const moveToVisibleArea = (item, newFrameX, newFrameY) => {
  if (!item) return;

  // Remove from equipment or inventory
  items.removeItemFromAnywhere(item);

  // Update world positioning
  item.category = 'world';
  item.worldPosition = { x: newFrameX, y: newFrameY };
  item.held = false;
  item.hover = false;

  // Try stacking with a topmost item
  const topmost = findTopMostStackableItemAtPosition(item);
  if (topmost && topmost.id !== item.id) {
    items.combineItems(topmost, item);
    updateItemsArray(topmost);
  } else {
    items.updateItemDrawPosition(item);
    updateItemsArray(item);
  }
  ensureValidItemPlacement(item);
  containerOutOfRange(movement.lastMouseX, movement.lastMouseY);
  updatePlayerCapacity();
};

export const moveToEquip = (item, slot) => {
  if (!item || item.type !== slot) return;

  if (player.equipped[slot]?.id === item.id) {
    return;
  }

  if (slot === 'back' && item.category === 'inventory') {
    showCenterMessage('Unequip current backpack first.');
    return;
  }

  const mainhandItem = player.equipped.mainhand;
  const offhandItem = player.equipped.offhand;
  const currentlyEquipped = player.equipped[slot];
  const backpack = inventory.one.item;
  const hasInventory = inventory.one.open && backpack;
  const inventoryHasSpace = hasInventory && backpack.contents.length < backpack.stats.slots;

  if (!weightCheck(item, currentlyEquipped?.stats?.capacity || 0)) {
    showCenterMessage(`Not enough capacity to equip ${item.name}.`)
    return;
  }

  items.removeItemFromAnywhere(item);

  const tryStoreOrDrop = (equipItem) => {
    if (!equipItem) return;

    if (inventoryHasSpace && weightCheck(equipItem)) {
      moveToInventory(equipItem, backpack);
    } else {
      moveToVisibleArea(equipItem, item.worldPosition.x, item.worldPosition.y);
    }
  };

  if (item.type === "mainhand" && item.stats?.twohander) {
    if (offhandItem) {
      tryStoreOrDrop(offhandItem);
      player.equipped.offhand = null;
    }

    if (mainhandItem && mainhandItem.id !== item.id && mainhandItem.stats?.twohander) {
      tryStoreOrDrop(mainhandItem);
    }
  }

  if (item.type === "offhand" && mainhandItem?.stats?.twohander) {
    tryStoreOrDrop(mainhandItem);
    player.equipped.mainhand = null;
  }

  if (currentlyEquipped && currentlyEquipped.id !== item.id) {
    if (slot === 'back' && item.category === 'world') {
      moveToVisibleArea(currentlyEquipped, item.worldPosition.x, item.worldPosition.y);
    } else {
      tryStoreOrDrop(currentlyEquipped);
    }
  }

  item.category = 'equipped';
  item.worldPosition = null;
  item.drawPosition = { x: equipSlots[slot].x, y: equipSlots[slot].y };
  item.held = false;
  item.hover = false;

  player.equipped[slot] = item;
  updateItemsArray(item);
  ensureValidItemPlacement(item);
  updatePlayerCapacity();
  console.log(`Equipped ${item.name} in ${slot}`);
};

export const moveToInventory = (item, container) => {
  if (!item || !container) return;

  const inventoryFull = container.contents.length >= container.stats.slots;
  if (inventoryFull) return;

  if (!weightCheck(item)) {
    showCenterMessage(`Not enough capacity to carry ${item.name}.`);
    return;
  }

  if (container.contents.includes(item)) {
    updateItemsArray(item, container.contents);
    return;
  }

  items.removeItemFromAnywhere(item);

  item.category = 'inventory';
  item.worldPosition = null;
  item.held = false;
  item.hover = false;

  container.contents.push(item);
  updateItemsArray(item);
  ensureValidItemPlacement(item);
  updatePlayerCapacity();
  console.log(`Moved ${item.name} to inventory`);
};

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

export const containerOutOfRange = () => {
  if (inventory.two.open) {
    const parent = inventory.one.parentContainer
      ? inventory.one.stack[0]
      : inventory.two.stack[0];

    const outOfRange =
      !isInRangeOfPlayer(parent) && !isInEquipArea(parent);

    if (outOfRange) {
      inventory.two.open = false;
      inventory.two.item = null;
      inventory.two.stack = [];

      if (inventory.one.parentContainer) {
        inventory.one.parentContainer = false;
      }
    }
  }

  if (inventory.one.open) {
    const parent = inventory.one.stack[0];
    const outOfRange =
      !isInRangeOfPlayer(parent) && !isInEquipArea(parent);

    if (outOfRange) {
      inventory.one.open = false;
      inventory.one.item = null;
      inventory.one.stack = [];

      if (inventory.two.open) {
        inventory.one.open = true;
        inventory.one.item = inventory.two.item;
        inventory.one.stack = [...inventory.two.stack];

        inventory.two.open = false;
        inventory.two.item = null;
        inventory.two.stack = [];
      }
    }
  }
};

export const handleInventory = item => {
  const inRange = isInRangeOfPlayer(item) || player.equipped.back === item;
  if (!inRange) return;

  const isBag = item.hasOwnProperty("contents");

  // Open first inventory
  if (!inventory.one.item) {
    inventory.one.open = true;
    inventory.one.item = item;
    inventory.one.stack = [item];
    return;
  }

  const itemInOne = inventory.one.stack.includes(item);
  const itemInTwo = inventory.two.stack.includes(item);

  // Open nested container from inventory.one into inventory.two
  if (inventory.one.item.contents?.includes(item) && isBag && !inventory.two.open) {
    inventory.two.open = true;
    inventory.two.item = item;
    inventory.two.stack = [item];
    inventory.one.parentContainer = true;
    return;
  }

  // Open second inventory if it's not related to first
  if (!itemInOne && !inventory.two.item) {
    inventory.two.open = true;
    inventory.two.item = item;
    inventory.two.stack = [item];
    return;
  }

  // Close inventory.one
  if (inventory.one.item === item) {
    inventory.one.stack.pop();
    inventory.one.item = inventory.one.stack.at(-1) || null;
    inventory.one.open = inventory.one.item !== null;

    if (!inventory.one.open && inventory.two.item) {
      inventory.one.open = true;
      inventory.one.item = inventory.two.item;
      inventory.one.stack = [...inventory.two.stack];

      inventory.two.open = false;
      inventory.two.item = null;
      inventory.two.stack = [];
    }

    return;
  }

  // Close inventory.two
  if (inventory.two.item === item) {
    inventory.two.stack.pop();
    inventory.two.item = inventory.two.stack.at(-1) || null;
    inventory.two.open = inventory.two.item !== null;
    return;
  }

  // Open nested bag in inventory.one
  if (inventory.one.item.contents?.includes(item) && isBag && inventory.two.open) {
    inventory.one.item = item;
    inventory.one.stack.push(item);
    return;
  }

  // Open nested bag in inventory.two
  if (inventory.two.item?.contents?.includes(item) && isBag) {
    inventory.two.item = item;
    inventory.two.stack.push(item);
    return;
  }

  // Replace inventory.two when both inventories are open
  if (inventory.one.open && inventory.two.open) {
    inventory.two.item = item;
    inventory.two.stack = [item];
    return;
  }

  // Final cleanup
  if (!inventory.one.open) {
    inventory.one.item = null;
    inventory.one.stack = [];
    inventory.one.parentContainer = false;
  }

  if (!inventory.two.open) {
    inventory.two.item = null;
    inventory.two.stack = [];
  }
};

export const drawInventory = () => {
  const slotSize = 48;
  const itemsPerRow = 4;
  const firstInventorySize = inventory.one.item ? slotSize * Math.ceil(inventory.one.item.stats.slots / itemsPerRow) : 0; 
  const secondInventorySize = inventory.two.item ? slotSize * Math.ceil(inventory.two.item.stats.slots / itemsPerRow) : 0; 
  inventory.one.start = 192 + 64;
  inventory.one.size = !inventory.two.open ? firstInventorySize : secondInventorySize === 96 ? firstInventorySize : firstInventorySize === 96 ? firstInventorySize : 192;
  inventory.two.start = 192 + 64 + 32 + inventory.one.size;
  inventory.two.size = firstInventorySize === 96 && secondInventorySize <= 288 ? secondInventorySize : 192;
  
  const drawHeader = (inventory, scroll) => {
    const max = Math.ceil(inventory.item.stats.slots / 4);
    const left = scroll === 0 ? arrows.up.inactive : arrows.up.active; // up --- item --- down
    const right = scroll === max ? arrows.down.inactive : arrows.down.active;
    // only draw arrows if scrolling is necessary... then figure out the logic. If the visible contents of the inventory is 192px by 192px, you should be able to see 16 items total.
    // then a backpack with 20 items should only let you scroll up or down once. If a backpack has 40, you should be able to scroll 6 times. I'll just hardcode it.

    // draw left arrow
    ctx.drawImage(ui.image, left.x, left.y, 64, 32, visibleArea.width, inventory.start, 64, 32);
    
    // draws inventory container in middle
    ctx.drawImage(items.image, inventory.item.spritePosition.x, inventory.item.spritePosition.y, 64, 64, visibleArea.width + 64 + 16, inventory.start, 32, 32);
    inventory.backBtn.x = visibleArea.width + 64 + 16;
    inventory.backBtn.y = inventory.start;

    // draw right arrow
    ctx.drawImage(ui.image, right.x, right.y, 64, 32, visibleArea.width + 128, inventory.start, 64, 32);
  };

  const drawSection = (inventory, scroll) => {  
    let startIndex = scroll * itemsPerRow;
    const maxVisibleSlots = (inventory.size / 48) * itemsPerRow;

    for (let i = 0; i < maxVisibleSlots; i++) {
      const index = startIndex + i;
      if (index >= inventory.item.stats.slots) break;

      const col = i % itemsPerRow;
      const row = Math.floor(i / itemsPerRow);
      const x = visibleArea.width + col * slotSize;
      const y = inventory.start + 32 + row * slotSize;
      
      // Slot background
      ctx.fillStyle = "lightgray";
      ctx.fillRect(x, y, slotSize, slotSize);
      ctx.strokeStyle = "white";
      ctx.strokeRect(x + 0.5, y + 0.5, slotSize - 1, slotSize - 1);
      
      const item = inventory.item.contents[index];
      if (item) {
        item.drawPosition = { x, y };
        updateItemsArray(item);
        ctx.drawImage(
          items.image,
          item.spritePosition.x, item.spritePosition.y,
          64, 64,
          x, y, slotSize, slotSize
        );
      };
    };
  };

  // draw inventories
  if (ui.state.activeToggle === 'inventory') {
    if (inventory.one.open) {
      drawHeader(inventory.one, inventory.one.scroll);
      drawSection(inventory.one, inventory.one.scroll);
    }
    if (inventory.two.open) {
      drawHeader(inventory.two, inventory.two.scroll);
      drawSection(inventory.two, inventory.two.scroll);
    }
  };
};

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

export const attemptFishing = () => {
  let xpGained = 0; // Default small XP for failed attempts

  const hasInventorySpace = () => inventory.one.open && inventory.one.item.contents.length < inventory.one.item.stats.slots;
  
  if (Math.random() < getCatchChance()) {
    xpGained = 1; // Standard catch XP
    addMessage("", " You caught a Silverscale!");
    if (hasInventorySpace()) {
      inventory.one.item.contents.push(items.createItem("silverscale", null, 'inventory'));  
    } else {
      items.createItem("silverscale", { x: player.worldPosition.x, y: player.worldPosition.y });
    };

    if (Math.random() < getRareCatchChance()) {
      addMessage("", "You caught a Flarefin!");
      if (hasInventorySpace()) {
        inventory.one.item.contents.push(items.createItem("flarefin", null, 'inventory'));
      } else {
        items.createItem("flarefin", { x: player.worldPosition.x, y: player.worldPosition.y });
      };
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
    showCenterMessage("You gained a skill advance in fishing!");
  };

  player.isFishing = false;
};

// fix equipping backpack on backpack
// inventory arrow behavior
// modifiers