// types.ts

// --- Tipos de Juego Centrales ---
export enum NodeType {
  START = 'INICIO',
  BATTLE = 'BATALLA',
  ENCOUNTER = 'ENCUENTRO',
  SHOP = 'TIENDA',
  HAZARD = 'PELIGRO',
  MINI_BOSS = 'MINI-JEFE',
  SPECIAL_EVENT = 'EVENTO ESPECIAL',
  END = 'FINAL',
}

export interface Node {
  id: number;
  type: NodeType;
  layer: number;
  x: number;
  y: number;
  connections: number[];
  visited: boolean;
}

export interface MapData {
  nodes: Node[];
  startNodeId: number;
  endNodeId: number;
}

// --- Tipos de Cartas ---
export interface CardAffix {
  name: string;
  description: string;
  costModifier?: number;
  valueModifier?: number;
}

export interface CardData {
  id: string;
  name: string;
  type: 'Attack' | 'Skill' | 'Power' | 'Crew';
  subtype?: string;
  cost: number;
  price: number; // Precio base en créditos para la tienda
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Inicial';
  faction?: 'Neutral' | string;
  description: string;
  effectBase?: string;
  value?: number; // Valor base para efectos (ej: 5 de daño)
  possibleAffixes?: CardAffix[];
  hasUpgrade?: boolean;
  upgradeId?: string;
  upgradeEffect?: string;
  image?: string; // URL de la imagen para retratos de tripulación
}

export interface CardInstance {
    instanceId: string; // ID único para esta instancia específica de la carta
    cardId: string;     // ID de la plantilla de la carta (en data/cards.ts)
    affix?: CardAffix;  // Modificador opcional para esta instancia
}

// --- Tipos de Nave ---
export interface ShipData {
    id: string;
    name: string;
    image: string;
    subtype: string;
    faction: string;
    description: string;
    trait: {
        name: string;
        description: string;
    };
    difficulty: number; // 1 to 3
    initialDeck: string[];
    initialFuel: number;
    initialCredits: number;
    maxHull: number;
    maxShields: number;
    crew: number;
}


// Representa el estado global del jugador fuera del combate.
export interface PlayerState {
  name: string; // Nombre de la nave
  image?: string; // Imagen de la nave
  fuel: number;
  credits: number;
  crew: number;
  moral: number;
  hull: number;
  maxHull: number;
  shields: number;
  maxShields: number;
  deck: CardInstance[]; // El mazo ahora contiene instancias de cartas únicas
  // Sistema de progresión
  level: number;
  xp: number;
  xpToNextLevel: number;
  // Banderas narrativas para eventos persistentes
  narrativeFlags: { [key: string]: any };
  // Sistema de relaciones
  crewAffinity: { [crewId: string]: number };
  // Metaprogresión
  achievements: string[];
}

// --- Tipos del Motor de Combate ---

// Intenciones del enemigo
export interface EnemyIntent {
    type: 'ATTACK' | 'DEFEND' | 'BUFF' | 'DEBUFF' | 'ATTACK_DEFEND' | 'UNKNOWN';
    value?: number;
    secondaryValue?: number;
}

// 3.1 Combatant (jugador o enemigo)
export interface Combatant {
  id: string;
  name: string;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  dead: boolean;
  baseDamage?: number; // Para enemigos simples
  reward?: { credits: number; xpReward?: number }; // Para enemigos
  image?: string; // URL de la imagen para la nave enemiga
  // Campos específicos del juego de cartas
  energy?: number;
  maxEnergy?: number;
  fuego?: number; // Nuevo recurso
  maniobra?: number; // Nuevo recurso
  credits?: number; // Créditos ganados en combate
  hand?: CardInstance[];
  drawPile?: CardInstance[];
  discardPile?: CardInstance[];
  exilePile?: CardInstance[]; // Pila de exilio
  // Campos para la IA del enemigo
  intent?: EnemyIntent;
  pattern?: string[];
  patternIndex?: number;
  attackBuff?: number;
}


// 3.3 Action (Entrada en la Cola de Acciones)
export type ActionType = 
    'DEAL_DAMAGE' 
  | 'RECHARGE_SHIELD' 
  | 'REPAIR_HULL'
  | 'GAIN_ENERGY'
  | 'GAIN_RESOURCE' // Nueva acción
  | 'DRAW_CARDS';   // Nueva acción

export interface Action {
  id: string; // id único para la acción
  type: ActionType;
  sourceId: string;
  targetId: string;
  value?: number;
  meta?: {
      resource?: 'fuego' | 'maniobra' | 'credito';
      [key: string]: any;
  };
}

// 3.4 Snapshot y Estado del Combate
export interface CombatState {
  turn: number;
  phase: 'PLAYER_INPUT' | 'RESOLUTION' | 'GAME_OVER';
  rngSeed: number; // La semilla para el combate actual
  rngState: any; // El estado del PRNG para ser guardado/cargado
  combatants: Combatant[];
  actionQueue: Action[];
  log: string[];
  victory?: boolean;
}


// --- Tipos de Cartas de Evento ---
export interface EventConsequenceResult {
  newState: PlayerState;
  log: string;
  reactionText?: string;
  xpGained?: number;
  setNarrativeFlag?: { key: string; value: any };
  crewAffinityChange?: { crewId: string; amount: number };
  achievementId?: string;
}

export interface EventOption {
  text: string;
  requirements?: { credits?: number; crew?: number };
  crewRequirement?: string; // Requiere una carta de tripulación específica en el mazo
  narrativeFlagRequirement?: string; // Requiere que una bandera narrativa esté activa
  consequence: (state: PlayerState) => EventConsequenceResult;
}

export interface EventCardData {
  id: string;
  title: string;
  type: NodeType;
  image?: string; // URL de la imagen para el evento cinemático
  introText: string[]; // Texto de ambientación cinemático, dividido en partes
  promptText: string; // El texto que presenta la decisión
  options: EventOption[];
}

// Tipo para resultados de eventos simples (no basados en cartas)
export interface SimulationResult {
  newState: PlayerState;
  log: string;
  xpGained?: number;
}

// --- Tipos de la Tienda ---
export type ShopTrait = 'Generoso' | 'Avaro' | 'Contrabandista' | 'Militar';

export interface ShopCard {
    cardId: string;
    price: number;
    isDeal?: boolean;
}

export type ShopServiceType = 'remove_card' | 'repair_hull' | 'upgrade_card';

export interface ShopService {
    type: ShopServiceType;
    price: number;
}

export interface ShopInventory {
  trait: ShopTrait;
  cards: ShopCard[];
  services: ShopService[];
}