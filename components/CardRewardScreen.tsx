// components/CardRewardScreen.tsx
import React from 'react';
import { Card } from './Card';
import { ALL_CARDS } from '../data/cards';

interface CardRewardScreenProps {
  cardIds: string[];
  onCardSelect: (cardId: string) => void;
  title?: string;
}

export const CardRewardScreen: React.FC<CardRewardScreenProps> = ({ cardIds, onCardSelect, title = "Elige tu Recompensa" }) => {
  return (
    <div className="fixed inset-0 z-30 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-zoom-in-fade">
      <h2 className="text-4xl font-orbitron text-cyan-300 mb-4 drop-shadow-lg">{title}</h2>
      <p className="text-lg text-gray-300 mb-8">Haz doble clic en una carta para añadirla a tu mazo.</p>
      
      <div className="flex justify-center items-center gap-6">
        {cardIds.map(cardId => {
          const cardData = ALL_CARDS[cardId];
          if (!cardData) return null;

          // Crea una instancia temporal solo para visualización
          const cardInstance = { instanceId: `reward_${cardId}`, cardId: cardId };

          return (
            <Card
              key={cardId}
              cardInstance={cardInstance}
              onClick={() => {}} // No se usa el clic simple aquí
              onDoubleClick={() => onCardSelect(cardId)}
              disabled={false}
            />
          );
        })}
      </div>
    </div>
  );
};