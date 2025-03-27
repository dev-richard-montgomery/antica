import { player } from '../classes/Player.js';
import { spritePaths, spriteTabs, sprites, selected } from '../CONST.js';
import { startIntro } from './intro.js';

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
  };

  getImage() {
    return this.loaded ? this.image : null;
  };
};

class SpriteManager {
  constructor(spriteSources) {
    this.sprites = {};
    this.loadSprites(spriteSources);
  };

  loadSprites(sources) {
    sources.forEach((src, index) => {
      this.sprites[spriteTabs[index]] = new SpriteSheet(src);
    });
  };
  
  getSprite(key) {
    return this.sprites[key]?.getImage();
  };
};

export const spriteManager = new SpriteManager(spritePaths);

export const appendPlayerCreator = () => {
  const playerCreator = document.querySelector('.new-player');
  
  const playerName = document.createElement('h2');
  playerName.classList.add('player-name');
  playerName.textContent = player.name;
  // Create tab container
  const tabContainer = document.createElement('div');
  tabContainer.classList.add("tab-container");

  // Create arrow containers
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
    };
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
    };
  };

  // Save function
  const saveButton = document.createElement('button');
  saveButton.classList.add('bottom');
  saveButton.textContent = 'Save Selection';
  saveButton.onclick = () => {
    player.skin = selected;
    playerCreator.classList.add('hidden');
    console.log(player.skin)
    startIntro();
  };

  // Append spriteTabs
  spriteTabs.forEach(tab => {
    const button = document.createElement('button');
    button.classList.add("character-btn");
    button.textContent = tab;
    
    if (tab === currentTab) {
      button.classList.add("active-tab");
    };
    
    button.onclick = () => {
      document.querySelectorAll(".character-btn").forEach(btn => btn.classList.remove("active-tab"));
      button.classList.add("active-tab");
      selected[currentTab] = currentFrame;
      currentTab = tab;
      currentFrame = selected[currentTab] || 0;
      currentSprite = spriteManager.getSprite(currentTab);
      updateArrows();
      drawFrame(characterctx, currentSprite);
    };
    tabContainer.appendChild(button);
  });
  
  leftDiv.appendChild(leftArrow);
  rightDiv.appendChild(rightArrow);
  canvasContainer.appendChild(characterCanvas);

  playerCreator.appendChild(playerName);
  playerCreator.appendChild(tabContainer);
  playerCreator.appendChild(leftDiv);
  playerCreator.appendChild(canvasContainer);
  playerCreator.appendChild(rightDiv);
  playerCreator.appendChild(saveButton);

  currentSprite = spriteManager.getSprite(currentTab);
  spriteTabs.forEach(tab => {
    const sprite = spriteManager.getSprite(tab);
    if (sprite) {
      drawFrame(characterctx, sprite);
    };
  });

  updateArrows();
};

// Updates the current selection when changing frames
const updateSelection = () => {
  selected[currentTab] = currentFrame;
};

// Draws the current frame
const drawFrame = (ctx, sprite) => {
  ctx.drawImage(
    sprite,
    0,
    currentFrame * sprites.frames.size,
    sprites.frames.size,
    sprites.frames.size,
    -16,
    -16,
    sprites.frames.size,
    sprites.frames.size
  );
};

// Updates the arrow states
const updateArrows = () => {
  document.querySelector('.left-arrow-inactive')?.classList.replace('left-arrow-inactive', 'left-arrow-active');
  document.querySelector('.right-arrow-inactive')?.classList.replace('right-arrow-inactive', 'right-arrow-active');

  if (currentFrame === 0) {
    document.querySelector('.left-arrow-active')?.classList.replace('left-arrow-active', 'left-arrow-inactive');
  };

  if (currentFrame === sprites.frames.row - 1) {
    document.querySelector('.right-arrow-active')?.classList.replace('right-arrow-active', 'right-arrow-inactive');
  };
};