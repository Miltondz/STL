/**
 * editor-shops.js - Editor de tiendas
 */

Object.assign(app, {
    
    renderShops() {
        const container = document.getElementById('shopsList');
        if (!container) return;

        const shops = this.data.shops || [];
        const search = document.getElementById('searchShops')?.value || '';
        const filtered = Search.filter(shops, search, ['name', 'id', 'owner']);

        if (filtered.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No hay tiendas</div>';
            return;
        }

        container.innerHTML = filtered.map(shop => {
            const isActive = this.currentShop?.id === shop.id;
            return `
                <div class="item ${isActive ? 'active' : ''}" data-shop-id="${shop.id}">
                    <div class="option-title">🏬 ${shop.name}</div>
                    <div class="option-text">${shop.owner} | ${shop.inventory?.length || 0} items</div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', () => {
                const shopId = item.dataset.shopId;
                const shop = shops.find(s => s.id === shopId);
                if (shop) this.editShop(shop);
            });
        });
    },

    addShop() {
        const newShop = {
            id: `SHOP_${Date.now()}`,
            name: 'Nueva Tienda',
            description: '',
            owner: 'Vendedor',
            location: 'Estación Espacial',
            traits: [],
            inventory: [],
            services: {
                removeCard: true,
                repairHull: true,
                upgradeCard: false
            }
        };

        if (!this.data.shops) this.data.shops = [];
        this.data.shops.push(newShop);
        this.currentShop = newShop;
        this.renderShops();
        this.editShop(newShop);
        Toast.info('Nueva tienda creada');
    },

    editShop(shop) {
        this.currentShop = shop;
        this.renderShopForm(shop);
        this.renderShops();
    },

    renderShopForm(shop) {
        if (!shop) {
            this.showEmptyStateShop();
            return;
        }

        this.hideEmptyStateShop();

        document.getElementById('shopId').value = shop.id || '';
        document.getElementById('shopName').value = shop.name || '';
        document.getElementById('shopDescription').value = shop.description || '';
        document.getElementById('shopOwner').value = shop.owner || '';
        document.getElementById('shopLocation').value = shop.location || '';
        
        // Services
        document.getElementById('shopServiceRemove').checked = shop.services?.removeCard || false;
        document.getElementById('shopServiceRepair').checked = shop.services?.repairHull || false;
        document.getElementById('shopServiceUpgrade').checked = shop.services?.upgradeCard || false;

        this.renderShopInventory(shop.inventory || []);
        this.renderShopTraits(shop.traits || []);
    },

    renderShopInventory(inventory) {
        const container = document.getElementById('shopInventoryContainer');
        if (!container) return;

        if (inventory.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Sin items en inventario</p>';
            return;
        }

        container.innerHTML = inventory.map((item, i) => `
            <div class="option-card">
                <div class="option-title">Carta: ${item.cardId}</div>
                <div class="option-text">Cantidad: ${item.quantity}</div>
                <button class="btn btn-small btn-danger" data-remove-item="${i}">🗑️</button>
            </div>
        `).join('');

        container.querySelectorAll('[data-remove-item]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.removeItem);
                if (this.currentShop) {
                    this.currentShop.inventory = ArrayUtils.remove(this.currentShop.inventory, index);
                    this.renderShopInventory(this.currentShop.inventory);
                }
            });
        });
    },

    addInventoryItem() {
        const cardId = prompt('ID de la carta:');
        const quantity = parseInt(prompt('Cantidad:', '1'));
        
        if (!cardId) return;

        if (!this.currentShop.inventory) this.currentShop.inventory = [];
        this.currentShop.inventory.push({ cardId, quantity: quantity || 1 });
        this.renderShopInventory(this.currentShop.inventory);
        Toast.success('Item agregado al inventario');
    },

    renderShopTraits(traits) {
        const container = document.getElementById('shopTraitsContainer');
        if (!container) return;

        if (traits.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Sin traits</p>';
            return;
        }

        container.innerHTML = traits.map((trait, i) => `
            <div class="option-card">
                <div class="option-title">${trait.name}</div>
                <div class="option-text">${trait.description || 'Sin descripción'}</div>
                <button class="btn btn-small btn-danger" data-remove-trait="${i}">🗑️</button>
            </div>
        `).join('');

        container.querySelectorAll('[data-remove-trait]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.removeTrait);
                if (this.currentShop) {
                    this.currentShop.traits = ArrayUtils.remove(this.currentShop.traits, index);
                    this.renderShopTraits(this.currentShop.traits);
                }
            });
        });
    },

    addShopTrait() {
        const name = prompt('Nombre del trait (ej: Generoso, Avaro):');
        const description = prompt('Descripción:');
        const modifier = parseFloat(prompt('Modificador de precio (ej: -0.3 para descuento 30%):', '0'));
        
        if (!name) return;

        if (!this.currentShop.traits) this.currentShop.traits = [];
        this.currentShop.traits.push({
            id: `trait_${Date.now()}`,
            name,
            description: description || '',
            priceModifier: modifier
        });
        this.renderShopTraits(this.currentShop.traits);
        Toast.success('Trait agregado');
    },

    saveShop() {
        const shop = {
            id: document.getElementById('shopId').value,
            name: document.getElementById('shopName').value,
            description: document.getElementById('shopDescription').value,
            owner: document.getElementById('shopOwner').value,
            location: document.getElementById('shopLocation').value,
            traits: this.currentShop?.traits || [],
            inventory: this.currentShop?.inventory || [],
            services: {
                removeCard: document.getElementById('shopServiceRemove').checked,
                repairHull: document.getElementById('shopServiceRepair').checked,
                upgradeCard: document.getElementById('shopServiceUpgrade').checked
            }
        };

        if (!shop.name || !shop.id) {
            Toast.error('Nombre e ID son requeridos');
            return;
        }

        const list = this.data.shops || [];
        const index = list.findIndex(s => s.id === this.currentShop?.id);

        if (index >= 0) {
            list[index] = shop;
            Toast.success('Tienda actualizada');
        } else {
            list.push(shop);
            Toast.success('Tienda guardada');
        }

        this.data.shops = list;
        this.currentShop = shop;
        this.saveData();
        this.renderShops();
    },

    deleteShop() {
        if (!this.currentShop || !confirm('¿Eliminar esta tienda?')) return;

        const idToDelete = this.currentShop.id;
        this.data.shops = this.data.shops.filter(s => s.id !== idToDelete);
        this.currentShop = null;
        
        // Limpiar formulario
        document.getElementById('shopId').value = '';
        document.getElementById('shopName').value = '';
        document.getElementById('shopDescription').value = '';
        document.getElementById('shopOwner').value = '';
        document.getElementById('shopLocation').value = '';
        document.getElementById('shopServiceRemove').checked = false;
        document.getElementById('shopServiceRepair').checked = false;
        document.getElementById('shopServiceUpgrade').checked = false;
        document.getElementById('shopTraitsContainer').innerHTML = '';
        document.getElementById('shopInventoryContainer').innerHTML = '';
        
        this.showEmptyStateShop();
        this.renderShops();
        this.saveData();
        Toast.success('Tienda eliminada');
    },

    showEmptyStateShop() {
        const editor = document.getElementById('shopEditor');
        const emptyState = document.getElementById('shopEmptyState');
        if (editor) editor.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
    },

    hideEmptyStateShop() {
        const editor = document.getElementById('shopEditor');
        const emptyState = document.getElementById('shopEmptyState');
        if (editor) editor.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
    },

    previewShop() {
        if (!this.currentShop) {
            Toast.error('Primero crea una tienda');
            return;
        }

        const shop = this.currentShop;
        const preview = `
            <div class="shop-preview" style="max-width: 650px; background: var(--bg-card); border: 2px solid #f59e0b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(245,158,11,0.2);">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 25px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🏬</div>
                    <div style="font-size: 28px; font-weight: 700; color: white; margin-bottom: 5px;">${shop.name}</div>
                    <div style="font-size: 14px; color: rgba(255,255,255,0.9);">👤 ${shop.owner}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 5px;">📍 ${shop.location}</div>
                </div>
                
                <div style="padding: 25px;">
                    ${shop.description ? `
                        <div style="margin-bottom: 20px; padding: 15px; background: var(--bg-darker); border-radius: 8px; color: var(--text-secondary); line-height: 1.6;">
                            ${shop.description}
                        </div>
                    ` : ''}
                    
                    ${shop.traits && shop.traits.length > 0 ? `
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 10px;">🎯 Rasgos de la Tienda</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                ${shop.traits.map(trait => `
                                    <div style="background: rgba(245,158,11,0.2); border: 1px solid #f59e0b; padding: 8px 12px; border-radius: 6px;">
                                        <div style="font-size: 12px; font-weight: 600; color: #f59e0b;">${trait.name}</div>
                                        <div style="font-size: 10px; color: var(--text-secondary); margin-top: 3px;">${trait.description || ''}</div>
                                        ${trait.priceModifier ? `<div style="font-size: 10px; color: ${trait.priceModifier < 0 ? '#22c55e' : '#ef4444'}; margin-top: 2px;">${trait.priceModifier > 0 ? '+' : ''}${(trait.priceModifier * 100).toFixed(0)}%</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 10px;">💼 Servicios Disponibles</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                            <div style="background: ${shop.services?.removeCard ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)'}; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 20px; margin-bottom: 5px;">${shop.services?.removeCard ? '✅' : '❌'}</div>
                                <div style="font-size: 11px; color: var(--text-secondary);">Remover Carta</div>
                            </div>
                            <div style="background: ${shop.services?.repairHull ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)'}; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 20px; margin-bottom: 5px;">${shop.services?.repairHull ? '✅' : '❌'}</div>
                                <div style="font-size: 11px; color: var(--text-secondary);">Reparar Casco</div>
                            </div>
                            <div style="background: ${shop.services?.upgradeCard ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)'}; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-size: 20px; margin-bottom: 5px;">${shop.services?.upgradeCard ? '✅' : '❌'}</div>
                                <div style="font-size: 11px; color: var(--text-secondary);">Mejorar Carta</div>
                            </div>
                        </div>
                    </div>
                    
                    ${shop.inventory && shop.inventory.length > 0 ? `
                        <div>
                            <div style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 10px;">📦 Inventario (${shop.inventory.length} items)</div>
                            <div style="max-height: 200px; overflow-y: auto; background: var(--bg-darker); border-radius: 8px; padding: 10px;">
                                ${shop.inventory.map(item => `
                                    <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid var(--border);">
                                        <span style="font-size: 12px; color: var(--text-secondary);">${item.cardId}</span>
                                        <span style="font-size: 12px; font-weight: 600; color: var(--primary);">x${item.quantity}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : '<div style="text-align: center; padding: 20px; color: var(--text-secondary); font-style: italic;">Sin items en inventario</div>'}
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
                    document.getElementById('shops-tab').classList.add('active');
                    document.getElementById('preview-section').classList.remove('active');
                    document.removeEventListener('keydown', onEsc);
                }
            };
            document.addEventListener('keydown', onEsc);
        }
    },

    connectShopFormListeners() {
        const btnAddShop = document.getElementById('btnAddShop');
        const btnSaveShop = document.getElementById('btnSaveShop');
        const btnDeleteShop = document.getElementById('btnDeleteShop');
        const btnPreviewShop = document.getElementById('btnPreviewShop');
        const searchShops = document.getElementById('searchShops');
        const btnAddInventory = document.getElementById('btnAddInventory');
        const btnAddTrait = document.getElementById('btnAddTrait');

        // Evitar duplicados: clonar y reemplazar elementos
        if (btnAddShop) {
            const newBtn = btnAddShop.cloneNode(true);
            btnAddShop.parentNode.replaceChild(newBtn, btnAddShop);
            newBtn.addEventListener('click', () => this.addShop());
        }

        if (btnSaveShop) {
            const newBtn = btnSaveShop.cloneNode(true);
            btnSaveShop.parentNode.replaceChild(newBtn, btnSaveShop);
            newBtn.addEventListener('click', () => this.saveShop());
        }

        if (btnDeleteShop) {
            const newBtn = btnDeleteShop.cloneNode(true);
            btnDeleteShop.parentNode.replaceChild(newBtn, btnDeleteShop);
            newBtn.addEventListener('click', () => this.deleteShop());
        }

        if (btnPreviewShop) {
            const newBtn = btnPreviewShop.cloneNode(true);
            btnPreviewShop.parentNode.replaceChild(newBtn, btnPreviewShop);
            newBtn.addEventListener('click', () => this.previewShop());
        }

        if (searchShops) {
            searchShops.addEventListener('input', () => this.renderShops());
        }

        if (btnAddInventory) {
            const newBtn = btnAddInventory.cloneNode(true);
            btnAddInventory.parentNode.replaceChild(newBtn, btnAddInventory);
            newBtn.addEventListener('click', () => this.addInventoryItem());
        }

        if (btnAddTrait) {
            const newBtn = btnAddTrait.cloneNode(true);
            btnAddTrait.parentNode.replaceChild(newBtn, btnAddTrait);
            newBtn.addEventListener('click', () => this.addShopTrait());
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Shops] Módulo de tiendas cargado');
});
