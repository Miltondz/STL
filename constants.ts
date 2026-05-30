import { NodeType, EventCardData, PlayerState, CardInstance, Difficulty } from './types';

// Define colores para cada tipo de nodo para una fácil identificación visual.
export const NODE_COLORS: Record<NodeType, string> = {
  [NodeType.START]: 'text-green-400',
  [NodeType.BATTLE]: 'text-red-400',
  [NodeType.ENCOUNTER]: 'text-yellow-400',
  [NodeType.SHOP]: 'text-blue-400',
  [NodeType.HAZARD]: 'text-orange-400',
  [NodeType.MINI_BOSS]: 'text-purple-400',
  [NodeType.SPECIAL_EVENT]: 'text-cyan-400',
  [NodeType.ELITE]: 'text-pink-400',
  [NodeType.REST]: 'text-teal-400',
  [NodeType.END]: 'text-green-200',
};

// Colores de borde para cada nivel de rareza de carta.
export const RARITY_BORDER_COLORS: Record<string, string> = {
  'Common': 'border-gray-400/50',
  'Uncommon': 'border-green-400/60',
  'Rare': 'border-blue-400/60',
  'Epic': 'border-purple-400/70',
  'Legendary': 'border-yellow-400/70',
};

// Colores de brillo para la rareza de las cartas
export const RARITY_GLOW_COLORS: Record<string, string> = {
  'Common': 'transparent',
  'Uncommon': 'rgba(74, 222, 128, 0.3)', // green-400
  'Rare': 'rgba(96, 165, 250, 0.4)',  // blue-400
  'Epic': 'rgba(192, 132, 252, 0.5)', // purple-400
  'Legendary': 'rgba(250, 204, 21, 0.6)', // yellow-400
};

// Define la cantidad de XP necesaria para alcanzar cada nivel.
// El índice es el nivel (LEVEL_THRESHOLDS[1] es la XP para llegar a nivel 2).
export const LEVEL_THRESHOLDS = [0, 100, 220, 380, 600, 900, 1300, 1800, 2400, 3200];

// Estado base del jugador, que se fusionará con los datos de la nave seleccionada.
export const BASE_PLAYER_STATE: Omit<PlayerState, 'name' | 'fuel' | 'credits' | 'crew' | 'hull' | 'maxHull' | 'shields' | 'maxShields' | 'deck'> & { name: string } = {
  name: "Nave Desconocida",
  moral: 10,
  level: 1,
  xp: 0,
  xpToNextLevel: LEVEL_THRESHOLDS[1],
  narrativeFlags: {},
  crewAffinity: {},
  achievements: [],
  bonusEnergy: 0,
  relics: [],
  relicState: {},
  sector: 1,
};

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  'FIRST_BLOOD':        { id: 'FIRST_BLOOD',        name: 'Primera Sangre',       description: 'Gana tu primer combate.',                       icon: '⚔️' },
  'SECTOR_1_CLEAR':     { id: 'SECTOR_1_CLEAR',      name: 'Frontera Libre',       description: 'Completa el Sector 1.',                         icon: '🏆' },
  'SECTOR_2_CLEAR':     { id: 'SECTOR_2_CLEAR',      name: 'Pirata Cazado',        description: 'Completa el Sector 2.',                         icon: '🏴‍☠️' },
  'SECTOR_3_CLEAR':     { id: 'SECTOR_3_CLEAR',      name: 'Nexo Destruido',       description: 'Completa el Sector 3 — ¡Victoria!',             icon: '🌟' },
  'GHOST_IN_THE_MACHINE': { id: 'GHOST_IN_THE_MACHINE', name: 'Fantasma en la Máquina', description: 'Descifra el fragmento de IA.',              icon: '🤖' },
  'FLAWLESS':           { id: 'FLAWLESS',            name: 'Sin Arañazos',         description: 'Gana un combate sin recibir daño al casco.',    icon: '🛡️' },
  'REACTOR_BREACH':     { id: 'REACTOR_BREACH',      name: 'Colapso Nuclear',      description: 'Destruye el reactor de un jefe.',               icon: '☢️' },
  'RELIC_COLLECTOR':    { id: 'RELIC_COLLECTOR',     name: 'Coleccionista',        description: 'Acumula 5 reliquias en una partida.',           icon: '🔮' },
  'CREW_MASTER':        { id: 'CREW_MASTER',         name: 'Capitán Veterano',     description: 'Asigna 3 tripulantes en un solo combate.',      icon: '👥' },
  'DECKMASTER':         { id: 'DECKMASTER',          name: 'Maestro de Mazos',     description: 'Llega al Sector 2 con más de 20 cartas.',       icon: '🃏' },
  'PACIFIST':           { id: 'PACIFIST',            name: 'Pacifista',            description: 'Supera un encuentro sin daño al enemigo.',      icon: '☮️' },
};

export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; description: string; color: string }> = {
  EASY:   { label: 'Fácil',         description: 'Enemigos con 75% HP y daño.',        color: 'text-green-400' },
  NORMAL: { label: 'Normal',        description: 'Experiencia estándar.',               color: 'text-cyan-400'  },
  HARD:   { label: 'Difícil',       description: 'Enemigos con 130% HP y daño.',       color: 'text-red-400'   },
};


// Mazo de cartas para nodos de Encuentro Aleatorio.
// Cada carta define una situación narrativa con opciones y consecuencias.
export const ENCOUNTER_DECK: EventCardData[] = [
  {
    id: 'enc_ghost_transmission',
    title: 'Transmisión Fantasma',
    type: NodeType.ENCOUNTER,
    image: 'https://loremflickr.com/800/400/nebula,galaxy/all?lock=10',
    introText: [
        'Los sensores de largo alcance captan una transmisión anómala, un eco fragmentado que parece provenir de todas partes y de ninguna a la vez.',
        'Es un antiguo código de la Hegemonía, inactivo durante décadas.',
        'La señal es débil, pero inconfundible.'
    ],
    promptText: '¿Cómo procedes?',
    options: [
      {
        text: '[DECODIFICAR] Usar los sistemas de la nave para descifrar el mensaje.',
        crewRequirement: 'CREW_DR_ARIS_THORN', // Requiere tener al Dr. Thorn en el mazo
        consequence: (state: PlayerState) => {
          const success = Math.random() > 0.25; // 75% de éxito con el científico
          if (success) {
            return {
              newState: { ...state, credits: state.credits + 15 },
              reactionText: 'Dr. Thorn: "Interceptando el flujo de datos. Lo tengo."',
              log: '¡El Dr. Thorn extrae un paquete de datos de una antigua ruta comercial! Ganas 15 créditos.',
              xpGained: 40,
              setNarrativeFlag: { key: 'ai_fragment_collected', value: true },
              crewAffinityChange: { crewId: 'CREW_DR_ARIS_THORN', amount: 1 },
              achievementId: 'GHOST_IN_THE_MACHINE',
            };
          }
          return {
            newState: { ...state, hull: Math.max(0, state.hull - 5) },
            reactionText: 'Dr. Thorn: "¡Cuidado, es una trampa de datos! ¡Nos están friendo los circuitos!"',
            log: 'El intento de decodificación provoca una sobrecarga. La nave sufre 5 de daño al casco.',
            crewAffinityChange: { crewId: 'CREW_DR_ARIS_THORN', amount: -1 },
          };
        },
      },
      {
        text: '[RESPONDER] Enviar un saludo usando el viejo protocolo Vex.',
        narrativeFlagRequirement: 'knows_vex_code', // Requiere una bandera de un evento anterior
        consequence: (state: PlayerState) => ({
          newState: state,
          log: 'La transmisión cesa abruptamente, pero recibes las coordenadas de un punto de encuentro secreto. Un nuevo nodo especial ha aparecido en tu mapa (funcionalidad futura).',
          xpGained: 50,
        }),
      },
      {
        text: '[IGNORAR] La señal es probablemente una trampa. Continuar viaje.',
        consequence: (state: PlayerState) => ({
          newState: { ...state, moral: state.moral - 1 },
          log: 'Decides no arriesgarte. La tripulación murmura sobre oportunidades perdidas, la moral disminuye.',
        }),
      },
    ],
  },
  {
    id: 'enc_unstable_anomaly',
    title: 'Anomalía Inestable',
    type: NodeType.ENCOUNTER,
    image: 'https://loremflickr.com/800/400/space,anomaly/all?lock=11',
    introText: [
        'Los sensores chillan al detectar una fluctuación espacial justo delante.',
        'Parece una bolsa de realidad inestable, brillando con energía contenida. Podría colapsar en cualquier momento, pero también podría contener una inmensa recompensa.'
    ],
    promptText: 'La prudencia es una opción. El riesgo, otra.',
    options: [
      {
        text: '[ANALIZAR] Arriesgarse a una sobrecarga para obtener datos valiosos. (60% Éxito)',
        consequence: (state: PlayerState) => {
          const success = Math.random() > 0.4; // 60% chance of success
          if (success) {
            return {
              newState: { ...state },
              log: '¡Éxito! Logras escanear la anomalía antes de que se disipe, obteniendo datos de investigación valiosos.',
              xpGained: 75, // High XP reward
            };
          }
          const damage = Math.floor(Math.random() * 8) + 5; // 5-12 damage
          return {
            newState: { ...state, hull: Math.max(0, state.hull - damage) },
            log: `¡Fracaso! La anomalía colapsa violentamente. Una onda de choque daña el casco por ${damage} puntos.`,
          };
        },
      },
      {
        text: '[EVITAR] Maniobrar para rodear la anomalía. No vale la pena el riesgo.',
        consequence: (state: PlayerState) => ({
          newState: { ...state, fuel: Math.max(0, state.fuel - 1) },
          log: 'Rodeas la anomalía, consumiendo 1 de combustible extra. Un movimiento seguro.',
        }),
      },
    ],
  },
];

// Mazo de cartas para nodos de Peligro Galáctico.
// Estos eventos suelen tener efectos inmediatos y automáticos.
export const HAZARD_DECK: EventCardData[] = [
  {
    id: 'haz_01',
    title: 'Tormenta de Iones',
    type: NodeType.HAZARD,
    image: 'https://loremflickr.com/800/400/space,storm/all?lock=12',
    introText: [
        'Una crepitante tormenta de iones envuelve la nave.',
        'Las alarmas aúllan mientras los sistemas de energía fluctúan peligrosamente.'
    ],
    promptText: 'Debes soportar la tormenta y esperar que los sistemas se estabilicen.',
    options: [
      {
        text: 'Soportar la tormenta',
        consequence: (state: PlayerState) => {
          const fuelLost = Math.floor(Math.random() * 3) + 1;
          return {
            newState: { ...state, fuel: Math.max(0, state.fuel - fuelLost) },
            log: `La tormenta de iones drena los sistemas. Pierdes ${fuelLost} de combustible.`,
          };
        },
      },
    ],
  },
   {
    id: 'haz_02',
    title: 'Campo de Asteroides Denso',
    type: NodeType.HAZARD,
    image: 'https://loremflickr.com/800/400/asteroids,space/all?lock=13',
    introText: [
        'Emerges del hiperespacio directamente en un campo de asteroides no cartografiado.',
        'Rocas del tamaño de cazas pasan zumbando junto al casco.'
    ],
    promptText: 'Tu piloto debe realizar maniobras evasivas extremas.',
    options: [
      {
        text: 'Maniobras evasivas',
        consequence: (state: PlayerState) => {
           if (Math.random() > 0.5) {
                return {
                    newState: {...state, fuel: Math.max(0, state.fuel - 2)},
                    log: "Navegas con pericia, pero consumes 2 de combustible extra."
                }
           }
           return {
               newState: {...state, credits: Math.max(0, state.credits - 5)},
               log: "Un impacto menor daña la bodega. Pierdes 5 créditos en reparaciones."
           }
        },
      },
    ],
  },
];