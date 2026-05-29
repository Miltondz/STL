// services/relicEngine.ts
import { CombatState, PlayerState, RelicData } from '../types';
import { applyStatus } from './statusEngine';

export const ALL_RELICS: Record<string, RelicData> = {
  // --- Relics originales ---
  REL_NUCLEAR_BATTERY: {
    id: 'REL_NUCLEAR_BATTERY', name: 'Batería Nuclear', rarity: 'Common', icon: '☢️',
    description: '+1 Energía al inicio de cada turno.',
    flavorText: 'La radiación es un efecto secundario aceptable.',
    trigger: 'TURN_START', effect: { kind: 'TURN_START_ENERGY', value: 1 },
  },
  REL_PILOT_REFLEXES: {
    id: 'REL_PILOT_REFLEXES', name: 'Reflejos de Piloto', rarity: 'Common', icon: '🎯',
    description: 'Inicia cada combate con 4 de escudo extra.',
    flavorText: '"Esquivar es el mejor escudo."',
    trigger: 'COMBAT_START', effect: { kind: 'COMBAT_START_SHIELD', value: 4 },
  },
  REL_AMMO_OVERLOAD: {
    id: 'REL_AMMO_OVERLOAD', name: 'Sobrecarga de Munición', rarity: 'Uncommon', icon: '🔫',
    description: 'El primer Ataque de cada turno inflige +2 de daño.',
    trigger: 'CARD_PLAYED_ATTACK', effect: { kind: 'FIRST_ATTACK_DMG_BONUS', value: 2 },
  },
  REL_BLACK_BOX: {
    id: 'REL_BLACK_BOX', name: 'Caja Negra', rarity: 'Uncommon', icon: '📦',
    description: 'Si tu mano está vacía al fin de turno, roba 1 carta extra al siguiente.',
    trigger: 'TURN_END', effect: { kind: 'EMPTY_HAND_BONUS_DRAW', value: 1 },
  },
  REL_QUANTUM_ENGINE: {
    id: 'REL_QUANTUM_ENGINE', name: 'Motor Cuántico', rarity: 'Rare', icon: '⚛️',
    description: 'El primer nodo de cada capa del mapa cuesta 0 combustible.',
    trigger: 'NODE_ENTERED', effect: { kind: 'FIRST_NODE_FREE_FUEL' },
  },
  REL_COMBAT_STIMS: {
    id: 'REL_COMBAT_STIMS', name: 'Estimulantes de Combate', rarity: 'Rare', icon: '💉',
    description: 'El primer impacto al casco por combate se reduce en 3.',
    trigger: 'DAMAGE_TAKEN_HULL', effect: { kind: 'FIRST_HULL_DMG_REDUCE', value: 3 },
  },
  REL_PIRATE_FLAG: {
    id: 'REL_PIRATE_FLAG', name: 'Bandera Pirata', rarity: 'Rare', icon: '🏴‍☠️',
    description: '+3 créditos al ganar cada batalla.',
    trigger: 'COMBAT_END_VICTORY', effect: { kind: 'VICTORY_BONUS_CREDITS', value: 3 },
  },
  REL_ION_CAPACITOR: {
    id: 'REL_ION_CAPACITOR', name: 'Capacitor de Iones', rarity: 'Rare', icon: '🔋',
    description: 'El Incendio que aplicas tiene el doble de intensidad.',
    trigger: 'PASSIVE', effect: { kind: 'DOUBLE_BURN_STACKS' },
  },
  REL_EMP_CAPACITOR: {
    id: 'REL_EMP_CAPACITOR', name: 'Capacitor EMP', rarity: 'Rare', icon: '⚡',
    description: 'Al aplicar Pulso EMP, ganas 1 de Fuego.',
    trigger: 'PASSIVE', effect: { kind: 'EMP_BONUS_FUEGO', value: 1 },
  },
  REL_HEGEMONY_RELIC: {
    id: 'REL_HEGEMONY_RELIC', name: 'Reliquia de la Hegemonía', rarity: 'Boss', icon: '🏛️',
    description: 'Roba 1 carta adicional en el primer turno de cada combate.',
    trigger: 'COMBAT_START', effect: { kind: 'COMBAT_START_BONUS_DRAW', value: 1 },
  },
  REL_PHANTOM_DRIVE: {
    id: 'REL_PHANTOM_DRIVE', name: 'Motor Fantasma', rarity: 'Boss', icon: '👻',
    description: 'Una vez por combate, 50% del daño al casco se redirige a escudos.',
    trigger: 'DAMAGE_TAKEN_HULL', effect: { kind: 'ONCE_REDIRECT_HULL_DMG' },
  },
  REL_SMUGGLER_CONTACT: {
    id: 'REL_SMUGGLER_CONTACT', name: 'Contacto Contrabandista', rarity: 'Event', icon: '🤝',
    description: 'La primera vez que entras a una tienda, una carta al azar es gratis.',
    trigger: 'SHOP_ENTERED', effect: { kind: 'ONE_FREE_SHOP_CARD' }, oneShot: true,
  },

  // --- Set "Brasas del Vacío" ---
  REL_FUSION_CORE: {
    id: 'REL_FUSION_CORE', name: 'Núcleo de Fusión', rarity: 'Uncommon', icon: '🔥',
    description: 'Al inicio de cada turno, aplica 1 de Incendio al enemigo.',
    flavorText: 'El calor es inevitable. Úsalo.',
    trigger: 'TURN_START', effect: { kind: 'FUSION_CORE_BURN', value: 1 },
  },
  REL_PYRO_INJECTOR: {
    id: 'REL_PYRO_INJECTOR', name: 'Inyector Pirótico', rarity: 'Rare', icon: '💥',
    description: 'Las cartas de Ataque que aplican Incendio añaden +1 pila extra.',
    flavorText: 'Más calor, más caos.',
    trigger: 'PASSIVE', effect: { kind: 'PYRO_INJECTOR_BONUS', value: 1 },
  },
  REL_PLASMA_REGULATOR: {
    id: 'REL_PLASMA_REGULATOR', name: 'Regulador de Plasma', rarity: 'Rare', icon: '🌀',
    description: 'Cada vez que aplicas Fuga de Plasma, añades +1 pila extra.',
    flavorText: 'El plasma no perdona fugas.',
    trigger: 'PASSIVE', effect: { kind: 'PLASMA_REGULATOR_BONUS', value: 1 },
  },
  REL_AEGIS_PROTOCOL: {
    id: 'REL_AEGIS_PROTOCOL', name: 'Protocolo Égida', rarity: 'Uncommon', icon: '🛡️',
    description: 'Al fin de turno, si tienes 10+ escudos, repara 2 de casco.',
    flavorText: 'Los escudos son el primer escalpelo.',
    trigger: 'TURN_END', effect: { kind: 'AEGIS_PROTOCOL_HEAL', value: 2 },
  },
  REL_DEFLECTOR_ARRAY: {
    id: 'REL_DEFLECTOR_ARRAY', name: 'Matriz Deflectora', rarity: 'Rare', icon: '🔷',
    description: 'Por cada carta Retenida al inicio de turno, ganas +2 escudos.',
    flavorText: 'Cada recurso guardado es un golpe absorbido.',
    trigger: 'PASSIVE', effect: { kind: 'DEFLECTOR_ARRAY_SHIELD', value: 2 },
  },
  REL_BULWARK_HEART: {
    id: 'REL_BULWARK_HEART', name: 'Corazón Bastión', rarity: 'Boss', icon: '💠',
    description: 'Si no recibes daño al casco en un combate, repara 5 al ganar.',
    flavorText: 'La invulnerabilidad tiene su recompensa.',
    trigger: 'COMBAT_END_VICTORY', effect: { kind: 'BULWARK_HEART_REPAIR', value: 5 },
  },
  REL_SABOTAGE_KIT: {
    id: 'REL_SABOTAGE_KIT', name: 'Kit de Sabotaje', rarity: 'Uncommon', icon: '🔧',
    description: 'Cada vez que aplicas Brecha de Casco, añades +1 pila extra.',
    flavorText: 'Una fisura bien colocada lo cambia todo.',
    trigger: 'PASSIVE', effect: { kind: 'SABOTAGE_KIT_HB_BONUS', value: 1 },
  },
  REL_OVERRIDE_KEY: {
    id: 'REL_OVERRIDE_KEY', name: 'Llave de Override', rarity: 'Rare', icon: '🗝️',
    description: 'Aplicar Sobrecalentamiento también aplica 1 de Atasco al mismo objetivo.',
    flavorText: 'Cuando los sistemas fallan, también los escudos.',
    trigger: 'PASSIVE', effect: { kind: 'OVERRIDE_KEY_JAMMED' },
  },
  REL_CHRONOMETER: {
    id: 'REL_CHRONOMETER', name: 'Cronómetro de Impacto', rarity: 'Boss', icon: '⏱️',
    description: 'El último impacto de cartas multi-golpe inflige ×1.5 de daño.',
    flavorText: 'El golpe final siempre duele más.',
    trigger: 'PASSIVE', effect: { kind: 'CHRONOMETER_LAST_HIT' },
  },
  REL_SCAVENGER_DRONE: {
    id: 'REL_SCAVENGER_DRONE', name: 'Dron Carroñero', rarity: 'Uncommon', icon: '🛸',
    description: 'Cada vez que exilias una carta en combate, ganas +1 Crédito.',
    flavorText: 'Los desperdicios de unos son los beneficios de otros.',
    trigger: 'PASSIVE', effect: { kind: 'SCAVENGER_DRONE_CREDIT', value: 1 },
  },
  REL_VOID_LEDGER: {
    id: 'REL_VOID_LEDGER', name: 'Libro del Vacío', rarity: 'Rare', icon: '📒',
    description: 'Cada 3 cartas jugadas en un turno, roba 1 carta.',
    flavorText: 'El vacío lleva la cuenta.',
    trigger: 'PASSIVE', effect: { kind: 'VOID_LEDGER_DRAW', value: 3 },
  },
  REL_GHOST_PROTOCOL_RELIC: {
    id: 'REL_GHOST_PROTOCOL_RELIC', name: 'Protocolo Espectral', rarity: 'Boss', icon: '👤',
    description: 'Las cartas Etéreas van al descarte en lugar de ser exiliadas.',
    flavorText: 'Lo etéreo puede volverse tangible.',
    trigger: 'PASSIVE', effect: { kind: 'GHOST_PROTOCOL_RELIC' },
  },
};

// --- In-combat triggers ---

export const applyRelicsOnCombatStart = (state: CombatState): CombatState => {
  const relics = state.relics || [];
  if (!relics.length) return state;

  const combatants = JSON.parse(JSON.stringify(state.combatants));
  const player = combatants.find((c: any) => c.isPlayer);
  const logs: string[] = [];
  let relicState = { ...(state.relicState || {}) };

  if (player && relics.includes('REL_PILOT_REFLEXES')) {
    const bonus = ALL_RELICS['REL_PILOT_REFLEXES'].effect.value || 4;
    player.shield = Math.min(player.maxShield, player.shield + bonus);
    logs.push(`🎯 Reflejos de Piloto: +${bonus} escudo al inicio del combate.`);
  }

  if (relics.includes('REL_BULWARK_HEART')) {
    relicState = { ...relicState, REL_BULWARK_HEART: { hullDamageTaken: false } };
  }

  return { ...state, combatants, relicState, log: [...state.log, ...logs] };
};

export const computeRelicTurnStartEffects = (state: CombatState): {
  bonusDrawCount: number;
  energyBonus: number;
  enemyBurnStacks: number;
  newRelicState: NonNullable<CombatState['relicState']>;
  logs: string[];
} => {
  const relics = state.relics || [];
  let bonusDrawCount = 0;
  let energyBonus = 0;
  let enemyBurnStacks = 0;
  let newRelicState = { ...(state.relicState || {}) };
  const logs: string[] = [];

  if (relics.includes('REL_NUCLEAR_BATTERY')) {
    const bonus = ALL_RELICS['REL_NUCLEAR_BATTERY'].effect.value || 1;
    energyBonus += bonus;
    logs.push(`☢️ Batería Nuclear: +${bonus} Energía.`);
  }

  if (relics.includes('REL_AMMO_OVERLOAD')) {
    newRelicState = { ...newRelicState, REL_AMMO_OVERLOAD: { used: false } };
  }

  if (relics.includes('REL_HEGEMONY_RELIC') && state.turn === 1) {
    const bonus = ALL_RELICS['REL_HEGEMONY_RELIC'].effect.value || 1;
    bonusDrawCount += bonus;
    logs.push(`🏛️ Reliquia de la Hegemonía: +${bonus} carta extra.`);
  }

  if (relics.includes('REL_BLACK_BOX') && newRelicState.REL_BLACK_BOX?.used) {
    const bonus = ALL_RELICS['REL_BLACK_BOX'].effect.value || 1;
    bonusDrawCount += bonus;
    newRelicState = { ...newRelicState, REL_BLACK_BOX: { used: false } };
    logs.push(`📦 Caja Negra: +${bonus} carta extra.`);
  }

  if (relics.includes('REL_FUSION_CORE')) {
    enemyBurnStacks = ALL_RELICS['REL_FUSION_CORE'].effect.value || 1;
  }

  return { bonusDrawCount, energyBonus, enemyBurnStacks, newRelicState, logs };
};

export const computeRelicTurnEndEffects = (
  relics: string[] | undefined,
  relicState: CombatState['relicState'],
  handIsEmpty: boolean,
  playerShield: number
): { newRelicState: NonNullable<CombatState['relicState']>; logs: string[]; hullRepair: number } => {
  let newRelicState = { ...(relicState || {}) };
  const logs: string[] = [];
  let hullRepair = 0;

  if ((relics || []).includes('REL_BLACK_BOX') && handIsEmpty) {
    newRelicState = { ...newRelicState, REL_BLACK_BOX: { used: true } };
    logs.push(`📦 Caja Negra: mano vacía — robarás 1 carta extra.`);
  }

  if ((relics || []).includes('REL_AEGIS_PROTOCOL') && playerShield >= 10) {
    hullRepair = ALL_RELICS['REL_AEGIS_PROTOCOL'].effect.value || 2;
    logs.push(`🛡️ Protocolo Égida: ${playerShield} escudos — repara ${hullRepair} casco.`);
  }

  return { newRelicState, logs, hullRepair };
};

export const computeRelicCardDmgBonus = (
  relics: string[] | undefined,
  relicState: CombatState['relicState'],
): { dmgBonus: number; newRelicState: NonNullable<CombatState['relicState']>; logs: string[] } => {
  let dmgBonus = 0;
  let newRelicState = { ...(relicState || {}) };
  const logs: string[] = [];

  if ((relics || []).includes('REL_AMMO_OVERLOAD') && !newRelicState.REL_AMMO_OVERLOAD?.used) {
    dmgBonus += ALL_RELICS['REL_AMMO_OVERLOAD'].effect.value || 2;
    newRelicState = { ...newRelicState, REL_AMMO_OVERLOAD: { used: true } };
    logs.push(`🔫 Sobrecarga de Munición: +${dmgBonus} daño.`);
  }

  return { dmgBonus, newRelicState, logs };
};

export const computeRelicBurnStacks = (relics: string[] | undefined, stacks: number): number => {
  if ((relics || []).includes('REL_ION_CAPACITOR')) return stacks * 2;
  return stacks;
};

export const computeRelicHBStacks = (relics: string[] | undefined, stacks: number): number => {
  if ((relics || []).includes('REL_SABOTAGE_KIT')) return stacks + (ALL_RELICS['REL_SABOTAGE_KIT'].effect.value || 1);
  return stacks;
};

export const computeRelicPLStacks = (relics: string[] | undefined, stacks: number): number => {
  if ((relics || []).includes('REL_PLASMA_REGULATOR')) return stacks + (ALL_RELICS['REL_PLASMA_REGULATOR'].effect.value || 1);
  return stacks;
};

export const computeRelicDamageTakenEffects = (
  relics: string[] | undefined,
  relicState: CombatState['relicState'],
  hulldmg: number
): { dmg: number; shieldRestore: number; newRelicState: NonNullable<CombatState['relicState']>; logs: string[] } => {
  let dmg = hulldmg;
  let shieldRestore = 0;
  let newRelicState = { ...(relicState || {}) };
  const logs: string[] = [];

  if ((relics || []).includes('REL_COMBAT_STIMS') && !newRelicState.REL_COMBAT_STIMS?.used) {
    const reduction = Math.min(dmg, ALL_RELICS['REL_COMBAT_STIMS'].effect.value || 3);
    dmg = Math.max(0, dmg - reduction);
    newRelicState = { ...newRelicState, REL_COMBAT_STIMS: { used: true } };
    logs.push(`💉 Estimulantes de Combate: primer impacto reducido en ${reduction}.`);
  }

  if ((relics || []).includes('REL_PHANTOM_DRIVE') && !newRelicState.REL_PHANTOM_DRIVE?.used) {
    const redirected = Math.floor(dmg * 0.5);
    dmg = dmg - redirected;
    shieldRestore = redirected;
    newRelicState = { ...newRelicState, REL_PHANTOM_DRIVE: { used: true } };
    logs.push(`👻 Motor Fantasma: ${redirected} de daño redirigido a escudos.`);
  }

  return { dmg, shieldRestore, newRelicState, logs };
};

// --- Out-of-combat triggers ---

export const applyRelicsOnCombatVictory = (
  playerState: PlayerState,
  combatRelicState?: CombatState['relicState']
): { playerState: PlayerState; logs: string[] } => {
  const logs: string[] = [];
  let state = playerState;

  if ((state.relics || []).includes('REL_PIRATE_FLAG')) {
    const bonus = ALL_RELICS['REL_PIRATE_FLAG'].effect.value || 3;
    logs.push(`🏴‍☠️ Bandera Pirata: +${bonus} créditos.`);
    state = { ...state, credits: state.credits + bonus };
  }

  if ((state.relics || []).includes('REL_BULWARK_HEART') && combatRelicState) {
    const bwState = combatRelicState['REL_BULWARK_HEART'];
    if (bwState && bwState.hullDamageTaken === false) {
      const repair = ALL_RELICS['REL_BULWARK_HEART'].effect.value || 5;
      logs.push(`💠 Corazón Bastión: sin daño al casco — repara ${repair}.`);
      state = { ...state, hull: Math.min(state.maxHull, state.hull + repair) };
    }
  }

  return { playerState: state, logs };
};

export const computeRelicNodeFuelCost = (
  playerState: PlayerState,
  normalCost: number,
  isFirstNodeInLayer: boolean
): number => {
  if (isFirstNodeInLayer && (playerState.relics || []).includes('REL_QUANTUM_ENGINE')) return 0;
  return normalCost;
};

export const applyRelicsOnShopEntered = (
  playerState: PlayerState
): { playerState: PlayerState; freeCardIndex: number } => {
  const relicId = 'REL_SMUGGLER_CONTACT';
  if (!(playerState.relics || []).includes(relicId) || playerState.relicState?.[relicId]?.used) {
    return { playerState, freeCardIndex: -1 };
  }
  return {
    playerState: {
      ...playerState,
      relicState: { ...playerState.relicState, [relicId]: { used: true } },
    },
    freeCardIndex: 0,
  };
};
