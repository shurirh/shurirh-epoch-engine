export default {
    nodes: {
        errors: {
            uniqueID: "Un nodo debe tener un ID único"
        }
    },
    events: {
        errors: {
            uniqueID: "Cada Evento debe tener un id único.",
            title: "Cada Evento debe tener un título.",
            invalidDate: "La propiedad date debe ser de tipo numérico (o null)."
        }
    },
    edges: {
        errors: {
            missingProps: "Una relación (edge) debe tener id, from, to y type"
        }
    },
    graph: {
        errors: {
            invalidNode: "Se debe proporcionar una instancia de Node",
            nodeExists: "El nodo con el ID {id} ya existe",
            invalidEdge: "Se debe proporcionar una instancia de Edge",
            missingNodes: "Ambos nodos (from y to) deben existir en el grafo antes de crear una relación",
            edgeExists: "La relación con el ID {id} ya existe",
            duplicateRel: "Ya existe una relación de tipo {type} entre {from} y {to}"
        }
    },
    engine: {
        errors: {
            invalidEvent: "Se debe proporcionar una instancia de Event",
            invalidRelType: "Tipo de relación no válido: {type}",
            missingOrigin: "El Evento de origen con id '{id}' no existe.",
            missingDestination: "El Evento de destino con id '{id}' no existe."
        },
        warnings: {
            chronologicalInconsistency: "Inconsistencia cronológica: El Evento '{fromTitle}' precede a '{toTitle}', pero la fecha de origen ({fromDate}) es posterior a la de destino ({toDate}).",
            crossesBranches: "La relación 'precedes' entre '{fromTitle}' y '{toTitle}' cruza ramas diferentes declaradas en meta ({fromBranch} -> {toBranch}).",
            missingOriginBranch: "El Evento de destino '{title}' es producto de un 'branches' pero no declara una rama de origen en su meta.",
            missingMerges: "El Evento '{title}' es destino de una relación 'merges', pero no recibe al menos dos confluencias de este tipo."
        }
    },
    io: {
        errors: {
            invalidJSON: "Formato JSON no válido. Debe contener \"events\" y \"relations\" como arreglos.",
            importRelation: "Error importando relación de {from} a {to}: {message}"
        },
        warnings: {
            duplicateEvent: "El Evento con el ID {id} ya existe. Omitiendo."
        }
    },
    csv: {
        warnings: {
            parseMeta: "Fallo al parsear meta para el evento {id}"
        }
    },
    renderer: {
        errors: {
            missingContainer: "Se requiere un elemento contenedor"
        }
    }
};
