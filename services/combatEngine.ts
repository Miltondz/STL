// services/combatEngine.ts
import { PlayerState, CombatState, Action, ActionType, Combatant, CardInstance, EnemyIntent, StatusEffectId, ShipSystemId, Difficulty } from '../types';
import { getEnemyTemplates, getAllCards } from '../data';
import { SeededRNG } from './rng';
import {
  STATUS_DEFS,
  applyStatus,
  computeOutgoingDamage,
  computeIncomingDamage,
  computeIncomingShield,
  isStunned,
  tickStatusesAtTurnEnd,
} from './statusEngine';

import {
  ALL_RELICS,
  applyRelicsOnCombatStart,
  computeRelicTurnStartEffects,
  computeRelicTurnEndEffects,
  computeRelicCardDmgBonus,
  computeRelicBurnStacks,
  computeRelicHBStacks,
  computeRelicPLStacks,
  computeRelicDamageTakenEffects,
} from './relicEngine';

// --- Datos del Juego (lazy — llamar dentro de funciones para respetar carga de JSON) ---

// --- Contadores Globales ---
let actionIdCounter = 0;

// --- Funciones Auxiliares ---
const createAction = (type: ActionType, sourceId: string, targetId: string, value?: number, meta?: Action['meta']): Action => {
    return { id: `action-${actionIdCounter++}`, type, sourceId, targetId, value, meta };
};

const shuffleArray = <T>(array: T[], rng: SeededRNG): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// --- Procesamiento de Acciones ---

// Procesa una única acción de la cola.
const resolveAction = (state: CombatState, action: Action): CombatState => {
    const newState = { ...state, combatants: JSON.parse(JSON.stringify(state.combatants)) };
    let newLog = '';
    const extraLogs: string[] = [];

    const source = newState.combatants.find(c => c.id === action.sourceId);
    let target = newState.combatants.find(c => c.id === action.targetId);

    if (!source || !target || (target.dead && action.type !== 'GAIN_RESOURCE')) {
        newLog = `Acción '${action.type}' de ${source?.name || '?'} a ${target?.name || '?'} ignorada (objetivo inválido).`;
        return { ...newState, log: [...newState.log, newLog]};
    }

    switch (action.type) {
        case 'DEAL_DAMAGE': {
            let damage = action.value || 0;
            // Status modifiers: outgoing (OVERHEAT, OVERCHARGE on source) + incoming (HULL_BREACH, STEALTH on target)
            damage = computeOutgoingDamage(source, damage);
            damage = computeIncomingDamage(target, damage);
            newLog = `${source.name} ataca a ${target.name}.`;

            const shieldDamage = Math.min(target.shield, damage);
            if (shieldDamage > 0) {
                target.shield -= shieldDamage;
                damage -= shieldDamage;
                newLog += ` Los escudos absorben ${shieldDamage} de daño.`;
            }

            if (damage > 0 && target.isPlayer) {
                const relicResult = computeRelicDamageTakenEffects(newState.relics, newState.relicState, damage);
                damage = relicResult.dmg;
                newState.relicState = relicResult.newRelicState;
                extraLogs.push(...relicResult.logs);
                if (relicResult.shieldRestore > 0) {
                    target.shield = Math.min(target.maxShield, target.shield + relicResult.shieldRestore);
                }
            }

            if (damage > 0) {
                target.hp -= damage;
                newLog += ` El casco recibe ${damage} de daño.`;
                if (target.isPlayer && (newState.relics || []).includes('REL_BULWARK_HEART')) {
                    newState.relicState = { ...newState.relicState, REL_BULWARK_HEART: { hullDamageTaken: true } };
                }
            }

            if (target.hp <= 0) {
                target.hp = 0;
                target.dead = true;
                newLog += ` ¡${target.name} ha sido destruido!`;
            }
            break;
        }
        case 'RECHARGE_SHIELD': {
            const amount = computeIncomingShield(target, action.value || 0);
            target.shield = Math.min(target.maxShield, target.shield + amount);
            newLog = `${source.name} gana ${amount} de escudo.`;
            break;
        }
        case 'APPLY_STATUS': {
            const statusId = action.meta?.status as StatusEffectId | undefined;
            let stacks = action.value || 1;
            if (statusId && STATUS_DEFS[statusId]) {
                if (statusId === 'BURN' && source?.isPlayer) {
                    stacks = computeRelicBurnStacks(newState.relics, stacks);
                }
                if (statusId === 'HULL_BREACH' && source?.isPlayer) {
                    stacks = computeRelicHBStacks(newState.relics, stacks);
                }
                if (statusId === 'PLASMA_LEAK' && source?.isPlayer) {
                    stacks = computeRelicPLStacks(newState.relics, stacks);
                }
                target.statuses = applyStatus(target.statuses || [], statusId, stacks);
                newLog = `${target.name} recibe ${STATUS_DEFS[statusId].name} (${stacks}).`;
                if (statusId === 'OVERHEAT' && source?.isPlayer && (newState.relics || []).includes('REL_OVERRIDE_KEY')) {
                    target.statuses = applyStatus(target.statuses, 'JAMMED', 1);
                    extraLogs.push(`🗝️ Llave de Override: +1 Atasco.`);
                }
            }
            break;
        }
        case 'REPAIR_HULL': {
            const amount = action.value || 0;
            target.hp = Math.min(target.maxHp, target.hp + amount);
            newLog = `${source.name} repara ${amount} puntos de su casco.`;
            break;
        }
        case 'GAIN_ENERGY': {
            const amount = action.value || 0;
            if (target.isPlayer) {
                target.energy = Math.min(target.maxEnergy!, target.energy! + amount);
                newLog = `${source.name} gana ${amount} de energía.`;
            }
            break;
        }
        case 'GAIN_RESOURCE': {
            const amount = action.value || 0;
            const resource = action.meta?.resource;
            if (target.isPlayer && resource) {
                switch (resource) {
                    case 'fuego':
                        target.fuego = (target.fuego || 0) + amount;
                        newLog = `${source.name} gana ${amount} de Fuego.`;
                        break;
                    case 'maniobra':
                        target.maniobra = (target.maniobra || 0) + amount;
                        newLog = `${source.name} gana ${amount} de Maniobra.`;
                        break;
                    case 'credito':
                        target.credits = (target.credits || 0) + amount;
                        newLog = `${source.name} obtiene ${amount} Crédito(s).`;
                        break;
                }
            }
            break;
        }
        case 'DRAW_CARDS': {
            const amount = action.value || 0;
            if (target.isPlayer) {
                let logParts: string[] = [];
                let drawnCount = 0;
                for (let i = 0; i < amount; i++) {
                    if (target.drawPile!.length === 0) {
                        if (target.discardPile!.length === 0) {
                            break;
                        }
                        logParts.push(`${target.name} baraja su pila de descarte.`);
                        const rng = new SeededRNG(newState.rngSeed);
                        rng.setState(newState.rngState);
                        target.drawPile = shuffleArray(target.discardPile!, rng);
                        target.discardPile = [];
                        newState.rngState = rng.getState();
                    }
                    const card = target.drawPile!.pop();
                    if (card) {
                        target.hand!.push(card);
                        drawnCount++;
                    }
                }
                logParts.push(`${source.name} roba ${drawnCount} carta(s).`);
                newLog = logParts.join(' ');
            }
            break;
        }
        case 'DAMAGE_SYSTEM': {
            const systemId = action.meta?.system as ShipSystemId | undefined;
            if (!systemId || !target.systems) {
                newLog = `${target.name} no tiene sistemas para atacar.`;
                break;
            }
            const system = target.systems.find(s => s.id === systemId);
            if (!system || system.disabled) {
                newLog = `Sistema ${systemId} de ${target.name} ya está deshabilitado.`;
                break;
            }
            const sysDmg = action.value || 0;
            system.hp = Math.max(0, system.hp - sysDmg);
            newLog = `${source.name} ataca el sistema ${system.name} de ${target.name} (${sysDmg} daño, ${system.hp}/${system.maxHp} HP restante).`;
            if (system.hp <= 0) {
                system.disabled = true;
                system.repairCountdown = 2;
                newLog += ` ¡${system.name} deshabilitado!`;
                if (systemId === 'REACTOR') {
                    target.hp = 0;
                    target.dead = true;
                    newLog += ` ¡El Reactor ha sido destruido! ¡Victoria instantánea!`;
                }
            }
            break;
        }
    }
    return { ...newState, log: [...newState.log, ...extraLogs, newLog] };
};

// Procesa la cola de acciones completa y comprueba si el combate ha terminado.
const resolveActionQueue = (state: CombatState): CombatState => {
    if (state.actionQueue.length === 0) return state;

    const resolvedState = state.actionQueue.reduce(
        (currentState, action) => resolveAction(currentState, action),
        { ...state, actionQueue: [] } // Empieza con una cola de acciones vacía
    );

    // Comprueba victoria/derrota después de resolver las acciones
    const player = resolvedState.combatants.find(c => c.isPlayer)!;
    const enemy = resolvedState.combatants.find(c => !c.isPlayer)!;

    if (player.dead) {
        resolvedState.phase = 'GAME_OVER';
        resolvedState.victory = false;
    } else if (enemy.dead) {
        resolvedState.phase = 'GAME_OVER';
        resolvedState.victory = true;
    }
    
    return resolvedState;
};

// --- Gestión del Turno y Cartas ---

// Determina y establece la próxima acción del enemigo para que el jugador pueda verla.
const setEnemyIntent = (state: CombatState, rng: SeededRNG): CombatState => {
    const newState = { ...state, combatants: JSON.parse(JSON.stringify(state.combatants)) };
    const enemy = newState.combatants.find(c => !c.isPlayer);

    if (!enemy || !enemy.pattern || enemy.dead) return state;

    const patternAction = enemy.pattern[enemy.patternIndex!];
    let intent: EnemyIntent = { type: 'UNKNOWN' };

    switch (patternAction) {
        case 'ATTACK':
            const damage = (enemy.baseDamage || 5) + (enemy.attackBuff || 0);
            intent = { type: 'ATTACK', value: damage };
            break;
        case 'DEFEND':
            intent = { type: 'DEFEND', value: 5 };
            break;
        case 'ATTACK_DEFEND':
            const halfDamage = Math.floor(((enemy.baseDamage || 5) + (enemy.attackBuff || 0)) * 0.7);
            intent = { type: 'ATTACK_DEFEND', value: halfDamage, secondaryValue: 4 };
            break;
        case 'BUFF':
            intent = { type: 'BUFF' };
            break;
    }
    enemy.intent = intent;
    return newState;
}


// Prepara el inicio de un turno para el jugador.
const startPlayerTurn = (state: CombatState, rng: SeededRNG): CombatState => {
    // Spread log array to avoid mutating the input state reference
    let newState = { ...state, combatants: JSON.parse(JSON.stringify(state.combatants)), log: [...state.log] };
    const playerMutatable = newState.combatants.find(c => c.isPlayer)!;

    // Reset per-turn card counter
    newState.cardsPlayedThisTurn = 0;

    // Discard hand: RETAIN stays, ETHEREAL exiles (or discards with GHOST_PROTOCOL_RELIC), rest discards
    const retained: CardInstance[] = [];
    for (const card of playerMutatable.hand!) {
        const cd = getAllCards()[card.cardId];
        if (cd?.keywords?.includes('RETAIN')) {
            retained.push(card);
        } else if (cd?.keywords?.includes('ETHEREAL')) {
            if ((newState.relics || []).includes('REL_GHOST_PROTOCOL_RELIC')) {
                playerMutatable.discardPile!.push(card);
                newState.log.push(`${cd.name} regresa al descarte (Protocolo Espectral).`);
            } else {
                playerMutatable.exilePile!.push(card);
                newState.log.push(`${cd.name} se esfuma (Etéreo).`);
                if ((newState.relics || []).includes('REL_SCAVENGER_DRONE')) {
                    playerMutatable.credits = (playerMutatable.credits || 0) + 1;
                    newState.log.push(`🛸 Dron Carroñero: +1 Crédito.`);
                }
            }
        } else {
            playerMutatable.discardPile!.push(card);
        }
    }
    playerMutatable.hand = retained;

    // DEFLECTOR_ARRAY: +2 shield per retained card
    if (retained.length > 0 && (newState.relics || []).includes('REL_DEFLECTOR_ARRAY')) {
        const shieldBonus = retained.length * (ALL_RELICS['REL_DEFLECTOR_ARRAY'].effect.value || 2);
        playerMutatable.shield = Math.min(playerMutatable.maxShield, playerMutatable.shield + shieldBonus);
        newState.log.push(`🔷 Matriz Deflectora: +${shieldBonus} escudo por ${retained.length} carta(s) retenida(s).`);
    }

    playerMutatable.energy = playerMutatable.maxEnergy;
    playerMutatable.fuego = 0;
    playerMutatable.maniobra = 0;

    // Crew station bonuses: Ingeniero (shield), Comandante (energy)
    const crewBonuses = playerMutatable.crewBonuses;
    if (crewBonuses) {
        if (crewBonuses.ingenieroShield > 0) {
            playerMutatable.shield = Math.min(playerMutatable.maxShield, playerMutatable.shield + crewBonuses.ingenieroShield);
            newState.log.push(`⚙️ Ingeniero: +${crewBonuses.ingenieroShield} escudo.`);
        }
        if (crewBonuses.comandanteEnergy > 0) {
            playerMutatable.energy! += crewBonuses.comandanteEnergy;
            newState.log.push(`👑 Comandante: +${crewBonuses.comandanteEnergy} energía.`);
        }
        if (crewBonuses.saboteadorActive) {
            const sabotageEnemy = newState.combatants.find(c => !c.isPlayer);
            if (sabotageEnemy && !sabotageEnemy.dead) {
                sabotageEnemy.statuses = applyStatus(sabotageEnemy.statuses || [], 'BURN', 1);
                newState.log.push(`🔪 Saboteador: +1 Incendio al enemigo.`);
            }
        }
    }

    // Relic turn-start bonuses
    const relicTurnEffects = computeRelicTurnStartEffects(newState);
    playerMutatable.energy! += relicTurnEffects.energyBonus;
    newState.relicState = relicTurnEffects.newRelicState;
    relicTurnEffects.logs.forEach(l => newState.log.push(l));

    // FUSION_CORE: apply BURN to enemy at turn start
    if (relicTurnEffects.enemyBurnStacks > 0) {
        const enemy = newState.combatants.find(c => !c.isPlayer);
        if (enemy && !enemy.dead) {
            const stacks = computeRelicBurnStacks(newState.relics, relicTurnEffects.enemyBurnStacks);
            enemy.statuses = applyStatus(enemy.statuses || [], 'BURN', stacks);
            newState.log.push(`🔥 Núcleo de Fusión: ${stacks} Incendio al enemigo.`);
        }
    }

    const amount = 5 + relicTurnEffects.bonusDrawCount + (playerMutatable.crewBonuses?.psiquicoDraw || 0);
    for (let i = 0; i < amount; i++) {
        if (playerMutatable.drawPile!.length === 0) {
            if (playerMutatable.discardPile!.length === 0) break;
            newState.log.push(`${playerMutatable.name} baraja su pila de descarte.`);
            playerMutatable.drawPile = shuffleArray(playerMutatable.discardPile!, rng);
            playerMutatable.discardPile = [];
        }
        const card = playerMutatable.drawPile!.pop();
        if (card) playerMutatable.hand!.push(card);
    }

    // INNATE: on turn 1, force-draw any remaining INNATE cards from drawPile
    if (newState.turn === 1) {
        const innateIndices: number[] = [];
        playerMutatable.drawPile!.forEach((c, i) => {
            if (getAllCards()[c.cardId]?.keywords?.includes('INNATE')) innateIndices.push(i);
        });
        for (const i of innateIndices.reverse()) {
            const [card] = playerMutatable.drawPile!.splice(i, 1);
            playerMutatable.hand!.push(card);
            newState.log.push(`${getAllCards()[card.cardId]?.name ?? card.cardId} siempre disponible (Innata).`);
        }
    }

    newState.log.push(`--- Turno ${newState.turn}. Robas 5 cartas. ---`);
    newState.phase = 'PLAYER_INPUT';

    return setEnemyIntent(newState, rng);
}

// --- Creación y Flujo del Combate ---

const DIFFICULTY_MULT: Record<Difficulty, { hp: number; dmg: number }> = {
  EASY:   { hp: 0.75, dmg: 0.75 },
  NORMAL: { hp: 1.0,  dmg: 1.0  },
  HARD:   { hp: 1.3,  dmg: 1.3  },
};

export const createCombat = (playerState: PlayerState, enemyId: string, seed: number, difficulty: Difficulty = 'NORMAL'): CombatState => {
  const enemyTemplate = getEnemyTemplates()[enemyId];
  if (!enemyTemplate) throw new Error(`Enemigo con id "${enemyId}" no encontrado.`);

  const rng = new SeededRNG(seed);
  const mult = DIFFICULTY_MULT[difficulty];

  const player: Combatant = {
    id: 'PLAYER',
    name: playerState.name,
    image: playerState.image,
    isPlayer: true,
    hp: playerState.hull,
    maxHp: playerState.maxHull,
    shield: playerState.shields,
    maxShield: playerState.maxShields,
    dead: false,
    energy: 3 + (playerState.bonusEnergy || 0),
    maxEnergy: 3 + (playerState.bonusEnergy || 0),
    fuego: 0,
    maniobra: 0,
    credits: 0,
    hand: [],
    drawPile: shuffleArray(playerState.deck, rng),
    discardPile: [],
    exilePile: [],
  };

  const scaledMaxHp = Math.round(enemyTemplate.maxHp * mult.hp);
  const scaledBaseDmg = Math.round((enemyTemplate.baseDamage || 0) * mult.dmg);
  const scaledSystems = enemyTemplate.systems?.map(s => {
    const sHp = Math.round(s.maxHp * mult.hp);
    return { ...s, hp: sHp, maxHp: sHp };
  });

  const enemy: Combatant = {
    ...enemyTemplate,
    isPlayer: false,
    hp: scaledMaxHp,
    maxHp: scaledMaxHp,
    shield: enemyTemplate.maxShield,
    dead: false,
    attackBuff: 0,
    baseDamage: scaledBaseDmg || enemyTemplate.baseDamage,
    ...(scaledSystems ? { systems: scaledSystems } : {}),
  };
  
  let initialState: CombatState = {
    turn: 1,
    phase: 'PLAYER_INPUT',
    rngSeed: seed,
    rngState: rng.getState(),
    combatants: [player, enemy],
    actionQueue: [],
    log: [`Comienza el combate contra ${enemy.name}!`],
    relics: playerState.relics || [],
    relicState: {},
    cardsPlayedThisTurn: 0,
  };

  initialState = applyRelicsOnCombatStart(initialState);

  const stateWithIntent = setEnemyIntent(initialState, rng);
  const stateAfterDraw = startPlayerTurn(stateWithIntent, rng);
  stateAfterDraw.rngState = rng.getState();

  return stateAfterDraw;
};

// El jugador juega una carta, encolando y resolviendo sus efectos inmediatamente.
export const playCard = (state: CombatState, cardInstanceId: string, targetId: string): CombatState => {
    if (state.phase !== 'PLAYER_INPUT') return state;

    const player = state.combatants.find(c => c.isPlayer)!;
    const cardInstance = player.hand?.find(c => c.instanceId === cardInstanceId);
    if (!cardInstance) return state;

    const cardData = getAllCards()[cardInstance.cardId];
    if (!cardData) return state;
    
    const affix = cardInstance.affix;
    const actualCost = Math.max(0, cardData.cost + (affix?.costModifier || 0));

    if ((player.energy || 0) < actualCost) {
        return state;
    }
    
    // Block UNPLAYABLE cards
    if ((cardData.keywords || []).includes('UNPLAYABLE')) return state;

    const newState: CombatState = JSON.parse(JSON.stringify(state));
    const playerMutatable = newState.combatants.find(c => c.isPlayer)!;

    // 1. Pagar coste y loguear
    playerMutatable.energy! -= actualCost;
    let cardDisplayName = cardData.name;
    if (affix) {
        cardDisplayName += ` [${affix.name}]`;
    }
    newState.log.push(`${player.name} juega ${cardDisplayName}.`);
    newState.cardsPlayedThisTurn = (newState.cardsPlayedThisTurn || 0) + 1;
    
    // 2. Retirar la carta de la mano ANTES de comprobar efectos condicionales
    playerMutatable.hand = playerMutatable.hand!.filter(c => c.instanceId !== cardInstanceId);

    let shouldExile = (cardData.keywords || []).includes('EXHAUST');

    // 3. Generar acciones basadas en el efecto
    const actualValue = (cardData.value || 0) + (affix?.valueModifier || 0);

    // Relic + crew artillero: attack damage bonuses
    let relicDmgBonus = 0;
    if (cardData.type === 'Attack') {
        const relicCardResult = computeRelicCardDmgBonus(newState.relics, newState.relicState);
        relicDmgBonus = relicCardResult.dmgBonus;
        newState.relicState = relicCardResult.newRelicState;
        relicCardResult.logs.forEach(l => newState.log.push(l));
        const artillero = playerMutatable.crewBonuses?.artilleroBonus || 0;
        if (artillero > 0) relicDmgBonus += artillero;
    }

    switch (cardData.effectBase) {
        case 'EFFECT_DAMAGE': {
            const hitCount = cardData.hits && cardData.hits > 1 ? cardData.hits : 1;
            const hasChronometer = hitCount > 1 && (newState.relics || []).includes('REL_CHRONOMETER');
            for (let h = 0; h < hitCount; h++) {
                let hitDmg = actualValue + relicDmgBonus;
                if (hasChronometer && h === hitCount - 1) hitDmg = Math.floor(hitDmg * 1.5);
                newState.actionQueue.push(createAction('DEAL_DAMAGE', player.id, targetId, hitDmg));
            }
            break;
        }
        case 'EFFECT_FIRE_2':
            newState.actionQueue.push(createAction('GAIN_RESOURCE', player.id, player.id, actualValue || 2, { resource: 'fuego' }));
            break;
        case 'EFFECT_GAIN_MANIOBRA_2':
            newState.actionQueue.push(createAction('GAIN_RESOURCE', player.id, player.id, actualValue || 2, { resource: 'maniobra' }));
            // Condición: comprobar la mano DESPUÉS de haber retirado la carta.
            if (playerMutatable.hand!.length === 0) {
                newState.log.push(`La mano de ${player.name} está vacía. ¡Roba una carta!`);
                newState.actionQueue.push(createAction('DRAW_CARDS', player.id, player.id, 1));
            }
            break;
        case 'EFFECT_GAIN_CREDITO_1':
            newState.actionQueue.push(createAction('GAIN_RESOURCE', player.id, player.id, actualValue || 1, { resource: 'credito' }));
            break;
        case 'EFFECT_HEAL_HULL_AND_EXILE':
            newState.actionQueue.push(createAction('REPAIR_HULL', player.id, player.id, actualValue));
            shouldExile = true;
            break;
        case 'EFFECT_SHIELD':
            newState.actionQueue.push(createAction('RECHARGE_SHIELD', player.id, player.id, actualValue));
            break;
        case 'EFFECT_REPAIR':
            newState.actionQueue.push(createAction('REPAIR_HULL', player.id, player.id, actualValue));
            break;
        case 'EFFECT_ENERGY_1':
             newState.actionQueue.push(createAction('GAIN_ENERGY', player.id, player.id, actualValue || 1));
             break;
        case 'EFFECT_APPLY_BURN':
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, actualValue || 2, { status: 'BURN' }));
            break;
        case 'EFFECT_APPLY_PLASMA_LEAK':
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, actualValue || 2, { status: 'PLASMA_LEAK' }));
            break;
        case 'EFFECT_APPLY_OVERHEAT':
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, actualValue || 2, { status: 'OVERHEAT' }));
            break;
        case 'EFFECT_APPLY_HULL_BREACH':
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, actualValue || 2, { status: 'HULL_BREACH' }));
            break;
        case 'EFFECT_APPLY_EMP':
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, 1, { status: 'EMP' }));
            if ((newState.relics || []).includes('REL_EMP_CAPACITOR')) {
                newState.actionQueue.push(createAction('GAIN_RESOURCE', player.id, player.id, 1, { resource: 'fuego' }));
                newState.log.push(`⚡ Capacitor EMP: +1 Fuego.`);
            }
            break;
        case 'EFFECT_APPLY_OVERCHARGE':
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, player.id, actualValue || 2, { status: 'OVERCHARGE' }));
            break;
        case 'EFFECT_DAMAGE_AND_BURN': {
            const burnHitCount = cardData.hits && cardData.hits > 1 ? cardData.hits : 1;
            const hasBurnChronometer = burnHitCount > 1 && (newState.relics || []).includes('REL_CHRONOMETER');
            for (let h = 0; h < burnHitCount; h++) {
                let hitDmg = actualValue + relicDmgBonus;
                if (hasBurnChronometer && h === burnHitCount - 1) hitDmg = Math.floor(hitDmg * 1.5);
                newState.actionQueue.push(createAction('DEAL_DAMAGE', player.id, targetId, hitDmg));
            }
            const extraBurn = (newState.relics || []).includes('REL_PYRO_INJECTOR') ? 1 : 0;
            if (extraBurn) newState.log.push(`💥 Inyector Pirótico: +1 Incendio extra.`);
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, 2 + extraBurn, { status: 'BURN' }));
            break;
        }
        case 'EFFECT_DRAW_1':
            newState.actionQueue.push(createAction('DRAW_CARDS', player.id, player.id, 1));
            break;
        case 'EFFECT_DRAW_2':
            newState.actionQueue.push(createAction('DRAW_CARDS', player.id, player.id, 2));
            break;
        case 'EFFECT_ENERGY_GAIN':
            newState.actionQueue.push(createAction('GAIN_ENERGY', player.id, player.id, actualValue || 1));
            break;
        case 'EFFECT_REPAIR_AND_SHIELD':
            newState.actionQueue.push(createAction('REPAIR_HULL', player.id, player.id, actualValue));
            newState.actionQueue.push(createAction('RECHARGE_SHIELD', player.id, player.id, 3));
            break;
        case 'EFFECT_DAMAGE_FROM_SHIELD': {
            const shieldDmg = Math.min(playerMutatable.shield || 0, actualValue);
            if (shieldDmg > 0) {
                newState.actionQueue.push(createAction('DEAL_DAMAGE', player.id, targetId, shieldDmg + relicDmgBonus));
            } else {
                newState.log.push(`${player.name} no tiene escudo para la embestida.`);
                playerMutatable.energy! += actualCost;
            }
            break;
        }
        case 'EFFECT_HULL_BREACH_AND_DRAW':
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, actualValue || 2, { status: 'HULL_BREACH' }));
            newState.actionQueue.push(createAction('DRAW_CARDS', player.id, player.id, 1));
            break;
        case 'EFFECT_DAMAGE_AND_DOUBLE_DEBUFF':
            newState.actionQueue.push(createAction('DEAL_DAMAGE', player.id, targetId, actualValue + relicDmgBonus));
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, 2, { status: 'HULL_BREACH' }));
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, 2, { status: 'OVERHEAT' }));
            break;
        case 'EFFECT_DOUBLE_DEBUFF':
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, actualValue || 2, { status: 'HULL_BREACH' }));
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, actualValue || 2, { status: 'OVERHEAT' }));
            break;
        case 'EFFECT_APPLY_STATUS': {
            if (cardData.statusApply) {
                const statusTarget = cardData.statusApply.target === 'SELF' ? player.id : targetId;
                newState.actionQueue.push(createAction('APPLY_STATUS', player.id, statusTarget, actualValue || 1, { status: cardData.statusApply.status }));
            }
            break;
        }
        case 'EFFECT_DAMAGE_AND_PLASMA_LEAK': {
            const plHitCount = cardData.hits && cardData.hits > 1 ? cardData.hits : 1;
            const hasPlChronometer = plHitCount > 1 && (newState.relics || []).includes('REL_CHRONOMETER');
            for (let h = 0; h < plHitCount; h++) {
                let hitDmg = actualValue + relicDmgBonus;
                if (hasPlChronometer && h === plHitCount - 1) hitDmg = Math.floor(hitDmg * 1.5);
                newState.actionQueue.push(createAction('DEAL_DAMAGE', player.id, targetId, hitDmg));
            }
            newState.actionQueue.push(createAction('APPLY_STATUS', player.id, targetId, 2, { status: 'PLASMA_LEAK' }));
            break;
        }
        case 'EFFECT_DAMAGE_SYSTEM': {
            const sysTarget = cardData.systemTarget;
            if (sysTarget) {
                newState.actionQueue.push(createAction('DAMAGE_SYSTEM', player.id, targetId, actualValue + relicDmgBonus, { system: sysTarget }));
            } else {
                newState.log.push(`${cardData.name}: sin sistema objetivo definido.`);
                playerMutatable.energy! += actualCost;
            }
            break;
        }
        case 'EFFECT_DAMAGE_SYSTEM_AND_DRAW': {
            const sysTarget = cardData.systemTarget;
            if (sysTarget) {
                newState.actionQueue.push(createAction('DAMAGE_SYSTEM', player.id, targetId, actualValue + relicDmgBonus, { system: sysTarget }));
                newState.actionQueue.push(createAction('DRAW_CARDS', player.id, player.id, 1));
            } else {
                newState.log.push(`${cardData.name}: sin sistema objetivo definido.`);
                playerMutatable.energy! += actualCost;
            }
            break;
        }
        case 'EFFECT_NONE':
            // Curses and passive cards — no effect, no energy refund
            break;
        case 'CREW_BASIC': {
            if (!playerMutatable.crewBonuses) {
                playerMutatable.crewBonuses = {
                    artilleroBonus: 0, pilotoMissChance: 0, ingenieroShield: 0,
                    medicoHeal: 0, comandanteEnergy: 0, saboteadorActive: false,
                    comercianteCredits: 0, psiquicoDraw: 0,
                };
            }
            const role = cardData.subtype || '';
            switch (role) {
                case 'Artillero':
                    playerMutatable.crewBonuses.artilleroBonus += 2;
                    newState.log.push(`🎯 ${cardData.name} en estación: +2 daño en ataques.`);
                    break;
                case 'Piloto':
                    playerMutatable.crewBonuses.pilotoMissChance = Math.min(80, playerMutatable.crewBonuses.pilotoMissChance + 20);
                    newState.log.push(`🚀 ${cardData.name} en estación: 20% esquivar ataques enemigos.`);
                    break;
                case 'Ingeniero':
                    playerMutatable.crewBonuses.ingenieroShield += 3;
                    newState.log.push(`⚙️ ${cardData.name} en estación: +3 escudo al inicio de turno.`);
                    break;
                case 'Científico':
                case 'Médico':
                    playerMutatable.crewBonuses.medicoHeal += 2;
                    newState.log.push(`💊 ${cardData.name} en estación: +2 reparación al final de turno.`);
                    break;
                case 'Comandante':
                    playerMutatable.crewBonuses.comandanteEnergy += 1;
                    newState.log.push(`👑 ${cardData.name} en estación: +1 energía por turno.`);
                    break;
                case 'Saboteador':
                    playerMutatable.crewBonuses.saboteadorActive = true;
                    newState.log.push(`🔪 ${cardData.name} en estación: +1 Incendio al enemigo cada turno.`);
                    break;
                case 'Comerciante':
                    playerMutatable.crewBonuses.comercianteCredits += 15;
                    newState.log.push(`💰 ${cardData.name} en estación: +15 créditos al ganar.`);
                    break;
                case 'Psíquico':
                    playerMutatable.crewBonuses.psiquicoDraw += 1;
                    newState.log.push(`🔮 ${cardData.name} en estación: +1 carta robada por turno.`);
                    break;
                default:
                    playerMutatable.crewBonuses.ingenieroShield += 1;
                    newState.log.push(`👤 ${cardData.name} en estación: +1 escudo/turno.`);
                    break;
            }
            shouldExile = true;
            break;
        }
        default:
            console.warn(`[CombatEngine] effectBase desconocido: "${cardData.effectBase}". Energía devuelta.`);
            newState.log.push(`${cardData.name} no tiene efecto en combate.`);
            playerMutatable.energy! += actualCost;
            break;
    }

    // 4. VOID_LEDGER: every 3 cards played this turn, draw 1
    const ct = newState.cardsPlayedThisTurn || 0;
    if (ct > 0 && ct % 3 === 0 && (newState.relics || []).includes('REL_VOID_LEDGER')) {
        newState.actionQueue.push(createAction('DRAW_CARDS', player.id, player.id, 1));
        newState.log.push(`📒 Libro del Vacío: ${ct} cartas jugadas — roba 1.`);
    }

    // 5. Mover la carta jugada a la pila correspondiente
    if (shouldExile) {
        playerMutatable.exilePile!.push(cardInstance);
        newState.log.push(`${cardData.name} es exiliada.`);
        if ((newState.relics || []).includes('REL_SCAVENGER_DRONE')) {
            playerMutatable.credits = (playerMutatable.credits || 0) + 1;
            newState.log.push(`🛸 Dron Carroñero: +1 Crédito.`);
        }
    } else {
        playerMutatable.discardPile!.push(cardInstance);
    }

    // 6. Resolver las acciones de la carta jugada inmediatamente
    return resolveActionQueue(newState);
}


// Procesa el turno del enemigo basándose en su intención actual.
const processEnemyTurn = (state: CombatState, rng: SeededRNG): CombatState => {
    // Deep-clone combatants to avoid mutating the input state reference
    const newState = { ...state, combatants: JSON.parse(JSON.stringify(state.combatants)), actionQueue: [...state.actionQueue] };
    const player = newState.combatants.find(c => c.isPlayer)!;
    const enemy = newState.combatants.find(c => !c.isPlayer)!;

    if (enemy.dead || player.dead || !enemy.intent) return state;

    // EMP: enemy skips turn
    if (isStunned(enemy)) {
        newState.log.push(`${enemy.name} está bajo Pulso EMP. Pierde su turno.`);
        enemy.patternIndex = ((enemy.patternIndex || 0) + 1) % (enemy.pattern?.length || 1);
        newState.phase = 'RESOLUTION';
        return newState;
    }

    const intent = enemy.intent;

    // WEAPONS system disabled: skip attack actions
    const weaponsSystem = enemy.systems?.find(s => s.id === 'WEAPONS');
    if (weaponsSystem?.disabled && (intent.type === 'ATTACK' || intent.type === 'ATTACK_DEFEND')) {
        newState.log.push(`${enemy.name}: Armamento deshabilitado — no puede atacar este turno.`);
        enemy.patternIndex = ((enemy.patternIndex || 0) + 1) % (enemy.pattern?.length || 1);
        newState.phase = 'RESOLUTION';
        return newState;
    }

    // Piloto miss chance
    const pilotoMiss = player.crewBonuses?.pilotoMissChance || 0;
    const isMissed = pilotoMiss > 0 && (rng.next() * 100) < pilotoMiss;
    if (isMissed && (intent.type === 'ATTACK' || intent.type === 'ATTACK_DEFEND')) {
        newState.log.push(`🚀 [Piloto] ¡Maniobra evasiva! El ataque de ${enemy.name} falla.`);
        enemy.patternIndex = ((enemy.patternIndex || 0) + 1) % (enemy.pattern?.length || 1);
        newState.phase = 'RESOLUTION';
        return newState;
    }

    switch (intent.type) {
        case 'ATTACK': {
            const damage = (intent.value ?? 0) + rng.nextInt(-1, 1);
            newState.actionQueue.push(createAction('DEAL_DAMAGE', enemy.id, player.id, Math.max(0, damage)));
            break;
        }
        case 'DEFEND':
            newState.actionQueue.push(createAction('RECHARGE_SHIELD', enemy.id, enemy.id, intent.value ?? 0));
            break;
        case 'ATTACK_DEFEND': {
            const attackDamage = (intent.value ?? 0) + rng.nextInt(-1, 0);
            newState.actionQueue.push(createAction('DEAL_DAMAGE', enemy.id, player.id, Math.max(0, attackDamage)));
            newState.actionQueue.push(createAction('RECHARGE_SHIELD', enemy.id, enemy.id, intent.secondaryValue ?? 0));
            break;
        }
        case 'BUFF':
            enemy.attackBuff = (enemy.attackBuff || 0) + 3;
            newState.log.push(`${enemy.name} carga sus armas. ¡Su próximo ataque será más fuerte!`);
            break;
        case 'UNKNOWN':
        default:
            newState.log.push(`${enemy.name} no actúa este turno.`);
            break;
    }

    // Avanzar el patrón del enemigo
    enemy.patternIndex = ((enemy.patternIndex || 0) + 1) % (enemy.pattern?.length || 1);
    // Reiniciar el buff si se usó
    if(intent.type.includes('ATTACK')) {
        enemy.attackBuff = 0;
    }

    newState.phase = 'RESOLUTION';
    return newState;
};

// Procesa la cola de acciones completa y avanza al siguiente turno.
export const resolveTurn = (initialState: CombatState): CombatState => {
    const rng = new SeededRNG(initialState.rngSeed);
    rng.setState(initialState.rngState);

    // 0. BURN_CURSE: curses in hand deal damage at end of player turn
    let startState = initialState;
    const playerForCurse = startState.combatants.find(c => c.isPlayer)!;
    const curseDmg = (playerForCurse.hand || []).reduce((total, card) => {
        const cd = getAllCards()[card.cardId];
        return cd?.keywords?.includes('BURN_CURSE') ? total + 2 : total;
    }, 0);
    if (curseDmg > 0) {
        const curseCombatants = JSON.parse(JSON.stringify(startState.combatants));
        const cursePlayer = curseCombatants.find((c: Combatant) => c.isPlayer)!;
        cursePlayer.hp = Math.max(0, cursePlayer.hp - curseDmg);
        if (cursePlayer.hp <= 0) { cursePlayer.dead = true; cursePlayer.hp = 0; }
        startState = {
            ...startState, combatants: curseCombatants,
            log: [...startState.log, `💀 Maldición: ${curseDmg} de daño por cartas de maldición en mano.`],
        };
        if (cursePlayer.dead) {
            return { ...startState, phase: 'GAME_OVER', victory: false };
        }
    }

    // 1. Fase del enemigo (encolar sus acciones basadas en la intención)
    let stateWithEnemyActions = processEnemyTurn(startState, rng);

    // 2. Fase de resolución (procesar toda la cola, incluyendo acciones del enemigo)
    let resolvedState = resolveActionQueue(stateWithEnemyActions);
    
    // 3. Tick de estados al fin de turno
    if (resolvedState.phase !== 'GAME_OVER') {
        resolvedState = tickStatusesAtTurnEnd(resolvedState);
    }

    // 3.5 Tick repair countdowns for disabled ship systems
    if (resolvedState.phase !== 'GAME_OVER') {
        const sysLogs: string[] = [];
        const combatantsAfterSysTick = resolvedState.combatants.map(c => {
            if (!c.systems) return c;
            const newSystems = c.systems.map(sys => {
                if (!sys.disabled || sys.repairCountdown <= 0) return sys;
                const newCountdown = sys.repairCountdown - 1;
                if (newCountdown === 0) {
                    sysLogs.push(`🔧 ${sys.name} de ${c.name} se ha reparado parcialmente.`);
                    return { ...sys, disabled: false, repairCountdown: 0, hp: Math.floor(sys.maxHp * 0.5) };
                }
                return { ...sys, repairCountdown: newCountdown };
            });
            return { ...c, systems: newSystems };
        });
        resolvedState = { ...resolvedState, combatants: combatantsAfterSysTick, log: [...resolvedState.log, ...sysLogs] };
    }

    // 4. Relic turn-end effects (e.g. black box hand-empty check, aegis protocol)
    if (resolvedState.phase !== 'GAME_OVER') {
        const playerForRelics = resolvedState.combatants.find(c => c.isPlayer)!;
        const handIsEmpty = (playerForRelics.hand?.length || 0) === 0;
        const { newRelicState, logs, hullRepair } = computeRelicTurnEndEffects(
            resolvedState.relics, resolvedState.relicState, handIsEmpty, playerForRelics.shield
        );
        resolvedState = { ...resolvedState, relicState: newRelicState, log: [...resolvedState.log, ...logs] };
        if (hullRepair > 0) {
            const combatants = JSON.parse(JSON.stringify(resolvedState.combatants));
            const p = combatants.find((c: any) => c.isPlayer);
            if (p) p.hp = Math.min(p.maxHp, p.hp + hullRepair);
            resolvedState = { ...resolvedState, combatants };
        }
    }

    // 4.5 Crew: Médico heal at turn end
    if (resolvedState.phase !== 'GAME_OVER') {
        const playerForMedic = resolvedState.combatants.find(c => c.isPlayer)!;
        const medicoHeal = playerForMedic.crewBonuses?.medicoHeal || 0;
        if (medicoHeal > 0) {
            const combatants = JSON.parse(JSON.stringify(resolvedState.combatants));
            const p = combatants.find((c: Combatant) => c.isPlayer);
            if (p) p.hp = Math.min(p.maxHp, p.hp + medicoHeal);
            resolvedState = { ...resolvedState, combatants, log: [...resolvedState.log, `💊 [Médico] +${medicoHeal} casco reparado.`] };
        }
    }

    // 5. Fase de fin de turno (si el combate no ha terminado)
    if (resolvedState.phase !== 'GAME_OVER') {
        resolvedState.turn += 1;
        resolvedState = startPlayerTurn(resolvedState, rng);
    }

    // Guardar el nuevo estado del RNG
    resolvedState.rngState = rng.getState();
    return resolvedState;
};