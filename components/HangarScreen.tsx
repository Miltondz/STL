// components/HangarScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { ShipData, CardInstance } from '../types';
import { getAllShips, getAllCards } from '../data';
import { useTypingEffect } from '../hooks/useTypingEffect';
import { Card } from './Card';

interface HangarScreenProps {
  onStartGame: (ship: ShipData) => void;
  onReturnToStart: () => void;
}

// Subcomponente para una única carta de nave en la pantalla de selección
const ShipCard: React.FC<{ ship: ShipData; isSelected: boolean; isDimmed: boolean; onSelect: () => void; animDelay: string }> = ({ ship, isSelected, isDimmed, onSelect, animDelay }) => {
    const [imgSrc, setImgSrc] = useState(ship.image);

    useEffect(() => {
        setImgSrc(ship.image);
    }, [ship.image]);

    const handleImageError = () => {
        setImgSrc(`https://placehold.co/400x300/1e293b/94a3b8?text=${encodeURIComponent(ship.name)}`);
    };

    const borderClass = isSelected ? 'border-cyan-400 scale-110 shadow-cyan-400/30' : 'border-gray-600 hover:border-cyan-500 hover:scale-105';
    const dimClass = isDimmed ? 'opacity-50 scale-95' : 'opacity-100';
    
    return (
        <div 
            onClick={onSelect}
            className={`w-52 h-72 bg-gray-800/70 rounded-lg border-2 p-2 flex flex-col justify-between cursor-pointer transition-all duration-300 ${borderClass} ${dimClass} animate-fade-in-from-bottom`}
            style={{ backdropFilter: 'blur(5px)', animationDelay: animDelay }}
        >
            <div className="text-center">
                <h3 className="font-orbitron text-base text-cyan-300 truncate">{ship.name}</h3>
                <p className="text-xs text-gray-400">{ship.subtype}</p>
            </div>
            <div className="flex-grow my-1 flex items-center justify-center overflow-hidden">
                <img 
                    src={imgSrc} 
                    alt={ship.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover" 
                />
            </div>
            <div className="text-center">
                <p className="text-xs text-gray-300 truncate">{ship.trait?.name || 'Sin rasgo'}</p>
                <div className="flex justify-center mt-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`text-lg ${i < ship.difficulty ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Subcomponente para el panel de detalles de la nave seleccionada
const ShipDetailsPanel: React.FC<{ ship: ShipData; onStart: () => void; onReturn: () => void; zoomedCard: CardInstance | null; setZoomedCard: (ci: CardInstance | null) => void; }> = ({ ship, onStart, onReturn, zoomedCard, setZoomedCard }) => {
    const [isBusy, setIsBusy] = useState(false);

    const handleStart = () => {
        if (isBusy) return;
        setIsBusy(true);
        onStart();
    };

    const handleReturn = () => {
        if (isBusy) return;
        setIsBusy(true);
        onReturn();
    };
    const typedDescription = useTypingEffect(ship.description, 20);
    const [currentPage, setCurrentPage] = useState(0);
    const CARDS_PER_PAGE = 3;

    const initialDeckInstances: CardInstance[] = (ship.initialDeck || []).map((cardId, index) => ({
        instanceId: `hangar_${ship.id}_${cardId}_${index}`,
        cardId,
    }));
    
    const totalPages = Math.ceil(initialDeckInstances.length / CARDS_PER_PAGE);
    const startIndex = currentPage * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    const cardsToShow = initialDeckInstances.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(0);
    }, [ship.id]);

    return (
        <div className="w-full max-w-6xl bg-black/50 p-4 rounded-lg border border-cyan-500/30 animate-fade-in-up flex flex-col h-full overflow-hidden">
            <div className="flex flex-grow min-h-0 items-stretch gap-4">
                {/* Columna Izquierda: Descripción */}
                <div className="flex-[2] h-full flex flex-col justify-center">
                    <div>
                        <h2 className="text-3xl font-orbitron text-cyan-300">{ship.name}</h2>
                        <p className="text-md text-gray-400 mb-4">{ship.subtype} - {ship.faction}</p>
                        <p className="text-gray-300 mb-4 min-h-[3.75rem] font-mono">
                            {typedDescription}
                            <span className="typing-cursor">|</span>
                        </p>
                        {ship.trait && (
                            <div className="bg-gray-800/50 p-3 rounded mt-4">
                                <h4 className="font-bold text-cyan-400">{ship.trait.name}</h4>
                                <p className="text-sm text-gray-300">{ship.trait.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Central: Imagen de la Nave y Botones */}
                <div className="flex-[1.5] h-full flex flex-col items-center justify-between p-2 gap-2">
                    <div className="flex-1 flex items-center justify-center w-full min-h-0">
                        <img src={ship.image} alt={ship.name} className="max-w-full max-h-full h-auto w-auto object-contain" />
                    </div>
                    <div className="flex justify-center items-center gap-2 flex-shrink-0">
                        <button onClick={handleReturn} disabled={isBusy} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold text-white text-sm font-orbitron transition-all duration-300 disabled:opacity-50">
                            Volver
                        </button>
                        <button onClick={handleStart} disabled={isBusy} className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold text-white text-base font-orbitron transition-all duration-300 transform hover:scale-105 disabled:opacity-50">
                            DESPEGAR
                        </button>
                    </div>
                </div>

                {/* Columna Derecha: Cubierta Inicial */}
                <div className="flex-[2] h-full flex flex-col justify-center">
                     <div className="text-center">
                        <h4 className="font-orbitron text-lg text-cyan-400">Cubierta Inicial</h4>
                        <div className="w-24 h-px bg-cyan-400/50 mx-auto mt-1 mb-2"></div>
                    </div>
                    <div className="flex-grow bg-black/20 p-2 rounded-lg grid grid-cols-3 gap-2 content-center overflow-hidden">
                        {cardsToShow.map(instance => (
                           <Card 
                                key={instance.instanceId}
                                cardInstance={instance}
                                onClick={() => setZoomedCard(instance)}
                                disabled={false}
                                size="small"
                           />
                        ))}
                    </div>
                     {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-2">
                            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed rounded text-xs font-bold">
                                Anterior
                            </button>
                            <span className="text-xs text-gray-400">{currentPage + 1} / {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed rounded text-xs font-bold">
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Subcomponente para las partículas atmosféricas
const AtmosphericParticles = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${Math.random() * 20 + 15}s`,
            }
        }));
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute bottom-0 bg-cyan-200/20 rounded-full"
                    style={{ ...p.style, animation: `float-particle ${p.style.animationDuration} infinite linear` }}
                ></div>
            ))}
        </div>
    );
};

// Subcomponente para los efectos visuales del hangar
const HangarFX = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Barrido de Luz */}
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent"
             style={{ animation: 'light-sweep 15s infinite linear', animationDelay: '3s' }}/>
        
        {/* Brillo de Motores */}
        <div className="absolute bottom-[8%] left-[28%] w-16 h-4 bg-orange-400 rounded-full blur-lg"
             style={{ animation: 'engine-flicker 4s infinite ease-in-out' }} />
        <div className="absolute bottom-[8%] right-[28%] w-16 h-4 bg-orange-400 rounded-full blur-lg"
             style={{ animation: 'engine-flicker 4s infinite ease-in-out', animationDelay: '0.5s' }} />
    </div>
);


export const HangarScreen: React.FC<HangarScreenProps> = ({ onStartGame, onReturnToStart }) => {
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [displayedShips, setDisplayedShips] = useState<ShipData[]>(getAllShips());
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 });
  const [zoomedCard, setZoomedCard] = useState<CardInstance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('in-hangar');
    // Cargar naves usando el sistema centralizado
    const ships = getAllShips();
    console.log('[DEBUG] Loaded ships:', ships.map(s => ({ id: s.id, name: s.name })));
    setDisplayedShips(ships);
    return () => document.body.classList.remove('in-hangar');
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { offsetWidth, offsetHeight } = currentTarget;
    const x = (clientX - offsetWidth / 2) / offsetWidth * 20;
    const y = (clientY - offsetHeight / 2) / offsetHeight * 20;
    setBgPosition({ x: -x, y: -y });
  };

  const selectedShip = displayedShips.find(ship => ship.id === selectedShipId);
  
  console.log('[DEBUG] Current selectedShipId:', selectedShipId);
  console.log('[DEBUG] Found selectedShip:', selectedShip?.name);

  return (
    <div 
        id="hangar-screen" 
        className="h-screen w-screen flex flex-col items-center justify-center p-4 transition-all duration-1000 ease-in-out relative overflow-hidden"
        onMouseMove={handleMouseMove}
    >
        <AtmosphericParticles />
        <HangarFX />
        <div className="hangar-background" style={{ transform: `translate(${bgPosition.x}px, ${bgPosition.y}px) scale(1.05)` }}></div>
      
      {loading ? (
        <div className="relative z-10 text-center animate-fade-in">
          <div className="text-4xl font-orbitron text-cyan-300 mb-4">Cargando Hangar...</div>
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-6 animate-fade-in-up flex-shrink-0 relative z-10">
            <h1 className="text-5xl font-orbitron text-cyan-300 drop-shadow-lg">Hangar Orbital</h1>
            <p className="text-lg text-gray-300 mt-2">Elige tu nave para la próxima expedición.</p>
          </div>
      
      <div className="flex justify-center items-center gap-8 mb-6 flex-shrink-0 relative z-10">
        {displayedShips.map((ship, index) => {
          console.log('[DEBUG] Rendering ship:', index, ship.id, ship.name, 'isSelected:', ship.id === selectedShipId);
          return (
            <ShipCard 
              key={ship.id}
              ship={ship}
              isSelected={ship.id === selectedShipId}
              isDimmed={selectedShipId !== null && ship.id !== selectedShipId}
              onSelect={() => {
                console.log('[DEBUG] Ship selected:', ship.id, ship.name);
                setSelectedShipId(ship.id);
              }}
              animDelay={`${index * 150 + 200}ms`}
            />
          );
        })}
      </div>
      
      <div className="flex-grow w-full flex justify-center items-center min-h-0 relative z-10 px-4">
        {selectedShip && (
          <ShipDetailsPanel 
            ship={selectedShip} 
            onStart={() => onStartGame(selectedShip)} 
            onReturn={onReturnToStart}
            zoomedCard={zoomedCard}
            setZoomedCard={setZoomedCard}
          />
        )}
      </div>

          {/* Visor de carta ampliada */}
          {zoomedCard && (
              <div 
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
                onClick={() => setZoomedCard(null)}
              >
                  <div onClick={e => e.stopPropagation()} className="animate-fade-in transform scale-[3]">
                      <Card cardInstance={zoomedCard} onClick={() => {}} disabled={true} size="normal" />
                  </div>
              </div>
          )}
        </>
      )}
    </div>
  );
};
