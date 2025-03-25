import { player } from '../classes/Player.js';

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

let selected = {
  hair: 0,
  skin: 0,
  cape: 0,
  tunic: 0,
  legs: 0,
  boots: 0
};

let currentTab = 'hair';
let currentFrame = 0;
let currentSprite = {};

class SpriteSheet {
  constructor(src) {
    this.image = new Image();
    this.image.src = src;
    this.loaded = false;

    this.image.onload = () => {
        this.loaded = true;
    };
  }

  getImage() {
    return this.loaded ? this.image : null;
  }
};

class SpriteManager {
  constructor(spriteSources) {
    this.sprites = {}; // Stores all spritesheets
    this.loadSprites(spriteSources);
  }

  loadSprites(sources) {
    sources.forEach((src, index) => {
      this.sprites[spriteTabs[index]] = new SpriteSheet(src);
    });
  }
  
  getSprite(key) {
    return this.sprites[key]?.getImage();
  }
};

const spriteManager = new SpriteManager(spritePaths);

export const appendPlayerCreator = () => {
  const playerCreator = document.querySelector('.new-player');

  // Create tab container
  const tabContainer = document.createElement('div');
  tabContainer.classList.add("tab-container");

  // Create left and right arrows
  const leftDiv = document.createElement('div');
  leftDiv.classList.add('left');

  const rightDiv = document.createElement('div');
  rightDiv.classList.add('right');

  // Create canvas
  const canvasContainer = document.createElement('div');
  canvasContainer.classList.add('canvas-container');
  const characterCanvas = document.createElement('canvas');
  const characterctx = characterCanvas.getContext('2d');
  characterCanvas.width = sprites.frames.size;
  characterCanvas.height = sprites.frames.size;

  // Create arrows
  const leftArrow = document.createElement('button');
  leftArrow.textContent = '<';
  leftArrow.classList.add('left-arrow-inactive');
  leftArrow.onclick = () => {
    if (currentFrame > 0) {
      currentFrame--;
      updateSelection();
      updateArrows();
      drawFrame(characterctx, currentSprite);
    }
  };

  const rightArrow = document.createElement('button');
  rightArrow.textContent = '>';
  rightArrow.classList.add('right-arrow-active');
  rightArrow.onclick = () => {
    if (currentFrame < sprites.frames.row - 1) {
      currentFrame++;
      updateSelection();
      updateArrows();
      drawFrame(characterctx, currentSprite);
    }
  };

  // Save function
  const saveButton = document.createElement('button');
  saveButton.classList.add('bottom');
  saveButton.textContent = 'Save Selection';
  saveButton.onclick = () => {
    console.log('Selected:', selected);
    drawCharacter(); // Draw final character with selections
  };

  // Append spriteTabs
  spriteTabs.forEach(tab => {
    const button = document.createElement('button');
    button.classList.add("character-btn");
    button.textContent = tab;
    button.onclick = () => {
      selected[currentTab] = currentFrame; // Save previous selection
      currentTab = tab;
      currentFrame = selected[currentTab] || 0; // Restore saved selection
      currentSprite = spriteManager.getSprite(currentTab);
      updateArrows();
      drawFrame(characterctx, currentSprite);
    };
    tabContainer.appendChild(button);
  });

  leftDiv.appendChild(leftArrow);
  rightDiv.appendChild(rightArrow);
  canvasContainer.appendChild(characterCanvas);

  playerCreator.appendChild(tabContainer);
  playerCreator.appendChild(leftDiv);
  playerCreator.appendChild(canvasContainer);
  playerCreator.appendChild(rightDiv);
  playerCreator.appendChild(saveButton);

  currentSprite = spriteManager.getSprite(currentTab);
  drawFrame(characterctx, currentSprite);
  updateArrows();
};

// Updates the current selection when changing frames
function updateSelection() {
  selected[currentTab] = currentFrame;
}

// Draws the current frame
function drawFrame(ctx, sprite) {
  // ctx.clearRect(0, 0, sprites.frames.size, sprites.frames.size); // Clear previous frame
  ctx.drawImage(
    sprite,
    0, // X is always 0, since we move vertically
    currentFrame * sprites.frames.size, // Move down
    sprites.frames.size,
    sprites.frames.size,
    0,
    0,
    sprites.frames.size,
    sprites.frames.size
  );
}

// Updates the arrow states
function updateArrows() {
  document.querySelector('.left-arrow-inactive')?.classList.replace('left-arrow-inactive', 'left-arrow-active');
  document.querySelector('.right-arrow-inactive')?.classList.replace('right-arrow-inactive', 'right-arrow-active');

  if (currentFrame === 0) {
    document.querySelector('.left-arrow-active')?.classList.replace('left-arrow-active', 'left-arrow-inactive');
  }
  if (currentFrame === sprites.frames.row - 1) {
    document.querySelector('.right-arrow-active')?.classList.replace('right-arrow-active', 'right-arrow-inactive');
  }
}

// Draws the final character using selected options
function drawCharacter() {
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = sprites.frames.size;
  finalCanvas.height = sprites.frames.size;
  const finalCtx = finalCanvas.getContext('2d');

  spriteTabs.forEach(tab => {
    const sprite = spriteManager.getSprite(tab);
    if (sprite) {
      finalCtx.drawImage(
        sprite,
        0,
        selected[tab] * sprites.frames.size, // Use saved frame position
        sprites.frames.size,
        sprites.frames.size,
        0,
        0,
        sprites.frames.size,
        sprites.frames.size
      );
    }
  });

  document.body.appendChild(finalCanvas); // Append final character display
}
