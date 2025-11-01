// services/logManager.ts
export type LogCategory = 'combat' | 'travel' | 'event' | 'shop' | 'system';

export interface LogEntry {
  id: string;
  timestamp: number;
  category: LogCategory;
  message: string;
}

const MAX_LOGS = 100; // Ring buffer size

class LogManager {
  private logs: LogEntry[] = [];
  private idCounter = 0;
  private listeners: Array<(logs: LogEntry[]) => void> = [];

  /**
   * Agrega un nuevo log
   */
  add(message: string, category: LogCategory = 'system'): void {
    const entry: LogEntry = {
      id: `log-${this.idCounter++}`,
      timestamp: Date.now(),
      category,
      message,
    };

    this.logs.push(entry);

    // Ring buffer: mantener solo MAX_LOGS
    if (this.logs.length > MAX_LOGS) {
      this.logs.shift();
    }

    this.notifyListeners();
  }

  /**
   * Obtiene todos los logs
   */
  getAll(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Obtiene logs por categoría
   */
  getByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Obtiene últimos N logs
   */
  getLast(count: number): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Limpia todos los logs
   */
  clear(): void {
    this.logs = [];
    this.notifyListeners();
  }

  /**
   * Exporta logs como JSON
   */
  exportJSON(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalLogs: this.logs.length,
        logs: this.logs,
      },
      null,
      2
    );
  }

  /**
   * Exporta logs como archivo
   */
  exportToFile(): void {
    const json = this.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stl-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Carga logs desde JSON
   */
  importFromJSON(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.logs)) {
        this.logs = data.logs;
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[LogManager] Error importando logs:', error);
      return false;
    }
  }

  /**
   * Suscribirse a cambios en los logs
   */
  subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.push(listener);
    // Retorna función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getAll()));
  }

  /**
   * Genera un resumen estadístico
   */
  getStats(): {
    total: number;
    byCategory: Record<LogCategory, number>;
    oldestTimestamp: number | null;
    newestTimestamp: number | null;
  } {
    const byCategory: Record<LogCategory, number> = {
      combat: 0,
      travel: 0,
      event: 0,
      shop: 0,
      system: 0,
    };

    this.logs.forEach((log) => {
      byCategory[log.category]++;
    });

    return {
      total: this.logs.length,
      byCategory,
      oldestTimestamp: this.logs[0]?.timestamp || null,
      newestTimestamp: this.logs[this.logs.length - 1]?.timestamp || null,
    };
  }
}

// Singleton instance
export const logManager = new LogManager();

// Helper functions para uso rápido
export const addLog = (message: string, category: LogCategory = 'system') => {
  logManager.add(message, category);
};

export const getLogsForUI = () => {
  return logManager.getLast(50).map((entry) => entry.message);
};
