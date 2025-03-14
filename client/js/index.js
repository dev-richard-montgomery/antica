import { login } from './utils/login.js';
import { canvas, ctx, game } from './CONST.js';
import { mapArea } from './classes/MapArea.js';

addEventListener("DOMContentLoaded", e => {  
  document.querySelector('#login-form').addEventListener('submit', login, { once: true });
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update game logic
  if (game.on) {
    mapArea.drawArea();
  };
  // Draw functions

  // drawAll();

  // Call the next frame
  requestAnimationFrame(gameLoop);
};

gameLoop();