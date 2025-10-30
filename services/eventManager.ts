import { NodeType, EventCardData, PlayerState, SimulationResult } from '../types';
import { ENCOUNTER_DECK, HAZARD_DECK } from '../constants';
import { ENEMY_TEMPLATES } from '../data/enemies';

// Mantiene un registro de las cartas usadas para evitar repeticiones en una misma partida.
const usedEncounterCardIds = new Set<string>();
const usedHazardCardIds = new Set<string>();

/**
 * Reinicia el estado de las cartas de eventos usadas.
 * Útil cuando se inicia una nueva partida.
 */
export const resetEventCardStates = (): void => {
    usedEncounterCardIds.clear();
    usedHazardCardIds.clear();
};

// Obtiene una carta aleatoria del mazo de encuentros que no haya sido usada.
const getEncounterCard = (): EventCardData => {
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
    const availableCards = HAZARD_DECK.filter(card => !usedHazardCardIds.has(card.id));
    if (availableCards.length === 0) {
        usedHazardCardIds.clear();
        return HAZARD_DECK[Math.floor(Math.random() * HAZARD_DECK.length)];
    }
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    usedHazardCardIds.add(card.id);
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
    combat?: { enemyId: string },
    shop?: boolean
} => {
  switch (nodeType) {
    case NodeType.ENCOUNTER:
      return { card: getEncounterCard() };
    case NodeType.HAZARD:
      return { card: getHazardCard() };
    case NodeType.BATTLE:
      // Devuelve un enemigo aleatorio para la batalla
      const enemies = Object.keys(ENEMY_TEMPLATES).filter(id => id !== 'MINIBOSS_CORVETTE');
      return { combat: { enemyId: enemies[Math.floor(Math.random() * enemies.length)] } };
    case NodeType.MINI_BOSS:
      return { combat: { enemyId: 'MINIBOSS_CORVETTE' } };
    case NodeType.SHOP:
        return { shop: true };
    case NodeType.END:
        return { simulation: getSimulatedNodeResolution(nodeType, playerState) };
    case NodeType.START:
    case NodeType.SPECIAL_EVENT:
        return { simulation: { newState: playerState, log: "Has llegado a un nodo de evento especial." }};
    default:
        return { simulation: { newState: playerState, log: `Llegas a un nodo de tipo ${nodeType}.` } };
  }
};