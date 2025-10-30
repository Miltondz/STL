import React, { useState, useEffect, useCallback } from 'react';

// Types
import { MapData, PlayerState, CombatState, EventCardData, ShopInventory, CardInstance, ShipData, EventConsequenceResult, SimulationResult, ShopCard, ShopServiceType, EventOption } from './types';

// Services
import { generateMap } from './services/mapGenerator';
import { resolveNode, resetEventCardStates } from './services/eventManager';
import * as combatEngine from './services/combatEngine';
import { generateShopInventory } from './services/shopManager';

// Components
import { GalacticMap } from './components/GalacticMap';
import { PlayerStatus } from './components/PlayerStatus';
import { TravelLog } from './components/TravelLog';
import { EventCard } from './components/EventCard';
import { CombatInterface } from './components/CombatInterface';
import { PreCombatModal } from './components/PreCombatModal';
import { CardRewardScreen } from './components/CardRewardScreen';
import { ShopModal } from './components/ShopModal';
import { GenericModal } from './components/GenericModal';
import { LevelUpModal } from './components/LevelUpModal';
import { HangarScreen } from './components/HangarScreen';
import { StartScreen } from './components/StartScreen';
import { NodeViewer } from './components/NodeViewer';

// Data
import { ALL_CARDS } from './data/cards';
import { BASE_PLAYER_STATE, LEVEL_THRESHOLDS } from './constants';
import contentLoader from './services/contentLoader';

// --- Helper Functions ---
const createCardInstance = (cardId: string): CardInstance => ({
  instanceId: `${cardId}_${Date.now()}_${Math.random()}`,
  cardId,
});

function App() {
  const [gamePhase, setGamePhase] = useState<'START_SCREEN' | 'HANGAR' | 'IN_GAME' | 'PRE_COMBAT' | 'COMBAT' | 'EVENT' | 'SHOP' | 'CARD_REWARD' | 'LEVEL_UP' | 'SIMULATION_RESULT' | 'GAME_OVER'>('START_SCREEN');
  const [contentLoaded, setContentLoaded] = useState(false);

  // Game State
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>(["Bitácora de viaje iniciada."]);
  const [isTraveling, setIsTraveling] = useState(false);

  // Modal/Screen States
  const [activeEvent, setActiveEvent] = useState<EventCardData | null>(null);
  const [eventResult, setEventResult] = useState<EventConsequenceResult | null>(null);
  const [activeCombat, setActiveCombat] = useState<CombatState | null>(null);
  const [preCombatEnemyId, setPreCombatEnemyId] = useState<string | null>(null);
  const [cardRewards, setCardRewards] = useState<string[]>([]);
  const [rewardTitle, setRewardTitle] = useState("Elige tu Recompensa");
  const [shopInventory, setShopInventory] = useState<ShopInventory | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [pendingLevelUps, setPendingLevelUps] = useState(0);
  
  // Cargar contenido al inicio
  useEffect(() => {
    const loadGameContent = async () => {
      try {
        console.log('[App] Iniciando carga de contenido...');
        await contentLoader.loadContent();
        console.log('[App] Contenido cargado exitosamente');
        setContentLoaded(true);
      } catch (error) {
        console.warn('[App] Error cargando contenido, usando datos hardcodeados:', error);
        // Continuar con datos hardcodeados
        setContentLoaded(true);
      }
    };
    loadGameContent();
  }, []);
  
  // Gestiona el fondo de la aplicación según la fase del juego
  useEffect(() => {
    document.body.classList.remove('start-screen', 'in-hangar', 'in-game');
    switch (gamePhase) {
      case 'START_SCREEN':
        document.body.classList.add('start-screen');
        break;
      case 'HANGAR':
        document.body.classList.add('in-hangar');
        break;
      case 'IN_GAME':
      case 'PRE_COMBAT':
      case 'EVENT':
      case 'SHOP':
      case 'CARD_REWARD':
      case 'LEVEL_UP':
      case 'SIMULATION_RESULT':
        document.body.classList.add('in-game');
        break;
      default:
        break;
    }
  }, [gamePhase]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-50), message]);
  }, []);

  // --- Game Flow Handlers ---

  const handleShowHangar = () => {
    setGamePhase('HANGAR');
  };
  
  const handleReturnToStartScreen = () => {
    setGamePhase('START_SCREEN');
  };

  const handleStartGame = (ship: ShipData) => {
      // Reiniciar estado de eventos para nueva partida
      resetEventCardStates();
      
      const initialDeck = ship.initialDeck.map(createCardInstance);
      const newPlayerState: PlayerState = {
          ...BASE_PLAYER_STATE,
          name: ship.name,
          image: ship.image,
          fuel: ship.initialFuel,
          credits: ship.initialCredits,
          crew: ship.crew,
          hull: ship.maxHull,
          maxHull: ship.maxHull,
          shields: ship.maxShields,
          maxShields: ship.maxShields,
          deck: initialDeck,
      };
      setPlayerState(newPlayerState);

      const newMap = generateMap();
      setMapData(newMap);
      setCurrentNodeId(newMap.startNodeId);
      setLogs([`Has despegado con "${ship.name}". ¡Que la suerte te acompañe!`]);
      
      const hangarScreen = document.getElementById('hangar-screen');
      if (hangarScreen) {
        hangarScreen.classList.add('hyperspace-jump-active');
        setTimeout(() => {
            setGamePhase('IN_GAME');
        }, 1000);
      } else {
        setGamePhase('IN_GAME');
      }
  };

  const handleNodeSelect = (nodeId: number) => {
    if (!playerState || !mapData) return;

    document.body.classList.add('is-traveling');
    setIsTraveling(true);
    
    setTimeout(() => {
      document.body.classList.remove('is-traveling');
      setIsTraveling(false);
      
      const newPlayerState = { ...playerState, fuel: playerState.fuel - 1 };
      const newNodes = mapData.nodes.map(n => n.id === nodeId ? { ...n, visited: true } : n);
      setMapData({ ...mapData, nodes: newNodes });
      setCurrentNodeId(nodeId);

      const selectedNode = mapData.nodes.find(n => n.id === nodeId)!;
      addLog(`Viajando al nodo ${selectedNode.type}. Combustible restante: ${newPlayerState.fuel}`);

      const resolution = resolveNode(selectedNode.type, newPlayerState);
      
      if (resolution.card) {
          setActiveEvent(resolution.card);
          setGamePhase('EVENT');
      } else if (resolution.combat) {
          setPreCombatEnemyId(resolution.combat.enemyId);
          setGamePhase('PRE_COMBAT');
      } else if (resolution.shop) {
          setShopInventory(generateShopInventory());
          setGamePhase('SHOP');
      } else if (resolution.simulation) {
          setSimulationResult(resolution.simulation);
          setPlayerState(resolution.simulation.newState);
          addLog(resolution.simulation.log);
          setGamePhase('SIMULATION_RESULT');
      }
      setPlayerState(newPlayerState);

    }, 500);
  };

  const handleGainXp = useCallback((xp: number) => {
    if (!playerState) return;
    addLog(`Ganas ${xp} XP.`);

    let newXp = playerState.xp + xp;
    let newLevel = playerState.level;
    let newXpToNext = playerState.xpToNextLevel;
    let levelUps = 0;

    while (newXp >= newXpToNext && newLevel < LEVEL_THRESHOLDS.length - 1) {
      newXp -= newXpToNext;
      newLevel++;
      levelUps++;
      newXpToNext = LEVEL_THRESHOLDS[newLevel];
      addLog(`¡Has alcanzado el nivel ${newLevel}!`);
    }

    setPlayerState(prev => prev ? { ...prev, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext } : null);
    if (levelUps > 0) {
      setPendingLevelUps(prev => prev + levelUps);
    }
  }, [playerState, addLog]);

  const handleEventOptionSelect = (option: EventOption) => {
      if (!playerState) return;
      const result = option.consequence(playerState);
      setEventResult(result);
      setPlayerState(result.newState);
      if(result.reactionText) addLog(`💬 ${result.reactionText}`);
      addLog(result.log);
      if(result.xpGained) handleGainXp(result.xpGained);
      if(result.achievementId) addLog(`🏆 Logro Desbloqueado: ${result.achievementId}`);
  };

  const handleEventComplete = () => {
      setActiveEvent(null);
      setEventResult(null);
      if (pendingLevelUps > 0) {
          setGamePhase('LEVEL_UP');
      } else {
          setGamePhase('IN_GAME');
      }
  };

  const handleStartCombat = () => {
    if (!playerState || !preCombatEnemyId) return;
    const newCombat = combatEngine.createCombat(playerState, preCombatEnemyId, Date.now());
    setActiveCombat(newCombat);
    setGamePhase('COMBAT');
    setPreCombatEnemyId(null);
  };

  const handlePlayCard = (cardInstanceId: string) => {
      if (!activeCombat) return;
      const enemy = activeCombat.combatants.find(c => !c.isPlayer);
      if(!enemy) return;
      setActiveCombat(combatEngine.playCard(activeCombat, cardInstanceId, enemy.id));
  };
  
  const handleEndTurn = () => {
      if (!activeCombat) return;
      setActiveCombat(combatEngine.resolveTurn(activeCombat));
  };

  const handleCombatComplete = (finalState: CombatState) => {
    if (!playerState) return;
    
    const playerCombatant = finalState.combatants.find(c => c.isPlayer)!;
    const enemyCombatant = finalState.combatants.find(c => !c.isPlayer)!;
    let newState = { ...playerState, hull: playerCombatant.hp, shields: playerCombatant.shield };

    if (finalState.victory) {
        const creditsGained = enemyCombatant.reward?.credits || 0;
        const xpGained = enemyCombatant.reward?.xpReward || 0;
        
        newState.credits += creditsGained;
        addLog(`Recuperas ${creditsGained} créditos de los restos.`);
        
        setPlayerState(newState);
        if (xpGained > 0) handleGainXp(xpGained);

        const rewards = Object.values(ALL_CARDS).filter(c => c.rarity === 'Uncommon' || c.rarity === 'Common' && c.price > 0);
        const shuffled = [...rewards].sort(() => 0.5 - Math.random());
        setCardRewards(shuffled.slice(0, 3).map(c => c.id));
        setRewardTitle("Recompensa de Combate");
        setGamePhase('CARD_REWARD');

    } else {
        setPlayerState(newState);
        addLog("Tu aventura ha terminado.");
        setGamePhase('GAME_OVER');
    }
    setActiveCombat(null);
  };
  
  const handleCardRewardSelect = (cardId: string) => {
    if (!playerState) return;

    const newCardInstance = createCardInstance(cardId);
    setPlayerState(prev => prev ? { ...prev, deck: [...prev.deck, newCardInstance] } : null);
    addLog(`"${ALL_CARDS[cardId].name}" añadido a tu mazo.`);
    setCardRewards([]);

    if (pendingLevelUps > 0) {
      setGamePhase('LEVEL_UP');
    } else {
      setGamePhase('IN_GAME');
    }
  };

  const handleLevelUpReward = (rewardType: 'HULL' | 'ENERGY' | 'CARD') => {
      setPlayerState(prev => {
          if (!prev) return null;
          switch (rewardType) {
              case 'HULL':
                  addLog("Casco máximo aumentado en 5.");
                  return { ...prev, maxHull: prev.maxHull + 5, hull: prev.hull + 5 };
              case 'ENERGY':
                  addLog("Energía máxima en combate aumentada en 1. (Efecto futuro)");
                  return prev;
              case 'CARD':
                  const rareRewards = Object.values(ALL_CARDS).filter(c => c.rarity === 'Rare');
                  const shuffled = [...rareRewards].sort(() => 0.5 - Math.random());
                  setCardRewards(shuffled.slice(0, 3).map(c => c.id));
                  setRewardTitle("Mejora de Nivel: Elige una Carta Rara");
                  setGamePhase('CARD_REWARD');
                  return prev;
          }
          return prev;
      });
      setPendingLevelUps(prev => prev - 1);
      if (pendingLevelUps <= 1 && rewardType !== 'CARD') {
          setGamePhase('IN_GAME');
      }
  };

  const handleBuyCard = (card: ShopCard) => {
      if (!playerState || playerState.credits < card.price) return;
      const newCard = createCardInstance(card.cardId);
      setPlayerState(prev => ({ ...prev!, credits: prev!.credits - card.price, deck: [...prev!.deck, newCard] }));
      addLog(`Has comprado "${ALL_CARDS[card.cardId].name}".`);
  };

  const handlePerformService = (serviceType: ShopServiceType, cardInstanceId?: string) => {
    if (!playerState) return;
    const service = shopInventory?.services.find(s => s.type === serviceType);
    if (!service || playerState.credits < service.price) return;

    if (serviceType === 'remove_card' && cardInstanceId) {
        setPlayerState(prev => ({
            ...prev!,
            credits: prev!.credits - service.price,
            deck: prev!.deck.filter(c => c.instanceId !== cardInstanceId)
        }));
        addLog(`Has eliminado una carta de tu mazo.`);
    }
  };

  const handleSimulationComplete = () => {
    setSimulationResult(null);
    if (pendingLevelUps > 0) {
        setGamePhase('LEVEL_UP');
    } else {
        setGamePhase('IN_GAME');
    }
  };
  
  // Mostrar pantalla de carga mientras se carga el contenido
  if (!contentLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="text-4xl font-orbitron text-cyan-400 mb-4 animate-pulse">🚀</div>
          <h1 className="text-2xl font-orbitron text-cyan-400 mb-2">Cargando Contenido...</h1>
          <p className="text-gray-400">Inicializando datos del juego</p>
        </div>
      </div>
    );
  }
  
  if (gamePhase === 'START_SCREEN') {
    return <StartScreen onStart={handleShowHangar} />;
  }

  if (gamePhase === 'HANGAR') {
      return <HangarScreen onStartGame={handleStartGame} onReturnToStart={handleReturnToStartScreen} />;
  }
  
  if (!playerState || !mapData || currentNodeId === null) {
    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <div className="text-center">
                <h1 className="text-2xl font-orbitron text-red-500">Error de Carga</h1>
                <p className="text-gray-400">No se pudo cargar el estado del juego. Por favor, reinicia.</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-cyan-600 rounded">
                    Reiniciar
                </button>
            </div>
        </div>
    );
  }

  const currentNode = mapData.nodes.find(n => n.id === currentNodeId)!;
  const availableNodeIds = new Set(currentNode?.connections || []);
  const canTravel = (nodeId: number) => availableNodeIds.has(nodeId) && playerState.fuel > 0;

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_1fr] md:grid-rows-1 gap-4 p-4 bg-transparent overflow-hidden">
      <main className="md:col-span-3 h-full min-h-0 relative">
        <GalacticMap 
            nodes={mapData.nodes} 
            currentNodeId={currentNodeId} 
            onNodeSelect={(nodeId) => canTravel(nodeId) && handleNodeSelect(nodeId)} 
        />
        {isTraveling && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-2xl font-orbitron">
                VIAJANDO...
            </div>
        )}
      </main>

      <aside className="md:col-span-1 h-full min-h-0 flex flex-col gap-4">
        <PlayerStatus state={playerState} />
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <TravelLog logs={logs} />
          </div>
          <div className="flex-1 min-h-0">
            <NodeViewer node={currentNode} />
          </div>
        </div>
      </aside>

      {gamePhase === 'EVENT' && activeEvent && (
        <div className="fixed inset-0 z-20 bg-black/70 flex items-center justify-center p-4">
          <EventCard card={activeEvent} playerState={playerState} onOptionSelect={handleEventOptionSelect} eventResult={eventResult} onComplete={handleEventComplete} />
        </div>
      )}
      {gamePhase === 'PRE_COMBAT' && preCombatEnemyId && (
        <PreCombatModal enemyId={preCombatEnemyId} onConfirm={handleStartCombat} />
      )}
      {gamePhase === 'COMBAT' && activeCombat && (
        <CombatInterface combatState={activeCombat} onPlayCard={handlePlayCard} onEndTurn={handleEndTurn} onCombatComplete={handleCombatComplete} />
      )}
      {gamePhase === 'CARD_REWARD' && cardRewards.length > 0 && (
          <CardRewardScreen cardIds={cardRewards} onCardSelect={handleCardRewardSelect} title={rewardTitle} />
      )}
      {gamePhase === 'SHOP' && shopInventory && (
          <ShopModal inventory={shopInventory} playerState={playerState} onBuyCard={handleBuyCard} onPerformService={handlePerformService} onClose={() => setGamePhase('IN_GAME')} />
      )}
      {gamePhase === 'SIMULATION_RESULT' && simulationResult && (
          <GenericModal title="Resultado del Nodo" onClose={handleSimulationComplete}>
            <p className="text-lg text-gray-300">{simulationResult.log}</p>
          </GenericModal>
      )}
       {gamePhase === 'LEVEL_UP' && pendingLevelUps > 0 && (
          <LevelUpModal newLevel={playerState.level - pendingLevelUps + 1} onSelectReward={handleLevelUpReward} />
      )}
       {gamePhase === 'GAME_OVER' && (
          <GenericModal title="Fin de la Partida" onClose={() => setGamePhase('START_SCREEN')}>
            <p className="text-lg text-red-400">Tu nave ha sido destruida o te has quedado sin opciones. Tu viaje termina aquí.</p>
          </GenericModal>
       )}
    </div>
  );
}

export default App;