# 📊 Resumen de Extracción de Datos

**Fecha:** 2025-10-29  
**Fuente:** Navegador Galáctico (código hardcodeado)  
**Destino:** JSON para editor y sistema dinámico

---

## ✅ Datos Extraídos

### 1. 🚀 Naves (`ships-converted.json` - 6.03 KB)

**Naves de Jugador (3):**
- **Iron Fist** - Nave de combate pesado (70 HP, 10 escudos, 15 combustible)
- **Merchant** - Nave comercial con ventajas económicas (50 HP, 5 escudos, 20 combustible)
- **Spectre** - Nave ágil para sigilo (55 HP, 8 escudos, 18 combustible)

**Naves Enemigas (3):**
- **Pirate Raider** - Enemigo básico (30 HP)
- **Heavy Drone** - Enemigo con escudos (25 HP, 5 escudos)
- **Miniboss Corvette** - Minijefe (60 HP, 10 escudos)

**Características:**
- Cada nave tiene habilidad especial
- Mazo inicial único por nave
- Dificultad configurada
- Imágenes de placeholder integradas

---

### 2. 🃏 Cartas (`cards-converted.json` - 25.75 KB)

**Total: 13 cartas**

#### Cartas Base (3)
- **Disparo Básico** - 5 daño, costo 1
- **Maniobra Rápida** - Gana 2 Maniobra, costo 1
- **Operaciones Novato** - Gana 1 crédito, costo 0

#### Carta Inicial (1)
- **Tripulante Novato** - Carta de "basura" inicial

#### Cartas Comprables (5)
- **Ataque de Cañón** - 6 daño (6 créditos)
- **Escudos Arriba** - 5 escudo (7 créditos)
- **Reparación Rápida** - 7 HP (8 créditos)
- **Sobrecarga** - +1 energía (10 créditos) - Uncommon
- **Reparación de Emergencia** - 5 HP + Exiliar (15 créditos) - Rare

#### Tripulación (8)
- **Kaelen, Ingeniero** - Tecno-Gremio (8 créditos, Uncommon)
- **Zara, Artillera** - Mercenarios (10 créditos, Rare)
- **Glitch, Saboteador** - Hacktivistas (9 créditos, Rare)
- **Dr. Aris Thorn** - Academia (7 créditos, Common)
- **Capitana Vex** - Mercenarios (12 créditos, Rare)
- **Zyx, Comerciante** - Comerciante (6 créditos, Common)
- **Echo, Piloto A** - Neutral (9 créditos, Uncommon)
- **Nyx, Psíquica** - Academia (11 créditos, Rare)

**Afijos (3):**
- **Eficiente** - Cuesta 1 menos de energía
- **Calibrado** - +2 daño adicional
- **Reforzado** - +3 escudo adicional

**Facciones:**
- Neutral
- Tecno-Gremio
- Mercenarios
- Hacktivistas
- Academia
- Comerciante

---

### 3. 📜 Eventos (`events-converted.json` - 18.97 KB)

**Total: 4 eventos**

#### Encuentros (2)
1. **Transmisión Fantasma**
   - 3 opciones (Decodificar con Dr. Thorn, Responder con protocolo Vex, Ignorar)
   - Requiere tripulación específica o bandera narrativa
   - Recompensas: 15 créditos, 40-50 XP, logro "Ghost in the Machine"
   - Riesgo: 5 daño al casco

2. **Anomalía Inestable**
   - 2 opciones (Analizar 60% éxito, Evitar)
   - Recompensa alto riesgo: 75 XP
   - Penalización: 5-12 daño aleatorio
   - Opción segura: -1 combustible

#### Peligros (2)
1. **Tormenta de Iones**
   - Evento forzado (no se puede evitar)
   - Pérdida aleatoria: 1-3 combustible

2. **Campo de Asteroides Denso**
   - Evento forzado
   - 50% éxito: -2 combustible
   - 50% fallo: -5 créditos

**Características:**
- Sistema de consecuencias probabilísticas
- Múltiples outcomes por opción
- Texto narrativo completo (intro, prompt, reacciones)
- Requisitos de tripulación y banderas narrativas
- Efectos sobre: créditos, combustible, HP, XP, moral
- Sistema de afinidad con tripulación
- Logros desbloqueables

---

### 4. 🏪 Tiendas (`shops-converted.json` - 4.7 KB)

#### Rasgos de Comerciante (4)

1. **Generoso**
   - Modificador precio: 0.75 (25% descuento)
   - Modificador servicios: 0.8 (20% descuento)
   - Puede tener oferta del día: ✅
   - Pool de cartas: Default

2. **Avaro**
   - Modificador precio: 1.25 (25% sobreprecio)
   - Modificador servicios: 1.5 (50% sobreprecio)
   - Puede tener oferta del día: ❌
   - Pool de cartas: Default

3. **Contrabandista**
   - Modificador precio: 1.0 (normal)
   - Modificador servicios: 1.0 (normal)
   - Puede tener oferta del día: ✅
   - Pool de cartas: **Filtrado** - Solo Rare/Epic y Crew

4. **Militar**
   - Modificador precio: 1.0 (normal)
   - Modificador servicios: 1.0 (normal)
   - Puede tener oferta del día: ✅
   - Pool de cartas: **Filtrado** - Solo Attack y Uncommon/Rare

#### Servicios (1)
- **Eliminar Carta** - 10 créditos (base)
  - Permite eliminar una carta del mazo permanentemente
  - Precio afectado por rasgo del comerciante

#### Reglas de Generación
- **Inventario:** 5 cartas
- **Fuente de precios:** Precio base de cada carta
- **Probabilidad de oferta del día:** 80%
- **Oferta del día:** 50% de descuento adicional
- **Distribución de rasgos:** 25% cada uno

---

## 📂 Estructura de Archivos

```
editor/data/
├── ships-converted.json      (6.03 KB)
├── cards-converted.json      (25.75 KB)
├── events-converted.json     (18.97 KB)
├── shops-converted.json      (4.7 KB)
└── README.md                 (Documentación completa)

scripts/
├── convert-ships-to-json.js
├── convert-cards-to-json.js
├── convert-events-to-json.js
└── convert-shops-to-json.js
```

---

## 🎯 Estadísticas Totales

| Categoría | Cantidad |
|-----------|----------|
| **Naves** | 6 (3 jugador + 3 enemigos) |
| **Cartas** | 13 |
| **Afijos** | 3 |
| **Facciones** | 6 |
| **Eventos** | 4 (2 encuentros + 2 peligros) |
| **Rasgos de Tienda** | 4 |
| **Servicios de Tienda** | 1 |
| **Total Tamaño JSON** | ~55 KB |

---

## 🔄 Uso

### Para desarrolladores:
```bash
# Regenerar JSONs desde el código fuente
node scripts/convert-ships-to-json.js > editor/data/ships-converted.json
node scripts/convert-cards-to-json.js > editor/data/cards-converted.json
node scripts/convert-events-to-json.js > editor/data/events-converted.json
node scripts/convert-shops-to-json.js > editor/data/shops-converted.json
```

### Para diseñadores:
1. Abre `editor/index.html` en el navegador
2. Importa los archivos JSON convertidos
3. Edita visualmente
4. Exporta JSON final para el juego

---

## 📋 Próximos Pasos

- [ ] Crear más eventos narrativos
- [ ] Agregar más cartas (target: 50+ cartas)
- [ ] Implementar más servicios de tienda (reparación, mejoras)
- [ ] Crear sistema de diálogos
- [ ] Expandir tripulación con habilidades únicas
- [ ] Sistema de misiones/quests

---

## ⚠️ Notas

- Los archivos JSON tienen encoding UTF-16LE (puede mostrar caracteres especiales españoles incorrectamente en algunos editores)
- Los precios y valores están balanceados para early-game
- Las imágenes usan placeholders de internet (deben reemplazarse con assets definitivos)
- Los efectos de cartas usan IDs (`EFFECT_DAMAGE`, `EFFECT_SHIELD`, etc.) que deben estar implementados en el motor de juego
