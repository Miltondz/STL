# Progreso de Refactorización - Fase 1

## ✅ Completado

### 1. Sistema de Guardado (Issue #10)
- ✅ **Archivo**: `services/saveManager.ts`
- **Funcionalidad**:
  - `saveGame()`: Guarda estado en localStorage
  - `loadGame()`: Carga desde localStorage con validación de versión
  - `deleteSave()`: Elimina partida guardada
  - `hasSavedGame()`: Verifica existencia
  - `exportSave()`: Descarga JSON
  - `importSave()`: Carga desde archivo
- **Versioning**: Sistema preparado para migraciones futuras (v1)

### 2. GameContext con Context API (Issue #2 - Parcial)
- ✅ **Archivo**: `contexts/GameContext.tsx`
- **Funcionalidad**:
  - `GameProvider`: Componente proveedor del contexto
  - `useGame()`: Hook para acceder al estado y actions
  - **Auto-save**: Guardado automático 2s después de cambios
  - **Estado consolidado**: Todos los `useState` de App.tsx centralizados
- ✅ **Archivo**: `hooks/useGameHandlers.ts`
  - Toda la lógica de negocio extraída de App.tsx
  - 16 handlers exportados con `useCallback` para performance
- ✅ **Integración**: `index.tsx` actualizado con `<GameProvider>`

---

## 🚧 Pendiente

### 3. Refactorizar App.tsx (Issue #2 - Restante)
**Archivo**: `App.tsx` (400+ líneas → objetivo: ~150 líneas)

**Cambios necesarios**:

```typescript
// ANTES (actual)
const [playerState, setPlayerState] = useState<PlayerState | null>(null);
const [mapData, setMapData] = useState<MapData | null>(null);
// ... +15 estados más

// DESPUÉS (refactorizado)
import { useGame } from './contexts/GameContext';
import { useGameHandlers } from './hooks/useGameHandlers';

function App() {
  const {
    gamePhase,
    contentLoaded,
    playerState,
    mapData,
    currentNodeId,
    // ... resto del estado
  } = useGame();

  const {
    handleStartGame,
    handleNodeSelect,
    handleEventOptionSelect,
    // ... resto de handlers
  } = useGameHandlers();

  // Solo lógica de carga de contenido y efectos de UI
  useEffect(() => {
    const loadGameContent = async () => {
      try {
        await contentLoader.loadContent();
        setContentLoaded(true);
      } catch (error) {
        console.warn('[App] Error cargando contenido:', error);
        setContentLoaded(true);
      }
    };
    loadGameContent();
  }, []);

  useEffect(() => {
    document.body.classList.remove('start-screen', 'in-hangar', 'in-game');
    switch (gamePhase) {
      case 'START_SCREEN': document.body.classList.add('start-screen'); break;
      case 'HANGAR': document.body.classList.add('in-hangar'); break;
      default: document.body.classList.add('in-game'); break;
    }
  }, [gamePhase]);

  // Renderizado condicional según fase
  if (!contentLoaded) return <LoadingScreen />;
  if (gamePhase === 'START_SCREEN') return <StartScreen />;
  if (gamePhase === 'HANGAR') return <HangarScreen />;
  // ... resto de pantallas
}
```

**Beneficios**:
- ❌ 15+ `useState` → ✅ 0 `useState` (todo en context)
- ❌ 300+ líneas de lógica → ✅ ~50 líneas de renderizado
- ✅ Código testeable (hooks separados)
- ✅ Reutilización de handlers en otros componentes

---

### 4. Integrar Save/Load en UI
**Archivos a modificar**:
- `components/StartScreen.tsx`: Botón "Continuar Partida" si `hasSavedGame()`
- `components/HangarScreen.tsx` o nuevo `PauseMenu`: Botones de guardar/cargar/exportar

**Ejemplo**:
```typescript
// StartScreen.tsx
import { hasSavedGame } from '../services/saveManager';
import { useGame } from '../contexts/GameContext';

const { loadSavedGame } = useGame();

{hasSavedGame() && (
  <button onClick={() => {
    if (loadSavedGame()) {
      // Partida cargada, transición automática a IN_GAME
    }
  }}>
    Continuar Partida
  </button>
)}
```

---

### 5. Feedback Visual en Combate (Issue #6)
**Archivos a crear/modificar**:

#### a) CSS de Partículas
```css
/* index.css */
@keyframes particle-burst {
  0% { 
    opacity: 1; 
    transform: scale(0) translate(0, 0); 
  }
  100% { 
    opacity: 0; 
    transform: scale(2) translate(var(--tx), var(--ty)); 
  }
}

@keyframes panel-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  pointer-events: none;
  animation: particle-burst 0.8s ease-out forwards;
}

.particle-damage { background: #ef4444; }
.particle-heal { background: #22c55e; }
.particle-shield { background: #06b6d4; }

.panel-shake {
  animation: panel-shake 0.5s ease-in-out;
}
```

#### b) Componente de Partículas
```typescript
// components/ParticleBurst.tsx
interface Particle {
  id: string;
  x: number;
  y: number;
  tx: number; // target x offset
  ty: number; // target y offset
  type: 'damage' | 'heal' | 'shield';
}

export const ParticleBurst: React.FC<{ particles: Particle[] }> = ({ particles }) => {
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle particle-${p.type}`}
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
};
```

#### c) Integración en CombatInterface
```typescript
// CombatInterface.tsx
const [particles, setParticles] = useState<Particle[]>([]);

const spawnParticleBurst = (x: number, y: number, type: 'damage' | 'heal' | 'shield') => {
  const newParticles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 40 + Math.random() * 20;
    return {
      id: `p-${Date.now()}-${i}`,
      x,
      y,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      type,
    };
  });
  setParticles((prev) => [...prev, ...newParticles]);

  // Limpiar después de animación
  setTimeout(() => {
    setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
  }, 800);
};

// Llamar cuando se aplica daño:
useEffect(() => {
  if (prevHpRef.current > hp) {
    spawnParticleBurst(panelX, panelY, 'damage');
  }
}, [hp]);
```

---

## 📊 Métricas

### Reducción de Código en App.tsx
- **Antes**: ~480 líneas
- **Después (proyectado)**: ~150 líneas (-69%)

### Estado Consolidado
- **Antes**: 15 `useState` dispersos
- **Después**: 0 `useState` en App.tsx, todo en GameContext

### Performance
- Auto-save con debounce (2s) evita writes excesivos
- `useCallback` en todos los handlers previene re-renders

---

## 🎯 Próximos Pasos Inmediatos

1. **Refactorizar App.tsx** (30 min)
   - Reemplazar todos los `useState` por `useGame()`
   - Importar `useGameHandlers()`
   - Simplificar renderizado condicional

2. **Agregar botón "Continuar" en StartScreen** (10 min)
   - Verificar `hasSavedGame()`
   - Llamar `loadSavedGame()` del context

3. **Probar flujo completo** (15 min)
   - Nueva partida → jugar → cerrar navegador
   - Abrir → "Continuar" → verificar estado correcto
   - Exportar/importar partida

4. **Implementar partículas básicas** (30 min)
   - CSS keyframes
   - Componente ParticleBurst
   - Integrar en CombatInterface

---

## ⚠️ Notas Importantes

- **NO borrar** `App.tsx` actual hasta confirmar que refactor funciona
- **Hacer backup** antes de cambios masivos (commit frecuente)
- **Probar** cada handler individualmente después de refactor
- **Verificar** que auto-save funciona (consola del navegador)

---

**Última actualización**: 2025-10-31  
**Archivos creados**: 3 (saveManager.ts, GameContext.tsx, useGameHandlers.ts)  
**Archivos modificados**: 1 (index.tsx)  
**Falta completar**: App.tsx refactor + UI de save/load + partículas
