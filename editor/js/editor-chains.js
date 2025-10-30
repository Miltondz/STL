const ChainEditor = (() => {
    let chains = [];
    let currentChain = null;

    return {
        init() {
            this.loadChains();
            this.renderChains();
            this.connectChainFormListeners();
        },

        loadChains() {
            const stored = localStorage.getItem('navegador_chains');
            if (stored) {
                try {
                    chains = JSON.parse(stored);
                    console.log('[Chains] Cadenas cargadas:', chains.length);
                } catch (e) {
                    console.error('[Chains] Error al parsear cadenas:', e);
                    chains = [];
                }
            }
        },

        saveChains() {
            localStorage.setItem('navegador_chains', JSON.stringify(chains));
            console.log('[Chains] Cadenas guardadas:', chains.length);
        },

        renderChains() {
            const container = document.getElementById('chainsList');
            if (!container) return;

            const searchTerm = document.getElementById('searchChains')?.value?.toLowerCase() || '';
            const filtered = chains.filter(c => 
                c.id.toLowerCase().includes(searchTerm) ||
                (c.name && c.name.toLowerCase().includes(searchTerm)) ||
                (c.description && c.description.toLowerCase().includes(searchTerm))
            );

            if (filtered.length === 0) {
                container.innerHTML = '<div class="empty-state">No hay cadenas narrativas</div>';
                return;
            }

            container.innerHTML = filtered.map(chain => `
                <div class="list-item ${currentChain?.id === chain.id ? 'active' : ''}"
                     data-chain-id="${chain.id}">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">📖</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary);">${chain.name || chain.id}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${chain.nodes?.length || 0} nodos</div>
                        </div>
                    </div>
                    ${chain.description ? `
                        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 5px; font-style: italic;">
                            ${chain.description.substring(0, 60)}${chain.description.length > 60 ? '...' : ''}
                        </div>
                    ` : ''}
                </div>
            `).join('');

            container.querySelectorAll('.list-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.chainId;
                    this.loadChain(id);
                });
            });
        },

        loadChain(id) {
            const chain = chains.find(c => c.id === id);
            if (!chain) return;

            currentChain = chain;
            this.renderChains();

            document.getElementById('chainId').value = chain.id || '';
            document.getElementById('chainName').value = chain.name || '';
            document.getElementById('chainDescription').value = chain.description || '';
            document.getElementById('chainStartNode').value = chain.startNode || '';

            this.renderNodes();
            
            // Mostrar formulario
            const editor = document.getElementById('chainEditor');
            const emptyState = document.getElementById('chainEmptyState');
            if (editor) editor.style.display = 'block';
            if (emptyState) emptyState.style.display = 'none';
            
            Toast.info('Cadena cargada');
        },

        renderNodes() {
            const container = document.getElementById('nodesList');
            if (!container || !currentChain) return;

            const nodes = currentChain.nodes || [];
            
            if (nodes.length === 0) {
                container.innerHTML = `
                    <div style="padding: 20px; background: rgba(236,72,153,0.1); border: 1px dashed #ec4899; border-radius: 8px; color: var(--text-secondary); font-size: 12px; line-height: 1.8;">
                        <strong style="color: var(--primary); display: block; margin-bottom: 10px; font-size: 14px;">💡 ¿Qué son los eventos narrativos?</strong>
                        Los eventos son las escenas que componen tu historia. Cada evento puede ser:<br><br>
                        💬 <strong>Diálogo:</strong> Conversación con un personaje<br>
                        ⚔️ <strong>Combate:</strong> Batalla configurada<br>
                        🏬 <strong>Tienda:</strong> Visita a una tienda específica<br>
                        🎲 <strong>Evento:</strong> Evento de elección/azar del sistema<br>
                        🎯 <strong>Elección:</strong> Decisión que ramifica la historia<br><br>
                        <em style="color: var(--text-secondary);">🔗 Los eventos se encadenan para formar una historia lineal o ramificada</em>
                    </div>
                `;
                return;
            }

            container.innerHTML = nodes.map((node, index) => `
                <div class="dynamic-item" style="padding: 15px; background: var(--bg-darker); border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #ec4899;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <strong style="color: #ec4899; font-size: 14px;">📍 Evento ${index + 1}: ${node.id || 'Sin ID'}</strong>
                        <button onclick="ChainEditor.removeNode(${index})" class="btn-danger" style="padding: 4px 8px; font-size: 11px;">✕ Eliminar</button>
                    </div>
                    
                    <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">🏷️ ID del Evento</label>
                    <input type="text" placeholder="event_001" value="${node.id || ''}"
                           onchange="ChainEditor.updateNode(${index}, 'id', this.value)"
                           style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); margin-bottom: 10px; font-family: monospace;">
                    
                    <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">🎭 Tipo de Evento*</label>
                    <select onchange="ChainEditor.updateNode(${index}, 'type', this.value)"
                            style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); margin-bottom: 10px;">
                        <option value="event" ${node.type === 'event' ? 'selected' : ''}>🎲 Evento (del sistema)</option>
                        <option value="dialogue" ${node.type === 'dialogue' ? 'selected' : ''}>💬 Diálogo</option>
                        <option value="combat" ${node.type === 'combat' ? 'selected' : ''}>⚔️ Combate</option>
                        <option value="shop" ${node.type === 'shop' ? 'selected' : ''}>🏬 Tienda</option>
                        <option value="choice" ${node.type === 'choice' ? 'selected' : ''}>🎯 Elección</option>
                    </select>
                    
                    <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">🔗 Referencia al contenido</label>
                    <input type="text" placeholder="${this.getReferencePlaceholder(node.type)}" value="${node.reference || ''}"
                           onchange="ChainEditor.updateNode(${index}, 'reference', this.value)"
                           style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); margin-bottom: 10px; font-family: monospace;">
                    <small style="display: block; margin-top: -6px; margin-bottom: 10px; color: var(--text-secondary); font-size: 10px;">
                        ${this.getReferenceHelp(node.type)}
                    </small>
                    
                    <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">⚙️ Condiciones (JSON opcional)</label>
                    <textarea placeholder='{"type": "hasCard", "value": "CARD_001"}' 
                              onchange="ChainEditor.updateNode(${index}, 'conditions', this.value)"
                              style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); resize: vertical; min-height: 50px; font-family: monospace; font-size: 11px; margin-bottom: 10px;">${node.conditions ? JSON.stringify(node.conditions, null, 2) : ''}</textarea>
                    
                    <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">➡️ ID del Siguiente Evento</label>
                    <input type="text" placeholder="event_002" value="${node.next || ''}"
                           onchange="ChainEditor.updateNode(${index}, 'next', this.value)"
                           style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); font-family: monospace;">
                    <small style="display: block; margin-top: 4px; color: var(--text-secondary); font-size: 10px;">
                        💡 Deja vacío si es el último evento de la cadena
                    </small>
                </div>
            `).join('');
        },

        getReferencePlaceholder(type) {
            const placeholders = {
                dialogue: 'dialogue_001',
                combat: 'combat_boss_01',
                shop: 'shop_station_alpha',
                event: 'enc_event_01',
                choice: 'choice_mission_01'
            };
            return placeholders[type] || 'ID del contenido';
        },

        getReferenceHelp(type) {
            const help = {
                dialogue: '💡 ID del diálogo creado en la sección Diálogos',
                combat: '💡 ID del combate (puede ser dinámico o predefinido)',
                shop: '💡 ID de la tienda creada en la sección Tiendas',
                event: '💡 ID del evento creado en la sección Eventos',
                choice: '💡 Referencia a una elección específica'
            };
            return help[type] || '💡 Referencia al contenido de este evento';
        },

        addNode() {
            if (!currentChain) {
                Toast.error('Primero crea una cadena');
                return;
            }
            if (!currentChain.nodes) currentChain.nodes = [];
            currentChain.nodes.push({ 
                id: `node_${Date.now()}`, 
                type: 'dialogue', 
                reference: '', 
                conditions: null,
                next: '' 
            });
            this.renderNodes();
        },

        updateNode(index, field, value) {
            if (!currentChain || !currentChain.nodes) return;
            
            if (field === 'conditions') {
                try {
                    currentChain.nodes[index][field] = value ? JSON.parse(value) : null;
                } catch (e) {
                    Toast.error('JSON inválido en condiciones');
                    return;
                }
            } else {
                currentChain.nodes[index][field] = value;
            }
        },

        removeNode(index) {
            if (!currentChain || !currentChain.nodes) return;
            currentChain.nodes.splice(index, 1);
            this.renderNodes();
        },

        addChain() {
            const newChain = {
                id: `chain_${Date.now()}`,
                name: '',
                description: '',
                startNode: '',
                nodes: []
            };

            chains.push(newChain);
            currentChain = newChain;
            this.saveChains();
            this.renderChains();
            this.loadChain(newChain.id);
            
            // Mostrar formulario
            const editor = document.getElementById('chainEditor');
            const emptyState = document.getElementById('chainEmptyState');
            if (editor) editor.style.display = 'block';
            if (emptyState) emptyState.style.display = 'none';
            
            Toast.success('Cadena creada');
        },

        saveChain() {
            if (!currentChain) {
                Toast.error('No hay cadena seleccionada');
                return;
            }

            const id = document.getElementById('chainId').value.trim();
            const name = document.getElementById('chainName').value.trim();
            const description = document.getElementById('chainDescription').value.trim();
            const startNode = document.getElementById('chainStartNode').value.trim();

            if (!id) {
                Toast.error('El ID es obligatorio');
                return;
            }

            const existingIndex = chains.findIndex(c => c.id === currentChain.id);
            if (existingIndex !== -1) {
                chains[existingIndex] = {
                    ...currentChain,
                    id,
                    name,
                    description,
                    startNode
                };
                currentChain = chains[existingIndex];
            }

            this.saveChains();
            this.renderChains();
            Toast.success('Cadena guardada');
        },

        deleteChain() {
            if (!currentChain) {
                Toast.error('No hay cadena seleccionada');
                return;
            }

            if (!confirm(`¿Eliminar la cadena "${currentChain.name || currentChain.id}"?`)) return;

            const idToDelete = currentChain.id;
            chains = chains.filter(c => c.id !== idToDelete);
            currentChain = null;
            this.saveChains();
            this.renderChains();

            // Limpiar formulario
            document.getElementById('chainId').value = '';
            document.getElementById('chainName').value = '';
            document.getElementById('chainDescription').value = '';
            document.getElementById('chainStartNode').value = '';
            document.getElementById('nodesList').innerHTML = '';
            
            // Ocultar formulario y mostrar empty state
            const editor = document.getElementById('chainEditor');
            const emptyState = document.getElementById('chainEmptyState');
            if (editor) editor.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';

            Toast.success('Cadena eliminada');
        },

        previewChain() {
            if (!currentChain) {
                Toast.error('Primero crea una cadena');
                return;
            }

            const chain = currentChain;
            const preview = `
                <div class="chain-preview" style="max-width: 800px; background: var(--bg-card); border: 2px solid #ec4899; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(236,72,153,0.2);">
                    <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 25px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 10px;">📖</div>
                        <div style="font-size: 28px; font-weight: 700; color: white; margin-bottom: 5px;">${chain.name || chain.id}</div>
                        <div style="font-size: 14px; color: rgba(255,255,255,0.9);">🔗 ${chain.nodes?.length || 0} nodos</div>
                    </div>
                    
                    <div style="padding: 25px;">
                        ${chain.description ? `
                            <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-darker); border-radius: 8px; color: var(--text-secondary); line-height: 1.6;">
                                ${chain.description}
                            </div>
                        ` : ''}
                        
                        ${chain.startNode ? `
                            <div style="margin-bottom: 20px; padding: 12px; background: rgba(236,72,153,0.1); border: 1px solid #ec4899; border-radius: 8px;">
                                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 5px;">🚀 Nodo Inicial</div>
                                <div style="font-size: 16px; font-weight: 600; color: #ec4899;">${chain.startNode}</div>
                            </div>
                        ` : ''}
                        
                        ${chain.nodes && chain.nodes.length > 0 ? `
                            <div>
                                <div style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 15px;">🔀 Flujo de Nodos</div>
                                <div style="position: relative;">
                                    ${chain.nodes.map((node, index) => `
                                        <div style="position: relative; margin-bottom: 20px;">
                                            <div style="background: var(--bg-darker); border: 2px solid ${this.getNodeColor(node.type)}; border-radius: 10px; padding: 15px;">
                                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                                    <div>
                                                        <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">${node.id}</div>
                                                        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 3px;">${this.getNodeTypeIcon(node.type)} ${node.type}</div>
                                                    </div>
                                                    <div style="background: ${this.getNodeColor(node.type)}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                                                        #${index + 1}
                                                    </div>
                                                </div>
                                                
                                                ${node.reference ? `
                                                    <div style="margin-bottom: 8px; padding: 8px; background: var(--bg-card); border-radius: 6px;">
                                                        <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 3px;">Referencia</div>
                                                        <div style="font-size: 12px; color: var(--text-primary); font-family: monospace;">${node.reference}</div>
                                                    </div>
                                                ` : ''}
                                                
                                                ${node.conditions ? `
                                                    <div style="margin-bottom: 8px; padding: 8px; background: rgba(245,158,11,0.1); border: 1px solid #f59e0b; border-radius: 6px;">
                                                        <div style="font-size: 10px; color: #f59e0b; margin-bottom: 3px;">⚙️ Condiciones</div>
                                                        <pre style="font-size: 10px; color: var(--text-secondary); margin: 0; white-space: pre-wrap; font-family: monospace;">${JSON.stringify(node.conditions, null, 2)}</pre>
                                                    </div>
                                                ` : ''}
                                                
                                                ${node.next ? `
                                                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);">
                                                        <div style="font-size: 11px; color: var(--text-secondary);">
                                                            ➡️ Siguiente: <span style="color: #ec4899; font-weight: 600;">${node.next}</span>
                                                        </div>
                                                    </div>
                                                ` : ''}
                                            </div>
                                            
                                            ${index < chain.nodes.length - 1 ? `
                                                <div style="width: 2px; height: 20px; background: linear-gradient(to bottom, ${this.getNodeColor(node.type)}, ${this.getNodeColor(chain.nodes[index + 1].type)}); margin: 0 auto;"></div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : '<div style="text-align: center; padding: 40px; color: var(--text-secondary); font-style: italic;">Sin nodos definidos</div>'}
                    </div>
                </div>
            `;

            const container = document.getElementById('previewContainer');
            if (container) {
                container.innerHTML = preview;
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.getElementById('preview-section').classList.add('active');
                Toast.info('Presiona ESC para volver');
                
                const onEsc = (e) => {
                    if (e.key === 'Escape') {
                        document.getElementById('chains-tab').classList.add('active');
                        document.getElementById('preview-section').classList.remove('active');
                        document.removeEventListener('keydown', onEsc);
                    }
                };
                document.addEventListener('keydown', onEsc);
            }
        },

        getNodeColor(type) {
            const colors = {
                dialogue: '#8b5cf6',
                combat: '#ef4444',
                shop: '#f59e0b',
                event: '#3b82f6',
                choice: '#10b981'
            };
            return colors[type] || '#6b7280';
        },

        getNodeTypeIcon(type) {
            const icons = {
                dialogue: '💬',
                combat: '⚔️',
                shop: '🏬',
                event: '⚡',
                choice: '🎯'
            };
            return icons[type] || '📍';
        },

        connectChainFormListeners() {
            const btnAddChain = document.getElementById('btnAddChain');
            const btnSaveChain = document.getElementById('btnSaveChain');
            const btnDeleteChain = document.getElementById('btnDeleteChain');
            const btnPreviewChain = document.getElementById('btnPreviewChain');
            const searchChains = document.getElementById('searchChains');
            const btnAddNode = document.getElementById('btnAddNode');

            // Evitar duplicados: clonar y reemplazar elementos
            if (btnAddChain) {
                const newBtn = btnAddChain.cloneNode(true);
                btnAddChain.parentNode.replaceChild(newBtn, btnAddChain);
                newBtn.addEventListener('click', () => this.addChain());
            }

            if (btnSaveChain) {
                const newBtn = btnSaveChain.cloneNode(true);
                btnSaveChain.parentNode.replaceChild(newBtn, btnSaveChain);
                newBtn.addEventListener('click', () => this.saveChain());
            }

            if (btnDeleteChain) {
                const newBtn = btnDeleteChain.cloneNode(true);
                btnDeleteChain.parentNode.replaceChild(newBtn, btnDeleteChain);
                newBtn.addEventListener('click', () => this.deleteChain());
            }

            if (btnPreviewChain) {
                const newBtn = btnPreviewChain.cloneNode(true);
                btnPreviewChain.parentNode.replaceChild(newBtn, btnPreviewChain);
                newBtn.addEventListener('click', () => this.previewChain());
            }

            if (searchChains) {
                searchChains.addEventListener('input', () => this.renderChains());
            }

            if (btnAddNode) {
                const newBtn = btnAddNode.cloneNode(true);
                btnAddNode.parentNode.replaceChild(newBtn, btnAddNode);
                newBtn.addEventListener('click', () => this.addNode());
            }
        }
    };
})();

window.ChainEditor = ChainEditor;

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Chains] Módulo de cadenas narrativas cargado');
});
