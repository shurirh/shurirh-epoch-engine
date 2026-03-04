/**
 * Representa la unidad mínima de información histórica/narrativa.
 * Es una entidad puramente descriptiva, no contiene lógica de relaciones
 * temporales, ya que eso es responsabilidad del Graph y del EpochEngine.
 */
export class Suceso {
    /**
     * @param {Object} params - Propiedades del suceso
     * @param {string} params.id - Identificador único obligatorio (ej. UUID)
     * @param {string} params.title - Título o nombre corto del suceso
     * @param {string} [params.description=''] - Descripción ampliada
     * @param {any} [params.date=null] - Fecha opcional (puede ser número, string o Date)
     * @param {string} [params.branch=null] - Rama temporal a la que pertenece inicialmente (opcional)
     * @param {Array<string>} [params.tags=[]] - Etiquetas para agrupar o filtrar
     * @param {Object} [params.meta={}] - Metadatos adicionales arbitrarios 
     */
    constructor({
        id,
        title,
        description = '',
        date = null,
        branch = null,
        tags = [],
        meta = {}
    }) {
        if (!id) {
            throw new Error('Todo Suceso debe tener un id único.');
        }
        if (!title) {
            throw new Error('Todo Suceso debe tener un título.');
        }

        this.id = id;
        this.title = title;
        this.description = description;

        // El date es opcional, sirve como ancla cronológica contextual
        this.date = date;

        // La rama donde este suceso "nace", aunque internamente pueda
        // estar conectado a más ramas con Graph.
        this.branch = branch;

        this.tags = Array.isArray(tags) ? tags : [];
        this.meta = typeof meta === 'object' && meta !== null ? meta : {};
    }
}
