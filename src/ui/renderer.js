import { i18n } from '../i18n/index.js';

/**
 * SVG-based renderer for the Epoch Engine timeline.
 */
export class Renderer {
    /**
     * Renders the temporal graph into a container.
     * @param {EpochEngine} engine - Instance of EpochEngine
     * @param {HTMLElement} container - DOM element to render the graph into
     */
    renderGraph(engine, container) {
        if (!container) throw new Error(i18n.t('renderer.errors.missingContainer'));

        // Clear container
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 400;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.classList.add("epoch-svg");

        const events = engine.graph.getTimeline();
        const edges = Array.from(engine.graph.edges.values());

        // Basic layout logic: Linear horizontal based on date
        const padding = 50;
        const nodeWidth = 120;
        const nodeHeight = 40;

        // Map to store node positions for edge drawing
        const positions = new Map();

        // Calculate horizontal scale
        const dates = events.map(e => e.data.date).filter(d => d !== null);
        const minDate = dates.length ? Math.min(...dates) : 0;
        const maxDate = dates.length ? Math.max(...dates) : 100;
        const dateRange = maxDate - minDate || 1;

        const getX = (date) => {
            if (date === null) return padding + (width - 2 * padding) / 2;
            return padding + ((date - minDate) / dateRange) * (width - 2 * padding);
        };

        // Draw Nodes (Events)
        events.forEach((node, index) => {
            const event = node.data;
            const x = getX(event.date);
            const y = height / 2 + (index % 2 === 0 ? -60 : 60); // Simple zig-zag to avoid overlap

            positions.set(event.id, { x, y });

            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.classList.add("epoch-node");
            g.setAttribute("data-id", event.id);

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x - nodeWidth / 2);
            rect.setAttribute("y", y - nodeHeight / 2);
            rect.setAttribute("width", nodeWidth);
            rect.setAttribute("height", nodeHeight);
            rect.setAttribute("rx", "5");
            rect.classList.add("event-rect");

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x);
            text.setAttribute("y", y);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.classList.add("event-text");
            text.textContent = event.title;

            g.appendChild(rect);
            g.appendChild(text);
            svg.appendChild(g);
        });

        // Draw Edges (Relations)
        edges.forEach(edge => {
            const fromPos = positions.get(edge.from);
            const toPos = positions.get(edge.to);

            if (!fromPos || !toPos) return;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.classList.add("epoch-edge", `type-${edge.type}`);

            // Draw a curved line
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2 - (dx > 0 ? 30 : -30);

            const d = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`;
            path.setAttribute("d", d);
            path.setAttribute("marker-end", "url(#arrowhead)");

            svg.appendChild(path);
        });

        // Add Marker definition for arrows
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "7");
        marker.setAttribute("refX", "10");
        marker.setAttribute("refY", "3.5");
        marker.setAttribute("orient", "auto");

        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
        polygon.setAttribute("fill", "#ccc");

        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);

        container.appendChild(svg);
    }
}
