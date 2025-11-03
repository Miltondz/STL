// services/saveManager.ts
import { PlayerState, MapData } from '../types';

const SAVE_VERSION = 1;
const SAVE_KEY = 'stl_game_save';

export interface GameSave {
  version: number;
  timestamp: number;
  playerState: PlayerState;
  mapData: MapData;
  currentNodeId: number;
  logs: string[];
}

/**
 * Guarda el estado actual del juego en localStorage
 */
export const saveGame = (
  playerState: PlayerState,
  mapData: MapData,
  currentNodeId: number,
  logs: string[]
): boolean => {
  try {
    const save: GameSave = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      playerState,
      mapData,
      currentNodeId,
      logs: logs.slice(-100), // Solo guardar últimos 100 logs
    };
    
    const serialized = JSON.stringify(save);
    localStorage.setItem(SAVE_KEY, serialized);
    console.log('[SaveManager] Juego guardado exitosamente');
    return true;
  } catch (error) {
    console.error('[SaveManager] Error guardando juego:', error);
    return false;
  }
};

/**
 * Carga el estado guardado desde localStorage
 */
export const loadGame = (): GameSave | null => {
  try {
    const serialized = localStorage.getItem(SAVE_KEY);
    if (!serialized) {
      console.log('[SaveManager] No hay partida guardada');
      return null;
    }

    const save: GameSave = JSON.parse(serialized);
    
    // Validar versión
    if (save.version !== SAVE_VERSION) {
      console.warn('[SaveManager] Versión de guardado incompatible, ignorando');
      return null;
    }

    // Validación básica
    if (!save.playerState || !save.mapData || save.currentNodeId === undefined) {
      console.error('[SaveManager] Datos de guardado inválidos');
      return null;
    }

    console.log('[SaveManager] Partida cargada exitosamente');
    return save;
  } catch (error) {
    console.error('[SaveManager] Error cargando juego:', error);
    return null;
  }
};

/**
 * Elimina la partida guardada
 */
export const deleteSave = (): void => {
  try {
    localStorage.removeItem(SAVE_KEY);
    console.log('[SaveManager] Partida eliminada');
  } catch (error) {
    console.error('[SaveManager] Error eliminando partida:', error);
  }
};

/**
 * Verifica si existe una partida guardada
 */
export const hasSavedGame = (): boolean => {
  return localStorage.getItem(SAVE_KEY) !== null;
};

/**
 * Exporta la partida como archivo JSON
 */
export const exportSave = (): void => {
  try {
    const serialized = localStorage.getItem(SAVE_KEY);
    if (!serialized) {
      console.warn('[SaveManager] No hay partida para exportar');
      return;
    }

    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stl-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('[SaveManager] Partida exportada');
  } catch (error) {
    console.error('[SaveManager] Error exportando partida:', error);
  }
};

/**
 * Importa una partida desde un archivo JSON
 */
export const importSave = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const processContent = (content: string) => {
      try {
        const save: GameSave = JSON.parse(content);
        if (save.version !== SAVE_VERSION) {
          console.error('[SaveManager] Versión incompatible');
          resolve(false);
          return;
        }
        localStorage.setItem(SAVE_KEY, content);
        console.log('[SaveManager] Partida importada exitosamente');
        resolve(true);
      } catch (error) {
        console.error('[SaveManager] Error procesando archivo:', error);
        resolve(false);
      }
    };

    try {
      // Preferir API moderna si está disponible (Node/JS envs)
      if (typeof (file as any).text === 'function') {
        (file as any).text().then(processContent).catch(() => resolve(false));
        return;
      }

      // Fallback DOM FileReader
      if (typeof FileReader !== 'undefined') {
        const reader = new FileReader();
        reader.onload = (e) => processContent((e.target?.result as string) || '');
        reader.onerror = () => resolve(false);
        reader.readAsText(file);
        return;
      }

      console.error('[SaveManager] No hay método disponible para leer archivo');
      resolve(false);
    } catch (error) {
      console.error('[SaveManager] Error importando partida:', error);
      resolve(false);
    }
  });
};
