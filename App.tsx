import { preloadPlanetImages } from './services/imageRegistry';

import React, { useEffect } from 'react';

// Context & Hooks
import { useGame } from './contexts/GameContext';
import { useGameHandlers } from './hooks/useGameHandlers';

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
import { NodeAnalysisScreen } from './components/NodeAnalysisScreen';
import { PauseMenu } from './components/PauseMenu';

// Services
import contentLoader from './services/contentLoader';

function App() {
  // Estado global desde Context
  const {
    gamePhase,
    contentLoaded,
    playerState,
    mapData,
    currentNodeId,
    logs,
    isTraveling,
    activeEvent,
    eventResult,
    activeCombat,
    preCombatEnemyId,
    cardRewards,
    rewardTitle,
    shopInventory,
    simulationResult,
    pendingLevelUps,
    setContentLoaded,
  } = useGame();

  // Handlers desde custom hook
  const {
    handleShowHangar,
    handleReturnToStartScreen,
    handleStartGame,
    handleNodeSelect,
    handleProbeNode,
    handleEventOptionSelect,
    handleEventComplete,
    handleStartCombat,
    handlePlayCard,
    handleEndTurn,
    handleCombatComplete,
    handleCardRewardSelect,
    handleLevelUpReward,
    handleBuyCard,
    handlePerformService,
    handleSimulationComplete,
    handleExitNode,
    handleEscapeCombat,
  } = useGameHandlers();
  
  const { setGamePhase } = useGame();
  
  const [isPauseOpen, setIsPauseOpen] = React.useState(false);
  
  // Cargar contenido al inicio
  useEffect(() => {
    const loadGameContent = async () => {
      try {
        console.log('[App] Iniciando carga de contenido...');
        await contentLoader.loadContent();
        console.log('[App] Contenido cargado exitosamente');
        setContentLoaded(true);
        preloadPlanetImages(); // Preload planet images after content is loaded
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
  const canTravel = (nodeId: number) => 
    gamePhase === 'IN_GAME' && 
    availableNodeIds.has(nodeId) && 
    playerState.fuel > 0;

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-4 grid-rows-[auto_1fr] md:grid-rows-1 gap-4 p-4 bg-transparent overflow-hidden">
      <main className="md:col-span-3 h-full min-h-0 relative">
        <GalacticMap 
            nodes={mapData.nodes} 
            currentNodeId={currentNodeId} 
            onNodeSelect={(nodeId) => canTravel(nodeId) && handleNodeSelect(nodeId)}
            playerState={playerState}
        />
        {/* Efecto de viaje desactivado para mejor visibilidad */}
        {false && isTraveling && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-2xl font-orbitron">
                VIAJANDO...
            </div>
        )}
      </main>

      <aside className="md:col-span-1 h-full min-h-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PlayerStatus state={playerState} />
          <button
            onClick={() => setIsPauseOpen(true)}
            className="ml-2 px-3 py-1 bg-gray-800 border border-cyan-500/30 rounded text-cyan-300 hover:bg-gray-700"
            title="Pausa"
          >
            ⏸️
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <TravelLog logs={logs} />
          </div>
          <div className="flex-1 min-h-0">
            <NodeViewer node={currentNode} onEventTrigger={handleProbeNode} />
          </div>
        </div>
      </aside>

      {gamePhase === 'NODE_ACTION_PENDING' && (
        <NodeAnalysisScreen 
          node={currentNode} 
          onEventTrigger={handleProbeNode} 
          onExitNode={handleExitNode}
        />
      )}
      {gamePhase === 'EVENT' && activeEvent && (
        <div className="fixed inset-0 z-20 bg-black/70 flex items-center justify-center p-4">
          <EventCard card={activeEvent} playerState={playerState} onOptionSelect={handleEventOptionSelect} eventResult={eventResult} onComplete={handleEventComplete} />
        </div>
      )}
      {gamePhase === 'PRE_COMBAT' && preCombatEnemyId && (
        <PreCombatModal enemyId={preCombatEnemyId} onConfirm={handleStartCombat} />
      )}
      {gamePhase === 'COMBAT' && activeCombat && (
        <CombatInterface combatState={activeCombat} onPlayCard={handlePlayCard} onEndTurn={handleEndTurn} onCombatComplete={handleCombatComplete} onEscape={handleEscapeCombat} currentNodeId={currentNodeId} />
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

      {isPauseOpen && <PauseMenu onClose={() => setIsPauseOpen(false)} />}
    </div>
  );
}

export default App;