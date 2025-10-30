/**
 * templates.js - Plantillas predefinidas para todos los editores
 */

const Templates = {
    // ==================== CARTAS ====================
    cards: {
        crew_engineer: {
            name: '🔧 Ingeniero Veterano',
            description: 'Ingeniero de nave con 15 años de experiencia',
            type: 'Crew',
            cost: 2,
            price: 150,
            rarity: 'Uncommon',
            faction: 'Neutral',
            stats: { role: 'Ingeniero', rank: 'Veterano' }
        },
        crew_pilot: {
            name: '🚀 Piloto Experto',
            description: 'Piloto con reflejos excepcionales y conocimiento de rutas peligrosas',
            type: 'Crew',
            cost: 3,
            price: 200,
            rarity: 'Rare',
            faction: 'Neutral',
            stats: { role: 'Piloto', rank: 'Experimentado' }
        },
        crew_gunner: {
            name: '🎯 Artillero',
            description: 'Especialista en armamento de nave',
            type: 'Crew',
            cost: 2,
            price: 120,
            rarity: 'Common',
            faction: 'Mercenarios',
            stats: { role: 'Artillero', rank: 'Competente' }
        },
        attack_laser: {
            name: '⚡ Láser de Combate',
            description: 'Arma láser estándar con buena precisión',
            type: 'Attack',
            cost: 1,
            price: 80,
            rarity: 'Common',
            faction: 'Neutral',
            stats: { damage: 8, attackType: 'energy' }
        },
        attack_missile: {
            name: '🚀 Misil Pesado',
            description: 'Misil de alto impacto que atraviesa escudos',
            type: 'Attack',
            cost: 3,
            price: 180,
            rarity: 'Rare',
            faction: 'Mercenarios',
            stats: { damage: 15, attackType: 'physical' }
        },
        skill_shield: {
            name: '🛡️ Escudos Reforzados',
            description: 'Activa una capa adicional de protección',
            type: 'Skill',
            cost: 2,
            price: 100,
            rarity: 'Common',
            faction: 'Neutral',
            stats: { effect: 'SHIELD', value: 10 }
        },
        skill_repair: {
            name: '🔧 Reparación de Emergencia',
            description: 'Repara el casco de la nave rápidamente',
            type: 'Skill',
            cost: 2,
            price: 120,
            rarity: 'Uncommon',
            faction: 'Neutral',
            stats: { effect: 'REPAIR', value: 8 }
        }
    },

    // ==================== NAVES ====================
    ships: {
        scout: {
            name: 'Explorador Ligero',
            description: 'Nave pequeña y ágil, perfecta para misiones de reconocimiento',
            maxHull: 20,
            maxShields: 15,
            maxFuel: 15,
            specialAbility: {
                name: 'Evasión Mejorada',
                description: 'Esquiva el 25% de los ataques enemigos',
                effect: 'DODGE_25'
            }
        },
        fighter: {
            name: 'Cazador de Combate',
            description: 'Nave de combate equilibrada con buen armamento',
            maxHull: 30,
            maxShields: 20,
            maxFuel: 10,
            specialAbility: {
                name: 'Sobrecarga de Armas',
                description: '+3 de daño en todos los ataques este turno',
                effect: 'DAMAGE_BOOST_3'
            }
        },
        freighter: {
            name: 'Carguero Pesado',
            description: 'Nave grande y resistente, ideal para transporte',
            maxHull: 50,
            maxShields: 30,
            maxFuel: 8,
            specialAbility: {
                name: 'Casco Reforzado',
                description: 'Reduce todo el daño recibido en 2',
                effect: 'DAMAGE_REDUCTION_2'
            }
        }
    },

    // ==================== TIENDAS ====================
    shops: {
        military: {
            name: 'Arsenal Militar',
            owner: 'Comandante Krask',
            location: 'Estación Militar Alpha',
            description: 'Tienda especializada en armamento y equipo de combate de grado militar.',
            traits: [
                { id: 'trait_military', name: 'Arsenal Completo', description: 'Gran variedad de armas', priceModifier: 0.1 },
                { id: 'trait_quality', name: 'Alta Calidad', description: 'Equipo de primera línea', priceModifier: 0.2 }
            ],
            services: { removeCard: false, repairHull: true, upgradeCard: true },
            inventory: [
                { cardId: 'ATTACK_LASER_01', quantity: 3 },
                { cardId: 'ATTACK_MISSILE_01', quantity: 2 },
                { cardId: 'SKILL_SHIELD_01', quantity: 2 }
            ]
        },
        civilian: {
            name: 'Mercado de la Estación',
            owner: 'Marina Voss',
            location: 'Estación Comercial Nexus',
            description: 'Tienda general con productos variados a precios razonables.',
            traits: [
                { id: 'trait_discount', name: 'Precios Justos', description: 'Descuentos para todos', priceModifier: -0.15 }
            ],
            services: { removeCard: true, repairHull: true, upgradeCard: false },
            inventory: [
                { cardId: 'CREW_ENGINEER_01', quantity: 1 },
                { cardId: 'SKILL_REPAIR_01', quantity: 2 },
                { cardId: 'ATTACK_LASER_01', quantity: 2 }
            ]
        },
        black_market: {
            name: 'Mercado Negro',
            owner: 'Desconocido',
            location: 'Sector Prohibido',
            description: 'Tienda clandestina con mercancía de dudosa procedencia y tecnología experimental.',
            traits: [
                { id: 'trait_illegal', name: 'Mercancía Ilegal', description: 'Productos sin garantía', priceModifier: -0.3 },
                { id: 'trait_risky', name: 'Alto Riesgo', description: 'Puede haber sorpresas', priceModifier: -0.2 }
            ],
            services: { removeCard: true, repairHull: false, upgradeCard: true },
            inventory: [
                { cardId: 'ATTACK_EXPERIMENTAL_01', quantity: 1 },
                { cardId: 'CREW_HACKER_01', quantity: 1 },
                { cardId: 'SKILL_CLOAK_01', quantity: 1 }
            ]
        }
    },

    // ==================== DIÁLOGOS ====================
    dialogues: {
        merchant_greeting: {
            speaker: 'Mercader',
            speakerCardId: 'CREW_MERCHANT_01',
            text: '¡Bienvenido, viajero! ¿Buscas provisiones para tu nave o quizás información sobre las rutas seguras?',
            conditions: [],
            options: [
                { text: 'Muéstrame tu mercancía', cardId: 'CREW_MERCHANT_01', nextDialogueId: 'merchant_shop', action: 'openShop:merchant_station' },
                { text: 'Cuéntame sobre las rutas', cardId: 'CREW_MERCHANT_01', nextDialogueId: 'merchant_routes', action: '' },
                { text: 'No necesito nada, adiós', cardId: '', nextDialogueId: '', action: 'endDialogue' }
            ]
        },
        distress_signal: {
            speaker: 'Piloto en Apuros',
            speakerCardId: 'CREW_PILOT_02',
            text: '¡*interferencia*... ¡Necesito ayuda urgente! Mi nave está dañada y tengo piratas en el radar. ¿Puedes ayudarme?',
            conditions: [],
            options: [
                { text: 'Iré a ayudarte inmediatamente', cardId: 'CREW_PILOT_02', nextDialogueId: 'rescue_combat', action: 'startCombat:pirate_ambush' },
                { text: 'Puedo darte suministros [Cuesta 50 créditos]', cardId: 'CREW_PILOT_02', nextDialogueId: 'rescue_peaceful', action: 'addCredits:-50,giveCard:SKILL_REPAIR_01' },
                { text: 'Lo siento, es muy peligroso', cardId: '', nextDialogueId: 'rescue_refused', action: 'setFlag:refused_rescue' }
            ]
        },
        mysterious_stranger: {
            speaker: '???',
            speakerCardId: 'CREW_HACKER_01',
            text: 'He estado observándote. Tienes potencial. Tengo información que podría interesarte... por el precio correcto.',
            conditions: [
                { type: 'minCredits', value: '200' }
            ],
            options: [
                { text: 'Te escucho [Pagar 200 créditos]', cardId: 'CREW_HACKER_01', nextDialogueId: 'stranger_info', action: 'addCredits:-200,setFlag:bought_info' },
                { text: '¿Quién eres?', cardId: 'CREW_HACKER_01', nextDialogueId: 'stranger_identity', action: '' },
                { text: 'No me interesa', cardId: '', nextDialogueId: '', action: 'endDialogue' }
            ]
        },
        mission_offer: {
            speaker: 'Oficial de Misiones',
            speakerCardId: 'CREW_OFFICER_01',
            text: 'Tenemos un trabajo para alguien con tus habilidades. Se trata de escoltar un convoy hasta el sector Omega. Es peligroso pero paga bien.',
            conditions: [],
            options: [
                { text: 'Acepto la misión', cardId: 'CREW_OFFICER_01', nextDialogueId: 'mission_start', action: 'setFlag:mission_accepted,startChain:escort_mission' },
                { text: 'Necesito más detalles', cardId: 'CREW_OFFICER_01', nextDialogueId: 'mission_details', action: '' },
                { text: 'Rechazar la misión', cardId: '', nextDialogueId: '', action: 'endDialogue' }
            ]
        }
    },

    // ==================== EVENTOS ====================
    events: {
        merchant_encounter: {
            title: 'Encuentro con Mercader',
            type: 'encounter',
            difficulty: 'easy',
            description: 'Un mercader viajero ofrece sus mercancías',
            narrative: {
                intro: ['Te encuentras con un mercader espacial en una estación de servicio.', 'Él te saluda amigablemente y te muestra su inventario.'],
                prompt: '¿Qué haces?'
            },
            options: [
                { id: 'buy', text: '[COMPRAR] Ver sus productos', description: 'Accede a la tienda' },
                { id: 'trade', text: '[NEGOCIAR] Intercambiar información', description: 'Ganas 50 créditos' },
                { id: 'leave', text: '[IRSE] Agradecer y continuar', description: 'Sin consecuencias' }
            ],
            image: { url: '', orientation: 'horizontal' },
            video: { url: '' }
        },
        pirate_ambush: {
            title: 'Emboscada Pirata',
            type: 'encounter',
            difficulty: 'hard',
            description: 'Piratas te atacan por sorpresa',
            narrative: {
                intro: ['Detectas naves enemigas en el radar.', '¡Son piratas y están cerrando la distancia rápidamente!'],
                prompt: '¿Cómo respondes?'
            },
            options: [
                { id: 'fight', text: '[COMBATIR] Preparar armas', description: 'Inicia combate difícil' },
                { id: 'flee', text: '[HUIR] Activar propulsores', description: 'Pierde 2 combustible' },
                { id: 'bribe', text: '[SOBORNAR] Ofrecer 100 créditos', description: 'Evita combate' }
            ],
            image: { url: '', orientation: 'horizontal' },
            video: { url: '' }
        },
        distress_beacon: {
            title: 'Señal de Socorro',
            type: 'encounter',
            difficulty: 'medium',
            description: 'Una nave en apuros envía una señal SOS',
            narrative: {
                intro: ['Recibes una señal de socorro débil.', 'Una nave dañada pide ayuda urgente.'],
                prompt: '¿Ayudarás?'
            },
            options: [
                { id: 'rescue', text: '[RESCATAR] Ir en su ayuda', description: 'Ganas tripulante o recompensa' },
                { id: 'supplies', text: '[ENVIAR] Mandar suministros', description: 'Pierde 1 carta, gana reputación' },
                { id: 'ignore', text: '[IGNORAR] Seguir tu camino', description: 'Sin consecuencias' }
            ],
            image: { url: '', orientation: 'horizontal' },
            video: { url: '' }
        },
        asteroid_field: {
            title: 'Campo de Asteroides',
            type: 'hazard',
            difficulty: 'medium',
            description: 'Debes navegar por un peligroso campo de asteroides',
            narrative: {
                intro: ['Tu ruta atraviesa un denso campo de asteroides.', 'Navegar aquí será peligroso.'],
                prompt: '¿Qué haces?'
            },
            options: [
                { id: 'navigate', text: '[PILOTO] Navegar cuidadosamente', description: 'Requiere piloto hábil' },
                { id: 'shields', text: '[ESCUDOS] Activar escudos y atravesar', description: 'Pierde escudos' },
                { id: 'detour', text: '[RODEAR] Buscar ruta alternativa', description: 'Pierde 2 combustible' }
            ],
            image: { url: '', orientation: 'horizontal' },
            video: { url: '' }
        },
        ancient_artifact: {
            title: 'Artefacto Antiguo',
            type: 'encounter',
            difficulty: '',
            description: 'Descubres un misterioso artefacto alienígena',
            narrative: {
                intro: ['Encuentras los restos de una antigua civilización.', 'Hay un extraño artefacto brillante en el centro.'],
                prompt: '¿Qué haces con el artefacto?'
            },
            options: [
                { id: 'study', text: '[EXAMINAR] Estudiar el artefacto', description: 'Ganas carta única o efecto' },
                { id: 'take', text: '[TOMAR] Llevarlo contigo', description: 'Ganas item especial' },
                { id: 'leave', text: '[DEJAR] No tocarlo', description: 'Sin consecuencias' }
            ],
            image: { url: '', orientation: 'horizontal' },
            video: { url: '' }
        }
    },

    // ==================== CADENAS NARRATIVAS ====================
    chains: {
        tutorial: {
            name: 'Tutorial: Primeros Pasos',
            description: 'Misión introductoria que enseña los fundamentos del juego',
            startNode: 'tutorial_start',
            nodes: [
                { id: 'tutorial_start', type: 'dialogue', reference: 'tutorial_welcome', conditions: null, next: 'tutorial_combat' },
                { id: 'tutorial_combat', type: 'combat', reference: 'tutorial_easy_fight', conditions: null, next: 'tutorial_shop' },
                { id: 'tutorial_shop', type: 'shop', reference: 'shop_tutorial_station', conditions: null, next: 'tutorial_complete' },
                { id: 'tutorial_complete', type: 'dialogue', reference: 'tutorial_congratulations', conditions: null, next: '' }
            ]
        },
        rescue_mission: {
            name: 'Misión de Rescate',
            description: 'Una nave en apuros pide ayuda. Decisiones morales y combate.',
            startNode: 'rescue_distress',
            nodes: [
                { id: 'rescue_distress', type: 'dialogue', reference: 'distress_signal', conditions: null, next: 'rescue_choice' },
                { id: 'rescue_choice', type: 'choice', reference: 'rescue_decision', conditions: null, next: 'rescue_combat' },
                { id: 'rescue_combat', type: 'combat', reference: 'pirate_ambush', conditions: { type: 'flag', value: 'help_distress' }, next: 'rescue_reward' },
                { id: 'rescue_reward', type: 'dialogue', reference: 'grateful_pilot', conditions: null, next: '' }
            ]
        },
        merchant_quest: {
            name: 'Ruta Comercial',
            description: 'Establecer una ruta comercial lucrativa entre estaciones',
            startNode: 'merchant_intro',
            nodes: [
                { id: 'merchant_intro', type: 'dialogue', reference: 'merchant_greeting', conditions: null, next: 'merchant_shop' },
                { id: 'merchant_shop', type: 'shop', reference: 'merchant_station', conditions: null, next: 'merchant_travel' },
                { id: 'merchant_travel', type: 'event', reference: 'trade_route_event', conditions: null, next: 'merchant_delivery' },
                { id: 'merchant_delivery', type: 'dialogue', reference: 'merchant_thanks', conditions: null, next: '' }
            ]
        },
        military_campaign: {
            name: 'Campaña Militar',
            description: 'Serie de misiones de combate para las fuerzas armadas',
            startNode: 'military_briefing',
            nodes: [
                { id: 'military_briefing', type: 'dialogue', reference: 'mission_offer', conditions: null, next: 'military_prep' },
                { id: 'military_prep', type: 'shop', reference: 'military_arsenal', conditions: null, next: 'military_battle1' },
                { id: 'military_battle1', type: 'combat', reference: 'enemy_patrol', conditions: null, next: 'military_battle2' },
                { id: 'military_battle2', type: 'combat', reference: 'enemy_frigate', conditions: { type: 'flag', value: 'battle1_won' }, next: 'military_boss' },
                { id: 'military_boss', type: 'combat', reference: 'enemy_flagship', conditions: null, next: 'military_victory' },
                { id: 'military_victory', type: 'dialogue', reference: 'mission_complete', conditions: null, next: '' }
            ]
        },
        mystery_story: {
            name: 'El Misterio de la Estación Perdida',
            description: 'Investigación de una estación abandonada con secretos oscuros',
            startNode: 'mystery_arrival',
            nodes: [
                { id: 'mystery_arrival', type: 'dialogue', reference: 'mysterious_stranger', conditions: null, next: 'mystery_station' },
                { id: 'mystery_station', type: 'event', reference: 'abandoned_station', conditions: null, next: 'mystery_choice' },
                { id: 'mystery_choice', type: 'choice', reference: 'investigate_station', conditions: null, next: 'mystery_danger' },
                { id: 'mystery_danger', type: 'combat', reference: 'station_defenses', conditions: { type: 'flag', value: 'entered_station' }, next: 'mystery_revelation' },
                { id: 'mystery_revelation', type: 'dialogue', reference: 'station_secret', conditions: null, next: '' }
            ]
        }
    },

    // Método para obtener todas las plantillas de un tipo
    getTemplates(type) {
        return this[type] || {};
    },

    // Método para obtener los nombres de las plantillas
    getTemplateNames(type) {
        const templates = this.getTemplates(type);
        return Object.keys(templates).map(key => ({
            id: key,
            name: this.getTemplateFriendlyName(type, key),
            data: templates[key]
        }));
    },

    // Nombres amigables para las plantillas
    getTemplateFriendlyName(type, key) {
        const names = {
            // Cards
            crew_engineer: '🔧 Ingeniero Veterano',
            crew_pilot: '🚀 Piloto Experto',
            crew_gunner: '🎯 Artillero',
            attack_laser: '⚡ Láser de Combate',
            attack_missile: '🚀 Misil Pesado',
            skill_shield: '🛡️ Escudos Reforzados',
            skill_repair: '🔧 Reparación de Emergencia',
            // Ships
            scout: '🔍 Explorador Ligero',
            fighter: '⚔️ Cazador de Combate',
            freighter: '📦 Carguero Pesado',
            // Shops
            military: '🎖️ Arsenal Militar',
            civilian: '🏪 Mercado Civil',
            black_market: '🕶️ Mercado Negro',
            // Events
            merchant_encounter: '💰 Encuentro con Mercader',
            pirate_ambush: '🏴‍☠️ Emboscada Pirata',
            distress_beacon: '🆘 Señal de Socorro',
            asteroid_field: '☀️ Campo de Asteroides',
            ancient_artifact: '💿 Artefacto Antiguo',
            // Dialogues
            merchant_greeting: '💰 Saludo de Mercader',
            distress_signal: '🆘 Señal de Socorro',
            mysterious_stranger: '❓ Extraño Misterioso',
            mission_offer: '📋 Oferta de Misión',
            // Chains
            tutorial: '📚 Tutorial Completo',
            rescue_mission: '🆘 Misión de Rescate',
            merchant_quest: '💰 Ruta Comercial',
            military_campaign: '⚔️ Campaña Militar',
            mystery_story: '🔍 Misterio de la Estación'
        };
        return names[key] || key;
    }
};

// Exportar globalmente
window.Templates = Templates;
