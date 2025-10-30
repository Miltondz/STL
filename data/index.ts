// data/index.ts
// Punto de acceso centralizado a todos los datos del juego
// Usa contentLoader cuando está disponible, fallback a datos hardcodeados

import { CardData, ShipData, EventCardData } from '../types';
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
 * Obtiene todas las cartas (desde JSON o fallback)
 */
export function getAllCards(): Record<string, CardData> {
  if (cachedCards) return cachedCards;

  if (contentLoader.isLoaded()) {
    const cardsArray = contentLoader.getCards();
    if (cardsArray.length > 0) {
      // Convertir array a Record<string, CardData>
      cachedCards = cardsArray.reduce((acc, card) => {
        acc[card.id] = card as CardData;
        return acc;
      }, {} as Record<string, CardData>);
      console.log('[Data] Usando cartas desde JSON:', Object.keys(cachedCards).length);
      return cachedCards;
    }
  }

  // Fallback a datos hardcodeados
  console.log('[Data] Usando cartas hardcodeadas (fallback)');
  return CARDS_HARDCODED;
}

/**
 * Obtiene todas las naves de jugador (desde JSON o fallback)
 */
export function getAllShips(): ShipData[] {
  if (cachedShips) return cachedShips;

  if (contentLoader.isLoaded()) {
    const ships = contentLoader.getPlayerShips();
    if (ships.length > 0) {
      cachedShips = ships as ShipData[];
      console.log('[Data] Usando naves desde JSON:', cachedShips.length);
      return cachedShips;
    }
  }

  // Fallback a datos hardcodeados
  console.log('[Data] Usando naves hardcodeadas (fallback)');
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
      // Convertir array a Record
      cachedEnemies = enemyShips.reduce((acc, enemy) => {
        acc[enemy.id] = enemy;
        return acc;
      }, {} as Record<string, any>);
      console.log('[Data] Usando enemigos desde JSON:', Object.keys(cachedEnemies).length);
      return cachedEnemies;
    }
  }

  // Fallback a datos hardcodeados
  console.log('[Data] Usando enemigos hardcodeados (fallback)');
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
      cachedEncounters = encounters as EventCardData[];
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
    const hazards = contentLoader.getHazards();
    if (hazards.length > 0) {
      cachedHazards = hazards as EventCardData[];
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

/**
 * Re-exportar para mantener compatibilidad con imports existentes
 */
export const ALL_CARDS = getAllCards();
export const ALL_SHIPS = getAllShips();
export const ENEMY_TEMPLATES = getEnemyTemplates();
export const ENCOUNTER_DECK = getEncounterDeck();
export const HAZARD_DECK = getHazardDeck();
