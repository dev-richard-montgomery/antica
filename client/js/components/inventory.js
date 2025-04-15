// import { ctx, inventory, inventorySlots, visibleArea } from "../CONST.js";
// import { player } from "../classes/Player.js";
// import { items } from "../classes/Items.js";
// import { ui } from "../classes/UserInterface.js";
// import { isInRangeOfPlayer, updateItemsArray } from "../utils/utils.js";

// export const handleInventory = (item) => {
//   if (isInRangeOfPlayer(item) || player.equipped.back === item) {
//     if (!inventory.one.item) { // opens in first inventory
//       inventory.one.item = item;
//       inventory.one.open = true;
//       inventory.expanded = true;
//     } else if (item !== inventory.one.item && !inventory.two.item) { // opens in second inventory
//       inventory.two.item = item;
//       inventory.two.open = true;
//       inventory.expanded = false;
//     } else if (inventory.one.item === item) { // closes first inventory
//       inventory.one.item = null;
//       inventory.one.open = false;
//       inventory.expanded = false;
  
//       if (inventory.two.item) { // because first inventory closed, if second inventory is open, set the second to the first, and close the second
//         inventory.one.item = inventory.two.item;
//         inventory.one.open = inventory.two.open;
//         inventory.two.item = null;
//         inventory.two.open = false;
//         inventory.expanded = true;
//       }
//     } else if (inventory.two.item === item) { // else close the second inventory
//       inventory.two.item = null;
//       inventory.two.open = false;
//       inventory.expanded = true;
//     };
//   };
// };

// export const moveToInventory = (item, container) => {
//   if (!item || !container) return;

//   // Ensure inventory has space before checking for duplicates
//   if (container.contents.length >= container.stats.slots) return;

//   // Prevent adding duplicate items
//   if (container.contents.includes(item)) return;

//   // Remove item from equipped section if applicable
//   if (player.equipped[item.type] === item) {
//     player.equipped[item.type] = null; // Proper assignment
//     console.log(`Removed ${item.name} from equip section to inventory.`);
//   };

//   // Update item properties
//   item.category = 'inventory';
//   item.worldPosition = null;
//   item.held = false;
//   item.hover = false;

//   // Add item to inventory container
//   container.contents.push(item);
// };

// export const drawInventory = () => {
//   const { primary, secondary } = inventorySlots;

//   // Clear and draw inventory background
//   // ctx.clearRect(visibleArea.width, 256, 192, 448); // 384
//   // ctx.drawImage(ui.image, 192, 0, 192, 384, visibleArea.width, 256, 192, 384);
  
//   if (ui.state.activeToggle === 'inventory' && inventory.one.open) {
//     ctx.clearRect(visibleArea.width, 256, 192, 448);
//     ctx.fillStyle = "white";
//     ctx.fillRect(visibleArea.width, 256, 192, 448);
//   };

//   const drawInventorySection = (container, section, scroll, expanded) => {
//     if (!container) return;

//     const numOfRows = expanded && section === 1 ? 11 : 5;
//     const rowLength = 4;
//     const size = 48;
//     let position = scroll * rowLength;

//     const header = section === 1 ? primary.header : secondary.header;
//     const slots = section === 1 ? primary.slots : secondary.slots;

//     const drawInventorySlot = (x,y) => {
//       ctx.fillStyle = "lightgray";
//       ctx.fillRect(x, y, size, size);
  
//       ctx.strokeStyle = "white";
//       ctx.lineWidth = 1;
//       ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
//     };

//     // Draw inventory header
//     ctx.drawImage(items.image, container.spritePosition.x, container.spritePosition.y, 64, 64, header.x + 64 + 16, header.y, 32, 32);

//     // Draw inventory slots and contents
//     for (let row = 0; row < numOfRows * rowLength; row++) {
//       const x = slots.x + (row % rowLength) * size;
//       const y = slots.y + Math.floor(row / rowLength) * size;

//       if (position < container.stats.slots) {
//         drawInventorySlot(x, y);
//         const item = container.contents[position];

//         if (typeof item === 'object') {
//           item.drawPosition = { x: x, y: y };
//           updateItemsArray(item);
//           ctx.drawImage(items.image, item.spritePosition.x, item.spritePosition.y, 64, 64, x, y, size, size);
//         };
//       };

//       position++;
//     };
//   };

//   if (ui.state.activeToggle === 'inventory') {
//     if (inventory.one.open && !inventory.two.open) {
//       drawInventorySection(inventory.one.item, 1, inventory.one.scroll, true);
//     } else if (inventory.two.open) {     
//       drawInventorySection(inventory.one.item, 1, inventory.one.scroll, false);
//       drawInventorySection(inventory.two.item, 2, inventory.two.scroll, false);
//     };
//   };
// };