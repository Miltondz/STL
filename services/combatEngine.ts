// services/combatEngine.ts
import { PlayerState, CombatState, Action, ActionType, Combatant, CardInstance, EnemyIntent } from '../types';
import { getEnemyTemplates, getAllCards } from '../data';
import { SeededRNG } from './rng';

// --- Datos del Juego ---
const ALL_CARDS = getAllCards();
const ENEMY_TEMPLATES = getEnemyTemplates();

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
    
    const source = newState.combatants.find(c => c.id === action.sourceId);
    let target = newState.combatants.find(c => c.id === action.targetId);

    if (!source || !target || (target.dead && action.type !== 'GAIN_RESOURCE')) {
        newLog = `Acción '${action.type}' de ${source?.name || '?'} a ${target?.name || '?'} ignorada (objetivo inválido).`;
        return { ...newState, log: [...newState.log, newLog]};
    }

    switch (action.type) {
        case 'DEAL_DAMAGE': {
            let damage = action.value || 0;
            newLog = `${source.name} ataca a ${target.name}.`;

            const shieldDamage = Math.min(target.shield, damage);
            if (shieldDamage > 0) {
                target.shield -= shieldDamage;
                damage -= shieldDamage;
                newLog += ` Los escudos absorben ${shieldDamage} de daño.`;
            }

            if (damage > 0) {
                target.hp -= damage;
                newLog += ` El casco recibe ${damage} de daño.`;
            }

            if (target.hp <= 0) {
                target.hp = 0;
                target.dead = true;
                newLog += ` ¡${target.name} ha sido destruido!`;
            }
            break;
        }
        case 'RECHARGE_SHIELD': {
            const amount = action.value || 0;
            target.shield = Math.min(target.maxShield, target.shield + amount);
            newLog = `${source.name} gana ${amount} de escudo.`;
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
    }
    return { ...newState, log: [...newState.log, newLog] };
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
    let newState = { ...state, combatants: JSON.parse(JSON.stringify(state.combatants)) };
    const playerMutatable = newState.combatants.find(c => c.isPlayer)!;
    
    playerMutatable.discardPile = [...playerMutatable.discardPile!, ...playerMutatable.hand!];
    playerMutatable.hand = [];
    
    playerMutatable.energy = playerMutatable.maxEnergy;
    playerMutatable.fuego = 0;
    playerMutatable.maniobra = 0;

    let drawnState = state;
    const amount = 5;
    if (playerMutatable.isPlayer) {
        for (let i = 0; i < amount; i++) {
            if (playerMutatable.drawPile!.length === 0) {
                if (playerMutatable.discardPile!.length === 0) {
                    break; 
                }
                drawnState.log.push(`${playerMutatable.name} baraja su pila de descarte.`);
                playerMutatable.drawPile = shuffleArray(playerMutatable.discardPile!, rng);
                playerMutatable.discardPile = [];
            }
            const card = playerMutatable.drawPile!.pop();
            if (card) {
                playerMutatable.hand!.push(card);
            }
        }
    }

    newState.log.push(`--- Comienza el Turno ${newState.turn}. Robas 5 cartas. ---`);
    newState.phase = 'PLAYER_INPUT';

    // Establece la intención del enemigo para el próximo turno.
    return setEnemyIntent(newState, rng);
}

// --- Creación y Flujo del Combate ---

export const createCombat = (playerState: PlayerState, enemyId: string, seed: number): CombatState => {
  const enemyTemplate = ENEMY_TEMPLATES[enemyId];
  if (!enemyTemplate) throw new Error(`Enemigo con id "${enemyId}" no encontrado.`);

  const rng = new SeededRNG(seed);

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
    energy: 3,
    maxEnergy: 3,
    fuego: 0,
    maniobra: 0,
    credits: 0,
    hand: [],
    drawPile: shuffleArray(playerState.deck, rng),
    discardPile: [],
    exilePile: [],
  };

  const enemy: Combatant = {
    ...enemyTemplate,
    isPlayer: false,
    hp: enemyTemplate.maxHp,
    shield: enemyTemplate.maxShield,
    dead: false,
    attackBuff: 0,
  };
  
  let initialState: CombatState = {
    turn: 1,
    phase: 'PLAYER_INPUT',
    rngSeed: seed,
    rngState: rng.getState(),
    combatants: [player, enemy],
    actionQueue: [],
    log: [`Comienza el combate contra ${enemy.name}!`],
  };

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

    const cardData = ALL_CARDS[cardInstance.cardId];
    if (!cardData) return state;
    
    const affix = cardInstance.affix;
    const actualCost = Math.max(0, cardData.cost + (affix?.costModifier || 0));

    if ((player.energy || 0) < actualCost) {
        return state;
    }
    
    const newState: CombatState = JSON.parse(JSON.stringify(state));
    const playerMutatable = newState.combatants.find(c => c.isPlayer)!;
    
    // 1. Pagar coste y loguear
    playerMutatable.energy! -= actualCost;
    let cardDisplayName = cardData.name;
    if (affix) {
        cardDisplayName += ` [${affix.name}]`;
    }
    newState.log.push(`${player.name} juega ${cardDisplayName}.`);
    
    // 2. Retirar la carta de la mano ANTES de comprobar efectos condicionales
    playerMutatable.hand = playerMutatable.hand!.filter(c => c.instanceId !== cardInstanceId);

    let shouldExile = false;

    // 3. Generar acciones basadas en el efecto
    const actualValue = (cardData.value || 0) + (affix?.valueModifier || 0);

    switch (cardData.effectBase) {
        case 'EFFECT_DAMAGE':
            newState.actionQueue.push(createAction('DEAL_DAMAGE', player.id, targetId, actualValue));
            break;
        case 'EFFECT_FIRE_2':
            newState.actionQueue.push(createAction('GAIN_RESOURCE', player.id, player.id, 2, { resource: 'fuego' }));
            break;
        case 'EFFECT_GAIN_MANIOBRA_2':
            newState.actionQueue.push(createAction('GAIN_RESOURCE', player.id, player.id, 2, { resource: 'maniobra' }));
            // Condición: comprobar la mano DESPUÉS de haber retirado la carta.
            if (playerMutatable.hand!.length === 0) {
                newState.log.push(`La mano de ${player.name} está vacía. ¡Roba una carta!`);
                newState.actionQueue.push(createAction('DRAW_CARDS', player.id, player.id, 1));
            }
            break;
        case 'EFFECT_GAIN_CREDITO_1':
            newState.actionQueue.push(createAction('GAIN_RESOURCE', player.id, player.id, 1, { resource: 'credito' }));
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
             newState.actionQueue.push(createAction('GAIN_ENERGY', player.id, player.id, 1));
             break;
        case 'CREW_BASIC':
            newState.log.push(`El ${cardData.name} es tripulación y no tiene efecto en combate.`);
            // Devuelve la energía gastada, ya que no hace nada.
            playerMutatable.energy! += actualCost; 
            break;
    }

    // 4. Mover la carta jugada a la pila correspondiente
    if (shouldExile) {
        playerMutatable.exilePile!.push(cardInstance);
        newState.log.push(`${cardData.name} es exiliada.`);
    } else {
        playerMutatable.discardPile!.push(cardInstance);
    }

    // 5. Resolver las acciones de la carta jugada inmediatamente
    return resolveActionQueue(newState);
}


// Procesa el turno del enemigo basándose en su intención actual.
const processEnemyTurn = (state: CombatState, rng: SeededRNG): CombatState => {
    let newState = { ...state, actionQueue: [...state.actionQueue] };
    const player = state.combatants.find(c => c.isPlayer)!;
    const enemy = state.combatants.find(c => !c.isPlayer)!;

    if (enemy.dead || player.dead || !enemy.intent) return state;
    
    const intent = enemy.intent;

    switch (intent.type) {
        case 'ATTACK':
            const damage = intent.value! + rng.nextInt(-1, 1);
            newState.actionQueue.push(createAction('DEAL_DAMAGE', enemy.id, player.id, damage));
            break;
        case 'DEFEND':
            newState.actionQueue.push(createAction('RECHARGE_SHIELD', enemy.id, enemy.id, intent.value!));
            break;
        case 'ATTACK_DEFEND':
            const attackDamage = intent.value! + rng.nextInt(-1, 0);
            newState.actionQueue.push(createAction('DEAL_DAMAGE', enemy.id, player.id, attackDamage));
            newState.actionQueue.push(createAction('RECHARGE_SHIELD', enemy.id, enemy.id, intent.secondaryValue!));
            break;
        case 'BUFF':
            enemy.attackBuff = (enemy.attackBuff || 0) + 3;
            newState.log.push(`${enemy.name} carga sus armas. ¡Su próximo ataque será más fuerte!`);
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

    // 1. Fase del enemigo (encolar sus acciones basadas en la intención)
    let stateWithEnemyActions = processEnemyTurn(initialState, rng);

    // 2. Fase de resolución (procesar toda la cola, incluyendo acciones del enemigo)
    let resolvedState = resolveActionQueue(stateWithEnemyActions);
    
    // 3. Fase de fin de turno (si el combate no ha terminado)
    if (resolvedState.phase !== 'GAME_OVER') {
        resolvedState.turn += 1;
        resolvedState = startPlayerTurn(resolvedState, rng);
    }

    // Guardar el nuevo estado del RNG
    resolvedState.rngState = rng.getState();
    return resolvedState;
};