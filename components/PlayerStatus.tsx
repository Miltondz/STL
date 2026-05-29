import React, { useState, useMemo } from 'react';
import { PlayerState } from '../types';
import { getAllCards } from '../data';
import { Card } from './Card';

interface PlayerStatusProps {
  state: PlayerState;
  onPauseClick?: () => void;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({ state, onPauseClick }) => {
  const [showDeck, setShowDeck] = useState(false);

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm p-1.5 rounded-lg border border-cyan-500/20 h-full flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <div className="flex gap-x-3 flex-1 justify-between">
          <StatusItem label="Combustible" value={state.fuel} icon="⛽" warning={state.fuel <= 2} />
          <StatusItem label="Créditos" value={state.credits} icon="💰" />
          <StatusItem label="Casco" value={`${state.hull}/${state.maxHull}`} icon="❤️" />
          <button
            onClick={() => setShowDeck(true)}
            className="flex items-center gap-1 hover:text-cyan-200 transition-colors"
            title="Ver mazo completo"
          >
            <span className="text-sm">🃏</span>
            <div className="flex items-baseline gap-1">
              <span className="font-bold font-orbitron text-cyan-300 text-xs">{state.deck.length}</span>
              <span className="text-gray-400 text-xs leading-none">Maz</span>
            </div>
          </button>
        </div>
        {onPauseClick && (
          <button
            onClick={onPauseClick}
            className="px-2 py-1 bg-gray-800 border border-cyan-500/30 rounded text-cyan-300 hover:bg-gray-700 ml-2 text-xs"
            title="Pausa"
          >
            ⏸️
          </button>
        )}
      </div>

      <XPBar level={state.level} xp={state.xp} xpToNextLevel={state.xpToNextLevel} />

      {onPauseClick && (
        <button
          onClick={onPauseClick}
          className="mt-1 w-full px-2 py-1 bg-gray-800 border border-cyan-500/30 rounded text-cyan-300 hover:bg-gray-700 text-xs font-orbitron transition-colors"
          title="Menú"
        >
          ☰ MENÚ
        </button>
      )}

      {showDeck && <DeckViewOverlay deck={state.deck} onClose={() => setShowDeck(false)} />}
    </div>
  );
};

const StatusItem: React.FC<{ label: string; value: number | string; icon: string; warning?: boolean }> = ({ label, value, icon, warning }) => (
  <div className={`flex items-center gap-1 ${warning ? 'animate-pulse' : ''}`}>
    <span className="text-sm">{icon}</span>
    <div className="flex items-baseline gap-1">
      <span className={`font-bold font-orbitron text-xs ${warning ? 'text-red-400' : 'text-cyan-300'}`}>{value}</span>
      <span className={`text-xs leading-none ${warning ? 'text-red-500' : 'text-gray-400'}`}>{label.slice(0, 3)}</span>
    </div>
  </div>
);

const XPBar: React.FC<{ level: number; xp: number; xpToNextLevel: number }> = ({ level, xp, xpToNextLevel }) => {
  const percentage = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;
  return (
    <div className="mt-1 px-1">
      <div className="flex justify-between items-center mb-0.5">
        <span className="font-orbitron font-bold text-xs text-yellow-300">LVL {level}</span>
        <span className="text-gray-400 text-xs">{xp}/{xpToNextLevel}</span>
      </div>
      <div className="progress-bar-bg h-1.5 w-full border-yellow-500/50">
        <div className="progress-bar-fill bg-yellow-400" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

import { CardInstance } from '../types';

const DeckViewOverlay: React.FC<{ deck: CardInstance[]; onClose: () => void }> = ({ deck, onClose }) => {
  const allCards = useMemo(() => getAllCards(), []);

  const grouped = useMemo(() => {
    const counts = new Map<string, { instance: CardInstance; count: number }>();
    for (const inst of deck) {
      const key = inst.cardId;
      const existing = counts.get(key);
      if (existing) existing.count++;
      else counts.set(key, { instance: inst, count: 1 });
    }
    return Array.from(counts.values());
  }, [deck]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex flex-col p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="max-w-5xl mx-auto w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-orbitron text-xl text-cyan-300">
            Mazo — {deck.length} carta{deck.length !== 1 ? 's' : ''}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {grouped.map(({ instance, count }) => {
            const card = allCards[instance.cardId];
            return (
              <div key={instance.cardId} className="relative">
                <Card cardInstance={instance} onClick={() => {}} disabled size="small" />
                {count > 1 && (
                  <div className="absolute top-1 right-1 bg-cyan-600 text-white text-xs font-orbitron rounded-full w-5 h-5 flex items-center justify-center">
                    {count}
                  </div>
                )}
                {!card && (
                  <div className="text-xs text-red-400 text-center mt-1">{instance.cardId}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
