import React, { useState, useEffect } from 'react';
import { Node, NodeType } from '../types';
import { getPlanetImageForNode } from '../services/imageRegistry';

interface NodeAnalysisScreenProps {
    node: Node;
    onEventTrigger: () => void;
    onExitNode: () => void;
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
        [NodeType.END]: 'BATALLA FINAL - El último desafío te espera. Derrota al guardián para completar el sector.',
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

// Determinar si el nodo requiere acción obligatoria
const requiresAction = (type: NodeType): boolean => {
    return [NodeType.BATTLE, NodeType.MINI_BOSS, NodeType.ENCOUNTER, NodeType.HAZARD, NodeType.SPECIAL_EVENT, NodeType.END].includes(type);
};

// Obtener color de alerta según tipo de nodo
const getAlertColor = (type: NodeType): string => {
    if (type === NodeType.BATTLE || type === NodeType.MINI_BOSS || type === NodeType.HAZARD) {
        return 'border-red-500 text-red-500 bg-red-500/10';
    }
    if (type === NodeType.END) {
        return 'border-purple-500 text-purple-500 bg-purple-500/10';
    }
    if (type === NodeType.ENCOUNTER || type === NodeType.SPECIAL_EVENT) {
        return 'border-yellow-500 text-yellow-500 bg-yellow-500/10';
    }
    return 'border-cyan-500 text-cyan-500 bg-cyan-500/10';
};

export const NodeAnalysisScreen: React.FC<NodeAnalysisScreenProps> = ({
    node,
    onEventTrigger,
    onExitNode
}) => {
    const [scanProgress, setScanProgress] = useState(0);
    const [isScanning, setIsScanning] = useState(true);
    const [showAlert, setShowAlert] = useState(false);

    const typeName = getNodeTypeName(node.type);
    const description = getNodeDescription(node.type);
    const needsAction = requiresAction(node.type);
    const canExit = node.type === NodeType.SHOP || !needsAction;
    const alertColor = getAlertColor(node.type);

    // Simulación de escaneo
    useEffect(() => {
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    setIsScanning(false);
                    setShowAlert(true);
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-30 bg-black flex items-center justify-center">
            {/* Efectos de TV antigua */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Scanlines */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,255,0.03) 0px, rgba(0,255,255,0.03) 1px, transparent 1px, transparent 3px)',
                        backgroundSize: '100% 3px'
                    }}
                />
                {/* Ruido de TV */}
                <div
                    className="absolute inset-0 opacity-5 animate-pulse"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
                    }}
                />
                {/* Vignette */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(circle at center, transparent 0%, transparent 70%, rgba(0,0,0,0.3) 100%)'
                    }}
                />
            </div>

            {/* Contenido principal */}
            <div className="relative w-full max-w-4xl mx-auto p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-orbitron text-cyan-400 mb-2 animate-pulse">
                        ANÁLISIS DE SECTOR
                    </h1>
                    <div className="text-cyan-300 font-mono">
                        COORDENADAS: [{Math.round(node.x)}, {Math.round(node.y)}]
                    </div>
                </div>

                {/* Monitor principal */}
                <div className="bg-black border-4 border-cyan-500/30 rounded-lg p-8 mb-6 relative overflow-hidden">
                    {/* Planeta grande con efectos */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <svg viewBox="-4 -4 8 8" width="300" height="300" className="drop-shadow-2xl">
                                <defs>
                                    <filter id="tv-atmosphere" x="-50%" y="-50%" width="200%" height="200%">
                                        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="turbulence">
                                            <animate attributeName="baseFrequency" dur="12s" values="0.08;0.12;0.08" repeatCount="indefinite" />
                                        </feTurbulence>
                                        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2" />
                                    </filter>
                                    <radialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="rgba(103,232,249,0.4)" />
                                        <stop offset="100%" stopColor="rgba(103,232,249,0)" />
                                    </radialGradient>
                                </defs>

                                {/* Glow exterior */}
                                <circle cx="0" cy="0" r="3.5" fill="url(#planetGlow)" opacity="0.6" />

                                {/* Planeta */}
                                <image
                                    href={getPlanetImageForNode(node.id, [node])}
                                    x="-2.5" y="-2.5"
                                    height="5" width="5"
                                    filter="url(#tv-atmosphere)"
                                    opacity="0.95"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        values="0 0 0; 360 0 0"
                                        dur="60s"
                                        repeatCount="indefinite"
                                    />
                                </image>

                                {/* Atmósfera */}
                                <circle cx="0" cy="0" r="2.5" fill="none" stroke="rgba(103,232,249,0.3)" strokeWidth="0.1">
                                    <animate attributeName="r" values="2.5;2.7;2.5" dur="8s" repeatCount="indefinite" />
                                    <animate attributeName="stroke-width" values="0.1;0.2;0.1" dur="8s" repeatCount="indefinite" />
                                </circle>

                                {/* Highlight especular */}
                                <ellipse cx="-1.2" cy="-1.2" rx="0.6" ry="0.8" fill="white" opacity="0.4">
                                    <animate attributeName="cx" values="-1.2;1.2;-1.2" dur="20s" repeatCount="indefinite" />
                                    <animate attributeName="cy" values="-1.2;1.2;-1.2" dur="20s" repeatCount="indefinite" />
                                </ellipse>
                            </svg>

                            {/* Alerta superpuesta */}
                            {showAlert && needsAction && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={onEventTrigger}
                                        className={`px-6 py-3 rounded-lg border-2 font-orbitron font-bold text-lg transition-all duration-300 hover:scale-110 animate-pulse ${alertColor}`}
                                    >
                                        {node.type === NodeType.BATTLE || node.type === NodeType.MINI_BOSS || node.type === NodeType.HAZARD ?
                                            '⚠️ PELIGRO DETECTADO' :
                                            node.type === NodeType.END ?
                                                '👑 BATALLA FINAL' :
                                                '📡 SEÑAL DETECTADA'
                                        }
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del nodo */}
                    <div className="grid grid-cols-2 gap-8 text-cyan-300 font-mono">
                        <div>
                            <div className="mb-4">
                                <span className="text-gray-400">TIPO DE SECTOR:</span>
                                <div className="text-2xl font-bold text-cyan-400">{typeName}</div>
                            </div>
                            <div className="mb-4">
                                <span className="text-gray-400">ESTADO:</span>
                                <div className={`text-lg ${node.visited ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {node.visited ? 'VISITADO' : 'NO VISITADO'}
                                </div>
                            </div>
                        </div>
                        <div>
                            {/* Barra de progreso de escaneo */}
                            <div className="mb-4">
                                <span className="text-gray-400">PROGRESO DE ESCANEO:</span>
                                <div className="w-full bg-gray-800 rounded-full h-3 mt-2">
                                    <div
                                        className="bg-cyan-500 h-3 rounded-full transition-all duration-100"
                                        style={{ width: `${scanProgress}%` }}
                                    />
                                </div>
                                <div className="text-right text-sm mt-1">{scanProgress}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="mt-6 p-4 bg-gray-900/50 rounded border border-cyan-500/20">
                        <div className="text-gray-400 text-sm mb-2">ANÁLISIS DETALLADO:</div>
                        <p className="text-cyan-300 leading-relaxed">{description}</p>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap justify-center gap-4">
                    {canExit && (
                        <button
                            onClick={onExitNode}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-orbitron transition-colors flex items-center gap-2"
                        >
                            ← SALIR DEL SECTOR
                        </button>
                    )}

                    {showAlert && needsAction && (
                        <button
                            onClick={onEventTrigger}
                            className={`px-8 py-3 rounded-lg border-2 font-orbitron font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${alertColor}`}
                        >
                            {node.type === NodeType.BATTLE || node.type === NodeType.MINI_BOSS ?
                                <>⚔️ INICIAR COMBATE</> :
                                node.type === NodeType.END ?
                                    <>👑 ENFRENTAR JEFE FINAL</> :
                                    <>🔍 INVESTIGAR</>
                            }
                        </button>
                    )}

                    {node.type === NodeType.SHOP && (
                        <button
                            onClick={onEventTrigger}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-orbitron transition-colors flex items-center gap-2"
                        >
                            🏬 ACCEDER A TIENDA
                        </button>
                    )}
                </div>

                {/* Instrucciones para el usuario */}
                {!showAlert && isScanning && (
                    <div className="text-center mt-4 text-cyan-400 font-mono animate-pulse">
                        Escaneando sector...
                    </div>
                )}

                {!needsAction && !isScanning && (
                    <div className="text-center mt-4 text-green-400 font-mono">
                        Sector seguro - Puedes continuar tu viaje
                    </div>
                )}
            </div>

            {/* Efecto de flicker global */}
            <style>{`
        @keyframes tv-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.98; }
          75% { opacity: 0.99; }
        }
        
        .tv-screen {
          animation: tv-flicker 4s infinite;
        }
      `}</style>
        </div>
    );
};