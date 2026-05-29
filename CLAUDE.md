# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server at http://localhost:5173
npm run build        # production build (Vite)
npm run preview      # serve production build locally
npm test             # Vitest interactive
npm run test:run     # Vitest CI (non-interactive)
npm run test:ui      # Vitest browser UI
npm run test:run -- services/saveManager.test.ts  # single test file
npx tsc -p tsconfig.json --noEmit  # type-check only
```

## Architecture

**Stack:** React 19 + TypeScript + Vite + Tailwind. No router — `App.tsx` renders screens by `gamePhase`.

**State machine** (`GamePhase` in `contexts/GameContext.tsx`):
`START_SCREEN → HANGAR → IN_GAME → NODE_ACTION_PENDING → PRE_COMBAT → COMBAT → CARD_REWARD → LEVEL_UP`
Also: `EVENT`, `SHOP`, `SIMULATION_RESULT`, `GAME_OVER`. Transitions live in `hooks/useGameHandlers.ts`.

**Layer responsibilities:**
- `contexts/GameContext.tsx` — single source of truth (player, map, combat, events). Auto-saves on `IN_GAME` phase with 2s debounce.
- `hooks/useGameHandlers.ts` — all game action handlers; calls services and updates context.
- `services/` — pure game logic, no React:
  - `combatEngine.ts` — card play, damage, shields, turn resolution
  - `mapGenerator.ts` — procedural node/layer generation
  - `eventManager.ts` — encounter/hazard decks (no repeats per run), consequence resolution
  - `contentLoader.ts` — singleton that loads `public/data/content.json`, falls back to `data/` hardcoded values
  - `saveManager.ts` — localStorage save/load/export/import (save format v1)
  - `shopManager.ts`, `rng.ts`, `logManager.ts`, `imageRegistry.ts`
- `components/` — presentational; receive props/callbacks, no direct service calls
- `data/` — hardcoded fallback catalogs (`cards.ts`, `enemies.ts`, `ships.ts`)
- `types.ts` — all domain types and enums (single file)
- `constants.ts` — visual constants (node colors, rarity colors, game balance values)

**Content system:** Primary source is `public/data/content.json` (ships, cards, encounters, hazards, shops, dialogues, eventChains). `contentLoader` validates with Zod schemas in `services/validationSchemas.ts`. Edit content visually via `editor/index.html` (vanilla JS, no build step needed).

**Visual effects:** CRT/retro effects via `components/RetroMonitor.tsx` (reusable). Particle/animation CSS classes in `index.css` (`cardfx-*`, `panel-shake`). Planet backgrounds use Three.js via `services/imageRegistry.ts`.

**CardInstance vs CardData:** `CardData` (in `data/cards.ts` / content JSON) is the template. `CardInstance` (with `instanceId` + optional `CardAffix`) is what lives in the player's deck.

## Tests

Tests are colocated in `services/` (`saveManager.test.ts`, `saveManager.export_import.test.ts`). Use `vitest` — no jest globals.
