import { player } from '../classes/Player.js';
import { canvas, game } from '../CONST.js';

export const login = async e => {
  e.preventDefault();

  const capitalizeWords = input => {  
    return input.split(' ').map(word => word[0]?.toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  
  const nameInput = document.querySelector('#playername').value.trim();
  const playerName = capitalizeWords(nameInput);
  player.createPlayer(playerName);
  // resources.itemData.itemsInGame.length > 0 && inGameItems.push(resources.itemData.itemsInGame);
  // populateInGameItems();
  
  setTimeout(() => {
    const form = document.querySelector('.form-container');
    form.style.display = 'none';
    form.blur();

    
    document.querySelector('.background').remove();
    document.querySelector('.game-container')?.classList.remove('hidden');
    
    game.on = true;
    canvas.style.cursor = 'crosshair';
  }, 500);
};