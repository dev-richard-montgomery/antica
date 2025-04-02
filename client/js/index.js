import { canvas, ctx, chat, game, npcData } from './CONST.js';
import { NPC } from './classes/NPC.js';
import { login } from './components/login.js';
import { player } from './classes/Player.js';
import { ui } from './classes/UserInterface.js';
import { addMessage, setFocusToChatInput, removeFocusFromChatInput } from './components/chatbox.js';
import { handleMouseMove, handleMouseDown, handleMouseUp } from './MouseEvents.js';
import { drawAll } from './utils/utils.js';

// init all npcs
export const npcList = Object.values(npcData).map(npc => 
  new NPC(npc.name, npc.spritePositions, npc.worldPosition, npc.validMovePositions, npc.responses, npc.speed)
);

// init all creatures

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
    const chatInput = document.getElementById("chatInput");
  
    if (game.on) {
      if (e.key === "Enter") {
        if (chat.on) {
          const text = chatInput.value.trim();
          if (text) {
            addMessage(player.name, text);
            chatInput.value = "";
          };
          chat.on = false;
          chatInput.setAttribute("readonly", true); // Disable input again
          removeFocusFromChatInput();
        } else {
          chat.on = true;
          chatInput.removeAttribute("readonly"); // Allow typing
          setFocusToChatInput();
        };
        e.preventDefault();
        return;
      };
    
      if (!chat.on) {
        player.playerMove(e);
      };
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
        npc.move(currentTime);           // Update the NPC's movement
        npc.updateDrawPosition();        // Update the NPC's draw position
        npc.draw();   // Draw the NPC with its updated position and direction
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
