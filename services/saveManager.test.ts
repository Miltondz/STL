// services/saveManager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveGame, loadGame, deleteSave, hasSavedGame } from './saveManager';
import type { PlayerState, MapData } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

global.localStorage = localStorageMock as any;

describe('saveManager', () => {
  const mockPlayerState: PlayerState = {
    name: 'Test Ship',
    image: 'test.png',
    fuel: 10,
    maxFuel: 10,
    credits: 100,
    crew: [],
    hull: 50,
    maxHull: 50,
    shields: 30,
    maxShields: 30,
    deck: [],
    xp: 0,
    level: 1,
    xpToNextLevel: 100,
  };

  const mockMapData: MapData = {
    nodes: [
      { id: 0, type: 'start', x: 0, y: 0, connections: [1], visited: true },
      { id: 1, type: 'combat', x: 1, y: 1, connections: [], visited: false },
    ],
    startNodeId: 0,
  };

  const mockLogs = ['Log 1', 'Log 2', 'Log 3'];

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveGame', () => {
    it('debe guardar el juego exitosamente', () => {
      const result = saveGame(mockPlayerState, mockMapData, 0, mockLogs);
      expect(result).toBe(true);
      expect(localStorage.getItem('stl_game_save')).toBeTruthy();
    });

    it('debe incluir versión y timestamp', () => {
      saveGame(mockPlayerState, mockMapData, 0, mockLogs);
      const saved = JSON.parse(localStorage.getItem('stl_game_save')!);
      expect(saved.version).toBe(1);
      expect(saved.timestamp).toBeTypeOf('number');
    });

    it('debe limitar logs a 100 últimos', () => {
      const manyLogs = Array.from({ length: 200 }, (_, i) => `Log ${i}`);
      saveGame(mockPlayerState, mockMapData, 0, manyLogs);
      const saved = JSON.parse(localStorage.getItem('stl_game_save')!);
      expect(saved.logs.length).toBe(100);
      expect(saved.logs[0]).toBe('Log 100'); // Primeros 100 descartados
    });

    it('debe manejar errores gracefully', () => {
      // Simular error en setItem
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      const result = saveGame(mockPlayerState, mockMapData, 0, mockLogs);
      expect(result).toBe(false);
    });
  });

  describe('loadGame', () => {
    it('debe cargar partida guardada correctamente', () => {
      saveGame(mockPlayerState, mockMapData, 0, mockLogs);
      const loaded = loadGame();
      
      expect(loaded).toBeTruthy();
      expect(loaded!.playerState.name).toBe('Test Ship');
      expect(loaded!.mapData.nodes.length).toBe(2);
      expect(loaded!.currentNodeId).toBe(0);
      expect(loaded!.logs).toEqual(mockLogs);
    });

    it('debe retornar null si no hay save', () => {
      const loaded = loadGame();
      expect(loaded).toBeNull();
    });

    it('debe rechazar versión incompatible', () => {
      const incompatibleSave = {
        version: 99, // Versión futura
        timestamp: Date.now(),
        playerState: mockPlayerState,
        mapData: mockMapData,
        currentNodeId: 0,
        logs: mockLogs,
      };
      localStorage.setItem('stl_game_save', JSON.stringify(incompatibleSave));
      
      const loaded = loadGame();
      expect(loaded).toBeNull();
    });

    it('debe rechazar datos inválidos', () => {
      localStorage.setItem('stl_game_save', JSON.stringify({ invalid: true }));
      const loaded = loadGame();
      expect(loaded).toBeNull();
    });

    it('debe manejar JSON corrupto', () => {
      localStorage.setItem('stl_game_save', '{invalid json');
      const loaded = loadGame();
      expect(loaded).toBeNull();
    });
  });

  describe('deleteSave', () => {
    it('debe eliminar partida guardada', () => {
      saveGame(mockPlayerState, mockMapData, 0, mockLogs);
      expect(localStorage.getItem('stl_game_save')).toBeTruthy();
      
      deleteSave();
      expect(localStorage.getItem('stl_game_save')).toBeNull();
    });

    it('debe funcionar aunque no haya save', () => {
      expect(() => deleteSave()).not.toThrow();
    });
  });

  describe('hasSavedGame', () => {
    it('debe retornar true si hay save', () => {
      saveGame(mockPlayerState, mockMapData, 0, mockLogs);
      expect(hasSavedGame()).toBe(true);
    });

    it('debe retornar false si no hay save', () => {
      expect(hasSavedGame()).toBe(false);
    });
  });
});
