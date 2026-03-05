import { EdgeTypes, EpochEngine, Suceso } from '../src/index.js';

const output = document.getElementById('output');
const btn = document.getElementById('run-demo');

function log(msg, type = 'info') {
    const line = document.createElement('div');
    line.textContent = `> ${msg}`;
    if (type === EdgeTypes.SUCCESS) line.className = 'success';
    if (type === EdgeTypes.WARNING) line.className = 'warning';
    output.appendChild(line);
}

function runSimulation() {
    output.innerHTML = '';
    log('Instanciando EpochEngine v0.2...', 'info');

    const engine = new EpochEngine();

    // Datos maestros en formato JSON (Capa de Importación)
    const dataset = {
        events: [
            { id: 'roma-01', title: 'Nacimiento de la República', date: -509 },
            { id: 'roma-02', title: 'Caída de la República', date: -27 },
            { id: 'nexus', title: 'Julio César no es asesinado', meta: { originBranch: 'Variant-616' } },
            { id: 'future-01', title: 'Invento de la máquina del tiempo', date: 2024 },
            { id: 'future-02', title: 'Regreso al pasado', date: 0 }
        ],
        relations: [
            { from: 'roma-01', to: 'roma-02', type: EdgeTypes.PRECEDES },
            { from: 'roma-02', to: 'nexus', type: EdgeTypes.BRANCHES },
            { from: 'future-01', to: 'future-02', type: EdgeTypes.PRECEDES }
        ]
    };

    log('Importando universo desde JSON...', 'info');
    engine.importJSON(dataset);

    log('Grafo construido. Ejecutando validación v0.2...', 'info');
    const report = engine.validate();

    if (report.warnings.length > 0) {
        log('Advertencias detectadas (Física Temporal):', 'warning');
        report.warnings.forEach(w => log(`⚠ ${w}`, 'warning'));
    } else {
        log('Tejido temporal consistente.', 'success');
    }

    log('Simulación completada.', 'success');
    console.log('--- Inspector del EpochEngine ---');
    console.log('Nodos (Sucesos):', Array.from(engine.graph.nodes.values()));
    console.log('Relaciones:', Array.from(engine.graph.edges.values()));
}

btn.addEventListener('click', runSimulation);
log('Listo. Presiona el botón para iniciar.', 'success');
