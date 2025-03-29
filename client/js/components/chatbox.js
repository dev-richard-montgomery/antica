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
  message.classList.add("message", sender);
  message.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatbox.appendChild(message);
  chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom of the chatbox
};

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