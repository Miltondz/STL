/**
 * effects-catalog.js - Catálogo completo de efectos del juego
 */

const EffectsCatalog = {
    // ==================== EFECTOS DE COMBATE ====================
    combat: {
        // Daño
        DAMAGE: { name: 'Daño Directo', description: 'Inflige X puntos de daño', params: ['amount'] },
        DAMAGE_AOE: { name: 'Daño en Área', description: 'Daño a todos los enemigos', params: ['amount'] },
        DAMAGE_PIERCE: { name: 'Daño Perforante', description: 'Ignora escudos', params: ['amount'] },
        DAMAGE_OVER_TIME: { name: 'Daño en el Tiempo', description: 'X daño por Y turnos', params: ['amount', 'turns'] },
        DAMAGE_PERCENT: { name: 'Daño Porcentual', description: 'X% del HP enemigo', params: ['percent'] },
        
        // Defensa
        SHIELD: { name: 'Generar Escudo', description: 'Añade X puntos de escudo', params: ['amount'] },
        SHIELD_ALL: { name: 'Escudo Global', description: 'Escudo a toda la tripulación', params: ['amount'] },
        ARMOR: { name: 'Armadura', description: 'Reduce daño en X por turno', params: ['amount', 'turns'] },
        DODGE: { name: 'Evasión', description: 'X% probabilidad de esquivar', params: ['percent'] },
        COUNTER: { name: 'Contraataque', description: 'Devuelve X% del daño recibido', params: ['percent'] },
        
        // Buffs
        DAMAGE_BOOST: { name: 'Potenciar Daño', description: '+X de daño por Y turnos', params: ['amount', 'turns'] },
        ATTACK_SPEED: { name: 'Velocidad de Ataque', description: 'Ataca X veces', params: ['times'] },
        CRITICAL: { name: 'Crítico', description: 'X% probabilidad de crítico', params: ['percent'] },
        DOUBLE_DAMAGE: { name: 'Daño Doble', description: 'Próximo ataque x2', params: [] },
        
        // Debuffs
        STUN: { name: 'Aturdir', description: 'Enemigo pierde X turnos', params: ['turns'] },
        WEAKEN: { name: 'Debilitar', description: 'Reduce daño enemigo en X%', params: ['percent', 'turns'] },
        VULNERABLE: { name: 'Vulnerable', description: 'Enemigo recibe +X% daño', params: ['percent', 'turns'] },
        POISON: { name: 'Envenenar', description: 'X daño por turno', params: ['amount', 'turns'] },
        BURN: { name: 'Quemar', description: 'Daño creciente por turno', params: ['initialAmount', 'turns'] },
        DISARM: { name: 'Desarmar', description: 'Enemigo no puede atacar', params: ['turns'] },
        
        // Utilidad
        HEAL: { name: 'Curar', description: 'Restaura X HP', params: ['amount'] },
        HEAL_PERCENT: { name: 'Curación %', description: 'Restaura X% del HP máx', params: ['percent'] },
        DRAW_CARD: { name: 'Robar Carta', description: 'Roba X cartas', params: ['amount'] },
        ENERGY: { name: 'Energía', description: 'Genera X puntos de energía', params: ['amount'] },
        EXHAUST: { name: 'Agotar', description: 'Carta se elimina al usarse', params: [] },
        RETAIN: { name: 'Retener', description: 'Carta no se descarta al final', params: [] }
    },

    // ==================== EFECTOS DE NAVE ====================
    ship: {
        REPAIR_HULL: { name: 'Reparar Casco', description: 'Restaura X puntos de casco', params: ['amount'] },
        MAX_HULL_BOOST: { name: 'Aumentar HP Máx', description: '+X HP máximo permanente', params: ['amount'] },
        SHIELD_REGEN: { name: 'Regenerar Escudo', description: 'Recupera X escudo por turno', params: ['amount'] },
        FUEL_EFFICIENT: { name: 'Eficiencia Combustible', description: 'Reduce consumo en X%', params: ['percent'] },
        SPEED_BOOST: { name: 'Aumentar Velocidad', description: 'Más rápido en el mapa', params: [] },
        CARGO_BOOST: { name: 'Aumentar Carga', description: '+X espacios de inventario', params: ['amount'] },
        STEALTH: { name: 'Sigilo', description: 'X% evitar encuentros', params: ['percent'] },
        SCAN_RANGE: { name: 'Rango de Escaneo', description: 'Ve X nodos adicionales', params: ['amount'] }
    },

    // ==================== EFECTOS DE EVENTOS ====================
    events: {
        ADD_CREDITS: { name: 'Ganar Créditos', description: 'Obtiene X créditos', params: ['amount'] },
        LOSE_CREDITS: { name: 'Perder Créditos', description: 'Pierde X créditos', params: ['amount'] },
        ADD_CARD: { name: 'Ganar Carta', description: 'Añade carta al mazo', params: ['cardId'] },
        REMOVE_CARD: { name: 'Perder Carta', description: 'Elimina carta del mazo', params: ['cardId'] },
        UPGRADE_CARD: { name: 'Mejorar Carta', description: 'Mejora una carta', params: ['cardId'] },
        ADD_CREW: { name: 'Reclutar Tripulante', description: 'Añade tripulante', params: ['crewId'] },
        LOSE_CREW: { name: 'Perder Tripulante', description: 'Elimina tripulante', params: ['crewId'] },
        GAIN_REPUTATION: { name: 'Ganar Reputación', description: 'Reputación con facción', params: ['faction', 'amount'] },
        LOSE_REPUTATION: { name: 'Perder Reputación', description: 'Pierde reputación', params: ['faction', 'amount'] },
        SET_FLAG: { name: 'Activar Bandera', description: 'Activa flag narrativa', params: ['flagName'] },
        UNLOCK_AREA: { name: 'Desbloquear Área', description: 'Abre nueva zona', params: ['areaId'] },
        START_COMBAT: { name: 'Iniciar Combate', description: 'Comienza batalla', params: ['combatId'] },
        OPEN_SHOP: { name: 'Abrir Tienda', description: 'Accede a tienda', params: ['shopId'] },
        START_DIALOGUE: { name: 'Iniciar Diálogo', description: 'Comienza conversación', params: ['dialogueId'] }
    },

    // ==================== EFECTOS DE TIENDA ====================
    shop: {
        DISCOUNT: { name: 'Descuento', description: 'X% descuento en compras', params: ['percent'] },
        MARKUP: { name: 'Sobreprecio', description: 'X% aumento de precio', params: ['percent'] },
        FREE_ITEM: { name: 'Item Gratis', description: 'Un item sin costo', params: [] },
        BULK_DISCOUNT: { name: 'Descuento por Volumen', description: 'Descuento al comprar X items', params: ['itemCount', 'percent'] },
        FACTION_DISCOUNT: { name: 'Descuento Facción', description: 'Descuento por reputación', params: ['faction', 'percent'] },
        RESTOCK: { name: 'Reabastecer', description: 'Inventario se renueva', params: [] },
        RARE_ITEMS: { name: 'Items Raros', description: 'Acceso a items especiales', params: [] }
    },

    // ==================== SINERGIAS ====================
    synergy: {
        // Sinergias por rol
        ENGINEER_BONUS: { name: 'Sinergia Ingeniero', description: 'Bonus con otro ingeniero', params: ['bonusType', 'amount'] },
        PILOT_BONUS: { name: 'Sinergia Piloto', description: 'Bonus con otro piloto', params: ['bonusType', 'amount'] },
        GUNNER_BONUS: { name: 'Sinergia Artillero', description: 'Bonus con otro artillero', params: ['bonusType', 'amount'] },
        MEDIC_BONUS: { name: 'Sinergia Médico', description: 'Bonus con otro médico', params: ['bonusType', 'amount'] },
        SCOUT_BONUS: { name: 'Sinergia Explorador', description: 'Bonus con otro explorador', params: ['bonusType', 'amount'] },
        HACKER_BONUS: { name: 'Sinergia Hacker', description: 'Bonus con otro hacker', params: ['bonusType', 'amount'] },
        
        // Sinergias por facción
        FACTION_SYNERGY: { name: 'Sinergia Facción', description: 'Bonus con misma facción', params: ['faction', 'bonusType', 'amount'] },
        MIXED_FACTION: { name: 'Diversidad Facciones', description: 'Bonus por facciones diferentes', params: ['bonusType', 'amount'] },
        ACADEMIA_SYNERGY: { name: 'Sinergia Academia', description: 'Bonus con cartas de Academia', params: ['requiredCount', 'bonusType', 'amount'] },
        MERCENARY_SYNERGY: { name: 'Sinergia Mercenarios', description: 'Bonus con cartas Mercenarias', params: ['requiredCount', 'bonusType', 'amount'] },
        TECHGUILD_SYNERGY: { name: 'Sinergia Tecno-Gremio', description: 'Bonus con cartas del Gremio', params: ['requiredCount', 'bonusType', 'amount'] },
        
        // Sinergias por tipo de carta
        CREW_COMBO: { name: 'Combo Tripulación', description: 'Bonus con X tripulantes', params: ['requiredCount', 'bonusType', 'amount'] },
        EQUIPMENT_SET: { name: 'Set de Equipo', description: 'Bonus por equipo completo', params: ['setId', 'bonusType', 'amount'] },
        ATTACK_CHAIN: { name: 'Cadena de Ataques', description: 'Bonus al jugar varios ataques', params: ['requiredCount', 'bonusType', 'amount'] },
        SKILL_SYNERGY: { name: 'Sinergia de Habilidades', description: 'Bonus con X habilidades', params: ['requiredCount', 'bonusType', 'amount'] },
        
        // Sinergias especiales
        VETERAN_TEAM: { name: 'Equipo Veterano', description: 'Todos rango veterano', params: ['bonusType', 'amount'] },
        BALANCED_TEAM: { name: 'Equipo Balanceado', description: 'Uno de cada rol', params: ['bonusType', 'amount'] },
        SPECIALIZED_TEAM: { name: 'Equipo Especializado', description: 'Todos mismo rol', params: ['role', 'bonusType', 'amount'] },
        RARE_COLLECTION: { name: 'Colección Rara', description: 'Bonus con cartas raras+', params: ['requiredCount', 'bonusType', 'amount'] },
        LOW_COST_DECK: { name: 'Mazo Económico', description: 'Bonus con cartas de bajo costo', params: ['maxCost', 'bonusType', 'amount'] },
        HIGH_COST_POWER: { name: 'Poder de Alto Costo', description: 'Bonus con cartas costosas', params: ['minCost', 'bonusType', 'amount'] },
        
        // Sinergias condicionales
        SHIELD_FOCUS: { name: 'Especialista en Escudos', description: 'Bonus si tienes escudo activo', params: ['bonusType', 'amount'] },
        LOW_HP_DESPERATION: { name: 'Desesperación', description: 'Bonus con HP bajo', params: ['hpThreshold', 'bonusType', 'amount'] },
        FULL_HP_CONFIDENCE: { name: 'Confianza', description: 'Bonus con HP completo', params: ['bonusType', 'amount'] },
        COMBO_STREAK: { name: 'Racha de Combos', description: 'Bonus acumulativo por turno', params: ['bonusType', 'amountPerTurn'] },
        FIRST_TURN_ADVANTAGE: { name: 'Ventaja Primer Turno', description: 'Bonus en el turno 1', params: ['bonusType', 'amount'] }
    },

    // Obtener categorías
    getCategories() {
        return [
            { id: 'combat', name: '⚔️ Combate', effects: this.combat },
            { id: 'ship', name: '🚀 Nave', effects: this.ship },
            { id: 'events', name: '🎲 Eventos', effects: this.events },
            { id: 'shop', name: '🏪 Tienda', effects: this.shop },
            { id: 'synergy', name: '🤝 Sinergia', effects: this.synergy }
        ];
    },

    // Obtener todos los efectos de una categoría
    getEffectsByCategory(category) {
        return this[category] || {};
    },

    // Obtener info de un efecto específico
    getEffectInfo(category, effectId) {
        return this[category]?.[effectId] || null;
    },

    // Buscar efectos
    searchEffects(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        this.getCategories().forEach(cat => {
            Object.entries(cat.effects).forEach(([id, effect]) => {
                if (id.toLowerCase().includes(lowerQuery) || 
                    effect.name.toLowerCase().includes(lowerQuery) ||
                    effect.description.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        category: cat.id,
                        categoryName: cat.name,
                        id,
                        ...effect
                    });
                }
            });
        });
        
        return results;
    }
};

window.EffectsCatalog = EffectsCatalog;
