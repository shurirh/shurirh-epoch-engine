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
   * @param {number|null} [params.date=null] - Ancla cronológica (abstracta)
   * @param {Array<string>} [params.tags=[]] - Etiquetas para agrupar o filtrar
   * @param {Object} [params.meta={}] - Metadatos adicionales arbitrarios 
   */
    constructor({
        id,
        title,
        description = '',
        date = null,
        tags = [],
        meta = {}
    }) {
        if (!id) {
            throw new Error('Todo Suceso debe tener un id único.');
        }
        if (!title) {
            throw new Error('Todo Suceso debe tener un título.');
        }

        if (date !== null && typeof date !== 'number') {
            throw new Error('La propiedad date debe ser de tipo number (o null).');
        }

        this.id = id;
        this.title = title;
        this.description = description;

        // El date es opcional, sirve como ancla cronológica contextual (unidad a definir por el usuario)
        this.date = date;

        // Proteger las etiquetas de mutaciones externas clonando el array
        this.tags = Array.isArray(tags) ? [...tags] : [];

        // Validar y parsear objeto plano para metadatos
        this.meta = typeof meta === 'object' && meta !== null && !Array.isArray(meta) ? meta : {};
    }
}
