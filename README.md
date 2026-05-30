# Navegador Galáctico Procedural

Roguelike de exploración espacial y combate por turnos con construcción de mazos. Inspirado en FTL y Slay the Spire. Viaja por sectores generados proceduralmente, libra combates tácticos, gestiona tripulación y reliquias, y derrota a tres jefes para completar la galaxia.

---

## Características

### Estructura de juego
- **3 sectores** con progresión de dificultad y jefe al final de cada uno.
- Mapa procedural con nodos: Combate, Élite, Descanso, Encuentro, Peligro, Tienda, Jefe.
- **3 dificultades**: Fácil / Normal / Difícil — escalan HP y daño de enemigos.
- Pantalla de fin de run con estadísticas y logros desbloqueados.

### Combate
- Combate por turnos con mano de cartas, coste de energía y descarte automático.
- **Intenciones del enemigo** visibles (ataque/defensa/refuerzo/mixto).
- **Sistemas de nave** del enemigo: WEAPONS, SHIELDS, ENGINES, CREW, REACTOR — dañables e inutilizables; destruir REACTOR = victoria inmediata.
- **Estados de alteración**: BURN, JAMMED, HULL_BREACH, OVERHEAT, OVERCHARGE, REGENERATE, etc.
- Pre-combate con vista del enemigo antes de confirmar.

### Cartas y mazo
- **Palabras clave**: EXHAUST, RETAIN, ETHEREAL, INNATE, MULTI_HIT.
- **Tripulación como cartas** (8 tipos): Artillero, Piloto, Ingeniero, Científico, Comandante, Saboteador, Comerciante, Psíquico — cada una aplica un bonus pasivo para todo el combate al ser jugada (EXHAUST).
- Mejora de cartas en tiendas y sitios de descanso.
- Eliminación de cartas en sitios de descanso.

### Reliquias
- +15 reliquias con efectos únicos (daño extra, escudo, créditos, efectos al inicio de turno, etc.).
- Nodos Élite garantizan recompensa de reliquia.
- Tienda puede ofrecer una carta gratuita si tienes REL_SMUGGLER_CONTACT.

### Sitios de descanso
- Elegir entre: Reparar casco (30% máx), Eliminar carta del mazo, Mejorar carta del mazo.

### Eventos narrativos
- Mazos de encuentro y peligro sin repeticiones por run.
- Requisitos por tripulantes, créditos o banderas; resultados probabilísticos.

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
- `contexts/GameContext.tsx` — fuente de verdad única (jugador, mapa, combate, eventos). Auto-save en IN_GAME/PRE_COMBAT con debounce.
- `hooks/useGameHandlers.ts` — todos los handlers de acción; llama a servicios y actualiza contexto.
- `services/` — lógica pura sin React:
  - `combatEngine.ts` — jugar cartas, daño, escudos, sistemas de nave, turnos del enemigo.
  - `relicEngine.ts` — efectos de reliquias en combate, victoria, tienda y movimiento.
  - `statusEngine.ts` — tick y resolución de estados de alteración.
  - `mapGenerator.ts` — generación procedural de nodos y capas.
  - `eventManager.ts` — mazos de encuentro/peligro, resolución de consecuencias.
  - `contentLoader.ts` — carga `public/data/content.json`, fallback a `data/`.
  - `saveManager.ts` — localStorage, formato v2, export/import JSON.
  - `shopManager.ts`, `rng.ts`, `logManager.ts`, `imageRegistry.ts`.
- `components/` — presentacionales; reciben props/callbacks.
- `data/` — catálogos locales de fallback (`cards.ts`, `enemies.ts`, `ships.ts`).
- `types.ts` — todos los tipos de dominio (archivo único).
- `constants.ts` — colores de nodos, rareza, balance, logros, dificultades.

**Sistema de contenido:** Fuente principal `public/data/content.json`. `contentLoader` valida con Zod en `services/validationSchemas.ts`. Editor en `editor/index.html` (JS vanilla).

**CardInstance vs CardData:** `CardData` es la plantilla. `CardInstance` (con `instanceId` + `CardAffix` opcional) vive en el mazo del jugador.

---

## Requisitos

- Node.js 18+
- npm 9+
