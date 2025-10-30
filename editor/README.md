# 🎮 Navegador Galáctico - Content Editor

**Editor visual completo para crear contenido del juego sin tocar código.**

## ✨ Funcionalidad Completa

### 📋 **Editor de Eventos** (100%)
- Crear/Editar/Eliminar eventos (Encuentro/Peligro)
- Narrativa multi-párrafo
- **Consecuencias probabilísticas** con múltiples resultados
- **Imagen resultado diferente** por consecuencia
- Requisitos (tripulante, créditos, flags)
- Preview en tiempo real (ESC para cerrar)

### 🎴 **Editor de Cartas** (100%)
- Tipos: Crew, Attack, Skill, Equipment, Ship
- Stats dinámicos según tipo
- 6 Facciones
- 5 Rarezas

### 🚀 **Editor de Naves** (100%)
- Stats: HP, Escudo, Combustible
- Habilidades especiales

### 🏬 **Editor de Tiendas** (100%)
- Traits con modificadores
- Inventario de cartas
- Servicios configurables

## 🚀 Cómo usar

### Abrir:
```
D:\Proyectos\navegador\editor\index.html
```

### Crear evento con imagen resultado:

1. **+ Nuevo** evento
2. Llenar info básica
3. **+ Nueva Opción**
4. **✏️ Editar** opción → **+ Consecuencia**
5. **✏️ Editar** consecuencia:
   ```
   Formato: probabilidad|log|credits|hullDamage|fuel|xp|imageUrl
   
   Ejemplo éxito:
   75|¡Éxito rotundo!|15|0|0|40|https://i.imgur.com/success.jpg
   
   Ejemplo fallo:
   25|Falló...|0|10|0|0|https://i.imgur.com/failure.jpg
   ```
6. **Guardar** todo
7. **👁️ Preview** para verificar

### Exportar:
- **📥 Exportar JSON** → Descarga archivo
- Compatible con el sistema de contenido del juego

## 📦 Archivos generados:

```json
{
  "version": "1.0.0",
  "metadata": { "lastModified": "..." },
  "encounters": [...],
  "hazards": [...],
  "cards": [...],
  "ships": [...],
  "shops": [...],
  "dialogues": [],
  "eventChains": []
}
```

## 💾 Almacenamiento

- **localStorage** automático
- Exporta JSON regularmente como respaldo

## ⚡ Atajos

- **ESC** - Cerrar preview

---

**Ver documentación completa en:**
- `ARCHITECTURE_SUMMARY.md`
- `EVENT_CHAINS_DESIGN.md`
- `CONTENT_SYSTEM_PLAN.md`
