// scripts/convert-cards-to-json.js
// Convierte las cartas hardcodeadas de data/cards.ts a formato JSON del editor

const CARDS_DATA = {
  // --- CARTAS BASE ---
  'BASE_DISPARO01': {
    id: 'BASE_DISPARO01',
    name: 'Disparo Básico',
    type: 'Attack',
    subtype: 'Resource',
    cost: 1,
    price: 0,
    rarity: 'Common',
    faction: 'Neutral',
    description: 'Inflige 5 de daño.',
    effectBase: 'EFFECT_DAMAGE',
    value: 5,
    possibleAffixes: ['EFFICIENT', 'CALIBRATED'],
    image: 'https://i.ibb.co/ZpWdhy4r/ataque-00-placeholder.jpg',
  },
  'BASE_MANIOBRA01': {
    id: 'BASE_MANIOBRA01',
    name: 'Maniobra Rápida',
    type: 'Skill',
    subtype: 'Defense/Utility',
    cost: 1,
    price: 0,
    rarity: 'Common',
    faction: 'Neutral',
    description: 'Gana 2 Maniobra. Si tu mano está vacía después de jugar, roba 1 carta.',
    effectBase: 'EFFECT_GAIN_MANIOBRA_2',
    image: 'https://i.ibb.co/RkVgnQ5s/maniobra-00-placeholder.jpg',
  },
  'BASE_OPERACIONES01': {
    id: 'BASE_OPERACIONES01',
    name: 'Operaciones Novato',
    type: 'Skill',
    subtype: 'Economy',
    cost: 0,
    price: 0,
    rarity: 'Common',
    faction: 'Neutral',
    description: 'Gana 1 Crédito.',
    effectBase: 'EFFECT_GAIN_CREDITO_1',
    image: 'https://i.ibb.co/KxV15HhD/carta-00-placeholder.jpg',
  },

  // --- CARTAS DE "BASURA" INICIALES ---
  'CREW_TRIPULANTE_NOVATO': {
    id: 'CREW_TRIPULANTE_NOVATO',
    name: 'Tripulante Novato',
    type: 'Crew',
    subtype: 'Base',
    cost: 0,
    price: 0,
    rarity: 'Inicial',
    faction: 'Neutral',
    description: 'Inexperto. P Sinergia: Entrenable con experiencia',
    effectBase: 'CREW_BASIC',
    image: 'https://i.ibb.co/5g11MsYp/tripulacion-23-recluta.jpg',
  },

  // --- CARTAS COMPRABLES Y DE RECOMPENSA ---
  'ATTACK_1': {
    id: 'ATTACK_1',
    name: 'Ataque de Cañón',
    type: 'Attack',
    cost: 1,
    price: 6,
    rarity: 'Common',
    faction: 'Neutral',
    description: 'Inflige 6 de daño.',
    effectBase: 'EFFECT_DAMAGE',
    value: 6,
    possibleAffixes: ['EFFICIENT', 'CALIBRATED'],
    image: 'https://i.ibb.co/ZpWdhy4r/ataque-00-placeholder.jpg',
  },
  'DEFEND_1': {
    id: 'DEFEND_1',
    name: 'Escudos Arriba',
    type: 'Skill',
    cost: 1,
    price: 7,
    rarity: 'Common',
    faction: 'Neutral',
    description: 'Gana 5 de escudo.',
    effectBase: 'EFFECT_SHIELD',
    value: 5,
    possibleAffixes: ['EFFICIENT', 'REINFORCED'],
    image: 'https://i.ibb.co/Nd4qVMwp/defensa-00-placeholder.jpg',
  },
  'REPAIR_1': {
    id: 'REPAIR_1',
    name: 'Reparación Rápida',
    type: 'Skill',
    cost: 2,
    price: 8,
    rarity: 'Common',
    faction: 'Neutral',
    description: 'Repara 7 de casco.',
    effectBase: 'EFFECT_REPAIR',
    value: 7,
    image: 'https://i.ibb.co/4R6XDJ6G/mejora-nave-00-placeholder.jpg',
  },
  'ENERGY_1': {
    id: 'ENERGY_1',
    name: 'Sobrecarga',
    type: 'Skill',
    cost: 0,
    price: 10,
    rarity: 'Uncommon',
    faction: 'Neutral',
    description: 'Gana 1 de Energía.',
    effectBase: 'EFFECT_ENERGY_1',
    image: 'https://i.ibb.co/DPpZ9LtD/equipos-00-placeholder.jpg',
  },
  'BASE_REPARACION01': {
    id: 'BASE_REPARACION01',
    name: 'Reparación de Emergencia',
    type: 'Skill',
    subtype: 'Repair',
    cost: 0,
    price: 15,
    rarity: 'Rare',
    faction: 'Neutral',
    description: 'Repara 5 de Casco. Exiliar.',
    effectBase: 'EFFECT_HEAL_HULL_AND_EXILE',
    value: 5,
    image: 'https://i.ibb.co/4R6XDJ6G/mejora-nave-00-placeholder.jpg',
  },

  // --- CARTAS DE TRIPULACIÓN ---
  'CREW_KAELEN_INGENIERO': {
    id: 'CREW_KAELEN_INGENIERO',
    name: 'Kaelen, Ingeniero',
    type: 'Crew',
    subtype: 'Ingeniero',
    cost: 0,
    price: 8,
    rarity: 'Uncommon',
    faction: 'Tecno-Gremio',
    description: 'Novato. A Sinergia: Tecno-Gremio',
    effectBase: 'CREW_BASIC',
    image: 'https://i.ibb.co/Q38fqKXC/tripulacion-21-ingeniero-veterano.jpg'
  },
  'CREW_ZARA_ARTILLERA': {
    id: 'CREW_ZARA_ARTILLERA',
    name: 'Zara, Artillera',
    type: 'Crew',
    subtype: 'Artillero',
    cost: 0,
    price: 10,
    rarity: 'Rare',
    faction: 'Mercenarios',
    description: 'Experimentada. A Sinergia: Mercenarios',
    effectBase: 'CREW_BASIC',
    image: 'https://i.ibb.co/nqNdsz8R/tripulacion-20-comandante.jpg'
  },
  'CREW_GLITCH_SABOTEADOR': {
    id: 'CREW_GLITCH_SABOTEADOR',
    name: 'Glitch, Saboteador',
    type: 'Crew',
    subtype: 'Saboteador',
    cost: 0,
    price: 9,
    rarity: 'Rare',
    faction: 'Hacktivistas',
    description: 'Infiltrador. A Sinergia: Hacktivistas',
    effectBase: 'CREW_BASIC',
    image: 'https://i.ibb.co/ymc2HTLg/tripulacion-25-psiquica.jpg'
  },
  'CREW_DR_ARIS_THORN': {
    id: 'CREW_DR_ARIS_THORN',
    name: 'Dr. Aris Thorn',
    type: 'Crew',
    subtype: 'Científico',
    cost: 0,
    price: 7,
    rarity: 'Common',
    faction: 'Academia',
    description: 'Investigador. P Sinergia: Academia',
    effectBase: 'CREW_BASIC',
    image: 'https://i.ibb.co/3nRbvQ0/tripulacion-24-ploto-veterano.jpg'
  },
  'CREW_CAPITANA_VEX': {
    id: 'CREW_CAPITANA_VEX',
    name: 'Capitana Vex',
    type: 'Crew',
    subtype: 'Comandante',
    cost: 0,
    price: 12,
    rarity: 'Rare',
    faction: 'Mercenarios',
    description: 'Oficial. P Sinergia: Mercenarios',
    effectBase: 'CREW_BASIC',
    image: 'https://i.ibb.co/nqNdsz8R/tripulacion-20-comandante.jpg'
  },
  'CREW_ZYX_COMERCIANTE': {
    id: 'CREW_ZYX_COMERCIANTE',
    name: 'Zyx, Comerciante',
    type: 'Crew',
    subtype: 'Comerciante',
    cost: 0,
    price: 6,
    rarity: 'Common',
    faction: 'Comerciante',
    description: 'Novato. P Sinergia: Comerciante',
    effectBase: 'CREW_BASIC',
    image: 'https://i.ibb.co/3nRbvQ0/tripulacion-24-ploto-veterano.jpg'
  },
  'CREW_ECHO_PILOTO': {
    id: 'CREW_ECHO_PILOTO',
    name: 'Echo, Piloto A',
    type: 'Crew',
    subtype: 'Piloto',
    cost: 0,
    price: 9,
    rarity: 'Uncommon',
    faction: 'Neutral',
    description: 'Competente. A Habilidades de pilotaje superior',
    effectBase: 'CREW_BASIC',
    image: 'https://i.ibb.co/3Yp47NWk/tripulacion-22-piloto-estrella.jpg'
  },
  'CREW_NYX_PSIQUICA': {
    id: 'CREW_NYX_PSIQUICA',
    name: 'Nyx, Psíquica',
    type: 'Crew',
    subtype: 'Psíquico',
    cost: 0,
    price: 11,
    rarity: 'Rare',
    faction: 'Academia',
    description: 'Iniciada. A Sinergia: Academia',
    effectBase: 'CREW_BASIC',
    image: 'https://i.ibb.co/ymc2HTLg/tripulacion-25-psiquica.jpg'
  },
};

// Afijos definidos
const AFFIXES = {
  EFFICIENT: { name: 'Eficiente', description: 'Cuesta 1 menos de Energía.', costModifier: -1 },
  CALIBRATED: { name: 'Calibrado', description: 'Inflige 2 de daño adicional.', valueModifier: 2 },
  REINFORCED: { name: 'Reforzado', description: 'Otorga 3 de escudo adicional.', valueModifier: 3 }
};

function convertCards() {
  return Object.values(CARDS_DATA).map(card => ({
    id: card.id,
    name: card.name,
    type: card.type,
    subtype: card.subtype || null,
    cost: card.cost,
    price: card.price,
    rarity: card.rarity,
    faction: card.faction,
    description: card.description,
    image: card.image,
    availability: card.price === 0 ? 'always' : 'shop',
    effects: [{
      id: card.effectBase,
      category: card.type === 'Attack' ? 'combat' : card.type === 'Crew' ? 'crew' : 'utility',
      params: {
        value: card.value || 0,
        effectType: card.effectBase
      }
    }],
    metadata: {
      possibleAffixes: card.possibleAffixes || [],
      effectBase: card.effectBase,
      value: card.value
    }
  }));
}

const output = {
  version: '1.0.0',
  metadata: {
    title: 'Navegador Galáctico - Cards Database',
    author: 'Conversion Script',
    lastModified: new Date().toISOString(),
    source: 'data/cards.ts',
    gameVersion: '0.1.0'
  },
  affixes: AFFIXES,
  cards: convertCards()
};

console.log(JSON.stringify(output, null, 2));
