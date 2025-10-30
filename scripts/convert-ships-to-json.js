/**
 * Script para convertir naves y enemigos del código TypeScript a JSON del editor
 * 
 * Uso: node scripts/convert-ships-to-json.js
 */

// Datos hardcodeados de ships.ts
const ALL_SHIPS = [
    {
        id: 'IRON_FIST',
        name: 'El Puño de Hierro',
        image: 'https://i.ibb.co/Rp4C1YTC/ship-01-fist.jpg',
        subtype: 'Combate',
        faction: 'Militar',
        description: 'Un coloso de acero, hecho para el combate directo. Nadie discute con su cañón principal.',
        trait: {
            name: 'Arsenal Pesado',
            description: 'Comienzas con un espacio de módulo de arma adicional. Primera compra de arma tiene descuento de 3 Créditos.',
        },
        difficulty: 2,
        initialDeck: [
            'BASE_DISPARO01', 'BASE_DISPARO01', 'BASE_DISPARO01', 'BASE_DISPARO01',
            'BASE_MANIOBRA01', 'BASE_MANIOBRA01',
            'BASE_OPERACIONES01', 'BASE_OPERACIONES01',
            'CREW_ZARA_ARTILLERA', 
            'ATTACK_1', 
        ],
        initialFuel: 12,
        initialCredits: 8,
        maxHull: 60,
        maxShields: 20,
        crew: 1,
    },
    {
        id: 'MERCHANT',
        name: 'El Mercader Errante',
        image: 'https://i.ibb.co/fwnJfGG/ship-01-mercader.jpg',
        subtype: 'Comercio',
        faction: 'Comerciante',
        description: 'De apariencia modesta, pero conectada con cada bazar y contrabandista del sector.',
        trait: {
            name: 'Red de Contactos',
            description: 'Precios de venta 15% mejores. Comienzas con 10 créditos adicionales.',
        },
        difficulty: 1,
        initialDeck: [
            'BASE_DISPARO01', 'BASE_DISPARO01',
            'BASE_MANIOBRA01', 'BASE_MANIOBRA01',
            'BASE_OPERACIONES01', 'BASE_OPERACIONES01', 'BASE_OPERACIONES01', 'BASE_OPERACIONES01',
            'CREW_ZYX_COMERCIANTE', 
            'REPAIR_1', 
        ],
        initialFuel: 15,
        initialCredits: 20,
        maxHull: 50,
        maxShields: 25,
        crew: 1,
    },
    {
        id: 'SPECTRE',
        name: 'El Espectro Silencioso',
        image: 'https://i.ibb.co/mrDszMqq/ship-02-espectro.jpg',
        subtype: 'Sigilo',
        faction: 'Sombras',
        description: 'Invisible a los radares, mortal en la oscuridad. Perfecta para quienes prefieren no ser vistos.',
        trait: {
            name: 'Corredor Fantasma',
            description: 'Gasta 2 combustible para tener un 50% de probabilidad de evitar combates no obligatorios.',
        },
        difficulty: 3,
        initialDeck: [
            'BASE_DISPARO01', 'BASE_DISPARO01',
            'BASE_MANIOBRA01', 'BASE_MANIOBRA01', 'BASE_MANIOBRA01', 'BASE_MANIOBRA01',
            'BASE_OPERACIONES01',
            'CREW_GLITCH_SABOTEADOR', 
            'DEFEND_1' 
        ],
        initialFuel: 20,
        initialCredits: 5,
        maxHull: 40,
        maxShields: 10,
        crew: 1,
    },
];

// Datos hardcodeados de enemies.ts
const ENEMY_TEMPLATES = {
    PIRATE_RAIDER: {
        id: 'PIRATE_RAIDER',
        name: 'Incursor Pirata',
        image: 'https://i.ibb.co/cc3KwbCG/ship-50-pirata.jpg',
        maxHp: 20,
        maxShield: 10,
        baseDamage: 5,
        reward: { credits: 8, xpReward: 25 },
        pattern: ['ATTACK', 'ATTACK_DEFEND', 'ATTACK'],
        patternIndex: 0,
    },
    HEAVY_DRONE: {
        id: 'HEAVY_DRONE',
        name: 'Dron Pesado',
        image: 'https://i.ibb.co/fYVmhtxT/ship-52-dron.jpg',
        maxHp: 30,
        maxShield: 5,
        baseDamage: 7,
        reward: { credits: 12, xpReward: 40 },
        pattern: ['DEFEND', 'ATTACK', 'ATTACK'],
        patternIndex: 0,
    },
    MINIBOSS_CORVETTE: {
        id: 'MINIBOSS_CORVETTE',
        name: 'Corbeta de Élite',
        image: 'https://i.ibb.co/S7JwCS5b/ship-30-destructor.jpg',
        maxHp: 50,
        maxShield: 25,
        baseDamage: 8,
        reward: { credits: 30, xpReward: 100 },
        pattern: ['DEFEND', 'ATTACK', 'BUFF', 'ATTACK'],
        patternIndex: 0,
    },
};

// Convertir a formato del editor
function convertPlayerShips() {
    return ALL_SHIPS.map(ship => ({
        id: ship.id,
        name: ship.name,
        description: ship.description,
        image: ship.image,
        availability: 'always', // Por defecto todas disponibles
        maxHull: ship.maxHull,
        maxFuel: ship.initialFuel,
        maxShields: ship.maxShields,
        specialAbility: {
            name: ship.trait.name,
            description: ship.trait.description,
            effect: '' // Se puede agregar manualmente
        },
        effects: [], // Se pueden agregar manualmente en el editor
        // Metadata adicional
        metadata: {
            type: 'player',  // Identificador claro
            subtype: ship.subtype,
            faction: ship.faction,
            difficulty: ship.difficulty,
            initialDeck: ship.initialDeck,
            initialCredits: ship.initialCredits,
            crewSlots: ship.crew
        }
    }));
}

function convertEnemyShips() {
    return Object.values(ENEMY_TEMPLATES).map(enemy => ({
        id: enemy.id,
        name: enemy.name,
        description: `Enemigo de combate - ${enemy.baseDamage} de daño base`,
        image: enemy.image,
        availability: 'hidden', // Enemigos no aparecen en hangar
        maxHull: enemy.maxHp,
        maxFuel: 0,
        maxShields: enemy.maxShield,
        specialAbility: {
            name: 'Patrón de Combate',
            description: `Patrón: ${enemy.pattern.join(' → ')}`,
            effect: enemy.pattern.join(',')
        },
        effects: [],
        // Metadata adicional
        metadata: {
            type: 'enemy',
            baseDamage: enemy.baseDamage,
            reward: enemy.reward,
            pattern: enemy.pattern,
            patternIndex: enemy.patternIndex
        }
    }));
}

// Generar JSON en formato 100% compatible con el editor
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
    ships: [...convertPlayerShips(), ...convertEnemyShips()],
    shops: [],
    dialogues: [],
    eventChains: []
};

// Output
console.log('='.repeat(80));
console.log('CONVERSIÓN DE NAVES COMPLETADA');
console.log('='.repeat(80));
console.log('');
console.log(`✅ Naves totales: ${output.ships.length}`);
console.log(`   - Naves de jugador: ${convertPlayerShips().length}`);
console.log(`   - Naves enemigas: ${convertEnemyShips().length}`);
console.log('');
console.log('JSON generado:');
console.log('');
console.log(JSON.stringify(output, null, 2));
console.log('');
console.log('='.repeat(80));
console.log('INSTRUCCIONES:');
console.log('='.repeat(80));
console.log('1. Copia el JSON de arriba');
console.log('2. Guárdalo como: editor/data/ships-converted.json');
console.log('3. Importa en el editor usando el botón "Importar JSON"');
console.log('4. Edita/ajusta según necesites');
console.log('5. Exporta el JSON final desde el editor');
console.log('='.repeat(80));
