# 📄 Formato JSON del Editor

Este documento especifica el formato **estándar y obligatorio** para todos los archivos JSON que se importan/exportan del editor.

## 🎯 Esquema Principal

```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "Navegador Galáctico - Content",
    "author": "string",
    "lastModified": "ISO 8601 date string",
    "gameVersion": "1.0.0"
  },
  "encounters": [],
  "hazards": [],
  "cards": [],
  "ships": [],
  "shops": [],
  "dialogues": [],
  "eventChains": []
}
```

## ⚠️ Reglas Obligatorias

### 1. Todos los campos raíz deben existir
Incluso si están vacíos, **todos** estos campos deben estar presentes:
- ✅ `version`
- ✅ `metadata`
- ✅ `encounters`
- ✅ `hazards`
- ✅ `cards`
- ✅ `ships`
- ✅ `shops`
- ✅ `dialogues`
- ✅ `eventChains` (¡NO `chains`!)

### 2. Arrays nunca null
Los arrays deben ser `[]` si están vacíos, nunca `null` o `undefined`.

```javascript
// ✅ CORRECTO
"ships": []

// ❌ INCORRECTO
"ships": null
// o campo faltante
```

### 3. Metadata completo
El objeto metadata debe tener todos estos campos:
```json
{
  "title": "string",
  "author": "string",
  "lastModified": "2025-10-29T20:40:00.000Z",
  "gameVersion": "1.0.0"
}
```

## 📦 Formato de cada Tipo

### Ships
```json
{
  "id": "string (UPPERCASE_WITH_UNDERSCORES)",
  "name": "string",
  "description": "string",
  "image": "URL string",
  "availability": "always|shop|event|quest|hidden",
  "maxHull": "number",
  "maxFuel": "number",
  "maxShields": "number",
  "specialAbility": {
    "name": "string",
    "description": "string",
    "effect": "string"
  },
  "effects": [
    {
      "id": "EFFECT_ID",
      "category": "combat|ship|events|shop|synergy",
      "params": {
        "key": "value"
      }
    }
  ],
  "metadata": {
    "type": "player|enemy",  // OBLIGATORIO: Identifica el tipo de nave
    // ... otros campos opcionales según el tipo
  }
}
```

#### Diferencia entre Naves de Jugador y Enemigas

**Naves de Jugador** (`metadata.type: "player"`):
- `availability`: `"always"`, `"shop"`, `"event"`, `"quest"`
- Tienen `maxFuel` > 0
- Metadata incluye: `subtype`, `faction`, `difficulty`, `initialDeck`, `initialCredits`, `crewSlots`

**Naves Enemigas** (`metadata.type: "enemy"`):
- `availability`: `"hidden"` (no aparecen en hangar)
- `maxFuel`: 0 (no usan combustible)
- Metadata incluye: `baseDamage`, `reward`, `pattern`, `patternIndex`

```json
// Ejemplo: Nave de Jugador
{
  "id": "IRON_FIST",
  "availability": "always",
  "maxFuel": 12,
  "metadata": {
    "type": "player",
    "difficulty": 2,
    "initialDeck": [...],
    "initialCredits": 8
  }
}

// Ejemplo: Nave Enemiga
{
  "id": "PIRATE_RAIDER",
  "availability": "hidden",
  "maxFuel": 0,
  "metadata": {
    "type": "enemy",
    "baseDamage": 5,
    "reward": { "credits": 8, "xpReward": 25 },
    "pattern": ["ATTACK", "ATTACK_DEFEND", "ATTACK"]
  }
}
```

### Cards
```json
{
  "id": "string",
  "name": "string",
  "type": "Crew|Attack|Skill|Equipment|Ship",
  "cost": "number",
  "price": "number",
  "rarity": "Common|Uncommon|Rare|Epic|Legendary",
  "faction": "string",
  "description": "string",
  "image": "URL string",
  "stats": {},
  "effects": [],
  "synergies": []
}
```

### Encounters & Hazards
```json
{
  "id": "string",
  "title": "string",
  "type": "encounter|hazard",
  "description": "string",
  "difficulty": "easy|medium|hard",
  "narrative": {
    "intro": ["string array"],
    "prompt": "string"
  },
  "options": [],
  "image": {
    "url": "string",
    "orientation": "horizontal|vertical"
  },
  "video": {
    "url": "string"
  }
}
```

### Shops
```json
{
  "id": "string",
  "name": "string",
  "owner": "string",
  "location": "string",
  "description": "string",
  "services": {
    "removeCard": "boolean",
    "repairHull": "boolean",
    "upgradeCard": "boolean"
  },
  "traits": [],
  "inventory": []
}
```

### Dialogues
```json
{
  "id": "string",
  "speaker": "string",
  "speakerCardId": "string",
  "text": "string",
  "conditions": [],
  "options": []
}
```

### Event Chains
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "startNode": "string",
  "nodes": []
}
```

## 🔄 Compatibilidad de Importación

El editor es **flexible** al importar y puede manejar estos casos especiales:

### Ships
Acepta cualquiera de estos formatos y los normaliza:
```javascript
// Formato 1: Array directo (PREFERIDO)
{ "ships": [...] }

// Formato 2: Separado (se combinan automáticamente)
{ "playerShips": [...], "enemyShips": [...] }

// Formato 3: Array completo
{ "allShips": [...] }
```

### Event Chains
Acepta ambos nombres:
```javascript
{ "eventChains": [...] }  // Preferido
{ "chains": [...] }        // También funciona
```

## ✅ Validación al Exportar

Cuando exportas desde el editor, **siempre** obtienes:
1. Formato estándar completo
2. Todos los campos presentes
3. Arrays vacíos en lugar de null
4. Metadata actualizado con timestamp
5. Version y gameVersion correctos

## 🛠️ Scripts de Conversión

Todos los scripts deben generar este formato:

```javascript
const output = {
    version: '1.0.0',
    metadata: {
        title: 'Navegador Galáctico - Content',
        author: 'Conversion Script',
        lastModified: new Date().toISOString(),
        gameVersion: '1.0.0'
    },
    encounters: [],
    hazards: [],
    cards: [],
    ships: convertedShips,
    shops: [],
    dialogues: [],
    eventChains: []
};
```

## 📝 Checklist de Conversión

Al crear un nuevo script de conversión:
- [ ] Usar formato estándar completo
- [ ] Incluir todos los campos raíz (aunque estén vacíos)
- [ ] `eventChains` no `chains`
- [ ] `ships` como array plano
- [ ] Metadata completo con gameVersion
- [ ] Arrays nunca null
- [ ] IDs en formato consistente
- [ ] Probar importar → exportar → reimportar

## 🚨 Errores Comunes

### ❌ Campo faltante
```json
{
  "version": "1.0.0",
  "metadata": {},
  "ships": []
  // ❌ Faltan: encounters, hazards, cards, shops, dialogues, eventChains
}
```

### ❌ Nombre incorrecto
```json
{
  "chains": []  // ❌ Debe ser "eventChains"
}
```

### ❌ Array null
```json
{
  "ships": null  // ❌ Debe ser []
}
```

### ✅ Correcto
```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "Navegador Galáctico - Content",
    "author": "Editor",
    "lastModified": "2025-10-29T20:40:00.000Z",
    "gameVersion": "1.0.0"
  },
  "encounters": [],
  "hazards": [],
  "cards": [],
  "ships": [/* ... */],
  "shops": [],
  "dialogues": [],
  "eventChains": []
}
```
