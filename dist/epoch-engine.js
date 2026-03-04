class c {
  constructor(e, o = {}, t = {}) {
    if (!e) throw new Error("Un nodo debe tener un ID único");
    this.id = e, this.data = o, this.metadata = t;
  }
}
class h {
  constructor(e, o, t, r, s = {}) {
    if (!e || !o || !t || !r)
      throw new Error("Una arista debe tener id, from, to y type");
    this.id = e, this.from = o, this.to = t, this.type = r, this.metadata = s;
  }
}
class g {
  constructor() {
    this.nodes = /* @__PURE__ */ new Map(), this.edges = /* @__PURE__ */ new Map();
  }
  // --- Nodos ---
  addNode(e) {
    if (!(e instanceof c))
      throw new Error("Debe proporcionar una instancia de Node");
    if (this.nodes.has(e.id))
      throw new Error(`El nodo con ID ${e.id} ya existe`);
    return this.nodes.set(e.id, e), e;
  }
  removeNode(e) {
    if (!this.nodes.has(e)) return !1;
    const o = [];
    for (const t of this.edges.values())
      (t.from === e || t.to === e) && o.push(t.id);
    return o.forEach((t) => this.removeEdge(t)), this.nodes.delete(e);
  }
  getNode(e) {
    return this.nodes.get(e);
  }
  // --- Aristas ---
  addEdge(e) {
    if (!(e instanceof h))
      throw new Error("Debe proporcionar una instancia de Edge");
    if (!this.nodes.has(e.from) || !this.nodes.has(e.to))
      throw new Error("Ambos nodos (from y to) deben existir en el grafo antes de crear una arista");
    if (this.edges.has(e.id))
      throw new Error(`La arista con ID ${e.id} ya existe`);
    return this.edges.set(e.id, e), e;
  }
  removeEdge(e) {
    return this.edges.delete(e);
  }
  getEdge(e) {
    return this.edges.get(e);
  }
  // --- Relaciones Adyacentes ---
  getOutgoing(e) {
    const o = [];
    for (const t of this.edges.values())
      t.from === e && o.push(t);
    return o;
  }
  getIncoming(e) {
    const o = [];
    for (const t of this.edges.values())
      t.to === e && o.push(t);
    return o;
  }
}
class u {
  /**
   * @param {Object} params - Propiedades del suceso
   * @param {string} params.id - Identificador único obligatorio (ej. UUID)
   * @param {string} params.title - Título o nombre corto del suceso
   * @param {string} [params.description=''] - Descripción ampliada
   * @param {any} [params.date=null] - Fecha opcional (puede ser número, string o Date)
   * @param {string} [params.branch=null] - Rama temporal a la que pertenece inicialmente (opcional)
   * @param {Array<string>} [params.tags=[]] - Etiquetas para agrupar o filtrar
   * @param {Object} [params.meta={}] - Metadatos adicionales arbitrarios 
   */
  constructor({
    id: e,
    title: o,
    description: t = "",
    date: r = null,
    branch: s = null,
    tags: n = [],
    meta: i = {}
  }) {
    if (!e)
      throw new Error("Todo Suceso debe tener un id único.");
    if (!o)
      throw new Error("Todo Suceso debe tener un título.");
    this.id = e, this.title = o, this.description = t, this.date = r, this.branch = s, this.tags = Array.isArray(n) ? n : [], this.meta = typeof i == "object" && i !== null ? i : {};
  }
}
class p {
  constructor() {
    this.graph = new g();
  }
  /**
   * Agrega un Suceso al motor temporal.
   * Internamente lo envuelve en un Node del Graph.
   * @param {Suceso} suceso 
   */
  addSuceso(e) {
    if (!(e instanceof u))
      throw new Error("Debe proporcionar una instancia de Suceso");
    const o = new c(e.id, e);
    return this.graph.addNode(o), e;
  }
  /**
   * Elimina un Suceso y todas sus relaciones del motor.
   * @param {string} id 
   */
  removeSuceso(e) {
    return this.graph.removeNode(e);
  }
  /**
   * Devuelve el Suceso a partir de su ID.
   * @param {string} id 
   * @returns {Suceso|undefined}
   */
  getSuceso(e) {
    const o = this.graph.getNode(e);
    return o ? o.data : void 0;
  }
  /**
   * Crea una relación semántica entre dos Sucesos.
   * @param {string} fromId - ID del suceso origen
   * @param {string} toId - ID del suceso destino
   * @param {string} type - Tipo de relación ('precedes', 'causes', 'branches', 'merges', 'loops')
   * @param {Object} metadata - Metadatos opcionales de la relación
   */
  relate(e, o, t, r = {}) {
    const s = this.graph.getNode(e), n = this.graph.getNode(o);
    if (!s) throw new Error(`El Suceso origen con id '${e}' no existe.`);
    if (!n) throw new Error(`El Suceso destino con id '${o}' no existe.`);
    const i = `${e}-${t}-${o}-${Date.now()}`, d = new h(i, e, o, t, r);
    return this.graph.addEdge(d), d;
  }
  /**
   * Devuelve todas las relaciones de salida de un Suceso.
   * @param {string} sucesoId 
   */
  getOutgoingRelations(e) {
    return this.graph.getOutgoing(e);
  }
  /**
   * Devuelve todas las relaciones de entrada a un Suceso.
   * @param {string} sucesoId 
   */
  getIncomingRelations(e) {
    return this.graph.getIncoming(e);
  }
  /**
   * Valida la consistencia temporal de todas las ramas y sucesos.
   * No detiene la ejecución, devuelve una lista de advertencias y errores.
   * @returns {Object} { warnings: Array<string>, errors: Array<string> }
   */
  validate() {
    const e = { warnings: [], errors: [] };
    for (const o of this.graph.edges.values()) {
      if (o.type === "precedes") {
        const t = this.graph.getNode(o.from).data, r = this.graph.getNode(o.to).data;
        if (t.date !== null && r.date !== null && t.branch === r.branch)
          try {
            const s = new Date(t.date).getTime(), n = new Date(r.date).getTime();
            !isNaN(s) && !isNaN(n) && s > n && e.warnings.push(
              `Inconsistencia cronológica: Suceso '${t.title}' precede a '${r.title}', pero la fecha de origen (${t.date}) es posterior a la de destino (${r.date}).`
            );
          } catch {
          }
        else t.branch !== r.branch && e.warnings.push(
          `Relación 'precedes' entre '${t.title}' y '${r.title}' atraviesa distintas ramas (${t.branch} -> ${r.branch}). Tal vez debería ser 'branches' o 'merges'.`
        );
      }
      if (o.type === "branches") {
        const t = this.graph.getNode(o.to).data;
        t.branch || e.warnings.push(
          `Suceso destino '${t.title}' es producto de un 'branches' pero no tiene una rama definida en sus propiedades.`
        );
      }
      if (o.type === "merges") {
        const t = o.to, r = this.graph.getNode(t);
        this.graph.getIncoming(t).filter((n) => n.type === "merges").length < 2 && e.warnings.push(
          `Suceso '${r.data.title}' es destino de una relación 'merges', pero no recibe al menos dos confluencias de este tipo.`
        );
      }
    }
    return e;
  }
}
export {
  h as Edge,
  p as EpochEngine,
  g as Graph,
  c as Node,
  u as Suceso
};
