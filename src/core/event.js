/**
 * Represents the minimum unit of historical/narrative information.
 * It is a purely descriptive entity, it does not contain logical temporal relationships,
 * as that is the responsibility of Graph and EpochEngine.
 */
export class Event {
    /**
   * @param {Object} params - Event properties
   * @param {string} params.id - Mandatory unique identifier (e.g. UUID)
   * @param {string} params.title - Event title or short name
   * @param {string} [params.description=''] - Extended description
   * @param {number|null} [params.date=null] - Chronological anchor (abstract)
   * @param {Array<string>} [params.tags=[]] - Tags for grouping or filtering
   * @param {Object} [params.meta={}] - Additional arbitrary metadata
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
            throw new Error('Every Event must have a unique id.');
        }
        if (!title) {
            throw new Error('Every Event must have a title.');
        }

        if (date !== null && typeof date !== 'number') {
            throw new Error('The date property must be of type number (or null).');
        }

        this.id = id;
        this.title = title;
        this.description = description;

        // Date is optional, serves as a contextual chronological anchor (unit defined by user)
        this.date = date;

        // Protect tags from external mutations by cloning the array
        this.tags = Array.isArray(tags) ? [...tags] : [];

        // Validate and parse plain object for metadata
        this.meta = typeof meta === 'object' && meta !== null && !Array.isArray(meta) ? meta : {};
    }
}
