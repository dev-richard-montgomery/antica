import { canvas, ctx, game } from './CONST.js';
import { login } from './components/login.js';
import { ui } from './classes/UserInterface.js';
import { handleMouseMove, handleMouseDown, handleMouseUp } from './MouseEvents.js';
import { drawAll } from './utils/utils.js';
import { getNpcList } from './classes/NPCManager.js';
import { conversate } from './components/chatbox.js';

// get npc list
const npcList = getNpcList();

// event handlers ------------------------------------------------------------------------
addEventListener("DOMContentLoaded", e => {  
  document.querySelector('#login-form').addEventListener('submit', login, { once: true });
  
  canvas.addEventListener("mousedown", e => {
    handleMouseDown(e);
    ui.handleUiStates(e);
  });

  canvas.addEventListener("mousemove", e => {
    handleMouseMove(e);
    ui.handleUiStates(e);
  }); 

  canvas.addEventListener("mouseup", e => {
    handleMouseUp(e);
  });

  document.addEventListener("keydown", e => {
    conversate(e);
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
    });
  };

  requestAnimationFrame(gameLoop);
};

gameLoop();

  // document.addEventListener("keydown", (e) => {
  //   if (e.key === "Enter") {
  //     const chatInput = document.getElementById("chatInput");
  //     const text = chatInput.value.trim();
  //     if (text) {
  //       addMessage("Player", text);
  //       checkNPCChatInteraction(player.worldPosition, text); // Check for NPCs nearby
  //       chatInput.value = "";
  //     }
  //   }
  // });

  // canvas.addEventListener("contextmenu", e => {
  //   handleRightClick(e);
  // });

  // // window.addEventListener('resize', resizeCanvas);

  // addEventListener('beforeunload', async (e) => {
  //   await updateAndPostGameData();
  // });


// items in water get deleted
// inventory
// depot
// stats and items
// create chat box
// create npcs and interaction
// player list
// create enemies
// create attacking, stats increase, item drop
