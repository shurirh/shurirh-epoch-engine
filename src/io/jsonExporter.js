/**
 * Exports the complete state of the engine as a JSON object.
 * @param {EpochEngine} engine - Instance of EpochEngine
 * @returns {Object} { events: [], relations: [] }
 */
export function exportJSON(engine) {
    const events = [];
    const relations = [];

    // Export Events (stored in Node.data)
    for (const node of engine.graph.nodes.values()) {
        const event = node.data;
        events.push({
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            tags: event.tags,
            meta: event.meta
        });
    }

    // Export Relations (Edges)
    for (const edge of engine.graph.edges.values()) {
        relations.push({
            id: edge.id,
            from: edge.from,
            to: edge.to,
            type: edge.type,
            metadata: edge.metadata
        });
    }

    return {
        events,
        relations
    };
}
