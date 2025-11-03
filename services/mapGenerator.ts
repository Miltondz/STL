import { MapData, Node, NodeType } from '../types';

// --- Constantes de Configuración del Mapa ---
const NUM_LAYERS = 15;
const NUM_COLUMNS = 9; // Más columnas para mejor separación
const MAP_WIDTH = 100;
const MAP_HEIGHT = 200;

// --- Probabilidades ---
const BRANCH_CHANCE = 0.3;
const BRANCH_LENGTH_MIN = 2;
const BRANCH_LENGTH_MAX = 4;
const VERTICAL_BIAS = 0.7; // 70% de probabilidad de avanzar recto hacia arriba

// --- Porcentajes de Tipos de Nodo (Estilo Slay the Spire) ---
const NODE_TYPE_PERCENTAGES: Record<NodeType, number> = {
    [NodeType.BATTLE]: 0.47,
    [NodeType.ENCOUNTER]: 0.25,
    [NodeType.SHOP]: 0.02, // Reducido porque ahora se colocan estratégicamente
    [NodeType.HAZARD]: 0.08, // Representa a los "Elites"
    [NodeType.MINI_BOSS]: 0, // Se colocan manualmente
    [NodeType.SPECIAL_EVENT]: 0.15, // Aumentado para compensar
    [NodeType.START]: 0,
    [NodeType.END]: 0,
};

// Helper para elegir la siguiente columna con un sesgo vertical
const chooseNextColumn = (currentColumn: number, minCol: number, maxCol: number, grid: (Node | null)[][], layer: number): number | null => {
    // 1. Intentar ir recto con alta probabilidad
    if (Math.random() < VERTICAL_BIAS && !grid[layer][currentColumn]) {
        return currentColumn;
    }

    // 2. Si no, intentar los lados aleatoriamente
    const options = [currentColumn - 1, currentColumn + 1]
        .filter(col => col >= minCol && col <= maxCol && !grid[layer][col]);
    
    if (options.length > 0) {
        return options[Math.floor(Math.random() * options.length)];
    }
    
    // 3. Como último recurso, intentar ir recto aunque esté ocupado (debería ser raro) o fallar
    if (!grid[layer][currentColumn]) return currentColumn;
    
    return null; // No hay opción disponible
}

// --- Función Principal de Generación ---
export const generateMap = (): MapData => {
    let nodeIdCounter = 0;
    const nodes: Node[] = [];
    // Rejilla para rastrear la ocupación de nodos y evitar colisiones
    const grid: (Node | null)[][] = Array.from({ length: NUM_LAYERS }, () => Array(NUM_COLUMNS).fill(null));

    const createNode = (layer: number, column: number, type: NodeType = NodeType.BATTLE): Node => {
        const node: Node = {
            id: nodeIdCounter++,
            type,
            layer,
            x: column,
            y: layer,
            connections: [],
            visited: false,
        };
        nodes.push(node);
        if(grid[layer] && grid[layer][column] === null) grid[layer][column] = node;
        return node;
    };

    // Nodos de Inicio y Final
    const startNode = createNode(0, Math.floor(NUM_COLUMNS / 2), NodeType.START);
    startNode.visited = true;
    const endNode = createNode(NUM_LAYERS - 1, Math.floor(NUM_COLUMNS / 2), NodeType.END);

    // 1. Definir "Carriles" y crear DOS Caminos Principales
    const midPoint = Math.floor(NUM_COLUMNS / 2);
    const pathLanes = [
        { min: 0, max: midPoint - 1, start: Math.floor((midPoint - 1) / 2) }, // Carril Izquierdo
        { min: midPoint + 1, max: NUM_COLUMNS - 1, start: midPoint + 1 + Math.floor(((NUM_COLUMNS - 1) - (midPoint + 1)) / 2) } // Carril Derecho
    ];
    
    const mainPaths: Node[][] = [];

    for (const lane of pathLanes) {
        const path: Node[] = [];
        let currentColumn = lane.start;

        const firstNode = createNode(1, currentColumn);
        startNode.connections.push(firstNode.id);
        path.push(firstNode);

        for (let layer = 2; layer < NUM_LAYERS - 1; layer++) {
            const prevNode = path[path.length - 1];
            const nextCol = chooseNextColumn(currentColumn, lane.min, lane.max, grid, layer);
            
            if (nextCol === null) {
                const anyFreeCol = Array.from({length: lane.max - lane.min + 1}, (_, i) => i + lane.min).find(c => !grid[layer][c]);
                if (anyFreeCol !== undefined) {
                    currentColumn = anyFreeCol;
                } else {
                    break;
                }
            } else {
                currentColumn = nextCol;
            }
            
            const newNode = createNode(layer, currentColumn);
            prevNode.connections.push(newNode.id);
            path.push(newNode);
        }
        
        if (path.length > 0) {
            path[path.length - 1].connections.push(endNode.id);
        }
        mainPaths.push(path);
    }
    
    // 2. Crear Ramas Laterales
    const allMainPathNodes = mainPaths.flat();
    for (const pathNode of allMainPathNodes) {
        if (pathNode.layer < 2 || pathNode.layer > NUM_LAYERS - 5) continue;

        if (Math.random() < BRANCH_CHANCE) {
            const branchStartColumn = pathNode.x;
            const branchSide = Math.random() < 0.5 ? -1 : 1;
            let branchColumn = branchStartColumn + branchSide;

            if (branchColumn >= 0 && branchColumn < NUM_COLUMNS && !grid[pathNode.layer + 1][branchColumn]) {
                let currentBranchNode = createNode(pathNode.layer + 1, branchColumn);
                pathNode.connections.push(currentBranchNode.id);
                
                const branchLength = Math.floor(Math.random() * (BRANCH_LENGTH_MAX - BRANCH_LENGTH_MIN + 1)) + BRANCH_LENGTH_MIN;

                for (let j = 1; j < branchLength && (currentBranchNode.layer + 1) < NUM_LAYERS - 1; j++) {
                    const currentLayer = currentBranchNode.layer + 1;
                    const possibleNextColumns = [branchColumn - 1, branchColumn, branchColumn + 1].filter(
                        col => col >= 0 && col < NUM_COLUMNS && !grid[currentLayer][col]
                    );
                    if (possibleNextColumns.length === 0) break;

                    const nextColumn = possibleNextColumns[Math.floor(Math.random() * possibleNextColumns.length)];
                    const nextNode = createNode(currentLayer, nextColumn);
                    currentBranchNode.connections.push(nextNode.id);
                    currentBranchNode = nextNode;
                    branchColumn = nextColumn;
                }
                
                const mergeLayer = currentBranchNode.layer + 1;
                if(mergeLayer < NUM_LAYERS -1){
                    const mergeTargets = nodes.filter(n => n.layer === mergeLayer && allMainPathNodes.includes(n));
                     if (mergeTargets.length > 0) {
                        const closestTarget = mergeTargets.reduce((a, b) => Math.abs(a.x - currentBranchNode.x) < Math.abs(b.x - currentBranchNode.x) ? a : b);
                        currentBranchNode.connections.push(closestTarget.id);
                    }
                }
            }
        }
    }
    
    // 3. Crear Puntos de Cruce CONTROLADOS
    const crossoverLayers = [Math.floor(NUM_LAYERS * 0.4), Math.floor(NUM_LAYERS * 0.7)];
    for (const layer of crossoverLayers) {
        const leftPathNodes = mainPaths[0]?.filter(n => n.layer === layer) || [];
        const rightPathNodes = mainPaths[1]?.filter(n => n.layer === layer) || [];

        if (leftPathNodes.length > 0 && rightPathNodes.length > 0) {
            const leftNode = leftPathNodes[0];
            const rightNode = rightPathNodes[0];

            const nextLayerLeftNodes = mainPaths[0]?.filter(n => n.layer === layer + 1) || [];
            const nextLayerRightNodes = mainPaths[1]?.filter(n => n.layer === layer + 1) || [];

            if (nextLayerRightNodes.length > 0) leftNode.connections.push(nextLayerRightNodes[0].id);
            if (nextLayerLeftNodes.length > 0) rightNode.connections.push(nextLayerLeftNodes[0].id);
        }
    }

    // 4. VALIDACIÓN Y REPARACIÓN DE CALLEJONES SIN SALIDA
    nodes.forEach(node => {
        if (node.connections.length === 0 && node.id !== endNode.id) {
            const potentialTargets = nodes.filter(target => target.layer > node.layer);
            if (potentialTargets.length > 0) {
                let closestTarget = potentialTargets[0];
                let minDistance = Infinity;
                for (const target of potentialTargets) {
                    const distance = Math.sqrt(Math.pow(target.x - node.x, 2) + Math.pow(target.layer - node.layer, 2));
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestTarget = target;
                    }
                }
                node.connections.push(closestTarget.id);
            }
        }
    });

    // 5. Asignar Tipos de Nodo (con reglas)
    endNode.type = NodeType.END;
    
    // Nodos de preparación antes del final
    const preEndNodes = nodes.filter(n => n.connections.includes(endNode.id));
    preEndNodes.forEach(node => {
        node.type = Math.random() < 0.6 ? NodeType.SHOP : NodeType.SPECIAL_EVENT;
    });

    // Colocación estratégica de tiendas en cada ruta (25%, 60%, 90%)
    mainPaths.forEach(path => {
        if (path.length > 6) { // Solo en rutas suficientemente largas
            const shop25Index = Math.floor(path.length * 0.25);
            const shop60Index = Math.floor(path.length * 0.60);
            const shop90Index = Math.floor(path.length * 0.90);
            
            // Colocar tiendas en los porcentajes especificados
            if (path[shop25Index] && path[shop25Index].layer > 1) {
                path[shop25Index].type = NodeType.SHOP;
            }
            if (path[shop60Index] && path[shop60Index].layer > 1 && shop60Index !== shop25Index) {
                path[shop60Index].type = NodeType.SHOP;
            }
            if (path[shop90Index] && path[shop90Index].layer > 1 && shop90Index !== shop25Index && shop90Index !== shop60Index) {
                path[shop90Index].type = NodeType.SHOP;
            }
        }
    });
    
    // Colocación incremental de Mini-Jefes en puntos clave
    mainPaths.forEach(path => {
        if (path.length > 5) { // Asegurarse de que el camino es suficientemente largo
            const thirdIndex = Math.floor(path.length / 3);
            const twoThirdsIndex = Math.floor(path.length * 2 / 3);
            
            if (path[thirdIndex] && path[thirdIndex].type === NodeType.BATTLE) {
                path[thirdIndex].type = NodeType.MINI_BOSS;
            }
            if (path[twoThirdsIndex] && path[twoThirdsIndex].type === NodeType.BATTLE) {
                path[twoThirdsIndex].type = NodeType.MINI_BOSS;
            }
        }
    });

    // Asignación del resto de nodos usando el "cubo de tipos"
    const unassignedNodes = nodes.filter(n => n.type === NodeType.BATTLE && n.layer > 0);
    const typeBucket: NodeType[] = [];
    Object.entries(NODE_TYPE_PERCENTAGES).forEach(([type, percentage]) => {
        if (percentage > 0) {
            const count = Math.floor(percentage * unassignedNodes.length);
            for (let i = 0; i < count; i++) typeBucket.push(type as NodeType);
        }
    });
    while(typeBucket.length < unassignedNodes.length) {
        typeBucket.push(NodeType.BATTLE);
    }
    
    for (let i = typeBucket.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [typeBucket[i], typeBucket[j]] = [typeBucket[j], typeBucket[i]];
    }

    unassignedNodes.forEach(node => {
        if (typeBucket.length > 0) {
            const type = typeBucket.pop()!;
            if ((type === NodeType.SHOP || type === NodeType.HAZARD) && node.layer < 3) {
                typeBucket.unshift(type); 
            } else {
                node.type = type;
            }
        }
    });

    // 6. APLICAR REGLAS DE RITMO DE JUEGO (POST-PROCESAMIENTO)
    const predecessors = new Map<number, number[]>();
    nodes.forEach(node => {
        node.connections.forEach(connId => {
            if (!predecessors.has(connId)) predecessors.set(connId, []);
            predecessors.get(connId)!.push(node.id);
        });
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const sortedNodes = [...nodes].sort((a, b) => a.layer - b.layer);

    // Regla 1: No más de 2 nodos de combate seguidos (BATALLA o PELIGRO)
    const combatTypes = new Set([NodeType.BATTLE, NodeType.HAZARD]);
    const beneficialTypes = [NodeType.ENCOUNTER, NodeType.SHOP, NodeType.SPECIAL_EVENT];
    let beneficialTypeIndex = 0;

    // Regla 2: Distancia mínima de 3 nodos entre tiendas
    const checkShopDistance = (nodeId: number, distance: number): boolean => {
        if (distance >= 3) return true; // Suficiente distancia
        
        const parents = predecessors.get(nodeId) || [];
        for (const parentId of parents) {
            const parentNode = nodeMap.get(parentId);
            if (parentNode) {
                if (parentNode.type === NodeType.SHOP) {
                    return false; // Encontró una tienda muy cerca
                }
                // Continuar buscando hacia atrás
                if (!checkShopDistance(parentId, distance + 1)) {
                    return false;
                }
            }
        }
        return true;
    };

    sortedNodes.forEach(currentNode => {
        if (currentNode.type !== NodeType.SHOP) return;

        // Verificar si hay suficiente distancia desde otras tiendas
        if (!checkShopDistance(currentNode.id, 0)) {
            // Cambiar la tienda actual a otro tipo beneficioso
            const alternativeTypes = [NodeType.ENCOUNTER, NodeType.SPECIAL_EVENT];
            currentNode.type = alternativeTypes[Math.floor(Math.random() * alternativeTypes.length)];
        }
    });

    sortedNodes.forEach(currentNode => {
        if (!combatTypes.has(currentNode.type)) return;

        const parents = predecessors.get(currentNode.id) || [];
        if (parents.length === 0) return;

        let threeInARow = false;
        for (const parentId of parents) {
            const parentNode = nodeMap.get(parentId);
            if (parentNode && combatTypes.has(parentNode.type)) {
                const grandparents = predecessors.get(parentId) || [];
                for (const grandparentId of grandparents) {
                    const grandparent = nodeMap.get(grandparentId);
                    if (grandparent && combatTypes.has(grandparent.type)) {
                        threeInARow = true;
                        break; 
                    }
                }
            }
            if (threeInARow) break; 
        }

        if (threeInARow) {
            currentNode.type = beneficialTypes[beneficialTypeIndex % beneficialTypes.length];
            beneficialTypeIndex++;
        }
    });

    // Regla 2: No más de 2 nodos de ENCUENTRO seguidos
    sortedNodes.forEach(currentNode => {
        if (currentNode.type !== NodeType.ENCOUNTER) return;

        const parents = predecessors.get(currentNode.id) || [];
        if (parents.length === 0) return;

        let threeEncountersInARow = false;
        for (const parentId of parents) {
            const parentNode = nodeMap.get(parentId);
            if (parentNode && parentNode.type === NodeType.ENCOUNTER) {
                const grandparents = predecessors.get(parentId) || [];
                for (const grandparentId of grandparents) {
                    const grandparent = nodeMap.get(grandparentId);
                    if (grandparent && grandparent.type === NodeType.ENCOUNTER) {
                        threeEncountersInARow = true;
                        break;
                    }
                }
            }
            if (threeEncountersInARow) break;
        }

        if (threeEncountersInARow) {
            // Reemplaza el tercer encuentro por una batalla para romper la racha no combativa.
            currentNode.type = NodeType.BATTLE;
        }
    });

    // 7. Convertir coordenadas a píxeles
    const x_padding = 15;
    const y_padding = 20;
    nodes.forEach(node => {
        const columnJitter = (Math.random() - 0.5) * 2.5;
        const layerJitter = (Math.random() - 0.5) * 2.5;
        node.x = x_padding + (node.x / (NUM_COLUMNS - 1)) * (MAP_WIDTH - x_padding * 2) + columnJitter;
        // La progresión es de arriba (layer 0) hacia abajo (layer grande).
        node.y = y_padding + (node.y / (NUM_LAYERS - 1)) * (MAP_HEIGHT - y_padding * 2) + layerJitter;
    });

    return { nodes, startNodeId: startNode.id, endNodeId: endNode.id };
};