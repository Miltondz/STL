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
  async loadContent(): Promise<ContentData> {
    if (this.loaded && this.content) {
      return this.content;
    }

    try {
      console.log('[ContentLoader] Cargando contenido desde archivos JSON...');
      
      // Cargar todos los archivos en paralelo
      const [shipsData, cardsData, eventsData, shopsData] = await Promise.all([
        fetch('/data/ships-converted.json').then(r => r.json()),
        fetch('/data/cards-converted.json').then(r => r.json()),
        fetch('/data/events-converted.json').then(r => r.json()),
        fetch('/data/shops-converted.json').then(r => r.json())
      ]);

      // Fusionar todos los datos en un solo objeto ContentData
      this.content = {
        version: shipsData.version || '1.0.0',
        metadata: {
          title: 'Navegador Galáctico - Content',
          author: 'Dynamic Loader',
          lastModified: new Date().toISOString(),
          gameVersion: '1.0.0'
        },
        ships: shipsData.ships || [],
        cards: cardsData.cards || [],
        encounters: eventsData.encounters || [],
        hazards: eventsData.hazards || [],
        shops: shopsData.shops || [],
        dialogues: [],
        eventChains: []
      };
      
      this.loaded = true;
      
      console.log('[ContentLoader] Contenido cargado exitosamente:', {
        version: this.content.version,
        ships: this.content.ships.length,
        cards: this.content.cards.length,
        encounters: this.content.encounters.length,
        hazards: this.content.hazards.length,
        shops: this.content.shops.length
      });

      return this.content;
    } catch (error) {
      console.error('[ContentLoader] Error cargando contenido:', error);
      throw error;
    }
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
    if (!this.content) return [];
    return this.content.encounters || [];
  }

  /**
   * Obtiene todos los peligros
   */
  getHazards(): any[] {
    if (!this.content) return [];
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
