import { Node } from './node.js';
import { Edge } from './edge.js';

/**
 * Directed Graph Structure.
 * Manages Nodes and Edges without applying temporal semantic logic.
 */
export class Graph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        // Indices for fast O(1) adjacency lookup
        this.outgoingIndex = new Map(); // Map<nodeId, Set<edgeId>>
        this.incomingIndex = new Map(); // Map<nodeId, Set<edgeId>>
    }

    // --- Nodes ---

    addNode(node) {
        if (!(node instanceof Node)) {
            throw new Error('Must provide a Node instance');
        }
        if (this.nodes.has(node.id)) {
            throw new Error(`Node with ID ${node.id} already exists`);
        }
        this.nodes.set(node.id, node);
        return node;
    }

    removeNode(nodeId) {
        if (!this.nodes.has(nodeId)) return false;

        // Remove outgoing edges
        const outgoing = this.outgoingIndex.get(nodeId);
        if (outgoing) {
            for (const edgeId of outgoing) {
                this.removeEdge(edgeId);
            }
        }

        // Remove incoming edges
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

    // --- Edges ---

    addEdge(edge) {
        if (!(edge instanceof Edge)) {
            throw new Error('Must provide an Edge instance');
        }
        if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
            throw new Error('Both nodes (from and to) must exist in the graph before creating an edge');
        }
        if (this.edges.has(edge.id)) {
            throw new Error(`Edge with ID ${edge.id} already exists`);
        }

        // Prevent logical duplicates (A --type--> B)
        const logicalKey = `${edge.from}|${edge.type}|${edge.to}`;
        for (const existingEdge of this.edges.values()) {
            const existingKey = `${existingEdge.from}|${existingEdge.type}|${existingEdge.to}`;
            if (logicalKey === existingKey) {
                throw new Error(`A relationship of type ${edge.type} already exists between ${edge.from} and ${edge.to}`);
            }
        }

        this.edges.set(edge.id, edge);

        // Update indices
        if (!this.outgoingIndex.has(edge.from)) this.outgoingIndex.set(edge.from, new Set());
        if (!this.incomingIndex.has(edge.to)) this.incomingIndex.set(edge.to, new Set());

        this.outgoingIndex.get(edge.from).add(edge.id);
        this.incomingIndex.get(edge.to).add(edge.id);

        return edge;
    }

    removeEdge(edgeId) {
        const edge = this.edges.get(edgeId);
        if (!edge) return false;

        // Update indices
        this.outgoingIndex.get(edge.from)?.delete(edgeId);
        this.incomingIndex.get(edge.to)?.delete(edgeId);

        return this.edges.delete(edgeId);
    }

    getEdge(edgeId) {
        return this.edges.get(edgeId);
    }

    getTimeline() {
        return Array.from(this.nodes.values()).sort((a, b) => (a.data.date || 0) - (b.data.date || 0));
    }

    // --- Adjacent Relationships ---

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
