// services/saveManager.export_import.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { importSave, exportSave } from './saveManager';

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

describe('saveManager export/import', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('importSave should accept a valid file', async () => {
    const valid = {
      version: 1,
      timestamp: Date.now(),
      playerState: { name: 'Ship', image: '', fuel: 5, maxFuel: 5, credits: 0, crew: [], hull: 10, maxHull: 10, shields: 0, maxShields: 0, deck: [], xp: 0, level: 1, xpToNextLevel: 100 },
      mapData: { nodes: [], startNodeId: 0 },
      currentNodeId: 0,
      logs: [],
    };
    const file = new File([JSON.stringify(valid)], 'save.json', { type: 'application/json' });
    const ok = await importSave(file);
    expect(ok).toBe(true);
  });

  it('importSave should reject invalid version', async () => {
    const invalid = { version: 99 };
    const file = new File([JSON.stringify(invalid)], 'save.json', { type: 'application/json' });
    const ok = await importSave(file);
    expect(ok).toBe(false);
  });

  it('exportSave should not throw when no save exists', () => {
    expect(() => exportSave()).not.toThrow();
  });
});
