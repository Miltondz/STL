import React, { useRef, useEffect, useState } from 'react';
import { Node as NodeTypeData, NodeType, PlayerState } from '../types';
import { NodeIcon } from './Icons';
import { NODE_COLORS } from '../constants';
import { getAllShips } from '../data';

interface GalacticMapProps {
  nodes: NodeTypeData[];
  currentNodeId: number;
  onNodeSelect: (nodeId: number) => void;
  playerState?: PlayerState;
}

import { getPlanetImageForNode, showPlanetAssignments } from '../services/imageRegistry';

// Generate a deterministic seed for planet based on node ID
const getNodePlanetSeed = (nodeId: number): number => {
  const seed = ((nodeId * 7919) ^ 0x12345678) & 0x7fffffff;
  return Math.abs(seed);
};

const pseudoRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Obtener la imagen del token según el tipo de nave del jugador
const getPlayerTokenImage = (playerState?: PlayerState): string => {
  if (!playerState) return 'https://i.ibb.co/Vcmby2F6/mini-ship01.png'; // Default fallback
  
  // Intentar obtener tokenImage desde los datos de la nave
  const allShips = getAllShips();
  const currentShip = allShips.find(ship => ship.name === playerState.name);
  
  if (currentShip?.tokenImage) {
    return currentShip.tokenImage;
  }
  
  // Fallback al sistema anterior si no se encuentra en JSON
  const shipName = playerState.name.toLowerCase();
  
  if (shipName.includes('puño') || shipName.includes('hierro') || shipName.includes('iron') || shipName.includes('fist')) {
    return 'https://i.ibb.co/C5X8Djst/mini-ship00.png'; // Puño de Hierro
  } else if (shipName.includes('espectro') || shipName.includes('silencioso') || shipName.includes('ghost') || shipName.includes('silent')) {
    return 'https://i.ibb.co/qXZ0bRy/mini-ship02.png'; // Espectro Silencioso
  } else {
    return 'https://i.ibb.co/Vcmby2F6/mini-ship01.png'; // Mercader Errante (default)
  }
};

// Array de imágenes de estaciones espaciales (solo las 5 correctas)
const SHOP_STATION_IMAGES = [
  'https://i.ibb.co/whY2rS9B/mini-estacion01.png',
  'https://i.ibb.co/hJfy0KsQ/mini-estacion02.png',
  'https://i.ibb.co/7N2gwfgf/mini-estacion03.png',
  'https://i.ibb.co/1GfZvg9m/mini-estacion04.png',
  'https://i.ibb.co/n8Z6MrWR/mini-estacion05.png'
];

// Cache para evitar repeticiones en las primeras asignaciones
let usedStationImages = new Set<string>();
let stationImageAssignments = new Map<number, string>();

// Función para resetear las asignaciones de estaciones (útil para nuevos mapas)
export const resetStationImageAssignments = (): void => {
  usedStationImages.clear();
  stationImageAssignments.clear();
};

// Obtener imagen para nodos de tienda con variedad y sin repeticiones iniciales
const getShopTokenImage = (nodeId: number): string => {
  // Si ya tenemos una imagen asignada para este nodo, la devolvemos
  if (stationImageAssignments.has(nodeId)) {
    return stationImageAssignments.get(nodeId)!;
  }

  // Obtener imágenes disponibles (no usadas aún)
  const availableImages = SHOP_STATION_IMAGES.filter(img => !usedStationImages.has(img));
  
  let selectedImage: string;
  
  if (availableImages.length > 0) {
    // Seleccionar de las no usadas
    selectedImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    usedStationImages.add(selectedImage);
  } else {
    // Si ya usamos todas, resetear y seleccionar cualquiera
    if (usedStationImages.size >= SHOP_STATION_IMAGES.length) {
      usedStationImages.clear();
    }
    selectedImage = SHOP_STATION_IMAGES[Math.floor(Math.random() * SHOP_STATION_IMAGES.length)];
    usedStationImages.add(selectedImage);
  }
  
  // Guardar la asignación para este nodo
  stationImageAssignments.set(nodeId, selectedImage);
  return selectedImage;
};

// SVG circle (clickable area) for node; planet image rendered inside
const MapNode: React.FC<{ node: NodeTypeData; allNodes: NodeTypeData[]; isCurrent: boolean; isAvailable: boolean; onSelect: () => void }> = ({ node, allNodes, isCurrent, isAvailable, onSelect }) => {
  const scale = isCurrent ? 1.3 : 1.0;
  const opacity = node.visited && !isCurrent ? 0.7 : 1;
  const cursor = isAvailable ? 'pointer' : 'default';

  // Deterministic variations based on node ID
  const randomVal = pseudoRandom(node.id);
  const imageScale = 0.9 + (randomVal * 0.3); // Varies from 0.9 to 1.2
  const imageRotation = randomVal * 360;
  const animDuration = 8 + randomVal * 4; // 8s to 12s
  const animDelay = randomVal * -5; // -5s to 0s

  const imageUrl = getPlanetImageForNode(node.id, allNodes);

  return (
    <g
      transform={`translate(${node.x}, ${node.y}) scale(${scale})`}
      style={{ cursor, opacity, transition: 'transform 0.2s, opacity 0.3s' }}
      onClick={isAvailable ? onSelect : undefined}
    >
      <defs>
        <filter id={`atmosphere-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="2" result="turbulence">
            <animate 
              attributeName="baseFrequency"
              dur={`${10 + randomVal * 10}s`}
              values="0.1;0.12;0.1"
              repeatCount="indefinite" 
              begin={`${animDelay}s`}
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="1.5" />
        </filter>
      </defs>

      <circle r="4" fill="rgba(0,0,0,0)" />

      {/* Planet Image with variations OR Shop Station */}
      <g>
        {node.type === NodeType.SHOP ? (
          /* Estación Espacial para nodos de tienda */
          <g>
            {/* Imagen de la estación 2.5x más grande y 100% opaca */}
            <image 
              href={getShopTokenImage(node.id)}
              x="-4.375" y="-4.375"
              height="8.75" width="8.75"
              transform={`scale(${imageScale})`}
              style={{ 
                  pointerEvents: 'none',
                  filter: `drop-shadow(0 0 4px #67e8f9) drop-shadow(0 0 8px #0891b2)`,
                  animation: `glow ${animDuration * 2}s ease-in-out infinite`,
                  animationDelay: `${animDelay + 2}s`,
                  opacity: 1
              }}
            />
          </g>
        ) : (
          /* Planet Image para otros nodos */
          <image 
            href={imageUrl}
            x="-1.75" y="-1.75"
            height="3.5" width="3.5"
            transform={`scale(${imageScale}) rotate(${imageRotation} 0 0)`}
            style={{ 
                pointerEvents: 'none',
                filter: `url(#atmosphere-${node.id})`,
                animation: `glow ${animDuration * 2}s ease-in-out infinite`,
                animationDelay: `${animDelay + 2}s`
            }}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0.4 -0.5; 0 -0.8; -0.4 -0.5; 0 0"
              dur={`${animDuration}s`}
              begin={`${animDelay}s`}
              repeatCount="indefinite"
              additive="sum"
            />
          </image>
        )}

        {/* Cloud/Atmosphere Overlay OR Station Energy Field */}
        {node.type === NodeType.SHOP ? (
          /* Campo de energía para estaciones */
          <circle cx="0" cy="0" r="2.2" fill="none" stroke="rgba(103,232,249,0.3)" strokeWidth="0.08">
            <animate attributeName="r" values="2.2;2.5;2.2" dur={`${animDuration * 1.2}s`} repeatCount="indefinite" begin={`${animDelay}s`} />
            <animate attributeName="stroke-width" values="0.08;0.15;0.08" dur={`${animDuration * 1.2}s`} repeatCount="indefinite" begin={`${animDelay}s`} />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${animDuration}s`} repeatCount="indefinite" begin={`${animDelay}s`} />
          </circle>
        ) : (
          /* Atmósfera para planetas */
          <circle cx="0" cy="0" r="1.75" fill="none" stroke="rgba(200,220,255,0.15)" strokeWidth="0.05">
            <animate attributeName="r" values="1.75;1.85;1.75" dur={`${animDuration * 1.5}s`} repeatCount="indefinite" begin={`${animDelay}s`} />
            <animate attributeName="stroke-width" values="0.05;0.12;0.05" dur={`${animDuration * 1.5}s`} repeatCount="indefinite" begin={`${animDelay}s`} />
          </circle>
        )}

        {/* Specular Highlight */}
        <ellipse cx="-0.8" cy="-0.8" rx="0.4" ry="0.5" fill="rgba(255,255,255,0.3)" opacity="0.6">
          <animate attributeName="cx" values="-0.8;0.8;-0.8" dur={`${animDuration * 2}s`} repeatCount="indefinite" begin={`${animDelay}s`} />
          <animate attributeName="cy" values="-0.8;0.8;-0.8" dur={`${animDuration * 2}s`} repeatCount="indefinite" begin={`${animDelay}s`} />
        </ellipse>

        {/* Optional Ring Effect */}
        {randomVal > 0.6 && (
          <circle cx="0" cy="0" r="2.2" fill="none" stroke="rgba(150,180,220,0.2)" strokeWidth="0.08">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur={`${animDuration * 3}s`}
              repeatCount="indefinite"
              begin={`${animDelay}s`}
            />
          </circle>
        )}
      </g>

      {/* Selection Ring for current node */}
      {isCurrent && (
        <circle 
          r="4" 
          fill="none" 
          stroke="#67e8f9" 
          strokeWidth="0.15"
          className="animate-pulse"
          style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 4px #67e8f9)' }}
        />
      )}

      {/* Availability Indicator */}
      {isAvailable && !isCurrent && (
        <circle 
          r="3.5" 
          fill="none" 
          stroke="#67e8f9"
          strokeWidth="0.1"
          strokeDasharray="0.5 0.5"
          style={{ pointerEvents: 'none', opacity: 0.7 }}
        />
      )}

      {/* Visited Indicator */}
      {node.visited && !isCurrent && (
        <circle r="0.5" cx="2.5" cy="-2.5" fill="#34d399" stroke="#1f2937" strokeWidth="0.1" style={{ pointerEvents: 'none' }} />
      )}
    </g>
  );
};

// Token de la nave del jugador con animación de movimiento
const PlayerShipToken: React.FC<{ 
  x: number; 
  y: number; 
  isMoving?: boolean; 
  playerState?: PlayerState;
  currentNode?: NodeTypeData;
}> = ({ x, y, isMoving, playerState, currentNode }) => {
  const [imageError, setImageError] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);
  
  // Animación orbital suave sin tartamudeo
  useEffect(() => {
    if (!isMoving) {
      const interval = setInterval(() => {
        setOrbitAngle(prev => prev + 0.02);
      }, 16); // ~60fps
      return () => clearInterval(interval);
    }
  }, [isMoving]);
  
  // Calcular posición orbital (desplazado del centro del nodo)
  const orbitRadius = 3.5; // Distancia del centro del nodo
  const orbitX = x + Math.cos(orbitAngle) * orbitRadius;
  const orbitY = y + Math.sin(orbitAngle) * orbitRadius;
  
  const tokenStyle: React.CSSProperties = isMoving ? {
    animation: 'none'
  } : {};

  const handleImageError = () => {
    setImageError(true);
  };

  // El token del jugador siempre debe mostrar la nave del jugador
  const tokenImage = getPlayerTokenImage(playerState);

  return (
    <g transform={`translate(${orbitX}, ${orbitY})`} style={tokenStyle}>
      {!imageError ? (
        /* Token con imagen específica */
        <g transform="scale(5.0)"> {/* Mucho más grande para ser visible */}
          {/* Imagen del token con borde luminoso */}
          <image
            href={tokenImage}
            x="-0.6"
            y="-0.6"
            width="1.2"
            height="1.2"
            onError={handleImageError}
            className={isMoving ? "" : "animate-pulse"}
            style={{
              filter: 'drop-shadow(0 0 0.3px #67e8f9) drop-shadow(0 0 0.6px #0891b2) drop-shadow(0 0 1px #67e8f9)',
              opacity: isMoving ? 0.9 : 1
            }}
          />
          
          {/* Estela de movimiento cuando se está moviendo */}
          {isMoving && (
            <g opacity="0.7">
              <circle cx="-0.2" cy="0.2" r="0.1" fill="#67e8f9" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="-0.4" cy="0.4" r="0.08" fill="#0891b2" opacity="0.6">
                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.7s" repeatCount="indefinite" />
              </circle>
              <circle cx="-0.6" cy="0.6" r="0.06" fill="#67e8f9" opacity="0.4">
                <animate attributeName="opacity" values="0.4;0.05;0.4" dur="0.9s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </g>
      ) : (
        /* Fallback: Nave espacial simple (diseño original) */
        <g transform="scale(2.0)">
          <path 
            d="M 0,-2 L -1,1 L -0.5,0.8 L 0,2 L 0.5,0.8 L 1,1 Z" 
            fill="#67e8f9" 
            stroke="#0891b2" 
            strokeWidth="0.2"
            className={isMoving ? "" : "animate-pulse"}
          />
          {/* Motor brillante */}
          <circle cx="0" cy="1.5" r="0.4" fill="#fbbf24" className={isMoving ? "animate-pulse" : "animate-pulse"} />
        </g>
      )}
    </g>
  );
};


export const GalacticMap: React.FC<GalacticMapProps> = ({ nodes, currentNodeId, onNodeSelect, playerState }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [animatingTo, setAnimatingTo] = useState<{ x: number; y: number } | null>(null);
  
  // Debug: mostrar asignaciones de planetas una vez
  React.useEffect(() => {
    const timer = setTimeout(() => {
      showPlanetAssignments();
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes]);
  const [displayX, setDisplayX] = useState(0);
  const [displayY, setDisplayY] = useState(0);

  useEffect(() => {
    const nodeMap = new Map<number, NodeTypeData>(nodes.map(node => [node.id, node]));
    const currentNode = nodeMap.get(currentNodeId);
    if (currentNode) {
      setDisplayX(currentNode.x);
      setDisplayY(currentNode.y);
    }
  }, [currentNodeId, nodes]);

  useEffect(() => {
    // Animar el movimiento del token de la nave
    if (animatingTo) {
      const startX = displayX;
      const startY = displayY;
      const endX = animatingTo.x;
      const endY = animatingTo.y;
      const duration = 800; // Duración de la animación en ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Interpolación suave (ease-in-out)
        const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        setDisplayX(startX + (endX - startX) * easeProgress);
        setDisplayY(startY + (endY - startY) * easeProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimatingTo(null);
        }
      };

      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }
  }, [animatingTo, displayX, displayY]);

  useEffect(() => {
    // Esta función centra automáticamente el mapa en el nodo actual.
    if (mapContainerRef.current && nodes.length > 0) {
      const nodeMap = new Map<number, NodeTypeData>(nodes.map(node => [node.id, node]));
      const currentNode = nodeMap.get(currentNodeId);
      
      const svgElement = mapContainerRef.current.querySelector('svg');
      if (currentNode && svgElement) {
        const container = mapContainerRef.current;
        const clientHeight = container.clientHeight;
        
        // La altura total del contenido scrollable es la altura del SVG
        const scrollHeight = svgElement.getBoundingClientRect().height;
        const mapHeight = parseFloat(svgElement.getAttribute('viewBox')?.split(' ')[3] || '0');
        const mapYStart = parseFloat(svgElement.getAttribute('viewBox')?.split(' ')[1] || '0');
        
        if (scrollHeight > 0 && mapHeight > 0) {
          // Calcula la posición relativa del nodo actual en el mapa (0 a 1)
          const relativeY = (currentNode.y - mapYStart) / mapHeight;
          
          // Calcula la posición de scroll para centrar el nodo
          const targetScrollTop = (relativeY * scrollHeight) - (clientHeight / 2);
          
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [currentNodeId, nodes]);


  if (nodes.length === 0) {
    return null;
  }

  const handleNodeSelect = (nodeId: number) => {
    const nodeMap = new Map<number, NodeTypeData>(nodes.map(node => [node.id, node]));
    const targetNode = nodeMap.get(nodeId);
    if (targetNode) {
      setAnimatingTo({ x: targetNode.x, y: targetNode.y });
      // Llamar al callback después de que termine la animación
      setTimeout(() => {
        onNodeSelect(nodeId);
      }, 800);
    }
  };

  const nodeMap = new Map<number, NodeTypeData>(nodes.map(node => [node.id, node]));
  const currentNode = nodeMap.get(currentNodeId);
  const availableNodeIds = new Set(currentNode?.connections || []);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const PADDING = 15;

  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
  });
  
  const viewBoxX = minX - PADDING;
  const viewBoxY = minY - PADDING;
  const viewBoxWidth = (maxX - minX) + (PADDING * 2);
  const viewBoxHeight = (maxY - minY) + (PADDING * 2);

  // Get container dimensions for coordinate transformation
  const [containerSize, setContainerSize] = React.useState({ w: 0, h: 0 });

  useEffect(() => {
    if (mapContainerRef.current) {
      const updateSize = () => {
        setContainerSize({
          w: mapContainerRef.current!.clientWidth,
          h: mapContainerRef.current!.clientHeight
        });
      };
      updateSize();
      const ro = new ResizeObserver(updateSize);
      ro.observe(mapContainerRef.current);
      return () => ro.disconnect();
    }
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg overflow-y-auto relative"
      style={{
        backgroundImage: 'url(https://i.ibb.co/d44ywdHY/Chat-GPT-Image-29-oct-2025-12-33-14.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <svg viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`} 
           width="100%"
           style={{ background: 'transparent' }}>
        {nodes.map(node =>
          node.connections.map(connId => {
            const connection = nodeMap.get(connId);
            if (!connection) return null;
            
            // Solo mostrar líneas si:
            // 1. Ambos nodos han sido visitados (línea sólida verde)
            // 2. El nodo actual se conecta con un nodo disponible (línea punteada)
            const isPathVisited = node.visited && connection.visited;
            const isCurrentToAvailable = (node.id === currentNodeId && availableNodeIds.has(connId)) ||
                                       (connection.id === currentNodeId && availableNodeIds.has(node.id));
            
            // No mostrar la línea si no cumple ninguna condición
            if (!isPathVisited && !isCurrentToAvailable) return null;
            
            const strokeColor = isPathVisited ? '#34d399' : '#60a5fa';
            const strokeDasharray = isPathVisited ? 'none' : '0.5,1';
            
            // Calcular puntos con margen (no desde el centro exacto)
            const margin = 2.5; // Margen en píxeles desde el borde del nodo
            const dx = connection.x - node.x;
            const dy = connection.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            const startX = node.x + unitX * margin;
            const startY = node.y + unitY * margin;
            const endX = connection.x - unitX * margin;
            const endY = connection.y - unitY * margin;
            
            return (
              <line
                key={`${node.id}-${connId}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={strokeColor}
                strokeWidth="0.1"
                strokeDasharray={strokeDasharray}
                className="transition-all duration-500"
                style={ isPathVisited ? { filter: 'drop-shadow(0 0 2px #34d399)' } : {}}
              />
            );
          })
        )}
        
        {nodes.map(node => (
          <MapNode
            key={node.id}
            node={node}
            allNodes={nodes}
            isCurrent={node.id === currentNodeId}
            isAvailable={availableNodeIds.has(node.id)}
            onSelect={() => handleNodeSelect(node.id)}
          />
        ))}
        
        {/* Token de la nave del jugador */}
        <PlayerShipToken 
          x={displayX} 
          y={displayY} 
          isMoving={animatingTo !== null} 
          playerState={playerState}
          currentNode={nodes.find(n => n.id === currentNodeId)}
        />
      </svg>
    </div>
  );
};
