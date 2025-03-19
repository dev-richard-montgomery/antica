import { canvas, ctx, uiSections, visibleArea } from '../CONST.js';

class Ui {
  constructor() {
    this.image = new Image();
    this.image.src = './assets/sprites/ui-assets.png';
    this.btnSize = 64;
    this.state = {
      activeToggle: 'inventory',
      activeStance: 'passive', // Can be 'offense', 'defense', or 'passive'
    };
  }

  loadImage() {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve(this.image);
      this.image.onerror = () => reject(new Error('Failed to load UI image.'));
    });
  }

  draw = () => {
    const { top, uiBar, bottom } = uiSections;

    const drawSection = (sprite, location, width = sprite.width, height = sprite.height) => {
      if (sprite && location) {
        ctx.drawImage(this.image, sprite.x, sprite.y, width, height, location.x, location.y, width, height);
      }
    };

    // Clear UI section
    ctx.clearRect(visibleArea.width, 0, canvas.uiWidth, canvas.height);

    // Draw UI bar background
    drawSection(uiBar.bar, uiBar.location);

    // UI buttons mapping
    const uiBarButtons = {
      map: { section: top.miniMap, button: uiBar.mapButton, location: uiBar.mapButtonLocation },
      inventory: { section: top.equipArea, button: uiBar.inventoryButton, location: uiBar.inventoryButtonLocation },
      player: { section: top.playerDetails, button: uiBar.playerButton, location: uiBar.playerButtonLocation },
    };

    if (uiBarButtons[this.state.activeToggle]) {
      const { section, button, location } = uiBarButtons[this.state.activeToggle];
      drawSection(section, top.location, top.miniMap.width, top.miniMap.height); // Top section
      drawSection(button, location, this.btnSize, this.btnSize); // Active button
    }

    // Content area background based on active toggle
    if (["map", "inventory", "player"].includes(this.state.activeToggle)) {
      ctx.drawImage(this.image, 192, 0, 192, 64, visibleArea.width, 256, 192, 64);
      for (let y = 320; y <= (this.state.activeToggle === "player" ? 512 : 576); y += 64) {
        ctx.drawImage(this.image, 192, 64, 192, 64, visibleArea.width, y, 192, 64);
      }
      ctx.drawImage(this.image, 192, 128, 192, 64, visibleArea.width, this.state.activeToggle === "player" ? 576 : 640, 192, 64);
    }

    // Draw stance buttons if player UI is active
    if (this.state.activeToggle === 'player') {
      const stanceSprites = {
        offense: bottom.offense,
        defense: bottom.defense,
        passive: bottom.passive,
      };

      const stanceLocations = {
        offense: bottom.offenseLocation,
        defense: bottom.defenseLocation,
        passive: bottom.passiveLocation,
      };

      drawSection(bottom.sprite, bottom.location);
      drawSection(stanceSprites[this.state.activeStance], stanceLocations[this.state.activeStance], this.btnSize, this.btnSize);
    }
  };

  handleUiStates = (e) => {
    const { uiBar, bottom } = uiSections;
    const { offsetX, offsetY, type } = e;

    const isMouseOverButton = (button) =>
      button && offsetX >= button.x && offsetX <= button.x + this.btnSize && offsetY >= button.y && offsetY <= button.y + this.btnSize;

    const handleInteraction = (buttons, stateUpdater) => {
      for (const [key, button] of Object.entries(buttons)) {
        if (isMouseOverButton(button)) {
          if (type === "mousedown") {
            stateUpdater(key);
            this.draw();
          }
          return "pointer"; // Indicate cursor should be a pointer
        }
      }
      return null; // No interaction
    };

    const uiBarButtons = {
      map: uiBar.mapButtonLocation,
      inventory: uiBar.inventoryButtonLocation,
      player: uiBar.playerButtonLocation,
    };

    if (this.state.activeToggle === "player") {
      const stanceButtons = {
        offense: bottom.offenseLocation,
        defense: bottom.defenseLocation,
        passive: bottom.passiveLocation,
      };

      return (
        handleInteraction(uiBarButtons, (key) => (this.state.activeToggle = key)) ||
        handleInteraction(stanceButtons, (key) => (this.state.activeStance = key))
      );
    }

    return handleInteraction(uiBarButtons, (key) => (this.state.activeToggle = key));
  };
}

export const ui = new Ui();