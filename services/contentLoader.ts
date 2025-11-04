import { z } from 'zod';

import { ContentSchema } from './validationSchemas';

// services/contentLoader.ts
import { ShipData } from '../types';

interface ContentData {
  version: string;
  metadata: {
    title: string;
    author: string;
    lastModified: string;
    gameVersion: string;
  };
  encounters: any[];
  hazards: any[];
  cards: any[];
  ships: any[];
  shops: any[];
  dialogues: any[];
  eventChains: any[];
}

class ContentLoader {
  private static instance: ContentLoader;
  private content: ContentData | null = null;
  private loaded: boolean = false;

  private constructor() {}

  static getInstance(): ContentLoader {
    if (!ContentLoader.instance) {
      ContentLoader.instance = new ContentLoader();
    }
    return ContentLoader.instance;
  }

  /**
   * Carga el contenido desde múltiples archivos JSON
   */
  private async loadJsonRobust(url: string): Promise<any> {
    const res = await fetch(url);
    // Try standard JSON first
    try {
      return await res.clone().json();
    } catch (_) {
      // Fallback: detect BOM and decode via TextDecoder
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      // UTF-8 BOM 0xEF 0xBB 0xBF, UTF-16LE BOM 0xFF 0xFE, UTF-16BE BOM 0xFE 0xFF
      if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
        const text = new TextDecoder('utf-16le').decode(bytes);
        return JSON.parse(text.replace(/^\uFEFF/, ''));
      }
      if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
        const text = new TextDecoder('utf-16be').decode(bytes);
        return JSON.parse(text.replace(/^\uFEFF/, ''));
      }
      const text = new TextDecoder('utf-8').decode(bytes);
      return JSON.parse(text.replace(/^\uFEFF/, ''));
    }
  }



  private async loadAndValidate<T extends z.ZodTypeAny>(url: string, schema: T): Promise<z.infer<T> | null> {
    try {
      const data = await this.loadJsonRobust(url);
      const validation = schema.safeParse(data);
      if (!validation.success) {
        console.error(`[ContentLoader] Fallo de validación para ${url}:`, validation.error.issues);
        return null;
      }
      return validation.data;
    } catch (error) {
      console.error(`[ContentLoader] Error cargando ${url}:`, error);
      return null;
    }
  }

  async loadContent(): Promise<ContentData | null> {
    console.log('[ContentLoader] Iniciando carga de contenido...');

    const shipsData = await this.loadAndValidate('/data/ships-converted.json', z.object({ ships: z.array(z.any()) }));
    if (!shipsData) {
        console.error("[ContentLoader] Carga de naves fallida. Deteniendo carga de contenido.");
        return null;
    }

    // For now, we can let the others be optional or use fallbacks if needed
    const cardsRawData = await this.loadJsonRobust('/data/cards-converted.json');
    console.log('[ContentLoader] cardsRawData structure:', Object.keys(cardsRawData));
    const cardsData = cardsRawData?.cards ? { cards: cardsRawData.cards } : null;
    const eventsData = await this.loadAndValidate('/data/events-converted.json', z.object({ encounters: z.array(z.any()), hazards: z.array(z.any()) }));
    const shopsData = await this.loadAndValidate('/data/shops-converted.json', z.object({ shops: z.array(z.any()) }));

    const combinedData = {
      ships: shipsData.ships || [],
      cards: cardsData?.cards || [],
      encounters: eventsData?.encounters || [],
      hazards: eventsData?.hazards || [],
      shops: shopsData?.shops || [],
    };

    this.content = {
      ...combinedData,
      version: '1.0.0',
      metadata: {
        title: 'Navegador Galáctico',
        author: 'Game Developer',
        lastModified: new Date().toISOString(),
        gameVersion: '1.0.0'
      },
      dialogues: [],
      eventChains: []
    };
    
    this.loaded = true;
    console.log('[ContentLoader] Contenido cargado.');
    console.log('[ContentLoader] Encounters cargados:', this.content.encounters.length);
    console.log('[ContentLoader] Hazards cargados:', this.content.hazards.length);
    console.log('[ContentLoader] Ships cargadas:', this.content.ships.length);
    return this.content;
  }

  /**
   * Obtiene todas las naves
   */
  getShips(): any[] {
    if (!this.content) {
      console.warn('[ContentLoader] Contenido no cargado, retornando array vacío');
      return [];
    }
    return this.content.ships || [];
  }

  /**
   * Obtiene solo las naves de jugador
   */
  getPlayerShips(): any[] {
    return this.getShips().filter(
      (ship) => ship.metadata?.type === 'player'
    );
  }

  /**
   * Obtiene solo las naves enemigas
   */
  getEnemyShips(): any[] {
    return this.getShips().filter(
      (ship) => ship.metadata?.type === 'enemy'
    );
  }

  /**
   * Obtiene una nave por ID
   */
  getShipById(id: string): any | null {
    return this.getShips().find((ship) => ship.id === id) || null;
  }

  /**
   * Obtiene todas las cartas
   */
  getCards(): any[] {
    if (!this.content) return [];
    return this.content.cards || [];
  }

  /**
   * Obtiene una carta por ID
   */
  getCardById(id: string): any | null {
    return this.getCards().find((card) => card.id === id) || null;
  }

  /**
   * Obtiene todos los encuentros
   */
  getEncounters(): any[] {
    if (!this.content) {
      console.log('[ContentLoader] getEncounters: No content loaded');
      return [];
    }
    console.log('[ContentLoader] getEncounters: Returning', this.content.encounters?.length || 0, 'encounters');
    return this.content.encounters || [];
  }

  /**
   * Obtiene todos los peligros
   */
  getHazards(): any[] {
    if (!this.content) {
      console.log('[ContentLoader] getHazards: No content loaded');
      return [];
    }
    console.log('[ContentLoader] getHazards: Returning', this.content.hazards?.length || 0, 'hazards');
    return this.content.hazards || [];
  }

  /**
   * Obtiene todas las tiendas
   */
  getShops(): any[] {
    if (!this.content) return [];
    return this.content.shops || [];
  }

  /**
   * Obtiene todos los diálogos
   */
  getDialogues(): any[] {
    if (!this.content) return [];
    return this.content.dialogues || [];
  }

  /**
   * Obtiene todas las cadenas de eventos
   */
  getEventChains(): any[] {
    if (!this.content) return [];
    return this.content.eventChains || [];
  }

  /**
   * Verifica si el contenido está cargado
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Recarga el contenido (útil para desarrollo)
   */
  async reload(): Promise<ContentData> {
    this.loaded = false;
    this.content = null;
    return this.loadContent();
  }
}

export const contentLoader = ContentLoader.getInstance();
export default contentLoader;
