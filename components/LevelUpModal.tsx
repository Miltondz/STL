// components/LevelUpModal.tsx
import React from 'react';

type RewardType = 'HULL' | 'ENERGY' | 'CARD';

interface LevelUpModalProps {
  newLevel: number;
  onSelectReward: (type: RewardType) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onSelectReward }) => {
  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-zoom-in-fade">
      <div className="bg-gray-800/90 border border-yellow-400/50 rounded-lg p-8 shadow-lg max-w-2xl w-full text-center">
        <h2 className="text-4xl font-orbitron text-yellow-300 mb-2 drop-shadow-lg">¡HAS SUBIDO DE NIVEL!</h2>
        <p className="text-xl text-gray-200 mb-8">Has alcanzado el nivel {newLevel}. Elige una mejora permanente:</p>
        
        <div className="space-y-4">
            <RewardOption
                title="Ingeniería Mejorada"
                description="+5 Casco Máximo. Tu nave es ahora más resistente."
                icon="❤️"
                onClick={() => onSelectReward('HULL')}
            />
            <RewardOption
                title="Núcleo de Potencia Optimizado"
                description="+1 Energía Máxima por turno en combate."
                icon="⚡"
                onClick={() => onSelectReward('ENERGY')}
            />
            <RewardOption
                title="Adquisición Táctica"
                description="Añade una nueva carta Rara a tu mazo."
                icon="🃏"
                onClick={() => onSelectReward('CARD')}
            />
        </div>
      </div>
    </div>
  );
};

interface RewardOptionProps {
    title: string;
    description: string;
    icon: string;
    onClick: () => void;
}

const RewardOption: React.FC<RewardOptionProps> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-md border-2 transition-all duration-200 
        bg-gray-700/50 border-cyan-600/50 hover:bg-cyan-500/20 hover:border-cyan-400
        flex items-center gap-4"
    >
        <div className="text-4xl">{icon}</div>
        <div>
            <h4 className="font-orbitron text-lg font-bold text-cyan-300">{title}</h4>
            <p className="text-gray-300">{description}</p>
        </div>
    </button>
);