// services/shopManager.ts
import { ShopInventory, ShopTrait, ShopCard } from '../types';
import { ALL_CARDS } from '../data/cards';

const SHOP_TRAITS: ShopTrait[] = ['Generoso', 'Avaro', 'Contrabandista', 'Militar'];

// Genera un inventario para el mercader con personalidad.
export const generateShopInventory = (): ShopInventory => {
    const trait = SHOP_TRAITS[Math.floor(Math.random() * SHOP_TRAITS.length)];
    const allCards = Object.values(ALL_CARDS);
    
    let purchasableCards = allCards.filter(c => c.price > 0);
    let inventoryCardIds: string[] = [];

    // 1. Modificar inventario según el rasgo
    switch (trait) {
        case 'Militar':
            purchasableCards = purchasableCards.filter(c => c.type === 'Attack' || c.rarity === 'Uncommon' || c.rarity === 'Rare');
            break;
        case 'Contrabandista':
             purchasableCards = purchasableCards.filter(c => c.rarity === 'Rare' || c.rarity === 'Epic' || c.type === 'Crew');
            break;
        // Generoso y Avaro usan el pool por defecto
        default:
            break;
    }

    // Baraja y escoge una selección de cartas
    const shuffledCards = [...purchasableCards].sort(() => 0.5 - Math.random());
    inventoryCardIds = shuffledCards.slice(0, 5).map(c => c.id);

    // 2. Modificar precios según el rasgo
    let priceModifier = 1.0;
    if (trait === 'Avaro') priceModifier = 1.25;
    if (trait === 'Generoso') priceModifier = 0.75;
    
    const shopCards: ShopCard[] = inventoryCardIds.map(id => {
        const cardData = ALL_CARDS[id];
        return {
            cardId: id,
            price: Math.ceil(cardData.price * priceModifier),
            isDeal: false
        };
    });

    // 3. Crear una "Oferta del Día"
    if (trait !== 'Avaro' && shopCards.length > 0) {
        const dealIndex = Math.floor(Math.random() * shopCards.length);
        shopCards[dealIndex].isDeal = true;
        // 50% de descuento sobre el precio ya modificado
        shopCards[dealIndex].price = Math.ceil(shopCards[dealIndex].price * 0.5); 
    }
    
    // Modificar precios de servicios
    const servicePriceModifier = trait === 'Avaro' ? 1.5 : (trait === 'Generoso' ? 0.8 : 1.0);
    
    return {
        trait,
        cards: shopCards,
        services: [
            { type: 'remove_card', price: Math.ceil(10 * servicePriceModifier) },
        ]
    };
};