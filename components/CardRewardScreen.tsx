// components/CardRewardScreen.tsx
import React, { useMemo } from 'react';
import { Card } from './Card';
import { getAllCards } from '../data';

interface CardRewardScreenProps {
  cardIds: string[];
  onCardSelect: (cardId: string) => void;
  onSkip?: () => void;
  title?: string;
  playerDeckSize?: number;
}

export const CardRewardScreen: React.FC<CardRewardScreenProps> = ({ cardIds, onCardSelect, onSkip, title = "Elige tu Recompensa", playerDeckSize }) => {
  const [selected, setSelected] = React.useState(false);
  const allCards = useMemo(() => getAllCards(), []);

  const handleSelect = (cardId: string) => {
    if (selected) return;
    setSelected(true);
    onCardSelect(cardId);
  };

  const handleSkip = () => {
    if (selected) return;
    setSelected(true);
    if (onSkip) onSkip();
    else onCardSelect('');
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-zoom-in-fade">
      <h2 className="text-4xl font-orbitron text-cyan-300 mb-2 drop-shadow-lg">{title}</h2>
      <p className="text-sm text-gray-400 mb-6">
        Doble clic para añadir al mazo
        {playerDeckSize !== undefined && (
          <span className="ml-2 text-gray-500">· {playerDeckSize} cartas en mazo</span>
        )}
      </p>

      <div className="flex justify-center items-center gap-6 mb-8">
        {cardIds.map(cardId => {
          const cardData = allCards[cardId];
          if (!cardData) return null;
          const cardInstance = { instanceId: `reward_${cardId}`, cardId };
          return (
            <Card
              key={cardId}
              cardInstance={cardInstance}
              onClick={() => {}}
              onDoubleClick={() => handleSelect(cardId)}
              disabled={selected}
            />
          );
        })}
      </div>

      <button
        onClick={handleSkip}
        disabled={selected}
        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded font-orbitron text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Saltar recompensa
      </button>
    </div>
  );
};
