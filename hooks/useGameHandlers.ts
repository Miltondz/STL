// hooks/useGameHandlers.ts
import { useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { ShipData, EventOption, CombatState, ShopCard, ShopServiceType, CardInstance, NodeType, CardAffix, Difficulty } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { BASE_PLAYER_STATE, LEVEL_THRESHOLDS } from '../constants';
import { sfx } from '../services/soundManager';
import { generateMap } from '../services/mapGenerator';
import { resolveNode, resetEventCardStates } from '../services/eventManager';
import { resetStationImageAssignments } from '../components/GalacticMap';
import * as combatEngine from '../services/combatEngine';
import { generateShopInventory } from '../services/shopManager';
import { getAllCards } from '../data';
import {
  ALL_RELICS,
  applyRelicsOnCombatVictory,
  computeRelicNodeFuelCost,
  applyRelicsOnShopEntered,
} from '../services/relicEngine';

const createCardInstance = (cardId: string): CardInstance => ({
  instanceId: `${cardId}_${Date.now()}_${Math.random()}`,
  cardId,
});

export const useGameHandlers = () => {
  const {
    playerState,
    mapData,
    currentNodeId,
    activeCombat,
    preCombatEnemyId,
    preCombatIsElite,
    preCombatIsBoss,
    pendingLevelUps,
    relicRewards,
    difficulty,
    setGamePhase,
    setDifficulty,
    setPlayerState,
    setMapData,
    setCurrentNodeId,
    addLog,
    setIsTraveling,
    setActiveEvent,
    setEventResult,
    setActiveCombat,
    setPreCombatEnemyId,
    setPreCombatIsElite,
    setPreCombatIsBoss,
    setCardRewards,
    setRewardTitle,
    setRelicRewards,
    setShopInventory,
    setSimulationResult,
    setPendingLevelUps,
    setIsVictory,
  } = useGame();

  const grantAchievement = useCallback((state: typeof playerState, achievementId: string): typeof playerState => {
    if (!state || state.achievements.includes(achievementId)) return state;
    const def = ACHIEVEMENTS[achievementId];
    addLog(`🏆 Logro: ${def?.name ?? achievementId}`);
    return { ...state, achievements: [...state.achievements, achievementId] };
  }, [addLog]);

  const handleSetDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d);
  }, [setDifficulty]);

  const handleShowHangar = useCallback(() => {
    setGamePhase('HANGAR');
  }, [setGamePhase]);

  const handleReturnToStartScreen = useCallback(() => {
    setGamePhase('START_SCREEN');
  }, [setGamePhase]);

  const handleStartGame = useCallback(
    (ship: ShipData) => {
      resetEventCardStates();
      resetStationImageAssignments();
      setIsVictory(false);

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

  const handleProbeNode = useCallback(() => {
    if (!playerState || !mapData) return;

    const currentNode = mapData.nodes.find(n => n.id === currentNodeId)!;
    addLog(`Explorando el nodo ${currentNode.type}.`);

    const resolution = resolveNode(currentNode.type, playerState);

    if (resolution.card) {
      setActiveEvent(resolution.card);
      setGamePhase('EVENT');
    } else if (resolution.combat) {
      setPreCombatEnemyId(resolution.combat.enemyId);
      setPreCombatIsElite(resolution.combat.isElite || false);
      setPreCombatIsBoss(resolution.combat.isBoss || false);
      setGamePhase('PRE_COMBAT');
      addLog('¡Contacto hostil detectado!');
    } else if (resolution.rest) {
      setGamePhase('REST_SITE');
      addLog('Has llegado a un sitio de descanso.');
    } else if (resolution.shop) {
      let inventory = generateShopInventory();
      const shopRelicResult = applyRelicsOnShopEntered(playerState);
      if (shopRelicResult.freeCardIndex >= 0 && inventory.cards.length > 0) {
        const idx = Math.floor(Math.random() * inventory.cards.length);
        inventory = { ...inventory, cards: inventory.cards.map((c, i) => i === idx ? { ...c, price: 0, isDeal: true } : c) };
        setPlayerState(shopRelicResult.playerState);
        addLog(`🤝 Contacto Contrabandista: una carta es gratis hoy.`);
      }
      setShopInventory(inventory);
      setGamePhase('SHOP');
    } else if (resolution.simulation) {
      setSimulationResult(resolution.simulation);
      setPlayerState(resolution.simulation.newState);
      addLog(resolution.simulation.log);
      setGamePhase('SIMULATION_RESULT');
    }
  }, [playerState, mapData, currentNodeId, addLog, setActiveEvent, setPreCombatEnemyId, setPreCombatIsElite, setPreCombatIsBoss, setGamePhase, setShopInventory, setSimulationResult, setPlayerState]);

  const handleNodeSelect = useCallback(
    (nodeId: number) => {
      if (!playerState || !mapData) return;

      sfx.travel();
      document.body.classList.add('is-traveling');
      setIsTraveling(true);

      setTimeout(() => {
        document.body.classList.remove('is-traveling');
        setIsTraveling(false);

        const selectedNodeForFuel = mapData.nodes.find((n) => n.id === nodeId)!;
        const isFirstInLayer = !mapData.nodes.some(
          n => n.layer === selectedNodeForFuel.layer && n.visited
        );
        const fuelCost = computeRelicNodeFuelCost(playerState, 1, isFirstInLayer);
        if (fuelCost === 0 && isFirstInLayer && (playerState.relics || []).includes('REL_QUANTUM_ENGINE')) {
          addLog(`⚛️ Motor Cuántico: viaje gratis al primer nodo de esta capa.`);
        }
        const newPlayerState = { ...playerState, fuel: playerState.fuel - fuelCost };
        const newNodes = mapData.nodes.map((n) => (n.id === nodeId ? { ...n, visited: true } : n));
        setMapData({ ...mapData, nodes: newNodes });
        setCurrentNodeId(nodeId);

        const selectedNode = mapData.nodes.find((n) => n.id === nodeId)!;
        addLog(`Viajando al nodo ${selectedNode.type}. Combustible restante: ${newPlayerState.fuel}`);

        setPlayerState(newPlayerState);

        const nodeHasAction = [
            NodeType.BATTLE,
            NodeType.MINI_BOSS,
            NodeType.ELITE,
            NodeType.REST,
            NodeType.ENCOUNTER,
            NodeType.HAZARD,
            NodeType.SHOP,
            NodeType.SPECIAL_EVENT,
            NodeType.END
        ].includes(selectedNode.type);

        if (nodeHasAction) {
            // Delay adicional para que el jugador vea la nave llegar al nodo
            setTimeout(() => {
                setGamePhase('NODE_ACTION_PENDING');
            }, 800); // 800ms adicionales después del viaje
        }

      }, 500);
    },
    [playerState, mapData, setIsTraveling, setMapData, setCurrentNodeId, addLog, setGamePhase, setPlayerState]
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
        setPendingLevelUps(prev => prev + levelUps);
      }
    },
    [playerState, addLog, setPlayerState, setPendingLevelUps]
  );

  const handleEventOptionSelect = useCallback(
    (option: EventOption) => {
      if (!playerState) return;
      const result = option.consequence(playerState);
      let newState = result.newState;
      if (result.achievementId) {
        newState = grantAchievement(newState, result.achievementId) ?? newState;
      }
      setEventResult(result);
      setPlayerState(newState);
      if (result.reactionText) addLog(`💬 ${result.reactionText}`);
      addLog(result.log);
      if (result.xpGained) handleGainXp(result.xpGained);
    },
    [playerState, setEventResult, setPlayerState, addLog, handleGainXp, grantAchievement]
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
    try {
      const newCombat = combatEngine.createCombat(playerState, preCombatEnemyId, Date.now(), difficulty);
      setActiveCombat(newCombat);
      setGamePhase('COMBAT');
      setPreCombatEnemyId(null);
    } catch (err) {
      console.error('[Combat] Error al crear combate:', err);
      addLog('Error al iniciar el combate. Regresando al mapa.');
      setPreCombatEnemyId(null);
      setGamePhase('IN_GAME');
    }
  }, [playerState, preCombatEnemyId, setActiveCombat, setGamePhase, setPreCombatEnemyId, addLog]);

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
        const comercianteCredits = playerCombatant.crewBonuses?.comercianteCredits || 0;

        newState.credits += creditsGained + comercianteCredits;
        addLog(`Recuperas ${creditsGained} créditos de los restos.`);
        if (comercianteCredits > 0) addLog(`💰 [Comerciante] Bonus: +${comercianteCredits} créditos.`);

        // REL_PIRATE_FLAG + REL_BULWARK_HEART: bonus on victory
        const relicVictoryResult = applyRelicsOnCombatVictory(newState, finalState.relicState);
        if (relicVictoryResult.playerState !== newState) {
          newState = relicVictoryResult.playerState;
          relicVictoryResult.logs.forEach(l => addLog(l));
        }

        // Achievement triggers
        newState = grantAchievement(newState, 'FIRST_BLOOD') ?? newState;
        const noHullDamageTaken = !finalState.relicState?.REL_BULWARK_HEART?.hullDamageTaken
          && (playerCombatant.hp === playerCombatant.maxHp || !finalState.log.some(l => l.includes('El casco recibe')));
        if (noHullDamageTaken) newState = grantAchievement(newState, 'FLAWLESS') ?? newState;
        if ((newState.relics || []).length >= 5) newState = grantAchievement(newState, 'RELIC_COLLECTOR') ?? newState;
        if (newState.deck.length > 20) newState = grantAchievement(newState, 'DECKMASTER') ?? newState;
        const crewBonuses = playerCombatant.crewBonuses;
        if (crewBonuses) {
          const activeCrewCount = [crewBonuses.artilleroBonus > 0, crewBonuses.pilotoMissChance > 0,
            crewBonuses.ingenieroShield > 0, crewBonuses.medicoHeal > 0, crewBonuses.comandanteEnergy > 0,
            crewBonuses.saboteadorActive, crewBonuses.comercianteCredits > 0, crewBonuses.psiquicoDraw > 0]
            .filter(Boolean).length;
          if (activeCrewCount >= 3) newState = grantAchievement(newState, 'CREW_MASTER') ?? newState;
        }
        const enemyId = enemyCombatant.id;
        if ((enemyId === 'BOSS_PIRATE_DREADNOUGHT' || enemyId === 'BOSS_AI_NEXUS')
          && finalState.log.some(l => l.includes('Reactor'))) {
          newState = grantAchievement(newState, 'REACTOR_BREACH') ?? newState;
        }

        setPlayerState(newState);
        if (xpGained > 0) handleGainXp(xpGained);

        const wasBoss = preCombatIsBoss;
        const wasElite = preCombatIsElite;
        setPreCombatIsElite(false);
        setPreCombatIsBoss(false);

        // Boss fight: skip card/relic rewards, go to sector complete screen
        if (wasBoss) {
          setActiveCombat(null);
          setGamePhase('SECTOR_COMPLETE');
          return;
        }

        // Elite fight: guaranteed relic, no card reward
        if (wasElite) {
          setCardRewards([]);
          const ownedAfterElite = newState.relics || [];
          const unownedAfterElite = Object.keys(ALL_RELICS).filter(id => !ownedAfterElite.includes(id));
          if (unownedAfterElite.length > 0) {
            const shuffledEliteRelics = [...unownedAfterElite].sort(() => 0.5 - Math.random());
            setRelicRewards(shuffledEliteRelics.slice(0, Math.min(3, shuffledEliteRelics.length)));
          } else {
            setRelicRewards([]);
          }
          setActiveCombat(null);
          setGamePhase('RELIC_REWARD');
          return;
        }

        // Regular battle: card reward + optional relic
        const allCardValues = Object.values(getAllCards());
        const rewards = allCardValues.filter(
          (c) => (c.rarity === 'Uncommon' || c.rarity === 'Common') && c.price > 0
        );

        // Bias toward cards matching the deck's dominant type
        const typeCounts = playerState.deck.reduce((acc, inst) => {
          const cd = getAllCards()[inst.cardId];
          if (cd) acc[cd.type] = (acc[cd.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        const weightedPool = rewards.flatMap((c) => (c.type === dominantType ? [c, c, c] : [c]));
        const shuffled = [...weightedPool].sort(() => 0.5 - Math.random());
        const selected: typeof rewards = [];
        const seen = new Set<string>();
        for (const c of shuffled) {
          if (!seen.has(c.id)) { seen.add(c.id); selected.push(c); }
          if (selected.length >= 3) break;
        }
        setCardRewards(selected.map((c) => c.id));
        setRewardTitle('Recompensa de Combate');

        // Offer relic reward if there are unowned relics
        const ownedRelics = newState.relics || [];
        const unownedRelics = Object.keys(ALL_RELICS).filter(id => !ownedRelics.includes(id));
        if (unownedRelics.length > 0) {
          const shuffledRelics = [...unownedRelics].sort(() => 0.5 - Math.random());
          setRelicRewards(shuffledRelics.slice(0, Math.min(3, shuffledRelics.length)));
        } else {
          setRelicRewards([]);
        }

        setGamePhase('CARD_REWARD');
      } else {
        setPlayerState(newState);
        addLog('Tu aventura ha terminado.');
        setGamePhase('GAME_OVER');
      }
      setActiveCombat(null);
    },
    [playerState, addLog, setPlayerState, handleGainXp, setCardRewards, setRewardTitle, setRelicRewards, setGamePhase, setActiveCombat, preCombatIsElite, preCombatIsBoss, setPreCombatIsElite, setPreCombatIsBoss]
  );

  const handleCardRewardSelect = useCallback(
    (cardId: string) => {
      if (!playerState) return;

      const newCardInstance = createCardInstance(cardId);
      setPlayerState({ ...playerState, deck: [...playerState.deck, newCardInstance] });
      addLog(`"${getAllCards()[cardId]?.name ?? cardId}" añadido a tu mazo.`);
      setCardRewards([]);

      if (pendingLevelUps > 0) {
        setGamePhase('LEVEL_UP');
      } else if (relicRewards.length > 0) {
        setGamePhase('RELIC_REWARD');
      } else {
        setGamePhase('IN_GAME');
      }
    },
    [playerState, setPlayerState, addLog, setCardRewards, pendingLevelUps, relicRewards, setGamePhase]
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
          addLog('Energía máxima en combate aumentada en 1.');
          setPlayerState({ ...playerState, bonusEnergy: (playerState.bonusEnergy || 0) + 1 });
          break;
        case 'CARD': {
          const rareRewards = Object.values(getAllCards()).filter((c) => c.rarity === 'Rare');
          const shuffled = [...rareRewards].sort(() => 0.5 - Math.random());
          setCardRewards(shuffled.slice(0, 3).map((c) => c.id));
          setRewardTitle('Mejora de Nivel: Elige una Carta Rara');
          setGamePhase('CARD_REWARD');
          setPendingLevelUps(prev => prev - 1);
          return;
        }
      }

      const nextPending = pendingLevelUps - 1;
      setPendingLevelUps(nextPending);
      if (nextPending <= 0) {
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
      addLog(`Has comprado "${getAllCards()[card.cardId]?.name ?? card.cardId}".`);
    },
    [playerState, setPlayerState, addLog]
  );

  const UPGRADE_AFFIX: CardAffix = {
    name: 'Mejorada',
    description: '+2 efecto, -1 coste',
    costModifier: -1,
    valueModifier: 2,
  };

  const handlePerformService = useCallback(
    (serviceType: ShopServiceType, price: number, cardInstanceId?: string) => {
      if (!playerState) return;
      if (playerState.credits < price) return;

      if (serviceType === 'remove_card' && cardInstanceId) {
        setPlayerState({
          ...playerState,
          credits: playerState.credits - price,
          deck: playerState.deck.filter((c) => c.instanceId !== cardInstanceId),
        });
        addLog('Has eliminado una carta de tu mazo.');
      } else if (serviceType === 'repair_hull') {
        const healAmount = Math.min(20, playerState.maxHull - playerState.hull);
        setPlayerState({
          ...playerState,
          credits: playerState.credits - price,
          hull: playerState.hull + healAmount,
        });
        addLog(`Reparas ${healAmount} puntos de casco.`);
      } else if (serviceType === 'upgrade_card' && cardInstanceId) {
        const newDeck = playerState.deck.map((c) => {
          if (c.instanceId !== cardInstanceId || c.affix) return c;
          const cardData = getAllCards()[c.cardId];
          const upgraded = cardData?.upgradedVersion;
          const affix: CardAffix = upgraded ? {
            name: 'Mejorada',
            description: upgraded.description ?? cardData.description,
            costModifier: upgraded.cost !== undefined ? upgraded.cost - cardData.cost : -1,
            valueModifier: upgraded.value !== undefined ? upgraded.value - (cardData.value || 0) : 2,
          } : UPGRADE_AFFIX;
          return { ...c, affix };
        });
        setPlayerState({ ...playerState, credits: playerState.credits - price, deck: newDeck });
        addLog('Has mejorado una carta de tu mazo.');
      }
    },
    [playerState, setPlayerState, addLog]
  );

  const handleRelicRewardSelect = useCallback(
    (relicId: string | null) => {
      if (relicId && playerState) {
        const newPlayerState = {
          ...playerState,
          relics: [...(playerState.relics || []), relicId],
        };
        setPlayerState(newPlayerState);
        addLog(`Has obtenido la reliquia: ${ALL_RELICS[relicId]?.name ?? relicId}.`);
      }
      setRelicRewards([]);
      if (pendingLevelUps > 0) {
        setGamePhase('LEVEL_UP');
      } else {
        setGamePhase('IN_GAME');
      }
    },
    [playerState, pendingLevelUps, setPlayerState, setRelicRewards, setGamePhase, addLog]
  );

  const handleSimulationComplete = useCallback(() => {
    setSimulationResult(null);
    if (pendingLevelUps > 0) {
      setGamePhase('LEVEL_UP');
    } else {
      setGamePhase('IN_GAME');
    }
  }, [pendingLevelUps, setSimulationResult, setGamePhase]);

  const UPGRADE_AFFIX_REST: CardAffix = {
    name: 'Mejorada',
    description: '+2 efecto, -1 coste',
    costModifier: -1,
    valueModifier: 2,
  };

  const handleRestOption = useCallback(
    (option: 'HEAL' | 'REMOVE_CARD' | 'UPGRADE_CARD', cardInstanceId?: string) => {
      if (!playerState) return;

      if (option === 'HEAL') {
        const healAmount = Math.floor(playerState.maxHull * 0.3);
        const newHull = Math.min(playerState.maxHull, playerState.hull + healAmount);
        const actual = newHull - playerState.hull;
        setPlayerState({ ...playerState, hull: newHull });
        addLog(`Sitio de descanso: reparas ${actual} puntos de casco.`);
      } else if (option === 'REMOVE_CARD' && cardInstanceId) {
        setPlayerState({ ...playerState, deck: playerState.deck.filter(c => c.instanceId !== cardInstanceId) });
        addLog('Sitio de descanso: eliminaste una carta de tu mazo.');
      } else if (option === 'UPGRADE_CARD' && cardInstanceId) {
        const newDeck = playerState.deck.map(c => {
          if (c.instanceId !== cardInstanceId || c.affix) return c;
          const cardData = getAllCards()[c.cardId];
          const upgraded = cardData?.upgradedVersion;
          const affix: CardAffix = upgraded ? {
            name: 'Mejorada',
            description: upgraded.description ?? cardData.description,
            costModifier: upgraded.cost !== undefined ? upgraded.cost - cardData.cost : -1,
            valueModifier: upgraded.value !== undefined ? upgraded.value - (cardData.value || 0) : 2,
          } : UPGRADE_AFFIX_REST;
          return { ...c, affix };
        });
        setPlayerState({ ...playerState, deck: newDeck });
        addLog('Sitio de descanso: mejoraste una carta de tu mazo.');
      }

      if (pendingLevelUps > 0) {
        setGamePhase('LEVEL_UP');
      } else {
        setGamePhase('IN_GAME');
      }
    },
    [playerState, setPlayerState, addLog, pendingLevelUps, setGamePhase]
  );

  const handleSectorComplete = useCallback(() => {
    if (!playerState) return;
    const nextSector = (playerState.sector || 1) + 1;

    const sectorAchievements: Record<number, string> = { 1: 'SECTOR_1_CLEAR', 2: 'SECTOR_2_CLEAR', 3: 'SECTOR_3_CLEAR' };
    const sAch = sectorAchievements[playerState.sector || 1];

    if (nextSector > 3) {
      addLog('¡Has completado todos los sectores! ¡La galaxia está a salvo!');
      let finalState = { ...playerState };
      if (sAch) finalState = grantAchievement(finalState, sAch) ?? finalState;
      setPlayerState(finalState);
      setIsVictory(true);
      setGamePhase('GAME_OVER');
      return;
    }

    resetEventCardStates();
    resetStationImageAssignments();

    const bonusCredits = (playerState.sector || 1) * 20;
    let newPlayerState = {
      ...playerState,
      sector: nextSector,
      credits: playerState.credits + bonusCredits,
    };
    if (sAch) newPlayerState = grantAchievement(newPlayerState, sAch) ?? newPlayerState;
    setPlayerState(newPlayerState);
    const newMap = generateMap();
    setMapData(newMap);
    setCurrentNodeId(newMap.startNodeId);
    addLog(`Entrando al Sector ${nextSector}. Bonus: ${bonusCredits} créditos.`);

    if (pendingLevelUps > 0) {
      setGamePhase('LEVEL_UP');
    } else {
      setGamePhase('IN_GAME');
    }
  }, [playerState, setPlayerState, setMapData, setCurrentNodeId, addLog, pendingLevelUps, setGamePhase, grantAchievement]);

  const handleExitNode = useCallback(() => {
    setGamePhase('IN_GAME');
  }, [setGamePhase]);

  const handleEscapeCombat = useCallback(() => {
    // Solo para pruebas - escapar del combate sin consecuencias
    setActiveCombat(null);
    setGamePhase('IN_GAME');
    addLog('Has escapado del combate (modo de prueba).');
  }, [setActiveCombat, setGamePhase, addLog]);

  const handleShopAccess = useCallback(() => {
    if (!playerState || !mapData) return;

    const currentNode = mapData.nodes.find(n => n.id === currentNodeId);
    if (currentNode?.type === NodeType.SHOP) {
      let inventory = generateShopInventory();
      const shopRelicResult = applyRelicsOnShopEntered(playerState);
      if (shopRelicResult.freeCardIndex >= 0 && inventory.cards.length > 0) {
        const idx = Math.floor(Math.random() * inventory.cards.length);
        inventory = { ...inventory, cards: inventory.cards.map((c, i) => i === idx ? { ...c, price: 0, isDeal: true } : c) };
        setPlayerState(shopRelicResult.playerState);
        addLog(`🤝 Contacto Contrabandista: una carta es gratis hoy.`);
      }
      setShopInventory(inventory);
      setGamePhase('SHOP');
      addLog('Accediendo a la estación comercial...');
    }
  }, [playerState, mapData, currentNodeId, setPlayerState, setShopInventory, setGamePhase, addLog]);

  return {
    handleShowHangar,
    handleReturnToStartScreen,
    handleStartGame,
    handleNodeSelect,
    handleProbeNode,
    handleGainXp,
    handleEventOptionSelect,
    handleEventComplete,
    handleStartCombat,
    handlePlayCard,
    handleEndTurn,
    handleCombatComplete,
    handleCardRewardSelect,
    handleRelicRewardSelect,
    handleLevelUpReward,
    handleBuyCard,
    handlePerformService,
    handleSimulationComplete,
    handleExitNode,
    handleEscapeCombat,
    handleShopAccess,
    handleRestOption,
    handleSectorComplete,
    handleSetDifficulty,
  };
};
