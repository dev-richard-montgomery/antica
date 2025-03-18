import { canvas, ctx, game } from './CONST.js';
import { login } from './utils/login.js';
import { status } from './Status.js';
import { player } from './classes/Player.js';
import { mapArea } from './classes/MapArea.js';

const drawAll = () => {
  status();
  mapArea.drawArea();
  player.draw();
  mapArea.drawUpperMostTiles();
};

// event handlers ------------------------------------------------------------------------
addEventListener("DOMContentLoaded", e => {  
  document.querySelector('#login-form').addEventListener('submit', login, { once: true });

  addEventListener('keydown', player.playerMove);


});

// game loop -----------------------------------------------------------------------------
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update game logic
  if (game.on) {
    drawAll();
  };

  // Call the next frame
  requestAnimationFrame(gameLoop);
};

gameLoop();