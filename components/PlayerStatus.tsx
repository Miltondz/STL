import React, { useMemo } from 'react';
import { PlayerState } from '../types';
import { getAllCards } from '../data';

interface PlayerStatusProps {
  state: PlayerState;
}

// Componente para mostrar los recursos actuales del jugador.
// Proporciona una vista rápida del estado del juego.
export const PlayerStatus: React.FC<PlayerStatusProps> = ({ state }) => {

  const uniqueCrewInDeck = useMemo(() => {
    const ALL_CARDS = getAllCards();
    const crewIds = new Set<string>();
    state.deck.forEach(cardInstance => {
        const cardData = ALL_CARDS[cardInstance.cardId];
        if (cardData && cardData.type === 'Crew' && cardData.rarity !== 'Common') {
            crewIds.add(cardInstance.cardId);
        }
    });
    return Array.from(crewIds);
  }, [state.deck]);

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm p-3 rounded-lg border border-cyan-500/20">
      <div className="flex flex-wrap gap-x-6 gap-y-2 md:gap-x-8 justify-center items-center">
        <StatusItem label="Combustible" value={state.fuel} icon="⛽" />
        <StatusItem label="Créditos" value={state.credits} icon="💰" />
        <StatusItem label="Casco" value={`${state.hull}/${state.maxHull}`} icon="❤️" />
        <StatusItem label="Escudos" value={`${state.shields}/${state.maxShields}`} icon="🛡️" />
        <StatusItem label="Tripulación" value={state.crew} icon="👨‍🚀" />
        <StatusItem label="Moral" value={state.moral} icon="😊" />
        <StatusItem label="Mazo" value={state.deck.length} icon="🃏" />
      </div>
      {(uniqueCrewInDeck.length > 0) && (
        <CrewAffinityDisplay crewIds={uniqueCrewInDeck} affinity={state.crewAffinity} />
      )}
      <XPBar level={state.level} xp={state.xp} xpToNextLevel={state.xpToNextLevel} />
    </div>
  );
};

// Componente de ayuda para mostrar un único item de estado.
const StatusItem: React.FC<{ label: string; value: number | string; icon: string }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-2 text-md">
    <span className="text-2xl">{icon}</span>
    <div>
      <span className="font-bold font-orbitron text-cyan-300">{value}</span>
      <span className="text-gray-400 ml-2 text-sm">{label}</span>
    </div>
  </div>
);

// Nuevo componente para la barra de experiencia y nivel
const XPBar: React.FC<{ level: number, xp: number, xpToNextLevel: number }> = ({ level, xp, xpToNextLevel }) => {
    const percentage = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;
    
    return (
        <div className="mt-3 px-2">
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-orbitron font-bold text-lg text-yellow-300">NIVEL {level}</span>
                <span className="text-gray-400 font-semibold">XP: {xp} / {xpToNextLevel}</span>
            </div>
            <div className="progress-bar-bg h-3 w-full border-yellow-500/50">
                <div className="progress-bar-fill bg-yellow-400" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

// Nuevo componente para mostrar la afinidad con la tripulación
const CrewAffinityDisplay: React.FC<{ crewIds: string[], affinity: { [key: string]: number } }> = ({ crewIds, affinity }) => {
    const ALL_CARDS = getAllCards();
    
    return (
        <div className="mt-3 pt-3 border-t border-cyan-500/20 flex flex-wrap gap-x-6 gap-y-2 justify-center items-center">
            <h4 className="w-full text-center text-sm font-bold text-cyan-300/80 mb-1">Afinidad de Tripulación</h4>
            {crewIds.map(crewId => {
                const crewData = ALL_CARDS[crewId];
                if (!crewData) return null;
                const affinityLevel = affinity[crewId] || 0;
                let affinityIcon = '😐';
                if (affinityLevel > 0) affinityIcon = '🙂';
                if (affinityLevel > 2) affinityIcon = '😄';
                if (affinityLevel < 0) affinityIcon = '😠';
                return (
                    <div key={crewId} className="flex items-center gap-2" title={`Afinidad con ${crewData.name}: ${affinityLevel}`}>
                        <span className="font-semibold text-sm">{crewData.name}</span>
                        <span className="text-xl">{affinityIcon}</span>
                    </div>
                );
            })}
        </div>
    );
};
