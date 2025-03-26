import { player } from '../classes/Player.js';
import { appendPlayerCreator } from './create-player.js';

export const login = async e => {
  e.preventDefault();

  const capitalizeWords = input => {  
    return input.split(' ').map(word => word[0]?.toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
  
  const nameInput = document.querySelector('#playername').value.trim();
  const playerName = capitalizeWords(nameInput);
  player.createPlayer(playerName);
  
  setTimeout(() => {
    const form = document.querySelector('.form-container');
    form.style.display = 'none';
    form.blur();

    document.querySelector('.background').remove();

    appendPlayerCreator();
  }, 500);
};