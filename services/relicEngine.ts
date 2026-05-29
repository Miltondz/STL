// services/relicEngine.ts
import { CombatState, PlayerState, RelicData } from '../types';

export const ALL_RELICS: Record<string, RelicData> = {
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
};

// --- In-combat triggers ---

export const applyRelicsOnCombatStart = (state: CombatState): CombatState => {
  const relics = state.relics || [];
  if (!relics.length) return state;

  const combatants = JSON.parse(JSON.stringify(state.combatants));
  const player = combatants.find((c: any) => c.isPlayer);
  const logs: string[] = [];

  if (player && relics.includes('REL_PILOT_REFLEXES')) {
    const bonus = ALL_RELICS['REL_PILOT_REFLEXES'].effect.value || 4;
    player.shield = Math.min(player.maxShield, player.shield + bonus);
    logs.push(`🎯 Reflejos de Piloto: +${bonus} escudo al inicio del combate.`);
  }

  return { ...state, combatants, log: [...state.log, ...logs] };
};

export const computeRelicTurnStartEffects = (state: CombatState): {
  bonusDrawCount: number;
  energyBonus: number;
  newRelicState: NonNullable<CombatState['relicState']>;
  logs: string[];
} => {
  const relics = state.relics || [];
  let bonusDrawCount = 0;
  let energyBonus = 0;
  let newRelicState = { ...(state.relicState || {}) };
  const logs: string[] = [];

  if (relics.includes('REL_NUCLEAR_BATTERY')) {
    const bonus = ALL_RELICS['REL_NUCLEAR_BATTERY'].effect.value || 1;
    energyBonus += bonus;
    logs.push(`☢️ Batería Nuclear: +${bonus} Energía.`);
  }

  // Reset per-turn flag
  if (relics.includes('REL_AMMO_OVERLOAD')) {
    newRelicState = { ...newRelicState, REL_AMMO_OVERLOAD: { used: false } };
  }

  // +1 draw on turn 1 only
  if (relics.includes('REL_HEGEMONY_RELIC') && state.turn === 1) {
    const bonus = ALL_RELICS['REL_HEGEMONY_RELIC'].effect.value || 1;
    bonusDrawCount += bonus;
    logs.push(`🏛️ Reliquia de la Hegemonía: +${bonus} carta extra.`);
  }

  // Bonus draw if black box flagged last turn
  if (relics.includes('REL_BLACK_BOX') && newRelicState.REL_BLACK_BOX?.used) {
    const bonus = ALL_RELICS['REL_BLACK_BOX'].effect.value || 1;
    bonusDrawCount += bonus;
    newRelicState = { ...newRelicState, REL_BLACK_BOX: { used: false } };
    logs.push(`📦 Caja Negra: +${bonus} carta extra.`);
  }

  return { bonusDrawCount, energyBonus, newRelicState, logs };
};

export const computeRelicTurnEndEffects = (
  relics: string[] | undefined,
  relicState: CombatState['relicState'],
  handIsEmpty: boolean
): { newRelicState: NonNullable<CombatState['relicState']>; logs: string[] } => {
  let newRelicState = { ...(relicState || {}) };
  const logs: string[] = [];

  if ((relics || []).includes('REL_BLACK_BOX') && handIsEmpty) {
    newRelicState = { ...newRelicState, REL_BLACK_BOX: { used: true } };
    logs.push(`📦 Caja Negra: mano vacía — robarás 1 carta extra.`);
  }

  return { newRelicState, logs };
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
  playerState: PlayerState
): { playerState: PlayerState; logs: string[] } => {
  const logs: string[] = [];
  if (!(playerState.relics || []).includes('REL_PIRATE_FLAG')) return { playerState, logs };

  const bonus = ALL_RELICS['REL_PIRATE_FLAG'].effect.value || 3;
  logs.push(`🏴‍☠️ Bandera Pirata: +${bonus} créditos.`);
  return { playerState: { ...playerState, credits: playerState.credits + bonus }, logs };
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
