// components/RelicTray.tsx
import React, { useState } from 'react';
import { ALL_RELICS } from '../services/relicEngine';

const RARITY_BORDER: Record<string, string> = {
  Common:    'border-gray-400',
  Uncommon:  'border-green-400',
  Rare:      'border-blue-400',
  Boss:      'border-red-400',
  Event:     'border-yellow-400',
};

const RARITY_BG: Record<string, string> = {
  Common:    'bg-gray-800',
  Uncommon:  'bg-green-900/50',
  Rare:      'bg-blue-900/50',
  Boss:      'bg-red-900/50',
  Event:     'bg-yellow-900/50',
};

const RARITY_TEXT: Record<string, string> = {
  Common:    'text-gray-300',
  Uncommon:  'text-green-300',
  Rare:      'text-blue-300',
  Boss:      'text-red-300',
  Event:     'text-yellow-300',
};

const RARITY_GLOW: Record<string, string> = {
  Common:    '',
  Uncommon:  'shadow-[0_0_6px_rgba(74,222,128,0.4)]',
  Rare:      'shadow-[0_0_6px_rgba(96,165,250,0.4)]',
  Boss:      'shadow-[0_0_8px_rgba(248,113,113,0.5)]',
  Event:     'shadow-[0_0_6px_rgba(250,204,21,0.4)]',
};

interface RelicTrayProps {
  relicIds: string[];
}

export const RelicTray: React.FC<RelicTrayProps> = ({ relicIds }) => {
  const [tooltip, setTooltip] = useState<string | null>(null);
  if (!relicIds.length) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {relicIds.map(id => {
        const relic = ALL_RELICS[id];
        if (!relic) return null;
        const border = RARITY_BORDER[relic.rarity] || RARITY_BORDER['Common'];
        const bg = RARITY_BG[relic.rarity] || RARITY_BG['Common'];
        const glow = RARITY_GLOW[relic.rarity] || '';
        return (
          <div
            key={id}
            className={`relative w-8 h-8 rounded border ${border} ${bg} ${glow} flex items-center justify-center cursor-help select-none overflow-hidden`}
            onMouseEnter={() => setTooltip(id)}
            onMouseLeave={() => setTooltip(null)}
          >
            {relic.image ? (
              <img
                src={relic.image}
                alt={relic.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <span className="text-base">{relic.icon}</span>
            )}
            {tooltip === id && (
              <div className="absolute bottom-full left-0 mb-1 z-50 bg-gray-950 border border-gray-600 rounded p-2 text-left w-52 shadow-xl pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                  {relic.image && (
                    <img src={relic.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  )}
                  <div>
                    <div className={`font-bold font-orbitron text-xs ${RARITY_TEXT[relic.rarity]}`}>
                      {relic.name}
                    </div>
                    <div className="text-gray-500 text-[10px]">{relic.rarity}</div>
                  </div>
                </div>
                <div className="text-gray-200 text-xs">{relic.description}</div>
                {relic.flavorText && (
                  <div className="text-gray-500 italic text-[10px] mt-1">{relic.flavorText}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface RelicCardProps {
  relicId: string;
  onClick: () => void;
}

export const RelicCard: React.FC<RelicCardProps> = ({ relicId, onClick }) => {
  const relic = ALL_RELICS[relicId];
  if (!relic) return null;

  const border = RARITY_BORDER[relic.rarity] || RARITY_BORDER['Common'];
  const bg = RARITY_BG[relic.rarity] || RARITY_BG['Common'];
  const text = RARITY_TEXT[relic.rarity] || RARITY_TEXT['Common'];
  const glow = RARITY_GLOW[relic.rarity] || '';

  return (
    <button
      onClick={onClick}
      className={`w-44 rounded-lg border-2 ${border} ${bg} ${glow} p-3 flex flex-col items-center gap-2 hover:scale-105 transition-transform`}
    >
      {relic.image ? (
        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-600">
          <img
            src={relic.image}
            alt={relic.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
              const fallback = el.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="w-full h-full hidden items-center justify-center text-4xl">
            {relic.icon}
          </div>
        </div>
      ) : (
        <span className="text-5xl">{relic.icon}</span>
      )}
      <div className={`font-orbitron font-bold text-xs text-center ${text}`}>{relic.name}</div>
      <div className="text-gray-400 text-[10px] uppercase tracking-wide">{relic.rarity}</div>
      <div className="text-gray-200 text-xs text-center">{relic.description}</div>
      {relic.flavorText && (
        <div className="text-gray-500 italic text-[10px] text-center">{relic.flavorText}</div>
      )}
    </button>
  );
};

interface RelicRewardScreenProps {
  relicIds: string[];
  onSelect: (relicId: string | null) => void;
}

export const RelicRewardScreen: React.FC<RelicRewardScreenProps> = ({ relicIds, onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <h2 className="font-orbitron text-2xl text-yellow-300 mb-1">Reliquia Encontrada</h2>
      <p className="text-gray-400 text-sm mb-6">Elige una reliquia para tu nave:</p>
      <div className="flex gap-4 flex-wrap justify-center">
        {relicIds.map(id => (
          <RelicCard key={id} relicId={id} onClick={() => onSelect(id)} />
        ))}
      </div>
      <button
        onClick={() => onSelect(null)}
        className="mt-6 text-gray-500 hover:text-gray-300 text-sm transition-colors"
      >
        Saltar recompensa
      </button>
    </div>
  );
};
