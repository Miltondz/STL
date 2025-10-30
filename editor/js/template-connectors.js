/**
 * template-connectors.js - Conecta los botones de plantilla con los editores
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== EVENTOS ====================
    const btnAddEventTemplate = document.getElementById('btnAddEventTemplate');
    if (btnAddEventTemplate) {
        btnAddEventTemplate.addEventListener('click', () => {
            TemplateManager.open('events', (templateData, templateId) => {
                const newEvent = {
                    id: `${templateData.type === 'hazard' ? 'haz' : 'enc'}_${Date.now()}`,
                    ...templateData
                };
                
                if (templateData.type === 'hazard') {
                    app.data.hazards = app.data.hazards || [];
                    app.data.hazards.push(newEvent);
                } else {
                    app.data.encounters = app.data.encounters || [];
                    app.data.encounters.push(newEvent);
                }
                
                app.currentEvent = newEvent;
                app.renderEvents();
                app.editEvent(newEvent);
            });
        });
    }

    // ==================== CARTAS ====================
    const btnAddCardTemplate = document.getElementById('btnAddCardTemplate');
    if (btnAddCardTemplate) {
        btnAddCardTemplate.addEventListener('click', () => {
            TemplateManager.open('cards', (templateData, templateId) => {
                const newCard = {
                    id: `${templateData.type.toUpperCase()}_${Date.now()}`,
                    ...templateData
                };
                app.data.cards = app.data.cards || [];
                app.data.cards.push(newCard);
                app.currentCard = newCard;
                app.renderCards();
                app.editCard(newCard);
            });
        });
    }

    // ==================== NAVES ====================
    const btnAddShipTemplate = document.getElementById('btnAddShipTemplate');
    if (btnAddShipTemplate) {
        btnAddShipTemplate.addEventListener('click', () => {
            TemplateManager.open('ships', (templateData, templateId) => {
                const newShip = {
                    id: `SHIP_${Date.now()}`,
                    image: '',
                    ...templateData
                };
                app.data.ships = app.data.ships || [];
                app.data.ships.push(newShip);
                app.currentShip = newShip;
                app.renderShips();
                app.editShip(newShip);
            });
        });
    }

    // ==================== TIENDAS ====================
    const btnAddShopTemplate = document.getElementById('btnAddShopTemplate');
    if (btnAddShopTemplate) {
        btnAddShopTemplate.addEventListener('click', () => {
            TemplateManager.open('shops', (templateData, templateId) => {
                const newShop = {
                    id: `SHOP_${Date.now()}`,
                    ...templateData
                };
                app.data.shops = app.data.shops || [];
                app.data.shops.push(newShop);
                app.currentShop = newShop;
                app.renderShops();
                app.editShop(newShop);
            });
        });
    }

    // ==================== DIÁLOGOS ====================
    const btnAddDialogueTemplate = document.getElementById('btnAddDialogueTemplate');
    if (btnAddDialogueTemplate) {
        btnAddDialogueTemplate.addEventListener('click', () => {
            TemplateManager.open('dialogues', (templateData, templateId) => {
                const newDialogue = {
                    id: `dialogue_${Date.now()}`,
                    ...templateData
                };
                
                // Obtener la lista desde localStorage
                let dialogues = [];
                const stored = localStorage.getItem('navegador_dialogues');
                if (stored) {
                    try {
                        dialogues = JSON.parse(stored);
                    } catch (e) {
                        dialogues = [];
                    }
                }
                
                dialogues.push(newDialogue);
                localStorage.setItem('navegador_dialogues', JSON.stringify(dialogues));
                
                // Actualizar el editor
                if (window.DialogueEditor) {
                    DialogueEditor.loadDialogues();
                    DialogueEditor.renderDialogues();
                    DialogueEditor.loadDialogue(newDialogue.id);
                }
            });
        });
    }

    // ==================== CADENAS ====================
    const btnAddChainTemplate = document.getElementById('btnAddChainTemplate');
    if (btnAddChainTemplate) {
        btnAddChainTemplate.addEventListener('click', () => {
            TemplateManager.open('chains', (templateData, templateId) => {
                const newChain = {
                    id: `chain_${Date.now()}`,
                    ...templateData
                };
                
                // Obtener la lista desde localStorage
                let chains = [];
                const stored = localStorage.getItem('navegador_chains');
                if (stored) {
                    try {
                        chains = JSON.parse(stored);
                    } catch (e) {
                        chains = [];
                    }
                }
                
                chains.push(newChain);
                localStorage.setItem('navegador_chains', JSON.stringify(chains));
                
                // Actualizar el editor
                if (window.ChainEditor) {
                    ChainEditor.loadChains();
                    ChainEditor.renderChains();
                    ChainEditor.loadChain(newChain.id);
                }
            });
        });
    }
});
