/**
 * effect-selector.js - Selector de efectos para cartas y naves
 */

const EffectSelector = {
    currentCallback: null,
    currentCategories: [],

    open(allowedCategories, onSelectCallback) {
        this.currentCategories = allowedCategories || ['combat', 'ship', 'events', 'shop', 'synergy'];
        this.currentCallback = onSelectCallback;
        
        this.renderModal();
    },

    renderModal() {
        // Crear modal dinámicamente
        const existingModal = document.getElementById('effectSelectorModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'effectSelectorModal';
        modal.className = 'modal';
        modal.style.display = 'block';

        const categories = EffectsCatalog.getCategories()
            .filter(cat => this.currentCategories.includes(cat.id));

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column;">
                <div class="modal-header">
                    <h3>⚡ Seleccionar Efecto</h3>
                    <button class="modal-close" id="closeEffectSelector">&times;</button>
                </div>
                <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 20px;">
                    <input type="text" id="effectSearch" placeholder="🔍 Buscar efecto..." 
                           class="input-text" style="width: 100%; margin-bottom: 15px;">
                    
                    <div id="effectCategoriesContainer"></div>
                </div>
                <div class="modal-footer">
                    <button id="btnCancelEffectSelector" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'effectSelectorOverlay';
        overlay.style.display = 'block';

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        this.renderCategories(categories);
        this.connectListeners();
    },

    renderCategories(categories) {
        const container = document.getElementById('effectCategoriesContainer');
        if (!container) return;

        container.innerHTML = categories.map(category => {
            const effects = Object.entries(category.effects);
            
            return `
                <div class="effect-category" style="margin-bottom: 20px;">
                    <h4 style="color: var(--primary); margin-bottom: 10px; font-size: 14px;">${category.name}</h4>
                    <div style="display: grid; gap: 8px;">
                        ${effects.map(([id, effect]) => `
                            <div class="effect-item" data-category="${category.id}" data-effect-id="${id}"
                                 style="padding: 12px; background: var(--bg-darker); border: 2px solid var(--border); 
                                        border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                                 onmouseover="this.style.borderColor='var(--primary)'; this.style.background='var(--bg-card)';"
                                 onmouseout="this.style.borderColor='var(--border)'; this.style.background='var(--bg-darker)';">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: 13px;">
                                            ${effect.name}
                                        </div>
                                        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">
                                            ${effect.description}
                                        </div>
                                        ${effect.params.length > 0 ? `
                                            <div style="font-size: 10px; color: var(--primary); font-family: monospace;">
                                                Parámetros: ${effect.params.join(', ')}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div style="font-size: 10px; padding: 3px 8px; background: var(--primary); 
                                               color: white; border-radius: 4px; font-family: monospace; margin-left: 10px;">
                                        ${id}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Agregar listeners a los items
        container.querySelectorAll('.effect-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                const effectId = item.dataset.effectId;
                this.selectEffect(category, effectId);
            });
        });
    },

    connectListeners() {
        const searchInput = document.getElementById('effectSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterEffects(e.target.value);
            });
        }

        const btnCancel = document.getElementById('btnCancelEffectSelector');
        if (btnCancel) {
            btnCancel.addEventListener('click', () => this.close());
        }

        const btnClose = document.getElementById('closeEffectSelector');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.close());
        }

        const overlay = document.getElementById('effectSelectorOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        // ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('effectSelectorModal')) {
                this.close();
            }
        });
    },

    filterEffects(query) {
        if (!query.trim()) {
            // Mostrar todas las categorías
            const categories = EffectsCatalog.getCategories()
                .filter(cat => this.currentCategories.includes(cat.id));
            this.renderCategories(categories);
            return;
        }

        const results = EffectsCatalog.searchEffects(query)
            .filter(effect => this.currentCategories.includes(effect.category));
        
        const container = document.getElementById('effectCategoriesContainer');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No se encontraron efectos</div>';
            return;
        }

        // Agrupar por categoría
        const grouped = {};
        results.forEach(effect => {
            if (!grouped[effect.categoryName]) {
                grouped[effect.categoryName] = [];
            }
            grouped[effect.categoryName].push(effect);
        });

        container.innerHTML = Object.entries(grouped).map(([catName, effects]) => `
            <div class="effect-category" style="margin-bottom: 20px;">
                <h4 style="color: var(--primary); margin-bottom: 10px; font-size: 14px;">${catName}</h4>
                <div style="display: grid; gap: 8px;">
                    ${effects.map(effect => `
                        <div class="effect-item" data-category="${effect.category}" data-effect-id="${effect.id}"
                             style="padding: 12px; background: var(--bg-darker); border: 2px solid var(--border); 
                                    border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                             onmouseover="this.style.borderColor='var(--primary)'; this.style.background='var(--bg-card)';"
                             onmouseout="this.style.borderColor='var(--border)'; this.style.background='var(--bg-darker)';">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: 13px;">
                                        ${effect.name}
                                    </div>
                                    <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">
                                        ${effect.description}
                                    </div>
                                    ${effect.params.length > 0 ? `
                                        <div style="font-size: 10px; color: var(--primary); font-family: monospace;">
                                            Parámetros: ${effect.params.join(', ')}
                                        </div>
                                    ` : ''}
                                </div>
                                <div style="font-size: 10px; padding: 3px 8px; background: var(--primary); 
                                           color: white; border-radius: 4px; font-family: monospace; margin-left: 10px;">
                                    ${effect.id}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Re-conectar listeners
        container.querySelectorAll('.effect-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                const effectId = item.dataset.effectId;
                this.selectEffect(category, effectId);
            });
        });
    },

    selectEffect(category, effectId) {
        const effectInfo = EffectsCatalog.getEffectInfo(category, effectId);
        
        if (!effectInfo) return;

        // Validar que la categoría esté permitida
        if (!this.currentCategories.includes(category)) {
            Toast.error('Esta categoría no está permitida');
            return;
        }

        // Si el efecto tiene parámetros, pedir valores
        if (effectInfo.params.length > 0) {
            this.promptForParams(category, effectId, effectInfo);
        } else {
            // Sin parámetros, devolver directamente
            if (this.currentCallback) {
                this.currentCallback({
                    id: effectId,
                    category,
                    params: {}
                });
            }
            this.close();
            Toast.success(`Efecto "${effectInfo.name}" agregado`);
        }
    },

    promptForParams(category, effectId, effectInfo) {
        const fields = effectInfo.params.map(param => ({
            name: param,
            label: this.getParamLabel(param),
            type: this.getParamType(param),
            placeholder: this.getParamPlaceholder(param),
            defaultValue: this.getParamDefault(param),
            min: this.getParamType(param) === 'number' ? 0 : undefined
        }));

        ModalSystem.multiPrompt(
            `Configurar: ${effectInfo.name}`,
            fields,
            (values) => {
                if (this.currentCallback) {
                    this.currentCallback({
                        id: effectId,
                        category,
                        params: values
                    });
                }
                this.close();
                Toast.success(`Efecto "${effectInfo.name}" agregado`);
            },
            () => {
                // Si cancela, no cerrar el selector para que pueda elegir otro
            }
        );
    },

    getParamLabel(param) {
        const labels = {
            amount: 'Cantidad',
            turns: 'Turnos',
            percent: 'Porcentaje (%)',
            times: 'Veces',
            cardId: 'ID de Carta',
            crewId: 'ID de Tripulante',
            faction: 'Facción',
            flagName: 'Nombre de Flag',
            areaId: 'ID de Área',
            combatId: 'ID de Combate',
            shopId: 'ID de Tienda',
            dialogueId: 'ID de Diálogo',
            initialAmount: 'Cantidad Inicial',
            bonusType: 'Tipo de Bonus',
            role: 'Rol',
            requiredCount: 'Cantidad Requerida',
            setId: 'ID de Set',
            itemCount: 'Cantidad de Items',
            maxCost: 'Costo Máximo',
            minCost: 'Costo Mínimo',
            hpThreshold: 'Umbral de HP (%)',
            amountPerTurn: 'Cantidad por Turno'
        };
        return labels[param] || param;
    },

    getParamType(param) {
        const numberParams = ['amount', 'turns', 'percent', 'times', 'initialAmount', 'requiredCount', 'itemCount', 'maxCost', 'minCost', 'hpThreshold', 'amountPerTurn'];
        return numberParams.includes(param) ? 'number' : 'text';
    },

    getParamPlaceholder(param) {
        const placeholders = {
            cardId: 'CARD_001',
            crewId: 'CREW_ENGINEER_01',
            faction: 'Academia, Mercenarios, etc',
            flagName: 'mission_complete',
            areaId: 'AREA_NEBULA',
            combatId: 'COMBAT_BOSS_01',
            shopId: 'SHOP_STATION_01',
            dialogueId: 'dialogue_001',
            bonusType: 'damage, shield, energy, etc',
            role: 'Ingeniero, Piloto, Artillero, etc',
            setId: 'SET_ARMOR_01'
        };
        return placeholders[param] || '';
    },

    getParamDefault(param) {
        const defaults = {
            amount: '10',
            turns: '1',
            percent: '25',
            times: '2',
            initialAmount: '5',
            requiredCount: '3',
            itemCount: '3',
            maxCost: '2',
            minCost: '3',
            hpThreshold: '50',
            amountPerTurn: '5'
        };
        return defaults[param] || '';
    },

    close() {
        const modal = document.getElementById('effectSelectorModal');
        const overlay = document.getElementById('effectSelectorOverlay');
        
        if (modal) document.body.removeChild(modal);
        if (overlay) document.body.removeChild(overlay);
        
        this.currentCallback = null;
        this.currentCategories = [];
    }
};

window.EffectSelector = EffectSelector;
