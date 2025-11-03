// data/ships.ts
import { ShipData } from '../types';

export const ALL_SHIPS: ShipData[] = [
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
            'CREW_DR_ARIS_THORN', 
            'REPAIR_1', 
        ],
        initialFuel: 15,
        initialCredits: 20, // 10 base + 10 del rasgo
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