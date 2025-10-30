/**
 * modal-system.js - Sistema de modales personalizados
 */

const ModalSystem = {
    // Confirm dialog
    confirm(message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h3>⚠️ Confirmación</h3>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-primary); line-height: 1.6; margin: 0;">${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel btn btn-secondary">Cancelar</button>
                    <button class="btn-confirm btn btn-primary">Confirmar</button>
                </div>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'block';

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const btnConfirm = modal.querySelector('.btn-confirm');
        const btnCancel = modal.querySelector('.btn-cancel');

        const cleanup = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };

        btnConfirm.addEventListener('click', () => {
            cleanup();
            if (onConfirm) onConfirm();
        });

        btnCancel.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        overlay.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        // Focus en el botón de confirmar
        setTimeout(() => btnConfirm.focus(), 100);
    },

    // Prompt dialog
    prompt(message, defaultValue = '', onSubmit, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h3>📝 Entrada de Datos</h3>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-primary); margin-bottom: 12px;">${message}</p>
                    <input type="text" class="modal-input input-text" value="${defaultValue}" style="width: 100%;">
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel btn btn-secondary">Cancelar</button>
                    <button class="btn-submit btn btn-primary">Aceptar</button>
                </div>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'block';

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const input = modal.querySelector('.modal-input');
        const btnSubmit = modal.querySelector('.btn-submit');
        const btnCancel = modal.querySelector('.btn-cancel');

        const cleanup = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };

        const submit = () => {
            const value = input.value.trim();
            cleanup();
            if (onSubmit) onSubmit(value);
        };

        btnSubmit.addEventListener('click', submit);
        btnCancel.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        overlay.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submit();
        });

        // Focus y seleccionar texto
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
    },

    // Alert dialog
    alert(message, type = 'info') {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>${icons[type] || icons.info} ${type === 'error' ? 'Error' : 'Información'}</h3>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-primary); line-height: 1.6; margin: 0;">${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-ok btn btn-primary">Aceptar</button>
                </div>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'block';

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const btnOk = modal.querySelector('.btn-ok');

        const cleanup = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };

        btnOk.addEventListener('click', cleanup);
        overlay.addEventListener('click', cleanup);

        // Focus en botón
        setTimeout(() => btnOk.focus(), 100);
    },

    // Multi-field prompt (para casos complejos como agregar items a inventario)
    multiPrompt(title, fields, onSubmit, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const fieldsHtml = fields.map((field, index) => `
            <div class="form-group" style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; color: var(--text-secondary); font-size: 12px;">${field.label}</label>
                <input 
                    type="${field.type || 'text'}" 
                    class="modal-field input-${field.type === 'number' ? 'number' : 'text'}" 
                    data-field-name="${field.name}"
                    value="${field.defaultValue || ''}"
                    placeholder="${field.placeholder || ''}"
                    ${field.min !== undefined ? `min="${field.min}"` : ''}
                    style="width: 100%;">
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h3>📝 ${title}</h3>
                </div>
                <div class="modal-body">
                    ${fieldsHtml}
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel btn btn-secondary">Cancelar</button>
                    <button class="btn-submit btn btn-primary">Aceptar</button>
                </div>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'block';

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const btnSubmit = modal.querySelector('.btn-submit');
        const btnCancel = modal.querySelector('.btn-cancel');
        const inputs = modal.querySelectorAll('.modal-field');

        const cleanup = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };

        const submit = () => {
            const values = {};
            inputs.forEach(input => {
                const fieldName = input.dataset.fieldName;
                values[fieldName] = input.type === 'number' ? 
                    (parseInt(input.value) || 0) : 
                    input.value.trim();
            });
            cleanup();
            if (onSubmit) onSubmit(values);
        };

        btnSubmit.addEventListener('click', submit);
        btnCancel.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        overlay.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        // Focus en primer input
        setTimeout(() => {
            if (inputs.length > 0) inputs[0].focus();
        }, 100);
    }
};

window.ModalSystem = ModalSystem;
