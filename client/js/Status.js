import { player } from './classes/Player.js';

export const status = () => {
  const container = document.querySelector(".player-details-container");
  if (!container) return;

  const { name, lvls, state, baseStats, equipped, skills } = player;
  const { mainhand: offense, offhand: defense } = equipped;

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  container.innerHTML = `
    <div class="player-details-container-border noselect">
      <h2>${name}</h2>
      
      <p><strong>Level:</strong> ${lvls.lvl}</p>
      <p><strong>Magic Level:</strong> ${lvls.mglvl}</p>
      
      <br>
      
      <p><strong>Health:</strong> ${state.health}/${baseStats.health}</p>
      <p><strong>Magic:</strong> ${state.magic}/${baseStats.magic}</p>
      <p><strong>Capacity:</strong> ${state.capacity}/${baseStats.capacity}</p>
      
      <br>

      ${offense?.tool === "fishing" ? `<p><strong>Fishing Skill:</strong> ${skills.fishing}</p>` :
        offense ? `<p><strong>${capitalize(offense.skill)} Skill:</strong> ${skills[offense.skill]}</p>` : ""}

      ${defense ? `<p><strong>Shield Skill:</strong> ${skills.shield}</p>` : ""}
    </div>
  `;
};