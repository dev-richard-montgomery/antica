import { canvas, ctx, game } from './CONST.js';
import { login } from './utils/login.js';
import { status } from './Status.js';
import { player } from './classes/Player.js';
import { mapArea } from './classes/MapArea.js';
import { ui } from './classes/UserInterface.js';

const drawAll = () => {
  status();
  mapArea.drawArea();
  player.draw();
  mapArea.drawUpperMostTiles();
  ui.draw();
};

// event handlers ------------------------------------------------------------------------
addEventListener("DOMContentLoaded", e => {  
  document.querySelector('#login-form').addEventListener('submit', login, { once: true });

  addEventListener('keydown', player.playerMove);

  canvas.addEventListener("mousedown", e => {
    // handleMouseDown(e);
    ui.handleUiStates(e);
  });

  canvas.addEventListener("mousemove", e => {
    // handleMouseMove(e);
    ui.handleUiStates(e);
  }); 

  // canvas.addEventListener("mouseup", e => {
  //   handleMouseUp(e);
  // });

  // canvas.addEventListener("contextmenu", e => {
  //   handleRightClick(e);
  // });

  // // window.addEventListener('resize', resizeCanvas);

  // addEventListener('beforeunload', async (e) => {
  //   await updateAndPostGameData();
  // });
});

// game loop -----------------------------------------------------------------------------
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update game logic
  if (game.on) {
    drawAll();
  };

  requestAnimationFrame(gameLoop);
};

gameLoop();