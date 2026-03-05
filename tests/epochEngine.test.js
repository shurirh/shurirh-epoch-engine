import { describe, it, expect, beforeEach } from 'vitest';
import { EpochEngine, Suceso, EdgeTypes } from '../src/index.js';

describe('EpochEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new EpochEngine();
    });

    it('debería poder agregar y recuperar un Suceso', () => {
        const s1 = new Suceso({
            id: 'big-bang',
            title: 'El Big Bang',
            date: 0,
            description: 'El inicio de todo'
        });

        engine.addSuceso(s1);
        const result = engine.getSuceso('big-bang');

        expect(result).toBeDefined();
        expect(result.title).toBe('El Big Bang');
    });

    it('debería relacionar dos sucesos correctamente', () => {
        const s1 = new Suceso({ id: 's1', title: 'Suceso 1' });
        const s2 = new Suceso({ id: 's2', title: 'Suceso 2' });

        engine.addSuceso(s1);
        engine.addSuceso(s2);

        const edge = engine.relate('s1', 's2', EdgeTypes.PRECEDES);
        expect(edge).toBeDefined();
        expect(edge.type).toBe(EdgeTypes.PRECEDES);

        const outgoing = engine.getOutgoingRelations('s1');
        expect(outgoing.length).toBe(1);
        expect(outgoing[0].to).toBe('s2');
    });

    it('validate() debería detectar inconsistencias cronológicas simples', () => {
        // Si s1 ocurre DESPUÉS que s2, pero s1 PRECEDES a s2, hay un error cronológico.
        const s1 = new Suceso({ id: 's1', title: 'Caída de Roma', date: 476 });
        const s2 = new Suceso({ id: 's2', title: 'Fundación de Roma', date: -753 });

        engine.addSuceso(s1);
        engine.addSuceso(s2);

        // Creamos la relación inconsistente
        engine.relate('s1', 's2', EdgeTypes.PRECEDES);

        const report = engine.validate();
        expect(report.warnings.length).toBe(1);
        expect(report.warnings[0]).toContain('Inconsistencia cronológica');
    });

    it('validate() debería advertir sobre merges sin suficientes entradas', () => {
        const s1 = new Suceso({ id: 's1', title: 'Ruta A' });
        const s2 = new Suceso({ id: 's2', title: 'Confluencia' });

        engine.addSuceso(s1);
        engine.addSuceso(s2);

        // Relacionamos solo UNO con 'merges'
        engine.relate('s1', 's2', EdgeTypes.MERGES);

        const report = engine.validate();
        expect(report.warnings.length).toBe(1);
        expect(report.warnings[0]).toContain('no recibe al menos dos confluencias');
    });

    it('validate() no debería emitir alertas si los sucesos son cronológicamente consistentes', () => {
        const s1 = new Suceso({ id: 's1', title: 'Evento 1', date: 100 });
        const s2 = new Suceso({ id: 's2', title: 'Evento 2', date: 200 });

        engine.addSuceso(s1);
        engine.addSuceso(s2);

        engine.relate('s1', 's2', EdgeTypes.PRECEDES);

        const report = engine.validate();
        expect(report.warnings.length).toBe(0);
        expect(report.errors.length).toBe(0);
    });

    it('debería impedir añadir relaciones duplicadas del mismo tipo entre los mismos nodos', () => {
        const s1 = new Suceso({ id: 's1', title: 'S1' });
        const s2 = new Suceso({ id: 's2', title: 'S2' });
        engine.addSuceso(s1);
        engine.addSuceso(s2);

        engine.relate('s1', 's2', EdgeTypes.CAUSES);

        expect(() => {
            engine.relate('s1', 's2', EdgeTypes.CAUSES);
        }).toThrow(/Ya existe una relación/);
    });

    it('debería poder importar un grafo desde JSON', () => {
        const data = {
            events: [
                { id: 'e1', title: 'Evento 1', date: 10 },
                { id: 'e2', title: 'Evento 2', date: 20 }
            ],
            relations: [
                { from: 'e1', to: 'e2', type: EdgeTypes.PRECEDES }
            ]
        };

        engine.importJSON(data);

        expect(engine.getSuceso('e1')).toBeDefined();
        expect(engine.getSuceso('e2')).toBeDefined();
        expect(engine.getOutgoingRelations('e1').length).toBe(1);
        expect(engine.getOutgoingRelations('e1')[0].to).toBe('e2');
    });
});
