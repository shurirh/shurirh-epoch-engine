import { Node } from './node.js';
import { Edge } from './edge.js';
import { i18n } from '../i18n/index.js';

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
            throw new Error(i18n.t('graph.errors.invalidNode'));
        }
        if (this.nodes.has(node.id)) {
            throw new Error(i18n.t('graph.errors.nodeExists', { id: node.id }));
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
            throw new Error(i18n.t('graph.errors.invalidEdge'));
        }
        if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
            throw new Error(i18n.t('graph.errors.missingNodes'));
        }
        if (this.edges.has(edge.id)) {
            throw new Error(i18n.t('graph.errors.edgeExists', { id: edge.id }));
        }

        // Prevent logical duplicates (A --type--> B)
        const logicalKey = `${edge.from}|${edge.type}|${edge.to}`;
        for (const existingEdge of this.edges.values()) {
            const existingKey = `${existingEdge.from}|${existingEdge.type}|${existingEdge.to}`;
            if (logicalKey === existingKey) {
                throw new Error(i18n.t('graph.errors.duplicateRel', { type: edge.type, from: edge.from, to: edge.to }));
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
