import React, { useMemo } from 'react';
import { ENEMY_TEMPLATES } from '../data/enemies';

interface PreCombatModalProps {
  enemyId: string;
  onConfirm: () => void;
}

const ENCOUNTER_MESSAGES = [
    "Tus sensores detectan una nave hostil. Un {enemyName} se acerca, con las armas cargadas.",
    "¡Emboscada! Un {enemyName} emerge de las sombras de un asteroide.",
    "Un {enemyName} bloquea tu ruta, exigiendo un peaje que no piensas pagar.",
    "Detectas los restos de un carguero. Un {enemyName} está rebuscando entre los escombros y te ha visto.",
];

export const PreCombatModal: React.FC<PreCombatModalProps> = ({ enemyId, onConfirm }) => {
  const enemy = ENEMY_TEMPLATES[enemyId];

  const encounterMessage = useMemo(() => {
    if (!enemy) return "Un enemigo desconocido se acerca.";
    const randomIndex = Math.floor(Math.random() * ENCOUNTER_MESSAGES.length);
    return ENCOUNTER_MESSAGES[randomIndex].replace('{enemyName}', enemy.name);
  }, [enemy]);
  
  if (!enemy) {
    return (
        <div className="fixed inset-0 z-30 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-gray-800/80 backdrop-blur-md border border-red-500/30 rounded-lg p-6 shadow-lg max-w-lg w-full animate-zoom-in-fade text-center">
                <p className="text-red-400">Error: Enemigo no encontrado.</p>
                <button
                    onClick={onConfirm}
                    className="mt-6 w-full font-orbitron text-lg p-3 rounded-md border bg-gray-700/50 border-gray-600/50 hover:bg-gray-600/50"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gray-800/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-8 shadow-lg max-w-lg w-full animate-zoom-in-fade text-center">
        <h2 className="text-2xl font-orbitron text-cyan-300 mb-4">Encuentro Hostil</h2>
        <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            {encounterMessage}
        </p>
        <button
          onClick={onConfirm}
          className="w-full font-orbitron text-xl p-4 rounded-md border transition-all duration-200 
            bg-red-700/80 border-red-500/70 hover:bg-red-600/80 hover:border-red-400 
            focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          ¡A la Batalla!
        </button>
      </div>
    </div>
  );
};