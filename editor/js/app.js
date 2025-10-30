/**
 * App.js - Lógica principal del editor
 */

// ============= ESTADO GLOBAL =============

const app = {
    data: {
        encounters: [],
        hazards: [],
        cards: [],
        ships: [],
        shops: [],
        dialogues: [],
        chains: []
    },

    currentType: 'events',
    currentEvent: null,
    currentOption: null,

    init() {
        console.log('[App] Inicializando editor...');
        this.loadData();
        this.setupEventListeners();
        console.log('[App] Editor inicializado');
    },

    loadData() {
        const saved = Storage.load('editor_content');
        if (saved) {
            this.data = saved;
            Toast.success('Datos cargados de almacenamiento local');
        }
    },

    saveData() {
        if (Storage.save('editor_content', this.data)) {
            Toast.success('Datos guardados');
            this.markAsSaved();
            return true;
        } else {
            Toast.error('Error guardando datos');
            return false;
        }
    },
    
    markAsSaved() {
        const btnBackToGame = document.getElementById('btnBackToGame');
        if (btnBackToGame) {
            btnBackToGame.classList.remove('unsaved-changes');
            btnBackToGame.innerHTML = '← Volver al Juego';
        }
    },
    
    markAsUnsaved() {
        const btnBackToGame = document.getElementById('btnBackToGame');
        if (btnBackToGame && !btnBackToGame.classList.contains('unsaved-changes')) {
            btnBackToGame.classList.add('unsaved-changes');
            btnBackToGame.innerHTML = '⚠️ Volver al Juego (cambios sin guardar)';
        }
    },

    exportJSON() {
        const schema = {
            version: '1.0.0',
            metadata: {
                title: 'Navegador Galáctico - Content',
                author: 'Editor Web',
                lastModified: new Date().toISOString(),
                gameVersion: '1.0.0'
            },
            encounters: this.data.encounters,
            hazards: this.data.hazards,
            cards: this.data.cards,
            ships: this.data.ships,
            shops: this.data.shops,
            dialogues: this.data.dialogues,
            eventChains: this.data.chains
        };

        const filename = `content_${Date.now()}.json`;
        const content = JSONUtils.stringify(schema);
        JSONUtils.download(filename, content);
        Toast.success(`Exportado: ${filename}`);
    },

    importJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const imported = JSONUtils.parse(content);

                // Soportar diferentes estructuras de JSON
                this.data.encounters = imported.encounters || [];
                this.data.hazards = imported.hazards || [];
                this.data.cards = imported.cards || [];
                this.data.shops = imported.shops || [];
                this.data.dialogues = imported.dialogues || [];
                this.data.chains = imported.eventChains || imported.chains || [];
                
                // Manejar ships que puede venir como array directo
                if (imported.ships) {
                    this.data.ships = imported.ships;
                } else if (imported.playerShips && imported.enemyShips) {
                    // Combinar naves de jugador y enemigas
                    this.data.ships = [...imported.playerShips, ...imported.enemyShips];
                } else if (imported.allShips) {
                    this.data.ships = imported.allShips;
                } else {
                    this.data.ships = [];
                }

                this.saveData();
                
                // Re-renderizar todas las vistas
                if (this.renderEvents) this.renderEvents();
                if (this.renderCards) this.renderCards();
                if (this.renderShips) this.renderShips();
                if (this.renderShops) this.renderShops();
                
                const totalItems = (
                    this.data.encounters.length +
                    this.data.hazards.length +
                    this.data.cards.length +
                    this.data.ships.length +
                    this.data.shops.length +
                    this.data.dialogues.length +
                    this.data.chains.length
                );
                
                Toast.success(`JSON importado: ${totalItems} items`);
                console.log('[Import] Datos importados:', {
                    encounters: this.data.encounters.length,
                    hazards: this.data.hazards.length,
                    cards: this.data.cards.length,
                    ships: this.data.ships.length,
                    shops: this.data.shops.length,
                    dialogues: this.data.dialogues.length,
                    chains: this.data.chains.length
                });
            } catch (error) {
                Toast.error(`Error importando JSON: ${error.message}`);
                console.error('[Import] Error:', error);
            }
        };
        reader.readAsText(file);
    },

    setupEventListeners() {
        // Header buttons
        const btnBackToGame = document.getElementById('btnBackToGame');
        const btnExport = document.getElementById('btnExport');
        const btnImport = document.getElementById('btnImport');
        const fileInput = document.getElementById('fileInput');
        
        if (btnBackToGame) {
            btnBackToGame.addEventListener('click', () => {
                // Si se abrió desde el juego (tiene opener), cerrar esta ventana
                if (window.opener && !window.opener.closed) {
                    window.close();
                } else {
                    // Si se abrió directamente, intentar navegar al juego
                    const gameUrl = window.location.origin + '/';
                    if (confirm('¿Volver al juego? Los cambios no guardados se perderán.')) {
                        window.location.href = gameUrl;
                    }
                }
            });
        }
        
        if (btnExport) btnExport.addEventListener('click', () => this.exportJSON());
        if (btnImport) btnImport.addEventListener('click', () => fileInput.click());
        if (fileInput) fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) this.importJSON(e.target.files[0]);
        });

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Modal close
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.addEventListener('click', () => Modal.closeAll());
        
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => Modal.closeAll());
        });

        console.log('[App] Event listeners conectados');
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) activeTab.classList.add('active');

        this.currentType = tabName;

        // Renderizar contenido del tab activo
        if (tabName === 'cards' && this.renderCards) {
            this.renderCards();
            this.connectCardFormListeners();
        } else if (tabName === 'events' && this.renderEvents) {
            this.renderEvents();
        } else if (tabName === 'ships' && this.renderShips) {
            this.renderShips();
            this.connectShipFormListeners();
        } else if (tabName === 'shops' && this.renderShops) {
            this.renderShops();
            this.connectShopFormListeners();
        } else if (tabName === 'dialogues' && window.DialogueEditor) {
            DialogueEditor.init();
        } else if (tabName === 'chains' && window.ChainEditor) {
            ChainEditor.init();
        }
    }
};

// ============= INICIALIZAR =============

document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM cargado');
    app.init();
});
