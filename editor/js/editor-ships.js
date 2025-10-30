/**
 * editor-ships.js - Editor de naves
 */

Object.assign(app, {
    
    renderShips() {
        const container = document.getElementById('shipsList');
        if (!container) return;

        const ships = this.data.ships || [];
        const search = document.getElementById('searchShips')?.value || '';
        const filtered = Search.filter(ships, search, ['name', 'id']);

        if (filtered.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No hay naves</div>';
            return;
        }

        container.innerHTML = filtered.map(ship => {
            const isActive = this.currentShip?.id === ship.id;
            return `
                <div class="item ${isActive ? 'active' : ''}" data-ship-id="${ship.id}">
                    <div class="option-title">🚀 ${ship.name}</div>
                    <div class="option-text">HP: ${ship.maxHull} | Escudo: ${ship.maxShields}</div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', () => {
                const shipId = item.dataset.shipId;
                const ship = ships.find(s => s.id === shipId);
                if (ship) this.editShip(ship);
            });
        });
    },

    addShip() {
        const newShip = {
            id: `SHIP_${Date.now()}`,
            name: 'Nueva Nave',
            description: '',
            image: '',
            availability: 'always',
            maxHull: 30,
            maxFuel: 10,
            maxShields: 20,
            specialAbility: {
                name: '',
                description: '',
                effect: ''
            },
            effects: []
        };

        if (!this.data.ships) this.data.ships = [];
        this.data.ships.push(newShip);
        this.currentShip = newShip;
        this.renderShips();
        this.editShip(newShip);
        Toast.info('Nueva nave creada');
    },

    editShip(ship) {
        this.currentShip = ship;
        this.renderShipForm(ship);
        this.renderShips();

        // Marcar cambios
        document.querySelectorAll('#shipEditor input, #shipEditor textarea, #shipEditor select')
            .forEach(el => el.addEventListener('input', () => app.markAsUnsaved()));
    },

    renderShipForm(ship) {
        if (!ship) {
            this.showEmptyStateShip();
            return;
        }

        this.hideEmptyStateShip();

        document.getElementById('shipId').value = ship.id || '';
        document.getElementById('shipName').value = ship.name || '';
        document.getElementById('shipDescription').value = ship.description || '';
        document.getElementById('shipImage').value = ship.image || '';
        document.getElementById('shipAvailability').value = ship.availability || 'always';
        document.getElementById('shipMaxHull').value = ship.maxHull || 30;
        document.getElementById('shipMaxFuel').value = ship.maxFuel || 10;
        document.getElementById('shipMaxShields').value = ship.maxShields || 20;
        document.getElementById('shipAbilityName').value = ship.specialAbility?.name || '';
        document.getElementById('shipAbilityDesc').value = ship.specialAbility?.description || '';
        document.getElementById('shipAbilityEffect').value = ship.specialAbility?.effect || '';
        
        // Efectos
        this.renderShipEffects(ship);
    },
    
    renderShipEffects(ship) {
        const container = document.getElementById('shipEffectsContainer');
        if (!container) return;

        if (!ship.effects) ship.effects = [];

        if (ship.effects.length === 0) {
            container.innerHTML = '<div style="padding: 12px; background: var(--bg-darker); border-radius: 4px; text-align: center; color: var(--text-secondary); font-size: 12px;">No hay efectos agregados</div>';
            return;
        }

        container.innerHTML = ship.effects.map((effect, idx) => {
            const effectInfo = EffectsCatalog.getEffectInfo(effect.category, effect.id);
            const displayName = effectInfo ? effectInfo.name : effect.id;
            const paramsText = Object.keys(effect.params || {}).length > 0 
                ? Object.entries(effect.params).map(([k, v]) => `${k}=${v}`).join(', ') 
                : 'Sin parámetros';

            return `
                <div style="padding: 10px; background: var(--bg-darker); border: 1px solid var(--border); border-radius: 4px; display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 13px; color: var(--text-primary); margin-bottom: 3px;">${displayName}</div>
                        <div style="font-size: 11px; color: var(--text-secondary); font-family: monospace;">${effect.category}:${effect.id}</div>
                        <div style="font-size: 10px; color: var(--primary); margin-top: 4px;">${paramsText}</div>
                    </div>
                    <button class="btn btn-small btn-danger" data-effect-idx="${idx}" style="padding: 4px 8px; font-size: 11px;">🗑️</button>
                </div>
            `;
        }).join('');

        // Conectar botones de eliminar
        container.querySelectorAll('[data-effect-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.effectIdx);
                this.removeShipEffect(idx);
            });
        });
    },
    
    addShipEffect() {
        if (!this.currentShip) {
            Toast.error('Primero selecciona una nave');
            return;
        }

        // Abrir selector de efectos (solo ship y combat)
        EffectSelector.open(['ship', 'combat'], (effectData) => {
            if (!this.currentShip.effects) this.currentShip.effects = [];
            
            // Validar duplicados
            const exists = this.currentShip.effects.some(e => 
                e.category === effectData.category && e.id === effectData.id
            );
            
            if (exists) {
                Toast.warning('Este efecto ya está agregado');
                return;
            }
            
            this.currentShip.effects.push(effectData);
            this.renderShipEffects(this.currentShip);
        });
    },
    
    removeShipEffect(index) {
        if (!this.currentShip || !this.currentShip.effects) return;
        
        ModalSystem.confirm(
            '¿Eliminar efecto?',
            'Esta acción no se puede deshacer.',
            () => {
                this.currentShip.effects.splice(index, 1);
                this.renderShipEffects(this.currentShip);
                Toast.success('Efecto eliminado');
            }
        );
    },

    saveShip() {
        const ship = {
            id: document.getElementById('shipId').value,
            name: document.getElementById('shipName').value,
            description: document.getElementById('shipDescription').value,
            image: document.getElementById('shipImage').value,
            availability: document.getElementById('shipAvailability').value,
            maxHull: parseInt(document.getElementById('shipMaxHull').value) || 30,
            maxFuel: parseInt(document.getElementById('shipMaxFuel').value) || 10,
            maxShields: parseInt(document.getElementById('shipMaxShields').value) || 20,
            specialAbility: {
                name: document.getElementById('shipAbilityName').value,
                description: document.getElementById('shipAbilityDesc').value,
                effect: document.getElementById('shipAbilityEffect').value
            },
            effects: this.currentShip.effects || []
        };

        if (!ship.name || !ship.id) {
            Toast.error('Nombre e ID son requeridos');
            return;
        }

        const list = this.data.ships || [];
        const index = list.findIndex(s => s.id === this.currentShip?.id);

        if (index >= 0) {
            list[index] = ship;
            Toast.success('Nave actualizada');
        } else {
            list.push(ship);
            Toast.success('Nave guardada');
        }

        this.data.ships = list;
        this.currentShip = ship;
        this.saveData();
        this.renderShips();
    },

    deleteShip() {
        if (!this.currentShip || !confirm('¿Eliminar esta nave?')) return;

        const idToDelete = this.currentShip.id;
        this.data.ships = this.data.ships.filter(s => s.id !== idToDelete);
        this.currentShip = null;
        
        // Limpiar formulario
        document.getElementById('shipId').value = '';
        document.getElementById('shipName').value = '';
        document.getElementById('shipDescription').value = '';
        document.getElementById('shipImage').value = '';
        document.getElementById('shipMaxHull').value = '30';
        document.getElementById('shipMaxShields').value = '20';
        document.getElementById('shipMaxFuel').value = '10';
        document.getElementById('shipAbilityName').value = '';
        document.getElementById('shipAbilityDesc').value = '';
        document.getElementById('shipAbilityEffect').value = '';
        
        this.showEmptyStateShip();
        this.renderShips();
        this.saveData();
        Toast.success('Nave eliminada');
    },

    showEmptyStateShip() {
        const editor = document.getElementById('shipEditor');
        const emptyState = document.getElementById('shipEmptyState');
        if (editor) editor.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
    },

    hideEmptyStateShip() {
        const editor = document.getElementById('shipEditor');
        const emptyState = document.getElementById('shipEmptyState');
        if (editor) editor.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
    },

    previewShip() {
        if (!this.currentShip) {
            Toast.error('Primero crea una nave');
            return;
        }

        const ship = this.currentShip;
        const preview = `
            <div class="ship-preview" style="max-width: 600px; background: var(--bg-card); border: 2px solid var(--primary); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,217,255,0.2);">
                ${ship.image ? `
                    <div style="width: 100%; height: 300px; background: var(--bg-darker); position: relative;">
                        <img src="${ship.image}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=padding:20px;text-align:center;color:var(--text-secondary)>🚀 Imagen no disponible</div>'">
                        <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); padding: 10px 15px; border-radius: 8px;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${ship.name}</div>
                        </div>
                    </div>
                ` : `<div style="width: 100%; height: 300px; background: linear-gradient(135deg, var(--bg-darker) 0%, var(--bg-dark) 100%); display: flex; align-items: center; justify-content: center; flex-direction: column;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🚀</div>
                    <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${ship.name}</div>
                </div>`}
                
                <div style="padding: 25px;">
                    <div style="margin-bottom: 20px; color: var(--text-secondary); line-height: 1.6;">
                        ${ship.description || '<em>Sin descripción</em>'}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div style="background: rgba(220, 38, 38, 0.2); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${ship.maxHull}</div>
                            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 5px;">❤️ CASCO</div>
                        </div>
                        <div style="background: rgba(59, 130, 246, 0.2); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${ship.maxShields}</div>
                            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 5px;">🛡️ ESCUDO</div>
                        </div>
                        <div style="background: rgba(251, 191, 36, 0.2); padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #fbbf24;">${ship.maxFuel}</div>
                            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 5px;">⛽ COMBUSTIBLE</div>
                        </div>
                    </div>
                    
                    ${ship.specialAbility?.name ? `
                        <div style="background: rgba(0,217,255,0.1); border: 1px solid var(--primary); border-radius: 8px; padding: 15px;">
                            <div style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">
                                ✨ ${ship.specialAbility.name}
                            </div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">
                                ${ship.specialAbility.description || ''}
                            </div>
                            ${ship.specialAbility.effect ? `
                                <div style="font-size: 11px; font-family: monospace; color: var(--primary); opacity: 0.7;">
                                    ${ship.specialAbility.effect}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
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
                    document.getElementById('ships-tab').classList.add('active');
                    document.getElementById('preview-section').classList.remove('active');
                    document.removeEventListener('keydown', onEsc);
                }
            };
            document.addEventListener('keydown', onEsc);
        }
    },

    connectShipFormListeners() {
        const btnAddShip = document.getElementById('btnAddShip');
        const btnSaveShip = document.getElementById('btnSaveShip');
        const btnDeleteShip = document.getElementById('btnDeleteShip');
        const btnPreviewShip = document.getElementById('btnPreviewShip');
        const btnAddShipEffect = document.getElementById('btnAddShipEffect');
        const searchShips = document.getElementById('searchShips');

        // Evitar duplicados: clonar y reemplazar elementos
        if (btnAddShip) {
            const newBtn = btnAddShip.cloneNode(true);
            btnAddShip.parentNode.replaceChild(newBtn, btnAddShip);
            newBtn.addEventListener('click', () => this.addShip());
        }

        if (btnSaveShip) {
            const newBtn = btnSaveShip.cloneNode(true);
            btnSaveShip.parentNode.replaceChild(newBtn, btnSaveShip);
            newBtn.addEventListener('click', () => this.saveShip());
        }

        if (btnDeleteShip) {
            const newBtn = btnDeleteShip.cloneNode(true);
            btnDeleteShip.parentNode.replaceChild(newBtn, btnDeleteShip);
            newBtn.addEventListener('click', () => this.deleteShip());
        }

        if (btnPreviewShip) {
            const newBtn = btnPreviewShip.cloneNode(true);
            btnPreviewShip.parentNode.replaceChild(newBtn, btnPreviewShip);
            newBtn.addEventListener('click', () => this.previewShip());
        }
        
        if (btnAddShipEffect) {
            const newBtn = btnAddShipEffect.cloneNode(true);
            btnAddShipEffect.parentNode.replaceChild(newBtn, btnAddShipEffect);
            newBtn.addEventListener('click', () => this.addShipEffect());
        }

        if (searchShips) {
            searchShips.addEventListener('input', () => this.renderShips());
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Ships] Módulo de naves cargado');
});
