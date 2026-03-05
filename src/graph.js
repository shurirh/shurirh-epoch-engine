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
        // Índices para búsqueda rápida O(1) de adyacencias
        this.outgoingIndex = new Map(); // Map<nodeId, Set<edgeId>>
        this.incomingIndex = new Map(); // Map<nodeId, Set<edgeId>>
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

        // Eliminar aristas salientes
        const outgoing = this.outgoingIndex.get(nodeId);
        if (outgoing) {
            for (const edgeId of outgoing) {
                this.removeEdge(edgeId);
            }
        }

        // Eliminar aristas entrantes
        const incoming = this.incomingIndex.get(nodeId);
        if (incoming) {
            for (const edgeId of incoming) {
                this.removeEdge(edgeId);
            }
        }

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

        // Impedir duplicados lógicos (A --type--> B)
        const logicalKey = `${edge.from}|${edge.type}|${edge.to}`;
        for (const existingEdge of this.edges.values()) {
            const existingKey = `${existingEdge.from}|${existingEdge.type}|${existingEdge.to}`;
            if (logicalKey === existingKey) {
                throw new Error(`Ya existe una relación de tipo ${edge.type} entre ${edge.from} y ${edge.to}`);
            }
        }

        this.edges.set(edge.id, edge);

        // Actualizar índices
        if (!this.outgoingIndex.has(edge.from)) this.outgoingIndex.set(edge.from, new Set());
        if (!this.incomingIndex.has(edge.to)) this.incomingIndex.set(edge.to, new Set());

        this.outgoingIndex.get(edge.from).add(edge.id);
        this.incomingIndex.get(edge.to).add(edge.id);

        return edge;
    }

    removeEdge(edgeId) {
        const edge = this.edges.get(edgeId);
        if (!edge) return false;

        // Actualizar índices
        this.outgoingIndex.get(edge.from)?.delete(edgeId);
        this.incomingIndex.get(edge.to)?.delete(edgeId);

        return this.edges.delete(edgeId);
    }

    getEdge(edgeId) {
        return this.edges.get(edgeId);
    }

    // --- Relaciones Adyacentes ---

    getOutgoing(nodeId) {
        const edgeIds = this.outgoingIndex.get(nodeId);
        if (!edgeIds) return [];
        return Array.from(edgeIds).map(id => this.edges.get(id));
    }

    getIncoming(nodeId) {
        const edgeIds = this.incomingIndex.get(nodeId);
        if (!edgeIds) return [];
        return Array.from(edgeIds).map(id => this.edges.get(id));
    }

    hasNode(id) {
        return this.nodes.has(id);
    }

    hasEdge(id) {
        return this.edges.has(id);
    }
}
