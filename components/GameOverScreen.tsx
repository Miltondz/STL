import React from 'react';
import { PlayerState } from '../types';
import { ACHIEVEMENTS } from '../constants';

interface GameOverScreenProps {
  playerState: PlayerState;
  isVictory?: boolean;
  onClose: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ playerState, isVictory, onClose }) => {
  const sectorLabel = isVictory
    ? '¡Todos los sectores completados!'
    : `Eliminado en Sector ${playerState.sector}`;

  return (
    <div className="fixed inset-0 z-30 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">{isVictory ? '🌟' : '💀'}</div>
          <h1 className={`text-3xl font-orbitron font-bold ${isVictory ? 'text-yellow-400' : 'text-red-400'}`}>
            {isVictory ? '¡VICTORIA!' : 'FIN DEL VIAJE'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{sectorLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
          <Stat icon="❤️" label="Casco final" value={`${playerState.hull}/${playerState.maxHull}`} />
          <Stat icon="🛡️" label="Escudos" value={`${playerState.shields}/${playerState.maxShields}`} />
          <Stat icon="💰" label="Créditos" value={String(playerState.credits)} />
          <Stat icon="⭐" label="Nivel" value={`${playerState.level} (${playerState.xp} XP)`} />
          <Stat icon="🃏" label="Cartas en mazo" value={String(playerState.deck.length)} />
          <Stat icon="🔮" label="Reliquias" value={String((playerState.relics || []).length)} />
        </div>

        {(playerState.achievements || []).length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
              Logros desbloqueados esta partida
            </h3>
            <div className="flex flex-wrap gap-2">
              {(playerState.achievements || []).map(id => {
                const def = ACHIEVEMENTS[id];
                if (!def) return null;
                return (
                  <div key={id} className="flex items-center gap-1 bg-yellow-900/30 border border-yellow-600/30 rounded px-2 py-1" title={def.description}>
                    <span>{def.icon}</span>
                    <span className="text-xs text-yellow-300">{def.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-orbitron rounded-lg transition-colors"
        >
          Volver al Menú Principal
        </button>
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 bg-gray-800/50 rounded p-2">
    <span className="text-lg">{icon}</span>
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  </div>
);
