# TEMPORAL ENGINE SPECIFICATION
Version: 0.1
Status: Draft
Language Target: JavaScript (Vanilla)
Architecture Style: Layered (Graph Core + Temporal Engine)

---

## 1. Objective

Design and implement a narrative temporal engine capable of representing:

- Events ("Sucesos")
- Directed relationships between events
- Branching timelines
- Merging timelines
- Cycles (time loops)
- Optional chronological anchoring (dates)

The system must separate:

1. Graph structure (infrastructure layer)
2. Narrative domain model (Suceso)
3. Temporal validation logic
4. Future visualization layer (out of scope for v0.1)

---

## 2. Core Architecture Overview

Layer 1 → Graph (generic, domain-agnostic)  
Layer 2 → Suceso (domain model)  
Layer 3 → TemporalEngine (rules + validation)  

The Graph must not contain temporal logic.  
Temporal semantics are handled by TemporalEngine.

---

## 3. Graph Layer (Generic Directed Graph)

### 3.1 Requirements

- Directed
- Allows cycles
- Supports typed edges
- Supports metadata on nodes and edges
- Domain independent

---

### 3.2 Node Structure

```js
{
  id: string,
  data: any,
  metadata?: object
}

---

3.3 Edge Structure
{
  id: string,
  from: string, // nodeId
  to: string,   // nodeId
  type: string,
  metadata?: object
}

3.4 Graph Structure
class Graph {
  nodes: Map<string, Node>
  edges: Map<string, Edge>

  addNode(node)
  removeNode(nodeId)
  getNode(nodeId)

  addEdge(edge)
  removeEdge(edgeId)
  getEdge(edgeId)

  getOutgoing(nodeId)
  getIncoming(nodeId)
}

--
4. Suceso (Narrative Event Model)
Represents the atomic narrative unit.

4.1 Structure
{
  id: string,
  title: string,
  description?: string,
  date?: number | string | Date,
  branch?: string,
  tags?: string[],
  meta?: object
}

4.2 Rules
- date is optional.
- branch is optional.
- Suceso does NOT store relationships internally.
- Relationships are defined exclusively via Graph edges.

--
5. Temporal Relationship Types (Initial Set)

The system must support typed edges.

Initial supported types:
- precedes
  - A occurs before B.
- causes
  - A is a direct cause of B.
- branches
  - A creates a new timeline branch starting at B.
- merges
  -Multiple branches converge into a single event.
- loops
  - A connects to a previous event (cycle).

These are semantic labels. The Graph does not enforce meaning; the TemporalEngine does.

--
6. TemporalEngine Layer

Wraps Graph and enforces temporal semantics.

6.1 Responsibilities
- Add Sucesos
- Create typed relations
- Validate temporal consistency
- Provide structural inspection methods

6.2 Suggested Interface
class TemporalEngine {
  constructor()

  addSuceso(suceso)
  removeSuceso(id)

  relate(fromId, toId, type, metadata?)

  validate()

  getSuceso(id)
  getBranch(branchId)
}

--
7. Validation Rules (Initial Version)

Validation does NOT block operations by default.
It returns structured warnings and errors.

7.1 Structural Validation
- Edge cannot exist if either node does not exist.
- Node IDs must be unique.
- Edge IDs must be unique.

7.2 Temporal Consistency Rules

1. precedes relation:
  - If both nodes have a date AND belong to the same branch:
    - from.date must be earlier than to.date.
  - Otherwise, issue a warning.
2. branches relation:
  - Destination node should belong to a different branch.
  - If branch metadata is missing, issue warning.
3. merges relation:
  - Destination node should have at least two incoming edges of type merges.
4. loops relation:
  - Cycles are allowed.
  - Validator may detect cycles and report them as informational.

8. Design Principles
- Creativity-first: system allows structural freedom.
- Validation is explicit, not automatic blocking.
- Separation of concerns between structure and semantics.
- Extensible relationship types.
- Branches are logical constructs, not hard partitions.

--
9. Out of Scope (v0.1)
- UI rendering
- Performance optimizations
- Persistent storage
- Graph serialization format
- Versioning
- Conflict resolution strategies

--
10. Future Extensions (Optional)
- Branch inheritance
- Immutable canonical events
- Temporal locking
- Causal dependency graph analysis
- Parallel universes abstraction
- Deterministic event simulation