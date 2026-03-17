export default {
    nodes: {
        errors: {
            uniqueID: "A node must have a unique ID"
        }
    },
    events: {
        errors: {
            uniqueID: "Every Event must have a unique id.",
            title: "Every Event must have a title.",
            invalidDate: "The date property must be of type number (or null)."
        }
    },
    edges: {
        errors: {
            missingProps: "An edge must have id, from, to and type"
        }
    },
    graph: {
        errors: {
            invalidNode: "Must provide a Node instance",
            nodeExists: "Node with ID {id} already exists",
            invalidEdge: "Must provide an Edge instance",
            missingNodes: "Both nodes (from and to) must exist in the graph before creating an edge",
            edgeExists: "Edge with ID {id} already exists",
            duplicateRel: "A relationship of type {type} already exists between {from} and {to}"
        }
    },
    engine: {
        errors: {
            invalidEvent: "Must provide an Event instance",
            invalidRelType: "Invalid relationship type: {type}",
            missingOrigin: "Origin Event with id '{id}' does not exist.",
            missingDestination: "Destination Event with id '{id}' does not exist."
        },
        warnings: {
            chronologicalInconsistency: "Chronological inconsistency: Event '{fromTitle}' precedes '{toTitle}', but origin date ({fromDate}) is after destination date ({toDate}).",
            crossesBranches: "'precedes' relationship between '{fromTitle}' and '{toTitle}' crosses different branches declared in meta ({fromBranch} -> {toBranch}).",
            missingOriginBranch: "Destination Event '{title}' is a product of a 'branches' but does not declare an origin branch in its meta.",
            missingMerges: "Event '{title}' is a destination of a 'merges' relationship, but does not receive at least two confluences of this type."
        }
    },
    io: {
        errors: {
            invalidJSON: "Invalid JSON format. Must contain \"events\" and \"relations\" as arrays.",
            importRelation: "Error importing relation from {from} to {to}: {message}"
        },
        warnings: {
            duplicateEvent: "Event with ID {id} already exists. Skipping."
        }
    },
    csv: {
        warnings: {
            parseMeta: "Failed to parse meta for event {id}"
        }
    },
    renderer: {
        errors: {
            missingContainer: "A container element is required"
        }
    }
};
