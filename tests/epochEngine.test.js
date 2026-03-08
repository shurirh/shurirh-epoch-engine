import { describe, it, expect, beforeEach } from 'vitest';
import { EpochEngine, Event, EdgeTypes } from '../src/index.js';

describe('EpochEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new EpochEngine();
    });

    it('should be able to add and retrieve an Event', () => {
        const e1 = new Event({
            id: 'big-bang',
            title: 'The Big Bang',
            date: 0,
            description: 'The start of everything'
        });

        engine.addEvent(e1);
        const result = engine.getEvent('big-bang');

        expect(result).toBeDefined();
        expect(result.title).toBe('The Big Bang');
    });

    it('should relate two events correctly', () => {
        const e1 = new Event({ id: 'e1', title: 'Event 1' });
        const e2 = new Event({ id: 'e2', title: 'Event 2' });

        engine.addEvent(e1);
        engine.addEvent(e2);

        const edge = engine.relate('e1', 'e2', EdgeTypes.PRECEDES);
        expect(edge).toBeDefined();
        expect(edge.type).toBe(EdgeTypes.PRECEDES);

        const outgoing = engine.getOutgoingRelations('e1');
        expect(outgoing.length).toBe(1);
        expect(outgoing[0].to).toBe('e2');
    });

    it('validate() should detect simple chronological inconsistencies', () => {
        const e1 = new Event({ id: 'e1', title: 'Fall of Rome', date: 476 });
        const e2 = new Event({ id: 'e2', title: 'Foundation of Rome', date: -753 });

        engine.addEvent(e1);
        engine.addEvent(e2);

        // Create inconsistent relationship
        engine.relate('e1', 'e2', EdgeTypes.PRECEDES);

        const report = engine.validate();
        expect(report.warnings.length).toBe(1);
        expect(report.warnings[0]).toContain('Chronological inconsistency');
    });

    it('validate() should warn about merges without enough inputs', () => {
        const e1 = new Event({ id: 'e1', title: 'Path A' });
        const e2 = new Event({ id: 'e2', title: 'Confluence' });

        engine.addEvent(e1);
        engine.addEvent(e2);

        // Relate only ONE with 'merges'
        engine.relate('e1', 'e2', EdgeTypes.MERGES);

        const report = engine.validate();
        expect(report.warnings.length).toBe(1);
        expect(report.warnings[0]).toContain('does not receive at least two confluences');
    });

    it('should prevent adding duplicate relations of the same type between the same nodes', () => {
        const e1 = new Event({ id: 'e1', title: 'E1' });
        const e2 = new Event({ id: 'e2', title: 'E2' });
        engine.addEvent(e1);
        engine.addEvent(e2);

        engine.relate('e1', 'e2', EdgeTypes.CAUSES);

        expect(() => {
            engine.relate('e1', 'e2', EdgeTypes.CAUSES);
        }).toThrow(/already exists/);
    });

    it('should be able to import and export a graph from JSON', () => {
        const data = {
            events: [
                { id: 'e1', title: 'Event 1', date: 10 },
                { id: 'e2', title: 'Event 2', date: 20 }
            ],
            relations: [
                { from: 'e1', to: 'e2', type: EdgeTypes.PRECEDES }
            ]
        };

        const report = engine.importJSON(data);
        expect(report.eventsImported).toBe(2);
        expect(report.relationsImported).toBe(1);

        expect(engine.getEvent('e1')).toBeDefined();
        expect(engine.getEvent('e2')).toBeDefined();
        expect(engine.getOutgoingRelations('e1').length).toBe(1);
        expect(engine.getOutgoingRelations('e1')[0].to).toBe('e2');

        const exported = engine.exportJSON();
        expect(exported.events.length).toBe(2);
        expect(exported.relations.length).toBe(1);
        expect(exported.events[0].id).toBe('e1');
    });
});
