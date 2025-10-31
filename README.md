# Navegador Galáctico Procedural

Juego roguelike de exploración espacial y combate por turnos, construido con React + Vite y Tailwind.

## Requisitos
- Node.js 18+
- npm 9+

## Ejecutar en desarrollo
```bash
npm install
npm run dev
# abre http://localhost:5173
```

## Build de producción
```bash
npm run build
npm run preview # sirve el build localmente
```

## Estructura del proyecto (parcial)
- `index.html` y `index.css`: html base y estilos globales/animaciones
- `index.tsx` y `App.tsx`: punto de entrada y orquestación de pantallas
- `components/`: UI (mapa, combate, cartas, modales)
- `services/`: lógica de juego (mapa, eventos, combate, tienda)
- `data/`: catálogo de cartas y contenido

## Combate y cartas
- Doble clic en una carta de la mano para jugarla.
- La carta jugada se muestra sobre la sección de la mano durante ~2s, después aplica un efecto especial (temblor o giro 3D), luego turbulencia y desaparece. Al desaparecer se resuelven los efectos sobre enemigo/jugador.
- El indicador de intención del enemigo aparece como elipse con borde amarillo sobre su panel.

## Notas de UI recientes
- Cartas en zoom y superposiciones ahora son 100% opacas.
- Se evitó el recorte (overflow) de la carta central y del indicador de intención.
- Panel central inferior sin fondo (solo se muestran cartas).
- Animaciones de carta disponibles en `index.css`: `cardfx-shake`, `cardfx-3d`, `cardfx-turbulence`, `cardfx-dissolve`.

## Scripts útiles
- `npm run dev`: servidor de desarrollo Vite
- `npm run build`: build de producción
- `npm run preview`: sirve el build

## Contribución
- UI con Tailwind. Preferir clases utilitarias y animaciones definidas en `index.css`.
- Mantener componentes puros y mover reglas de juego a `services/`.
- PRs con descripciones claras y capturas si cambian UI.
