/**
 * editor-cards.js - Editor de cartas
 */

Object.assign(app, {
    
    renderCards() {
        const container = document.getElementById('cardsList');
        if (!container) return;

        const cards = this.data.cards || [];
        const search = document.getElementById('searchCards')?.value || '';
        const filtered = Search.filter(cards, search, ['name', 'id', 'type']);

        if (filtered.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No hay cartas</div>';
            return;
        }

        container.innerHTML = filtered.map(card => {
            const isActive = this.currentCard?.id === card.id;
            const icon = this.getCardIcon(card.type);
            return `
                <div class="item ${isActive ? 'active' : ''}" data-card-id="${card.id}">
                    <div class="option-title">${icon} ${card.name}</div>
                    <div class="option-text">${card.type} | ${card.rarity}</div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', () => {
                const cardId = item.dataset.cardId;
                const card = cards.find(c => c.id === cardId);
                if (card) this.editCard(card);
            });
        });
    },

    getCardIcon(type) {
        const icons = {
            'Crew': '👤',
            'Attack': '⚔️',
            'Skill': '✨',
            'Equipment': '🛡️',
            'Ship': '🚀'
        };
        return icons[type] || '🎴';
    },

    addCard() {
        const newCard = {
            id: `CARD_${Date.now()}`,
            name: 'Nueva Carta',
            type: 'Crew',
            cost: 0,
            price: 10,
            rarity: 'Common',
            faction: 'Neutral',
            description: '',
            image: '',
            stats: {},
            effects: []
        };

        if (!this.data.cards) this.data.cards = [];
        this.data.cards.push(newCard);
        this.currentCard = newCard;
        this.renderCards();
        this.editCard(newCard);
        Toast.info('Nueva carta creada');
    },

    editCard(card) {
        this.currentCard = card;
        this.renderCardForm(card);
        this.renderCards();
    },

    renderCardForm(card) {
        if (!card) {
            this.showEmptyStateCard();
            return;
        }

        this.hideEmptyStateCard();

        document.getElementById('cardId').value = card.id || '';
        document.getElementById('cardName').value = card.name || '';
        document.getElementById('cardType').value = card.type || 'Crew';
        document.getElementById('cardCost').value = card.cost || 0;
        document.getElementById('cardPrice').value = card.price || 0;
        document.getElementById('cardRarity').value = card.rarity || 'Common';
        document.getElementById('cardFaction').value = card.faction || 'Neutral';
        document.getElementById('cardDescription').value = card.description || '';
        document.getElementById('cardImage').value = card.image || '';

        // Stats específicos según tipo
        this.renderCardStats(card);
        
        // Efectos y sinergias
        this.renderCardEffects(card);
        this.renderCardSynergies(card);
    },

    renderCardStats(card) {
        const container = document.getElementById('cardStatsContainer');
        if (!container) return;

        let html = '';

        if (card.type === 'Crew') {
            html = `
                <div class="form-group">
                    <label>Rol</label>
                    <input type="text" id="cardRole" class="input-text" value="${card.stats?.role || ''}" placeholder="Ingeniero, Artillero, etc">
                </div>
                <div class="form-group">
                    <label>Rango</label>
                    <select id="cardRank" class="input-select">
                        <option value="Novato" ${card.stats?.rank === 'Novato' ? 'selected' : ''}>Novato</option>
                        <option value="Competente" ${card.stats?.rank === 'Competente' ? 'selected' : ''}>Competente</option>
                        <option value="Experimentado" ${card.stats?.rank === 'Experimentado' ? 'selected' : ''}>Experimentado</option>
                        <option value="Veterano" ${card.stats?.rank === 'Veterano' ? 'selected' : ''}>Veterano</option>
                    </select>
                </div>
            `;
        } else if (card.type === 'Attack') {
            html = `
                <div class="form-group">
                    <label>Daño Base</label>
                    <input type="number" id="cardDamage" class="input-number" value="${card.stats?.damage || 0}" min="0">
                </div>
                <div class="form-group">
                    <label>Tipo de Ataque</label>
                    <select id="cardAttackType" class="input-select">
                        <option value="physical" ${card.stats?.attackType === 'physical' ? 'selected' : ''}>Físico</option>
                        <option value="energy" ${card.stats?.attackType === 'energy' ? 'selected' : ''}>Energía</option>
                        <option value="special" ${card.stats?.attackType === 'special' ? 'selected' : ''}>Especial</option>
                    </select>
                </div>
            `;
        } else if (card.type === 'Skill') {
            html = `
                <div class="form-group">
                    <label>Efecto Principal</label>
                    <select id="cardEffect" class="input-select">
                        <option value="SHIELD" ${card.stats?.effect === 'SHIELD' ? 'selected' : ''}>Escudo</option>
                        <option value="REPAIR" ${card.stats?.effect === 'REPAIR' ? 'selected' : ''}>Reparación</option>
                        <option value="ENERGY" ${card.stats?.effect === 'ENERGY' ? 'selected' : ''}>Energía</option>
                        <option value="DRAW" ${card.stats?.effect === 'DRAW' ? 'selected' : ''}>Robar cartas</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Valor del Efecto</label>
                    <input type="number" id="cardEffectValue" class="input-number" value="${card.stats?.value || 0}" min="0">
                </div>
            `;
        } else if (card.type === 'Ship') {
            html = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Casco Máximo</label>
                        <input type="number" id="cardMaxHull" class="input-number" value="${card.stats?.maxHull || 30}" min="1">
                    </div>
                    <div class="form-group">
                        <label>Escudo Máximo</label>
                        <input type="number" id="cardMaxShield" class="input-number" value="${card.stats?.maxShield || 20}" min="0">
                    </div>
                </div>
                <div class="form-group">
                    <label>Combustible Máximo</label>
                    <input type="number" id="cardMaxFuel" class="input-number" value="${card.stats?.maxFuel || 10}" min="1">
                </div>
            `;
        }

        container.innerHTML = html;
    },

    saveCard() {
        const card = {
            id: document.getElementById('cardId').value,
            name: document.getElementById('cardName').value,
            type: document.getElementById('cardType').value,
            cost: parseInt(document.getElementById('cardCost').value) || 0,
            price: parseInt(document.getElementById('cardPrice').value) || 0,
            rarity: document.getElementById('cardRarity').value,
            faction: document.getElementById('cardFaction').value,
            description: document.getElementById('cardDescription').value,
            image: document.getElementById('cardImage').value,
            stats: this.getCardStats(),
            effects: this.currentCard.effects || [],
            synergies: this.currentCard.synergies || []
        };

        // Validación básica
        if (!card.name || !card.id) {
            Toast.error('Nombre e ID son requeridos');
            return;
        }

        const list = this.data.cards || [];
        const index = list.findIndex(c => c.id === this.currentCard?.id);

        if (index >= 0) {
            list[index] = card;
            Toast.success('Carta actualizada');
        } else {
            list.push(card);
            Toast.success('Carta guardada');
        }

        this.data.cards = list;
        this.currentCard = card;
        this.saveData();
        this.renderCards();
    },

    renderCardEffects(card) {
        const container = document.getElementById('cardEffectsContainer');
        if (!container) return;

        if (!card.effects) card.effects = [];

        if (card.effects.length === 0) {
            container.innerHTML = '<div style="padding: 12px; background: var(--bg-darker); border-radius: 4px; text-align: center; color: var(--text-secondary); font-size: 12px;">No hay efectos agregados</div>';
            return;
        }

        container.innerHTML = card.effects.map((effect, idx) => {
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
                this.removeCardEffect(idx);
            });
        });
    },

    renderCardSynergies(card) {
        const container = document.getElementById('cardSynergiesContainer');
        if (!container) return;

        if (!card.synergies) card.synergies = [];

        if (card.synergies.length === 0) {
            container.innerHTML = '<div style="padding: 12px; background: var(--bg-darker); border-radius: 4px; text-align: center; color: var(--text-secondary); font-size: 12px;">No hay sinergias agregadas</div>';
            return;
        }

        container.innerHTML = card.synergies.map((synergy, idx) => {
            const synergyInfo = EffectsCatalog.getEffectInfo(synergy.category, synergy.id);
            const displayName = synergyInfo ? synergyInfo.name : synergy.id;
            const paramsText = Object.keys(synergy.params || {}).length > 0 
                ? Object.entries(synergy.params).map(([k, v]) => `${k}=${v}`).join(', ') 
                : 'Sin parámetros';

            return `
                <div style="padding: 10px; background: var(--bg-darker); border: 1px solid var(--border); border-radius: 4px; display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 13px; color: var(--text-primary); margin-bottom: 3px;">${displayName}</div>
                        <div style="font-size: 11px; color: var(--text-secondary); font-family: monospace;">${synergy.category}:${synergy.id}</div>
                        <div style="font-size: 10px; color: var(--primary); margin-top: 4px;">${paramsText}</div>
                    </div>
                    <button class="btn btn-small btn-danger" data-synergy-idx="${idx}" style="padding: 4px 8px; font-size: 11px;">🗑️</button>
                </div>
            `;
        }).join('');

        // Conectar botones de eliminar
        container.querySelectorAll('[data-synergy-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.synergyIdx);
                this.removeCardSynergy(idx);
            });
        });
    },

    addCardEffect() {
        if (!this.currentCard) {
            Toast.error('Primero selecciona una carta');
            return;
        }

        // Abrir selector de efectos (todas las categorías permitidas)
        EffectSelector.open(['combat', 'ship', 'events', 'shop', 'synergy'], (effectData) => {
            if (!this.currentCard.effects) this.currentCard.effects = [];
            
            // Validar duplicados
            const exists = this.currentCard.effects.some(e => 
                e.category === effectData.category && e.id === effectData.id
            );
            
            if (exists) {
                Toast.warning('Este efecto ya está agregado');
                return;
            }
            
            this.currentCard.effects.push(effectData);
            this.renderCardEffects(this.currentCard);
        });
    },

    addCardSynergy() {
        if (!this.currentCard) {
            Toast.error('Primero selecciona una carta');
            return;
        }

        // Abrir selector solo para sinergias
        EffectSelector.open(['synergy'], (synergyData) => {
            if (!this.currentCard.synergies) this.currentCard.synergies = [];
            
            // Validar duplicados
            const exists = this.currentCard.synergies.some(s => 
                s.category === synergyData.category && s.id === synergyData.id
            );
            
            if (exists) {
                Toast.warning('Esta sinergia ya está agregada');
                return;
            }
            
            this.currentCard.synergies.push(synergyData);
            this.renderCardSynergies(this.currentCard);
        });
    },

    removeCardEffect(index) {
        if (!this.currentCard || !this.currentCard.effects) return;
        
        ModalSystem.confirm(
            '¿Eliminar efecto?',
            'Esta acción no se puede deshacer.',
            () => {
                this.currentCard.effects.splice(index, 1);
                this.renderCardEffects(this.currentCard);
                Toast.success('Efecto eliminado');
            }
        );
    },

    removeCardSynergy(index) {
        if (!this.currentCard || !this.currentCard.synergies) return;
        
        ModalSystem.confirm(
            '¿Eliminar sinergia?',
            'Esta acción no se puede deshacer.',
            () => {
                this.currentCard.synergies.splice(index, 1);
                this.renderCardSynergies(this.currentCard);
                Toast.success('Sinergia eliminada');
            }
        );
    },

    getCardStats() {
        const type = document.getElementById('cardType').value;
        const stats = {};

        if (type === 'Crew') {
            stats.role = document.getElementById('cardRole')?.value || '';
            stats.rank = document.getElementById('cardRank')?.value || 'Novato';
        } else if (type === 'Attack') {
            stats.damage = parseInt(document.getElementById('cardDamage')?.value) || 0;
            stats.attackType = document.getElementById('cardAttackType')?.value || 'physical';
        } else if (type === 'Skill') {
            stats.effect = document.getElementById('cardEffect')?.value || 'SHIELD';
            stats.value = parseInt(document.getElementById('cardEffectValue')?.value) || 0;
        } else if (type === 'Ship') {
            stats.maxHull = parseInt(document.getElementById('cardMaxHull')?.value) || 30;
            stats.maxShield = parseInt(document.getElementById('cardMaxShield')?.value) || 20;
            stats.maxFuel = parseInt(document.getElementById('cardMaxFuel')?.value) || 10;
        }

        return stats;
    },

    deleteCard() {
        if (!this.currentCard || !confirm('¿Eliminar esta carta?')) return;

        const idToDelete = this.currentCard.id;
        this.data.cards = this.data.cards.filter(c => c.id !== idToDelete);
        this.currentCard = null;
        
        // Limpiar formulario
        document.getElementById('cardId').value = '';
        document.getElementById('cardName').value = '';
        document.getElementById('cardDescription').value = '';
        document.getElementById('cardImage').value = '';
        document.getElementById('cardStatsContainer').innerHTML = '';
        
        this.showEmptyStateCard();
        this.renderCards();
        this.saveData();
        Toast.success('Carta eliminada');
    },

    showEmptyStateCard() {
        const editor = document.getElementById('cardEditor');
        const emptyState = document.getElementById('cardEmptyState');
        if (editor) editor.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
    },

    hideEmptyStateCard() {
        const editor = document.getElementById('cardEditor');
        const emptyState = document.getElementById('cardEmptyState');
        if (editor) editor.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
    },

    previewCard() {
        if (!this.currentCard) {
            Toast.error('Primero crea una carta');
            return;
        }

        const card = this.currentCard;
        const rarityColors = {
            'Common': '#9ca3af',
            'Uncommon': '#22c55e',
            'Rare': '#3b82f6',
            'Epic': '#a855f7',
            'Legendary': '#f59e0b'
        };
        
        const preview = `
            <div class="card-preview" style="max-width: 400px; background: var(--bg-card); border: 2px solid ${rarityColors[card.rarity] || '#3b82f6'}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                ${card.image ? `
                    <div style="width: 100%; height: 250px; background: var(--bg-darker); display: flex; align-items: center; justify-content: center;">
                        <img src="${card.image}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=padding:20px;color:var(--text-secondary)>📷 Imagen no disponible</div>'">
                    </div>
                ` : `<div style="width: 100%; height: 250px; background: var(--bg-darker); display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">📷 Sin imagen</div>`}
                
                <div style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <div>
                            <div style="font-size: 20px; font-weight: 600; color: ${rarityColors[card.rarity]}; margin-bottom: 5px;">${card.name}</div>
                            <div style="font-size: 11px; color: var(--text-secondary);">${this.getCardIcon(card.type)} ${card.type} | ${card.rarity}</div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <div style="background: rgba(0,217,255,0.2); padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                                ⚡ ${card.cost}
                            </div>
                            <div style="background: rgba(255,215,0,0.2); padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                                💰 ${card.price}
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px; padding: 10px; background: var(--bg-darker); border-radius: 4px; font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
                        ${card.description || '<em>Sin descripción</em>'}
                    </div>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
                        <span style="background: rgba(0,217,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 11px;">${card.faction}</span>
                        ${card.stats ? Object.entries(card.stats).map(([key, val]) => 
                            `<span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 11px;">${key}: ${val}</span>`
                        ).join('') : ''}
                    </div>
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
                    document.getElementById('cards-tab').classList.add('active');
                    document.getElementById('preview-section').classList.remove('active');
                    document.removeEventListener('keydown', onEsc);
                }
            };
            document.addEventListener('keydown', onEsc);
        }
    },

    connectCardFormListeners() {
        const btnAddCard = document.getElementById('btnAddCard');
        const btnSaveCard = document.getElementById('btnSaveCard');
        const btnDeleteCard = document.getElementById('btnDeleteCard');
        const btnPreviewCard = document.getElementById('btnPreviewCard');
        const btnAddCardEffect = document.getElementById('btnAddCardEffect');
        const btnAddCardSynergy = document.getElementById('btnAddCardSynergy');
        const searchCards = document.getElementById('searchCards');
        const cardType = document.getElementById('cardType');

        if (btnAddCard) {
            btnAddCard.removeEventListener('click', this.addCard);
            btnAddCard.addEventListener('click', () => this.addCard());
        }

        if (btnSaveCard) {
            btnSaveCard.addEventListener('click', () => this.saveCard());
        }
        // Marcar cambios
        document.querySelectorAll('#cardEditor input, #cardEditor textarea, #cardEditor select')
            .forEach(el => el.addEventListener('input', () => app.markAsUnsaved()));

        if (btnDeleteCard) {
            btnDeleteCard.addEventListener('click', () => this.deleteCard());
        }

        if (btnPreviewCard) {
            btnPreviewCard.addEventListener('click', () => this.previewCard());
        }

        if (btnAddCardEffect) {
            btnAddCardEffect.addEventListener('click', () => this.addCardEffect());
        }

        if (btnAddCardSynergy) {
            btnAddCardSynergy.addEventListener('click', () => this.addCardSynergy());
        }

        if (searchCards) {
            searchCards.addEventListener('input', () => this.renderCards());
        }

        if (cardType) {
            cardType.addEventListener('change', () => {
                if (this.currentCard) {
                    this.currentCard.type = cardType.value;
                    this.renderCardStats(this.currentCard);
                }
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Cards] Módulo de cartas cargado');
});
