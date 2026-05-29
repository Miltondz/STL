# Expansión 01 — "Brasas del Vacío"
**Set de 26 cartas + 11 reliquias** para *Navegador Galáctico*.

Diseñado para potenciar 3 arquetipos diferenciados con cartas de cruce ("Oportunista") que permitan mazos híbridos. Todos los IDs son nuevos, todos los `effect.kind` de reliquias son nuevos. Compatible 1:1 con `data/cards.ts` y `services/relicEngine.ts`.

---

## Resumen ejecutivo

| Arquetipo | Identidad | Cartas | Reliquias clave |
|---|---|---|---|
| **Quemador** | DoT escalable. Apila BURN y PLASMA_LEAK; gana presión por turnos. Daño bajo upfront, masivo en T3-T5. | 8 | REL_FUSION_CORE, REL_PYRO_INJECTOR, REL_PLASMA_REGULATOR |
| **Fortaleza** | RETAIN + escudos altos + sustain. Gana intercambios largos. Activa STEALTH para saltar turnos enemigos. | 7 | REL_AEGIS_PROTOCOL, REL_DEFLECTOR_ARRAY, REL_BULWARK_HEART |
| **Sabotaje** | Apila HULL_BREACH/OVERHEAT/JAMMED. Multi-hit que abusa de brecha. Combo con EMP. | 7 | REL_SABOTAGE_KIT, REL_OVERRIDE_KEY, REL_CHRONOMETER |
| **Oportunista** | Economía, energía, draw, flex. Encaja en cualquier mazo. | 4 | REL_SCAVENGER_DRONE, REL_VOID_LEDGER |

**Curva de daño bruto** (turno 1, 3 energía, sin reliquias):
- Quemador: 7-9 daño directo + 6-10 DoT pendiente
- Fortaleza: 4-5 daño + 10-14 escudo + retain set-up
- Sabotaje: 5-7 daño + debuff que duplica T2

---

## 1. CARD SET (26 cartas)

### 1.1 Arquetipo QUEMADOR (8 cartas)

```ts
// ============ QUEMADOR ============

'ATTACK_INCENDIARY_SALVO': {
    id: 'ATTACK_INCENDIARY_SALVO',
    name: 'Salva Incendiaria',
    type: 'Attack',
    cost: 1,
    price: 16,
    rarity: 'Common',
    faction: 'Mercenarios',
    description: 'Inflige 2 de daño 2 veces y aplica 1 de Incendio al enemigo.',
    effectBase: 'EFFECT_DAMAGE_AND_BURN',
    value: 2,
    hits: 2,
    upgradedVersion: { value: 3, description: 'Inflige 3 de daño 2 veces y aplica 1 de Incendio al enemigo.' },
},
// NOTA DE BALANCE: 4 dmg + 1 BURN por 1E. Comparable a ATTACK_BURN_BEAM (4 dmg + 2 BURN) pero
// el multi-hit doble dispara HULL_BREACH dos veces — escala con Sabotaje. Solo 1 BURN para no
// hacer obsoleta la carta base. Upgrade añade +2 dmg total (6 dmg).

'ATTACK_PYROCLASM': {
    id: 'ATTACK_PYROCLASM',
    name: 'Piroclasmo',
    type: 'Attack',
    cost: 2,
    price: 24,
    rarity: 'Uncommon',
    faction: 'Neutral',
    description: 'Inflige 5 de daño y aplica 3 de Incendio al enemigo.',
    effectBase: 'EFFECT_DAMAGE_AND_BURN',
    value: 5,
    upgradedVersion: { value: 8, description: 'Inflige 8 de daño y aplica 3 de Incendio al enemigo.' },
},
// IMPLEMENTACIÓN: EFFECT_DAMAGE_AND_BURN aplica 2 BURN por defecto. Para 3 BURN, el motor debe
// leer un campo `burnStacks` opcional, O se hace via EFFECT_APPLY_STATUS combinado. Alternativa:
// reusar EFFECT_DAMAGE_AND_BURN tal cual y bajar value a 7. Decisión final del implementador.

'ATTACK_OVERHEATING_BEAM': {
    id: 'ATTACK_OVERHEATING_BEAM',
    name: 'Rayo Sobrecargado',
    type: 'Attack',
    cost: 1,
    price: 18,
    rarity: 'Uncommon',
    faction: 'Tecno-Gremio',
    description: 'Inflige 3 de daño y aplica 2 de Fuga de Plasma al enemigo.',
    effectBase: 'EFFECT_DAMAGE_AND_PLASMA_LEAK',
    value: 3,
    upgradedVersion: { value: 5, description: 'Inflige 5 de daño y aplica 2 de Fuga de Plasma al enemigo.' },
},
// BALANCE: Versión 1E de ATTACK_PLASMA_BURST (que es 2E/6 dmg/2 PL). Menos eficiente por punto
// de daño pero más flexible para spammar PL y triggear sinergias.

'SKILL_CASCADE_IGNITION': {
    id: 'SKILL_CASCADE_IGNITION',
    name: 'Ignición en Cascada',
    type: 'Skill',
    cost: 1,
    price: 20,
    rarity: 'Uncommon',
    faction: 'Neutral',
    description: 'Aplica 4 de Incendio al enemigo.',
    effectBase: 'EFFECT_APPLY_STATUS',
    value: 4,
    statusApply: { target: 'ENEMY', status: 'BURN' },
    upgradedVersion: { value: 6, description: 'Aplica 6 de Incendio al enemigo.' },
},
// BALANCE: 4 stacks BURN = 4+3+2+1 = 10 daño total a 1E. Setup puro. Con REL_ION_CAPACITOR
// se duplica a 8 stacks = 36 daño. Sin ataque inmediato — el enemigo puede curarse o matarte antes.

'ATTACK_PLASMA_LANCE': {
    id: 'ATTACK_PLASMA_LANCE',
    name: 'Lanza de Plasma',
    type: 'Attack',
    cost: 2,
    price: 26,
    rarity: 'Rare',
    faction: 'Tecno-Gremio',
    description: 'Inflige 4 de daño 2 veces y aplica 3 de Fuga de Plasma al enemigo.',
    effectBase: 'EFFECT_DAMAGE_AND_PLASMA_LEAK',
    value: 4,
    hits: 2,
    upgradedVersion: { value: 5, description: 'Inflige 5 de daño 2 veces y aplica 3 de Fuga de Plasma al enemigo.' },
},
// IMPLEMENTACIÓN: hits=2 con DAMAGE_AND_PLASMA_LEAK. El motor debe aplicar PL una sola vez
// (al final del último hit) o dos veces (cada hit aplica 3 PL). Recomiendo: PL solo en último hit
// para no inflar a 6 PL. Total: 8 dmg + 3 PL + (4+3+2+1+) burn equivalent = 14 dmg potencial.

'POWER_HEAT_SINK_FAILURE': {
    id: 'POWER_HEAT_SINK_FAILURE',
    name: 'Falla de Disipadores',
    type: 'Power',
    cost: 2,
    price: 30,
    rarity: 'Rare',
    faction: 'Hacktivistas',
    description: 'Al inicio de cada turno, aplica 1 de Incendio al enemigo. Exhaust.',
    effectBase: 'EFFECT_NONE',
    keywords: ['EXHAUST'],
    value: 1,
    upgradedVersion: { value: 2, description: 'Al inicio de cada turno, aplica 2 de Incendio al enemigo. Exhaust.' },
},
// IMPLEMENTACIÓN NUEVA: añadir effectBase 'EFFECT_POWER_TURN_START_BURN'. El motor mantiene
// un slot de "powers activos" y dispara en TURN_START. La carta se exilia al jugarse pero su efecto
// queda registrado en combatant.powers[]. Si añadir powers persistentes es costoso, usar variante:
// "Aplica 6 de Incendio al enemigo. Exhaust." con EFFECT_APPLY_STATUS — mismo arquetipo, menos código.

'ATTACK_VOLCANIC_BARRAGE': {
    id: 'ATTACK_VOLCANIC_BARRAGE',
    name: 'Bombardeo Volcánico',
    type: 'Attack',
    cost: 3,
    price: 38,
    rarity: 'Rare',
    faction: 'Mercenarios',
    description: 'Inflige 4 de daño 3 veces y aplica 2 de Incendio al enemigo.',
    effectBase: 'EFFECT_DAMAGE_AND_BURN',
    value: 4,
    hits: 3,
    upgradedVersion: { value: 5, description: 'Inflige 5 de daño 3 veces y aplica 2 de Incendio al enemigo.' },
},
// BALANCE: 12 dmg + 2 BURN a 3E. Compara contra ATTACK_VOLLEY (9 dmg, 2E) — paga 1E extra
// por +3 dmg y status. Multi-hit triple = abuso máximo de HULL_BREACH (cada hit +50%).
// Con HB activo: 4 × 1.5 × 3 = 18 dmg solo del ataque.

'CURSE_PLASMA_BLEED': {
    id: 'CURSE_PLASMA_BLEED',
    name: 'Maldición: Hemorragia de Plasma',
    type: 'Skill',
    subtype: 'Curse',
    cost: 0,
    price: 0,
    rarity: 'Curse',
    description: 'No jugable. Al inicio de tu turno, recibe 2 de daño.',
    effectBase: 'EFFECT_NONE',
    keywords: ['UNPLAYABLE'],
    faction: 'Neutral',
},
// IMPLEMENTACIÓN NUEVA: nuevo keyword/efecto 'CURSE_PLASMA_BLEED' que el motor revisa cada TURN_START.
// Curse específico del arquetipo Quemador — penaliza a quien lo recibe por eventos negativos.
// Alternativa: si no se quiere lógica nueva, mantener solo UNPLAYABLE y darle nombre cosmético.
```

### 1.2 Arquetipo FORTALEZA (7 cartas)

```ts
// ============ FORTALEZA ============

'SKILL_BULWARK_PLATING': {
    id: 'SKILL_BULWARK_PLATING',
    name: 'Blindaje Reforzado',
    type: 'Skill',
    cost: 1,
    price: 16,
    rarity: 'Common',
    faction: 'Neutral',
    description: 'Gana 8 de escudo.',
    effectBase: 'EFFECT_SHIELD',
    value: 8,
    possibleAffixes: [
        { name: 'Eficiente', description: 'Cuesta 1 menos de Energía.', costModifier: -1 },
        { name: 'Reforzado', description: 'Otorga 3 de escudo adicional.', valueModifier: 3 }
    ],
    upgradedVersion: { value: 11, description: 'Gana 11 de escudo.' },
},
// BALANCE: DEFEND_1 da 5 por 1E. Esta da 8 por 1E pero es Common — sirve como reemplazo
// natural en mazos defensivos. Sin RETAIN, así que es uso inmediato. Affixes amplifican.

'SKILL_REINFORCED_BULKHEAD': {
    id: 'SKILL_REINFORCED_BULKHEAD',
    name: 'Mamparo Reforzado',
    type: 'Skill',
    cost: 1,
    price: 18,
    rarity: 'Uncommon',
    faction: 'Neutral',
    description: 'Gana 5 de escudo. Retener.',
    effectBase: 'EFFECT_SHIELD',
    keywords: ['RETAIN'],
    value: 5,
    upgradedVersion: { value: 8, description: 'Gana 8 de escudo. Retener.' },
},
// BALANCE: Versión Common de SKILL_HOLOGRAPHIC_SHIELD (6 esc/1E Uncommon). Diferencia 1 punto
// de escudo para diferenciar rarity. RETAIN permite acumular en turnos lentos.

'SKILL_EMERGENCY_PATCH': {
    id: 'SKILL_EMERGENCY_PATCH',
    name: 'Parche de Emergencia',
    type: 'Skill',
    cost: 1,
    price: 18,
    rarity: 'Common',
    faction: 'Tecno-Gremio',
    description: 'Repara 4 de Casco. Gana 3 de escudo.',
    effectBase: 'EFFECT_REPAIR_AND_SHIELD',
    value: 4,
    upgradedVersion: { value: 6, description: 'Repara 6 de Casco. Gana 3 de escudo.' },
},
// IMPLEMENTACIÓN NUEVA: añadir 'EFFECT_REPAIR_AND_SHIELD' al motor (repara value + escudo fijo 3).
// Si se quiere reusar, alternativa: 'EFFECT_REPAIR' value:4 + segunda mecánica via meta.
// BALANCE: REPAIR_1 da 7 hull por 2E. Esta da 4 hull + 3 shield por 1E = más eficiente pero menos
// burst de reparación. Mid-curve.

'SKILL_GHOST_PROTOCOL': {
    id: 'SKILL_GHOST_PROTOCOL',
    name: 'Protocolo Fantasma',
    type: 'Skill',
    cost: 1,
    price: 22,
    rarity: 'Uncommon',
    faction: 'Hacktivistas',
    description: 'Gana Sigilo: el enemigo salta su próxima acción de ataque.',
    effectBase: 'EFFECT_APPLY_STATUS',
    value: 1,
    statusApply: { target: 'SELF', status: 'STEALTH' },
    keywords: ['EXHAUST'],
    upgradedVersion: { cost: 0, description: 'Gana Sigilo: el enemigo salta su próxima acción de ataque. Exhaust.' },
},
// IMPLEMENTACIÓN: STEALTH ya existe — el motor debe revisar self.statuses al resolver intent
// enemigo. Si stealth > 0, saltar ATTACK del enemigo y decrementar 1 stack. EXHAUST evita spam.
// BALANCE: salto de turno enemigo a 1E exhaust ≈ DEFEND_1 + algo. Justificable por ser Uncommon.

'SKILL_KINETIC_BARRIER': {
    id: 'SKILL_KINETIC_BARRIER',
    name: 'Barrera Cinética',
    type: 'Skill',
    cost: 2,
    price: 26,
    rarity: 'Rare',
    faction: 'Neutral',
    description: 'Gana 12 de escudo. Retener.',
    effectBase: 'EFFECT_SHIELD',
    keywords: ['RETAIN'],
    value: 12,
    upgradedVersion: { value: 16, description: 'Gana 16 de escudo. Retener.' },
},
// BALANCE: SKILL_HOLOGRAPHIC_SHIELD upgrade es 9 esc / 1E. Esta es 12 esc / 2E + Retain — mismo
// rate por energía pero acumulable. Pieza top del arquetipo.

'ATTACK_SHIELD_BASH': {
    id: 'ATTACK_SHIELD_BASH',
    name: 'Embestida de Escudos',
    type: 'Attack',
    cost: 1,
    price: 16,
    rarity: 'Common',
    faction: 'Mercenarios',
    description: 'Inflige daño igual a tu escudo actual, hasta 8.',
    effectBase: 'EFFECT_DAMAGE_FROM_SHIELD',
    value: 8,
    upgradedVersion: { value: 12, description: 'Inflige daño igual a tu escudo actual, hasta 12.' },
},
// IMPLEMENTACIÓN NUEVA: añadir 'EFFECT_DAMAGE_FROM_SHIELD' — el motor calcula
// dmg = Math.min(self.shield, value) y dispara DEAL_DAMAGE. Sin coste de escudo (no se gasta).
// BALANCE: con SKILL_KINETIC_BARRIER (12 esc) hace 8 dmg a 1E — equivalente a ATTACK_1 (6 dmg).
// Sin escudo, hace 0 — riesgo real. Premia jugar defensivo primero.

'POWER_REGENERATION_FIELD': {
    id: 'POWER_REGENERATION_FIELD',
    name: 'Campo de Regeneración',
    type: 'Power',
    cost: 2,
    price: 32,
    rarity: 'Rare',
    faction: 'Academia',
    description: 'Al final de cada turno, repara 3 de Casco. Exhaust.',
    effectBase: 'EFFECT_POWER_TURN_END_REPAIR',
    keywords: ['EXHAUST'],
    value: 3,
    upgradedVersion: { value: 5, description: 'Al final de cada turno, repara 5 de Casco. Exhaust.' },
},
// IMPLEMENTACIÓN NUEVA: similar a POWER_HEAT_SINK_FAILURE — registra en combatant.powers[].
// Top-tier para mazos largos. 3 hull/turno × 6 turnos = 18 hull recuperado.
```

### 1.3 Arquetipo SABOTAJE (7 cartas)

```ts
// ============ SABOTAJE ============

'SKILL_SYSTEM_HACK': {
    id: 'SKILL_SYSTEM_HACK',
    name: 'Hackeo de Sistemas',
    type: 'Skill',
    cost: 1,
    price: 16,
    rarity: 'Common',
    faction: 'Hacktivistas',
    description: 'Aplica 3 de Sobrecalentamiento al enemigo.',
    effectBase: 'EFFECT_APPLY_OVERHEAT',
    value: 3,
    upgradedVersion: { value: 4, description: 'Aplica 4 de Sobrecalentamiento al enemigo.' },
},
// BALANCE: SKILL_OVERHEAT da 2 por 1E. Esta da 3 — sigue siendo Common, pero compensa la
// diferencia. 3 turnos de -25% dmg enemigo = mitigación neta enorme contra ataques pesados.

'SKILL_DISRUPTOR_PULSE': {
    id: 'SKILL_DISRUPTOR_PULSE',
    name: 'Pulso Disruptor',
    type: 'Skill',
    cost: 1,
    price: 22,
    rarity: 'Uncommon',
    faction: 'Hacktivistas',
    description: 'Aplica Atasco al enemigo: no puede atacar el próximo turno.',
    effectBase: 'EFFECT_APPLY_STATUS',
    value: 1,
    statusApply: { target: 'ENEMY', status: 'JAMMED' },
    upgradedVersion: { cost: 0, description: 'Aplica Atasco al enemigo: no puede atacar el próximo turno.' },
},
// IMPLEMENTACIÓN: JAMMED ya existe en types pero no en effectBase. Reusar EFFECT_APPLY_STATUS.
// BALANCE: ojo — JAMMED del documento dice "cannot play Attack cards 1 turn". Esto es para el
// enemigo: el motor debe revisar enemy.statuses.JAMMED y, si stacks>0, forzar intent != ATTACK.
// Más débil que EMP (skip total) — por eso solo 1E y Uncommon, no Rare.

'ATTACK_PRECISION_VOLLEY': {
    id: 'ATTACK_PRECISION_VOLLEY',
    name: 'Salva de Precisión',
    type: 'Attack',
    cost: 2,
    price: 22,
    rarity: 'Uncommon',
    faction: 'Tecno-Gremio',
    description: 'Inflige 2 de daño 4 veces.',
    effectBase: 'EFFECT_DAMAGE',
    value: 2,
    hits: 4,
    possibleAffixes: [
        { name: 'Calibrado', description: 'Inflige 2 de daño adicional.', valueModifier: 2 }
    ],
    upgradedVersion: { value: 3, description: 'Inflige 3 de daño 4 veces.' },
},
// BALANCE: 8 dmg base por 2E (vs ATTACK_VOLLEY 9 dmg/2E). Menos dmg total PERO 4 hits — abuso
// de HULL_BREACH: 2 × 1.5 × 4 = 12 dmg con HB. Con afijo Calibrado: 4 × 1.5 × 4 = 24 dmg.
// Llave maestra del arquetipo.

'SKILL_TARGET_PAINTER': {
    id: 'SKILL_TARGET_PAINTER',
    name: 'Marcador Láser',
    type: 'Skill',
    cost: 0,
    price: 20,
    rarity: 'Uncommon',
    faction: 'Mercenarios',
    description: 'Aplica 2 de Brecha en Casco al enemigo. Roba 1 carta. Exhaust.',
    effectBase: 'EFFECT_HULL_BREACH_AND_DRAW',
    keywords: ['EXHAUST'],
    value: 2,
    upgradedVersion: { value: 3, description: 'Aplica 3 de Brecha en Casco al enemigo. Roba 1 carta. Exhaust.' },
},
// IMPLEMENTACIÓN NUEVA: 'EFFECT_HULL_BREACH_AND_DRAW' = APPLY_STATUS HULL_BREACH + DRAW 1.
// BALANCE: 0E porque exilia y solo da setup. SKILL_FOCUS (2 HB exhaust 1E) — esta es 0E con draw,
// pero no acumula en mazo (exhaust). Increíble combo con multi-hit siguiente turno.

'ATTACK_SABOTAGE_STRIKE': {
    id: 'ATTACK_SABOTAGE_STRIKE',
    name: 'Golpe Saboteador',
    type: 'Attack',
    cost: 2,
    price: 24,
    rarity: 'Uncommon',
    faction: 'Hacktivistas',
    description: 'Inflige 4 de daño. Aplica 2 de Brecha en Casco y 2 de Sobrecalentamiento al enemigo.',
    effectBase: 'EFFECT_DAMAGE_AND_DOUBLE_DEBUFF',
    value: 4,
    upgradedVersion: { value: 6, description: 'Inflige 6 de daño. Aplica 2 de Brecha en Casco y 2 de Sobrecalentamiento al enemigo.' },
},
// IMPLEMENTACIÓN NUEVA: 'EFFECT_DAMAGE_AND_DOUBLE_DEBUFF' — damage + HB 2 + OVERHEAT 2.
// Si no se quiere lógica nueva: reemplazar por dos cartas separadas o reusar EFFECT_DAMAGE
// con un meta hint. BALANCE: 4 dmg con setup masivo. Combo turno-A → Turno-B golpe pesado.

'SKILL_OVERLOAD_VIRUS': {
    id: 'SKILL_OVERLOAD_VIRUS',
    name: 'Virus de Sobrecarga',
    type: 'Skill',
    cost: 2,
    price: 30,
    rarity: 'Rare',
    faction: 'Hacktivistas',
    description: 'Aplica 3 de Brecha en Casco y 3 de Sobrecalentamiento al enemigo. Exhaust.',
    effectBase: 'EFFECT_DOUBLE_DEBUFF',
    keywords: ['EXHAUST'],
    value: 3,
    upgradedVersion: { value: 4, description: 'Aplica 4 de Brecha en Casco y 4 de Sobrecalentamiento al enemigo. Exhaust.' },
},
// BALANCE: setup gigante por 2E exhaust. 3 turnos de -25% dmg recibido + 3 turnos de +50% dmg
// outgoing = swing brutal. Pieza top.

'ATTACK_CHAIN_DISCHARGE': {
    id: 'ATTACK_CHAIN_DISCHARGE',
    name: 'Descarga en Cadena',
    type: 'Attack',
    cost: 1,
    price: 24,
    rarity: 'Rare',
    faction: 'Tecno-Gremio',
    description: 'Inflige 3 de daño 3 veces. Etéreo.',
    effectBase: 'EFFECT_DAMAGE',
    value: 3,
    hits: 3,
    keywords: ['ETHEREAL'],
    upgradedVersion: { value: 4, description: 'Inflige 4 de daño 3 veces. Etéreo.' },
},
// BALANCE: 9 dmg/1E pero ETHEREAL (debe jugarse o se exilia). Mismo dmg que ATTACK_VOLLEY a
// mitad de coste, compensado por ETHEREAL. Con HULL_BREACH activo: 13 dmg con multi-hit.
// Si llega forzado por INNATE/Hegemonía y no hay HB, sigue siendo bueno.
```

### 1.4 Cartas OPORTUNISTA (4 cartas cross-archetype)

```ts
// ============ OPORTUNISTA ============

'SKILL_CARGO_DUMP': {
    id: 'SKILL_CARGO_DUMP',
    name: 'Descarga de Carga',
    type: 'Skill',
    cost: 0,
    price: 14,
    rarity: 'Common',
    faction: 'Comerciante',
    description: 'Roba 2 cartas. Exhaust.',
    effectBase: 'EFFECT_DRAW_2',
    keywords: ['EXHAUST'],
    value: 2,
    upgradedVersion: { cost: 0, description: 'Roba 3 cartas. Exhaust.' },
},
// IMPLEMENTACIÓN: 'EFFECT_DRAW_2' nuevo, o reusar EFFECT_DRAW_1 con value=2 si engine respeta value.
// BALANCE: 0E + 2 draw + exhaust = ciclar mazo. Bueno en todo arquetipo.

'POWER_QUANTUM_BATTERY': {
    id: 'POWER_QUANTUM_BATTERY',
    name: 'Batería Cuántica',
    type: 'Power',
    cost: 1,
    price: 28,
    rarity: 'Rare',
    faction: 'Academia',
    description: 'Cada turno, la primera carta de coste 0 que juegas te otorga 1 de Energía. Exhaust.',
    effectBase: 'EFFECT_POWER_FREE_CARD_ENERGY',
    keywords: ['EXHAUST'],
    value: 1,
    upgradedVersion: { cost: 0, description: 'Cada turno, la primera carta de coste 0 que juegas te otorga 1 de Energía. Exhaust.' },
},
// IMPLEMENTACIÓN NUEVA: power persistente. Combatant.powers[] con kind='FREE_CARD_ENERGY' y
// flag perTurnFlag. Cada PLAY_CARD verifica cost===0 y dispara GAIN_ENERGY si no se ha usado.
// SINERGIA: SKILL_CARGO_DUMP, SKILL_COMBAT_PREP, SKILL_TARGET_PAINTER, ENERGY_1.

'SKILL_FUEL_REROUTE': {
    id: 'SKILL_FUEL_REROUTE',
    name: 'Redirección de Combustible',
    type: 'Skill',
    cost: 1,
    price: 22,
    rarity: 'Uncommon',
    faction: 'Neutral',
    description: 'Gana 2 de Energía. Exhaust.',
    effectBase: 'EFFECT_ENERGY_GAIN',
    keywords: ['EXHAUST'],
    value: 2,
    upgradedVersion: { cost: 0, description: 'Gana 2 de Energía. Exhaust.' },
},
// IMPLEMENTACIÓN NUEVA: 'EFFECT_ENERGY_GAIN' con value=2 (vs ENERGY_1 que es +1). O reusar.
// BALANCE: ENERGY_1 da +1 a 0E sin exhaust = neto 0. Esta da +2 a 1E exhaust = neto +1 burst.
// Permite combos pesados un turno (4E disponibles), pero exilia.

'CURSE_DEAD_WEIGHT': {
    id: 'CURSE_DEAD_WEIGHT',
    name: 'Maldición: Peso Muerto',
    type: 'Skill',
    subtype: 'Curse',
    cost: 0,
    price: 0,
    rarity: 'Curse',
    description: 'No jugable. Etéreo. (Se exilia si no se juega; nunca puedes jugarla.)',
    effectBase: 'EFFECT_NONE',
    keywords: ['UNPLAYABLE', 'ETHEREAL'],
    faction: 'Neutral',
},
// INTERACCIÓN INTERESANTE: ETHEREAL + UNPLAYABLE = se autoexilia al final del turno sin daño.
// La curse "más leve" — gasta un slot de mano un turno, luego desaparece. Útil como reward de
// evento penalizante donde quieres molestia temporal.
```

---

## 2. RELIC SET (11 reliquias)

### 2.1 Quemador

```ts
REL_FUSION_CORE: {
    id: 'REL_FUSION_CORE', name: 'Núcleo de Fusión', rarity: 'Uncommon', icon: '🔥',
    description: 'Al inicio de cada turno, aplica 1 de Incendio al enemigo.',
    flavorText: '"El reactor nunca duerme. El enemigo tampoco."',
    trigger: 'TURN_START', effect: { kind: 'TURN_START_APPLY_BURN', value: 1 },
},
// IMPLEMENTACIÓN: en computeRelicTurnStartEffects, si relic activo, encolar APPLY_STATUS BURN 1
// al enemigo. Si REL_ION_CAPACITOR está activo, se duplica (2 BURN). Sinergiza con
// REL_HEGEMONY_RELIC en mazos slow-roll.
// ARQUETIPO: Quemador.

REL_PYRO_INJECTOR: {
    id: 'REL_PYRO_INJECTOR', name: 'Inyector Pirotécnico', rarity: 'Rare', icon: '💥',
    description: 'Al jugar un Ataque que aplique Incendio, aplica 1 stack adicional.',
    flavorText: '"Cada disparo deja una promesa ardiente."',
    trigger: 'CARD_PLAYED_ATTACK', effect: { kind: 'BURN_ATTACK_BONUS_STACK', value: 1 },
},
// IMPLEMENTACIÓN: hook al resolver EFFECT_DAMAGE_AND_BURN o cualquier APPLY_STATUS BURN
// proveniente de carta tipo Attack. Suma +1 antes del cálculo de REL_ION_CAPACITOR (que duplica).
// Combo: con ION_CAPACITOR, ATTACK_BURN_BEAM da (2+1)×2 = 6 BURN = 21 dmg DoT.
// ARQUETIPO: Quemador.

REL_PLASMA_REGULATOR: {
    id: 'REL_PLASMA_REGULATOR', name: 'Regulador de Plasma', rarity: 'Rare', icon: '🌀',
    description: 'La Fuga de Plasma que aplicas dura 1 turno adicional (4→3→2→1).',
    flavorText: '"La fisura no se cierra. Solo crece más despacio."',
    trigger: 'PASSIVE', effect: { kind: 'PLASMA_LEAK_EXTRA_TURN', value: 1 },
},
// IMPLEMENTACIÓN: al aplicar PLASMA_LEAK, sumar +1 al stack inicial. PL de 3 stacks → 4 stacks
// = 4+3+2+1 = 10 dmg total (en lugar de 6). Counterparte de REL_ION_CAPACITOR para PL.
// ARQUETIPO: Quemador.
```

### 2.2 Fortaleza

```ts
REL_AEGIS_PROTOCOL: {
    id: 'REL_AEGIS_PROTOCOL', name: 'Protocolo Égida', rarity: 'Uncommon', icon: '🛡️',
    description: 'Al final del turno, si tienes 10+ de escudo, repara 2 de Casco.',
    flavorText: '"La mejor armadura es la que sobra."',
    trigger: 'TURN_END', effect: { kind: 'HIGH_SHIELD_REPAIR', value: 2 },
},
// IMPLEMENTACIÓN: en computeRelicTurnEndEffects, si player.shield >= 10, encolar REPAIR_HULL 2.
// SINERGIA: SKILL_KINETIC_BARRIER (12 esc), HOLO_SHIELD acumulado vía RETAIN.
// ARQUETIPO: Fortaleza.

REL_DEFLECTOR_ARRAY: {
    id: 'REL_DEFLECTOR_ARRAY', name: 'Matriz Deflectora', rarity: 'Rare', icon: '🔷',
    description: 'Las cartas con Retener te otorgan +2 de escudo adicional.',
    flavorText: '"Lo que guardas, te guarda."',
    trigger: 'PASSIVE', effect: { kind: 'RETAIN_SHIELD_BONUS', value: 2 },
},
// IMPLEMENTACIÓN: hook en EFFECT_SHIELD — si carta tiene 'RETAIN' en keywords, value += 2.
// SINERGIA: SKILL_HOLOGRAPHIC_SHIELD (6→8), SKILL_REINFORCED_BULKHEAD (5→7),
// SKILL_KINETIC_BARRIER (12→14). Top tier para Fortaleza.
// ARQUETIPO: Fortaleza.

REL_BULWARK_HEART: {
    id: 'REL_BULWARK_HEART', name: 'Corazón Baluarte', rarity: 'Boss', icon: '💠',
    description: 'Si terminas un combate sin recibir daño al casco, repara 5 de Casco al iniciar el siguiente.',
    flavorText: '"Los intactos heredan las estrellas."',
    trigger: 'COMBAT_END_VICTORY', effect: { kind: 'FLAWLESS_REPAIR', value: 5 },
},
// IMPLEMENTACIÓN: trackear hullDamageTakenThisCombat en combatState. En COMBAT_END_VICTORY,
// si === 0, setear flag en playerState; al inicio del siguiente combate (COMBAT_START), reparar 5
// hull y limpiar flag. Premia la calidad de juego defensivo perfecto.
// ARQUETIPO: Fortaleza.
```

### 2.3 Sabotaje

```ts
REL_SABOTAGE_KIT: {
    id: 'REL_SABOTAGE_KIT', name: 'Kit de Sabotaje', rarity: 'Uncommon', icon: '🔧',
    description: 'La Brecha en Casco que aplicas tiene 1 stack adicional.',
    flavorText: '"Una grieta bien colocada vale por mil disparos."',
    trigger: 'PASSIVE', effect: { kind: 'HULL_BREACH_BONUS_STACK', value: 1 },
},
// IMPLEMENTACIÓN: al aplicar HULL_BREACH, sumar +1 al stack inicial.
// SINERGIA con multi-hit: HB 3 turnos (en lugar de 2) × multi-hit = aún más dmg amplificado.
// ARQUETIPO: Sabotaje.

REL_OVERRIDE_KEY: {
    id: 'REL_OVERRIDE_KEY', name: 'Llave de Anulación', rarity: 'Rare', icon: '🗝️',
    description: 'Al aplicar Sobrecalentamiento, también aplicas 1 de Atasco al enemigo.',
    flavorText: '"Si el sistema se calienta, no responde."',
    trigger: 'PASSIVE', effect: { kind: 'OVERHEAT_APPLIES_JAMMED', value: 1 },
},
// IMPLEMENTACIÓN: hook en aplicación de OVERHEAT. Después del apply, encolar APPLY_STATUS
// JAMMED 1 al mismo target. Genera lockdown agresivo.
// ARQUETIPO: Sabotaje. SINERGIA: SKILL_SYSTEM_HACK, SKILL_OVERHEAT, SKILL_OVERLOAD_VIRUS.

REL_CHRONOMETER: {
    id: 'REL_CHRONOMETER', name: 'Cronómetro Cuántico', rarity: 'Boss', icon: '⏱️',
    description: 'Cada vez que infliges multi-hit, el último impacto recibe +50% de daño.',
    flavorText: '"El tiempo se dobla en el último latido."',
    trigger: 'PASSIVE', effect: { kind: 'MULTIHIT_LAST_BONUS', value: 50 },
},
// IMPLEMENTACIÓN: en el resolver de DEAL_DAMAGE con hits>1, en la iteración final (hitIndex === hits-1),
// multiplicar damage × 1.5 antes de aplicar HULL_BREACH. Apila multiplicativamente con HB.
// SINERGIA brutal: ATTACK_PRECISION_VOLLEY (2 dmg × 4) → último hit = 3 dmg. Con HB y CHRONOMETER:
// 2+2+2+(3×1.5) = 10.5 → ~10 dmg. Sigue siendo competitivo, no roto.
// ARQUETIPO: Sabotaje.
```

### 2.4 Oportunistas

```ts
REL_SCAVENGER_DRONE: {
    id: 'REL_SCAVENGER_DRONE', name: 'Dron Carroñero', rarity: 'Uncommon', icon: '🛸',
    description: 'Al exiliar una carta durante combate, ganas 1 crédito.',
    flavorText: '"Reciclar es supervivencia."',
    trigger: 'PASSIVE', effect: { kind: 'EXILE_GAINS_CREDIT', value: 1 },
},
// IMPLEMENTACIÓN: hook en cualquier movimiento a exilePile (EXHAUST, ETHEREAL auto-exile,
// HEAL_HULL_AND_EXILE). Suma 1 credit a combatant.credits del jugador.
// CROSS-ARCHETYPE: triggers en BASE_REPARACION01, SKILL_OVERCHARGE, SKILL_TARGETED_EMP, todos
// los Powers, ATTACK_PHANTOM_STRIKE, CURSE_DEAD_WEIGHT. Mazo con muchas exhaust = +5-10 cred/combate.

REL_VOID_LEDGER: {
    id: 'REL_VOID_LEDGER', name: 'Libro Mayor del Vacío', rarity: 'Rare', icon: '📒',
    description: 'Cada 3 cartas jugadas en un mismo turno, roba 1 carta.',
    flavorText: '"El vacío lleva la cuenta. Siempre."',
    trigger: 'CARD_PLAYED_ATTACK', effect: { kind: 'EVERY_3_PLAYS_DRAW', value: 3 },
},
// IMPLEMENTACIÓN: contador cardsPlayedThisTurn. Trigger debería ser 'CARD_PLAYED_ANY' realmente,
// pero como CARD_PLAYED_ATTACK ya existe, opciones:
// (a) extender trigger types con 'CARD_PLAYED_ANY' (recomendado), o
// (b) usar PASSIVE y revisar tras cada play en el handler.
// Cada vez que cardsPlayedThisTurn % 3 === 0, encolar DRAW_CARDS 1. Reset en TURN_END.
// SINERGIA: ENERGY_1, SKILL_FUEL_REROUTE, POWER_QUANTUM_BATTERY — turnos largos = más draws.
```

### 2.5 Bonus Boss (compensa la asimetría)

```ts
REL_GHOST_PROTOCOL_RELIC: {
    id: 'REL_GHOST_PROTOCOL_RELIC', name: 'Protocolo Espectral', rarity: 'Boss', icon: '👤',
    description: 'Las cartas Etéreas no se exilian al fin de turno; vuelven al mazo.',
    flavorText: '"Lo que no puedes atrapar, te encuentra de nuevo."',
    trigger: 'PASSIVE', effect: { kind: 'ETHEREAL_RECYCLE' },
},
// IMPLEMENTACIÓN: en el handler de end-of-turn que normalmente mueve ETHEREAL a exilePile,
// si esta reliquia activa, mover a discardPile en su lugar.
// SINERGIA brutal: ATTACK_PHANTOM_STRIKE (10 dmg/1E ETHEREAL), ATTACK_CHAIN_DISCHARGE (9 dmg/1E
// ETHEREAL multi-hit), CURSE_DEAD_WEIGHT (ahora vuelve y nunca se va — penaliza). Counterplay
// claro: las curses ETHEREAL ya no son tan inofensivas. Riesgo/recompensa.
// CROSS-ARCHETYPE pero favorece Quemador (Phantom Strike combinable) y Sabotaje (Chain Discharge).
```

---

## 3. SYNERGY MAP — Combos Clave

| Combo | Output | Notas |
|---|---|---|
| `ATTACK_PYROCLASM` × `REL_ION_CAPACITOR` × `REL_PYRO_INJECTOR` | 5 dmg + (3+1)×2 = 8 BURN = 36 dmg DoT total | Quemador peak. Una sola carta resuelve casi cualquier élite. |
| `SKILL_CASCADE_IGNITION` × `REL_ION_CAPACITOR` | 8 BURN = 36 dmg DoT (1E) | Burst DoT más barato del juego. Necesita supervivencia. |
| `ATTACK_PLASMA_LANCE` × `REL_PLASMA_REGULATOR` × `REL_ION_CAPACITOR` (si extiende a PL) | 8 dmg + 4 PL = 18 dmg total | Top damage por 2E. |
| `REL_FUSION_CORE` × `REL_HEGEMONY_RELIC` × `POWER_HEAT_SINK_FAILURE` | 3 BURN/turn pasivos sin gastar cartas | Mazo "incendia y espera". |
| `SKILL_KINETIC_BARRIER` × `REL_DEFLECTOR_ARRAY` × `ATTACK_SHIELD_BASH` | 14 shield retenido → 8 dmg al swing | Tanque que pega duro. |
| `POWER_REGENERATION_FIELD` × `REL_AEGIS_PROTOCOL` × `REL_BULWARK_HEART` | 3-5 hull/turn + 2 extra + 5 entre combates | Inmortal en runs largas. |
| `SKILL_GHOST_PROTOCOL` × `REL_PHANTOM_DRIVE` (ya existe) | Stealth salta ataque + redirect del próximo a shields | Doble defensa total. |
| `SKILL_OVERLOAD_VIRUS` × `ATTACK_PRECISION_VOLLEY` × `REL_CHRONOMETER` | HB×3 + Overheat×3, luego 4 hits × HB × último hit ×1.5 | Combo Sabotaje signature. |
| `SKILL_TARGET_PAINTER` × cualquier multi-hit siguiente turno | 0E setup + draw, luego golpe amplificado | Tempo perfecto. |
| `REL_OVERRIDE_KEY` × `SKILL_OVERLOAD_VIRUS` | 3 HB + 3 Overheat + 1 JAMMED en una carta | Lockdown completo del enemigo. |
| `ATTACK_VOLCANIC_BARRAGE` × `REL_CHRONOMETER` × HB | 4+4+(5×1.5) = 11 dmg pre-HB; ×1.5 HB = 16.5 → 16 dmg | Boss killer. |
| `SKILL_CARGO_DUMP` × `POWER_QUANTUM_BATTERY` × `REL_VOID_LEDGER` | 0E cycle 3 cartas, gana 1E, cuenta para el contador | Engine ciclando. |
| `REL_GHOST_PROTOCOL_RELIC` × `ATTACK_PHANTOM_STRIKE` repetido | 10 dmg/1E, vuelve al mazo, dispara otra vez | El combo más poderoso del set — Phantom Strike se vuelve permanente. |
| `REL_SCAVENGER_DRONE` × mazo con 6+ Exhaust | +6-10 créditos/combate | Economía indirecta para construir el mazo. |

### Anti-sinergias intencionales

- `REL_GHOST_PROTOCOL_RELIC` × `CURSE_DEAD_WEIGHT` — la curse Etérea vuelve al mazo permanentemente. Penalización real para no convertir la reliquia Boss en gratis.
- `POWER_HEAT_SINK_FAILURE` × `REL_PHANTOM_DRIVE` — quemar tu Power exhausta tu slot defensivo. Los Powers compiten por slots del primer turno.
- `SKILL_GHOST_PROTOCOL` × intent enemigo no-ATTACK — el Stealth se gasta sin valor si el enemigo iba a defender/buffear. Lectura del intent es clave.

---

## 4. Nuevos `effectBase` y `effect.kind` requeridos

### Para `combatEngine.ts` (handlers de cartas):
| effectBase | Comportamiento |
|---|---|
| `EFFECT_DRAW_2` | DRAW_CARDS 2 |
| `EFFECT_ENERGY_GAIN` | GAIN_ENERGY value |
| `EFFECT_REPAIR_AND_SHIELD` | REPAIR_HULL value + RECHARGE_SHIELD 3 |
| `EFFECT_DAMAGE_FROM_SHIELD` | DEAL_DAMAGE = min(self.shield, value) |
| `EFFECT_HULL_BREACH_AND_DRAW` | APPLY_STATUS HULL_BREACH value + DRAW_CARDS 1 |
| `EFFECT_DAMAGE_AND_DOUBLE_DEBUFF` | DEAL_DAMAGE + APPLY_STATUS HULL_BREACH 2 + APPLY_STATUS OVERHEAT 2 |
| `EFFECT_DOUBLE_DEBUFF` | APPLY_STATUS HULL_BREACH value + APPLY_STATUS OVERHEAT value |
| `EFFECT_POWER_TURN_START_BURN` | Registra power en combatant.powers[]; dispara cada TURN_START |
| `EFFECT_POWER_TURN_END_REPAIR` | Registra power; dispara cada TURN_END |
| `EFFECT_POWER_FREE_CARD_ENERGY` | Registra power; dispara una vez por turno al jugar carta cost===0 |

### Para `relicEngine.ts` (nuevos effect.kind):
| kind | Hook |
|---|---|
| `TURN_START_APPLY_BURN` | `computeRelicTurnStartEffects` — encola APPLY_STATUS BURN al enemigo |
| `BURN_ATTACK_BONUS_STACK` | `computeRelicCardDmgBonus` extendido — al jugar Attack con BURN, +1 stack antes de ION_CAPACITOR |
| `PLASMA_LEAK_EXTRA_TURN` | Hook en aplicación PL — value += 1 |
| `HIGH_SHIELD_REPAIR` | `computeRelicTurnEndEffects` extendido — si shield>=10, encola REPAIR_HULL |
| `RETAIN_SHIELD_BONUS` | Hook en EFFECT_SHIELD — si keywords.includes('RETAIN'), value += 2 |
| `FLAWLESS_REPAIR` | Track hullDmgThisCombat; en victory si 0, set flag; en next COMBAT_START reparar |
| `HULL_BREACH_BONUS_STACK` | Hook en APPLY_STATUS HULL_BREACH — value += 1 |
| `OVERHEAT_APPLIES_JAMMED` | Hook en APPLY_STATUS OVERHEAT — encolar APPLY_STATUS JAMMED 1 al mismo target |
| `MULTIHIT_LAST_BONUS` | En DEAL_DAMAGE con hits>1, último hit × 1.5 |
| `EXILE_GAINS_CREDIT` | Hook en cualquier add a exilePile — combatant.credits += 1 |
| `EVERY_3_PLAYS_DRAW` | Contador cardsPlayedThisTurn; cada múltiplo de 3, encolar DRAW_CARDS 1 |
| `ETHEREAL_RECYCLE` | En end-of-turn ethereal cleanup, mover a discardPile en lugar de exilePile |

### Cambios mínimos al motor para soportar todo el set:
1. Añadir contador `cardsPlayedThisTurn` en `Combatant` (reset en TURN_START).
2. Añadir array `powers: { kind: string, value?: number, perTurnUsed?: boolean }[]` en `Combatant`.
3. Añadir tracker `hullDmgThisCombat` en `CombatState`.
4. Añadir trigger `'CARD_PLAYED_ANY'` a `RelicTrigger` (o reusar PASSIVE con polling).
5. Implementar 10 nuevos `effectBase` y 12 nuevos `effect.kind`.

Estimación: ~250 LOC en `combatEngine.ts` + ~150 LOC en `relicEngine.ts`.

---

## 5. Notas finales de diseño

**Balance global:**
- Cartas Common: precio 14-18, valor ~5-8 dmg o 5-8 shield.
- Cartas Uncommon: precio 18-26, valor +1-2 sobre Common o utilidad significativa.
- Cartas Rare: precio 24-38, efectos únicos, sinergias múltiples.
- Powers (todos Rare) cuestan 2E y exhaust — invertir 1 turno para ganar 4+ turnos de valor.
- Curses precio 0 (no se compran).

**Distribución de rareza:** 8 Common / 10 Uncommon / 7 Rare / 1 Curse — proporcional al juego base.

**Distribución de coste:** 4×0E / 14×1E / 7×2E / 1×3E — sesgo a 1E para acelerar runs.

**Facciones:** Tecno-Gremio (3), Hacktivistas (5), Mercenarios (3), Comerciante (1), Academia (2), Neutral (8). Soporta arcos narrativos de Eventos por facción.

**Reliquias:** 3 Common (0), 4 Uncommon (3), 4 Rare (3), 3 Boss (1) — distribución idéntica al juego base, con sesgo Boss para premiar runs largas.

**Por qué los 3 arquetipos son distintos (no overlap):**
- Quemador genera valor con tiempo (DoT) — pierde contra OVERHEAT y enemigos rápidos.
- Fortaleza intercambia daño bajo por longevidad — pierde contra enemigos con multi-hit/burst.
- Sabotaje pivota en debuff → burst — pierde contra enemigos con HP bajo (no compensa setup).

**Edge cases considerados:**
- `ETHEREAL + INNATE`: ATTACK_CHAIN_DISCHARGE drawable T1 vía REL_HEGEMONY_RELIC; si no se puede pagar 1E, se exilia. Tensión real de mulligan.
- `Multi-hit × HULL_BREACH`: cada hit dispara HB +50% independientemente. Confirmado en spec.
- `Power exhaust + REL_GHOST_PROTOCOL_RELIC`: los Powers son Skills con EXHAUST, no Ethereal, así que la reliquia no los recicla. Diseño intencional.
- `STEALTH vs enemigo con intent DEFEND`: el Stealth se gasta en una acción no-ataque. Documentar al jugador en tooltip.
- `REL_FUSION_CORE + REL_PYRO_INJECTOR`: ambas dan +1 BURN — ¿el Injector solo cuenta para Attack cards? Sí — su trigger es CARD_PLAYED_ATTACK, no aplica al BURN pasivo del Core.

**Posible expansión futura:** mecánica `OVERCHARGE` solo tiene una carta (SKILL_OVERCHARGE base). El set actual no añade más cartas de Overcharge intencionalmente — queda como hueco diseñable para una "Expansión 02: Sobrecarga" enfocada en escalada de daño bruto.

---

## 6. DISEÑO VISUAL — Prompts para generación de imágenes

> **Estilo base compartido por todas las cartas:**
> `sci-fi digital painting, space opera aesthetic, dark background, cinematic lighting, high detail, retro-futuristic, gritty military sci-fi, card game art portrait orientation 2:3 ratio`
>
> Añade el prompt específico de cada carta al final del estilo base.
> Herramientas recomendadas: Midjourney v6, DALL-E 3, Flux.1-dev, Leonardo.ai (preset "Cinematic")

---

### 6.1 Cartas — Arquetipo QUEMADOR 🔥

---

**ATTACK_INCENDIARY_SALVO — "Salva Incendiaria"**
```
twin plasma cannons mounted on a sleek warship firing simultaneously, streaks of orange and white fire cutting through deep space, explosion trails with burning particles, dark void background with distant nebula, close-up dramatic angle from below the cannon muzzles, lens flare, volumetric smoke
```
*Paleta:* naranja encendido, blanco plasma, negro espacio
*Encuadre:* plano medio — los cañones ocupan 60% del frame

---

**ATTACK_PYROCLASM — "Piroclasmo"**
```
massive volcanic eruption in space, a dying planet cracking open with rivers of magma, seen from a starship viewport, silhouette of spacecraft in foreground, crimson and molten gold lava rivers against black void, ash clouds forming skull-like shapes, extreme wide shot
```
*Paleta:* carmesí, oro fundido, negro profundo
*Encuadre:* gran angular — planeta ocupa fondo, nave en silueta frontal

---

**ATTACK_OVERHEATING_BEAM — "Rayo Sobrecargado"**
```
a single overloaded energy beam weapon glowing bright teal and white, weapon barrel visibly warping from heat, plasma venting from cracks in the chassis, tight close-up of the weapon housing, sparks and electricity, industrial sci-fi aesthetic, danger warning lights in red
```
*Paleta:* cian eléctrico, blanco brillante, rojo advertencia
*Encuadre:* close-up del cañón recalentado

---

**SKILL_CASCADE_IGNITION — "Ignición en Cascada"**
```
chain reaction of fire explosions spreading across an enemy ship's hull, each blast triggering the next in a cascade, viewed from outside in space, the ship outlined in growing flames, abstract energy tendrils connecting each explosion point, dramatic side view
```
*Paleta:* ámbar, naranja, humo negro
*Encuadre:* vista lateral — cascada de explosiones de izq a der

---

**ATTACK_PLASMA_LANCE — "Lanza de Plasma"**
```
a razor-thin plasma lance beam piercing through the hull of a spacecraft, the beam so hot it leaves a glowing molten trail, seen from a first-person cockpit perspective through the targeting reticle, the enemy ship visible in the distance with the beam connecting both ships
```
*Paleta:* azul plasma, blanco cegador, metal fundido naranja
*Encuadre:* perspectiva cabina/retícula — eje central del frame

---

**POWER_HEAT_SINK_FAILURE — "Falla de Disipadores"**
```
a starship reactor core overheating, cooling vanes melting and bending, heat shimmers distorting the air around glowing red-hot metal components, engineer in a spacesuit backing away, warning lights flashing amber, steam and smoke venting from pressure valves, industrial closeup
```
*Paleta:* rojo peligro, naranja metal caliente, gris acero, vapor blanco
*Encuadre:* plano medio — reactor roto en primer plano, ingeniero en fondo

---

**ATTACK_VOLCANIC_BARRAGE — "Bombardeo Volcánico"**
```
a warship firing three simultaneous volleys of incendiary missiles, each missile leaving a spiraling fire trail, target ship engulfed in overlapping explosions, epic wide shot in space with a lava planet in background, military sci-fi, explosive debris field
```
*Paleta:* naranja explosión, rojo profundo, negro espacio
*Encuadre:* gran angular — 3 trayectorias de misiles visibles simultáneamente

---

**CURSE_PLASMA_BLEED — "Maldición: Hemorragia de Plasma"**
```
a glowing plasma wound in a spaceship's hull that refuses to close, neon green plasma slowly leaking and evaporating into space, the ship's metal corroded and discolored around the breach, eerie green light illuminating the surrounding damage, ominous atmosphere
```
*Paleta:* verde veneno, negro corrosión, metal oxidado marrón
*Encuadre:* close-up de la brecha que sangra plasma — inquietante

---

### 6.2 Cartas — Arquetipo FORTALEZA 🛡️

---

**SKILL_BULWARK_PLATING — "Blindaje Reforzado"**
```
massive reinforced armor panels being welded onto a dreadnought-class starship by mechanical arms, glowing weld lines, fresh titanium plating reflecting starlight, dramatic low angle looking up at the armored hull, scale of the ship conveying massive protection, industrial beauty
```
*Paleta:* plateado titanio, azul frío estelar, destellos de soldadura dorada
*Encuadre:* plano bajo contrapicado — magnitud de la armadura

---

**SKILL_REINFORCED_BULKHEAD — "Mamparo Reforzado"**
```
interior of a warship corridor with blast doors slamming shut, emergency red lighting, a lone soldier pressing their back against the sealed bulkhead, sparks flying from the door locks engaging, sense of absolute protection from what lies beyond, cinematic tension
```
*Paleta:* rojo emergencia, gris acero, sombras profundas
*Encuadre:* perspectiva pasillo — puerta blindada al fondo

---

**SKILL_EMERGENCY_PATCH — "Parche de Emergencia"**
```
a space engineer performing emergency hull repair mid-combat, nano-repair foam expanding over a breach, the ship still under fire in the background, engineer focused and calm despite chaos, mix of repair tools and shield generators active simultaneously, gritty realism
```
*Paleta:* blanco espuma reparadora, azul escudo activo, explosiones naranja en fondo
*Encuadre:* plano medio — ingeniero en primer plano, batalla en fondo

---

**SKILL_GHOST_PROTOCOL — "Protocolo Fantasma"**
```
a spaceship activating a holographic ghost image of itself as a decoy, the real ship fading into transparency next to a perfect holographic duplicate, enemy weapons fire passes through the ghost image harmlessly, split composition showing both the real and fake ship
```
*Paleta:* azul holográfico translúcido, negro espacio, destellos plateados
*Encuadre:* plano dividido — nave real invisible / decoy brillante

---

**SKILL_KINETIC_BARRIER — "Barrera Cinética"**
```
a hexagonal kinetic energy barrier surrounding a starship, each hex panel glowing brilliant electric blue, incoming projectiles shattering and deflecting off the barrier surface, the ship at the center serene and untouched, energy ripples on impact points, dramatic closeup of the barrier surface
```
*Paleta:* azul eléctrico intenso, blanco impacto, negro fondo
*Encuadre:* close-up de la barrera — hexágonos brillantes, proyectiles fragmentándose

---

**ATTACK_SHIELD_BASH — "Embestida de Escudos"**
```
a heavily shielded warship ramming into an enemy vessel, the collision moment captured at impact, the attacker's kinetic barrier glowing brilliantly at the point of contact, the enemy ship crumpling and sparking, debris field expanding from impact, side-on dramatic angle
```
*Paleta:* azul escudo brillante, naranja metal destruido, blanco impacto
*Encuadre:* vista lateral — momento exacto del impacto

---

**POWER_REGENERATION_FIELD — "Campo de Regeneración"**
```
a golden energy field slowly repairing a starship's battle damage, nanobots visible as glowing motes reweaving torn hull panels, the field pulsing with warm light, damaged areas visibly healing in real-time, contrast between glowing restoration and surrounding dark space, hopeful atmosphere
```
*Paleta:* dorado cálido, blanco luz regenerativa, gris metal dañado
*Encuadre:* plano medio nave — nanobots dorados fluyendo sobre casco dañado

---

### 6.3 Cartas — Arquetipo SABOTAJE 🔧

---

**SKILL_SYSTEM_HACK — "Hackeo de Sistemas"**
```
a hacker's holographic interface projected in the cockpit, lines of code cascading over a 3D wireframe model of an enemy ship, critical system nodes highlighted in red as they're compromised one by one, the hacker's reflection visible in the screen, green and amber data streams
```
*Paleta:* verde terminal, ámbar datos, negro profundo, rojo comprometido
*Encuadre:* plano medio — pantalla holográfica ocupa 70% del frame

---

**SKILL_DISRUPTOR_PULSE — "Pulso Disruptor"**
```
an electromagnetic pulse detonating as a visible shockwave ring expanding from a device, enemy ship in the background with systems going dark one by one, weapon ports jamming closed, electrical sparks as circuits short out, EMP ring rendered as concentric waves of distortion
```
*Paleta:* blanco EMP cegador, negro sistemas muertos, azul distorsión
*Encuadre:* gran angular — onda EMP como círculo expansivo, nave afectada en fondo

---

**ATTACK_PRECISION_VOLLEY — "Salva de Precisión"**
```
four precisely targeted laser shots hitting different critical weak points on an enemy ship simultaneously, each beam marked by a glowing targeting reticle, the ship's armor fracturing at each hit point, tactical overlay lines showing the calculated trajectories, cold surgical aesthetic
```
*Paleta:* rojo reticle, azul láser frío, metal fracturado gris
*Encuadre:* plano medio — nave enemiga con 4 impactos marcados tácticamente

---

**SKILL_TARGET_PAINTER — "Marcador Láser"**
```
a red targeting laser designating an enemy ship's hull weakness, the beam painting a glowing red X over a structural fault line, seen through a sniper scope overlay, depth of field blur on foreground, sharp enemy ship in crosshairs, hunter and prey tension
```
*Paleta:* rojo sangre designador, negro scope, metal gris objetivo
*Encuadre:* vista de mira/scope — punto rojo sobre nave enemiga

---

**ATTACK_SABOTAGE_STRIKE — "Golpe Saboteador"**
```
a saboteur's drone planting multiple timed charges on an enemy ship's hull, some already detonating while others are still being placed, simultaneous explosions creating a chain of damage across the ship's surface, space sabotage operation mid-execution, chaotic yet precise
```
*Paleta:* naranja explosión, gris humo, rojo marcadores de brecha
*Encuadre:* vista exterior — múltiples cargas detonando a lo largo del casco enemigo

---

**SKILL_OVERLOAD_VIRUS — "Virus de Sobrecarga"**
```
a digital virus visualized as glowing red fractal tendrils spreading through circuit boards, corrupting system after system, viewed inside the enemy ship's mainframe core, warning alerts everywhere, the virus consuming processing nodes represented as crystalline structures shattering
```
*Paleta:* rojo virus, negro sistema muerto, cristal azul rompiéndose
*Encuadre:* perspectiva interna — mainframe del enemigo siendo destruido

---

**ATTACK_CHAIN_DISCHARGE — "Descarga en Cadena"**
```
three consecutive lightning-fast electrical discharges jumping from a gun barrel in rapid succession, each bolt a slightly different arc, the weapon smoking from the rapid fire, the shots visible as overlapping electric arcs, speed lines suggesting extreme velocity, reactive and electric
```
*Paleta:* azul eléctrico, blanco destello, gris humo arma
*Encuadre:* close-up del arma — tres disparos superpuestos en exposición múltiple

---

### 6.4 Cartas — OPORTUNISTA ✦

---

**SKILL_CARGO_DUMP — "Descarga de Carga"**
```
cargo bay doors blasting open on a freighter ship, crates and supplies tumbling out into space in slow motion, each crate bursting open revealing useful equipment, inside the bay a crew member frantically sorting and grabbing key items, chaotic but purposeful
```
*Paleta:* naranja interior nave, azul espacio exterior, blanco destellos metálicos
*Encuadre:* perspectiva puerta de carga abierta — espacio al fondo, cajas flotando

---

**POWER_QUANTUM_BATTERY — "Batería Cuántica"**
```
a glowing quantum battery core pulsing with impossible energy, reality slightly distorted around it, the battery connected to a starship's power grid by crystalline conduits that glow brighter with each zero-cost action, scientific wonder aesthetic, physics-defying light patterns
```
*Paleta:* violeta cuántico, blanco energía pura, azul conduits
*Encuadre:* close-up del núcleo cuántico — distorsión de realidad visible

---

**SKILL_FUEL_REROUTE — "Redirección de Combustible"**
```
a ship engineer manually rerouting fuel lines, bypassing the safety governors, energy gauges climbing into the red, pipes glowing from the increased throughput, the engineer's face lit by the intense energy glow, dangerous and calculated decision, industrial urgency
```
*Paleta:* naranja combustible, rojo peligro, amarillo energía
*Encuadre:* plano medio — ingeniero con tuberías de energía brillando alrededor

---

**CURSE_DEAD_WEIGHT — "Maldición: Peso Muerto"**
```
a massive anchor made of dark matter floating in space, its chains wrapped around a small starship, the ship straining to move, the anchor glowing with an ominous dark purple energy that seems to absorb light, the crew visible in the cockpit looking desperate
```
*Paleta:* púrpura oscuro maldición, negro vacío, gris nave atrapada
*Encuadre:* gran angular — ancla gigante dominando el frame, nave pequeña atrapada

---

### 6.5 Reliquias — Diseño Visual

> **Estilo base para reliquias:**
> `artifact item card art, isolated object on dark velvet background, dramatic spotlight lighting, photorealistic render, intricate sci-fi design, glowing energy elements, museum display aesthetic, 1:1 square ratio`

---

**REL_FUSION_CORE 🔥 — "Núcleo de Fusión"**
```
a compact spherical fusion reactor core the size of a fist, cracked exterior showing molten plasma contained within, radiating intense orange heat, resting on a scorched metal platform, warning labels in an alien language partially melted off, perpetually burning
```
*Paleta:* naranja plasma, negro exterior quemado, blanco núcleo interior

---

**REL_PYRO_INJECTOR 💥 — "Inyector Pirotécnico"**
```
a custom weapon modification — a chrome injector device with glowing red fuel chambers, designed to be attached to any energy weapon, the fuel visibly burning inside transparent tubes, modified by a weapons expert with hand-etched kill marks on the casing
```
*Paleta:* cromado, rojo combustible brillante, negro táctico

---

**REL_PLASMA_REGULATOR 🌀 — "Regulador de Plasma"**
```
a coiled plasma regulation device, spiral of glowing teal tubes containing pressurized plasma, the pressure gauges showing maximum sustainable levels, intricate engineering visible through transparent panels, a device that makes dangerous energy last longer
```
*Paleta:* cian plasma, plateado dispositivo, transparente tubos

---

**REL_AEGIS_PROTOCOL 🛡️ — "Protocolo Égida"**
```
a shield generator chip the size of a playing card, circuit patterns forming a heraldic shield design, when powered the circuit lines glow brilliant blue, a self-contained defensive AI module with holographic shield projectors in each corner, military grade certification stamps
```
*Paleta:* azul escudo brillante, dorado circuitos, negro fondo chip

---

**REL_DEFLECTOR_ARRAY 🔷 — "Matriz Deflectora"**
```
a hexagonal array of miniature deflector emitters arranged in a honeycomb pattern, each emitter projecting a tiny blue shield field, the combined fields overlapping to create layered protection, mounted on a compact frame with a power cell glowing at the center
```
*Paleta:* azul deflector, plata estructura, blanco campos solapados

---

**REL_BULWARK_HEART 💠 — "Corazón Baluarte"**
```
a crystalline heart-shaped core pulsing with deep blue energy, encased in thick military-grade armor plating, the crystal visible through a viewport in the armor, inscribed with the names of battles survived, cracks in the armor repaired and reinforced many times over
```
*Paleta:* azul cristal profundo, gris armadura battle-worn, dorado inscripciones

---

**REL_SABOTAGE_KIT 🔧 — "Kit de Sabotaje"**
```
a worn leather and metal tool case opened to reveal precisely arranged sabotage tools, each in its custom slot, one slot empty (recently used), the tools showing signs of heavy use, blueprints of enemy ship schematics tucked in the lid, a spy's most valuable possession
```
*Paleta:* marrón cuero gastado, plateado metal herramientas, negro táctico

---

**REL_OVERRIDE_KEY 🗝️ — "Llave de Anulación"**
```
an ornate electronic master key with a glowing central crystal, the key radiating magnetic interference patterns visible as distortion waves, intricate circuitry etched into the key's surface tells the history of every system it has unlocked, forbidden technology aesthetic
```
*Paleta:* dorado clave, violeta energía interferencia, negro misterio

---

**REL_CHRONOMETER ⏱️ — "Cronómetro Cuántico"**
```
a quantum stopwatch with multiple overlapping clock faces showing different times simultaneously, the hands moving in impossible ways that only make sense when you know the secret, the casing transparent showing quantum entangled gears, time itself bending around the device
```
*Paleta:* plateado reloj, azul cuántico, destellos temporales dorados

---

**REL_SCAVENGER_DRONE 🛸 — "Dron Carroñero"**
```
a small autonomous scavenger drone hovering above a battlefield debris field, magnetic collection arms extended, glowing sensors scanning for valuable salvage, its body assembled from parts of a dozen different ships, a patchwork masterpiece of opportunistic engineering
```
*Paleta:* gris chatarra, azul sensores, naranja destellos salvage

---

**REL_VOID_LEDGER 📒 — "Libro Mayor del Vacío"**
```
an ancient-looking ledger book with a cover made of dark matter compressed into solid form, the pages made of light rather than paper, writing itself appears as the reader thinks about debts owed, floating in zero gravity with pages turning on their own, mystical accounting
```
*Paleta:* negro vacío profundo, blanco luz páginas, dorado escritura automática

---

**REL_GHOST_PROTOCOL_RELIC 👤 — "Protocolo Espectral"**
```
a neural interface chip that appears translucent and slightly out of phase with reality, when viewed from different angles different ghost images of the same chip appear, a quantum device that exists in multiple states simultaneously, the casing inscribed with a ghost ship silhouette
```
*Paleta:* translúcido fantasmal azul, plata chip, sombras superpuestas

---

### 6.6 Guía rápida de prompts por herramienta

| Herramienta | Ajuste de prompt |
|---|---|
| **Midjourney v6** | Añadir al final: `--ar 2:3 --style raw --v 6` (cartas) / `--ar 1:1 --style raw --v 6` (reliquias) |
| **DALL-E 3** | Añadir al inicio: `Digital painting in a dark sci-fi card game art style.` |
| **Flux.1-dev** | Añadir al inicio: `card game illustration, dark science fiction,` — usar LoRA de estilo si disponible |
| **Leonardo.ai** | Preset: "Cinematic" + "Dark Fantasy" — Guidance 7, Steps 30 |
| **Stable Diffusion XL** | Negative prompt: `cartoon, anime, bright colors, cheerful, watercolor, sketch` |

**Negative prompt universal (aplica a todas):**
```
cartoon, anime, chibi, watercolor, sketch, bright cheerful colors, fantasy medieval, magic wands, low quality, blurry, text, watermark, signature
```
