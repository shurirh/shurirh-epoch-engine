import { Graph } from './graph.js';
import { Node } from './node.js';
import { Edge, EdgeTypes } from './edge.js';
import { Event } from './event.js';
import { importJSON as ioImportJSON } from '../io/jsonImporter.js';
import { exportJSON as ioExportJSON } from '../io/jsonExporter.js';

export class EpochEngine {
    constructor() {
        this.graph = new Graph();
    }

    /**
     * Adds an Event to the temporal engine.
     * Internally wraps it in a Node of the Graph.
     * @param {Event} event 
     */
    addEvent(event) {
        if (!(event instanceof Event)) {
            throw new Error('Must provide an Event instance');
        }
        const node = new Node(event.id, event);
        this.graph.addNode(node);
        return event;
    }

    /**
     * Removes an Event and all its relations from the engine.
     * @param {string} id 
     */
    removeEvent(id) {
        return this.graph.removeNode(id);
    }

    /**
     * Returns the Event by its ID.
     * @param {string} id 
     * @returns {Event|undefined}
     */
    getEvent(id) {
        const node = this.graph.getNode(id);
        return node ? node.data : undefined;
    }

    /**
     * Creates a semantic relationship between two Events.
     * @param {string} fromId - Origin event ID
     * @param {string} toId - Destination event ID
     * @param {string} type - Relationship type ('precedes', 'causes', 'branches', 'merges', 'loops')
     * @param {Object} metadata - Optional relationship metadata
     */
    relate(fromId, toId, type, metadata = {}) {
        if (!Object.values(EdgeTypes).includes(type)) {
            throw new Error(`Invalid relationship type: ${type}`);
        }

        const fromNode = this.graph.getNode(fromId);
        const toNode = this.graph.getNode(toId);

        if (!fromNode) throw new Error(`Origin Event with id '${fromId}' does not exist.`);
        if (!toNode) throw new Error(`Destination Event with id '${toId}' does not exist.`);

        // Generate a unique ID using crypto.randomUUID()
        const edgeId = crypto.randomUUID();
        const edge = new Edge(edgeId, fromId, toId, type, metadata);

        this.graph.addEdge(edge);
        return edge;
    }

    /**
     * Imports a complete graph from a JSON object.
     * @param {Object} data - Object with { events: [], relations: [] }
     */
    importJSON(data) {
        return ioImportJSON(this, data);
    }

    /**
     * Exports the state of the engine as JSON.
     */
    exportJSON() {
        return ioExportJSON(this);
    }

    /**
     * Returns all outgoing relations from an Event.
     * @param {string} eventId 
     */
    getOutgoingRelations(eventId) {
        return this.graph.getOutgoing(eventId);
    }

    /**
     * Returns all incoming relations to an Event.
     * @param {string} eventId 
     */
    getIncomingRelations(eventId) {
        return this.graph.getIncoming(eventId);
    }

    /**
     * Validates the temporal consistency of all branches and events.
     * Does not stop execution, returns a list of warnings and errors.
     * @returns {Object} { warnings: Array<string>, errors: Array<string> }
     */
    validate() {
        const report = { warnings: [], errors: [] };

        for (const edge of this.graph.edges.values()) {
            const fromEvent = this.graph.getNode(edge.from).data;
            const toEvent = this.graph.getNode(edge.to).data;

            // Validate 'precedes' relations
            if (edge.type === EdgeTypes.PRECEDES) {
                // If both have dates, validate basic chronological consistency
                if (fromEvent.date !== null && toEvent.date !== null) {
                    if (fromEvent.date > toEvent.date) {
                        report.warnings.push(
                            `Chronological inconsistency: Event '${fromEvent.title}' precedes '${toEvent.title}', but origin date (${fromEvent.date}) is after destination date (${toEvent.date}).`
                        );
                    }
                }

                // Optional: Warning if they cross branches declared in meta
                const fromBranch = fromEvent.meta?.originBranch;
                const toBranch = toEvent.meta?.originBranch;
                if (fromBranch && toBranch && fromBranch !== toBranch) {
                    report.warnings.push(
                        `'precedes' relationship between '${fromEvent.title}' and '${toEvent.title}' crosses different branches declared in meta (${fromBranch} -> ${toBranch}).`
                    );
                }
            }

            // Validate 'branches'
            if (edge.type === EdgeTypes.BRANCHES) {
                if (!toEvent.meta?.originBranch) {
                    report.warnings.push(
                        `Destination Event '${toEvent.title}' is a product of a 'branches' but does not declare an origin branch in its meta.`
                    );
                }
            }

            // Validate 'merges'
            if (edge.type === EdgeTypes.MERGES) {
                const toId = edge.to;
                const incomingMergesCount = this.graph.getIncoming(toId).filter(e => e.type === EdgeTypes.MERGES).length;
                if (incomingMergesCount < 2) {
                    report.warnings.push(
                        `Event '${toEvent.title}' is a destination of a 'merges' relationship, but does not receive at least two confluences of this type.`
                    );
                }
            }
        }

        return report;
    }
}
