import { EpochEngine } from '../src/index.js';
import { Renderer } from '../src/ui/renderer.js';
import { csvToJSON } from '../src/utils/csvAdapter.js';

const btn = document.getElementById('render-btn');
const container = document.getElementById('timeline-container');
const textarea = document.getElementById('csv-input');

const engine = new EpochEngine();
const renderer = new Renderer();

btn.addEventListener('click', () => {
    const csvData = textarea.value;

    // 1. CSV to JSON
    const jsonData = csvToJSON(csvData);
    console.log('JSON Data:', jsonData);

    // 2. Import into Engine
    const report = engine.importJSON(jsonData);
    console.log('Import Report:', report);

    // 3. Render
    renderer.renderGraph(engine, container);
});

// Initial render
btn.click();
