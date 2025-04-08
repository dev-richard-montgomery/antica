import { player } from '../classes/Player.js';
import { chat, game } from '../CONST.js';
import { getNpcList } from '../classes/NPCManager.js';


// Function to set focus on the chat input
export const setFocusToChatInput = () => {
  const chatInput = document.getElementById("chatInput");
  chatInput.focus();
};

// Function to remove focus from the chat input
export const removeFocusFromChatInput = () => {
  const chatInput = document.getElementById("chatInput");
  chatInput.blur();
};

// Function to add a message to the chatbox
export const addMessage = (sender, text) => {
  const chatbox = document.getElementById("chatbox");
  const message = document.createElement("div");
  
  // Check if the message is the clear command
  if (text.trim() === "/c") {
    chatbox.innerHTML = ""; // Clears the chatbox
    return; // Exit the function so nothing else gets appended
  };
  
  // Check for commands - /y /w 
  if (text.startsWith("/y ")) {
    text = '*yells* ' + text.slice(3).toUpperCase() + "!"; // Remove "/y" and convert to uppercase
  };
  
  if (text.startsWith("/w ")) {
    text = '*whispers* ' + text.slice(3).toLowerCase(); // Remove "/y" and convert to uppercase
  };
  
  // message.classList.add("message", sender);
  message.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatbox.appendChild(message);
  chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom of the chatbox
};

export const conversate = (e) => {
  const chatInput = document.getElementById("chatInput");
  const npcList = getNpcList();
  
  if (game.on) {
    if (e.key === "Enter") {
      if (chat.on) {
        const text = chatInput.value.trim();
        if (text) {
          addMessage(player.name, text);
          
          npcList.forEach(npc => {
            if (npc.isPlayerNearby()) {
              const greetingKey = Object.keys(npc.responses.greetings).find(key => text.toLowerCase().includes(key));
              if (greetingKey) {
                npc.interact();
                console.log(greetingKey);
                addMessage(npc.name, npc.responses.greetings[greetingKey]);
              };
              
              if (!npc.isMoving) {
                const dialogKey = Object.keys(npc.responses.dialog).find(key => text.toLowerCase().includes(key));
                if (dialogKey) {
                  addMessage(npc.name, npc.responses.dialog[dialogKey]);
                };
                
                const byeKey = Object.keys(npc.responses.bye).find(key => text.toLowerCase().includes(key));
                if (byeKey) {
                  addMessage(npc.name, npc.responses.bye[byeKey]);
                  npc.resumeMovement();
                };
              };
            };
          });            
          
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
  
    // might move this to a more expected spot.
    if (!chat.on) {
      player.playerMove(e);
    };
  };
}
/*
SPELLS
find person - exiva "name"
conjure food - exevo pan
light - utevo lux
light heal - exura
cure poison - exana pox
conjure arrow - exevo con
great light - utevo gran lux
great heal - exura gran
ultimate heal - exura vita
*/