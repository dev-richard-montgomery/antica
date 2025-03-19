// canvas variables
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 704;
canvas.uiWidth = 192;

// game variables
const chat = {
  on: false
};

const game = {
  on: false
};

// path variables
const API_URL_ITEMS = '/saveItemData';
const API_URL_PLAYER = '/savePlayerData';

// movement variables
const centerX = 384;
const centerY = 320;

// map variables
const uppermostTileIDs = [30, 31, 300, 301, 320, 321, 322, 323, 324, 340, 343, 360, 362, 363, 380, 383];
const waterTileIDs = [0, 1, 2, 3, 4, 5, 6, 7, 8];

// screen variables
const visibleArea = {
  frames: { row: 11, col: 13 },
  width: canvas.width - canvas.uiWidth, 
  height: canvas.height
};

// ui variables
const equipSlots = {
  neck: { x: 832, y: 0 },
  head: { x: 896, y: 0 },
  back: { x: 960, y: 0 },
  mainhand: { x: 832, y: 64 },
  chest: { x: 896, y: 64 },
  offhand: { x: 960, y: 64 },
  hands: { x: 832, y: 128 },
  legs: { x: 896, y: 128 },
  feet: { x: 960, y: 128 },
};

// inventory variables
const inventory = {
  expanded: false,
  one: { item: null, open: false, scroll: 0 },
  two: { item: null, open: false, scroll: 0 }
};

const inventorySlots = {
  primary: {
    header: { x: visibleArea.width, y: 192 + 64, width: 192, height: 32 },
    slots: { x: visibleArea.width, y: 192 + 64 + 32, width: 192, height: 160, expandedHeight: 352 }
  },
  secondary: {
    header: { x: visibleArea.width, y: 192 + 64 + 32 + 160, width: 192, height: 32 },
    slots: { x: visibleArea.width, y: 192 + 64 + 32 + 160 + 32, width: 192, height: 160 }
  }
};

// toggle variables
const inventoryArrows = {
  sprites: {
    downActive: { x: 256, y: 640 + 16 }, 
    downInactive: { x: 320, y: 640 + 16 }, 
    upActive: { x: 128, y: 640 + 16 }, 
    upInactive: { x: 192, y: 640 + 16 },
  },
  one: { 
    down: { x: visibleArea.width + 128, y: 192 + 64 },
    up: { x: visibleArea.width, y: 192 + 64 }
  },
  two: { 
    down: { x: visibleArea.width + 128, y: 192 + 64 + 32 + 160 },
    up: { x: visibleArea.width, y: 192 + 64 + 32 + 160 }
  }
};

const uiSections = {
  top: {
    location: { x: visibleArea.width, y: 0 },
    miniMap: { x: 0, y: 0, width: 192, height: 192 },
    equipArea: { x: 0, y: 192, width: 192, height: 192 },
    playerDetails: { x: 0, y: 384, width: 192, height: 192 },
  },
  uiBar: {
    location: { x: visibleArea.width, y: 192 },
    bar: { x: 192, y: 384, width: 192, height: 64 },
    mapButton: { x: 192, y: 448 },
    mapButtonLocation: { x: visibleArea.width, y: 192 },
    inventoryButton: { x: 256, y: 448 },
    inventoryButtonLocation: { x: visibleArea.width + 64, y: 192 },
    playerButton: { x: 320, y: 448 },
    playerButtonLocation: { x: visibleArea.width + 128, y: 192 }
  },
  bottom: {
    location: { x: visibleArea.width, y: 640 },
    sprite: { x: 192, y: 512, width: 192, height: 64 },
    offense: { x: 192, y: 576 },
    offenseLocation: { x: visibleArea.width, y: 640 },
    defense: { x: 256, y: 576 },
    defenseLocation: { x: visibleArea.width + 64, y: 640 },
    passive: { x: 320, y: 576 },
    passiveLocation: { x: visibleArea.width + 128, y: 640 }
  }
};

export { 
  API_URL_ITEMS, 
  API_URL_PLAYER, 
  canvas, 
  centerX, 
  centerY, 
  chat, 
  ctx, 
  equipSlots, 
  game, 
  inventory, 
  inventorySlots,
  uiSections,
  uppermostTileIDs,
  visibleArea, 
  waterTileIDs 
};