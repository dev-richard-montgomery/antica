import { canvas, ctx, chat, game } from './CONST.js';
import { login } from './components/login.js';
import { player } from './classes/Player.js';
import { ui } from './classes/UserInterface.js';
import { addMessage, setFocusToChatInput, removeFocusFromChatInput } from './components/chatbox.js';
import { handleMouseMove, handleMouseDown, handleMouseUp } from './MouseEvents.js';
import { drawAll } from './utils/utils.js';

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

// items in water get deleted
// inventory
// depot
// stats and items
// create chat box
// create npcs and interaction
// player list
// create enemies
// create attacking, stats increase, item drop
