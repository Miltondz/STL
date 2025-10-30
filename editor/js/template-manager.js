/**
 * template-manager.js - Gestión del modal de plantillas
 */

const TemplateManager = {
    currentEditor: null,
    currentCallback: null,

    open(editorType, onSelectCallback) {
        this.currentEditor = editorType;
        this.currentCallback = onSelectCallback;
        
        const templates = Templates.getTemplateNames(editorType);
        this.renderTemplatesList(templates);
        
        const modal = document.getElementById('templateModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.style.display = 'block';
            overlay.style.display = 'block';
        }
    },

    close() {
        const modal = document.getElementById('templateModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }
        
        this.currentEditor = null;
        this.currentCallback = null;
    },

    renderTemplatesList(templates) {
        const container = document.getElementById('templatesList');
        if (!container) return;

        if (templates.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay plantillas disponibles</p>';
            return;
        }

        container.innerHTML = templates.map(template => `
            <div class="template-card" data-template-id="${template.id}" style="
                padding: 15px;
                background: var(--bg-darker);
                border: 2px solid var(--border);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 12px;
            " onmouseover="this.style.borderColor='var(--primary)'; this.style.background='var(--bg-card)';" 
               onmouseout="this.style.borderColor='var(--border)'; this.style.background='var(--bg-darker)';">
                <div style="
                    font-size: 32px;
                    min-width: 40px;
                    text-align: center;
                ">${this.getTemplateIcon(template.id)}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${template.name}</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${this.getTemplateDescription(template.id)}</div>
                </div>
            </div>
        `).join('');

        // Agregar listeners
        container.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.templateId;
                this.selectTemplate(templateId);
            });
        });
    },

    selectTemplate(templateId) {
        if (!this.currentEditor || !this.currentCallback) return;

        const templates = Templates.getTemplates(this.currentEditor);
        const templateData = templates[templateId];

        if (templateData) {
            this.currentCallback(templateData, templateId);
            this.close();
            Toast.success('Plantilla aplicada');
        }
    },

    getTemplateIcon(templateId) {
        const icons = {
            // Cards
            crew_engineer: '🔧',
            crew_pilot: '🚀',
            crew_gunner: '🎯',
            attack_laser: '⚡',
            attack_missile: '💥',
            skill_shield: '🛡️',
            skill_repair: '🔨',
            // Ships
            scout: '🔍',
            fighter: '⚔️',
            freighter: '📦',
            // Shops
            military: '🎖️',
            civilian: '🏪',
            black_market: '🕶️',
            // Dialogues
            merchant_greeting: '💰',
            distress_signal: '🆘',
            mysterious_stranger: '❓',
            mission_offer: '📋',
            // Chains
            tutorial: '📚',
            rescue_mission: '🆘',
            merchant_quest: '💰',
            military_campaign: '⚔️',
            mystery_story: '🔍'
        };
        return icons[templateId] || '📄';
    },

    getTemplateDescription(templateId) {
        const descriptions = {
            // Cards
            crew_engineer: 'Miembro de tripulación especializado en reparaciones',
            crew_pilot: 'Experto en navegación y maniobras evasivas',
            crew_gunner: 'Especialista en sistemas de armas',
            attack_laser: 'Arma de energía estándar de corto alcance',
            attack_missile: 'Proyectil de alto daño que rompe escudos',
            skill_shield: 'Genera escudos temporales para protección',
            skill_repair: 'Restaura puntos de casco dañados',
            // Ships
            scout: 'Rápida y evasiva, ideal para exploración',
            fighter: 'Equilibrada para combate directo',
            freighter: 'Alta resistencia, gran capacidad de carga',
            // Shops
            military: 'Arsenal especializado en equipo de combate',
            civilian: 'Tienda general con precios justos',
            black_market: 'Mercancía ilegal a precios bajos',
            // Dialogues
            merchant_greeting: 'Comerciante amigable ofreciendo sus servicios',
            distress_signal: 'Llamada de socorro con decisión moral',
            mysterious_stranger: 'Encuentro enigmático con información valiosa',
            mission_offer: 'Contrato de trabajo peligroso pero lucrativo',
            // Chains
            tutorial: 'Historia introductoria que enseña mecánicas básicas',
            rescue_mission: 'Narrativa corta con combate y decisiones morales',
            merchant_quest: 'Cadena comercial entre estaciones',
            military_campaign: 'Serie de combates progresivamente difíciles',
            mystery_story: 'Investigación con revelaciones sorprendentes'
        };
        return descriptions[templateId] || 'Plantilla predefinida';
    },

    init() {
        // Conectar botón de cerrar
        const btnClose = document.getElementById('btnCloseTemplateModal');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.close());
        }

        // Cerrar con overlay
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('templateModal').style.display === 'block') {
                this.close();
            }
        });

        // Cerrar con botón X
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    TemplateManager.init();
});

window.TemplateManager = TemplateManager;
