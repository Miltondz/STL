import React from 'react';
import { PlayerState } from '../types';

interface SectorCompleteScreenProps {
  playerState: PlayerState;
  onContinue: () => void;
}

const SECTOR_NAMES: Record<number, string> = {
  1: 'Franja Fronteriza',
  2: 'Núcleo Pirata',
  3: 'Nexo IA',
};

const SECTOR_BOSSES: Record<number, string> = {
  1: 'Destructor de la Hegemonía',
  2: 'Dreadnought Pirata',
  3: 'Nexo IA Autónomo',
};

export const SectorCompleteScreen: React.FC<SectorCompleteScreenProps> = ({ playerState, onContinue }) => {
  const sector = playerState.sector || 1;
  const isVictory = sector >= 3;
  const nextSector = sector + 1;
  const bonusCredits = sector * 20;

  return (
    <div className="fixed inset-0 z-30 bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-lg w-full">
        <div className="mb-6">
          <div className="text-6xl mb-4 animate-bounce">{isVictory ? '🏆' : '⭐'}</div>
          <h1 className="text-4xl font-orbitron font-bold text-yellow-400 mb-2">
            {isVictory ? '¡VICTORIA!' : `SECTOR ${sector} COMPLETADO`}
          </h1>
          <p className="text-lg text-gray-300">
            {isVictory
              ? '¡Has conquistado la galaxia!'
              : `"${SECTOR_NAMES[sector] ?? `Sector ${sector}`}" ha sido liberado.`}
          </p>
          {SECTOR_BOSSES[sector] && (
            <p className="text-sm text-purple-400 mt-1">
              {SECTOR_BOSSES[sector]} derrotado
            </p>
          )}
        </div>

        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-5 mb-6 text-left space-y-2">
          <h3 className="text-sm font-bold text-yellow-400 mb-3">Estado de la Nave</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Casco</span>
            <span className="text-green-300">{playerState.hull}/{playerState.maxHull}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Escudos</span>
            <span className="text-cyan-300">{playerState.shields}/{playerState.maxShields}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Créditos</span>
            <span className="text-yellow-300">{playerState.credits}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Cartas en mazo</span>
            <span className="text-blue-300">{playerState.deck.length}</span>
          </div>
          {!isVictory && (
            <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-sm">
              <span className="text-yellow-400">Bonificación de sector</span>
              <span className="text-yellow-300">+{bonusCredits} créditos</span>
            </div>
          )}
        </div>

        <button
          onClick={onContinue}
          className="w-full py-4 px-8 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-orbitron font-bold rounded-xl text-lg transition-all shadow-lg shadow-yellow-900/50"
        >
          {isVictory ? 'Pantalla de Inicio' : `Continuar al Sector ${nextSector}: ${SECTOR_NAMES[nextSector] ?? `Sector ${nextSector}`} →`}
        </button>
      </div>
    </div>
  );
};
