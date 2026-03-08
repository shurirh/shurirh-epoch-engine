/**
 * Represents a generic node in the graph.
 * It is domain-agnostic (does not know what an Event is).
 */
export class Node {
    constructor(id, data = {}, metadata = {}) {
        if (!id) throw new Error('A node must have a unique ID');
        this.id = id;
        this.data = data;
        this.metadata = metadata;
    }
}
