import { i18n } from '../i18n/index.js';

/**
 * Represents a generic node in the graph.
 * It is domain-agnostic (does not know what an Event is).
 */
export class Node {
    constructor(id, data = {}, metadata = {}) {
        if (!id) throw new Error(i18n.t('nodes.errors.uniqueID'));
        this.id = id;
        this.data = data;
        this.metadata = metadata;
    }
}
