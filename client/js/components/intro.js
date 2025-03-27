import { canvas, game } from '../CONST.js';

const intro = document.querySelector('.intro');

// Helper function to fade in elements
const fadeInElement = (element, delay) => {
  setTimeout(() => {
    element.classList.remove('hidden'); // Remove 'hidden' to make it visible
    element.classList.add('fade-in'); // Add fade-in class (use CSS for the fade effect)
  }, delay);
};

// Helper function to append a button to proceed into the game
const appendButton = () => {
  setTimeout(() => {
    const button = document.createElement('button');
    button.textContent = 'Enter Genus Island';
    button.addEventListener('click', () => {
      // You can define what happens when the button is clicked
      console.log('Entering World');
      intro.classList.add('hidden');
      document.querySelector('.game-container')?.classList.remove('hidden');
      game.on = true;
      canvas.style.cursor = 'crosshair';
    });
    intro.appendChild(button);
  }, 10000); // Show button after the last section fades in
};

// Main function to handle the intro sequence
export const startIntro = () => {
  intro.classList.remove('hidden');
  const intro1 = document.querySelector('.intro-1');
  const intro2 = document.querySelector('.intro-2');

  // Fade in each section with a 5-second delay for each
  fadeInElement(intro1, 800); // Fade in after 1 second
  fadeInElement(intro2, 3000); // Fade in after 6 seconds

  // Append button after all sections have faded in
  appendButton();
};
