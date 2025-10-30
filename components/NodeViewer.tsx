import React from 'react';
import { Node, NodeType } from '../types';

interface NodeViewerProps {
  node: Node;
}

// Descripciones por tipo de nodo
const getNodeDescription = (type: NodeType): string => {
  const descriptions: Record<NodeType, string> = {
    [NodeType.START]: 'PUNTO DE PARTIDA - Estación espacial de lanzamiento. Todos los viajes comienzan aquí.',
    [NodeType.BATTLE]: 'ZONA DE COMBATE - Señales de naves hostiles detectadas. Prepárate para el enfrentamiento.',
    [NodeType.ENCOUNTER]: 'ENCUENTRO ALEATORIO - Transmisiones no identificadas. Podría ser peligroso o beneficioso.',
    [NodeType.SHOP]: 'ESTACIÓN COMERCIAL - Puerto seguro con comerciantes y servicios de reparación.',
    [NodeType.HAZARD]: 'PELIGRO GALÁCTICO - Zona con fenómenos espaciales peligrosos. Procede con cautela.',
    [NodeType.MINI_BOSS]: 'AMENAZA MAYOR - Se detecta una nave capital enemiga. Peligro extremo.',
    [NodeType.SPECIAL_EVENT]: 'EVENTO ESPECIAL - Anomalía espacial única detectada. Situación impredecible.',
    [NodeType.END]: 'DESTINO FINAL - Has alcanzado tu objetivo. El sector está completo.',
  };
  return descriptions[type] || 'ZONA DESCONOCIDA - Sin datos disponibles.';
};

// Nombre del tipo de nodo
const getNodeTypeName = (type: NodeType): string => {
  const names: Record<NodeType, string> = {
    [NodeType.START]: 'INICIO',
    [NodeType.BATTLE]: 'COMBATE',
    [NodeType.ENCOUNTER]: 'ENCUENTRO',
    [NodeType.SHOP]: 'TIENDA',
    [NodeType.HAZARD]: 'PELIGRO',
    [NodeType.MINI_BOSS]: 'JEFE',
    [NodeType.SPECIAL_EVENT]: 'ESPECIAL',
    [NodeType.END]: 'FINAL',
  };
  return names[type] || 'DESCONOCIDO';
};

// Imagen del planeta según el tipo
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

export const NodeViewer: React.FC<NodeViewerProps> = ({ node }) => {
  const planetImage = getPlanetImage(node.type);
  const typeName = getNodeTypeName(node.type);
  const description = getNodeDescription(node.type);
  const visitedStatus = node.visited ? '[VISITADO]' : '[NO VISITADO]';

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/20 h-full flex flex-col">
      {/* Título */}
      <div className="flex justify-between items-center mb-3 border-b border-cyan-500/20 pb-2">
        <h3 className="font-orbitron text-lg text-cyan-400">ANÁLISIS DE SECTOR</h3>
        <span className={`text-xs font-mono ${node.visited ? 'text-green-400' : 'text-yellow-400'}`}>
          {visitedStatus}
        </span>
      </div>

      {/* Monitor con efectos retro */}
      <div className="retro-monitor relative flex-grow flex flex-col">
        {/* Imagen del planeta con efecto de monitor */}
        <div className="relative mb-3 rounded border border-cyan-500/30 overflow-hidden bg-black/50">
          <img 
            src={planetImage} 
            alt={typeName}
            className="w-full h-32 object-cover opacity-90"
            style={{
              filter: 'contrast(1.1) brightness(0.9)',
            }}
          />
          {/* Efecto de scanlines */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
            backgroundSize: '100% 2px'
          }} />
          {/* Efecto de vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
          }} />
        </div>

        {/* Información del nodo */}
        <div className="flex-grow space-y-2 font-mono text-sm">
          <div className="flex justify-between items-center border-b border-cyan-500/10 pb-1">
            <span className="text-gray-400">TIPO:</span>
            <span className="text-cyan-300 font-bold">{typeName}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-cyan-500/10 pb-1">
            <span className="text-gray-400">COORDENADAS:</span>
            <span className="text-cyan-300">[{Math.round(node.x)}, {Math.round(node.y)}]</span>
          </div>

          <div className="mt-3 pt-2 border-t border-cyan-500/20">
            <p className="text-gray-300 text-xs leading-relaxed retro-text">
              {description}
            </p>
          </div>
        </div>

        {/* Efecto de flicker sutil */}
        <style jsx>{`
          .retro-monitor {
            animation: subtle-flicker 3s infinite;
          }
          
          @keyframes subtle-flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.98; }
          }
          
          .retro-text {
            text-shadow: 0 0 2px rgba(103, 232, 249, 0.3);
          }
        `}</style>
      </div>
    </div>
  );
};
