/**
 * editor-events.js - Editor de eventos
 */

// Extender app con funcionalidad de eventos
Object.assign(app, {
    
    getEventsList() {
        const type = document.getElementById('eventType')?.value || 'encounter';
        return type === 'encounter' ? this.data.encounters : this.data.hazards;
    },

    setEventsList(list, type = null) {
        const eventType = type || document.getElementById('eventType')?.value || 'encounter';
        if (eventType === 'encounter') {
            this.data.encounters = list;
        } else {
            this.data.hazards = list;
        }
    },

    renderEvents() {
        console.log('[Events] Renderizando lista de eventos...');
        const container = document.getElementById('eventsList');
        if (!container) return;

        const events = [...this.data.encounters, ...this.data.hazards];
        const search = document.getElementById('searchEvents')?.value || '';
        const filtered = Search.filter(events, search, ['title', 'id']);

        if (filtered.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No hay eventos</div>';
            return;
        }

        container.innerHTML = filtered.map(event => {
            const isActive = this.currentEvent?.id === event.id;
            const icon = event.type === 'hazard' ? '⚠️' : '📋';
            return `
                <div class="item ${isActive ? 'active' : ''}" data-event-id="${event.id}">
                    <div class="option-title">${icon} ${event.title}</div>
                    <div class="option-text">${Format.truncate(event.description || '---', 40)}</div>
                </div>
            `;
        }).join('');

        // Agregar listeners a los items
        container.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', () => {
                const eventId = item.dataset.eventId;
                const event = events.find(e => e.id === eventId);
                if (event) this.editEvent(event);
            });
        });
    },

    addEvent() {
        const newEvent = {
            id: IDGenerator.event(),
            title: 'Nuevo Evento',
            type: 'encounter',
            description: '',
            narrative: {
                intro: [''],
                prompt: '¿Cómo procedes?'
            },
            options: [],
            image: { url: '', orientation: '' },
            video: { url: '' }
        };

        this.data.encounters.push(newEvent);
        this.currentEvent = newEvent;
        this.renderEvents();
        this.editEvent(newEvent);
        Toast.info('Nuevo evento creado');
    },

    editEvent(event) {
        console.log('[Events] Editando evento:', event.id);
        this.currentEvent = event;
        this.renderEventForm(event);
        this.renderEvents();
    },

    renderEventForm(event) {
        if (!event) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        document.getElementById('eventId').value = event.id || '';
        document.getElementById('eventTitle').value = event.title || '';
        document.getElementById('eventType').value = event.type || 'encounter';
        document.getElementById('eventDifficulty').value = event.difficulty || '';
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventPrompt').value = event.narrative?.prompt || '';
        document.getElementById('eventImageUrl').value = event.image?.url || '';
        document.getElementById('eventImageOrientation').value = event.image?.orientation || '';
        document.getElementById('eventVideoUrl').value = event.video?.url || '';

        this.renderIntroTexts(event.narrative?.intro || ['']);
        this.renderOptions(event.options || []);
        this.connectEventFormListeners();

        // Marcar cambios
        document.querySelectorAll('#eventEditor input, #eventEditor textarea, #eventEditor select')
            .forEach(el => el.addEventListener('input', () => app.markAsUnsaved()));
    },

    renderIntroTexts(texts) {
        const container = document.getElementById('introTextContainer');
        if (!container) return;

        container.innerHTML = texts.map((text, i) => `
            <div class="text-array-item">
                <input type="text" class="input-text intro-text" value="${text}" data-index="${i}">
                <button class="btn btn-small btn-danger" data-remove-intro="${i}">🗑️</button>
            </div>
        `).join('');

        container.querySelectorAll('[data-remove-intro]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.removeIntro);
                if (this.currentEvent) {
                    this.currentEvent.narrative.intro = ArrayUtils.remove(this.currentEvent.narrative.intro, index);
                    this.renderIntroTexts(this.currentEvent.narrative.intro);
                }
            });
        });
    },

    renderOptions(options) {
        const container = document.getElementById('optionsContainer');
        if (!container) return;

        container.innerHTML = options.map((option, i) => `
            <div class="option-card">
                <div class="option-title">${option.text || `Opción ${i + 1}`}</div>
                <div class="option-text">${option.description ? Format.truncate(option.description, 50) : 'Sin descripción'}</div>
                <div class="option-text">Consecuencias: ${option.consequence?.rolls?.length || 0} resultado(s)</div>
                <div class="option-actions">
                    <button class="btn btn-small btn-info" data-edit-option="${i}">✏️ Editar</button>
                    <button class="btn btn-small btn-danger" data-delete-option="${i}">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('[data-edit-option]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.editOption);
                this.editOption(index);
            });
        });

        container.querySelectorAll('[data-delete-option]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.deleteOption);
                if (confirm('¿Eliminar esta opción?') && this.currentEvent) {
                    this.currentEvent.options = ArrayUtils.remove(this.currentEvent.options, index);
                    this.renderOptions(this.currentEvent.options);
                    Toast.success('Opción eliminada');
                }
            });
        });
    },

    editOption(index) {
        if (!this.currentEvent || index < 0 || index >= this.currentEvent.options.length) return;
        
        this.currentOption = { ...this.currentEvent.options[index], _index: index };
        this.renderOptionModal();
        Modal.open('optionModal');
    },

    renderOptionModal() {
        if (!this.currentOption) return;

        const opt = this.currentOption;

        document.getElementById('optionId').value = opt.id;
        document.getElementById('optionText').value = opt.text;
        document.getElementById('optionDescription').value = opt.description || '';
        document.getElementById('optionCrewRequirement').value = opt.requirements?.crew || '';
        document.getElementById('optionMinCredits').value = opt.requirements?.minCredits || '';
        document.getElementById('optionNarrativeFlags').value = (opt.requirements?.narrativeFlags || []).join(',');

        this.renderConsequences(opt.consequence?.rolls || []);
        this.connectOptionModalListeners();
    },

    renderConsequences(rolls) {
        const container = document.getElementById('consequencesList');
        if (!container) return;

        if (rolls.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Sin consecuencias definidas</p>';
            return;
        }

        container.innerHTML = rolls.map((roll, i) => `
            <div class="option-card">
                <div class="option-title">Resultado ${i + 1} - Probabilidad: ${roll.probability}%</div>
                <div class="option-text">Log: ${Format.truncate(roll.narrative?.log || 'Sin log', 50)}</div>
                <div class="option-text">Cambios: ${this.summarizeChanges(roll.changes)}</div>
                ${roll.narrative?.resultImage ? `<div class="option-text">✓ Imagen resultado</div>` : ''}
                <div class="option-actions">
                    <button class="btn btn-small btn-info" data-edit-consequence="${i}">✏️ Editar</button>
                    <button class="btn btn-small btn-danger" data-delete-consequence="${i}">🗑️</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('[data-edit-consequence]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.editConsequence);
                this.editConsequence(index);
            });
        });

        container.querySelectorAll('[data-delete-consequence]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.deleteConsequence);
                if (confirm('¿Eliminar esta consecuencia?') && this.currentOption) {
                    this.currentOption.consequence.rolls = ArrayUtils.remove(this.currentOption.consequence.rolls, index);
                    this.renderConsequences(this.currentOption.consequence.rolls);
                    Toast.success('Consecuencia eliminada');
                }
            });
        });
    },

    summarizeChanges(changes) {
        if (!changes || Object.keys(changes).length === 0) return 'Ninguno';
        const parts = [];
        if (changes.credits) parts.push(`Cr: ${changes.credits > 0 ? '+' : ''}${changes.credits}`);
        if (changes.hullDamage) parts.push(`HP: -${changes.hullDamage}`);
        if (changes.fuel) parts.push(`Fuel: ${changes.fuel > 0 ? '+' : ''}${changes.fuel}`);
        if (changes.xp) parts.push(`XP: +${changes.xp}`);
        return parts.join(', ') || 'Ninguno';
    },

    editConsequence(index) {
        if (!this.currentOption || !this.currentOption.consequence?.rolls[index]) return;
        
        const roll = this.currentOption.consequence.rolls[index];
        const modal = prompt(
            `Editar Consecuencia ${index + 1}\n\n` +
            `Formato: probabilidad|log|credits|hullDamage|fuel|xp|imageUrl\n\n` +
            `Ejemplo: 75|Éxito rotundo|15|0|0|40|https://imagen.jpg`,
            `${roll.probability}|${roll.narrative?.log || ''}|${roll.changes?.credits || 0}|${roll.changes?.hullDamage || 0}|${roll.changes?.fuel || 0}|${roll.changes?.xp || 0}|${roll.narrative?.resultImage || ''}`
        );

        if (!modal) return;

        const parts = modal.split('|');
        const updated = {
            probability: parseInt(parts[0]) || 100,
            changes: {
                credits: parseInt(parts[2]) || undefined,
                hullDamage: parseInt(parts[3]) || undefined,
                fuel: parseInt(parts[4]) || undefined,
                xp: parseInt(parts[5]) || undefined
            },
            narrative: {
                log: parts[1] || 'Resultado',
                resultImage: parts[6] || undefined
            }
        };

        // Limpiar undefined
        Object.keys(updated.changes).forEach(key => {
            if (updated.changes[key] === undefined) delete updated.changes[key];
        });
        if (!updated.narrative.resultImage) delete updated.narrative.resultImage;

        this.currentOption.consequence.rolls[index] = updated;
        this.renderConsequences(this.currentOption.consequence.rolls);
        Toast.success('Consecuencia actualizada');
    },

    saveOption() {
        if (!this.currentEvent || this.currentOption._index < 0) return;

        const flags = document.getElementById('optionNarrativeFlags').value
            .split(',')
            .map(f => f.trim())
            .filter(f => f);

        const option = {
            id: document.getElementById('optionId').value,
            text: document.getElementById('optionText').value,
            description: document.getElementById('optionDescription').value,
            requirements: {
                crew: document.getElementById('optionCrewRequirement').value || undefined,
                minCredits: parseInt(document.getElementById('optionMinCredits').value) || undefined,
                narrativeFlags: flags.length > 0 ? flags : undefined
            },
            consequence: this.currentOption.consequence || { rolls: [] }
        };

        // Limpiar undefined
        Object.keys(option.requirements).forEach(key => {
            if (option.requirements[key] === undefined) delete option.requirements[key];
        });

        this.currentEvent.options[this.currentOption._index] = option;
        this.renderOptions(this.currentEvent.options);
        Modal.close('optionModal');
        Toast.success('Opción guardada');
    },

    connectOptionModalListeners() {
        const btnSave = document.getElementById('btnSaveOption');
        const btnAddConsequence = document.getElementById('btnAddConsequence');
        const btnClose = document.getElementById('btnCloseOptionModal');

        if (btnSave) {
            btnSave.replaceWith(btnSave.cloneNode(true));
            document.getElementById('btnSaveOption').addEventListener('click', () => this.saveOption());
        }

        if (btnClose) {
            btnClose.replaceWith(btnClose.cloneNode(true));
            document.getElementById('btnCloseOptionModal').addEventListener('click', () => Modal.close('optionModal'));
        }

        if (btnAddConsequence) {
            btnAddConsequence.replaceWith(btnAddConsequence.cloneNode(true));
            document.getElementById('btnAddConsequence').addEventListener('click', () => {
                if (!this.currentOption.consequence) this.currentOption.consequence = { rolls: [] };
                this.currentOption.consequence.rolls.push({
                    probability: 100,
                    changes: {},
                    narrative: { log: 'Nuevo resultado' }
                });
                this.renderConsequences(this.currentOption.consequence.rolls);
                Toast.success('Consecuencia agregada');
            });
        }
    },

    saveEvent() {
        const event = {
            id: document.getElementById('eventId').value,
            title: document.getElementById('eventTitle').value,
            type: document.getElementById('eventType').value,
            description: document.getElementById('eventDescription').value,
            difficulty: document.getElementById('eventDifficulty').value,
            narrative: {
                intro: Array.from(document.querySelectorAll('.intro-text')).map(el => el.value),
                prompt: document.getElementById('eventPrompt').value
            },
            options: this.currentEvent?.options || [],
            image: {
                url: document.getElementById('eventImageUrl').value,
                orientation: document.getElementById('eventImageOrientation').value
            },
            video: {
                url: document.getElementById('eventVideoUrl').value
            }
        };

        const validation = Validation.validateEvent(event);
        if (!validation.valid) {
            Toast.error('Errores en el evento');
            validation.errors.forEach(error => console.error(error));
            return;
        }

        // Actualizar o crear
        const list = event.type === 'encounter' ? this.data.encounters : this.data.hazards;
        const index = list.findIndex(e => e.id === this.currentEvent?.id);

        if (index >= 0) {
            list[index] = event;
            Toast.success('Evento actualizado');
        } else {
            list.push(event);
            Toast.success('Evento guardado');
        }

        this.currentEvent = event;
        this.saveData();
        this.renderEvents();
    },

    deleteEvent() {
        if (!this.currentEvent || !confirm('¿Eliminar este evento?')) return;

        let list = this.currentEvent.type === 'encounter' ? this.data.encounters : this.data.hazards;
        list = list.filter(e => e.id !== this.currentEvent.id);
        
        if (this.currentEvent.type === 'encounter') {
            this.data.encounters = list;
        } else {
            this.data.hazards = list;
        }

        this.currentEvent = null;
        this.showEmptyState();
        this.renderEvents();
        Toast.success('Evento eliminado');
    },

    showEmptyState() {
        const editor = document.getElementById('eventEditor');
        const emptyState = document.getElementById('eventEmptyState');
        if (editor) editor.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
    },

    hideEmptyState() {
        const editor = document.getElementById('eventEditor');
        const emptyState = document.getElementById('eventEmptyState');
        if (editor) editor.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
    },

    connectEventFormListeners() {
        const btnAddEvent = document.getElementById('btnAddEvent');
        const btnAddIntroText = document.getElementById('btnAddIntroText');
        const btnAddOption = document.getElementById('btnAddOption');
        const btnSaveEvent = document.getElementById('btnSaveEvent');
        const btnDeleteEvent = document.getElementById('btnDeleteEvent');
        const btnPreviewEvent = document.getElementById('btnPreviewEvent');
        const searchEvents = document.getElementById('searchEvents');

        if (btnAddEvent) {
            btnAddEvent.removeEventListener('click', this.addEvent);
            btnAddEvent.addEventListener('click', () => this.addEvent());
        }

        if (btnAddIntroText) {
            btnAddIntroText.addEventListener('click', () => {
                if (this.currentEvent) {
                    this.currentEvent.narrative.intro.push('');
                    this.renderIntroTexts(this.currentEvent.narrative.intro);
                }
            });
        }

        if (btnAddOption) {
            btnAddOption.addEventListener('click', () => {
                if (!this.currentEvent) {
                    Toast.error('Primero crea un evento');
                    return;
                }
                const newOption = {
                    id: IDGenerator.option(),
                    text: `Opción ${(this.currentEvent.options?.length || 0) + 1}`,
                    description: '',
                    requirements: {},
                    consequence: { rolls: [] }
                };
                if (!this.currentEvent.options) this.currentEvent.options = [];
                this.currentEvent.options.push(newOption);
                this.renderOptions(this.currentEvent.options);
                Toast.success('Opción agregada');
            });
        }

        if (btnSaveEvent) {
            btnSaveEvent.addEventListener('click', () => this.saveEvent());
        }

        if (btnDeleteEvent) {
            btnDeleteEvent.addEventListener('click', () => this.deleteEvent());
        }

        if (btnPreviewEvent) {
            btnPreviewEvent.addEventListener('click', () => this.previewEvent());
        }

        if (searchEvents) {
            searchEvents.addEventListener('input', () => this.renderEvents());
        }
    },

    previewEvent() {
        if (!this.currentEvent) {
            Toast.error('Primero crea un evento');
            return;
        }

        const event = this.currentEvent;
        const preview = `
            <div class="event-preview">
                ${event.image?.url ? `
                    <div class="event-preview-image">
                        <img src="${event.image.url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<div style=padding:20px>Imagen no disponible</div>'">
                    </div>
                ` : '<div class="event-preview-image" style="background: var(--bg-darker);">📷 Sin imagen</div>'}
                
                <div class="event-preview-content">
                    <div class="event-preview-title">${event.title}</div>
                    <div class="event-preview-type" style="font-size: 11px; color: var(--text-secondary); margin-bottom: 10px;">
                        ${event.type === 'encounter' ? '📋 Encuentro' : '⚠️ Peligro'}
                    </div>
                    ${event.narrative?.intro.map(text => 
                        `<div class="event-preview-text">${text}</div>`
                    ).join('')}
                    <div class="event-preview-prompt">${event.narrative?.prompt}</div>
                    <div class="event-preview-options">
                        ${event.options.map((opt, i) => `
                            <div class="event-preview-option">
                                ${opt.text}
                                ${opt.requirements?.crew ? `<span style="font-size: 10px; opacity: 0.7;"> (Requiere: ${opt.requirements.crew})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('previewContainer');
        if (container) {
            container.innerHTML = preview;
            
            // Cambiar a tab de preview
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('preview-section').classList.add('active');
            
            Toast.info('Presiona ESC para volver al editor');
            
            // Agregar listener para volver con ESC
            const onEsc = (e) => {
                if (e.key === 'Escape') {
                    document.getElementById('events-tab').classList.add('active');
                    document.getElementById('preview-section').classList.remove('active');
                    document.removeEventListener('keydown', onEsc);
                }
            };
            document.addEventListener('keydown', onEsc);
        }
    }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Events] Módulo de eventos cargado');
    app.connectEventFormListeners();
});
