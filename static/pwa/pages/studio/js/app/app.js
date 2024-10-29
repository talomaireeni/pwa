import Canvas from './views/Canvas.js';
import Flow from './models/Flow.js';

let canvas = new Canvas(Flow.importJSON(JSON.parse(localStorage.getItem('flow-038e8ff4-0983-488f-3eda-1012b4811ecb'))));

try {
    canvas.renderFlow();
}
catch (e) {
    console.log(e);
}

self.canvas = canvas;

// bind events of the header
$('#save-flow').click(() => {
    // refresh the page
    location.reload();
});

// Zooming & collapsing
let zoomIn = $('#zoom-in').click(() => canvas.zoomIn());
let zoomOut = $('#zoom-out').click(() => canvas.zoomOut());
let zoomReset = $('#zoom-reset').click(() => canvas.zoomReset());
let collapse = $('#collapse-all').click(() => canvas.collapseAll());
let expand = $('#expand-all').click(() => canvas.expandAll());
