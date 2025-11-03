// contexts/GameContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  PlayerState,
  MapData,
  CombatState,
  EventCardData,
  EventConsequenceResult,
  ShopInventory,
  SimulationResult,
  EventOption,
  ShopCard,
  ShopServiceType,
} from '../types';
import { saveGame, loadGame, deleteSave } from '../services/saveManager';

type GamePhase =
  | 'START_SCREEN'
  | 'HANGAR'
  | 'IN_GAME'
  | 'NODE_ACTION_PENDING'
  | 'PRE_COMBAT'
  | 'COMBAT'
  | 'EVENT'
  | 'SHOP'
  | 'CARD_REWARD'
  | 'LEVEL_UP'
  | 'SIMULATION_RESULT'
  | 'GAME_OVER';

interface GameState {
  // Phase
  gamePhase: GamePhase;
  contentLoaded: boolean;

  // Core State
  playerState: PlayerState | null;
  mapData: MapData | null;
  currentNodeId: number | null;
  logs: string[];
  isTraveling: boolean;

  // Modal/Screen States
  activeEvent: EventCardData | null;
  eventResult: EventConsequenceResult | null;
  activeCombat: CombatState | null;
  preCombatEnemyId: string | null;
  cardRewards: string[];
  rewardTitle: string;
  shopInventory: ShopInventory | null;
  simulationResult: SimulationResult | null;
  pendingLevelUps: number;
}

interface GameActions {
  // Phase transitions
  setGamePhase: (phase: GamePhase) => void;
  setContentLoaded: (loaded: boolean) => void;

  // Core actions
  setPlayerState: (state: PlayerState | null) => void;
  setMapData: (data: MapData | null) => void;
  setCurrentNodeId: (id: number | null) => void;
  addLog: (message: string) => void;
  setIsTraveling: (traveling: boolean) => void;

  // Modal actions
  setActiveEvent: (event: EventCardData | null) => void;
  setEventResult: (result: EventConsequenceResult | null) => void;
  setActiveCombat: (combat: CombatState | null) => void;
  setPreCombatEnemyId: (id: string | null) => void;
  setCardRewards: (rewards: string[]) => void;
  setRewardTitle: (title: string) => void;
  setShopInventory: (inventory: ShopInventory | null) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  setPendingLevelUps: (count: number) => void;

  // Save/Load
  saveCurrentGame: () => boolean;
  loadSavedGame: () => boolean;
  deleteSavedGame: () => void;
}

interface GameContextValue extends GameState, GameActions {}

const GameContext = createContext<GameContextValue | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // State
  const [gamePhase, setGamePhase] = useState<GamePhase>('START_SCREEN');
  const [contentLoaded, setContentLoaded] = useState(false);

  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>(['Bitácora de viaje iniciada.']);
  const [isTraveling, setIsTraveling] = useState(false);

  const [activeEvent, setActiveEvent] = useState<EventCardData | null>(null);
  const [eventResult, setEventResult] = useState<EventConsequenceResult | null>(null);
  const [activeCombat, setActiveCombat] = useState<CombatState | null>(null);
  const [preCombatEnemyId, setPreCombatEnemyId] = useState<string | null>(null);
  const [cardRewards, setCardRewards] = useState<string[]>([]);
  const [rewardTitle, setRewardTitle] = useState('Elige tu Recompensa');
  const [shopInventory, setShopInventory] = useState<ShopInventory | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [pendingLevelUps, setPendingLevelUps] = useState(0);

  // Actions
  const addLog = useCallback((message: string) => {
    setLogs((prev) => [...prev.slice(-50), message]);
  }, []);

  const saveCurrentGame = useCallback((): boolean => {
    if (!playerState || !mapData || currentNodeId === null) {
      console.warn('[GameContext] No se puede guardar: estado incompleto');
      return false;
    }
    return saveGame(playerState, mapData, currentNodeId, logs);
  }, [playerState, mapData, currentNodeId, logs]);

  const loadSavedGame = useCallback((): boolean => {
    const save = loadGame();
    if (!save) return false;

    setPlayerState(save.playerState);
    setMapData(save.mapData);
    setCurrentNodeId(save.currentNodeId);
    setLogs(save.logs);
    setGamePhase('IN_GAME');
    addLog('Partida cargada exitosamente.');
    return true;
  }, [addLog]);

  const deleteSavedGame = useCallback(() => {
    deleteSave();
  }, []);

  // Auto-save en cambios importantes
  useEffect(() => {
    if (
      playerState &&
      mapData &&
      currentNodeId !== null &&
      gamePhase === 'IN_GAME'
    ) {
      // Debounce: guardar 2s después del último cambio
      const timer = setTimeout(() => {
        saveCurrentGame();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [playerState, mapData, currentNodeId, gamePhase, saveCurrentGame]);

  const value: GameContextValue = {
    // State
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

    // Actions
    setGamePhase,
    setContentLoaded,
    setPlayerState,
    setMapData,
    setCurrentNodeId,
    addLog,
    setIsTraveling,
    setActiveEvent,
    setEventResult,
    setActiveCombat,
    setPreCombatEnemyId,
    setCardRewards,
    setRewardTitle,
    setShopInventory,
    setSimulationResult,
    setPendingLevelUps,
    saveCurrentGame,
    loadSavedGame,
    deleteSavedGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
