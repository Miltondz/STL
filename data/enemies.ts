// data/enemies.ts
import { Combatant } from '../types';

// Plantillas para crear Combatants enemigos.
// El estado (hp, shield, etc.) se inicializará al crear el combate.
export const ENEMY_TEMPLATES: Record<string, Omit<Combatant, 'hp' | 'shield' | 'dead' | 'isPlayer'>> = {
  PIRATE_RAIDER: {
    id: 'PIRATE_RAIDER',
    name: 'Incursor Pirata',
    image: 'https://i.ibb.co/cc3KwbCG/ship-50-pirata.jpg',
    maxHp: 20,
    maxShield: 10,
    baseDamage: 5,
    reward: { credits: 8, xpReward: 25 },
    pattern: ['ATTACK', 'ATTACK_DEFEND', 'ATTACK'],
    patternIndex: 0,
  },
  HEAVY_DRONE: {
    id: 'HEAVY_DRONE',
    name: 'Dron Pesado',
    image: 'https://i.ibb.co/fYVmhtxT/ship-52-dron.jpg',
    maxHp: 30,
    maxShield: 5,
    baseDamage: 7,
    reward: { credits: 12, xpReward: 40 },
    pattern: ['DEFEND', 'ATTACK', 'ATTACK'],
    patternIndex: 0,
  },
  MINIBOSS_CORVETTE: {
    id: 'MINIBOSS_CORVETTE',
    name: 'Corbeta de Élite',
    image: 'https://i.ibb.co/S7JwCS5b/ship-30-destructor.jpg',
    maxHp: 50,
    maxShield: 25,
    baseDamage: 8,
    reward: { credits: 30, xpReward: 100 },
    // Este patrón es más complejo: se defiende, ataca, luego se potencia para un gran ataque.
    pattern: ['DEFEND', 'ATTACK', 'BUFF', 'ATTACK'],
    patternIndex: 0,
  },
};