import React, { useRef, useEffect, useState } from 'react';
import { CombatState, Combatant, CardInstance, EnemyIntent } from '../types';
import { Card } from './Card';
import { ALL_CARDS } from '../data/cards';

// Componente para números de daño flotantes
interface FloatingNumber {
  id: string;
  value: number;
  type: 'damage' | 'heal' | 'shield';
  x: number;
  y: number;
}

const FloatingDamageNumber: React.FC<{ number: FloatingNumber; onComplete: (id: string) => void }> = ({ number, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(number.id);
    }, 1500);
    return () => clearTimeout(timer);
  }, [number.id, onComplete]);

  const colorClass = number.type === 'damage' ? 'text-red-400' : number.type === 'heal' ? 'text-green-400' : 'text-cyan-400';
  const prefix = number.type === 'damage' ? '-' : '+';

  return (
    <div
      className={`fixed pointer-events-none font-orbitron font-bold text-3xl ${colorClass} animate-float-up z-40`}
      style={{ left: `${number.x}vw`, top: `${number.y}vh` }}
    >
      {prefix}{number.value}
    </div>
  );
};

interface CombatInterfaceProps {
  combatState: CombatState;
  onPlayCard: (cardInstanceId: string) => void;
  onEndTurn: () => void;
  onCombatComplete: (finalState: CombatState) => void;
}

// Iconos para las intenciones del enemigo
const IntentIcon: React.FC<{ intent: EnemyIntent }> = ({ intent }) => {
    let icon = '❓';
    let text = `${intent.value || ''}`;
    let color = 'text-gray-300';

    switch (intent.type) {
        case 'ATTACK':
            icon = '⚔️';
            color = 'text-red-400';
            break;
        case 'DEFEND':
            icon = '🛡️';
            color = 'text-cyan-400';
            break;
        case 'ATTACK_DEFEND':
            icon = '⚔️🛡️';
            text = `${intent.value}/${intent.secondaryValue}`;
            color = 'text-yellow-400';
            break;
        case 'BUFF':
            icon = '🔥';
            text = '';
            color = 'text-orange-400';
            break;
        default:
             text = '...';
    }

    return (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/90 border-2 border-yellow-400 rounded-full px-3 py-0.5 flex items-center gap-1 animate-pulse-subtle shadow-lg z-20`}
             style={{ boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)' }}>
            <span className="text-lg">{icon}</span>
            <span className={`font-orbitron font-bold text-sm ${color}`}>{text}</span>
        </div>
    );
};


// Panel que muestra la información de un combatiente (NUEVO DISEÑO COMPACTO)
const CombatantPanel: React.FC<{ combatant: Combatant; onDamage?: (amount: number) => void }> = ({ combatant, onDamage }) => {
  const { name, hp, maxHp, shield, maxShield, isPlayer, intent, image } = combatant;
  const panelRef = useRef<HTMLDivElement>(null);
  const prevHpRef = useRef(hp);
  const prevShieldRef = useRef(shield);

  useEffect(() => {
    const hpDamage = prevHpRef.current - hp;
    const shieldDamage = prevShieldRef.current - shield;
    
    if (hpDamage > 0 && panelRef.current) {
        panelRef.current.classList.remove('animate-damage-flash');
        void panelRef.current.offsetWidth; 
        panelRef.current.classList.add('animate-damage-flash');
        if (onDamage) onDamage(hpDamage);
    }
    
    if (shieldDamage > 0 && onDamage) {
        onDamage(shieldDamage);
    }
    
    prevHpRef.current = hp;
    prevShieldRef.current = shield;
  }, [hp, shield, onDamage]);
  
  const hpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const shieldPercentage = maxShield > 0 ? (shield / maxShield) * 100 : 0;

  return (
    <div ref={panelRef} className="relative w-full h-full bg-black/30 rounded-lg overflow-hidden border-2 border-gray-700/50 flex items-center justify-center">
        {image && <img src={image} alt={name} className="w-full h-full object-cover opacity-80" />}
        {!isPlayer && intent && <IntentIcon intent={intent} />}
        
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
            <h3 className="text-lg font-orbitron text-center truncate">{name}</h3>
            <div className="space-y-1.5 mt-2">
                {/* Barra de Casco */}
                <div className="flex items-center gap-2">
                    <span title="Casco">❤️</span>
                    <div className="progress-bar-bg h-3 flex-1">
                        <div className="progress-bar-fill bg-red-500" style={{ width: `${hpPercentage}%` }}></div>
                    </div>
                    <span className="text-xs font-mono w-16 text-right">{hp}/{maxHp}</span>
                </div>
                 {/* Barra de Escudos */}
                <div className="flex items-center gap-2">
                    <span title="Escudos">🛡️</span>
                    <div className="progress-bar-bg h-3 flex-1">
                        <div className="progress-bar-fill bg-cyan-500" style={{ width: `${shieldPercentage}%` }}></div>
                    </div>
                    <span className="text-xs font-mono w-16 text-right">{shield}/{maxShield}</span>
                </div>
            </div>
        </div>
    </div>
  );
};


// Componente para mostrar el estado del mazo del jugador
const DeckInfo: React.FC<{ label: string, count: number, icon?: string }> = ({ label, count, icon }) => (
    <div className="flex flex-col items-center justify-center bg-gray-900/80 p-1 rounded-lg border border-cyan-500/20 w-16 h-16">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="font-orbitron text-sm font-bold text-cyan-300">{count}</span>
        <span className="text-xs text-gray-400">{label}</span>
    </div>
)

// Componente para mostrar los nuevos recursos de combate
const CombatResourceInfo: React.FC<{ label: string, value: number, icon: string }> = ({ label, value, icon }) => (
    <div className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-lg border border-cyan-500/20 w-auto">
        <span className="text-sm">{icon}</span>
        <div>
            <span className="font-orbitron text-sm font-bold text-cyan-300">{value}</span>
            <span className="text-xs text-gray-400 block">{label}</span>
        </div>
    </div>
)

const CombatLog: React.FC<{ logs: string[] }> = ({ logs }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="flex flex-col h-full w-full" style={{ minHeight: 0 }}>
            <h3 className="font-orbitron text-xs text-cyan-400 mb-1 border-b border-cyan-500/20 pb-1 flex-shrink-0">Bitácora</h3>
            <div ref={logContainerRef} className="flex-1 overflow-y-auto pr-1 text-xs space-y-1" style={{ minHeight: 0 }}>
                {logs.slice(-50).map((entry, index) => (
                    <p key={index} className="text-gray-300 animate-fade-in-up leading-snug">{entry}</p>
                ))}
            </div>
        </div>
    );
};

export const CombatInterface: React.FC<CombatInterfaceProps> = ({ combatState, onPlayCard, onEndTurn, onCombatComplete }) => {
    const { combatants, log, phase } = combatState;
    const player = combatants.find(c => c.isPlayer)!;
    const enemy = combatants.find(c => !c.isPlayer)!;
    const isPlayerInputPhase = phase === 'PLAYER_INPUT';
    const isGameOver = phase === 'GAME_OVER';
    const [playedCard, setPlayedCard] = useState<CardInstance | null>(null);
    const [cardEffect, setCardEffect] = useState<string>('');
    const playCardTimerRef = useRef<NodeJS.Timeout | null>(null);
    const effectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [usedCards, setUsedCards] = useState<CardInstance[]>([]);
    const [zoomedCard, setZoomedCard] = useState<CardInstance | null>(null);

    // Sistema de números flotantes
    const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
    const floatingNumberIdRef = useRef(0);
    
    const addFloatingNumber = (value: number, type: FloatingNumber['type'], targetIsPlayer: boolean) => {
        const id = `float-${floatingNumberIdRef.current++}`;
        // Calcular posición en viewport (aproximadamente donde está el canvas)
        const xPercent = targetIsPlayer ? 20 : 60;
        const yPercent = 35;
        setFloatingNumbers(prev => [...prev, { id, value, type, x: xPercent, y: yPercent }]);
    };
    
    const removeFloatingNumber = (id: string) => {
        setFloatingNumbers(prev => prev.filter(n => n.id !== id));
    };

    // Cleanup de timers al desmontar componente
    React.useEffect(() => {
        return () => {
            if (playCardTimerRef.current) {
                clearTimeout(playCardTimerRef.current);
            }
            if (effectTimerRef.current) {
                clearTimeout(effectTimerRef.current);
            }
        };
    }, []);

    const handleCardDoubleClick = (cardInstance: CardInstance) => {
        const cardData = ALL_CARDS[cardInstance.cardId];
        if (!cardData) return;
        const actualCost = Math.max(0, cardData.cost + (cardInstance.affix?.costModifier || 0));
        const canPlay = isPlayerInputPhase && (player.energy || 0) >= actualCost;
        
        if (canPlay) {
            setPlayedCard(cardInstance);
            setCardEffect('');
            if (playCardTimerRef.current) clearTimeout(playCardTimerRef.current);
            if (effectTimerRef.current) clearTimeout(effectTimerRef.current);
            
            // Después de 2 segundos, aplicar efectos especiales
            playCardTimerRef.current = setTimeout(() => {
                const effects = ['cardfx-shake', 'cardfx-3d'];
                const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                setCardEffect(randomEffect);
                
                // Después del efecto especial, aplicar turbulencia
                effectTimerRef.current = setTimeout(() => {
                    setCardEffect('cardfx-turbulence');
                    
                    // Después de la turbulencia, aplicar efectos del juego y remover carta
                    setTimeout(() => {
                        onPlayCard(cardInstance.instanceId);
                        setPlayedCard(null);
                        setCardEffect('');
                        setUsedCards(prev => [...prev, cardInstance]);
                    }, 800); // Duración de la animación de turbulencia
                }, randomEffect === 'cardfx-shake' ? 600 : 1200); // Duración del efecto especial
            }, 2000); // 2 segundos iniciales
        }
    };

  return (
    <div className="fixed inset-0 z-20 bg-black animate-fade-in flex items-center justify-center">
      <div className="h-[85.5vh] w-[78.4vw] flex flex-col gap-3 p-3 bg-black rounded-lg border border-cyan-500/30">
      
      {/* Números de daño flotantes */}
      {floatingNumbers.map(num => (
        <FloatingDamageNumber key={num.id} number={num} onComplete={removeFloatingNumber} />
      ))}
      
      {/* Fila Superior: Paneles de Combatientes */}
      <div className="flex gap-3 items-stretch flex-nowrap flex-shrink-0" style={{ height: '380px' }}>
        {/* Izquierda: Jugador */}
        <div className="w-52 shrink-0 flex flex-col items-center justify-start p-3 bg-gray-900/40 rounded-lg border border-cyan-500/20 overflow-hidden relative">
          <div className="w-full flex items-center justify-center overflow-hidden" style={{ height: 'calc(520px - 80px)' }}>
            <img src={player.image} alt={player.name} className="h-full w-full object-cover" />
          </div>
          <div className="text-xs text-center mt-2 w-full flex-shrink-0 px-2">
            <p className="text-cyan-300 font-bold truncate mb-1">{player.name}</p>
            <div className="flex flex-col gap-1 text-gray-300">
              <div className="flex items-center gap-1">
                <span>❤️</span>
                <div className="progress-bar-bg h-2 flex-1">
                  <div className="progress-bar-fill bg-red-500" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}></div>
                </div>
                <span className="text-xs w-12 text-right">{player.hp}/{player.maxHp}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🛡️</span>
                <div className="progress-bar-bg h-2 flex-1">
                  <div className="progress-bar-fill bg-cyan-500" style={{ width: `${(player.shield / player.maxShield) * 100}%` }}></div>
                </div>
                <span className="text-xs w-12 text-right">{player.shield}/{player.maxShield}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Centro: Cartas en Juego */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 overflow-visible relative">
          {/* Carta Jugada en el Centro - Espacio reservado */}
          <div className="h-[500px] w-96 flex items-center justify-center overflow-visible">
            {playedCard && (
              <div key={`${playedCard.instanceId}-${cardEffect}`} className={`${cardEffect}`}>
                <div onMouseEnter={() => {}} onMouseLeave={() => {}}>
                  <Card cardInstance={playedCard} onClick={() => {}} disabled={true} size="large" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Derecha: Enemigo */}
        <div className="w-52 shrink-0 flex flex-col items-center justify-start p-3 bg-gray-900/40 rounded-lg border border-red-500/20 overflow-visible relative">
          {enemy.intent && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
              <IntentIcon intent={enemy.intent} />
            </div>
          )}
          <div className="w-full flex items-center justify-center overflow-hidden" style={{ height: 'calc(520px - 80px)' }}>
            <img src={enemy.image} alt={enemy.name} className="h-full w-full object-cover" />
          </div>
          <div className="text-xs text-center mt-2 w-full flex-shrink-0 px-2">
            <p className="text-red-300 font-bold truncate mb-1">{enemy.name}</p>
            <div className="flex flex-col gap-1 text-gray-300">
              <div className="flex items-center gap-1">
                <span>❤️</span>
                <div className="progress-bar-bg h-2 flex-1">
                  <div className="progress-bar-fill bg-red-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                </div>
                <span className="text-xs w-12 text-right">{enemy.hp}/{enemy.maxHp}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🛡️</span>
                <div className="progress-bar-bg h-2 flex-1">
                  <div className="progress-bar-fill bg-cyan-500" style={{ width: `${(enemy.shield / enemy.maxShield) * 100}%` }}></div>
                </div>
                <span className="text-xs w-12 text-right">{enemy.shield}/{enemy.maxShield}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fila Inferior: Mano de Cartas y Controles */}
      <div className="flex gap-3 h-80 items-stretch">
        {/* Izquierda: Info de Pilas y Cartas Jugadas */}
        <div className="w-52 shrink-0 flex flex-col bg-gray-900/70 p-2 rounded-lg border border-cyan-500/20">
          {/* Área de cartas jugadas en grid */}
          <div className="flex-1 min-h-0 mb-2 overflow-hidden relative">
            {usedCards.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 h-full content-start overflow-y-auto pr-1">
                {usedCards.map((card, index) => {
                  const cardData = ALL_CARDS[card.cardId];
                  return (
                    <div
                      key={`${card.instanceId}-${index}`}
                      onClick={() => setZoomedCard(card)}
                      className="w-full aspect-[3/4] border-2 border-cyan-500/60 rounded overflow-hidden hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50 transition-all cursor-pointer relative group"
                      title={cardData?.name || 'Carta'}
                    >
                      {cardData?.image && (
                        <img src={cardData.image} alt={cardData.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center flex items-center justify-center h-full">Sin cartas usadas</div>
            )}
          </div>
          {/* Iconos de pilas abajo */}
          <div className="flex gap-1 justify-center">
            <DeckInfo label="Mazo" count={player.drawPile?.length || 0} icon="📚" />
            <DeckInfo label="Descarte" count={player.discardPile?.length || 0} icon="🗑️" />
          </div>
        </div>

        {/* Centro: Mano de Cartas */}
        <div className="flex-1 flex justify-center items-end px-3">
          {player.hand && player.hand.map((cardInstance, index) => {
            const cardData = ALL_CARDS[cardInstance.cardId];
            if (!cardData) return null;
            const actualCost = Math.max(0, cardData.cost + (cardInstance.affix?.costModifier || 0));
            const canPlay = isPlayerInputPhase && (player.energy || 0) >= actualCost;

            // --- Stable Arc Logic ---
            const numCards = player.hand.length;
            const middleIndex = (numCards - 1) / 2;
            const offset = index - middleIndex;

            const angleFactor = 10; 
            const yFactor = 8;
            const xMargin = -32;

            const rotationAngle = offset * angleFactor;

            // Vertical offset for this specific card to form the arc
            const baseYOffset = Math.pow(offset, 2) * yFactor;

            // Height of the entire current arc, from lowest to highest point
            const currentArcHeight = Math.pow((numCards - 1) / 2, 2) * yFactor;

            // Translate the card up for the arc, then pull the whole arc down
            // so its lowest points (the edges) are anchored at the bottom.
            const yPosition = baseYOffset - currentArcHeight;

            const cardStyle = {
                transform: `rotate(${rotationAngle}deg) translateY(${yPosition}px)`,
                transformOrigin: 'bottom center',
                transition: 'transform 0.3s ease-out',
                zIndex: numCards - Math.abs(offset),
                margin: `0 ${xMargin}px`,
            };

            return (
              <div
                key={cardInstance.instanceId}
                style={cardStyle}
                className="relative hover:!z-50 hover:!transform hover:!scale-110 hover:-translate-y-8 transition-transform duration-300"
              >
                <Card
                  cardInstance={cardInstance}
                  onClick={() => {}}
                  onDoubleClick={() => handleCardDoubleClick(cardInstance)}
                  disabled={!canPlay}
                  size="small"
                />
              </div>
            );
          })}
        </div>

        {/* Derecha: Controles y Bitácora en un solo panel */}
        <div className="w-52 shrink-0 flex flex-col bg-gray-900/70 p-2 rounded-lg border border-cyan-500/20 overflow-hidden" style={{ height: '320px', maxHeight: '320px' }}>
          {/* Botón Finalizar Turno */}
          <button
            onClick={onEndTurn}
            disabled={!isPlayerInputPhase}
            className="w-full font-orbitron text-sm p-1 rounded-md border flex-shrink-0
            disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-500
            bg-green-700/80 border-green-500/70 hover:enabled:bg-green-600/80 hover:enabled:border-green-400"
          >
            Finalizar Turno
          </button>
          
          {/* Recursos: Energía, Fuego, Maniobra */}
          <div className="flex items-center justify-center gap-1 flex-shrink-0 my-1">
            <div className="flex flex-col items-center">
              <span className="font-orbitron text-lg font-bold text-cyan-300">{player.energy}</span>
              <span className="text-xs text-gray-400">⚡</span>
            </div>
            <CombatResourceInfo label="Fuego" value={player.fuego || 0} icon="💥" />
            <CombatResourceInfo label="Maniobra" value={player.maniobra || 0} icon="🚀" />
          </div>
          
          {/* Divisor */}
          <div className="border-t border-cyan-500/30 flex-shrink-0 my-1"></div>
          
          {/* Bitácora */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <CombatLog logs={log} />
          </div>
        </div>
      </div>

      {/* Modal de Zoom de Carta */}
      {zoomedCard && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4" onClick={() => setZoomedCard(null)}>
          <div className="relative w-80 h-full max-h-96 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const cardData = ALL_CARDS[zoomedCard.cardId];
              return (
                <div className="w-full h-full relative flex flex-col">
                  {cardData?.image && (
                    <img src={cardData.image} alt={cardData.name} className="w-full flex-1 object-cover rounded-lg shadow-2xl shadow-cyan-500/50" />
                  )}
                  <div className="bg-gradient-to-t from-black/90 to-transparent p-3 rounded-b-lg flex-shrink-0">
                    <p className="font-orbitron text-cyan-300 text-sm font-bold">{cardData?.name}</p>
                    <p className="text-xs text-gray-300 mt-1">{cardData?.description}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Superposición de Fin de Combate */}
      {isGameOver && (
        <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <h2 
              className="text-6xl font-orbitron mb-4 drop-shadow-lg"
              style={{ color: combatState.victory ? '#67e8f9' : '#f87171' }}
            >
              {combatState.victory ? '¡VICTORIA!' : 'DERROTA'}
            </h2>
            <button 
                onClick={() => onCombatComplete(combatState)} 
                className="mt-6 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold text-white transition-colors text-lg"
            >
                Continuar
            </button>
        </div>
      )}
      </div>
    </div>
  );
};
