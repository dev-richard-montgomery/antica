export class Ui {
  constructor() {
    this.image = new Image();
    this.image.src = './backend/assets/ui_data/ui-elements-assets.png';
    this.pixels = 64;
    this.top = {
      location: { x: screenWidth, y: 0 },
      miniMap: { x: 0, y: 0, width: 192, height: 192 },
      equipArea: { x: 0, y: 192, width: 192, height: 192 },
      playerDetails: { x: 0, y: 384, width: 192, height: 192 },
    };
    this.equipped = {
      neck: { x: 0, y: 192 },
      head: { x: 64, y: 192 },
      back: { x: 128, y: 192 },
      mainhand: { x: 0, y: 256 },
      chest: { x: 64, y: 256 },
      offhand: { x: 128, y: 256 },
      hands: { x: 0, y: 320 },
      legs: { x: 64, y: 320 },
      feet: { x: 128, y: 320 },
    };
    this.toggle = {
      location: { x: screenWidth, y: 192 },
      sprite: { x: 192, y: 384, width: 192, height: 64 },
      mapButton: { x: 192, y: 448 },
      mapButtonLocation: { x: screenWidth, y: 192 },
      inventoryButton: { x: 256, y: 448 },
      inventoryButtonLocation: { x: screenWidth + 64, y: 192 },
      playerButton: { x: 320, y: 448 },
      playerButtonLocation: { x: screenWidth + 128, y: 192 }
    };
    this.stance = {
      location: { x: screenWidth, y: 640 },
      sprite: { x: 192, y: 512, width: 192, height: 64 },
      offense: { x: 192, y: 576 },
      offenseLocation: { x: screenWidth, y: 640 },
      defense: { x: 256, y: 576 },
      defenseLocation: { x: screenWidth + 64, y: 640 },
      passive: { x: 320, y: 576 },
      passiveLocation: { x: screenWidth + 128, y: 640 }
    },
    this.misc = {
      arrows: {},
      selectors: {},
      health: {},
      mana: {},
      strength: {},
      xmark: {}
    };
    this.state = {
      activeToggle: 'inventory',
      activeStance: 'passive'
    };
  };

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load area image.'));
    });
  };
};