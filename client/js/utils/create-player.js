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
  frames: { row: 8, col: 4, size: 128 },
  hair: { x: 0, y: 0 },
  skin: { x: 0, y: 128 },
  cape: { x: 0, y: 256 },
  tunic: { x: 0, y: 384 },
  legs: { x: 0, y: 512 },
  boots: { x: 0, y: 640 }
};

let selected = {};
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
  // display player creator div
  const playerCreator = document.querySelector('.new-player');

  // create spriteTabs container for attributes
  const tabContainer = document.createElement('div');
  tabContainer.classList.add("tab-container")
  
  // create arrow containers
  const leftDiv = document.createElement('div');
  leftDiv.classList.add('left');
  
  const rightDiv = document.createElement('div');
  rightDiv.classList.add('right');

  // create canvas
  const canvasContainer = document.createElement('div');
  canvasContainer.classList.add('.canvas-container');
  const characterCanvas = document.createElement('canvas');
  const characterctx = characterCanvas.getContext('2d');
  characterCanvas.width = sprites.frames.size;
  characterCanvas.height = sprites.frames.size;
  
  // create arrows
  const leftArrow = document.createElement('button');
  leftArrow.textContent = '<';
  leftArrow.classList.add('left-arrow-inactive');
  leftArrow.onclick = () => {
    if (currentFrame > 0) {
      currentFrame--;
      updateArrows();
      drawFrame(characterctx, currentSprite);
    }
  };
  
  const rightArrow = document.createElement('button');
  rightArrow.textContent = '>';
  rightArrow.classList.add('right-arrow-active');
  rightArrow.onclick = () => {
    if (currentFrame < sprites.frames.col - 1) {
      currentFrame++;
      updateArrows();
      drawFrame(characterctx, currentSprite);
    }
  };
  
  // save function
  const saveButton = document.createElement('button');
  saveButton.classList.add('bottom');
  saveButton.textContent = 'Save Selection';
  saveButton.onclick = () => {
    selected[currentTab] = { x: currentFrame * sprites.frames.size, y: sprites[currentTab].y };
    console.log('Selected:', selected);
  };
  
  // append spriteTabs to spriteTabs container
  ['hair', 'skin', 'cape', 'tunic', 'legs', 'boots'].forEach(tab => {
    const button = document.createElement('button');
    button.classList.add("character-btn")
    button.textContent = tab;
    button.onclick = () => {
      currentTab = tab;
      currentFrame = 0;
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

function drawFrame(ctx, sprite) {
  ctx.drawImage(
    sprite,
    sprites[currentTab].x,
    currentFrame * sprites.frames.size, 
    sprites.frames.size, 
    sprites.frames.size,
    0, 
    0,
    sprites.frames.size, 
    sprites.frames.size
  );
}

function updateArrows() {
  document.querySelector('.left-arrow-inactive')?.classList.replace('left-arrow-inactive', 'left-arrow-active');
  document.querySelector('.right-arrow-inactive')?.classList.replace('right-arrow-inactive', 'right-arrow-active');

  if (currentFrame === 0) {
    document.querySelector('.left-arrow-active')?.classList.replace('left-arrow-active', 'left-arrow-inactive');
  }
  if (currentFrame === sprites.frames.col - 1) {
    document.querySelector('.right-arrow-active')?.classList.replace('right-arrow-active', 'right-arrow-inactive');
  }
}

function drawSelectedCharacter(ctx) {
  const img = new Image();
  img.src = 'spritesheet.png';
  img.onload = () => {
    ctx.clearRect(0, 0, sprites.frames.size, sprites.frames.size);
    Object.keys(selected).forEach(layer => {
      ctx.drawImage(
        img,
        selected[layer].x, selected[layer].y,
        sprites.frames.size, sprites.frames.size,
        0, 0,
        sprites.frames.size, sprites.frames.size
      );
    });
  };
}