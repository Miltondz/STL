import React, { useState } from 'react';
import { Node, NodeType } from '../types';
import { getPlanetImageForNode } from '../services/imageRegistry';
import { RetroMonitor, RETRO_COLORS } from './RetroMonitor';

interface NodeViewerProps {
  node: Node;
  onEventTrigger: () => void;
  onShopAccess?: () => void;
}

// Íconos para los botones de acción
const icons = {
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  danger: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

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




export const NodeViewer: React.FC<NodeViewerProps> = ({ node, onEventTrigger, onShopAccess }) => {
  const [isActionTaken, setIsActionTaken] = useState(false);

  const handleActionClick = () => {
    if (isActionTaken) return;
    setIsActionTaken(true);
    onEventTrigger();
  };
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

      {/* Monitor con efectos retro usando el componente reutilizable */}
      <div className="relative flex-grow flex flex-col">
        <RetroMonitor
          height={200}
          leftColumns={{ count: 5, position: 'left' }}
          rightColumns={{ count: 5, position: 'right' }}
          typingLines={{ count: 24, left: 56, top: 8, width: 100, height: 180 }}
          colors={RETRO_COLORS.GREEN}
        >
          <div style={{ marginLeft: '20px' }}>
            <svg viewBox="-3 -3 6 6" width="180" height="180" style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.4))' }}>
              <image 
                href={getPlanetImageForNode(node.id, [node])} 
                x="-1.75" 
                y="-1.75" 
                height="3.5" 
                width="3.5" 
                opacity="0.9"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 0 0; 360 0 0"
                  dur="60s"
                  repeatCount="indefinite"
                />
              </image>
            </svg>
          </div>

          {/* Botones de Acción sobre el Planeta */}
          <div className="absolute inset-0 flex items-center justify-around z-20">
            {node.type === NodeType.BATTLE || node.type === NodeType.MINI_BOSS ? (
              <button 
                onClick={handleActionClick}
                disabled={isActionTaken || node.visited}
                className={`p-2 rounded-full border-2 transition-all duration-300 ${isActionTaken || node.visited ? 'border-gray-600 text-gray-600' : 'border-red-500 text-red-500 animate-pulse-intense'}`}>
                {icons.danger}
              </button>
            ) : ([NodeType.ENCOUNTER, NodeType.SHOP, NodeType.SPECIAL_EVENT].includes(node.type)) ? (
              <button 
                onClick={handleActionClick}
                disabled={isActionTaken || node.visited}
                className={`p-2 rounded-full border-2 transition-all duration-300 ${isActionTaken || node.visited ? 'border-gray-600 text-gray-600' : 'border-cyan-400 text-cyan-400 hover:bg-cyan-400/20'}`}>
                {icons.info}
              </button>
            ) : null}
          </div>
        </RetroMonitor>

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

          {/* Botón específico para tiendas */}
          {node.type === NodeType.SHOP && onShopAccess && (
            <div className="mt-3 pt-2 border-t border-cyan-500/20">
              <button
                onClick={onShopAccess}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-orbitron rounded transition-colors flex items-center justify-center gap-2"
              >
                🏬 ACCEDER A TIENDA
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
