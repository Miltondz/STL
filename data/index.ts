// data/index.ts
// Punto de acceso centralizado a todos los datos del juego
// Usa contentLoader cuando está disponible, fallback a datos hardcodeados

import { CardData, ShipData, EventCardData, PlayerState, EventConsequenceResult } from '../types';
import contentLoader from '../services/contentLoader';

// Imports de datos hardcodeados como fallback
import { ALL_CARDS as CARDS_HARDCODED } from './cards';
import { ALL_SHIPS as SHIPS_HARDCODED } from './ships';
import { ENEMY_TEMPLATES as ENEMIES_HARDCODED } from './enemies';
import { ENCOUNTER_DECK as ENCOUNTERS_HARDCODED, HAZARD_DECK as HAZARDS_HARDCODED } from '../constants';

// Cache de datos cargados
let cachedCards: Record<string, CardData> | null = null;
let cachedShips: ShipData[] | null = null;
let cachedEnemies: Record<string, any> | null = null;
let cachedEncounters: EventCardData[] | null = null;
let cachedHazards: EventCardData[] | null = null;

/**
 * Helper function to fix encoding issues in text
 */
function fixTextEncoding(text: string): string {
  if (!text) return text;
  
  return text
    // Vocales con acento
    .replace(/├í/g, 'á')
    .replace(/├ë/g, 'é')
    .replace(/├¡/g, 'í')
    .replace(/├│/g, 'ó')
    .replace(/├║/g, 'ú')
    .replace(/├Í/g, 'Á')
    .replace(/├ë/g, 'É')
    .replace(/├Ì/g, 'Í')
    .replace(/├ô/g, 'Ó')
    .replace(/├Ü/g, 'Ú')
    // Ñ y otros
    .replace(/├▒/g, 'ñ')
    .replace(/├æ/g, 'Ñ')
    .replace(/├ü/g, 'ü')
    .replace(/├£/g, 'Ü')
    // Signos de puntuación
    .replace(/┬í/g, '¡')
    .replace(/┬┐/g, '¿')
    .replace(/┬░/g, '°')
    .replace(/┬¬/g, '¬')
    // Otros caracteres comunes
    .replace(/├ç/g, 'Ç')
    .replace(/├ÿ/g, 'ÿ')
    .replace(/├¿/g, 'ç')
    .replace(/├¢/g, 'â')
    .replace(/├¬/g, 'ê')
    .replace(/├┤/g, 'ô')
    .replace(/├╗/g, 'û')
    // Comillas y otros símbolos
    .replace(/ÔÇ£/g, '"')
    .replace(/ÔÇ¥/g, '"')
    .replace(/ÔÇÖ/g, "'")
    .replace(/ÔÇô/g, '—');
}

/**
 * Helper function to create consequence functions from JSON data
 */
function createConsequenceFunction(option: any): (state: PlayerState) => EventConsequenceResult {
  return (state: PlayerState) => {
    if (option.consequence?.rolls) {
      // Simular resultado basado en los rolls y sus probabilidades
      const roll = Math.random();
      let cumulativeProbability = 0;
      let selectedRoll = option.consequence.rolls[0]; // fallback
      
      for (const rollOption of option.consequence.rolls) {
        cumulativeProbability += rollOption.probability || 0;
        if (roll <= cumulativeProbability) {
          selectedRoll = rollOption;
          break;
        }
      }
      
      // Helper function to calculate effect value
      const calculateEffectValue = (effect: any): number => {
        if (typeof effect === 'number') {
          return effect;
        }
        if (effect && typeof effect === 'object' && effect.random) {
          const min = effect.min || 0;
          const max = effect.max || 0;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return 0;
      };
      
      const creditsChange = calculateEffectValue(selectedRoll.effects?.credits);
      const hullChange = calculateEffectValue(selectedRoll.effects?.hull);
      const fuelChange = calculateEffectValue(selectedRoll.effects?.fuel);
      const xpChange = calculateEffectValue(selectedRoll.effects?.xp);
      
      return {
        newState: {
          ...state,
          credits: Math.max(0, state.credits + creditsChange),
          hull: Math.min(state.maxHull, Math.max(0, state.hull + hullChange)),
          fuel: Math.max(0, state.fuel + fuelChange),
          // xp handled via xpGained so handleGainXp can trigger level-ups
        },
        log: fixTextEncoding(selectedRoll.logText) || 'Evento completado.',
        reactionText: fixTextEncoding(selectedRoll.reactionText) || undefined,
        xpGained: xpChange > 0 ? xpChange : undefined,
      };
    }
    
    // Fallback si no hay rolls
    return {
      newState: state,
      log: 'Opción seleccionada.',
      reactionText: undefined
    };
  };
}

/**
 * Obtiene todas las cartas (desde JSON o fallback)
 */
// Mapeo de IDs incorrectos en los decks de naves a IDs correctos de cartas
const CARD_ID_MAPPING: Record<string, string> = {
  'BASE_DEPLOYER_10': 'BASE_DISPARO01',
  'BASE_MANIOBRA_10': 'BASE_MANIOBRA01', 
  'BASE_MINIBOARD_10': 'BASE_OPERACIONES01',
  'BASE_TORPEDO_COIN_10': 'ATTACK_1',
  'CERBERUS_AZAR_NOMILITAR': 'DEFEND_1',
  'ATK_CAP_K': 'REPAIR_1',
  'SWE_XYCOMMERCIANTE': 'CREW_ZYX_COMERCIANTE',
  'REPAIR_KIT': 'REPAIR_1',
  'SWE_GLITCH_ABSORBED': 'CREW_GLITCH_SABOTEADOR',
  'DFEN_D': 'DEFEND_1'
};

function applyCardIdMapping(base: Record<string, CardData>): Record<string, CardData> {
  const result = { ...base };
  for (const [oldId, newId] of Object.entries(CARD_ID_MAPPING)) {
    if (result[newId]) result[oldId] = result[newId];
  }
  return result;
}

export function getAllCards(): Record<string, CardData> {
  if (cachedCards) return applyCardIdMapping(cachedCards);

  if (contentLoader.isLoaded()) {
    const cardsArray = contentLoader.getCards();
    if (cardsArray.length > 0) {
      cachedCards = cardsArray.reduce((acc, card) => {
        acc[card.id] = card as CardData;
        return acc;
      }, {} as Record<string, CardData>);
      return applyCardIdMapping(cachedCards);
    }
  }

  return applyCardIdMapping(CARDS_HARDCODED as Record<string, CardData>);
}

/**
 * Obtiene todas las naves de jugador (desde JSON o fallback)
 */
export function getAllShips(): ShipData[] {
  if (cachedShips) return cachedShips;

  if (contentLoader.isLoaded()) {
    const jsonShips = contentLoader.getPlayerShips();
    if (jsonShips.length > 0) {
      cachedShips = jsonShips.map((js: any) => {
        const fallback = SHIPS_HARDCODED.find(s => s.name === js.name) || SHIPS_HARDCODED[0];
        
        return {
          id: js.id, // Usar siempre el ID del JSON para evitar duplicados
          name: js.name || fallback?.name,
          image: js.image || fallback?.image,
          tokenImage: js.tokenImage || fallback?.tokenImage, // Nuevo campo
          subtype: js.metadata?.subtype || fallback?.subtype,
          faction: js.metadata?.faction || fallback?.faction,
          description: js.description || fallback?.description,
          trait: js.specialAbility ? { name: js.specialAbility.name, description: js.specialAbility.description } : fallback?.trait,
          difficulty: js.metadata?.difficulty ?? fallback?.difficulty ?? 1,
          initialDeck: js.metadata?.initialDeck || fallback?.initialDeck || [], // Priorizar JSON
          initialFuel: js.maxFuel ?? fallback?.initialFuel ?? 10,
          initialCredits: js.metadata?.initialCredits ?? fallback?.initialCredits ?? 0,
          maxHull: js.maxHull ?? fallback?.maxHull ?? 50,
          maxShields: js.maxShields ?? fallback?.maxShields ?? 10,
          crew: js.metadata?.crewSlots ?? fallback?.crew ?? 1,
        } as ShipData;
      });
      return cachedShips;
    }
  }

  return SHIPS_HARDCODED;
}

/**
 * Obtiene todas las plantillas de enemigos (desde JSON o fallback)
 */
export function getEnemyTemplates(): Record<string, any> {
  if (cachedEnemies) return cachedEnemies;

  if (contentLoader.isLoaded()) {
    const enemyShips = contentLoader.getEnemyShips();
    if (enemyShips.length > 0) {
      cachedEnemies = enemyShips.reduce((acc, enemy) => {
        acc[enemy.id] = enemy;
        return acc;
      }, {} as Record<string, any>);
      return cachedEnemies;
    }
  }

  return ENEMIES_HARDCODED;
}

/**
 * Obtiene todas las cartas de encuentro (desde JSON o fallback)
 */
export function getEncounterDeck(): EventCardData[] {
  if (cachedEncounters) return cachedEncounters;

  if (contentLoader.isLoaded()) {
    const encounters = contentLoader.getEncounters();
    if (encounters.length > 0) {
      cachedEncounters = encounters.map((encounter: any) => ({
        id: encounter.id,
        title: fixTextEncoding(encounter.title),
        type: encounter.type,
        image: encounter.image?.url || encounter.image,
        introText: (encounter.narrative?.intro || [encounter.description || 'Sin descripción']).map((text: string) => fixTextEncoding(text)),
        promptText: fixTextEncoding(encounter.narrative?.prompt) || 'Elige una opción:',
        options: (encounter.options || []).map((option: any) => ({
          text: fixTextEncoding(option.text) || 'Opción sin texto',
          requirements: option.requirements ? {
            credits: option.requirements.minCredits || undefined,
            crew: option.requirements.crew || undefined
          } : undefined,
          crewRequirement: option.requirements?.crewRequirement || undefined,
          narrativeFlagRequirement: option.requirements?.narrativeFlagRequirement || undefined,
          consequence: createConsequenceFunction(option)
        }))
      })) as EventCardData[];
      return cachedEncounters;
    }
  }

  return ENCOUNTERS_HARDCODED;
}

/**
 * Obtiene todas las cartas de peligro (desde JSON o fallback)
 */
export function getHazardDeck(): EventCardData[] {
  if (cachedHazards) return cachedHazards;

  if (contentLoader.isLoaded()) {
    const hazards = contentLoader.getHazards();
    if (hazards.length > 0) {
      cachedHazards = hazards.map((hazard: any) => ({
        id: hazard.id,
        title: fixTextEncoding(hazard.title),
        type: hazard.type,
        image: hazard.image?.url || hazard.image,
        introText: (hazard.narrative?.intro || [hazard.description || 'Sin descripción']).map((text: string) => fixTextEncoding(text)),
        promptText: fixTextEncoding(hazard.narrative?.prompt) || 'Elige una opción:',
        options: (hazard.options || []).map((option: any) => ({
          text: fixTextEncoding(option.text) || 'Opción sin texto',
          requirements: option.requirements ? {
            credits: option.requirements.minCredits || undefined,
            crew: option.requirements.crew || undefined
          } : undefined,
          crewRequirement: option.requirements?.crewRequirement || undefined,
          narrativeFlagRequirement: option.requirements?.narrativeFlagRequirement || undefined,
          consequence: createConsequenceFunction(option)
        }))
      })) as EventCardData[];
      return cachedHazards;
    }
  }

  return HAZARDS_HARDCODED;
}

/**
 * Limpia el cache de datos
 * Útil para desarrollo o cuando se recarga contenido
 */
export function clearCache() {
  cachedCards = null;
  cachedShips = null;
  cachedEnemies = null;
  cachedEncounters = null;
  cachedHazards = null;
}

// Note: Use the getter functions directly, not these constants
// They are computed lazily when first called, not at module load time
