# Navegador Galáctico — Plan de Expansión: FTL × Slay the Spire

> Hoja de ruta de implementación para añadir Efectos de Estado, Relics, Sistemas de Nave, Estructura de Sectores/Boss, Roles de Tripulación y Mecánicas Extendidas de Cartas.
>
> **Audiencia:** Implementador (Sonnet). Todas las rutas son absolutas. Referencias de línea precisas a fecha 2026-05-28.
>
> **Stack:** React 19 + TS + Vite + Tailwind. Máquina de estados en `contexts/GameContext.tsx`. Acciones en `hooks/useGameHandlers.ts`. Lógica pura en `services/`. Tipos en `types.ts`. Contenido runtime en `public/data/content.json` validado por `services/validationSchemas.ts`.

---

## 0. Matriz Prioridad × Impacto

| # | Feature | Prioridad | Complejidad | Impacto gameplay | Riesgo | Orden |
|---|---|---|---|---|---|---|
| B | Status Effects | Crítica | M | Alto | Bajo | 1 |
| A | Relics System | Crítica | M | Muy Alto | Bajo | 2 |
| F | Extended Card Mechanics | Alta | M | Alto | Bajo | 3 |
| D | Sector Structure + Boss | Alta | L | Alto | Medio | 4 |
| C | Ship Systems (Combat Layer) | Alta | L | Alto | Medio | 5 |
| E | Crew Combat Roles | Media | M | Medio | Bajo | 6 |

**Rationale del orden:**
- B antes de A: muchos relics referencian estados (e.g., "+1 Burn on play"). Implementar relics primero crea retrabajo.
- F antes de D: las mecánicas extendidas de cartas (Exhaust, Retain, Innate) se conectan directamente al switch de `playCard` en `services/combatEngine.ts:317-356`. Agregarlas antes permite diseñar el boss con vocabulario de combate más rico.
- C después de D: los sistemas de nave son más impactantes cuando los bosses los explotan. El boss REACTOR (win alternativo) requiere que el sistema exista.

**Estimado total: ~23 días de desarrollo.**

---

## A. SISTEMA DE RELICS

El mayor diferenciador de run de Slay the Spire. Ítems pasivos persistentes que mutan las reglas.

### A.1 Estado actual
- **No existe nada.** Sin tipo relic, sin inventario, sin hooks para modificadores pasivos.
- Análogos más cercanos: `ShipData.trait` (descriptor narrativo fijo, nunca leído por el engine) y `PlayerState.bonusEnergy` (modificador numérico único, `types.ts:110`).
- `PlayerState.narrativeFlags` (`types.ts:105`) podría hospedar IDs de relics pero carece de hooks estructurados.

### A.2 Gap analysis
Falta:
1. Tipo `RelicData` y catálogo `ALL_RELICS`.
2. `PlayerState.relics: string[]` + `relicState`.
3. Sistema trigger/hook: relics se disparan en eventos (inicio combate, carta jugada, daño recibido, nodo visitado, tienda, etc.).
4. UI: bandeja de relics en HUD + tooltip; pantalla de recompensa de relic.
5. Fuentes: recompensa de boss, recompensa de elite, tienda, opción de evento, sector completado.

### A.3 Implementación

#### Tipos (añadir a `types.ts`)

```ts
export type RelicTrigger =
  | 'COMBAT_START'
  | 'TURN_START'
  | 'TURN_END'
  | 'CARD_PLAYED'
  | 'CARD_PLAYED_ATTACK'
  | 'CARD_PLAYED_SKILL'
  | 'DAMAGE_TAKEN_HULL'
  | 'DAMAGE_DEALT'
  | 'SYSTEM_DESTROYED'      // nuevo — integración con Ship Systems
  | 'COMBAT_END_VICTORY'
  | 'NODE_ENTERED'
  | 'SHOP_ENTERED'
  | 'REST_USED'
  | 'PASSIVE';

export type RelicRarity = 'Common' | 'Uncommon' | 'Rare' | 'Boss' | 'Event';

export interface RelicData {
  id: string;
  name: string;
  rarity: RelicRarity;
  description: string;
  flavorText?: string;
  image?: string;
  trigger: RelicTrigger;
  effect: {
    kind: string;
    value?: number;
    meta?: Record<string, any>;
  };
  oneShot?: boolean;
}
```

Adición a `PlayerState`:
```ts
relics: string[];
relicState: { [relicId: string]: { charges?: number; used?: boolean } };
```

#### Nuevo servicio: `services/relicEngine.ts`

```ts
export const applyRelicsOnCombatStart(state: CombatState, playerState: PlayerState): CombatState
export const applyRelicsOnTurnStart(state: CombatState, playerState: PlayerState): CombatState
export const applyRelicsOnCardPlayed(state: CombatState, playerState: PlayerState, cardData: CardData): CombatState
export const applyRelicsOnDamageTaken(state: CombatState, playerState: PlayerState, dmg: number): { state: CombatState; dmgModifier: number }
export const applyRelicsOnSystemDestroyed(state: CombatState, playerState: PlayerState): CombatState
export const applyRelicsOnNodeEntered(playerState: PlayerState, node: Node): PlayerState
export const getRelicModifier(playerState: PlayerState, kind: string): number
```

#### Puntos de integración en el engine
- `services/combatEngine.ts:227` `createCombat` → `applyRelicsOnCombatStart`.
- `services/combatEngine.ts:195` `startPlayerTurn` → `applyRelicsOnTurnStart`.
- `services/combatEngine.ts:281` `playCard` → `applyRelicsOnCardPlayed`.
- `services/combatEngine.ts:41` `DEAL_DAMAGE` targeting player → `applyRelicsOnDamageTaken` (permite reducción de daño).
- Nueva acción `DISABLE_SYSTEM` (ver Section C) → `applyRelicsOnSystemDestroyed`.
- `hooks/useGameHandlers.ts:117` `handleNodeSelect` → `applyRelicsOnNodeEntered`.

#### Migración de save
v1 → v2. `services/saveManager.ts:4` sube a `SAVE_VERSION = 2`. Si carga v1, inyectar `relics: []` y `relicState: {}`.

### A.4 Catálogo de relics (12)

| ID | Nombre | Rareza | Trigger | Efecto |
|---|---|---|---|---|
| `REL_NUCLEAR_BATTERY` | Batería Nuclear | Common | TURN_START | +1 max Energy este combate |
| `REL_PILOT_REFLEXES` | Reflejos de Piloto | Common | COMBAT_START | Empieza combate con 4 Shield |
| `REL_AMMO_OVERLOAD` | Sobrecarga de Munición | Uncommon | CARD_PLAYED_ATTACK | Primer Attack cada turno +2 dmg |
| `REL_BLACK_BOX` | Caja Negra | Uncommon | TURN_END | Si mano vacía al fin de turno, robar 1 próximo turno |
| `REL_QUANTUM_ENGINE` | Motor Cuántico | Rare | NODE_ENTERED | Primer nodo por layer cuesta 0 combustible |
| `REL_COMBAT_STIMS` | Estimulantes de Combate | Rare | DAMAGE_TAKEN_HULL | Primer daño de casco por combate reducido en 3 |
| `REL_PIRATE_FLAG` | Bandera Pirata | Rare | COMBAT_END_VICTORY | +3 créditos por batalla ganada |
| `REL_ION_CAPACITOR` | Capacitor de Iones | Rare | PASSIVE | Daño de BURN aplicado por jugador × 2 |
| `REL_EMP_CAPACITOR` | Capacitor EMP | Rare | SYSTEM_DESTROYED | Al destruir sistema enemigo, ganar 1 Fuego |
| `REL_HEGEMONY_RELIC` | Reliquia de la Hegemonía | Boss | COMBAT_START | +1 robo de carta en turno 1 |
| `REL_PHANTOM_DRIVE` | Motor Fantasma | Boss | PASSIVE | Una vez por combate, redirige 50% daño de casco a escudos |
| `REL_SMUGGLER_CONTACT` | Contacto Contrabandista | Event | SHOP_ENTERED | Una carta aleatoria en tienda es gratis (one-shot) |

### A.5 Prioridad + complejidad
- **Prioridad: Crítica**
- **Complejidad: M** (4 días: tipos+catálogo, engine, hooks, UI tray)

---

## B. EFECTOS DE ESTADO

La profundidad de combate de StS viene de buffs/debuffs apilables. El combate actual tiene concepto cero de estado — solo el entero plano `attackBuff`.

### B.1 Estado actual
- `Combatant.attackBuff` (`types.ts:149`) — entero único consumido por el intent BUFF del enemigo.
- `services/combatEngine.ts:399` lo incrementa en 3.
- Sin sistema de vulnerabilidades, DoT, debilitamiento, etc.

### B.2 Gap analysis
Falta:
1. Tipo `StatusEffect` y array `Combatant.statuses`.
2. Reglas de aplicación (stackeo vs override, decaimiento por turno, inmunidad).
3. Hooks en `resolveAction` para modificadores de daño (Vulnerable = +50% daño recibido, Weak = -25% daño infligido).
4. Hooks en `resolveTurn` para efectos tick (Burn inflige X al fin de turno).
5. Los estados pueden aplicarse tanto al combatiente completo **como a sistemas específicos** (ver Section C: `targetSystem?` field).
6. UI: iconos de estado sobre combatientes.
7. Cartas que los aplican.

### B.3 Implementación

#### Tipos (añadir a `types.ts`)

```ts
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
  stacks: number;
  duration?: number;
  targetSystem?: ShipSystemId;  // si está definido, afecta solo ese sistema
}

export interface StatusEffectDef {
  id: StatusEffectId;
  name: string;
  icon: string;
  description: (stacks: number) => string;
  isDebuff: boolean;
  stackBehavior: StatusStackBehavior;
  tickPhase?: 'TURN_END' | 'TURN_START' | 'NONE';
}
```

Adición a `Combatant` (`types.ts:123`):
```ts
statuses?: StatusEffect[];
```

Nuevos `ActionType` (`types.ts:154`):
```ts
| 'APPLY_STATUS'
| 'REMOVE_STATUS'
| 'TICK_STATUS'
```

Meta actualizado:
```ts
meta?: {
  resource?: 'fuego' | 'maniobra' | 'credito';
  status?: StatusEffectId;
  stacks?: number;
  targetSystem?: ShipSystemId;
  [key: string]: any;
};
```

#### Nuevo servicio: `services/statusEngine.ts`

```ts
export const STATUS_DEFS: Record<StatusEffectId, StatusEffectDef>
export const applyStatus(target: Combatant, id: StatusEffectId, stacks: number, targetSystem?: ShipSystemId): Combatant
export const tickStatusesAtTurnEnd(state: CombatState): CombatState
export const tickStatusesAtTurnStart(state: CombatState): CombatState
export const computeOutgoingDamage(source: Combatant, target: Combatant, baseDmg: number): number
export const computeIncomingShield(target: Combatant, baseShield: number): number
```

#### Integración con combatEngine
- `resolveAction` DEAL_DAMAGE (`combatEngine.ts:41-63`): envolver `damage` con `computeOutgoingDamage(source, target, damage)`. Aplica OVERHEAT + HULL_BREACH.
- `resolveAction` RECHARGE_SHIELD (`combatEngine.ts:64-69`): envolver `amount` con `computeIncomingShield(target, amount)` para aplicar JAMMED.
- Nueva case `APPLY_STATUS`: inserta en `target.statuses` respetando `STATUS_DEFS[id].stackBehavior`.
- `resolveTurn` (`combatEngine.ts:420`): entre fase enemigo y `startPlayerTurn`, llamar `tickStatusesAtTurnEnd(state)`.
- `startPlayerTurn` (`combatEngine.ts:195`): llamar `tickStatusesAtTurnStart(state)`.
- `playCard` (`combatEngine.ts:317-356`): nuevos `effectBase`:
  - `EFFECT_APPLY_BURN`, `EFFECT_APPLY_OVERHEAT`, `EFFECT_APPLY_HULL_BREACH`, `EFFECT_APPLY_EMP`.

### B.4 Catálogo de efectos (8)

| ID | Nombre | Tipo | Efecto | Stack |
|---|---|---|---|---|
| `BURN` | Incendio | Debuff DoT | Daño = stacks al fin de turno; stacks se reducen a la mitad por tick | STACK |
| `PLASMA_LEAK` | Fuga de Plasma | Debuff DoT | Daño = stacks al fin de turno; stacks -= 1 por tick | STACK |
| `OVERHEAT` | Sobrecalentamiento | Debuff | Daño infligido × 0.75 por N turnos | REFRESH_DURATION |
| `HULL_BREACH` | Brecha en Casco | Debuff | Daño recibido × 1.5 por N turnos | REFRESH_DURATION |
| `JAMMED` | Interferencia | Debuff | Escudo ganado × 0.75 por N turnos | REFRESH_DURATION |
| `EMP` | Pulso EMP | Debuff | Salta próximo turno + sistemas se reparan a mitad de velocidad | MAX |
| `OVERCHARGE` | Sobrecarga | Buff | +stacks a todo daño infligido (persistente) | STACK |
| `STEALTH` | Sigilo | Buff | Todos los hits entrantes reducidos a 1 dmg por N turnos | REFRESH_DURATION |

### B.5 Prioridad + complejidad
- **Prioridad: Crítica** (prerequisito de Section A relic #8 y cartas extendidas F)
- **Complejidad: M** (3 días: tipos+defs, integración engine, UI badges)

---

## C. SHIP SYSTEMS — CAPA TÁCTICA DE COMBATE

### C.0 La propuesta refinada en 90 palabras

Cada nave tiene 4 sistemas (WEAPONS / SHIELDS / ENGINES / CREW) con HP propio visualizados como anillos SVG sobre el portrait. Las cartas System-Strike (~15% del deck) apuntan sistemas específicos para desactivarlos tácticamente. Desactivar WEAPONS durante un intent de ATTACK **interrumpe ese ataque** — el momento FTL definitorio. Los sistemas del jugador se usan como power allocation al inicio de combate. Bosses tienen un 5to sistema REACTOR como condición de victoria alternativa. Status effects (BURN, EMP) pueden apuntar sistemas individuales. Las crew cards se asignan a sistemas del jugador para habilidades triggeradas.

### C.1 Estado actual
- `ShipData` (`types.ts:65-84`): stats planos fijos. Sin subsistemas.
- `ShipData.trait`: descriptor narrativo estático, ningún engine lo lee.
- Enemigos: un `baseDamage`, un pool de escudo, un array de pattern strings. Sin partes diferenciadas.
- `Combatant.fuego` y `Combatant.maniobra`: recursos que se resetean por turno, actualmente subutilizados — slot natural para system power sin nuevo estado.

### C.2 Gap analysis
Falta:
1. `ShipSystem` type con ID, HP propio, estado disabled + repair countdown.
2. `Combatant.systems?: ShipSystem[]` — aplica a jugador Y enemigos.
3. Power allocation en jugador: 3 puntos distribuibles entre sistemas al iniciar combate.
4. Cartas System-Strike con targeting overlay UX.
5. Pre-emption mechanic al desactivar WEAPONS durante intent ATTACK.
6. Boss REACTOR como condición de victoria alternativa.
7. UI: pips SVG sobre portrait + targeting overlay + badges de countdown.

### C.3 Implementación

#### Tipos (añadir a `types.ts`)

```ts
export type ShipSystemId = 'WEAPONS' | 'SHIELDS' | 'ENGINES' | 'CREW' | 'REACTOR';

export interface ShipSystem {
  id: ShipSystemId;
  hp: number;
  maxHp: number;
  disabled: boolean;
  repairCountdown: number;    // turnos para auto-reparación (0 = no se repara solo)
  repairPriority: number;     // cuántos turnos de base tarda en repararse este tipo de enemigo
}

export type ShipSystemDef = {
  id: ShipSystemId;
  name: string;
  icon: string;              // glyph para el pip
  color: string;             // color del anillo SVG
  disabledEffect: string;    // descripción del efecto al desactivarlo
};
```

Adición a `Combatant` (`types.ts:123`):
```ts
systems?: ShipSystem[];
powerAllocation?: { [id in ShipSystemId]?: number };  // solo jugador
```

Nuevos `ActionType`:
```ts
| 'DAMAGE_SYSTEM'
| 'DISABLE_SYSTEM'
| 'REPAIR_SYSTEM'
```

Meta actualizado:
```ts
meta?: {
  ...existing,
  systemId?: ShipSystemId;
};
```

#### Definiciones de sistemas de enemigo

```ts
// data/shipSystems.ts
export const SYSTEM_DEFS: Record<ShipSystemId, ShipSystemDef> = {
  WEAPONS: { id: 'WEAPONS', name: 'Armamento',  icon: '⚔',  color: '#ef4444', disabledEffect: 'No puede atacar' },
  SHIELDS: { id: 'SHIELDS', name: 'Escudos',    icon: '🛡',  color: '#06b6d4', disabledEffect: 'Sin recarga de escudo' },
  ENGINES: { id: 'ENGINES', name: 'Motores',    icon: '⚙',  color: '#eab308', disabledEffect: '+50% daño recibido, no puede DEFEND' },
  CREW:    { id: 'CREW',    name: 'Tripulación', icon: '👥', color: '#22c55e', disabledEffect: 'Sin reparaciones de sistemas, habilidades de crew desactivadas' },
  REACTOR: { id: 'REACTOR', name: 'Reactor',    icon: '☢',  color: '#a855f7', disabledEffect: 'DERROTA INMEDIATA del enemigo (solo boss)' },
};
```

#### HP de sistemas por tier enemigo

| Tier | WEAPONS | SHIELDS | ENGINES | CREW | repairPriority |
|---|---|---|---|---|---|
| Común (Pirata) | 6 | 6 | — | — | 2 turnos |
| Pesado (Drone) | 8 | 6 | 6 | — | 3 turnos (sin crew) |
| Elite (Corveta) | 12 | 10 | 8 | 8 | 2 turnos |
| Boss | 15 | 15 | 12 | 12 | 2 turnos |
| Boss REACTOR | — | — | — | — | 18 HP, no se repara |

#### Efectos al desactivar sistemas

| Sistema | Efecto | Duración |
|---|---|---|
| WEAPONS | Enemy skips ATTACK pattern steps. Intent shows "X". | Hasta repair |
| SHIELDS | No recharge shield each turn. | Hasta repair |
| ENGINES | +50% incoming damage. Enemy cannot use DEFEND pattern. | Hasta repair |
| CREW | No system repairs. Crew-triggered abilities disabled. | Hasta repair |
| REACTOR | Enemy muere inmediatamente (solo boss). | Permanente |

#### Power allocation del jugador

Al crear combate (`createCombat`), el jugador distribuye 3 power points entre sus sistemas activos. Cada punto da:

| Sistema | Bonus por punto |
|---|---|
| WEAPONS | +1 dmg a todos los ataques |
| SHIELDS | +2 max shield este combate |
| ENGINES | +5% chance de esquivar ataque enemigo |
| SENSORS | Revela +1 intent futuro (extiende UpcomingIntents) |
| MEDBAY | +1 HP por turno al fin de turno |

La carta `Reroute Power` (1 energía): redistribuye 1 punto de power entre dos sistemas mid-combat.

#### Pre-emption mechanic (el momento FTL)

En `processEnemyTurn` (`combatEngine.ts:383`), antes del `switch(intent.type)`:

```ts
const weaponsSystem = enemy.systems?.find(s => s.id === 'WEAPONS');
if (weaponsSystem?.disabled && intent.type === 'ATTACK') {
  newState.log.push('¡ATAQUE INTERRUMPIDO! — Sistema de Armamento destruido.');
  newState.preemptionOccurred = true;  // flag para VFX en UI
  enemy.patternIndex = ((enemy.patternIndex || 0) + 1) % (enemy.pattern?.length || 1);
  return newState;  // turno saltado completamente
}
```

En el UI (`CombatInterface.tsx`): cuando `combatState.preemptionOccurred`, mostrar overlay "⚡ ¡ATAQUE INTERRUMPIDO!" en rojo grande por 800ms.

#### UI: pips sobre el portrait del enemigo

```
Posición de los pips (overlay sobre portrait w-52):

     [⚔ WEAPONS]
          ↑
[⚙ ENG] ←🖼→ [🛡 SHIELDS]
          ↓
     [👥 CREW]

Cada pip = div absolutamente posicionado + SVG circle ring
```

```tsx
// Estructura del pip (pseudo-JSX)
<div className="absolute" style={{ top: '8px', left: '50%', transform: 'translateX(-50%)' }}>
  <svg width="32" height="32" viewBox="0 0 32 32">
    {/* Ring fondo */}
    <circle cx="16" cy="16" r="13" fill="none" stroke="#374151" strokeWidth="3"/>
    {/* Ring HP — stroke-dasharray animado */}
    <circle cx="16" cy="16" r="13" fill="none"
      stroke={system.disabled ? '#6b7280' : SYSTEM_DEFS[system.id].color}
      strokeWidth="3"
      strokeDasharray={`${(system.hp / system.maxHp) * 81.7} 81.7`}
      transform="rotate(-90 16 16)"
      className="transition-all duration-300"
    />
    {/* Glyph */}
    <text x="16" y="20" textAnchor="middle" fontSize="12"
      opacity={system.disabled ? 0.4 : 1}>
      {SYSTEM_DEFS[system.id].icon}
    </text>
  </svg>
  {/* Repair countdown badge */}
  {system.disabled && system.repairCountdown > 0 && (
    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 rounded-full
                    text-xs text-gray-300 flex items-center justify-center border border-gray-600">
      {system.repairCountdown}
    </div>
  )}
</div>
```

#### Visual: estado dañado del portrait

Cuando 2+ sistemas desactivados, el portrait enemigo muestra overlay CSS:
```tsx
{disabledCount >= 2 && (
  <div className="absolute inset-0 pointer-events-none"
    style={{
      background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(239,68,68,0.06) 8px, rgba(239,68,68,0.06) 9px)',
      animation: 'flicker 1.5s infinite'
    }}
  />
)}
```

#### Targeting overlay UX

Al jugar una System-Strike card en modo PLAYER_INPUT:

1. La carta sube al centro (posición `playedCard` existente).
2. Dim overlay `bg-black/60` cubre todo EXCEPTO el panel enemigo.
3. Los 4 pips del enemigo se agrandan 2x (`scale-125`), `cursor-pointer`, glow animado.
4. Tooltip en hover: nombre del sistema + efecto al desactivar + HP restante.
5. Click en pip → resuelve la carta contra ese sistema.
6. Click fuera del panel / Escape → cancela (carta vuelve a la mano, energía devuelta).

```ts
// Estado en CombatInterface
const [pendingSystemTarget, setPendingSystemTarget] = useState<CardInstance | null>(null);
```

#### Cartas System-Strike (mínimo inicial, 4 cartas)

| ID | Nombre | Costo | Efecto | Keywords |
|---|---|---|---|---|
| `ATTACK_SYSTEM_STRIKE` | Golpe de Sistema | 1 | 4 dmg a sistema elegido | — |
| `SKILL_TARGETED_EMP` | EMP Dirigido | 2 | Desactiva sistema elegido 3 turnos | EXHAUST |
| `ATTACK_BURN_CIRCUIT` | Circuito Quemado | 1 | 2 dmg al sistema + aplica 2 BURN al sistema | — |
| `SKILL_OVERLOAD_AOE` | Sobrecarga Total | 3 | 3 dmg a TODOS los sistemas | EXHAUST |

Todas usan `subtype: 'SystemStrike'` → frame dashed magenta en `Card.tsx`.

#### Sistemas del jugador targetables (elite/boss)

En elite fights: el enemigo puede usar `DAMAGE_SYSTEM` action contra sistemas del jugador. Los sistemas del jugador se muestran en el panel izquierdo, mirror del enemigo. Crew asignada a un sistema puede triggear habilidades defensivas (ver Section E).

#### Integración con Status Effects (Section B)

- `BURN` con `targetSystem: 'WEAPONS'`: el sistema toma `stacks` dmg por turno hasta llegar a 0.
- `EMP` global: `repairCountdown` de todos los sistemas desactivados += 2 turnos.
- `OVERCHARGE` del jugador: aplica bonus de WEAPONS system adicionalmente.

#### Boss REACTOR — condición de victoria alternativa

El REACTOR solo existe en bosses. Al llegar a 0 HP:
```ts
// combatEngine.ts resolveActionQueue — después de resolver acciones
if (reactor && reactor.disabled) {
  resolvedState.phase = 'GAME_OVER';
  resolvedState.victory = true;
  resolvedState.log.push('¡REACTOR CRÍTICO! La nave enemiga explota.');
}
```

VFX: portrait del boss parpadea 3 veces rojo → `ParticleBurst` de alta intensidad → pantalla de victoria.

#### Migración de save
v2 → v3. Agregar `systems: undefined` a combatientes. `powerAllocation: {}` a playerState.

### C.4 Integración con otras secciones

**Con Relics (A):**
- `REL_EMP_CAPACITOR`: al destruir sistema → +1 Fuego
- `REL_TARGETING_COMPUTER`: primera System-Strike por combate cuesta 0 energía
- `REL_AUTO_REPAIR`: al inicio de combate, todos los sistemas del jugador tienen +2 HP
- `REL_SHIP_OF_THESEUS`: sistema del jugador destruido → robar 2 cartas

**Con Status Effects (B):**
- BURN puede aplicarse a sistemas individuales vía `targetSystem` field
- EMP como status = sistemas se reparan a mitad de velocidad

**Con Crew (E):**
- Crew asignada al sistema WEAPONS: cuando WEAPONS toma daño, +3 dmg al atacante
- Crew asignada a ENGINES: cuando ENGINES desactivado, reparar 5 HP inmediatamente
- Esta integración es literalmente FTL crew assignment traducido a deckbuilding

### C.5 Números de balance (first-pass)

- System-Strike base dmg: 3-5 (menor que ataque al HP — se paga por el debuff)
- Distribución de System-Strike en deck: máx 15-20%
- Power points del jugador: 3 base (= starting energy — simétrico e intuitivo)
- Coste de System-Strike cards: 1 Energía + consume 1 Fuego (limita spam de targeting)

### C.6 Prioridad + complejidad
- **Prioridad: Alta**
- **Complejidad: L** (6 días: tipos+defs, pips UI, targeting overlay, cards, engine integration, balance pass)

---

## D. ESTRUCTURA DE SECTORES + BOSS

FTL tiene 8 sectores con saltos; StS tiene 3 Actos terminando en boss único. Actualmente hay un solo mapa que termina en `MINIBOSS_CORVETTE` placeholder.

### D.1 Estado actual
- `mapGenerator.ts` produce UN mapa de 15 capas (`NUM_LAYERS = 15`, línea 6).
- `NodeType.END` existe (`types.ts:12`) pero `eventManager.ts:98-100` lo resuelve a `MINIBOSS_CORVETTE` — mismo enemigo que mini-bosses.
- `MINIBOSS_CORVETTE` reutilizado para `MINI_BOSS` (línea 95) Y `END` (línea 100). Sin boss real.
- `PlayerState` sin concepto de "sector completado".
- Sin distinción elite/boss en enemy templates.
- Comentario en `mapGenerator.ts:21` llama "elite" a `NodeType.HAZARD`, pero el engine lo resuelve como event card. Concepto a medias.

### D.2 Gap analysis
Falta:
1. `PlayerState.sector: number`.
2. Transición fin-de-sector: reemplazar SIMULATION_RESULT genérico con pantalla sector-complete + generación de nuevo mapa.
3. Enemigos boss únicos por sector con mecánicas temáticas + sistemas Ship Systems.
4. Tier elite — `NodeType.ELITE` real (actualmente HAZARD hace de elite pero resuelve como evento).
5. Escalado de dificultad por sector.
6. `NodeType.REST` para el loop de gestión de recursos FTL/StS.

### D.3 Implementación

#### Tipos (extender `types.ts`)

```ts
export enum NodeType {
  ...existing,
  ELITE = 'ELITE',       // reemplaza HAZARD-as-elite
  REST = 'REST',         // nodo de descanso — sanar o mejorar carta
  BOSS = 'BOSS',         // distinto de END
}

// PlayerState
sector: number;
sectorSeed: number;
sectorsCleared: string[];  // IDs de bosses derrotados para unlock de relics
```

Extensión de `Combatant` para multi-fase:
```ts
phase?: number;
maxPhases?: number;
onPhaseTransition?: 'HEAL_50PCT' | 'APPLY_BUFF' | 'ENABLE_REACTOR';
```

#### Cambios en `mapGenerator.ts`
- Aceptar parámetro `sector: number`; variar pool de enemigos y densidad de nodos por sector.
- Nodo final → `BOSS` en lugar de `END`.
- Agregar 1-2 nodos `ELITE` garantizados por mapa (pull de enemigos MINIBOSS).
- Liberar `HAZARD` para eventos ambientales puros (campo de asteroides, señal de auxilio).

#### Cambios en `eventManager.ts`
```ts
case NodeType.ELITE:
  // Enemigo elite aleatorio + drop garantizado de relic al ganar
case NodeType.BOSS:
  // Boss por sector: sector 1 → BOSS_HEGEMONY_DESTROYER, etc.
case NodeType.REST:
  // Prompt: sanar 30% casco O mejorar una carta (FTL/StS hybrid)
```

Escalado por sector:
```ts
const scaleEnemyForSector = (template: Combatant, sector: number): Combatant => ({
  ...template,
  maxHp: Math.floor(template.maxHp * (1 + (sector - 1) * 0.3)),
  baseDamage: Math.floor((template.baseDamage || 0) * (1 + (sector - 1) * 0.2)),
  systems: template.systems?.map(s => ({
    ...s,
    maxHp: Math.floor(s.maxHp * (1 + (sector - 1) * 0.2)),
    hp: Math.floor(s.maxHp * (1 + (sector - 1) * 0.2)),
  })),
});
```

#### Máquina de estados
Tras victoria de boss en `handleCombatComplete`:
```ts
if (finalState.victory && isBoss) {
  grantBossRelic();
  setPlayerState(prev => ({ ...prev, sector: prev.sector + 1 }));
  const newMap = generateMap(playerState.sector + 1, Date.now());
  setMapData(newMap);
  setGamePhase('SECTOR_TRANSITION');
}
```

Nuevo `GamePhase`: `'SECTOR_TRANSITION'` + componente `SectorTransition.tsx`.

#### Roster de bosses (por sector)

| Sector | Boss ID | Sistemas | Mecánica especial |
|---|---|---|---|
| 1 | `BOSS_HEGEMONY_DESTROYER` | W(15) S(15) E(12) C(12) | Turno 3 telegrafía mega-ataque (40 dmg) — interrumpible via pre-emption |
| 2 | `BOSS_PIRATE_DREADNOUGHT` | W(15) S(15) E(12) C(12) + REACTOR(18) | Fase 1: STEALTH status. Fase 2: aplica HULL_BREACH cada turno |
| 3 | `BOSS_AI_NEXUS` | W(15) S(15) E(12) C(12) + REACTOR(18) | Aplica OVERHEAT al jugador cada 3 turnos; a 50% HP activa segundo set de sistemas |

### D.4 Prioridad + complejidad
- **Prioridad: Alta** (da estructura long-form; necesaria para rejugabilidad)
- **Complejidad: L** (5 días: extensión de tipos, map regen, enemies de boss, pantalla de transición, balance)

---

## E. ROLES DE TRIPULACIÓN EN COMBATE

8 cartas de crew únicas en `data/cards.ts:139-243` tienen `effectBase: 'CREW_BASIC'` que explícitamente no hace nada (`combatEngine.ts:348-351`). Dead weight en el deck.

### E.1 Estado actual
- Crew cards = jugables pero inútiles. Engine devuelve la energía gastada.
- `PlayerState.crew: number` = conteo raw (`types.ts:90`).
- `PlayerState.crewAffinity` (`types.ts:107`) rastrea relación por crew-ID pero no se usa en combate.
- Consecuencias de eventos en `constants.ts:69` verifican `crewRequirement` para gateo narrativo.

### E.2 Gap analysis
Falta:
1. Roster persistente de crew (FTL-style) con bonuses pasivos.
2. Asignación de crew a sistemas de nave (piloto → ENGINES, artillero → WEAPONS, etc.).
3. Distinguir crew CARDS (utilidad one-play) de crew ROSTER (bonus persistente).

### E.3 Implementación

#### Dos capas que coexisten con cartas actuales

**Capa 1: Roster persistente**

```ts
// types.ts
export interface CrewMember {
  id: string;
  templateId: string;              // e.g. 'CREW_ZARA_ARTILLERA'
  name: string;
  role: 'Pilot' | 'Gunner' | 'Engineer' | 'Medic' | 'Comms';
  level: 1 | 2 | 3;
  injured?: boolean;
  assignedSystem?: ShipSystemId;  // integración con Section C
}

// PlayerState additions
crewRoster: CrewMember[];
stationAssignments: {
  pilot?: string;
  gunner?: string;
  engineer?: string;
  medic?: string;
  comms?: string;
};
```

**Capa 2: Bonuses por estación (con integración Ship Systems)**

| Estación | Rol | Bonus Lv1/2/3 | Integración sistemas |
|---|---|---|---|
| Pilot | Pilot | +5/10/15% miss chance enemigo | Sinergia con ENGINES power |
| Gunner | Gunner | +1/2/3 dmg primer Attack por turno | Triggered cuando WEAPONS toma daño: +3 dmg al atacante |
| Engineer | Engineer | +1/2/3 Shield al inicio de turno | Cuando ENGINES desactivado: repara 5 HP |
| Medic | Medic | +1/2/3 HP al fin de turno | Cuando CREW desactivado en boss: mantiene reparaciones |
| Comms | Comms | -1/2/3 coste primer Skill por combate | Revela intent adicional si SENSORS activo |

#### Hooks en combatEngine
- `startPlayerTurn` (`combatEngine.ts:195`): aplicar Engineer Shield, Medic heal, resetear flags "first attack/skill".
- `playCard` (`combatEngine.ts:281`): primer Attack → bonus de Gunner; primer Skill → bonus de Comms.
- `processEnemyTurn` (`combatEngine.ts:373`): miss chance de Pilot.
- Nueva acción `DAMAGE_SYSTEM` → trigger de habilidades de crew asignada al sistema dañado.

#### Mecánica de lesiones (sabor FTL)
- Al escapar combate (o hit de boss > 20 dmg): roll para lesionar crew asignada → `injured = true`, bonus reducido a la mitad.
- Sanación en `NodeType.REST` o servicio de tienda.

### E.4 Prioridad + complejidad
- **Prioridad: Media** (depende de C para estaciones; mejor después de D para nodos REST)
- **Complejidad: M** (3 días: tipos, UI roster, bonuses engine, integración crew cards)

---

## F. MECÁNICAS EXTENDIDAS DE CARTAS

El switch de `effectBase` (`combatEngine.ts:317-356`) soporta solo 8 efectos. El poder de StS viene del stacking de keywords (Exhaust, Innate, Retain, multi-hit, etc.).

### F.1 Estado actual
- `CardData.effectBase` strings (`types.ts:49`): semántica de efecto único.
- Solo single-target; sin multi-hit, sin keywords.
- `EFFECT_HEAL_HULL_AND_EXILE` (`combatEngine.ts:335-338`): única carta que usa exile — prueba que el mecanismo funciona.
- Sistema de upgrade: un slot `affix` genérico por `CardInstance` (`types.ts:60`). Sin upgrades per-carta.

### F.2 Gap analysis
Falta:
1. Keywords como metadata first-class en `CardData`.
2. Soporte multi-hit en `playCard`.
3. Cartas que aplican status effects (depende de Section B).
4. Upgrades únicos por carta (en lugar del +2/-1 genérico actual).
5. Retain, Innate, Ethereal.
6. Cartas de maldición (Curse) distribuidas por bosses/eventos.

### F.3 Implementación

#### Tipos (extender `CardData` en `types.ts:39`)

```ts
export type CardKeyword =
  | 'EXHAUST'
  | 'RETAIN'
  | 'INNATE'
  | 'ETHEREAL'
  | 'UNPLAYABLE'
  | 'BURN_CURSE';

export interface CardData {
  ...existing,
  keywords?: CardKeyword[];
  hits?: number;
  statusApply?: {
    target: 'SELF' | 'ENEMY';
    status: StatusEffectId;
    stacks: number;
    targetSystem?: ShipSystemId;
  };
  upgradedVersion?: Partial<CardData>;
}
```

#### Cambios en combatEngine
- `playCard`: antes del discard final, verificar `keywords?.includes('EXHAUST')` → exile en lugar de discard (generaliza el caso especial `EFFECT_HEAL_HULL_AND_EXILE`).
- Multi-hit: si `cardData.hits > 1`, hacer push de N acciones DEAL_DAMAGE. Cada hit pasa por el pipeline completo (modificadores de status aplican por hit — crítico para Multi-hit + HULL_BREACH synergy).
- Nueva case `EFFECT_APPLY_STATUS`: lee `cardData.statusApply` y hace push de acción APPLY_STATUS.
- `startPlayerTurn` (`combatEngine.ts:200-201`): al descartar mano, filtrar RETAIN (mantener en mano). ETHEREAL → push a exile.
- `createCombat`: después de robar 5 cartas iniciales, buscar INNATE en drawPile y force-draw.

#### Rework del sistema de upgrade
Reemplazar `UPGRADE_AFFIX` genérico en `useGameHandlers.ts` con lookup per-carta:
```ts
const upgradeCard = (instance: CardInstance, allCards: Record<string,CardData>): CardInstance => {
  const cardData = allCards[instance.cardId];
  if (cardData.upgradedVersion) {
    return {
      ...instance,
      affix: {
        name: 'Mejorada',
        description: cardData.upgradedVersion.description || '',
        costModifier: (cardData.upgradedVersion.cost ?? cardData.cost) - cardData.cost,
        valueModifier: (cardData.upgradedVersion.value ?? cardData.value ?? 0) - (cardData.value ?? 0),
      }
    };
  }
  return { ...instance, affix: UPGRADE_AFFIX };
};
```

### F.4 Nuevas cartas (10)

| ID | Nombre | Costo | Efecto | Keywords | Upgrade |
|---|---|---|---|---|---|
| `ATTACK_VOLLEY` | Andanada | 1 | 3 dmg × 3 hits | — | 4 dmg × 3 hits |
| `ATTACK_PLASMA` | Cañón de Plasma | 2 | 8 dmg + 2 Plasma Leak | — | 10 dmg + 3 Plasma Leak |
| `SKILL_OVERCHARGE` | Sobrecarga Reactor | 2 | +2 OVERCHARGE | EXHAUST | +3 OVERCHARGE |
| `SKILL_FOCUS` | Concentración | 1 | 2 Hull Breach al enemigo | — | 3 Hull Breach |
| `POWER_SHIELD_MATRIX` | Matriz de Escudo | 2 | Power: +2 Shield por turno | INNATE | +3 Shield |
| `SKILL_BURN_BEAM` | Rayo Incendiario | 1 | 4 dmg + 2 Burn | — | 6 dmg + 3 Burn |
| `ATTACK_SYSTEM_STRIKE` | Golpe de Sistema | 1 | 4 dmg a sistema elegido | — | 6 dmg |
| `SKILL_TARGETED_EMP` | EMP Dirigido | 2 | Desactiva sistema 3 turnos | EXHAUST | Cost 1 |
| `SKILL_REPAIR_DRONE` | Drone Reparador | 1 | Repara 4 HP por turno | RETAIN | Repara 6 |
| `CURSE_FATIGUE` | Fatiga | 1 | UNPLAYABLE; si en mano al fin de turno → 2 dmg al jugador | UNPLAYABLE, BURN_CURSE | — |

### F.5 Prioridad + complejidad
- **Prioridad: Alta** (profundiza combate dramáticamente; barato después de B)
- **Complejidad: M** (3 días: adición de tipos, integración engine, cartas de contenido)

---

## Consideraciones Transversales

### Migración de save format

| Versión | Cambios | Trigger |
|---|---|---|
| v1 (actual) | Sin relics, sin sistemas | — |
| v2 | + `relics`, `relicState` | Al implementar A |
| v3 | + `systems`, `crewRoster`, `stationAssignments`, `sector`, `powerAllocation` | Al implementar C |

Migración en `services/saveManager.ts:48` `loadGame` → branch en `save.version` e inyectar defaults.

### Content JSON
Extender `public/data/content.json` y `services/validationSchemas.ts`:
- `relics: RelicData[]`
- `statusEffects: StatusEffectDef[]`
- `shipSystems: ShipSystemDef[]`
- `bosses: Combatant[]` con `systems`
- Cards con `keywords`, `hits`, `statusApply`, `upgradedVersion`

### Editor
`editor/index.html` (vanilla JS, sin build): agregar tabs para Relics, Status Effects, Ship Systems, Boss enemies.

### Tests requeridos
- `services/relicEngine.test.ts` — cada trigger dispara una sola vez por evento apropiado.
- `services/statusEngine.test.ts` — reglas de stackeo + matemáticas de modificadores de daño.
- `services/combatEngine.test.ts` — keywords nuevos (Exhaust, Retain, Innate, multi-hit, pre-emption).
- `services/saveManager.test.ts` (ya existe) — casos de migración v1→v2→v3.

### Nuevos componentes UI
- `components/RelicTray.tsx` — bandeja HUD con tooltips
- `components/SectorTransition.tsx` — pantalla entre sectores
- `components/SystemPips.tsx` — pips SVG reutilizables (jugador y enemigo)
- `components/CrewRoster.tsx` — asignación de crew en Hangar
- `components/StatusBadges.tsx` — iconos StS-style con números

---

## Orden de implementación sugerido

1. **B. Status Effects** (3 días) — prerequisito de todo lo demás
2. **A. Relics System** (4 días) — mayor diferenciador; puede shipper sin sectores
3. **F. Extended Card Mechanics** (3 días) — multiplica el valor de A + B
4. **D. Sector Structure + Boss** (5 días) — estructura long-form
5. **C. Ship Systems** (6 días) — ADN FTL; requiere D para bosses con REACTOR
6. **E. Crew Roles** (3 días) — capa de polish; depende de C para estaciones

**Total: ~24 días de desarrollo.**
