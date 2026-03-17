import en from './locales/en.js';
import es from './locales/es.js';

class I18nManager {
    constructor() {
        this.locales = { en, es };
        this.currentLocale = 'en'; // Por defecto inglés (para no romper tests existentes)
    }

    /**
     * Cambia el idioma actual.
     * @param {string} lang - 'en' o 'es'
     */
    setLanguage(lang) {
        if (this.locales[lang]) {
            this.currentLocale = lang;
        } else {
            console.warn(`[EpochEngine] Language '${lang}' is not supported. Empleando '${this.currentLocale}'.`);
        }
    }

    /**
     * Obtiene una cadena de texto traducida.
     * @param {string} key - Clave del diccionario (ej. 'engine.errors.invalidEvent')
     * @param {Object} [params] - Parámetros a reemplazar en la cadena
     * @returns {string} Cadena traducida
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.locales[this.currentLocale];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }

        // Si no se encuentra en el idioma actual, intenta buscar en inglés como resguardo (fallback)
        if (value === undefined && this.currentLocale !== 'en') {
            let fallbackValue = this.locales['en'];
            for (const k of keys) {
                if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
                    fallbackValue = fallbackValue[k];
                } else {
                    fallbackValue = undefined;
                    break;
                }
            }
            value = fallbackValue;
        }

        if (typeof value === 'string') {
            return value.replace(/\{(\w+)\}/g, (_, match) => 
                params[match] !== undefined ? params[match] : `{${match}}`
            );
        }

        return key; // Si no se encuentra ninguna traducción, devuelve la clave original
    }
}

export const i18n = new I18nManager();
