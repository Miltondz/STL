# 📦 Data Conversion

Este directorio contiene los datos convertidos desde el código hardcodeado del juego al formato JSON del editor.

## 🚀 Archivos Convertidos

### ✅ `ships-converted.json`
- **3 naves de jugador**: Iron Fist, Merchant, Spectre
- **3 naves enemigas**: Pirate Raider, Heavy Drone, Miniboss Corvette
- **Fuente**: `data/ships.ts` + `data/enemies.ts`

### ✅ `cards-converted.json`
- **13 cartas totales**: Incluye cartas base, ataques, defensas, habilidades y tripulación
- **3 afijos**: Eficiente, Calibrado, Reforzado
- **Tipos**: Attack, Skill, Crew
- **Raridades**: Inicial, Common, Uncommon, Rare
- **Facciones**: Neutral, Tecno-Gremio, Mercenarios, Hacktivistas, Academia, Comerciante
- **Fuente**: `data/cards.ts`

### ✅ `events-converted.json`
- **2 encuentros**: Transmisión Fantasma, Anomalía Inestable
- **2 peligros**: Tormenta de Iones, Campo de Asteroides Denso
- **Estructura compleja**: Múltiples opciones con consecuencias probabilísticas
- **Fuente**: `constants.ts` (ENCOUNTER_DECK, HAZARD_DECK)

### ✅ `shops-converted.json`
- **4 rasgos de comerciante**: Generoso, Avaro, Contrabandista, Militar
- **1 servicio**: Eliminar Carta del mazo
- **Reglas de generación**: Tamaño de inventario, modificadores de precio, ofertas diarias
- **Fuente**: `services/shopManager.ts`

## 📝 Próximas Conversiones

### Pendientes:
- [ ] **Diálogos** (si existen en código)
- [ ] **Más eventos** (expandir contenido narrativo)
- [ ] **Más servicios de tienda** (reparaciones, mejoras, etc.)

## 🔄 Proceso de Conversión

### 1. Ejecutar el script de conversión
```bash
node scripts/convert-ships-to-json.js
```

### 2. Importar en el editor
1. Abre el editor: `editor/index.html`
2. Click en **"📤 Importar JSON"**
3. Selecciona el archivo convertido
4. Revisa y edita según necesites

### 3. Ajustar en el editor
- Agrega efectos usando el **selector de efectos** (⚡)
- Configura sinergias si aplica
- Ajusta valores según balance del juego
- Añade metadata adicional

### 4. Exportar JSON final
1. Click en **"📥 Exportar JSON"**
2. Guarda como `content_final.json`
3. Este archivo será usado por el juego

## 🛠️ Scripts de Conversión

### Crear nuevo script
Para convertir otros tipos de datos, usa este template:

```javascript
// scripts/convert-NOMBRE-to-json.js
const DATA_SOURCE = [ /* datos hardcodeados */ ];

function convertData() {
    return DATA_SOURCE.map(item => ({
        id: item.id,
        name: item.name,
        // ... más campos según el editor
    }));
}

const output = {
    version: '1.0.0',
    metadata: {
        title: 'Navegador Galáctico - TIPO Data',
        author: 'Conversion Script',
        lastModified: new Date().toISOString(),
        source: 'data/SOURCE.ts'
    },
    TIPO: convertData()
};

console.log(JSON.stringify(output, null, 2));
```

## 📊 Formato del Editor

### Esquema para Naves

```typescript
{
  version: string,
  metadata: {
    title: string,
    author: string,
    lastModified: string,
    gameVersion: string
  },
  ships: [{
    id: string,
    name: string,
    description: string,
    image: string,
    availability: 'always' | 'shop' | 'event' | 'quest' | 'hidden',
    maxHull: number,
    maxFuel: number,
    maxShields: number,
    specialAbility: {
      name: string,
      description: string,
      effect: string
    },
    effects: Array<{
      id: string,
      category: string,
      params: Record<string, any>
    }>,
    metadata?: any // Datos adicionales del juego
  }]
}
```

### Esquema para Cartas

```typescript
{
  version: string,
  metadata: {
    title: string,
    author: string,
    lastModified: string,
    source: string,
    gameVersion: string
  },
  affixes: {
    [affixId: string]: {
      name: string,
      description: string,
      costModifier?: number,
      valueModifier?: number
    }
  },
  cards: [{
    id: string,
    name: string,
    type: 'Attack' | 'Skill' | 'Crew',
    subtype: string | null,
    cost: number,
    price: number,
    rarity: 'Inicial' | 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary',
    faction: string,
    description: string,
    image: string,
    availability: 'always' | 'shop' | 'event' | 'reward',
    effects: Array<{
      id: string,
      category: 'combat' | 'crew' | 'utility',
      params: {
        value: number,
        effectType: string
      }
    }>,
    metadata: {
      possibleAffixes: string[],
      effectBase: string,
      value?: number
    }
  }]
}
```

### Esquema para Eventos

```typescript
{
  version: string,
  metadata: {
    title: string,
    author: string,
    lastModified: string,
    source: string,
    gameVersion: string
  },
  events: {
    encounters: EventData[],
    hazards: EventData[]
  }
}

interface EventData {
  id: string,
  title: string,
  type: 'ENCOUNTER' | 'HAZARD',
  image: string,
  introText: string[],
  promptText: string,
  options: [{
    text: string,
    crewRequirement: string | null,
    narrativeFlagRequirement: string | null,
    consequences: [{
      probability: number,  // 0.0 a 1.0
      outcome: string,
      effects: {
        credits?: number,
        fuel?: number | { min: number, max: number, random: true },
        hull?: number | { min: number, max: number, random: true },
        xp?: number,
        moral?: number
      },
      reactionText?: string,
      logText: string,
      narrativeFlag?: { key: string, value: boolean },
      crewAffinity?: { crewId: string, amount: number },
      achievementId?: string
    }]
  }]
}
```

### Esquema para Tiendas

```typescript
{
  version: string,
  metadata: {
    title: string,
    author: string,
    lastModified: string,
    source: string,
    gameVersion: string
  },
  shopSystem: {
    traits: [{
      id: string,
      name: string,
      description: string,
      cardPoolModifier: 'default' | {
        types?: string[],
        rarities?: string[]
      },
      priceModifier: number,      // 0.75 = 25% descuento, 1.25 = 25% sobreprecio
      serviceModifier: number,    // Mismo formato que priceModifier
      canHaveDailyDeal: boolean,
      dailyDealDiscount: number   // 0.5 = 50% de descuento
    }],
    services: [{
      id: string,
      name: string,
      description: string,
      basePrice: number,
      type: 'deck_modification' | 'repair' | 'upgrade'
    }],
    generationRules: {
      inventorySize: number,
      cardPriceSource: 'card_base_price',
      dailyDealProbability: number,
      traitProbability: {
        [traitId: string]: number  // Suma debe ser 1.0
      }
    }
  }
}
```

## ✅ Validación de Compatibilidad

**Estado**: ✅ Todos los JSON validados y compatibles con el editor

**Estructuras Verificadas**:
- `encounters` y `hazards` como arrays directos (no `events.encounters`)
- `cards` con `effects[]` y `metadata`
- `shops` como array de tiendas concretas (no `shopSystem`)
- `ships` con `specialAbility` y `effects[]`

## ⚠️ Notas Importantes

1. **Metadata adicional**: El campo `metadata` en cada item preserva datos del juego original que no están en el editor (como `initialDeck`, `difficulty`, etc.)

2. **Availability**: 
   - `always`: Disponible desde el inicio en hangar
   - `shop`: Se compra en tiendas
   - `event`: Se desbloquea por evento
   - `quest`: Recompensa de misión
   - `hidden`: No aparece en hangar (enemigos)

3. **Effects**: Se agregan manualmente en el editor usando el sistema de efectos

4. **No borrar archivos originales**: Los `.ts` en `data/` son la fuente de verdad. Los JSON son para el editor.

5. **Encoding**: Los JSON usan UTF-16LE. Algunos editores de texto pueden mostrar caracteres especiales españoles incorrectamente. El editor web los maneja correctamente.

## 🔗 Siguiente Paso

Después de tener todos los datos convertidos y editados:
1. Integrar el sistema de carga de JSON en el juego
2. Reemplazar imports hardcodeados por carga dinámica
3. Mantener compatibilidad hacia atrás durante la transición
