import React, { useRef, useEffect } from 'react';
import { CombatState, Combatant, CardInstance, EnemyIntent } from '../types';
import { Card } from './Card';
import { ALL_CARDS } from '../data/cards';

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
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 border border-yellow-400/50 rounded-full px-3 py-0.5 flex items-center gap-2 animate-fade-in-up`}>
            <span className="text-lg">{icon}</span>
            <span className={`font-orbitron font-bold text-base ${color}`}>{text}</span>
        </div>
    );
};


// Panel que muestra la información de un combatiente (NUEVO DISEÑO COMPACTO)
const CombatantPanel: React.FC<{ combatant: Combatant }> = ({ combatant }) => {
  const { name, hp, maxHp, shield, maxShield, isPlayer, intent, image } = combatant;
  const panelRef = useRef<HTMLDivElement>(null);
  const prevHpRef = useRef(hp);

  useEffect(() => {
    if (hp < prevHpRef.current && panelRef.current) {
        panelRef.current.classList.remove('animate-damage-flash');
        void panelRef.current.offsetWidth; 
        panelRef.current.classList.add('animate-damage-flash');
    }
    prevHpRef.current = hp;
  }, [hp]);
  
  const hpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const shieldPercentage = maxShield > 0 ? (shield / maxShield) * 100 : 0;

  return (
    <div ref={panelRef} className="relative w-full aspect-[4/3] bg-black/30 rounded-lg overflow-hidden border-2 border-gray-700/50 flex items-center justify-center">
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
    <div className="flex flex-col items-center justify-center bg-gray-900/80 p-2 rounded-lg border border-cyan-500/20 w-20 h-20">
        {icon && <span className="text-2xl">{icon}</span>}
        <span className="font-orbitron text-xl font-bold text-cyan-300">{count}</span>
        <span className="text-xs text-gray-400">{label}</span>
    </div>
)

// Componente para mostrar los nuevos recursos de combate
const CombatResourceInfo: React.FC<{ label: string, value: number, icon: string }> = ({ label, value, icon }) => (
    <div className="flex items-center gap-2 bg-gray-900/80 p-2 rounded-lg border border-cyan-500/20 w-24">
        <span className="text-2xl">{icon}</span>
        <div>
            <span className="font-orbitron text-lg font-bold text-cyan-300">{value}</span>
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
        <div className="bg-gray-900/70 backdrop-blur-sm p-3 rounded-lg border border-cyan-500/20 h-full flex flex-col">
            <h3 className="font-orbitron text-md text-cyan-400 mb-2 border-b border-cyan-500/20 pb-2 flex-shrink-0">Bitácora de Combate</h3>
            <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2 text-xs space-y-1">
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
    const [playedCard, setPlayedCard] = React.useState<CardInstance | null>(null);
    const playCardTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Cleanup de timer al desmontar componente
    React.useEffect(() => {
        return () => {
            if (playCardTimerRef.current) {
                clearTimeout(playCardTimerRef.current);
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
            if (playCardTimerRef.current) clearTimeout(playCardTimerRef.current);
            playCardTimerRef.current = setTimeout(() => {
                onPlayCard(cardInstance.instanceId);
                setPlayedCard(null);
            }, 5000);
        }
    };

  return (
    <div className="fixed inset-0 z-20 bg-black/90 backdrop-blur-sm p-4 animate-fade-in grid grid-cols-[1fr_2fr_1fr_300px] grid-rows-[minmax(0,1fr)_auto_auto] gap-4 overflow-hidden">
      
      {/* Izquierda Superior: Carta del Jugador (Vertical) */}
      <div className="row-span-1 flex flex-col items-center justify-start p-2 bg-gray-900/40 rounded-lg border border-cyan-500/20 overflow-hidden">
        <div className="w-full flex-1 flex items-center justify-center min-h-0">
            <img src={player.image} alt={player.name} className="h-full w-auto object-contain" />
        </div>
        <div className="text-xs text-center mt-2 w-full flex-shrink-0">
            <p className="text-cyan-300 font-bold truncate">{player.name}</p>
            <div className="flex flex-col gap-1 mt-1 text-gray-300">
                <div className="flex justify-center text-xs">
                    <span>❤️ {player.hp}/{player.maxHp}</span>
                </div>
                <div className="flex justify-center text-xs">
                    <span>🛡️ {player.shield}/{player.maxShield}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Centro: Cartas en Juego + Intención */}
      <div className="col-span-1 row-span-2 flex flex-col items-center justify-center p-4 gap-4 overflow-hidden">
        {/* Carta Jugada en el Centro */}
        {playedCard && (
            <div className="animate-fade-in flex-shrink-0">
                <Card cardInstance={playedCard} onClick={() => {}} disabled={true} size="normal" />
            </div>
        )}
        
        {/* Intención del Enemigo */}
        {enemy.intent && (
            <div className="p-4 bg-red-900/40 border-2 border-red-500/50 rounded-lg flex-shrink-0">
                <div className="flex items-center gap-4">
                    <IntentIcon intent={enemy.intent} />
                </div>
            </div>
        )}
      </div>

      {/* Derecha Superior: Carta del Enemigo (Vertical) */}
      <div className="row-span-1 flex flex-col items-center justify-start p-2 bg-gray-900/40 rounded-lg border border-red-500/20 overflow-hidden">
        <div className="w-full flex-1 flex items-center justify-center min-h-0">
            <img src={enemy.image} alt={enemy.name} className="h-full w-auto object-contain" />
        </div>
        <div className="text-xs text-center mt-2 w-full flex-shrink-0">
            <p className="text-red-300 font-bold truncate">{enemy.name}</p>
            <div className="flex flex-col gap-1 mt-1 text-gray-300">
                <div className="flex justify-center text-xs">
                    <span>❤️ {enemy.hp}/{enemy.maxHp}</span>
                </div>
                <div className="flex justify-center text-xs">
                    <span>🛡️ {enemy.shield}/{enemy.maxShield}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Izquierda Inferior: Info de Pilas */}
      <div className="col-start-1 row-start-3 flex flex-col gap-2 bg-gray-900/70 p-2 rounded-lg border border-cyan-500/20">
        <DeckInfo label="Mazo" count={player.drawPile?.length || 0} icon="📚" />
        <DeckInfo label="Descarte" count={player.discardPile?.length || 0} icon="🗑️" />
        <DeckInfo label="Exilio" count={player.exilePile?.length || 0} icon="🔥" />
      </div>

      {/* Centro Inferior: Mano de Cartas */}
      <div className="col-span-2 row-start-3 flex justify-center items-center gap-2 p-3 bg-gray-900/70 rounded-lg border border-cyan-500/20 overflow-x-auto">
           {player.hand && player.hand.map((cardInstance) => {
               const cardData = ALL_CARDS[cardInstance.cardId];
               if (!cardData) return null;
               const actualCost = Math.max(0, cardData.cost + (cardInstance.affix?.costModifier || 0));
               const canPlay = isPlayerInputPhase && (player.energy || 0) >= actualCost;
               return (
                   <Card 
                    key={cardInstance.instanceId}
                    cardInstance={cardInstance}
                    onClick={() => {}}
                    onDoubleClick={() => handleCardDoubleClick(cardInstance)}
                    disabled={!canPlay}
                    size="small"
                   />
               )
           })}
      </div>

      {/* Derecha Inferior: Bitácora y Botón Finalizar Turno */}
      <div className="col-start-4 row-span-3 flex flex-col gap-4">
        <div className="flex-grow min-h-0">
          <CombatLog logs={log} />
        </div>
        
        <div className="flex flex-col gap-2 bg-gray-900/70 p-2 rounded-lg border border-cyan-500/20 flex-shrink-0">
            <div className="text-center">
                <span className="font-orbitron text-2xl font-bold text-cyan-300">{player.energy}/{player.maxEnergy}</span>
                <span className="text-xs text-gray-400 block">Energía</span>
            </div>
            <button
                onClick={onEndTurn}
                disabled={!isPlayerInputPhase}
                className="w-full font-orbitron text-sm p-2 rounded-md border
                disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-500
                bg-green-700/80 border-green-500/70 hover:enabled:bg-green-600/80 hover:enabled:border-green-400"
            >
                Finalizar Turno
            </button>
            <div className="flex flex-col gap-1">
                <CombatResourceInfo label="Fuego" value={player.fuego || 0} icon="💥" />
                <CombatResourceInfo label="Maniobra" value={player.maniobra || 0} icon="🚀" />
            </div>
        </div>
      </div>

      {/* Superposición de Fin de Combate */}
      {isGameOver && (
        <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <h2 
              className="text-6xl font-orbitron mb-4 drop-shadow-lg"
              style={{ color: combatState.victory ? '#67e8f9' : '#f87171' }} // cyan-300 or red-400
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
  );
};
