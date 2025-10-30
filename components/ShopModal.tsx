// components/ShopModal.tsx
import React, { useState } from 'react';
import { ShopInventory, PlayerState, ShopServiceType, ShopCard, CardInstance } from '../types';
import { ALL_CARDS } from '../data/cards';
import { Card } from './Card';

interface ShopModalProps {
  inventory: ShopInventory;
  playerState: PlayerState;
  onBuyCard: (card: ShopCard) => void;
  onPerformService: (serviceType: ShopServiceType, cardInstanceId?: string) => void;
  onClose: () => void;
}

// Componente para el encabezado de la tienda con personalidad
const ShopHeader: React.FC<{ trait: ShopInventory['trait']; credits: number }> = ({ trait, credits }) => {
    const details = {
        'Generoso': { title: "Emporio Estelar 'El Cometa Afortunado'", flavor: "¡Precios tan bajos que parecen de otra galaxia! El propietario te saluda con una amplia sonrisa." },
        'Avaro': { title: "Puesto de Troc-Troc 7", flavor: "El mercader te mira con recelo, protegiendo su mercancía. Cada crédito cuenta aquí." },
        'Contrabandista': { title: "El Escondite del Nebula", flavor: "En las sombras del local, se ofrecen artículos difíciles de encontrar... por el precio adecuado." },
        'Militar': { title: "Suministros Tácticos 'Martillo y Yunque'", flavor: "Todo lo que necesitas para el combate. Eficiencia y potencia de fuego garantizadas." }
    };
    const info = details[trait];

    return (
        <div>
            <h2 className="text-4xl font-orbitron text-cyan-300">{info.title}</h2>
            <p className="text-gray-400 mt-1">{info.flavor}</p>
            <p className="text-gray-300 mt-2">Tus Créditos: <span className="font-bold text-yellow-400">{credits} 💰</span></p>
        </div>
    );
};


// Componente para mostrar una carta en la tienda
const ShopCardItem: React.FC<{ shopCard: ShopCard; playerCredits: number; onBuy: (shopCard: ShopCard) => void; }> = ({ shopCard, playerCredits, onBuy }) => {
    const cardData = ALL_CARDS[shopCard.cardId];
    if (!cardData) return null;
    const canAfford = playerCredits >= shopCard.price;
    const dealClasses = shopCard.isDeal ? 'shadow-lg shadow-yellow-400/40 border-yellow-400/80' : '';

    const cardInstance: CardInstance = { instanceId: `shop_${shopCard.cardId}`, cardId: shopCard.cardId };

    return (
        <div className={`flex flex-col items-center gap-2 relative transition-all duration-300 ${dealClasses} rounded-xl p-1`}>
            {shopCard.isDeal && <div className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold text-xs px-2 py-1 rounded-full z-10 transform rotate-12 animate-pulse">OFERTA</div>}
            <Card cardInstance={cardInstance} onClick={() => {}} disabled={!canAfford} />
            <button
                onClick={() => onBuy(shopCard)}
                disabled={!canAfford}
                className={`w-full font-orbitron text-sm p-2 rounded-md border flex justify-center items-center gap-2
                disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-500
                bg-green-700/80 border-green-500/70 hover:enabled:bg-green-600/80 hover:enabled:border-green-400`}
            >
                <span>Comprar</span>
                <span className="flex items-center font-bold text-yellow-300">
                  {shopCard.price}
                  <span className="ml-1">💰</span>
                </span>
            </button>
        </div>
    );
};

// Componente para un servicio de la tienda
const ShopServiceItem: React.FC<{ serviceType: ShopServiceType; price: number; playerCredits: number; onPerform: (serviceType: ShopServiceType) => void; }> = ({ serviceType, price, playerCredits, onPerform }) => {
    const canAfford = playerCredits >= price;
    const descriptions = {
        'remove_card': `Elimina permanentemente una carta de tu mazo por ${price} créditos.`,
        'repair_hull': `Repara el casco por ${price} créditos. (No implementado)`,
        'upgrade_card': `Mejora una carta por ${price} créditos. (No implementado)`
    };

    return (
        <button
            onClick={() => onPerform(serviceType)}
            disabled={!canAfford || serviceType !== 'remove_card'} // Deshabilitar servicios no implementados
            className={`w-full text-left p-4 rounded-md border transition-all duration-200 
            ${!canAfford || serviceType !== 'remove_card' ? 'bg-gray-800/50 border-gray-600/50 text-gray-500 cursor-not-allowed' :
            'bg-gray-700/50 border-cyan-600/50 hover:bg-cyan-500/20 hover:border-cyan-400'}`}
        >
            <p className="font-bold font-orbitron">{serviceType.replace('_', ' ').toUpperCase()}</p>
            <p className="text-sm text-gray-300">{descriptions[serviceType]}</p>
        </button>
    );
};

export const ShopModal: React.FC<ShopModalProps> = ({ inventory, playerState, onBuyCard, onPerformService, onClose }) => {
  const [isRemovingCard, setIsRemovingCard] = useState(false);

  const handleServiceClick = (serviceType: ShopServiceType) => {
      if (serviceType === 'remove_card') {
          setIsRemovingCard(true);
      } else {
          // onPerformService(serviceType); // Para futuros servicios
      }
  };

  const handleRemoveCard = (cardInstanceId: string) => {
      onPerformService('remove_card', cardInstanceId);
      setIsRemovingCard(false);
  };
  
  if (isRemovingCard) {
      const service = inventory.services.find(s => s.type === 'remove_card')!;
      return (
          <div className="fixed inset-0 z-40 bg-gray-900/95 flex flex-col items-center p-4 animate-zoom-in-fade">
              <h2 className="text-3xl font-orbitron text-cyan-300 mt-4 mb-2">Eliminar Carta del Mazo</h2>
              <p className="text-gray-300 mb-6">Haz doble clic en una carta para eliminarla permanentemente por {service.price} créditos.</p>
              <div className="w-full max-w-7xl flex-grow overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                  {playerState.deck.map((cardInstance) => {
                      const canAfford = playerState.credits >= service.price;
                      return (
                          <div key={cardInstance.instanceId} className="flex flex-col items-center gap-1">
                              <Card cardInstance={cardInstance} onClick={() => {}} onDoubleClick={canAfford ? () => handleRemoveCard(cardInstance.instanceId) : undefined} disabled={!canAfford} />
                          </div>
                      );
                  })}
              </div>
              <button onClick={() => setIsRemovingCard(false)} className="mt-6 mb-4 px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white">
                  Cancelar
              </button>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-40 bg-gray-900/95 flex flex-col p-6 animate-zoom-in-fade">
      <header className="flex-shrink-0 flex justify-between items-center mb-6">
          <ShopHeader trait={inventory.trait} credits={playerState.credits} />
          <button onClick={onClose} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white self-start">
              Partir
          </button>
      </header>
      
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Cartas */}
          <section className="lg:col-span-2 flex flex-col">
              <h3 className="font-orbitron text-2xl text-cyan-400 border-b-2 border-cyan-500/30 pb-2 mb-4">Módulos y Tripulación</h3>
              <div className="flex-grow overflow-y-auto p-4 bg-black/30 rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {inventory.cards.length > 0 ? inventory.cards.map(shopCard => (
                  <ShopCardItem key={shopCard.cardId} shopCard={shopCard} playerCredits={playerState.credits} onBuy={onBuyCard} />
                )) : <p className="text-gray-500 col-span-full text-center">El mercader parece haberse quedado sin existencias.</p>}
              </div>
          </section>

          {/* Servicios */}
          <section className="flex flex-col">
              <h3 className="font-orbitron text-2xl text-cyan-400 border-b-2 border-cyan-500/30 pb-2 mb-4">Servicios</h3>
              <div className="flex-grow overflow-y-auto p-4 bg-black/30 rounded-lg space-y-4">
                  {inventory.services.map(service => (
                    <ShopServiceItem 
                        key={service.type} 
                        serviceType={service.type} 
                        price={service.price}
                        playerCredits={playerState.credits}
                        onPerform={handleServiceClick}
                    />
                  ))}
              </div>
          </section>
      </main>
    </div>
  );
};