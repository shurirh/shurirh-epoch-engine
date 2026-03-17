import { i18n } from '../i18n/index.js';

/**
 * Represents an edge (directed relationship) in the graph.
 */
export class Edge {
    constructor(id, fromId, toId, type, metadata = {}) {
        if (!id || !fromId || !toId || !type) {
            throw new Error(i18n.t('edges.errors.missingProps'));
        }
        this.id = id;
        this.from = fromId;
        this.to = toId;
        this.type = type;
        this.metadata = metadata;
    }
}

/**
 * Types of relationships between nodes.
 */
export const EdgeTypes = {
    PRECEDES: "precedes",
    CAUSES: "causes",
    BRANCHES: "branches",
    MERGES: "merges",
    LOOPS: "loops"
}
