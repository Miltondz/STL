/**
 * Utilidades para el editor de contenido
 */

// ============= ALMACENAMIENTO =============

const Storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error guardando a localStorage:', e);
            return false;
        }
    },

    load: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error cargando de localStorage:', e);
            return null;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error eliminando de localStorage:', e);
            return false;
        }
    },

    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error limpiando localStorage:', e);
            return false;
        }
    }
};

// ============= NOTIFICACIONES =============

const Toast = {
    show: (message, type = 'info', duration = 3000) => {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    },

    success: (message) => Toast.show(message, 'success'),
    error: (message) => Toast.show(message, 'error', 5000),
    warning: (message) => Toast.show(message, 'warning', 4000),
    info: (message) => Toast.show(message, 'info')
};

// ============= MODAL =============

const Modal = {
    currentModal: null,
    
    open: (modalId) => {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        if (modal && overlay) {
            modal.style.display = 'flex';
            overlay.style.display = 'block';
            Modal.currentModal = modalId;
            
            // Añadir listener para ESC si no existe
            if (!Modal.escListenerAttached) {
                document.addEventListener('keydown', Modal.handleEsc);
                Modal.escListenerAttached = true;
            }
        }
    },

    close: (modalId) => {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        if (modal && overlay) {
            modal.style.display = 'none';
            overlay.style.display = 'none';
            
            if (Modal.currentModal === modalId) {
                Modal.currentModal = null;
            }
        }
    },

    closeAll: () => {
        const overlay = document.getElementById('modalOverlay');
        const modals = document.querySelectorAll('.modal');
        modals.forEach(m => m.style.display = 'none');
        if (overlay) overlay.style.display = 'none';
        Modal.currentModal = null;
    },
    
    handleEsc: (e) => {
        if (e.key === 'Escape') {
            // Verificar si hay un modal de EffectSelector o ModalSystem abierto
            const effectSelector = document.getElementById('effectSelectorModal');
            if (effectSelector) {
                // El selector de efectos maneja su propio ESC
                return;
            }
            
            // Cerrar modal actual
            if (Modal.currentModal) {
                Modal.close(Modal.currentModal);
            } else {
                Modal.closeAll();
            }
        }
    },
    
    escListenerAttached: false
};

// ============= VALIDACIÓN =============

const Validation = {
    isValidId: (id) => {
        return /^[a-z_][a-z0-9_]*$/.test(id);
    },

    isValidUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    isNotEmpty: (value) => {
        return value && value.trim().length > 0;
    },

    validateEvent: (event) => {
        const errors = [];

        if (!Validation.isValidId(event.id)) errors.push('ID inválido (usa minúsculas y guiones bajos)');
        if (!Validation.isNotEmpty(event.title)) errors.push('Título es requerido');
        if (!event.type) errors.push('Tipo es requerido');
        if (!event.narrative || event.narrative.intro.length === 0) errors.push('Al menos un párrafo de intro es requerido');
        if (!Validation.isNotEmpty(event.narrative?.prompt)) errors.push('Prompt es requerido');
        if (event.options.length === 0) errors.push('Al menos una opción es requerida');

        // Validar opciones
        event.options.forEach((opt, i) => {
            if (!Validation.isValidId(opt.id)) errors.push(`Opción ${i + 1}: ID inválido`);
            if (!Validation.isNotEmpty(opt.text)) errors.push(`Opción ${i + 1}: Texto requerido`);
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }
};

// ============= CONVERSIÓN JSON =============

const JSONUtils = {
    stringify: (obj, pretty = true) => {
        return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
    },

    parse: (jsonString) => {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            throw new Error(`JSON inválido: ${e.message}`);
        }
    },

    download: (filename, content) => {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
};

// ============= BÚSQUEDA Y FILTRADO =============

const Search = {
    filter: (items, query, fields) => {
        if (!query) return items;
        const lowerQuery = query.toLowerCase();
        return items.filter(item =>
            fields.some(field =>
                String(item[field]).toLowerCase().includes(lowerQuery)
            )
        );
    },

    highlight: (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
};

// ============= GENERAR IDS =============

const IDGenerator = {
    event: () => `enc_event_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    option: () => `opt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    consequence: () => `cons_${Date.now()}_${Math.floor(Math.random() * 1000)}`
};

// ============= OPERACIONES CON ARRAYS =============

const ArrayUtils = {
    add: (arr, item) => [...arr, item],
    remove: (arr, index) => arr.filter((_, i) => i !== index),
    update: (arr, index, item) => arr.map((v, i) => i === index ? item : v),
    move: (arr, fromIndex, toIndex) => {
        const newArr = [...arr];
        const item = newArr.splice(fromIndex, 1)[0];
        newArr.splice(toIndex, 0, item);
        return newArr;
    }
};

// ============= FORMATEO =============

const Format = {
    truncate: (str, length = 50) => {
        return str.length > length ? str.substring(0, length) + '...' : str;
    },

    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    dateTime: (date) => {
        return new Date(date).toLocaleString('es-ES');
    },

    fileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
};

// ============= DEBUG =============

const Debug = {
    log: (message, data = null) => {
        if (data) {
            console.log(`[Editor] ${message}:`, data);
        } else {
            console.log(`[Editor] ${message}`);
        }
    },

    warn: (message) => {
        console.warn(`[Editor] ⚠️ ${message}`);
    },

    error: (message, error = null) => {
        if (error) {
            console.error(`[Editor] ❌ ${message}:`, error);
        } else {
            console.error(`[Editor] ❌ ${message}`);
        }
    }
};
