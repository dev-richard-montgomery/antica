// canvas variables
const canvas = document.querySelector('.game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 704;
canvas.uiWidth = 192;

// game variables
const chat = {
  on: false,
  input: false
};

const game = {
  on: false
};

const state = {
  lastValidPosition: null,
  heldItem: null
};

// path variables
const API_URL_ITEMS = '/saveItemData';
const API_URL_PLAYER = '/savePlayerData';

// player creation variables
const spritePaths = [
  "./assets/sprites/player/player-skins-hair.png",
  "./assets/sprites/player/player-skins-skin.png",
  "./assets/sprites/player/player-skins-cape.png",
  "./assets/sprites/player/player-skins-tunic.png",
  "./assets/sprites/player/player-skins-legs.png",
  "./assets/sprites/player/player-skins-boots.png",
];

const spriteTabs = ['hair', 'skin', 'cape', 'tunic', 'legs', 'boots'];

const sprites = {
  frames: { row: 8, col: 1, size: 128 }, // 8 vertical frames
  hair: { y: 0 },
  skin: { y: 128 },
  cape: { y: 256 },
  tunic: { y: 384 },
  legs: { y: 512 },
  boots: { y: 640 }
};

const selected = {
  hair: 0,
  skin: 0,
  cape: 0,
  tunic: 0,
  legs: 0,
  boots: 0
};

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

const equipSlotsHighlightSpriteLocations = {
  neck: { x: 192, y: 192 },
  head: { x: 256, y: 192 },
  back: { x: 320, y: 192 },
  mainhand: { x: 192, y: 256 },
  chest: { x: 256, y: 256 },
  offhand: { x: 320, y: 256 },
  hands: { x: 192, y: 320 },
  legs: { x: 256, y: 320 },
  feet: { x: 320, y: 320 },
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

const npcData = {
  heremal: {
    name: "Heremal",
    description: "Warpriest",
    spritePositions: { up: { x: 128, y: 0 }, down: { x: 0, y: 0 }, left: { x: 256, y: 0 }, right: { x: 384, y: 0 } },
    worldPosition: { x: 153, y: 187 },
    validMovePositions: [
      { x: 153, y: 187 }, { x: 154, y: 187 }, { x: 155, y: 187 }, { x: 156, y: 187 }, { x: 157, y: 187 }, 
      { x: 153, y: 188 }, { x: 154, y: 188 }, { x: 155, y: 188 }, { x: 156, y: 188 }, { x: 157, y: 188 },
      { x: 153, y: 189 }, { x: 154, y: 189 }, { x: 156, y: 189 }, { x: 157, y: 189 }, 
      { x: 153, y: 190 }, { x: 154, y: 190 }, { x: 155, y: 190 }, { x: 156, y: 190 }, { x: 157, y: 190 },
      { x: 153, y: 191 }, { x: 154, y: 191 }, { x: 155, y: 191 }, { x: 156, y: 191 }, { x: 157, y: 191 }, 
    ],
    responses: {
      greetings: {
        "hi": "Greetings to Genus, Antican.",
        "hello": "Greetings to Genus, Antican.",
        "hey": "Greetings to Genus, Antican.",
      },
      help: {
        "help": "Ass ass titties titties."
      },
      bye: {
        "thanks": "You're welcome.",
        "thx": "Come again.",
        "bye": "Take care.",
        "goodbye": "Safe travels."
      },
    },
    speed: 5000
  }
};

export { 
  API_URL_ITEMS, 
  API_URL_PLAYER, 
  canvas, 
  chat, 
  ctx, 
  equipSlots,
  equipSlotsHighlightSpriteLocations,
  game, 
  inventory, 
  inventorySlots,
  npcData,
  selected,
  spritePaths, 
  sprites, 
  spriteTabs, 
  state,
  uiSections,
  uppermostTileIDs,
  visibleArea, 
  waterTileIDs 
};