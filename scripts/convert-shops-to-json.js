// scripts/convert-shops-to-json.js
// Convierte el sistema de tiendas de services/shopManager.ts a formato JSON del editor
// El editor espera un array de tiendas concretas, no un sistema abstracto

const SHOP_TRAITS = {
  generoso: {
    id: 'generoso',
    name: 'Generoso',
    description: 'Un comerciante benevolente que ofrece descuentos.',
    priceModifier: 0.75,
    serviceModifier: 0.8
  },
  avaro: {
    id: 'avaro',
    name: 'Avaro',
    description: 'Un comerciante codicioso que infla los precios.',
    priceModifier: 1.25,
    serviceModifier: 1.5
  },
  contrabandista: {
    id: 'contrabandista',
    name: 'Contrabandista',
    description: 'Especializado en artículos raros y tripulación.',
    priceModifier: 1.0,
    serviceModifier: 1.0
  },
  militar: {
    id: 'militar',
    name: 'Militar',
    description: 'Vende armamento y equipo de combate.',
    priceModifier: 1.0,
    serviceModifier: 1.0
  }
};

// Crear tiendas concretas con diferentes traits
const EXAMPLE_SHOPS = [
  {
    id: 'SHOP_GENEROSO_01',
    name: 'Mercado del Buen Samaritano',
    description: 'Un comerciante benévolo que ayuda a los viajeros.',
    owner: 'Marcus el Generoso',
    location: 'Estación Central',
    traits: [
      {
        id: 'generoso',
        name: 'Generoso',
        description: 'Ofrece descuentos del 25%',
        priceModifier: -0.25
      }
    ],
    inventory: [
      { cardId: 'ATTACK_1', quantity: 3 },
      { cardId: 'DEFEND_1', quantity: 3 },
      { cardId: 'REPAIR_1', quantity: 2 }
    ],
    services: {
      removeCard: true,
      repairHull: true,
      upgradeCard: false
    }
  },
  {
    id: 'SHOP_AVARO_01',
    name: 'Bazaar de Precios Inflados',
    description: 'Un comerciante avaro que cobra de más.',
    owner: 'Zorg el Codicioso',
    location: 'Puerto Oscuro',
    traits: [
      {
        id: 'avaro',
        name: 'Avaro',
        description: 'Precios aumentados en 25%',
        priceModifier: 0.25
      }
    ],
    inventory: [
      { cardId: 'ENERGY_1', quantity: 2 },
      { cardId: 'BASE_REPARACION01', quantity: 1 }
    ],
    services: {
      removeCard: true,
      repairHull: false,
      upgradeCard: false
    }
  },
  {
    id: 'SHOP_CONTRABANDISTA_01',
    name: 'Black Market',
    description: 'Mercancía rara y tripulación experta.',
    owner: 'Sombra',
    location: 'Sector No Regulado',
    traits: [
      {
        id: 'contrabandista',
        name: 'Contrabandista',
        description: 'Vende artículos raros',
        priceModifier: 0
      }
    ],
    inventory: [
      { cardId: 'CREW_ZARA_ARTILLERA', quantity: 1 },
      { cardId: 'CREW_GLITCH_SABOTEADOR', quantity: 1 },
      { cardId: 'CREW_CAPITANA_VEX', quantity: 1 }
    ],
    services: {
      removeCard: true,
      repairHull: false,
      upgradeCard: true
    }
  },
  {
    id: 'SHOP_MILITAR_01',
    name: 'Arsenal Estelar',
    description: 'Armamento y equipo de combate de calidad militar.',
    owner: 'Comandante Rax',
    location: 'Base Militar Alpha',
    traits: [
      {
        id: 'militar',
        name: 'Militar',
        description: 'Especializado en armamento',
        priceModifier: 0
      }
    ],
    inventory: [
      { cardId: 'ATTACK_1', quantity: 5 },
      { cardId: 'DEFEND_1', quantity: 3 },
      { cardId: 'CREW_ZARA_ARTILLERA', quantity: 1 }
    ],
    services: {
      removeCard: false,
      repairHull: true,
      upgradeCard: true
    }
  }
];

const output = {
  version: '1.0.0',
  metadata: {
    title: 'Navegador Galáctico - Shops',
    author: 'Conversion Script',
    lastModified: new Date().toISOString(),
    source: 'services/shopManager.ts',
    gameVersion: '0.1.0'
  },
  shops: EXAMPLE_SHOPS
};

console.log(JSON.stringify(output, null, 2));
