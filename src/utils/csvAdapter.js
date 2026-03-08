/**
 * Utility to convert CSV data strings into the Epoch Engine JSON format.
 */
export function csvToJSON(csvString) {
    if (!csvString) return { events: [], relations: [] };

    const lines = csvString.trim().split('\n');
    if (lines.length < 2) return { events: [], relations: [] };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const events = [];
    const relations = [];

    // Helper to find column index
    const col = (name) => headers.indexOf(name);

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < 2) continue;

        const id = values[col('id')];
        const title = values[col('title')];

        if (!id || !title) continue;

        // Parse meta if present
        let meta = {};
        try {
            const metaStr = values[col('meta')];
            if (metaStr) {
                meta = JSON.parse(metaStr);
            }
        } catch (e) {
            console.warn(`Failed to parse meta for event ${id}`);
        }

        events.push({
            id,
            title,
            description: col('description') !== -1 ? values[col('description')] : '',
            date: col('start') !== -1 ? (isNaN(Date.parse(values[col('start')])) ? parseFloat(values[col('start')]) : Date.parse(values[col('start')])) : null,
            tags: col('tags') !== -1 ? values[col('tags')].split('|').filter(t => t) : [],
            meta
        });

        // Parse relations from specific columns (precedes, causes, branches, merges, loops)
        const relTypes = ['precedes', 'causes', 'branches', 'merges', 'loops'];
        relTypes.forEach(type => {
            const colIdx = col(type);
            if (colIdx !== -1 && values[colIdx]) {
                const targets = values[colIdx].split('|').filter(t => t);
                targets.forEach(targetId => {
                    relations.push({
                        from: id,
                        to: targetId,
                        type: type,
                        metadata: {}
                    });
                });
            }
        });
    }

    return { events, relations };
}
