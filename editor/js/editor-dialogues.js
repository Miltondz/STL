const DialogueEditor = (() => {
    let dialogues = [];
    let currentDialogue = null;

    return {
        init() {
            this.loadDialogues();
            this.renderDialogues();
            this.connectDialogueFormListeners();
        },

        loadDialogues() {
            const stored = localStorage.getItem('navegador_dialogues');
            if (stored) {
                try {
                    dialogues = JSON.parse(stored);
                    console.log('[Dialogues] Diálogos cargados:', dialogues.length);
                } catch (e) {
                    console.error('[Dialogues] Error al parsear diálogos:', e);
                    dialogues = [];
                }
            }
        },

        saveDialogues() {
            localStorage.setItem('navegador_dialogues', JSON.stringify(dialogues));
            console.log('[Dialogues] Diálogos guardados:', dialogues.length);
        },

        renderDialogues() {
            const container = document.getElementById('dialoguesList');
            if (!container) return;

            const searchTerm = document.getElementById('searchDialogues')?.value?.toLowerCase() || '';
            const filtered = dialogues.filter(d => 
                d.id.toLowerCase().includes(searchTerm) ||
                (d.speaker && d.speaker.toLowerCase().includes(searchTerm)) ||
                (d.text && d.text.toLowerCase().includes(searchTerm))
            );

            if (filtered.length === 0) {
                container.innerHTML = '<div class="empty-state">No hay diálogos</div>';
                return;
            }

            container.innerHTML = filtered.map(dialogue => `
                <div class="list-item ${currentDialogue?.id === dialogue.id ? 'active' : ''}"
                     data-dialogue-id="${dialogue.id}">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">💬</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary);">${dialogue.id}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${dialogue.speaker || 'Sin speaker'}</div>
                        </div>
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 5px; font-style: italic;">
                        ${dialogue.text ? dialogue.text.substring(0, 60) + (dialogue.text.length > 60 ? '...' : '') : ''}
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.list-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.dialogueId;
                    this.loadDialogue(id);
                });
            });
        },

        loadDialogue(id) {
            const dialogue = dialogues.find(d => d.id === id);
            if (!dialogue) return;

            currentDialogue = dialogue;
            this.renderDialogues();

            document.getElementById('dialogueId').value = dialogue.id || '';
            document.getElementById('dialogueSpeaker').value = dialogue.speaker || '';
            document.getElementById('dialogueSpeakerCardId').value = dialogue.speakerCardId || '';
            document.getElementById('dialogueText').value = dialogue.text || '';

            this.renderConditions();
            this.renderOptions();
            
            // Mostrar formulario
            const editor = document.getElementById('dialogueEditor');
            const emptyState = document.getElementById('dialogueEmptyState');
            if (editor) editor.style.display = 'block';
            if (emptyState) emptyState.style.display = 'none';

            Toast.info('Diálogo cargado');
        },

        renderConditions() {
            const container = document.getElementById('conditionsList');
            if (!container || !currentDialogue) return;

            const conditions = currentDialogue.conditions || [];
            
            if (conditions.length === 0) {
                container.innerHTML = `
                    <div style="padding: 15px; background: rgba(139,92,246,0.1); border: 1px dashed #8b5cf6; border-radius: 6px; color: var(--text-secondary); font-size: 12px; line-height: 1.6;">
                        <strong style="color: var(--primary); display: block; margin-bottom: 8px;">ℹ️ Sin condiciones</strong>
                        Las condiciones determinan cuándo se puede ver este diálogo.<br>
                        <strong>Ejemplos:</strong><br>
                        • Tipo: <code style="background: var(--bg-darker); padding: 2px 6px; border-radius: 3px;">hasCard</code> | Valor: <code style="background: var(--bg-darker); padding: 2px 6px; border-radius: 3px;">CREW_PILOT_01</code><br>
                        • Tipo: <code style="background: var(--bg-darker); padding: 2px 6px; border-radius: 3px;">flag</code> | Valor: <code style="background: var(--bg-darker); padding: 2px 6px; border-radius: 3px;">mission_started</code><br>
                        • Tipo: <code style="background: var(--bg-darker); padding: 2px 6px; border-radius: 3px;">minCredits</code> | Valor: <code style="background: var(--bg-darker); padding: 2px 6px; border-radius: 3px;">500</code>
                    </div>
                `;
                return;
            }

            container.innerHTML = conditions.map((cond, index) => `
                <div class="dynamic-item" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: start; padding: 10px; background: var(--bg-darker); border-radius: 6px; margin-bottom: 8px;">
                    <div>
                        <label style="display: block; font-size: 10px; color: var(--text-secondary); margin-bottom: 4px;">🎯 Tipo de condición</label>
                        <input type="text" value="${cond.type}" placeholder="hasCard, flag, minCredits" 
                               onchange="DialogueEditor.updateCondition(${index}, 'type', this.value)"
                               style="width: 100%; padding: 6px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); font-family: monospace; font-size: 12px;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 10px; color: var(--text-secondary); margin-bottom: 4px;">📊 Valor</label>
                        <input type="text" value="${cond.value}" placeholder="CARD_ID, flag_name, 100" 
                               onchange="DialogueEditor.updateCondition(${index}, 'value', this.value)"
                               style="width: 100%; padding: 6px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); font-family: monospace; font-size: 12px;">
                    </div>
                    <div style="padding-top: 18px;">
                        <button onclick="DialogueEditor.removeCondition(${index})" class="btn-danger" style="padding: 6px 10px; font-size: 11px;">✕</button>
                    </div>
                </div>
            `).join('');
        },

        renderOptions() {
            const container = document.getElementById('optionsList');
            if (!container || !currentDialogue) return;

            const options = currentDialogue.options || [];
            
            if (options.length === 0) {
                container.innerHTML = '<div style="padding: 10px; color: var(--text-secondary); font-size: 12px;">Sin opciones de respuesta. Agrega opciones para que el jugador pueda elegir.</div>';
                return;
            }

            container.innerHTML = options.map((opt, index) => `
                <div class="dynamic-item" style="padding: 15px; background: var(--bg-darker); border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #8b5cf6;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <strong style="color: var(--primary); font-size: 14px;">🎯 Opción ${index + 1}</strong>
                        <button onclick="DialogueEditor.removeOption(${index})" class="btn-danger" style="padding: 4px 8px; font-size: 11px;">✕ Eliminar</button>
                    </div>
                    
                    <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">💬 Texto que ve el jugador*</label>
                    <textarea placeholder="Ej: Acepto ayudarte con tu misión" 
                              onchange="DialogueEditor.updateOption(${index}, 'text', this.value)"
                              style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); resize: vertical; min-height: 60px; margin-bottom: 10px; font-size: 13px;">${opt.text || ''}</textarea>
                    
                    <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">🎭 Carta del interlocutor (opcional)</label>
                    <input type="text" placeholder="ID de carta, ej: CREW_HACKER_01" value="${opt.cardId || ''}"
                           onchange="DialogueEditor.updateOption(${index}, 'cardId', this.value)"
                           style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); margin-bottom: 10px; font-family: monospace;">
                    
                    <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">➡️ Siguiente diálogo</label>
                    <input type="text" placeholder="ID del siguiente diálogo, ej: dialogue_002" value="${opt.nextDialogueId || ''}"
                           onchange="DialogueEditor.updateOption(${index}, 'nextDialogueId', this.value)"
                           style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); margin-bottom: 10px; font-family: monospace;">
                    
                    <label style="display: block; font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">⚡ Acción al seleccionar (opcional)</label>
                    <input type="text" placeholder="Ej: giveCard:CARD_001, addCredits:100, setFlag:mission_complete" value="${opt.action || ''}"
                           onchange="DialogueEditor.updateOption(${index}, 'action', this.value)"
                           style="width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); font-family: monospace;">
                </div>
            `).join('');
        },

        addCondition() {
            if (!currentDialogue) {
                Toast.error('Primero crea un diálogo');
                return;
            }
            if (!currentDialogue.conditions) currentDialogue.conditions = [];
            currentDialogue.conditions.push({ type: '', value: '' });
            this.renderConditions();
        },

        updateCondition(index, field, value) {
            if (!currentDialogue || !currentDialogue.conditions) return;
            currentDialogue.conditions[index][field] = value;
        },

        removeCondition(index) {
            if (!currentDialogue || !currentDialogue.conditions) return;
            currentDialogue.conditions.splice(index, 1);
            this.renderConditions();
        },

        addOption() {
            if (!currentDialogue) {
                Toast.error('Primero crea un diálogo');
                return;
            }
            if (!currentDialogue.options) currentDialogue.options = [];
            currentDialogue.options.push({ 
                text: '', 
                cardId: '', // ID de la carta del interlocutor en esta opción
                nextDialogueId: '', 
                action: '' 
            });
            this.renderOptions();
        },

        updateOption(index, field, value) {
            if (!currentDialogue || !currentDialogue.options) return;
            currentDialogue.options[index][field] = value;
        },

        removeOption(index) {
            if (!currentDialogue || !currentDialogue.options) return;
            currentDialogue.options.splice(index, 1);
            this.renderOptions();
        },

        addDialogue() {
            const newDialogue = {
                id: `dialogue_${Date.now()}`,
                speaker: '',
                speakerCardId: '', // ID de la carta que representa al interlocutor
                text: '',
                conditions: [], // Ej: [{type: 'hasCard', value: 'CARD_001'}, {type: 'flag', value: 'mission_complete'}]
                options: [] // Cada opción puede llevar a otro diálogo o ejecutar acciones
            };

            dialogues.push(newDialogue);
            currentDialogue = newDialogue;
            this.saveDialogues();
            this.renderDialogues();
            this.loadDialogue(newDialogue.id);
            
            // Mostrar formulario
            const editor = document.getElementById('dialogueEditor');
            const emptyState = document.getElementById('dialogueEmptyState');
            if (editor) editor.style.display = 'block';
            if (emptyState) emptyState.style.display = 'none';
            
            Toast.success('Diálogo creado');
        },

        saveDialogue() {
            if (!currentDialogue) {
                Toast.error('No hay diálogo seleccionado');
                return;
            }

            const id = document.getElementById('dialogueId').value.trim();
            const speaker = document.getElementById('dialogueSpeaker').value.trim();
            const speakerCardId = document.getElementById('dialogueSpeakerCardId').value.trim();
            const text = document.getElementById('dialogueText').value.trim();

            if (!id) {
                Toast.error('El ID es obligatorio');
                return;
            }

            if (!text) {
                Toast.error('El texto del diálogo es obligatorio');
                return;
            }

            const existingIndex = dialogues.findIndex(d => d.id === currentDialogue.id);
            if (existingIndex !== -1) {
                dialogues[existingIndex] = {
                    ...currentDialogue,
                    id,
                    speaker,
                    speakerCardId,
                    text
                };
                currentDialogue = dialogues[existingIndex];
            }

            this.saveDialogues();
            this.renderDialogues();
            Toast.success('Diálogo guardado');
        },

        deleteDialogue() {
            if (!currentDialogue) {
                Toast.error('No hay diálogo seleccionado');
                return;
            }

            if (!confirm(`¿Eliminar el diálogo "${currentDialogue.id}"?`)) return;

            const idToDelete = currentDialogue.id;
            dialogues = dialogues.filter(d => d.id !== idToDelete);
            currentDialogue = null;
            this.saveDialogues();
            this.renderDialogues();

            // Limpiar formulario
            document.getElementById('dialogueId').value = '';
            document.getElementById('dialogueSpeaker').value = '';
            document.getElementById('dialogueSpeakerCardId').value = '';
            document.getElementById('dialogueText').value = '';
            document.getElementById('conditionsList').innerHTML = '';
            document.getElementById('optionsList').innerHTML = '';
            
            // Ocultar formulario y mostrar empty state
            const editor = document.getElementById('dialogueEditor');
            const emptyState = document.getElementById('dialogueEmptyState');
            if (editor) editor.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';

            Toast.success('Diálogo eliminado');
        },

        previewDialogue() {
            if (!currentDialogue) {
                Toast.error('Primero crea un diálogo');
                return;
            }

            const dialogue = currentDialogue;
            const preview = `
                <div class="dialogue-preview" style="max-width: 700px; background: var(--bg-card); border: 2px solid #8b5cf6; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(139,92,246,0.2);">
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 25px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 10px;">💬</div>
                        <div style="font-size: 28px; font-weight: 700; color: white; margin-bottom: 5px;">${dialogue.id}</div>
                        <div style="font-size: 14px; color: rgba(255,255,255,0.9);">👤 ${dialogue.speaker || 'Sin speaker'}</div>
                    </div>
                    
                    <div style="padding: 25px;">
                        <div style="margin-bottom: 20px; padding: 20px; background: var(--bg-darker); border-left: 4px solid #8b5cf6; border-radius: 8px;">
                            <div style="font-size: 16px; color: var(--text-primary); line-height: 1.7; font-style: italic;">
                                "${dialogue.text}"
                            </div>
                        </div>
                        
                        ${dialogue.conditions && dialogue.conditions.length > 0 ? `
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 10px;">⚙️ Condiciones</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    ${dialogue.conditions.map(cond => `
                                        <div style="background: rgba(139,92,246,0.2); border: 1px solid #8b5cf6; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-family: monospace; color: #c4b5fd;">
                                            ${cond.type}: ${cond.value}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${dialogue.options && dialogue.options.length > 0 ? `
                            <div>
                                <div style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 12px;">🎯 Opciones de Respuesta</div>
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    ${dialogue.options.map((opt, index) => `
                                        <div style="background: var(--bg-darker); border: 1px solid var(--border); border-radius: 8px; padding: 15px; position: relative;">
                                            <div style="position: absolute; top: -10px; left: 10px; background: #8b5cf6; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                                Opción ${index + 1}
                                            </div>
                                            <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 8px; margin-top: 5px;">
                                                ${opt.text}
                                            </div>
                                            ${opt.nextDialogueId ? `
                                                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 8px;">
                                                    ➡️ Siguiente: <span style="color: #8b5cf6; font-weight: 600;">${opt.nextDialogueId}</span>
                                                </div>
                                            ` : ''}
                                            ${opt.action ? `
                                                <div style="font-size: 11px; color: #22c55e; margin-top: 5px;">
                                                    ⚡ Acción: ${opt.action}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : '<div style="text-align: center; padding: 30px; color: var(--text-secondary); font-style: italic;">Sin opciones de respuesta</div>'}
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
                        document.getElementById('dialogues-tab').classList.add('active');
                        document.getElementById('preview-section').classList.remove('active');
                        document.removeEventListener('keydown', onEsc);
                    }
                };
                document.addEventListener('keydown', onEsc);
            }
        },

        connectDialogueFormListeners() {
            const btnAddDialogue = document.getElementById('btnAddDialogue');
            const btnSaveDialogue = document.getElementById('btnSaveDialogue');
            const btnDeleteDialogue = document.getElementById('btnDeleteDialogue');
            const btnPreviewDialogue = document.getElementById('btnPreviewDialogue');
            const searchDialogues = document.getElementById('searchDialogues');
            const btnAddDialogueOption = document.getElementById('btnAddDialogueOption');
            const btnAddCondition = document.getElementById('btnAddCondition');

            // Evitar duplicados: clonar y reemplazar elementos
            if (btnAddDialogue) {
                const newBtn = btnAddDialogue.cloneNode(true);
                btnAddDialogue.parentNode.replaceChild(newBtn, btnAddDialogue);
                newBtn.addEventListener('click', () => this.addDialogue());
            }

            if (btnSaveDialogue) {
                const newBtn = btnSaveDialogue.cloneNode(true);
                btnSaveDialogue.parentNode.replaceChild(newBtn, btnSaveDialogue);
                newBtn.addEventListener('click', () => this.saveDialogue());
            }

            if (btnDeleteDialogue) {
                const newBtn = btnDeleteDialogue.cloneNode(true);
                btnDeleteDialogue.parentNode.replaceChild(newBtn, btnDeleteDialogue);
                newBtn.addEventListener('click', () => this.deleteDialogue());
            }

            if (btnPreviewDialogue) {
                const newBtn = btnPreviewDialogue.cloneNode(true);
                btnPreviewDialogue.parentNode.replaceChild(newBtn, btnPreviewDialogue);
                newBtn.addEventListener('click', () => this.previewDialogue());
            }

            if (searchDialogues) {
                searchDialogues.addEventListener('input', () => this.renderDialogues());
            }

            if (btnAddDialogueOption) {
                const newBtn = btnAddDialogueOption.cloneNode(true);
                btnAddDialogueOption.parentNode.replaceChild(newBtn, btnAddDialogueOption);
                newBtn.addEventListener('click', () => this.addOption());
            }

            if (btnAddCondition) {
                const newBtn = btnAddCondition.cloneNode(true);
                btnAddCondition.parentNode.replaceChild(newBtn, btnAddCondition);
                newBtn.addEventListener('click', () => this.addCondition());
            }
        }
    };
})();

window.DialogueEditor = DialogueEditor;

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Dialogues] Módulo de diálogos cargado');
});
