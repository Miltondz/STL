# Navegador Galáctico Procedural

Roguelike de exploración espacial y combate por turnos con construcción de mazos. Inspirado en FTL y Slay the Spire. Viaja por sectores generados proceduralmente, libra combates tácticos, gestiona tripulación y reliquias, y derrota a tres jefes para completar la galaxia.

---

## Características

### Estructura de juego
- **3 sectores** con progresión de dificultad creciente y jefe al final de cada uno.
- Mapa procedural por sector — más élites y peligros en sectores avanzados, menos descanso.
- Nodos: Combate, Élite, Mini-Jefe, Descanso, Encuentro, Peligro, Tienda, Evento Especial, Jefe.
- **3 dificultades**: Fácil / Normal / Difícil — escalan HP y daño de enemigos.
- Pantalla de fin de run con estadísticas y logros desbloqueados.

### Combate
- Combate por turnos con mano de cartas, coste de energía y descarte automático.
- **Intenciones del enemigo 100% honestas** — el valor mostrado es exactamente el daño recibido.
- **Fase 2 de jefes** — al 50% de HP activan un patrón más agresivo con ataques pesados (HEAVY_ATTACK) y ataques de interferencia (DEBUFF). El jugador ve el aviso al inicio del turno antes de reaccionar.
  - Destructor: más ataques pesados encadenados.
  - Dreadnought: frenesí puro, HEAVY_ATTACK predominante.
  - Nexo IA: alterna interferencia de sistemas (JAMMED + OVERHEAT al jugador) con ataques pesados.
- **Sistemas de nave** del enemigo: WEAPONS, SHIELDS, ENGINES, CREW, REACTOR — dañables. WEAPONS destruido = no ataca; SHIELDS destruido = no recarga escudos; destruir REACTOR = victoria inmediata.
- **Estados de alteración**: BURN, PLASMA_LEAK, JAMMED, HULL_BREACH, OVERHEAT, EMP, OVERCHARGE, STEALTH.
- Pre-combate con vista del enemigo antes de confirmar.
- Badges de nodo en el mapa para identificar tipo de encuentro de un vistazo.

### Cartas y arquetipos
- **Palabras clave**: EXHAUST, RETAIN, ETHEREAL, INNATE, UNPLAYABLE, BURN_CURSE.
- **Tripulación como cartas** (8 tipos): Artillero, Piloto, Ingeniero, Médico, Comandante, Saboteador, Comerciante, Psíquico — cada una aplica un bonus pasivo al ser jugada (EXHAUST).
- **4 arquetipos con cartas de payoff**:
  - 🔥 **Quemador** — acumula BURN para tick damage progresivo.
  - 🛡️ **Fortaleza** — escudo alto; `Muro Viviente` (EXHAUST): inflige daño igual a escudo actual sin límite.
  - 🔧 **Sabotaje** — debuffs acumulados; `Explotar Debilidades`: 2 dmg por pila de estado en el enemigo.
  - ✦ **Oportunista** — combo de cartas; `Golpe de Ímpetu`: 2 dmg por carta jugada este turno.
- Mejora y eliminación de cartas en tiendas y sitios de descanso.
- Multi-hit: hasta 4 impactos por carta, cada uno con sus propios cálculos de escudo y estados.

### Reliquias
- +20 reliquias con efectos únicos (daño extra, escudo, quemaduras, doble Incendio, créditos, dibujo de cartas, etc.).
- **Reliquia inicial al comenzar run** — en el Hangar se ofrecen 3 reliquias aleatorias (pool curado, sin Boss/Event) para elegir una antes de despegar. Da identidad al build desde el turno 1.
- Nodos Élite garantizan recompensa de reliquia.
- Strip de reliquias visible en combate con tooltip de efecto.

### Sitios de descanso
- Reparar casco (30% máx), Eliminar carta del mazo, Mejorar carta del mazo.

### Eventos narrativos
- Mazos de encuentro y peligro sin repeticiones por run.
- Requisitos por tripulantes, créditos o banderas narrativas; resultados probabilísticos.

### UX de combate
- **Preview de daño** en cartas de ataque de la mano (incluye bonus Artillero).
- **Banda de reliquias** en combate con tooltip nombre+efecto al pasar el cursor.
- **Flash Fase 2** — overlay rojo + sonido al activarse la fase 2 de un jefe.
- **Indicador "FASE 2 INMINENTE"** en el strip de intents próximos cuando el jefe ≤ 55% HP.
- **Hand-arc adaptativa** — el abanico de cartas se ajusta automáticamente para manos de 8+ cartas.
- Intents próximos del enemigo (2 acciones hacia adelante) con iconos de tipo.

### Logros
- 11 logros desbloqueables por run (primera victoria, sectores completados, sin daño, REACTOR destruido, etc.).
- Visibles en menú de pausa y pantalla de fin de run.

### Guardado
- Auto-save en fase IN_GAME con debounce 2s (localStorage, formato v2).
- Exportar / Importar partidas como JSON desde el menú de pausa.
- Pantalla inicial con opción "Continuar Partida".

---

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run preview
```

Tests:
```bash
npm test                    # Vitest interactivo
npm run test:run            # CI
npm run test:run -- services/saveManager.test.ts  # archivo único
```

Type-check:
```bash
npx tsc -p tsconfig.json --noEmit
```

---

## Arquitectura

**Stack:** React 19 + TypeScript + Vite + Tailwind. Sin router — `App.tsx` renderiza pantallas por `gamePhase`.

**Máquina de estados** (`GamePhase`):
```
START_SCREEN → HANGAR → IN_GAME → NODE_ACTION_PENDING
  → PRE_COMBAT → COMBAT → CARD_REWARD / RELIC_REWARD / LEVEL_UP
  → REST_SITE | SHOP | EVENT | SIMULATION_RESULT
  → SECTOR_COMPLETE → IN_GAME (nuevo sector)
  → GAME_OVER
```

**Capas:**
- `contexts/GameContext.tsx` — fuente de verdad única (jugador, mapa, combate, eventos). Auto-save en IN_GAME con debounce 2s.
- `hooks/useGameHandlers.ts` — todos los handlers de acción; llama a servicios y actualiza contexto.
- `services/` — lógica pura sin React:
  - `combatEngine.ts` — jugar cartas, daño, escudos, sistemas de nave, intents de enemigo, fase 2 de jefes.
  - `relicEngine.ts` — efectos de reliquias en combate, victoria, tienda y movimiento.
  - `statusEngine.ts` — tick y resolución de estados de alteración.
  - `mapGenerator.ts` — generación procedural por sector (`generateMap(sector)`).
  - `eventManager.ts` — mazos de encuentro/peligro, resolución de consecuencias.
  - `contentLoader.ts` — carga `public/data/content.json`, fallback a `data/` (hardcoded).
  - `saveManager.ts` — localStorage, formato v2, export/import JSON.
  - `shopManager.ts`, `rng.ts`, `logManager.ts`, `imageRegistry.ts`.
- `components/` — presentacionales; reciben props/callbacks.
- `data/` — catálogos locales de fallback (`cards.ts`, `enemies.ts`, `ships.ts`). Fusionados con JSON en `getAllCards()` — cartas hardcoded siempre disponibles aunque el JSON omita alguna.
- `types.ts` — todos los tipos de dominio (archivo único).
- `constants.ts` — colores de nodos, rareza, balance, logros, dificultades.

**Sistema de contenido:** Fuente principal `public/data/content.json`. `contentLoader` valida con Zod en `services/validationSchemas.ts`. Editor en `editor/index.html` (JS vanilla).

**CardInstance vs CardData:** `CardData` es la plantilla. `CardInstance` (con `instanceId` + `CardAffix` opcional) vive en el mazo del jugador.

**Fase 2 de jefes:** `Combatant.phase2Pattern` define el patrón alternativo. `setEnemyIntent` detecta HP ≤ 50% al inicio del turno del jugador, swapea `pattern`, resetea `patternIndex` y muestra el intent correcto antes de que el jefe actúe.

---

## Requisitos

- Node.js 18+
- npm 9+
