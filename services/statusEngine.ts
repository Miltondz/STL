// services/statusEngine.ts
import { Combatant, CombatState, StatusEffect, StatusEffectId, StatusStackBehavior } from '../types';

// --- Definiciones de efectos ---

interface StatusEffectDef {
  name: string;
  icon: string;
  description: (stacks: number) => string;
  isDebuff: boolean;
  stackBehavior: StatusStackBehavior;
  tickPhase: 'TURN_END' | 'NONE';
}

export const STATUS_DEFS: Record<StatusEffectId, StatusEffectDef> = {
  BURN: {
    name: 'Incendio', icon: '🔥', isDebuff: true,
    description: (s) => `Recibe ${s} dmg al fin de turno. Se reduce a la mitad.`,
    stackBehavior: 'STACK', tickPhase: 'TURN_END',
  },
  PLASMA_LEAK: {
    name: 'Fuga de Plasma', icon: '☢️', isDebuff: true,
    description: (s) => `Recibe ${s} dmg al fin de turno. -1 por tick.`,
    stackBehavior: 'STACK', tickPhase: 'TURN_END',
  },
  OVERHEAT: {
    name: 'Sobrecalentamiento', icon: '🌡️', isDebuff: true,
    description: (s) => `Daño infligido -25% por ${s} turno(s).`,
    stackBehavior: 'REFRESH_DURATION', tickPhase: 'TURN_END',
  },
  HULL_BREACH: {
    name: 'Brecha en Casco', icon: '💥', isDebuff: true,
    description: (s) => `Daño recibido +50% por ${s} turno(s).`,
    stackBehavior: 'REFRESH_DURATION', tickPhase: 'TURN_END',
  },
  JAMMED: {
    name: 'Interferencia', icon: '📡', isDebuff: true,
    description: (s) => `Escudo ganado -25% por ${s} turno(s).`,
    stackBehavior: 'REFRESH_DURATION', tickPhase: 'TURN_END',
  },
  EMP: {
    name: 'Pulso EMP', icon: '⚡', isDebuff: true,
    description: (s) => `Pierde el próximo turno (${s}).`,
    stackBehavior: 'MAX', tickPhase: 'TURN_END',
  },
  OVERCHARGE: {
    name: 'Sobrecarga', icon: '🔋', isDebuff: false,
    description: (s) => `+${s} de daño infligido (permanente).`,
    stackBehavior: 'STACK', tickPhase: 'NONE',
  },
  STEALTH: {
    name: 'Sigilo', icon: '👻', isDebuff: false,
    description: (s) => `Hits entrantes reducidos a 1 dmg por ${s} turno(s).`,
    stackBehavior: 'REFRESH_DURATION', tickPhase: 'TURN_END',
  },
};

// --- Aplicar estado a un combatiente ---

export const applyStatus = (
  statuses: StatusEffect[],
  id: StatusEffectId,
  stacks: number
): StatusEffect[] => {
  const def = STATUS_DEFS[id];
  const existing = statuses.find((s) => s.id === id);

  if (!existing) {
    return [...statuses, { id, stacks }];
  }

  switch (def.stackBehavior) {
    case 'STACK':
      return statuses.map((s) => s.id === id ? { ...s, stacks: s.stacks + stacks } : s);
    case 'REFRESH_DURATION':
      return statuses.map((s) => s.id === id ? { ...s, stacks: s.stacks + stacks } : s);
    case 'MAX':
      return statuses.map((s) => s.id === id ? { ...s, stacks: Math.max(s.stacks, stacks) } : s);
  }
};

// --- Modificadores de daño y escudo ---

export const computeOutgoingDamage = (source: Combatant, baseDmg: number): number => {
  let dmg = baseDmg;
  const overheat = source.statuses?.find((s) => s.id === 'OVERHEAT');
  if (overheat) dmg = Math.floor(dmg * 0.75);
  const overcharge = source.statuses?.find((s) => s.id === 'OVERCHARGE');
  if (overcharge) dmg += overcharge.stacks;
  return Math.max(0, dmg);
};

export const computeIncomingDamage = (target: Combatant, dmg: number): number => {
  const breach = target.statuses?.find((s) => s.id === 'HULL_BREACH');
  if (breach) dmg = Math.floor(dmg * 1.5);
  const stealth = target.statuses?.find((s) => s.id === 'STEALTH');
  if (stealth) dmg = Math.min(dmg, 1);
  return Math.max(0, dmg);
};

export const computeIncomingShield = (target: Combatant, baseShield: number): number => {
  const jammed = target.statuses?.find((s) => s.id === 'JAMMED');
  if (jammed) return Math.floor(baseShield * 0.75);
  return baseShield;
};

// --- Comprueba si un combatiente está aturdido por EMP ---

export const isStunned = (combatant: Combatant): boolean =>
  (combatant.statuses?.some((s) => s.id === 'EMP' && s.stacks > 0) ?? false);

// --- Tick de estados al fin de turno ---

export const tickStatusesAtTurnEnd = (state: CombatState): CombatState => {
  const newState = {
    ...state,
    combatants: JSON.parse(JSON.stringify(state.combatants)) as Combatant[],
    log: [...state.log],
  };

  for (const combatant of newState.combatants) {
    if (!combatant.statuses?.length || combatant.dead) continue;

    const surviving: StatusEffect[] = [];

    for (const status of combatant.statuses) {
      const def = STATUS_DEFS[status.id];

      if (def.tickPhase !== 'TURN_END') {
        surviving.push(status);
        continue;
      }

      switch (status.id) {
        case 'BURN': {
          const dmg = status.stacks;
          combatant.hp = Math.max(0, combatant.hp - dmg);
          newState.log.push(`🔥 ${combatant.name} recibe ${dmg} dmg por Incendio.`);
          if (combatant.hp <= 0) {
            combatant.dead = true;
            newState.log.push(`¡${combatant.name} destruido por Incendio!`);
          }
          const halfed = Math.floor(status.stacks / 2);
          if (halfed > 0) surviving.push({ ...status, stacks: halfed });
          break;
        }
        case 'PLASMA_LEAK': {
          const dmg = status.stacks;
          combatant.hp = Math.max(0, combatant.hp - dmg);
          newState.log.push(`☢️ ${combatant.name} recibe ${dmg} dmg por Fuga de Plasma.`);
          if (combatant.hp <= 0) {
            combatant.dead = true;
            newState.log.push(`¡${combatant.name} destruido por Fuga de Plasma!`);
          }
          const remaining = status.stacks - 1;
          if (remaining > 0) surviving.push({ ...status, stacks: remaining });
          break;
        }
        case 'EMP': {
          // EMP decrements each tick — consumed by processEnemyTurn check
          const rem = status.stacks - 1;
          if (rem > 0) surviving.push({ ...status, stacks: rem });
          else newState.log.push(`✓ ${combatant.name}: Pulso EMP disipado.`);
          break;
        }
        default: {
          // Duration-based: OVERHEAT, HULL_BREACH, JAMMED, STEALTH
          const rem = status.stacks - 1;
          if (rem > 0) {
            surviving.push({ ...status, stacks: rem });
          } else {
            newState.log.push(`✓ ${combatant.name}: ${def.name} disipado.`);
          }
          break;
        }
      }
    }

    combatant.statuses = surviving;
  }

  // Re-check game over after status damage
  const player = newState.combatants.find((c) => c.isPlayer);
  const enemy = newState.combatants.find((c) => !c.isPlayer);
  if (player?.dead) {
    newState.phase = 'GAME_OVER';
    newState.victory = false;
  } else if (enemy?.dead) {
    newState.phase = 'GAME_OVER';
    newState.victory = true;
  }

  return newState;
};
