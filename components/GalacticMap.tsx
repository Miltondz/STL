import React, { useRef, useEffect, useState } from 'react';
import { Node as NodeTypeData, NodeType } from '../types';
import { NodeIcon } from './Icons';
import { NODE_COLORS } from '../constants';

interface GalacticMapProps {
  nodes: NodeTypeData[];
  currentNodeId: number;
  onNodeSelect: (nodeId: number) => void;
}

// Mapa de imágenes de planetas por tipo de nodo
const getPlanetImage = (type: NodeType): string => {
  const planetImages: Record<NodeType, string> = {
    [NodeType.START]: 'https://i.ibb.co/GnGZyMy/planet-green.png',
    [NodeType.BATTLE]: 'https://i.ibb.co/vPGZfqX/planet-red.png',
    [NodeType.ENCOUNTER]: 'https://i.ibb.co/YyLpHW4/planet-yellow.png',
    [NodeType.SHOP]: 'https://i.ibb.co/qNXc7Yy/planet-blue.png',
    [NodeType.HAZARD]: 'https://i.ibb.co/xfRLB5F/planet-orange.png',
    [NodeType.MINI_BOSS]: 'https://i.ibb.co/JsXPnKX/planet-purple.png',
    [NodeType.SPECIAL_EVENT]: 'https://i.ibb.co/7GqZCyy/planet-cyan.png',
    [NodeType.END]: 'https://i.ibb.co/hBn3Lbv/planet-white.png',
  };
  return planetImages[type] || 'https://i.ibb.co/YyLpHW4/planet-yellow.png';
};

const MapNode: React.FC<{ node: NodeTypeData; isCurrent: boolean; isAvailable: boolean; onSelect: () => void }> = ({ node, isCurrent, isAvailable, onSelect }) => {
  const scale = isCurrent ? 'scale(1.2)' : 'scale(1.0)';
  const opacity = node.visited && !isCurrent ? 0.6 : 1;
  const cursor = isAvailable ? 'cursor-pointer' : 'cursor-default';
  
  const nodeClasses = [
    'transition-transform duration-300 ease-in-out',
    cursor,
    isAvailable && !isCurrent ? 'node-available' : ''
  ].join(' ');
  
  const groupStyle: React.CSSProperties = {
    opacity,
    filter: isCurrent ? 'drop-shadow(0 0 4px #67e8f9) drop-shadow(0 0 8px #67e8f9)' : isAvailable ? 'drop-shadow(0 0 2px #67e8f9)' : 'none'
  };

  const planetImage = getPlanetImage(node.type);

  return (
    <g
      transform={`translate(${node.x}, ${node.y}) ${scale}`}
      className={nodeClasses}
      style={{ ...groupStyle, cursor: isAvailable ? 'pointer' : 'default' }}
    >
      {/* Área de clic invisible (más grande que el planeta) */}
      <circle 
        r="3" 
        fill="transparent" 
        onClick={isAvailable ? onSelect : undefined}
        style={{ cursor: isAvailable ? 'pointer' : 'default' }}
      />
      
      {/* Anillo de selección para nodo actual */}
      {isCurrent && (
        <circle 
          r="4" 
          fill="none" 
          stroke="#67e8f9" 
          strokeWidth="0.3" 
          className="animate-pulse"
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* Imagen del planeta */}
      <image 
        href={planetImage}
        x="-2.5" 
        y="-2.5" 
        width="5" 
        height="5"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Indicador de visitado */}
      {node.visited && !isCurrent && (
        <circle r="0.5" cx="1.5" cy="-1.5" fill="#34d399" stroke="#1f2937" strokeWidth="0.2" style={{ pointerEvents: 'none' }} />
      )}
    </g>
  );
};

// Token de la nave del jugador con animación de movimiento
const PlayerShipToken: React.FC<{ x: number; y: number; isMoving?: boolean }> = ({ x, y, isMoving }) => {
  const tokenStyle: React.CSSProperties = isMoving ? {
    animation: 'none'
  } : {};

  return (
    <g transform={`translate(${x}, ${y})`} style={tokenStyle}>
      {/* Nave espacial simple */}
      <g transform="scale(0.8)">
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
    </g>
  );
};

export const GalacticMap: React.FC<GalacticMapProps> = ({ nodes, currentNodeId, onNodeSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [animatingTo, setAnimatingTo] = useState<{ x: number; y: number } | null>(null);
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

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg overflow-y-auto"
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
            const isPathVisited = node.visited && connection.visited;
            const strokeColor = isPathVisited ? '#34d399' : '#6b7280';
            return (
              <line
                key={`${node.id}-${connId}`}
                x1={node.x}
                y1={node.y}
                x2={connection.x}
                y2={connection.y}
                stroke={strokeColor}
                strokeWidth="0.5"
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
            isCurrent={node.id === currentNodeId}
            isAvailable={availableNodeIds.has(node.id)}
            onSelect={() => handleNodeSelect(node.id)}
          />
        ))}
        
        {/* Token de la nave del jugador */}
        <PlayerShipToken x={displayX} y={displayY} isMoving={animatingTo !== null} />
      </svg>
    </div>
  );
};
