// types.ts

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

// --- Tipos de Juego Centrales ---
export enum NodeType {
  START = 'INICIO',
  BATTLE = 'BATALLA',
  ELITE = 'ELITE',
  ENCOUNTER = 'ENCUENTRO',
  SHOP = 'TIENDA',
  HAZARD = 'PELIGRO',
  REST = 'DESCANSO',
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
export type CardKeyword = 'EXHAUST' | 'RETAIN' | 'INNATE' | 'ETHEREAL' | 'UNPLAYABLE' | 'BURN_CURSE';

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
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Inicial' | 'Curse';
  faction?: 'Neutral' | string;
  description: string;
  effectBase?: string;
  value?: number; // Valor base para efectos (ej: 5 de daño)
  hits?: number;  // Para multi-hit: número de veces que se aplica el daño
  keywords?: CardKeyword[];
  statusApply?: { target: 'SELF' | 'ENEMY'; status: StatusEffectId };
  upgradedVersion?: Partial<Pick<CardData, 'cost' | 'value' | 'description' | 'hits'>>;
  possibleAffixes?: CardAffix[];
  image?: string; // URL de la imagen para retratos de tripulación
  systemTarget?: ShipSystemId; // For System-Strike cards
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
    tokenImage?: string; // Imagen del token para el mapa
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
  bonusEnergy?: number; // Extra energy per combat, awarded by level-up ENERGY reward
  relics: string[];
  relicState: { [relicId: string]: { used?: boolean } };
  sector: number; // 1 = first sector, 2, 3 = final
}

// --- Ship Systems ---
export type ShipSystemId = 'WEAPONS' | 'SHIELDS' | 'ENGINES' | 'CREW' | 'REACTOR';

export interface ShipSystem {
  id: ShipSystemId;
  name: string;
  icon: string;
  hp: number;
  maxHp: number;
  disabled: boolean;
  repairCountdown: number; // turns until re-enabled
}

// --- Tipos de Relics ---
export type RelicTrigger =
  | 'COMBAT_START'
  | 'TURN_START'
  | 'TURN_END'
  | 'CARD_PLAYED_ATTACK'
  | 'DAMAGE_TAKEN_HULL'
  | 'COMBAT_END_VICTORY'
  | 'NODE_ENTERED'
  | 'SHOP_ENTERED'
  | 'PASSIVE';

export type RelicRarity = 'Common' | 'Uncommon' | 'Rare' | 'Boss' | 'Event';

export interface RelicData {
  id: string;
  name: string;
  rarity: RelicRarity;
  icon: string;
  description: string;
  flavorText?: string;
  trigger: RelicTrigger;
  effect: { kind: string; value?: number };
  oneShot?: boolean;
  image?: string;
}

// --- Efectos de Estado ---

export type StatusEffectId =
  | 'BURN'
  | 'PLASMA_LEAK'
  | 'OVERHEAT'
  | 'HULL_BREACH'
  | 'JAMMED'
  | 'EMP'
  | 'OVERCHARGE'
  | 'STEALTH';

export type StatusStackBehavior = 'STACK' | 'REFRESH_DURATION' | 'MAX';

export interface StatusEffect {
  id: StatusEffectId;
  stacks: number; // intensidad O turnos restantes según el efecto
}

// --- Tipos del Motor de Combate ---

// Intenciones del enemigo
export interface EnemyIntent {
    type: 'ATTACK' | 'DEFEND' | 'BUFF' | 'DEBUFF' | 'ATTACK_DEFEND' | 'HEAVY_ATTACK' | 'UNKNOWN';
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
  phase2Triggered?: boolean;
  phase2Pattern?: string[];
  // Efectos de estado activos
  statuses?: StatusEffect[];
  // Ship subsystems (boss/elite enemies)
  systems?: ShipSystem[];
  // Active crew station bonuses (set during combat when crew cards are played)
  crewBonuses?: {
    artilleroBonus: number;     // flat +N dmg on all player attacks
    pilotoMissChance: number;   // N% chance enemy attacks miss
    ingenieroShield: number;    // +N shield at start of each turn
    medicoHeal: number;         // +N hull repair at end of each turn
    comandanteEnergy: number;   // +N energy per turn
    saboteadorActive: boolean;  // apply 1 BURN to enemy each turn start
    comercianteCredits: number; // +N credits added to victory reward
    psiquicoDraw: number;       // +N cards drawn per turn
  };
}


// 3.3 Action (Entrada en la Cola de Acciones)
export type ActionType =
    'DEAL_DAMAGE'
  | 'RECHARGE_SHIELD'
  | 'REPAIR_HULL'
  | 'GAIN_ENERGY'
  | 'GAIN_RESOURCE'
  | 'DRAW_CARDS'
  | 'APPLY_STATUS'
  | 'DAMAGE_SYSTEM';

export interface Action {
  id: string; // id único para la acción
  type: ActionType;
  sourceId: string;
  targetId: string;
  value?: number;
  meta?: {
      resource?: 'fuego' | 'maniobra' | 'credito';
      status?: StatusEffectId;
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
  relics?: string[];
  relicState?: { [relicId: string]: { used?: boolean; hullDamageTaken?: boolean } };
  cardsPlayedThisTurn?: number;
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