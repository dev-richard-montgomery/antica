import { player } from './classes/Player.js';

export const status = () => {
  const container = document.querySelector(".player-details-container");
  if (!container) return;

  const { name, lvls, state, stats, equipped, skills } = player;
  const { mainhand: offense, offhand: defense } = equipped;

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  container.innerHTML = `
    <div class="player-details-container-border noselect">
      <h2>${name}</h2>
      
      <p><strong>Level:</strong> ${lvls.lvl}</p>
      <p><strong>Magic Level:</strong> ${lvls.mglvl}</p>
      
      <br>
      
      <p><strong>Health:</strong> ${state.health}/${stats.health}</p>
      <p><strong>Magic:</strong> ${state.magic}/${stats.magic}</p>
      <p><strong>Capacity:</strong> ${state.capacity}/${stats.capacity}</p>
      
      <br>
      
      ${offense?.tool === "fishing" ? `<p><strong>${capitalize(offense.tool)}:</strong> ${skills[offense.tool]}</p>` : ""}
      ${offense ? `<p><strong>${capitalize(offense.name)}:</strong> ${skills[offense.name]}</p>` : ""}
      ${defense ? `<p><strong>Defense:</strong> ${skills.shield}</p>` : ""}
    </div>
  `;
};