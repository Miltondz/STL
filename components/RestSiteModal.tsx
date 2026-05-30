import React, { useState } from 'react';
import { PlayerState, CardInstance } from '../types';
import { getAllCards } from '../data';

interface RestSiteModalProps {
  playerState: PlayerState;
  onSelectOption: (option: 'HEAL' | 'REMOVE_CARD' | 'UPGRADE_CARD', cardInstanceId?: string) => void;
}

type RestStep = 'CHOOSE_ACTION' | 'PICK_CARD_REMOVE' | 'PICK_CARD_UPGRADE';

export const RestSiteModal: React.FC<RestSiteModalProps> = ({ playerState, onSelectOption }) => {
  const [step, setStep] = useState<RestStep>('CHOOSE_ACTION');
  const allCards = getAllCards();
  const healAmount = Math.floor(playerState.maxHull * 0.3);
  const hullAfterHeal = Math.min(playerState.maxHull, playerState.hull + healAmount);

  const renderCardList = (pendingAction: 'REMOVE_CARD' | 'UPGRADE_CARD') => {
    const upgradableFilter = (inst: CardInstance) => {
      if (pendingAction === 'REMOVE_CARD') return true;
      const cd = allCards[inst.cardId];
      return cd && !inst.affix;
    };

    const cards = playerState.deck.filter(upgradableFilter);

    if (cards.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          {pendingAction === 'UPGRADE_CARD'
            ? 'No hay cartas sin mejora en tu mazo.'
            : 'Tu mazo está vacío.'}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
        {cards.map(inst => {
          const cd = allCards[inst.cardId];
          if (!cd) return null;
          return (
            <button
              key={inst.instanceId}
              onClick={() => onSelectOption(pendingAction, inst.instanceId)}
              className="flex flex-col items-start p-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-cyan-500 rounded text-left transition-colors"
            >
              <span className="text-sm font-bold text-white truncate w-full">{cd.name}{inst.affix ? ` [${inst.affix.name}]` : ''}</span>
              <span className="text-xs text-gray-400">{cd.type} · Coste {cd.cost}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-teal-500/40 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⛺</span>
          <div>
            <h2 className="text-xl font-orbitron text-teal-400">Sitio de Descanso</h2>
            <p className="text-xs text-gray-400">Casco: {playerState.hull}/{playerState.maxHull}</p>
          </div>
        </div>

        {step === 'CHOOSE_ACTION' && (
          <div className="space-y-3">
            <button
              onClick={() => onSelectOption('HEAL')}
              className="w-full flex items-center gap-3 p-3 bg-green-900/30 hover:bg-green-900/50 border border-green-500/40 hover:border-green-400 rounded-lg transition-colors"
            >
              <span className="text-2xl">🔧</span>
              <div className="text-left">
                <div className="text-sm font-bold text-green-300">Reparar Casco</div>
                <div className="text-xs text-gray-400">
                  Recupera {Math.min(healAmount, playerState.maxHull - playerState.hull)} HP
                  ({playerState.hull} → {hullAfterHeal}/{playerState.maxHull})
                </div>
              </div>
            </button>

            <button
              onClick={() => setStep('PICK_CARD_REMOVE')}
              className="w-full flex items-center gap-3 p-3 bg-red-900/30 hover:bg-red-900/50 border border-red-500/40 hover:border-red-400 rounded-lg transition-colors"
            >
              <span className="text-2xl">🗑️</span>
              <div className="text-left">
                <div className="text-sm font-bold text-red-300">Eliminar Carta</div>
                <div className="text-xs text-gray-400">Elimina una carta de tu mazo permanentemente</div>
              </div>
            </button>

            <button
              onClick={() => setStep('PICK_CARD_UPGRADE')}
              className="w-full flex items-center gap-3 p-3 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/40 hover:border-blue-400 rounded-lg transition-colors"
            >
              <span className="text-2xl">⬆️</span>
              <div className="text-left">
                <div className="text-sm font-bold text-blue-300">Mejorar Carta</div>
                <div className="text-xs text-gray-400">Mejora una carta de tu mazo (−1 coste, +2 efecto)</div>
              </div>
            </button>
          </div>
        )}

        {step === 'PICK_CARD_REMOVE' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setStep('CHOOSE_ACTION')} className="text-gray-400 hover:text-white text-sm">← Volver</button>
              <span className="text-sm text-red-300 font-bold">Elige una carta para eliminar</span>
            </div>
            {renderCardList('REMOVE_CARD')}
          </div>
        )}

        {step === 'PICK_CARD_UPGRADE' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setStep('CHOOSE_ACTION')} className="text-gray-400 hover:text-white text-sm">← Volver</button>
              <span className="text-sm text-blue-300 font-bold">Elige una carta para mejorar</span>
            </div>
            {renderCardList('UPGRADE_CARD')}
          </div>
        )}
      </div>
    </div>
  );
};
