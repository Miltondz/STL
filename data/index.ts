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
    .replace(/┬¡/g, '¡')
    .replace(/┬┐/g, '¿')
    // Casos específicos que viste
    .replace(/├¡/g, 'í')  // Para "Hegemonía"
    .replace(/├®/g, 'é')  // Para "décadas"
    // Otros caracteres comunes
    .replace(/├ç/g, 'Ç')
    .replace(/├æ/g, 'Æ')
    .replace(/├ÿ/g, 'ÿ')
    .replace(/├¿/g, 'ç')
    .replace(/├¢/g, 'â')
    .replace(/├¬/g, 'ê')
    .replace(/├¬/g, 'î')
    .replace(/├┤/g, 'ô')
    .replace(/├╗/g, 'û')
    // Comillas y otros símbolos
    .replace(/ÔÇ£/g, '"')
    .replace(/ÔÇ¥/g, '"')
    .replace(/ÔÇÖ/g, "'")
    .replace(/ÔÇÖ/g, "'")
    .replace(/ÔÇô/g, '—')
    .replace(/ÔÇô/g, '–');
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
      
      console.log('[DEBUG] Event effects:', {
        credits: creditsChange,
        hull: hullChange,
        fuel: fuelChange,
        xp: xpChange
      });
      
      return {
        newState: {
          ...state,
          credits: Math.max(0, state.credits + creditsChange),
          hull: Math.min(state.maxHull, Math.max(0, state.hull + hullChange)),
          fuel: Math.max(0, state.fuel + fuelChange),
          xp: state.xp + xpChange
        },
        log: fixTextEncoding(selectedRoll.logText) || 'Evento completado.',
        reactionText: fixTextEncoding(selectedRoll.reactionText) || undefined
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

export function getAllCards(): Record<string, CardData> {
  console.log('[DEBUG] getAllCards called, cachedCards exists:', !!cachedCards);
  
  if (cachedCards) {
    console.log('[DEBUG] Returning cached cards:', Object.keys(cachedCards).length);
    
    // Crear un nuevo objeto que incluya tanto los IDs originales como los mapeados
    const cardsWithMapping = { ...cachedCards };
    
    // Agregar mapeos de IDs incorrectos a cartas existentes
    Object.entries(CARD_ID_MAPPING).forEach(([oldId, newId]) => {
      if (cachedCards[newId]) {
        cardsWithMapping[oldId] = cachedCards[newId];
        console.log('[DEBUG] Mapped', oldId, '->', newId);
      }
    });
    
    return cardsWithMapping;
  }

  console.log('[DEBUG] contentLoader.isLoaded():', contentLoader.isLoaded());
  
  if (contentLoader.isLoaded()) {
    const cardsArray = contentLoader.getCards();
    console.log('[Data] contentLoader.getCards():', cardsArray);
    console.log('[DEBUG] cardsArray.length:', cardsArray.length);
    
    if (cardsArray.length > 0) {
      // Convertir array a Record<string, CardData>
      cachedCards = cardsArray.reduce((acc, card) => {
        console.log('[DEBUG] Processing card:', card.id);
        acc[card.id] = card as CardData;
        return acc;
      }, {} as Record<string, CardData>);
      console.log('[Data] Usando cartas desde JSON:', Object.keys(cachedCards).length);
      console.log('[DEBUG] Final cachedCards keys:', Object.keys(cachedCards));
      return cachedCards;
    }
  }

  // Fallback a datos hardcodeados
  console.log('[Data] Usando cartas hardcodeadas (fallback)');
  console.log('[DEBUG] CARDS_HARDCODED keys:', Object.keys(CARDS_HARDCODED));
  
  // Aplicar mapeo también al fallback
  const hardcodedWithMapping = { ...CARDS_HARDCODED };
  Object.entries(CARD_ID_MAPPING).forEach(([oldId, newId]) => {
    if (CARDS_HARDCODED[newId]) {
      hardcodedWithMapping[oldId] = CARDS_HARDCODED[newId];
    }
  });
  
  return hardcodedWithMapping;
}

/**
 * Obtiene todas las naves de jugador (desde JSON o fallback)
 */
export function getAllShips(): ShipData[] {
  if (cachedShips) return cachedShips;

  if (contentLoader.isLoaded()) {
    const jsonShips = contentLoader.getPlayerShips();
    if (jsonShips.length > 0) {
      // Mapear estructura de JSON a ShipData, incluyendo tokenImage
      cachedShips = jsonShips.map((js: any) => {
        const fallback = SHIPS_HARDCODED.find(s => s.name === js.name) || SHIPS_HARDCODED[0];
        
        // Debug: mapeo de nave completado
        
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
      console.log('[Data] Usando naves desde JSON:', cachedShips.length);
      return cachedShips;
    }
  }

  // Fallback a datos hardcodeados
  console.log('[Data] Usando naves hardcodeadas (fallback)');
  return SHIPS_HARDCODED;
  
  /* CÓDIGO ORIGINAL COMENTADO HASTA CORREGIR JSON
  if (cachedShips) return cachedShips;

  if (contentLoader.isLoaded()) {
    const jsonShips = contentLoader.getPlayerShips();
    if (jsonShips.length > 0) {
      // Mapear estructura de JSON a ShipData, usando los valores de fallback
      cachedShips = jsonShips.map((js: any) => {
        const fallback = SHIPS_HARDCODED.find(s => s.name === js.name) || SHIPS_HARDCODED[0];
        return {
          id: fallback?.id || js.id,
          name: js.name || fallback?.name,
          image: js.image || fallback?.image,
          subtype: js.metadata?.subtype || fallback?.subtype,
          faction: js.metadata?.faction || fallback?.faction,
          description: js.description || fallback?.description,
          trait: js.specialAbility ? { name: js.specialAbility.name, description: js.specialAbility.description } : fallback?.trait,
          difficulty: js.metadata?.difficulty ?? fallback?.difficulty ?? 1,
          initialDeck: fallback?.initialDeck || js.metadata?.initialDeck || [],
          initialFuel: js.maxFuel ?? fallback?.initialFuel ?? 10,
          initialCredits: js.metadata?.initialCredits ?? fallback?.initialCredits ?? 0,
          maxHull: js.maxHull ?? fallback?.maxHull ?? 50,
          maxShields: js.maxShields ?? fallback?.maxShields ?? 10,
          crew: js.metadata?.crewSlots ?? fallback?.crew ?? 1,
        } as ShipData;
      });
      console.log('[Data] Usando naves desde JSON:', cachedShips.length);
      return cachedShips;
    }
  }

  // Fallback a datos hardcodeados
  console.log('[Data] Usando naves hardcodeadas (fallback)');
  return SHIPS_HARDCODED;
  */
}

/**
 * Obtiene todas las plantillas de enemigos (desde JSON o fallback)
 */
export function getEnemyTemplates(): Record<string, any> {
  console.log('[DEBUG] getEnemyTemplates called, cachedEnemies exists:', !!cachedEnemies);
  
  if (cachedEnemies) {
    console.log('[DEBUG] Returning cached enemies:', Object.keys(cachedEnemies).length);
    return cachedEnemies;
  }

  console.log('[DEBUG] contentLoader.isLoaded() for enemies:', contentLoader.isLoaded());
  
  if (contentLoader.isLoaded()) {
    const enemyShips = contentLoader.getEnemyShips();
    console.log('[DEBUG] contentLoader.getEnemyShips():', enemyShips.length);
    
    if (enemyShips.length > 0) {
      // Convertir array a Record
      cachedEnemies = enemyShips.reduce((acc, enemy) => {
        console.log('[DEBUG] Processing enemy:', enemy.id, enemy.name);
        acc[enemy.id] = enemy;
        return acc;
      }, {} as Record<string, any>);
      console.log('[Data] Usando enemigos desde JSON:', Object.keys(cachedEnemies).length);
      console.log('[DEBUG] Enemy IDs loaded:', Object.keys(cachedEnemies));
      return cachedEnemies;
    }
  }

  // Fallback a datos hardcodeados
  console.log('[Data] Usando enemigos hardcodeados (fallback)');
  console.log('[DEBUG] Hardcoded enemy IDs:', Object.keys(ENEMIES_HARDCODED));
  return ENEMIES_HARDCODED;
}

/**
 * Obtiene todas las cartas de encuentro (desde JSON o fallback)
 */
export function getEncounterDeck(): EventCardData[] {
  if (cachedEncounters) return cachedEncounters;

  if (contentLoader.isLoaded()) {
    console.log('[Data] ContentLoader está cargado, obteniendo encuentros...');
    const encounters = contentLoader.getEncounters();
    console.log('[Data] Encuentros obtenidos del JSON:', encounters.length);
    if (encounters.length > 0) {
      // Mapear estructura JSON a EventCardData
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
      console.log('[Data] Usando encuentros desde JSON:', cachedEncounters.length);
      return cachedEncounters;
    }
  }

  // Fallback a datos hardcodeados
  console.log('[Data] Usando encuentros hardcodeados (fallback)');
  return ENCOUNTERS_HARDCODED;
}

/**
 * Obtiene todas las cartas de peligro (desde JSON o fallback)
 */
export function getHazardDeck(): EventCardData[] {
  if (cachedHazards) return cachedHazards;

  if (contentLoader.isLoaded()) {
    console.log('[Data] ContentLoader está cargado, obteniendo peligros...');
    const hazards = contentLoader.getHazards();
    console.log('[Data] Peligros obtenidos del JSON:', hazards.length);
    if (hazards.length > 0) {
      // Mapear estructura JSON a EventCardData
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
      console.log('[Data] Usando peligros desde JSON:', cachedHazards.length);
      return cachedHazards;
    }
  }

  // Fallback a datos hardcodeados
  console.log('[Data] Usando peligros hardcodeados (fallback)');
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
  console.log('[Data] Cache limpiado');
}

// Note: Use the getter functions directly, not these constants
// They are computed lazily when first called, not at module load time
