/**
 * Representa un nodo genérico en el grafo.
 * Es agnóstico al dominio (no sabe qué es un Suceso).
 */
export class Node {
    constructor(id, data = {}, metadata = {}) {
        if (!id) throw new Error('Un nodo debe tener un ID único');
        this.id = id;
        this.data = data;
        this.metadata = metadata;
    }
}

/**
 * Representa una arista (relación dirigida) en el grafo.
 */
export class Edge {
    constructor(id, fromId, toId, type, metadata = {}) {
        if (!id || !fromId || !toId || !type) {
            throw new Error('Una arista debe tener id, from, to y type');
        }
        this.id = id;
        this.from = fromId;
        this.to = toId;
        this.type = type;
        this.metadata = metadata;
    }
}

/**
 * Tipos de relaciones entre nodos.
 */
export const EdgeTypes = {
    PRECEDES: "precedes",
    CAUSES: "causes",
    BRANCHES: "branches",
    MERGES: "merges",
    LOOPS: "loops"
}

/**
 * Estructura del Grafo Dirigido.
 * Administra Nodos y Aristas sin aplicar lógica semántica temporal.
 */
export class Graph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
    }

    // --- Nodos ---

    addNode(node) {
        if (!(node instanceof Node)) {
            throw new Error('Debe proporcionar una instancia de Node');
        }
        if (this.nodes.has(node.id)) {
            throw new Error(`El nodo con ID ${node.id} ya existe`);
        }
        this.nodes.set(node.id, node);
        return node;
    }

    removeNode(nodeId) {
        if (!this.nodes.has(nodeId)) return false;

        // Al eliminar un nodo, también debemos eliminar sus aristas incidentes
        const edgesToRemove = [];
        for (const edge of this.edges.values()) {
            if (edge.from === nodeId || edge.to === nodeId) {
                edgesToRemove.push(edge.id);
            }
        }
        edgesToRemove.forEach(edgeId => this.removeEdge(edgeId));

        return this.nodes.delete(nodeId);
    }

    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    // --- Aristas ---

    addEdge(edge) {
        if (!(edge instanceof Edge)) {
            throw new Error('Debe proporcionar una instancia de Edge');
        }
        if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
            throw new Error('Ambos nodos (from y to) deben existir en el grafo antes de crear una arista');
        }
        if (this.edges.has(edge.id)) {
            throw new Error(`La arista con ID ${edge.id} ya existe`);
        }
        this.edges.set(edge.id, edge);
        return edge;
    }

    removeEdge(edgeId) {
        return this.edges.delete(edgeId);
    }

    getEdge(edgeId) {
        return this.edges.get(edgeId);
    }

    // --- Relaciones Adyacentes ---

    getOutgoing(nodeId) {
        const outgoing = [];
        for (const edge of this.edges.values()) {
            if (edge.from === nodeId) outgoing.push(edge);
        }
        return outgoing;
    }

    getIncoming(nodeId) {
        const incoming = [];
        for (const edge of this.edges.values()) {
            if (edge.to === nodeId) incoming.push(edge);
        }
        return incoming;
    }
}
