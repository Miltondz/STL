# Navegador Galáctico Procedural

Roguelike de exploración espacial y combate por turnos con construcción de mazos. Viaja por un sector generado proceduralmente, toma decisiones narrativas, libra combates tácticos y mejora tu nave y tripulación.


## Características principales
- Mapa galáctico procedural con nodos de Encuentro, Peligro, Combate, Tienda y Jefe.
- Combate por turnos con cartas (coste de energía, escudos, recursos como Fuego/Maniobra).
- Eventos narrativos con requisitos (tripulantes, créditos, banderas) y resultados probabilísticos.
- Intenciones del enemigo visibles (ataque/defensa/mixto) para planificar el turno.
- Sistema de guardado automático versionado (localStorage) + Exportar/Importar partidas (JSON).
- Efectos visuales: números flotantes, partículas de daño/escudo/curación, temblores de panel.
- Carga dinámica de contenido desde JSON (naves, cartas, eventos) con fallback a datos locales.
- Editor web de contenido (cartas, naves, eventos) en `./editor/`.


## Cómo jugar (rápido)
- Doble clic en una carta de tu mano para jugarla.
- Tras ~2s la carta aplica un efecto especial (giro/temblor), luego turbulencia y se resuelven sus efectos.
- Observa la intención del enemigo (borde amarillo) para decidir.
- Usa el botón ⏸️ para abrir el menú de pausa (guardar/exportar/importar).


## Demo local
```bash
npm install
npm run dev
# abre http://localhost:5173
```

Build y preview de producción:
```bash
npm run build
npm run preview
```

Tests (Vitest):
```bash
npm test              # interactivo
npm run test:run      # CI
npm run test:ui       # UI de Vitest
npm run test:run -- services/saveManager.export_import.test.ts  # un archivo
```

Type-check:
```bash
npx tsc -p tsconfig.json --noEmit
```


## Arquitectura (alto nivel)
- Entrada: `index.tsx` monta la app y proveedores.
- Orquestación: `App.tsx` decide qué pantalla mostrar (Start, Hangar, Mapa, Evento, Combate, Tienda, Recompensa, etc.).
- Estado global: `contexts/GameContext.tsx` (jugador, mapa, combate/eventos, logs) + auto‑guardado con debounce.
- Acciones del juego: `hooks/useGameHandlers.ts` encapsula handlers (viajar, resolver eventos, combate, tienda).
- Servicios:
  - `services/saveManager.ts`: guardar/cargar/exportar/importar (v1), validaciones básicas.
  - `services/contentLoader.ts`: carga y cachea `public/data/content.json` y expone getters tipados.
  - `services/eventManager.ts`: mazos de encuentro/peligro sin repeticiones por run, resolución de consecuencias.
  - `services/combatEngine.ts`, `services/mapGenerator.ts`, `services/shopManager.ts`, `services/rng.ts`.
- UI clave: `components/GalacticMap.tsx`, `components/CombatInterface.tsx`, `components/EventCard.tsx`, `components/ShopModal.tsx`, `components/StartScreen.tsx`, `components/PauseMenu.tsx`.
- Efectos/animaciones: `index.css` (cardfx-*, partículas y panel-shake).

Documentación de diseño y roadmap:
- `REFACTOR_SUMMARY.md` (refactor Fase 1: Context + Guardado + FX)
- `CODEBASE_ANALYSIS.md` (mejoras y roadmap)
- `CONTENT-SYSTEM.md`, `ARCHITECTURE_SUMMARY.md`, `EVENT_CHAINS_DESIGN.md` (sistema de contenido y narrativa)


## Sistema de contenido
- JSON principal en `public/data/content.json` (naves, cartas, encuentros, peligros, tiendas, cadenas…).
- `contentLoader` intenta cargar ese JSON al inicio; si falta, usa datos locales de `data/` y `constants.ts`.
- Editor: `./editor/index.html` para CRUD visual y exportación de JSON.


## Guardado y gestión de partidas
- Auto‑save cuando el juego está en fase IN_GAME (debounce 2s) usando `saveManager`.
- Menú de pausa (⏸️): Guardar ahora, Exportar JSON, Importar JSON, Eliminar partida.
- Start Screen: botón “💾 Continuar Partida” si hay guardado.


## Estructura de carpetas (resumen)
- `components/` UI del juego (mapa, combate, cartas, modales, pausa).
- `services/` reglas y lógica del juego (guardado, contenido, eventos, combate, mapa).
- `data/` catálogos locales (en migración a JSON).
- `types.ts` y `types/*` tipos de dominio (incluye esquemas de contenido y de cadenas narrativas).
- `editor/` herramienta web para crear/editar contenido y exportar JSON.


## Requisitos
- Node.js 18+
- npm 9+


## Scripts
- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción (Vite).
- `npm run preview` — servir build local.
- `npm test` / `npm run test:run` / `npm run test:ui` — pruebas.


## Roadmap breve
- Tutorial interactivo y mejoras de feedback visual.
- Migración completa a contenido JSON (cartas, eventos, tiendas, cadenas).
- Más pruebas (services y flujos críticos) y CI.
