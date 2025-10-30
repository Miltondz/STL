// scripts/convert-events-to-json.js
// Convierte los eventos de constants.ts (ENCOUNTER_DECK y HAZARD_DECK) a formato JSON

const ENCOUNTER_EVENTS = [
  {
    id: 'enc_ghost_transmission',
    title: 'Transmisión Fantasma',
    type: 'ENCOUNTER',
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
        crewRequirement: 'CREW_DR_ARIS_THORN',
        consequences: [
          {
            probability: 0.75,
            outcome: 'success',
            effects: {
              credits: 15,
              xp: 40
            },
            reactionText: 'Dr. Thorn: "Interceptando el flujo de datos. Lo tengo."',
            logText: '¡El Dr. Thorn extrae un paquete de datos de una antigua ruta comercial! Ganas 15 créditos.',
            narrativeFlag: { key: 'ai_fragment_collected', value: true },
            crewAffinity: { crewId: 'CREW_DR_ARIS_THORN', amount: 1 },
            achievementId: 'GHOST_IN_THE_MACHINE'
          },
          {
            probability: 0.25,
            outcome: 'failure',
            effects: {
              hull: -5
            },
            reactionText: 'Dr. Thorn: "¡Cuidado, es una trampa de datos! ¡Nos están friendo los circuitos!"',
            logText: 'El intento de decodificación provoca una sobrecarga. La nave sufre 5 de daño al casco.',
            crewAffinity: { crewId: 'CREW_DR_ARIS_THORN', amount: -1 }
          }
        ]
      },
      {
        text: '[RESPONDER] Enviar un saludo usando el viejo protocolo Vex.',
        narrativeFlagRequirement: 'knows_vex_code',
        consequences: [
          {
            probability: 1.0,
            outcome: 'special',
            effects: {
              xp: 50
            },
            logText: 'La transmisión cesa abruptamente, pero recibes las coordenadas de un punto de encuentro secreto. Un nuevo nodo especial ha aparecido en tu mapa (funcionalidad futura).'
          }
        ]
      },
      {
        text: '[IGNORAR] La señal es probablemente una trampa. Continuar viaje.',
        consequences: [
          {
            probability: 1.0,
            outcome: 'safe',
            effects: {
              moral: -1
            },
            logText: 'Decides no arriesgarte. La tripulación murmura sobre oportunidades perdidas, la moral disminuye.'
          }
        ]
      }
    ]
  },
  {
    id: 'enc_unstable_anomaly',
    title: 'Anomalía Inestable',
    type: 'ENCOUNTER',
    image: 'https://loremflickr.com/800/400/space,anomaly/all?lock=11',
    introText: [
      'Los sensores chillan al detectar una fluctuación espacial justo delante.',
      'Parece una bolsa de realidad inestable, brillando con energía contenida. Podría colapsar en cualquier momento, pero también podría contener una inmensa recompensa.'
    ],
    promptText: 'La prudencia es una opción. El riesgo, otra.',
    options: [
      {
        text: '[ANALIZAR] Arriesgarse a una sobrecarga para obtener datos valiosos. (60% Éxito)',
        consequences: [
          {
            probability: 0.6,
            outcome: 'success',
            effects: {
              xp: 75
            },
            logText: '¡Éxito! Logras escanear la anomalía antes de que se disipe, obteniendo datos de investigación valiosos.'
          },
          {
            probability: 0.4,
            outcome: 'failure',
            effects: {
              hull: { min: -12, max: -5, random: true }
            },
            logText: '¡Fracaso! La anomalía colapsa violentamente. Una onda de choque daña el casco.'
          }
        ]
      },
      {
        text: '[EVITAR] Maniobrar para rodear la anomalía. No vale la pena el riesgo.',
        consequences: [
          {
            probability: 1.0,
            outcome: 'safe',
            effects: {
              fuel: -1
            },
            logText: 'Rodeas la anomalía, consumiendo 1 de combustible extra. Un movimiento seguro.'
          }
        ]
      }
    ]
  }
];

const HAZARD_EVENTS = [
  {
    id: 'haz_01',
    title: 'Tormenta de Iones',
    type: 'HAZARD',
    image: 'https://loremflickr.com/800/400/space,storm/all?lock=12',
    introText: [
      'Una crepitante tormenta de iones envuelve la nave.',
      'Las alarmas aúllan mientras los sistemas de energía fluctúan peligrosamente.'
    ],
    promptText: 'Debes soportar la tormenta y esperar que los sistemas se estabilicen.',
    options: [
      {
        text: 'Soportar la tormenta',
        consequences: [
          {
            probability: 1.0,
            outcome: 'unavoidable',
            effects: {
              fuel: { min: -3, max: -1, random: true }
            },
            logText: 'La tormenta de iones drena los sistemas. Pierdes combustible.'
          }
        ]
      }
    ]
  },
  {
    id: 'haz_02',
    title: 'Campo de Asteroides Denso',
    type: 'HAZARD',
    image: 'https://loremflickr.com/800/400/asteroids,space/all?lock=13',
    introText: [
      'Emerges del hiperespacio directamente en un campo de asteroides no cartografiado.',
      'Rocas del tamaño de cazas pasan zumbando junto al casco.'
    ],
    promptText: 'Tu piloto debe realizar maniobras evasivas extremas.',
    options: [
      {
        text: 'Maniobras evasivas',
        consequences: [
          {
            probability: 0.5,
            outcome: 'success',
            effects: {
              fuel: -2
            },
            logText: 'Navegas con pericia, pero consumes 2 de combustible extra.'
          },
          {
            probability: 0.5,
            outcome: 'damage',
            effects: {
              credits: -5
            },
            logText: 'Un impacto menor daña la bodega. Pierdes 5 créditos en reparaciones.'
          }
        ]
      }
    ]
  }
];

// Convertir la estructura del juego al formato del editor
function convertEvents(events) {
  return events.map(event => ({
    id: event.id,
    title: event.title,
    type: event.type.toLowerCase(), // 'ENCOUNTER' -> 'encounter'
    description: event.introText[0] || '', // Primera línea como descripción
    narrative: {
      intro: event.introText,
      prompt: event.promptText
    },
    options: event.options.map((option, idx) => ({
      id: `${event.id}_opt_${idx}`,
      text: option.text,
      description: '', // El editor lo espera pero no lo tenemos
      requirements: {
        crew: option.crewRequirement || null,
        minCredits: null,
        narrativeFlags: option.narrativeFlagRequirement ? [option.narrativeFlagRequirement] : []
      },
      consequence: {
        rolls: option.consequences.map((consequence, rollIdx) => ({
          id: `roll_${idx}_${rollIdx}`,
          probability: consequence.probability,
          outcome: consequence.outcome,
          effects: consequence.effects,
          reactionText: consequence.reactionText || '',
          logText: consequence.logText,
          narrativeFlag: consequence.narrativeFlag,
          crewAffinity: consequence.crewAffinity,
          achievementId: consequence.achievementId
        }))
      }
    })),
    image: {
      url: event.image,
      orientation: ''
    },
    video: {
      url: ''
    },
    difficulty: '' // El editor lo espera
  }));
}

const output = {
  version: '1.0.0',
  metadata: {
    title: 'Navegador Galáctico - Events Database',
    author: 'Conversion Script',
    lastModified: new Date().toISOString(),
    source: 'constants.ts (ENCOUNTER_DECK, HAZARD_DECK)',
    gameVersion: '0.1.0'
  },
  encounters: convertEvents(ENCOUNTER_EVENTS),
  hazards: convertEvents(HAZARD_EVENTS)
};

console.log(JSON.stringify(output, null, 2));
