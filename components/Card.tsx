// components/Card.tsx
import React, { useState } from 'react';
import { CardInstance } from '../types';
import { RARITY_BORDER_COLORS, RARITY_GLOW_COLORS } from '../constants';
import { getAllCards } from '../data';

interface CardProps {
  cardInstance: CardInstance;
  onClick: () => void;
  onDoubleClick?: () => void;
  disabled: boolean;
  size?: 'normal' | 'small' | 'large';
}

// Componente que renderiza una única carta en la mano del jugador.
export const Card: React.FC<CardProps> = ({ cardInstance, onClick, onDoubleClick, disabled, size = 'normal' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const allCards = getAllCards();
  const cardData = allCards[cardInstance.cardId];
  if (!cardData) return null; // O un placeholder de error

  const { affix } = cardInstance;
  const { name, type, rarity, image, faction, subtype } = cardData;

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
  const isLarge = size === 'large';

  const rarityBorderColor = RARITY_BORDER_COLORS[rarity || 'Common'] || 'border-gray-400/50';
  const rarityGlowColor = RARITY_GLOW_COLORS[rarity || 'Common'] || 'transparent';

  const cardClasses = `
    ${isSmall ? 'w-[150px] h-[210px] p-2.5' : isLarge ? 'w-80 h-[460px] p-4' : 'w-40 h-56 p-3'}
    rounded-lg border-2 flex flex-col justify-between
    text-white shadow-lg transition-all duration-300 ease-out
    transform ${!disabled && !isSmall ? 'hover:-translate-y-3 hover:scale-105' : ''}
    ${typeBgColors[type] || 'bg-gray-800/80'}
    ${rarityBorderColor}
    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}
  `;
  
  const cardStyle = {
      filter: `drop-shadow(0 0 8px ${rarityGlowColor})`,
  };

  return (
    <div 
      className={`relative ${cardClasses}`}
      style={cardStyle}
      onClick={!disabled ? onClick : undefined}
      onDoubleClick={!disabled ? onDoubleClick : undefined}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip mejorado */}
      {showTooltip && !isSmall && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900/95 border-2 border-cyan-400/50 rounded-lg shadow-2xl z-50 animate-fade-in-up pointer-events-none"
             style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}>
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-orbitron font-bold text-sm text-cyan-300">{displayName}</h4>
              <span className="text-xs px-2 py-0.5 bg-cyan-500/20 rounded text-cyan-300">{rarity || 'Common'}</span>
            </div>
            
            {(faction || subtype) && (
              <div className="flex gap-2 text-xs">
                {faction && <span className="px-2 py-0.5 bg-purple-500/20 rounded text-purple-300">{faction}</span>}
                {subtype && <span className="px-2 py-0.5 bg-blue-500/20 rounded text-blue-300">{subtype}</span>}
              </div>
            )}
            
            <p className="text-xs text-gray-300 leading-relaxed">{displayDescription}</p>
            
            {affix && (
              <div className="mt-2 pt-2 border-t border-cyan-500/30">
                <p className="text-xs text-yellow-400 font-semibold">Modificador: {affix.name}</p>
                <p className="text-xs text-gray-400">{affix.description}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t border-cyan-500/30">
              <span className="text-xs text-gray-400">Tipo: {type}</span>
              <span className="text-xs text-cyan-300 font-bold">Costo: {displayCost}</span>
            </div>
          </div>
          {/* Flecha del tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-cyan-400/50"></div>
        </div>
      )}
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