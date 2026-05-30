import { NodeType, EventCardData, PlayerState, SimulationResult } from '../types';
import { getEncounterDeck, getHazardDeck, getEnemyTemplates } from '../data';

// Mantiene un registro de las cartas usadas para evitar repeticiones en una misma partida.
const usedEncounterCardIds = new Set<string>();
const usedHazardCardIds = new Set<string>();
const usedSpecialEventCardIds = new Set<string>();

/**
 * Reinicia el estado de las cartas de eventos usadas.
 * Útil cuando se inicia una nueva partida.
 */
export const resetEventCardStates = (): void => {
    usedEncounterCardIds.clear();
    usedHazardCardIds.clear();
    usedSpecialEventCardIds.clear();
};

// Obtiene una carta aleatoria del mazo de encuentros que no haya sido usada.
const getEncounterCard = (): EventCardData => {
  const ENCOUNTER_DECK = getEncounterDeck(); // Usar datos dinámicos
  const availableCards = ENCOUNTER_DECK.filter(card => !usedEncounterCardIds.has(card.id));
  if (availableCards.length === 0) {
    // Si se acaban, se resetea el mazo (o se podría manejar de otra forma).
    usedEncounterCardIds.clear();
    return ENCOUNTER_DECK[Math.floor(Math.random() * ENCOUNTER_DECK.length)];
  }
  const card = availableCards[Math.floor(Math.random() * availableCards.length)];
  usedEncounterCardIds.add(card.id);
  return card;
};

// Obtiene una carta aleatoria del mazo de peligros que no haya sido usada.
const getHazardCard = (): EventCardData => {
    const HAZARD_DECK = getHazardDeck(); // Usar datos dinámicos
    const availableCards = HAZARD_DECK.filter(card => !usedHazardCardIds.has(card.id));
    if (availableCards.length === 0) {
        usedHazardCardIds.clear();
        return HAZARD_DECK[Math.floor(Math.random() * HAZARD_DECK.length)];
    }
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    usedHazardCardIds.add(card.id);
    return card;
};

// Obtiene una carta aleatoria para eventos especiales (usa encuentros como base)
const getSpecialEventCard = (): EventCardData => {
    const ENCOUNTER_DECK = getEncounterDeck(); // Usar datos dinámicos
    const availableCards = ENCOUNTER_DECK.filter(card => !usedSpecialEventCardIds.has(card.id));
    if (availableCards.length === 0) {
        usedSpecialEventCardIds.clear();
        return ENCOUNTER_DECK[Math.floor(Math.random() * ENCOUNTER_DECK.length)];
    }
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    usedSpecialEventCardIds.add(card.id);
    return card;
};

// Simula la resolución de nodos que no usan el sistema de cartas.
const getSimulatedNodeResolution = (type: NodeType, state: PlayerState): SimulationResult => {
    switch(type) {
        case NodeType.END:
             return {
                newState: state,
                log: "¡Felicidades! Has llegado al final del sector. Tu viaje continúa..."
            }
        default:
            return { newState: state, log: `Evento para ${type} no implementado.`}
    }
};

// Función principal que determina qué evento ocurre en un nodo.
export const resolveNode = (
    nodeType: NodeType,
    playerState: PlayerState
): {
    card?: EventCardData,
    simulation?: SimulationResult,
    combat?: { enemyId: string; isElite?: boolean; isBoss?: boolean },
    shop?: boolean,
    rest?: boolean,
} => {
  switch (nodeType) {
    case NodeType.ENCOUNTER:
      return { card: getEncounterCard() };
    case NodeType.HAZARD:
      return { card: getHazardCard() };
    case NodeType.BATTLE: {
      const allEnemies = getEnemyTemplates();
      const regularEnemies = Object.keys(allEnemies).filter(id =>
        !id.startsWith('MINIBOSS_') && !id.startsWith('ELITE_') && !id.startsWith('BOSS_')
      );
      const pool = regularEnemies.length > 0 ? regularEnemies : Object.keys(allEnemies);
      return { combat: { enemyId: pool[Math.floor(Math.random() * pool.length)] } };
    }
    case NodeType.MINI_BOSS:
      return { combat: { enemyId: 'MINIBOSS_CORVETTE' } };
    case NodeType.ELITE: {
      const allEnemies = getEnemyTemplates();
      const eliteEnemies = Object.keys(allEnemies).filter(id => id.startsWith('ELITE_'));
      const pool = eliteEnemies.length > 0 ? eliteEnemies : ['MINIBOSS_CORVETTE'];
      return { combat: { enemyId: pool[Math.floor(Math.random() * pool.length)], isElite: true } };
    }
    case NodeType.REST:
      return { rest: true };
    case NodeType.SHOP:
      return { shop: true };
    case NodeType.END: {
      const sector = playerState.sector || 1;
      const bossMap: Record<number, string> = {
        1: 'BOSS_HEGEMONY_DESTROYER',
        2: 'BOSS_PIRATE_DREADNOUGHT',
        3: 'BOSS_AI_NEXUS',
      };
      const bossId = bossMap[sector] || 'BOSS_HEGEMONY_DESTROYER';
      return { combat: { enemyId: bossId, isBoss: true } };
    }
    case NodeType.SPECIAL_EVENT:
      return { card: getSpecialEventCard() };
    case NodeType.START:
      return { simulation: { newState: playerState, log: "Has llegado al punto de partida." } };
    default:
      return { simulation: { newState: playerState, log: `Llegas a un nodo de tipo ${nodeType}.` } };
  }
};