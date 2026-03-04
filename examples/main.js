import { EpochEngine, Suceso } from '../src/index.js';

const output = document.getElementById('output');
const btn = document.getElementById('run-demo');

function log(msg, type = 'info') {
    const line = document.createElement('div');
    line.textContent = `> ${msg}`;
    if (type === 'success') line.className = 'success';
    if (type === 'warning') line.className = 'warning';
    output.appendChild(line);
}

function runSimulation() {
    output.innerHTML = '';
    log('Instanciando Motor Temporal...', 'info');

    const engine = new EpochEngine();

    // 1. Creamos Sucesos en la Sagrada Línea Temporal
    const s1 = new Suceso({
        id: 's1',
        title: 'Nacimiento de la República',
        date: -509,
        branch: 'TVA-Prime'
    });
    const s2 = new Suceso({
        id: 's2',
        title: 'Caída de la República',
        date: -27,
        branch: 'TVA-Prime'
    });

    engine.addSuceso(s1);
    engine.addSuceso(s2);

    log('Relacionando Sucesos: s1 precede a s2...', 'info');
    engine.relate('s1', 's2', 'precedes');

    // 2. Simulamos una bifurcación (Nexus Event)
    const nexusEvent = new Suceso({
        id: 'nexus',
        title: 'Julio César no es asesinado',
        branch: 'Variant-616'
    });
    engine.addSuceso(nexusEvent);

    log('Creando rama variante desde s2 hacia la Variante-616...', 'info');
    engine.relate('s2', 'nexus', 'branches');

    // 3. Forzamos un error de consistencia cronológica para ver si lo detecta
    const s3 = new Suceso({
        id: 's3',
        title: 'Invento de la máquina del tiempo',
        date: 2024,
        branch: 'Variant-616'
    });
    const s4 = new Suceso({
        id: 's4',
        title: 'Regreso al pasado (Año 0)',
        date: 0,
        branch: 'Variant-616'
    });
    engine.addSuceso(s3);
    engine.addSuceso(s4);

    // s3 causa a s4 pero la fecha de s3 > s4 en la misma rama, el motor debería advertirlo en una relación precede/cause 
    // (Para nuestro motor, documentamos que `precedes` si rompe fechas, lanza warning)
    engine.relate('s3', 's4', 'precedes');

    log('Grafo construido. Ejecutando validación...', 'info');
    const report = engine.validate();

    if (report.warnings.length > 0) {
        log('Advertencias detectadas por el Motor Temporal:', 'warning');
        report.warnings.forEach(w => log(`⚠ WARN: ${w}`, 'warning'));
    }

    log('Simulación completada.', 'success');
    console.log('--- Inspector del Motor Temporal ---');
    console.log('Instancia del Motor:', engine);
    console.log('Nodos en el Grafo (Sucesos):', Array.from(engine.graph.nodes.values()));
    console.log('Aristas en el Grafo (Relaciones):', Array.from(engine.graph.edges.values()));
}

btn.addEventListener('click', runSimulation);
log('Listo. Presiona el botón para iniciar.', 'success');
