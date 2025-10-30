// components/Card.tsx
import React from 'react';
import { CardInstance } from '../types';
import { RARITY_BORDER_COLORS, RARITY_GLOW_COLORS } from '../constants';
import { ALL_CARDS } from '../data/cards';

interface CardProps {
  cardInstance: CardInstance;
  onClick: () => void;
  onDoubleClick?: () => void;
  disabled: boolean;
  size?: 'normal' | 'small';
}

// Componente que renderiza una única carta en la mano del jugador.
export const Card: React.FC<CardProps> = ({ cardInstance, onClick, onDoubleClick, disabled, size = 'normal' }) => {
  const cardData = ALL_CARDS[cardInstance.cardId];
  if (!cardData) return null; // O un placeholder de error

  const { affix } = cardInstance;
  const { name, type, rarity, image } = cardData;

  // Calcula los valores dinámicos basados en los afijos
  const displayCost = Math.max(0, cardData.cost + (affix?.costModifier || 0));
  const displayName = affix ? `${name} [${affix.name}]` : name;
  const displayDescription = affix ? `${cardData.description} ${affix.description}` : cardData.description;

  const typeBgColors = {
    Attack: 'bg-red-800/80',
    Skill: 'bg-blue-800/80',
    Power: 'bg-purple-800/80',
    Crew: 'bg-yellow-800/80',
  };

  const isSmall = size === 'small';

  const rarityBorderColor = RARITY_BORDER_COLORS[rarity || 'Common'] || 'border-gray-400/50';
  const rarityGlowColor = RARITY_GLOW_COLORS[rarity || 'Common'] || 'transparent';

  const cardClasses = `
    ${isSmall ? 'w-[150px] h-[210px] p-2.5' : 'w-40 h-56 p-3'}
    rounded-lg border-2 flex flex-col justify-between
    text-white shadow-lg transition-all duration-200 ease-in-out
    transform ${!disabled && !isSmall ? 'hover:-translate-y-2' : ''}
    ${typeBgColors[type] || 'bg-gray-800/80'}
    ${rarityBorderColor}
    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
  `;
  
  const cardStyle = {
      filter: `drop-shadow(0 0 8px ${rarityGlowColor})`,
  };

  return (
    <div 
      className={cardClasses} 
      style={cardStyle}
      onClick={!disabled ? onClick : undefined}
      onDoubleClick={!disabled ? onDoubleClick : undefined} // Manejador de doble clic
    >
      {/* Encabezado de la Carta */}
      <div className="flex justify-between items-start">
        <h4 className={`font-orbitron font-bold leading-tight ${isSmall ? 'text-sm' : 'text-sm'}`}>{displayName}</h4>
        <div className={`flex items-center justify-center rounded-full bg-gray-900/80 border border-cyan-400/50 ${isSmall ? 'w-7 h-7' : 'w-7 h-7'}`}>
          <span className={`font-orbitron font-bold ${isSmall ? 'text-xl' : 'text-lg'} ${affix?.costModifier ? 'text-green-400' : 'text-cyan-300'}`}>{displayCost}</span>
        </div>
      </div>

      {/* Contenido Central: Imagen o Descripción */}
      <div className="text-center my-1 flex-grow flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover rounded-sm" />
        ) : (
          <p className={`text-gray-200 ${isSmall ? 'text-xs' : 'text-xs'}`}>{displayDescription}</p>
        )}
      </div>
      
      {/* Pie de la Carta */}
      <div className="text-center">
        <p className={`font-bold uppercase text-cyan-400/80 ${isSmall ? 'text-xs' : 'text-xs'}`}>{type}</p>
      </div>
    </div>
  );
};