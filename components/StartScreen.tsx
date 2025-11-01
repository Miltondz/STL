// components/StartScreen.tsx
import React, { useEffect, useState } from 'react';
import { hasSavedGame } from '../services/saveManager';
import { useGame } from '../contexts/GameContext';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    const { loadSavedGame } = useGame();
    const [hasSave, setHasSave] = useState(false);

    useEffect(() => {
        // Asegurarse de que el fondo del hangar no esté visible
        document.body.classList.remove('in-hangar');
        // Verificar si hay partida guardada
        setHasSave(hasSavedGame());
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center text-center p-8 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-orbitron text-cyan-300 drop-shadow-[0_0_15px_rgba(103,232,249,0.5)] mb-4">
                Sector Zero
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl">
                Una odisea de cartas a través de una galaxia generada proceduralmente.
            </p>

            <div className="space-y-4">
                {hasSave && (
                    <button 
                        onClick={() => {
                            if (loadSavedGame()) {
                                console.log('[StartScreen] Partida cargada exitosamente');
                            } else {
                                console.error('[StartScreen] Error al cargar partida');
                            }
                        }}
                        className="w-72 px-8 py-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white text-2xl font-orbitron transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/20 animate-pulse"
                    >
                        💾 Continuar Partida
                    </button>
                )}
                <button 
                    onClick={onStart}
                    className="w-72 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold text-white text-2xl font-orbitron transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
                >
                    {hasSave ? 'Nueva Aventura' : 'Comenzar Aventura'}
                </button>
                <button 
                    onClick={() => window.open('./editor/index.html', '_blank')}
                    className="w-72 px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white text-xl font-orbitron transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20"
                >
                    🎮 Editor de Contenido
                </button>
                <button 
                    disabled
                    className="w-72 px-8 py-3 bg-gray-700 rounded-lg font-bold text-gray-500 text-xl font-orbitron cursor-not-allowed"
                >
                    Ajustes (Próximamente)
                </button>
                 <button 
                    disabled
                    className="w-72 px-8 py-3 bg-gray-700 rounded-lg font-bold text-gray-500 text-xl font-orbitron cursor-not-allowed"
                >
                    Créditos (Próximamente)
                </button>
            </div>
        </div>
    );
};