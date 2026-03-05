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

        // Validar relaciones 'precedes'
        for (const edge of this.graph.edges.values()) {
            if (edge.type === EdgeTypes.PRECEDES) {
                const fromSuceso = this.graph.getNode(edge.from).data;
                const toSuceso = this.graph.getNode(edge.to).data;

                // Comprobación de consistencia temporal en la misma rama si ambas tienen fechas comparables
                if (
                    fromSuceso.date !== null &&
                    toSuceso.date !== null &&
                    fromSuceso.branch === toSuceso.branch
                ) {
                    try {
                        // Intentar coerción a Number (ej. si son timestamps o fechas simples numéricas)
                        // Si son Date objects, al restar/comparar se tratarán como timestamp
                        const d1 = new Date(fromSuceso.date).getTime();
                        const d2 = new Date(toSuceso.date).getTime();

                        if (!isNaN(d1) && !isNaN(d2) && d1 > d2) {
                            report.warnings.push(
                                `Inconsistencia cronológica: Suceso '${fromSuceso.title}' precede a '${toSuceso.title}', pero la fecha de origen (${fromSuceso.date}) es posterior a la de destino (${toSuceso.date}).`
                            );
                        }
                    } catch (e) {
                        // Falla silenciosa si los formatos de fecha son oscuros o strings libres no comparables (ej. 'Era II')
                    }
                } else if (fromSuceso.branch !== toSuceso.branch) {
                    report.warnings.push(
                        `Relación 'precedes' entre '${fromSuceso.title}' y '${toSuceso.title}' atraviesa distintas ramas (${fromSuceso.branch} -> ${toSuceso.branch}). Tal vez debería ser 'branches' o 'merges'.`
                    );
                }
            }

            // Validar 'branches'
            if (edge.type === EdgeTypes.BRANCHES) {
                const toSuceso = this.graph.getNode(edge.to).data;
                if (!toSuceso.branch) {
                    report.warnings.push(
                        `Suceso destino '${toSuceso.title}' es producto de un 'branches' pero no tiene una rama definida en sus propiedades.`
                    );
                }
            }

            // Validar 'merges'
            if (edge.type === EdgeTypes.MERGES) {
                const toId = edge.to;
                const toNode = this.graph.getNode(toId);

                // Contar cuántos 'merges' llegan a este nodo
                const incomingMergesCount = this.graph.getIncoming(toId).filter(e => e.type === EdgeTypes.MERGES).length;
                if (incomingMergesCount < 2) {
                    report.warnings.push(
                        `Suceso '${toNode.data.title}' es destino de una relación 'merges', pero no recibe al menos dos confluencias de este tipo.`
                    );
                }
            }
        }

        return report;
    }
}
