// hooks/useGameHandlers.ts
import { useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { ShipData, EventOption, CombatState, ShopCard, ShopServiceType, CardInstance } from '../types';
import { BASE_PLAYER_STATE, LEVEL_THRESHOLDS } from '../constants';
import { generateMap } from '../services/mapGenerator';
import { resolveNode, resetEventCardStates } from '../services/eventManager';
import * as combatEngine from '../services/combatEngine';
import { generateShopInventory } from '../services/shopManager';
import { ALL_CARDS } from '../data/cards';

const createCardInstance = (cardId: string): CardInstance => ({
  instanceId: `${cardId}_${Date.now()}_${Math.random()}`,
  cardId,
});

export const useGameHandlers = () => {
  const {
    playerState,
    mapData,
    activeCombat,
    preCombatEnemyId,
    pendingLevelUps,
    setGamePhase,
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
  } = useGame();

  const handleShowHangar = useCallback(() => {
    setGamePhase('HANGAR');
  }, [setGamePhase]);

  const handleReturnToStartScreen = useCallback(() => {
    setGamePhase('START_SCREEN');
  }, [setGamePhase]);

  const handleStartGame = useCallback(
    (ship: ShipData) => {
      resetEventCardStates();

      const initialDeck = ship.initialDeck.map(createCardInstance);
      const newPlayerState = {
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
      addLog(`Has despegado con "${ship.name}". ¡Que la suerte te acompañe!`);

      const hangarScreen = document.getElementById('hangar-screen');
      if (hangarScreen) {
        hangarScreen.classList.add('hyperspace-jump-active');
        setTimeout(() => {
          setGamePhase('IN_GAME');
        }, 1000);
      } else {
        setGamePhase('IN_GAME');
      }
    },
    [setPlayerState, setMapData, setCurrentNodeId, addLog, setGamePhase]
  );

  const handleNodeSelect = useCallback(
    (nodeId: number) => {
      if (!playerState || !mapData) return;

      document.body.classList.add('is-traveling');
      setIsTraveling(true);

      setTimeout(() => {
        document.body.classList.remove('is-traveling');
        setIsTraveling(false);

        const newPlayerState = { ...playerState, fuel: playerState.fuel - 1 };
        const newNodes = mapData.nodes.map((n) => (n.id === nodeId ? { ...n, visited: true } : n));
        setMapData({ ...mapData, nodes: newNodes });
        setCurrentNodeId(nodeId);

        const selectedNode = mapData.nodes.find((n) => n.id === nodeId)!;
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
    },
    [
      playerState,
      mapData,
      setIsTraveling,
      setMapData,
      setCurrentNodeId,
      addLog,
      setActiveEvent,
      setGamePhase,
      setPreCombatEnemyId,
      setShopInventory,
      setSimulationResult,
      setPlayerState,
    ]
  );

  const handleGainXp = useCallback(
    (xp: number) => {
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

      setPlayerState({ ...playerState, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext });
      if (levelUps > 0) {
        setPendingLevelUps(pendingLevelUps + levelUps);
      }
    },
    [playerState, addLog, setPlayerState, setPendingLevelUps, pendingLevelUps]
  );

  const handleEventOptionSelect = useCallback(
    (option: EventOption) => {
      if (!playerState) return;
      const result = option.consequence(playerState);
      setEventResult(result);
      setPlayerState(result.newState);
      if (result.reactionText) addLog(`💬 ${result.reactionText}`);
      addLog(result.log);
      if (result.xpGained) handleGainXp(result.xpGained);
      if (result.achievementId) addLog(`🏆 Logro Desbloqueado: ${result.achievementId}`);
    },
    [playerState, setEventResult, setPlayerState, addLog, handleGainXp]
  );

  const handleEventComplete = useCallback(() => {
    setActiveEvent(null);
    setEventResult(null);
    if (pendingLevelUps > 0) {
      setGamePhase('LEVEL_UP');
    } else {
      setGamePhase('IN_GAME');
    }
  }, [pendingLevelUps, setActiveEvent, setEventResult, setGamePhase]);

  const handleStartCombat = useCallback(() => {
    if (!playerState || !preCombatEnemyId) return;
    const newCombat = combatEngine.createCombat(playerState, preCombatEnemyId, Date.now());
    setActiveCombat(newCombat);
    setGamePhase('COMBAT');
    setPreCombatEnemyId(null);
  }, [playerState, preCombatEnemyId, setActiveCombat, setGamePhase, setPreCombatEnemyId]);

  const handlePlayCard = useCallback(
    (cardInstanceId: string) => {
      if (!activeCombat) return;
      const enemy = activeCombat.combatants.find((c) => !c.isPlayer);
      if (!enemy) return;
      setActiveCombat(combatEngine.playCard(activeCombat, cardInstanceId, enemy.id));
    },
    [activeCombat, setActiveCombat]
  );

  const handleEndTurn = useCallback(() => {
    if (!activeCombat) return;
    setActiveCombat(combatEngine.resolveTurn(activeCombat));
  }, [activeCombat, setActiveCombat]);

  const handleCombatComplete = useCallback(
    (finalState: CombatState) => {
      if (!playerState) return;

      const playerCombatant = finalState.combatants.find((c) => c.isPlayer)!;
      const enemyCombatant = finalState.combatants.find((c) => !c.isPlayer)!;
      let newState = { ...playerState, hull: playerCombatant.hp, shields: playerCombatant.shield };

      if (finalState.victory) {
        const creditsGained = enemyCombatant.reward?.credits || 0;
        const xpGained = enemyCombatant.reward?.xpReward || 0;

        newState.credits += creditsGained;
        addLog(`Recuperas ${creditsGained} créditos de los restos.`);

        setPlayerState(newState);
        if (xpGained > 0) handleGainXp(xpGained);

        const rewards = Object.values(ALL_CARDS).filter(
          (c) => (c.rarity === 'Uncommon' || c.rarity === 'Common') && c.price > 0
        );
        const shuffled = [...rewards].sort(() => 0.5 - Math.random());
        setCardRewards(shuffled.slice(0, 3).map((c) => c.id));
        setRewardTitle('Recompensa de Combate');
        setGamePhase('CARD_REWARD');
      } else {
        setPlayerState(newState);
        addLog('Tu aventura ha terminado.');
        setGamePhase('GAME_OVER');
      }
      setActiveCombat(null);
    },
    [playerState, addLog, setPlayerState, handleGainXp, setCardRewards, setRewardTitle, setGamePhase, setActiveCombat]
  );

  const handleCardRewardSelect = useCallback(
    (cardId: string) => {
      if (!playerState) return;

      const newCardInstance = createCardInstance(cardId);
      setPlayerState({ ...playerState, deck: [...playerState.deck, newCardInstance] });
      addLog(`"${ALL_CARDS[cardId].name}" añadido a tu mazo.`);
      setCardRewards([]);

      if (pendingLevelUps > 0) {
        setGamePhase('LEVEL_UP');
      } else {
        setGamePhase('IN_GAME');
      }
    },
    [playerState, setPlayerState, addLog, setCardRewards, pendingLevelUps, setGamePhase]
  );

  const handleLevelUpReward = useCallback(
    (rewardType: 'HULL' | 'ENERGY' | 'CARD') => {
      if (!playerState) return;

      switch (rewardType) {
        case 'HULL':
          addLog('Casco máximo aumentado en 5.');
          setPlayerState({ ...playerState, maxHull: playerState.maxHull + 5, hull: playerState.hull + 5 });
          break;
        case 'ENERGY':
          addLog('Energía máxima en combate aumentada en 1. (Efecto futuro)');
          break;
        case 'CARD':
          const rareRewards = Object.values(ALL_CARDS).filter((c) => c.rarity === 'Rare');
          const shuffled = [...rareRewards].sort(() => 0.5 - Math.random());
          setCardRewards(shuffled.slice(0, 3).map((c) => c.id));
          setRewardTitle('Mejora de Nivel: Elige una Carta Rara');
          setGamePhase('CARD_REWARD');
          setPendingLevelUps(pendingLevelUps - 1);
          return;
      }

      setPendingLevelUps(pendingLevelUps - 1);
      if (pendingLevelUps <= 1) {
        setGamePhase('IN_GAME');
      }
    },
    [playerState, addLog, setPlayerState, setCardRewards, setRewardTitle, setGamePhase, setPendingLevelUps, pendingLevelUps]
  );

  const handleBuyCard = useCallback(
    (card: ShopCard) => {
      if (!playerState || playerState.credits < card.price) return;
      const newCard = createCardInstance(card.cardId);
      setPlayerState({ ...playerState, credits: playerState.credits - card.price, deck: [...playerState.deck, newCard] });
      addLog(`Has comprado "${ALL_CARDS[card.cardId].name}".`);
    },
    [playerState, setPlayerState, addLog]
  );

  const handlePerformService = useCallback(
    (serviceType: ShopServiceType, cardInstanceId?: string) => {
      if (!playerState) return;
      // Implementar lógica de servicios (por ahora solo remove_card)
      if (serviceType === 'remove_card' && cardInstanceId) {
        setPlayerState({
          ...playerState,
          deck: playerState.deck.filter((c) => c.instanceId !== cardInstanceId),
        });
        addLog('Has eliminado una carta de tu mazo.');
      }
    },
    [playerState, setPlayerState, addLog]
  );

  const handleSimulationComplete = useCallback(() => {
    setSimulationResult(null);
    if (pendingLevelUps > 0) {
      setGamePhase('LEVEL_UP');
    } else {
      setGamePhase('IN_GAME');
    }
  }, [pendingLevelUps, setSimulationResult, setGamePhase]);

  return {
    handleShowHangar,
    handleReturnToStartScreen,
    handleStartGame,
    handleNodeSelect,
    handleGainXp,
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
  };
};
