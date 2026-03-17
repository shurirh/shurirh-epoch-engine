import { Event } from '../core/event.js';
import { i18n } from '../i18n/index.js';

/**
 * Imports a complete graph from a JSON object.
 * @param {EpochEngine} engine - Instance of EpochEngine
 * @param {Object} data - Object with { events: [], relations: [] }
 * @returns {Object} Report { eventsImported: number, relationsImported: number }
 */
export function importJSON(engine, data) {
    if (!data || !Array.isArray(data.events) || !Array.isArray(data.relations)) {
        throw new Error(i18n.t('io.errors.invalidJSON'));
    }

    let eventsImported = 0;
    let relationsImported = 0;

    // 1. Create and insert Events
    data.events.forEach(evData => {
        // Validation for duplicate IDs (if engine already has it)
        if (engine.getEvent(evData.id)) {
            console.warn(i18n.t('io.warnings.duplicateEvent', { id: evData.id }));
            return;
        }

        const event = new Event({
            id: evData.id,
            title: evData.title,
            description: evData.description,
            date: evData.date,
            tags: evData.tags,
            meta: evData.meta
        });
        engine.addEvent(event);
        eventsImported++;
    });

    // 2. Create relationships
    data.relations.forEach(relData => {
        try {
            engine.relate(relData.from, relData.to, relData.type, relData.metadata);
            relationsImported++;
        } catch (error) {
            console.error(i18n.t('io.errors.importRelation', { from: relData.from, to: relData.to, message: error.message }));
        }
    });

    return {
        eventsImported,
        relationsImported
    };
}
