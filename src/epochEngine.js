import { Graph, Node, Edge, EdgeTypes } from './graph.js';
import { Suceso } from './suceso.js';

export class EpochEngine {
    constructor() {
        this.graph = new Graph();
    }

    /**
     * Agrega un Suceso al motor temporal.
     * Internamente lo envuelve en un Node del Graph.
     * @param {Suceso} suceso 
     */
    addSuceso(suceso) {
        if (!(suceso instanceof Suceso)) {
            throw new Error('Debe proporcionar una instancia de Suceso');
        }
        const node = new Node(suceso.id, suceso);
        this.graph.addNode(node);
        return suceso;
    }

    /**
     * Elimina un Suceso y todas sus relaciones del motor.
     * @param {string} id 
     */
    removeSuceso(id) {
        return this.graph.removeNode(id);
    }

    /**
     * Devuelve el Suceso a partir de su ID.
     * @param {string} id 
     * @returns {Suceso|undefined}
     */
    getSuceso(id) {
        const node = this.graph.getNode(id);
        return node ? node.data : undefined;
    }

    /**
     * Crea una relación semántica entre dos Sucesos.
     * @param {string} fromId - ID del suceso origen
     * @param {string} toId - ID del suceso destino
     * @param {string} type - Tipo de relación ('precedes', 'causes', 'branches', 'merges', 'loops')
     * @param {Object} metadata - Metadatos opcionales de la relación
     */
    relate(fromId, toId, type, metadata = {}) {
        const fromNode = this.graph.getNode(fromId);
        const toNode = this.graph.getNode(toId);

        if (!fromNode) throw new Error(`El Suceso origen con id '${fromId}' no existe.`);
        if (!toNode) throw new Error(`El Suceso destino con id '${toId}' no existe.`);

        // Creamos un ID único usando crypto si está en entorno Node o web APIs (o simple math random fallback)
        const edgeId = `${fromId}-${type}-${toId}-${Date.now()}`;
        const edge = new Edge(edgeId, fromId, toId, type, metadata);

        this.graph.addEdge(edge);
        return edge;
    }

    /**
     * Importa un grafo completo desde un objeto JSON.
     * @param {Object} data - Objeto con { events: [], relations: [] }
     */
    importJSON(data) {
        if (!data || !Array.isArray(data.events) || !Array.isArray(data.relations)) {
            throw new Error('Formato JSON inválido. Debe contener "events" y "relations" como arrays.');
        }

        // 1. Crear e insertar Sucesos
        data.events.forEach(evData => {
            const suceso = new Suceso({
                id: evData.id,
                title: evData.title,
                description: evData.description,
                date: evData.date,
                tags: evData.tags,
                meta: evData.meta
            });
            this.addSuceso(suceso);
        });

        // 2. Crear relaciones
        data.relations.forEach(relData => {
            this.relate(relData.from, relData.to, relData.type, relData.metadata);
        });
    }

    /**
     * Devuelve todas las relaciones de salida de un Suceso.
     * @param {string} sucesoId 
     */
    getOutgoingRelations(sucesoId) {
        return this.graph.getOutgoing(sucesoId);
    }

    /**
     * Devuelve todas las relaciones de entrada a un Suceso.
     * @param {string} sucesoId 
     */
    getIncomingRelations(sucesoId) {
        return this.graph.getIncoming(sucesoId);
    }

    /**
     * Valida la consistencia temporal de todas las ramas y sucesos.
     * No detiene la ejecución, devuelve una lista de advertencias y errores.
     * @returns {Object} { warnings: Array<string>, errors: Array<string> }
     */
    validate() {
        const report = { warnings: [], errors: [] };

        for (const edge of this.graph.edges.values()) {
            const fromSuceso = this.graph.getNode(edge.from).data;
            const toSuceso = this.graph.getNode(edge.to).data;

            // Validar relaciones 'precedes'
            if (edge.type === EdgeTypes.PRECEDES) {
                // Si ambas tienen fechas, validamos consistencia cronológica básica
                // Se asume que si hay una relación precede, debe haber coherencia local de tiempo
                if (fromSuceso.date !== null && toSuceso.date !== null) {
                    if (fromSuceso.date > toSuceso.date) {
                        report.warnings.push(
                            `Inconsistencia cronológica: Suceso '${fromSuceso.title}' precede a '${toSuceso.title}', pero la fecha de origen (${fromSuceso.date}) es posterior a la de destino (${toSuceso.date}).`
                        );
                    }
                }

                // Opcional: Warning si atraviesan ramas declaradas en meta
                const fromBranch = fromSuceso.meta?.originBranch;
                const toBranch = toSuceso.meta?.originBranch;
                if (fromBranch && toBranch && fromBranch !== toBranch) {
                    report.warnings.push(
                        `Relación 'precedes' entre '${fromSuceso.title}' y '${toSuceso.title}' atraviesa distintas ramas declaradas en meta (${fromBranch} -> ${toBranch}).`
                    );
                }
            }

            // Validar 'branches'
            if (edge.type === EdgeTypes.BRANCHES) {
                // Advertencia si el destino no declara una nueva rama en meta (opcional según spec)
                if (!toSuceso.meta?.originBranch) {
                    report.warnings.push(
                        `Suceso destino '${toSuceso.title}' es producto de un 'branches' pero no declara una rama de origen en su meta.`
                    );
                }
            }

            // Validar 'merges'
            if (edge.type === EdgeTypes.MERGES) {
                const toId = edge.to;
                const incomingMergesCount = this.graph.getIncoming(toId).filter(e => e.type === EdgeTypes.MERGES).length;
                if (incomingMergesCount < 2) {
                    report.warnings.push(
                        `Suceso '${toSuceso.title}' es destino de una relación 'merges', pero no recibe al menos dos confluencias de este tipo.`
                    );
                }
            }
        }

        return report;
    }
}
