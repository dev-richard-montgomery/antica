import { canvas, ctx, game, movement } from './CONST.js';
import { login } from './components/login.js';
import { ui } from './classes/UserInterface.js';
import { handleMouseMove, handleMouseDown, handleMouseUp, handleRightClick } from './MouseEvents.js';
import { drawAll, drawCenterMessage } from './utils/utils.js';
import { getNpcList } from './classes/NPCManager.js';
import { conversate } from './components/chatbox.js';
import { player } from './classes/Player.js';

// get npc list
const npcList = getNpcList();

// event handlers ------------------------------------------------------------------------
addEventListener("DOMContentLoaded", e => {  
  document.querySelector('#login-form').addEventListener('submit', login, { once: true });
  
  document.addEventListener("keydown", e => {
    conversate(e);
  });

  canvas.addEventListener("mousedown", e => {
    handleMouseDown(e);
    ui.handleUiStates(e);
  });

  canvas.addEventListener("mousemove", e => {
    movement.lastMouseX = e.clientX;
    movement.lastMouseY = e.clientY;
    handleMouseMove(e);
    ui.handleUiStates(e);
  }); 

  canvas.addEventListener("mouseup", e => {
    handleMouseUp(e);
  });

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // Prevent default right-click menu
    handleRightClick(e);
  
    if (player.equipped.mainhand?.tool === 'fishing') {
      player.isFishing = true; // Set fishing mode to true
      // canvas.style.cursor = "pointer";
    };

  });
  
  
});

// game loop -----------------------------------------------------------------------------
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update game logic
  if (game.on) {
    const currentTime = performance.now(); // Get current time in milliseconds
    drawAll();

    npcList.forEach(npc => {
      if (npc.isVisibleOnScreen()) {
        npc.checkPlayerDistance(); 
        npc.move(currentTime);
        npc.updateDrawPosition();
        npc.draw();
      };
    }); // consider moving this into my drawAll

    drawCenterMessage();
  };

  requestAnimationFrame(gameLoop);
};

gameLoop();

  // // window.addEventListener('resize', resizeCanvas);

  // addEventListener('beforeunload', async (e) => {
  //   await updateAndPostGameData();
  // });


// inventory
// depot
// player list
// create enemies
// create attacking, stats increase, item drop
