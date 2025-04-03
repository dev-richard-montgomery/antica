import { npcData } from '../CONST.js';
import { NPC } from './NPC.js';

export const npcList = Object.values(npcData).map(npc => 
  new NPC(npc.name, npc.spritePositions, npc.worldPosition, npc.validMovePositions, npc.responses, npc.speed)
);

export const getNpcList = () => {
  return npcList;
};