# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands (npm)
- Install: `npm install` (Node 18+, npm 9+)
- Dev server: `npm run dev` (Vite; opens http://localhost:5173)
- Build: `npm run build`
- Preview built app: `npm run preview`
- Tests (all): `npm test`
- Tests (UI): `npm run test:ui`
- Tests (CI mode): `npm run test:run`
- Run a single test file: `npm run test:run -- services/saveManager.test.ts`
- Run tests by name pattern: `npm test -- -t "pattern"`
- Type check (no emit): `npx tsc -p tsconfig.json --noEmit`

Note: No lint script is defined in `package.json`.

## High-level architecture
Frontend stack: React + TypeScript + Vite. Styling uses utility classes/animations defined in `index.css` (README references Tailwind conventions).

- Entry and app shell
  - `index.tsx`: mounts React app and wraps it with providers.
  - `App.tsx`: orchestrates high-level screens (Start, Hangar, Map, Combat, Shop) and routes UI based on game state.

- Global game state and actions
  - `contexts/GameContext.tsx`: single source of truth for game/session state (player, map, combat/event context, logs). Handles autosave side effects.
  - `hooks/useGameHandlers.ts`: encapsulates game actions (start game, select node, travel, resolve events/combats, shop interactions). Components import handlers from here instead of implementing logic locally.

- Core services (game logic)
  - `services/saveManager.ts`: versioned localStorage saves; provides `saveGame`, `loadGame`, `deleteSave`, `hasSavedGame`, `exportSave`, `importSave`. Autosave is debounced by the context.
  - `services/contentLoader.ts`: loads and caches `public/data/content.json`; exposes typed getters like `getPlayerShips`, `getEnemyShips`, `getCards`, with graceful fallback to hardcoded data if JSON is absent.
  - `services/eventManager.ts`: manages encounter/hazard decks and selection without repeats per run; resolves consequences for `EventCard`.
  - `services/combatEngine.ts`: turn-based resolution utilities and card effects application.
  - `services/mapGenerator.ts`: generates sector graph (nodes/edges, node types).
  - `services/shopManager.ts`, `services/logManager.ts`, `services/rng.ts`: shop logic, structured logging, and deterministic RNG for tests, respectively.

- Domain data and types
  - `data/`: curated content catalogs (e.g., `cards.ts`, `enemies.ts`, `ships.ts`) used until JSON migration completes.
  - `constants.ts`: gameplay constants and current event decks (encounters/hazards) consumed by `eventManager` and UI.
  - `types.ts` and `types/*`: core domain types; `types/content-schema.ts` and `types/event-chains.ts` define the JSON content schema and narrative chain types.

- UI components (selected)
  - `components/EventCard.tsx`: renders narrative events, requirements, options, and results.
  - `components/CombatInterface.tsx`: battle UI; integrates with handlers and engine.
  - `components/GalacticMap.tsx`, `components/HangarScreen.tsx`, `components/ShopModal.tsx`, `components/StartScreen.tsx`, `components/GenericModal.tsx`, etc.

## Content system (big picture)
- Current flow (implemented): `services/contentLoader.ts` loads `public/data/content.json` at startup and caches it. Components (e.g., `HangarScreen`) query `contentLoader` getters; when JSON is missing/incomplete, code falls back to `data/*` and `constants.ts` to avoid breaking gameplay. See `CONTENT-SYSTEM.md` for usage patterns and troubleshooting.
- Planned expansion (documents): `ARCHITECTURE_SUMMARY.md` and `EVENT_CHAINS_DESIGN.md` outline a richer ContentEngine + EventChainManager pipeline (schema validation, dialogues, shops, and multi-chapter narratives). These are design docs guiding ongoing migration; the authoritative implementation today remains `contentLoader` + service layer.

## Save/load behavior
- Autosave: `GameContext` debounces writes and persists player/map/log state via `saveManager`. On app start, `StartScreen` exposes “Continuar Partida” when a save exists.
- Resetting state: use `deleteSave()` from `saveManager` (or clear the relevant localStorage key) during development.

## Testing notes
- Test runner: Vitest. Tests live alongside services (e.g., `services/saveManager.test.ts`). Prefer testing service logic and hooks in isolation; UI tests can be added with React Testing Library if introduced.
- Determinism: prefer `services/rng.ts` over `Math.random()` in testable code paths.

## Pointers to key docs
- Quickstart and scripts: `README.md`
- System-wide improvements and roadmap: `CODEBASE_ANALYSIS.md`, `REFACTOR_SUMMARY.md`
- Dynamic content system: `CONTENT-SYSTEM.md`, `editor/data/JSON-FORMAT.md`
- Narrative/events status: `IMPLEMENTED_NARRATIVE_AND_EVENTS.md`, `NARRATIVE_AND_EVENTS_COMPLETE.md`
