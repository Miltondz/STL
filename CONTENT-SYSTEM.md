# 📦 Sistema de Contenido Dinámico

Este documento explica cómo funciona el sistema de carga dinámica de contenido desde JSON.

## 🎯 Arquitectura

```
┌─────────────────┐
│  Editor Web     │  ← Edita y exporta JSON
└────────┬────────┘
         │ Exporta
         ↓
┌─────────────────┐
│  content.json   │  ← Archivo de configuración
│  public/data/   │
└────────┬────────┘
         │ Carga al inicio
         ↓
┌─────────────────┐
│ ContentLoader   │  ← Servicio singleton
│ (services/)     │
└────────┬────────┘
         │ Provee datos
         ↓
┌─────────────────┐
│  Componentes    │  ← HangarScreen, etc.
│  del Juego      │
└─────────────────┘
```

## 📁 Estructura de Archivos

### Contenido JSON
```
public/
└── data/
    └── content.json    ← Contenido editable del juego
```

### Código del Sistema
```
services/
└── contentLoader.ts    ← Servicio de carga

components/
├── HangarScreen.tsx    ← Usa contentLoader.getPlayerShips()
├── CombatInterface.tsx ← Usará contentLoader.getEnemyShips()
└── ...                 ← Otros componentes
```

## 🔄 Flujo de Trabajo

### 1. Editar Contenido
```bash
# Abrir editor
1. Iniciar juego
2. Click en "🎮 Editor de Contenido"
3. O directamente: editor/index.html
```

### 2. Importar/Editar/Exportar
```
1. Importar JSON existente (opcional)
2. Editar naves, cartas, eventos, etc.
3. Exportar JSON
4. Guardar como public/data/content.json
```

### 3. El Juego Carga Automáticamente
```typescript
// Al iniciar el juego, se carga content.json
await contentLoader.loadContent();

// Los componentes obtienen los datos
const ships = contentLoader.getPlayerShips();
```

## 🛠️ Uso del ContentLoader

### Inicialización
```typescript
import contentLoader from '../services/contentLoader';

// En el componente principal (App, index.tsx, etc.)
useEffect(() => {
  contentLoader.loadContent()
    .then(() => console.log('Contenido cargado'))
    .catch(err => console.error('Error:', err));
}, []);
```

### Obtener Naves
```typescript
// Naves de jugador (para hangar)
const playerShips = contentLoader.getPlayerShips();

// Naves enemigas (para combate)
const enemies = contentLoader.getEnemyShips();

// Nave específica
const ship = contentLoader.getShipById('IRON_FIST');
```

### Obtener Cartas (cuando estén)
```typescript
const allCards = contentLoader.getCards();
const card = contentLoader.getCardById('ATTACK_1');
```

### Obtener Eventos (cuando estén)
```typescript
const encounters = contentLoader.getEncounters();
const hazards = contentLoader.getHazards();
```

## ✅ Implementación Actual

### ✅ Completado

1. **ContentLoader Service** (`services/contentLoader.ts`)
   - Singleton pattern
   - Carga desde `/data/content.json`
   - Cache en memoria
   - Métodos de acceso tipados

2. **HangarScreen** (`components/HangarScreen.tsx`)
   - Carga naves desde JSON
   - Fallback a naves hardcodeadas
   - Indicador de carga
   - Filtro por `metadata.type === 'player'`

3. **Archivo de Contenido** (`public/data/content.json`)
   - 3 naves de jugador
   - 3 naves enemigas
   - Estructura extensible

### 📝 Pendientes

1. **CombatInterface**
   - Usar `contentLoader.getEnemyShips()` en lugar de `ENEMY_TEMPLATES`
   - Mapear `metadata.pattern` a lógica de combate

2. **Cartas**
   - Convertir `data/cards.ts` a JSON
   - Usar `contentLoader.getCards()` en lugar de `ALL_CARDS`

3. **Eventos/Encuentros**
   - Crear estructura en JSON
   - Implementar generación dinámica

4. **Tiendas**
   - Crear estructura en JSON
   - Usar `contentLoader.getShops()`

## 🔧 Compatibilidad Hacia Atrás

El sistema está diseñado para **coexistir** con el código hardcodeado:

```typescript
// Intenta JSON primero, luego fallback
const ships = contentLoader.getPlayerShips();
if (ships.length === 0) {
  // Usar ALL_SHIPS hardcodeado
  ships = ALL_SHIPS;
}
```

Esto permite:
- ✅ Desarrollo incremental
- ✅ No romper funcionalidad existente
- ✅ Migración gradual

## 🎮 Cómo Actualizar Contenido en Producción

### Método 1: Reemplazar archivo
```bash
# Simplemente reemplazar el JSON
cp nuevo-content.json public/data/content.json
# El juego lo cargará en el próximo refresh
```

### Método 2: Hot reload (desarrollo)
```typescript
// En consola del navegador
await contentLoader.reload();
// Luego refrescar el componente
```

## 📊 Formato del JSON

Ver `editor/data/JSON-FORMAT.md` para detalles completos.

Estructura básica:
```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "Navegador Galáctico - Content",
    "author": "string",
    "lastModified": "ISO date",
    "gameVersion": "1.0.0"
  },
  "encounters": [],
  "hazards": [],
  "cards": [],
  "ships": [
    {
      "id": "IRON_FIST",
      "name": "El Puño de Hierro",
      "availability": "always",
      "metadata": {
        "type": "player"  // ← Importante para filtrar
      }
      // ... más campos
    }
  ],
  "shops": [],
  "dialogues": [],
  "eventChains": []
}
```

## 🚨 Troubleshooting

### Error: "Cannot read properties of null"
**Causa**: ContentLoader no ha cargado aún
**Solución**: 
```typescript
if (!contentLoader.isLoaded()) {
  await contentLoader.loadContent();
}
```

### Error: "Failed to fetch"
**Causa**: `content.json` no existe o ruta incorrecta
**Solución**: Verificar que existe `public/data/content.json`

### Naves no aparecen en hangar
**Causa**: `metadata.type !== 'player'`
**Solución**: Asegurar que las naves de jugador tienen:
```json
{
  "metadata": {
    "type": "player"
  }
}
```

## 🔮 Roadmap

### Próximos Pasos
1. ✅ Sistema de carga implementado
2. ✅ HangarScreen usando JSON
3. ⏳ CombatInterface usando JSON para enemigos
4. ⏳ Convertir cartas a JSON
5. ⏳ Sistema de eventos desde JSON
6. ⏳ Tiendas dinámicas desde JSON
7. ⏳ Diálogos y cadenas narrativas

### Futuras Mejoras
- 🔄 Versionado de contenido
- 📦 Compresión de JSON
- 🔐 Validación de esquema
- 🌐 Carga desde CDN
- 💾 Cache en IndexedDB
- 🔄 Hot reload sin refresh
