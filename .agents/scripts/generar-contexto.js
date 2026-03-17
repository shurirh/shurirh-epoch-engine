import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'doc/context/lira');
const outputFile = path.join(outputDir, 'contexto_proyecto.md');

const ignoreDirs = ['node_modules', 'dist', '.git', '.agents', 'doc', '.vscode', 'coverage'];
const ignoreFiles = ['package-lock.json'];
const ignoreExtensions = ['.ds_store', '.jpg', '.png', '.gif', '.svg', '.ico', '.woff', '.ttf', '.md'];

console.log('Generando contexto del proyecto para Lira...');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

let content = `# Contexto del Proyecto\n\nEste archivo se generó automáticamente para Lira.\n\n`;

function generateTree(dir, prefix = '') {
    let tree = '';
    const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => !ignoreDirs.includes(dirent.name) && !ignoreFiles.includes(dirent.name) && !dirent.name.endsWith('.md'))
        .sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });

    entries.forEach((entry, index) => {
        const isLast = index === entries.length - 1;
        const pointer = isLast ? '└── ' : '├── ';
        tree += `${prefix}${pointer}${entry.name}\n`;
        
        if (entry.isDirectory()) {
            tree += generateTree(path.join(dir, entry.name), prefix + (isLast ? '    ' : '│   '));
        }
    });

    return tree;
}

content += `## Estructura de Directorios\n\n\`\`\`\n.\n${generateTree(rootDir)}\`\`\`\n\n`;
content += `## Código Fuente\n\n`;

function appendFilesContent(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => !ignoreDirs.includes(dirent.name) && !ignoreFiles.includes(dirent.name));

    entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            appendFilesContent(fullPath);
        } else {
            const ext = path.extname(entry.name).toLowerCase();
            // Evitar archivos binarios o que no suman código relevante, además de evitar retroalimentación infinita de archivos md
            if (ignoreExtensions.includes(ext) || ignoreExtensions.includes(entry.name)) {
                 return;
            }
            // Agregamos markdown del root excepto el CHANGELOG/README si queremos, o simplemente permitimos todo menos la carpeta doc.
            // Para código estricto es mejor omitir archivos .md gigantes, pero vamos a dejar el código fuente (js, json, html, css).
            
            try {
                const fileContent = fs.readFileSync(fullPath, 'utf-8');
                const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
                const lang = ext.replace('.', '');
                content += `### \`${relPath}\`\n\n\`\`\`${lang}\n${fileContent}\n\`\`\`\n\n`;
            } catch(e) {
                // Ignore files that can't be read as utf-8 easily
            }
        }
    });
}

appendFilesContent(rootDir);

try {
    fs.writeFileSync(outputFile, content, 'utf-8');
    console.log(`\x1b[32mÉxito:\x1b[0m Contexto generado en ${outputFile}`);
} catch(e) {
    console.error(`\x1b[31mError:\x1b[0m No se pudo generar el archivo de contexto.`, e);
}
