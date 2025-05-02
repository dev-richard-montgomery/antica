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
  heldItem: null,
  activeAnimations: [],
  prompt: false
};

const movement = {
  lastMouseX: 0,
  lastMouseY: 0
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
  one: { item: null, open: false, start: null, size: null, scroll: 0, stack: [], backBtn: {x: null, y: null, size: 32}, parentContainer: false },
  two: { item: null, open: false, start: null, size: null, scroll: 0, stack: [], backBtn: {x: null, y: null, size: 32} }
};

const arrows = {
  down: {
    inactive: { x: 0, y: 576 },
    active: { x: 64, y: 576 }
  },
  up: {
    inactive: { x: 0, y: 608},
    active: { x: 64, y: 608 }
  }
};

// toggle variables
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

const centerMessage = {
  text: '',
  startTime: null,
  duration: 2000,
  fadeDuration: 500,
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
        greetings: "Well met, new wanderer. Do you seek <span><em>guidance</em></span>?",
        hi: "Hail. Do you seek counsel or perhaps <span><em>guidance</em></span>?",
        hello: "Greetings, Antican. The winds of destiny are ever upon us. Do you seek <span><em>guidance</em></em></span>?",
        hey: "Ah, another wanderer. Greetings, fellow traveler. Do you seek <span><em>guidance</em></em></span>?",
      },
      dialog: {
        "guidance": "What knowledge do you seek? The <span><em>island</em></span> we call home, the secrets of <span><em>beginnings</em></span>, where to <span><em>hunt</em></span>, the ancient <span><em>purpose</em></span> of our kin, or perhaps tales of the <span><em>mainland</em></span>?",
        "island": "The island is called <span><em>Genus</em></span>. It is said that it has stood since the very dawn of creation.",
        "genus": "Genus is the cradle of humanity, where we were born and shaped by the ancient forces that guide us.",
        "purpose": "The stories of Antica are filled with civilizations rising and crumbling, of races scattered across the land, struggling to find purpose. Now, in this age, we must rise above the chaos and carve out our legacy.",
        "beginnings": "To begin your journey, venture west, where the vendors trade in weapons of war. Arm yourself, for the world is fraught with peril.",
        "hunt": "In the beginning, seek out the rats that infest the cellars below. Learn the ways of combat. Once you have mastered them, you may roam farther.",
        "mainland": "The mainland of Antica is a land of both peril and opportunity. The strong find glory in their deeds, and the worthy earn their death in battle. Only the bold survive the trials that await. Those who serve the Prima Fide believe it is opportunity that is upon us now. That this is the time for man to shape Antica in its image.",
        "butt": "I like butts. I cannot lie.",
        "boob":  "heh... bewbs.",
        "maddox": "Your dad says, \"Hey buddy. Love you. I hope you're doing well.\""
      },
      bye: {
        "thanks": "Your thanks are well met, traveler.",
        "thx": "No need for thanks, fellow warrior.",
        "bye": "May the winds carry you swiftly.",
        "goodbye": "Farewell, Antican. May your path be ever true."
      },
    },
    speed: 5000
  }
};

export { 
  API_URL_ITEMS, 
  API_URL_PLAYER, 
  arrows,
  canvas,
  centerMessage, 
  chat, 
  ctx, 
  equipSlots,
  equipSlotsHighlightSpriteLocations,
  game, 
  inventory, 
  movement,
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