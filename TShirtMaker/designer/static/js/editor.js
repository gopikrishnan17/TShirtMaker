// Initialize Fabric.js canvas
const canvas = new fabric.Canvas('playground', {
    width: window.innerWidth - 20,
    height: 500,
    preserveObjectStacking: true
});

// State for undo/redo
let history = [];
let historyIndex = -1;

// DOM elements
const addTextBtn = document.getElementById('addText');
const addImageBtn = document.getElementById('addImage');
const imageUpload = document.getElementById('imageUpload');
const addShapeSelect = document.getElementById('addShape');
const deleteBtn = document.getElementById('delete');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const zoomInput = document.getElementById('zoom');
const gridSnapCheckbox = document.getElementById('gridSnap');
const contextualToolbar = document.getElementById('contextualToolbar');
const textTools = document.getElementById('textTools');
const imageShapeTools = document.getElementById('imageShapeTools');

// Text controls
const fontSizeInput = document.getElementById('fontSize');
const fontColorInput = document.getElementById('fontColor');
const fontFamilySelect = document.getElementById('fontFamily');
const textOpacityInput = document.getElementById('textOpacity');
const shadowColorInput = document.getElementById('shadowColor');
const shadowOffsetInput = document.getElementById('shadowOffset');
const shadowBlurInput = document.getElementById('shadowBlur');

// Image/Shape/Textbox controls
const bgColorInput = document.getElementById('bgColor');
const bgOpacityInput = document.getElementById('bgOpacity');
const borderColorInput = document.getElementById('borderColor');
const borderWidthInput = document.getElementById('borderWidth');
const rotationInput = document.getElementById('rotation');
const filtersSelect = document.getElementById('filters');
const filterValueInput = document.getElementById('filterValue');

// Utility: Save state for undo/redo
function saveState() {
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.stringify(canvas));
    historyIndex++;
    updateUndoRedoButtons();
}

// Utility: Update undo/redo button states
function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
}

// Utility: Convert hex to RGB
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

// Utility: Convert RGB to hex
function rgbToHex(color) {
    if (color.startsWith('#')) return color;
    const result = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(color);
    if (result) {
        return "#" +
            ("0" + parseInt(result[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(result[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(result[3], 10).toString(16)).slice(-2);
    }
    return color;
}

// Add text with Textbox
addTextBtn.addEventListener('click', () => {
    try {
        const text = new fabric.Textbox('Editable Text', {
            left: 100,
            top: 100,
            width: 150,
            fontSize: 16,
            fill: '#000000',
            fontFamily: 'Arial',
            opacity: 1,
            backgroundColor: 'rgba(255,255,255,1)',
            stroke: 'rgba(221,221,221,1)',
            strokeWidth: 1,
            shadow: 'rgba(0,0,0,0.3) 5px 5px 5px'
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        saveState();
    } catch (e) {
        console.error('Error adding text:', e);
    }
});

// Add image via upload
addImageBtn.addEventListener('click', () => {
    imageUpload.click();
});

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            fabric.Image.fromURL(event.target.result, (img) => {
                img.set({ left: 150, top: 150, opacity: 1 });
                canvas.add(img);
                canvas.setActiveObject(img);
                saveState();
            });
        };
        reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input
});

// Add shape
addShapeSelect.addEventListener('change', (e) => {
    const shapeType = e.target.value;
    if (!shapeType) return;
    let shape;
    switch (shapeType) {
        case 'rect':
            shape = new fabric.Rect({ left: 200, top: 200, width: 100, height: 100, fill: 'rgba(255,255,255,1)', stroke: 'rgba(221,221,221,1)', strokeWidth: 1 });
            break;
        case 'circle':
            shape = new fabric.Circle({ left: 250, top: 250, radius: 50, fill: 'rgba(255,255,255,1)', stroke: 'rgba(221,221,221,1)', strokeWidth: 1 });
            break;
        case 'triangle':
            shape = new fabric.Triangle({ left: 300, top: 300, width: 100, height: 100, fill: 'rgba(255,255,255,1)', stroke: 'rgba(221,221,221,1)', strokeWidth: 1 });
            break;
    }
    canvas.add(shape);
    canvas.setActiveObject(shape);
    saveState();
    addShapeSelect.value = '';
});

// Delete selected object
deleteBtn.addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        hideContextualToolbar();
        saveState();
    }
});

// Undo/Redo
undoBtn.addEventListener('click', () => {
    if (historyIndex > 0) {
        historyIndex--;
        canvas.loadFromJSON(history[historyIndex], canvas.renderAll.bind(canvas));
        updateUndoRedoButtons();
    }
});

redoBtn.addEventListener('click', () => {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        canvas.loadFromJSON(history[historyIndex], canvas.renderAll.bind(canvas));
        updateUndoRedoButtons();
    }
});

// Zoom
zoomInput.addEventListener('input', () => {
    canvas.setZoom(parseFloat(zoomInput.value));
    canvas.renderAll();
});

// Grid snap
gridSnapCheckbox.addEventListener('change', () => {
    const snap = gridSnapCheckbox.checked ? 10 : 0;
    canvas.on('object:moving', (e) => {
        if (snap) {
            e.target.set({
                left: Math.round(e.target.left / snap) * snap,
                top: Math.round(e.target.top / snap) * snap
            });
        }
    });
});

// Show/hide contextual toolbar
function showContextualToolbar(type) {
    contextualToolbar.style.display = 'flex';
    textTools.style.display = type === 'text' ? 'flex' : 'none';
    imageShapeTools.style.display = type !== 'text' ? 'flex' : 'none';
}

function hideContextualToolbar() {
    contextualToolbar.style.display = 'none';
    textTools.style.display = 'none';
    imageShapeTools.style.display = 'none';
}

// Update toolbar from selected object
function updateToolbarFromObject(obj) {
    showContextualToolbar('image');
    bgColorInput.value = rgbToHex(obj.backgroundColor || obj.fill) || '#ffffff';
    bgOpacityInput.value = obj.opacity || 1;
    borderColorInput.value = rgbToHex(obj.stroke) || '#dddddd';
    borderWidthInput.value = obj.strokeWidth || 1;
    rotationInput.value = obj.angle || 0;
}

// Canvas event handlers
canvas.on('selection:created', (e) => {
    const obj = e.target;
    if (obj.type !== 'textbox') {
        updateToolbarFromObject(obj);
    }
});

canvas.on('selection:updated', (e) => {
    const obj = e.target;
    if (obj.type !== 'textbox') {
        updateToolbarFromObject(obj);
    }
});

canvas.on('selection:cleared', () => {
    hideContextualToolbar();
});

canvas.on('text:selection:changed', (e) => {
    const obj = e.target;
    if (obj && obj.type === 'textbox') {
        showContextualToolbar('text');
        const sel = obj.getSelectionStyles(obj.selectionStart, obj.selectionEnd)[0] || {};
        fontSizeInput.value = sel.fontSize || obj.fontSize || 16;
        fontColorInput.value = sel.fill || obj.fill || '#000000';
        fontFamilySelect.value = sel.fontFamily || obj.fontFamily || 'Arial';
        textOpacityInput.value = sel.opacity || obj.opacity || 1;
        if (sel.shadow) {
            shadowColorInput.value = rgbToHex(sel.shadow.color) || '#000000';
            shadowOffsetInput.value = sel.shadow.offsetX || 5;
            shadowBlurInput.value = sel.shadow.blur || 5;
        }
    }
});

// Text controls
fontSizeInput.addEventListener('change', () => {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.setSelectionStyles({ fontSize: parseInt(fontSizeInput.value) });
        canvas.renderAll();
        saveState();
    }
});

fontColorInput.addEventListener('change', () => {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.setSelectionStyles({ fill: fontColorInput.value });
        canvas.renderAll();
        saveState();
    }
});

fontFamilySelect.addEventListener('change', () => {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.setSelectionStyles({ fontFamily: fontFamilySelect.value });
        canvas.renderAll();
        saveState();
    }
});

textOpacityInput.addEventListener('input', () => {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.setSelectionStyles({ opacity: parseFloat(textOpacityInput.value) });
        canvas.renderAll();
        saveState();
    }
});

shadowColorInput.addEventListener('change', () => {
    updateShadow();
});

shadowOffsetInput.addEventListener('change', () => {
    updateShadow();
});

shadowBlurInput.addEventListener('change', () => {
    updateShadow();
});

function updateShadow() {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'textbox') {
        obj.setSelectionStyles({
            shadow: new fabric.Shadow({
                color: shadowColorInput.value,
                offsetX: parseInt(shadowOffsetInput.value),
                offsetY: parseInt(shadowOffsetInput.value),
                blur: parseInt(shadowBlurInput.value)
            })
        });
        canvas.renderAll();
        saveState();
    }
}

// Image/Shape/Textbox controls
bgColorInput.addEventListener('change', () => {
    const obj = canvas.getActiveObject();
    if (obj) {
        const opacity = parseFloat(bgOpacityInput.value);
        obj.set('backgroundColor', `rgba(${hexToRgb(bgColorInput.value)},${opacity})`);
        if (obj.type !== 'textbox') obj.set('fill', `rgba(${hexToRgb(bgColorInput.value)},${opacity})`);
        canvas.renderAll();
        saveState();
    }
});

bgOpacityInput.addEventListener('input', () => {
    const obj = canvas.getActiveObject();
    if (obj) {
        const opacity = parseFloat(bgOpacityInput.value);
        obj.set('backgroundColor', `rgba(${hexToRgb(bgColorInput.value)},${opacity})`);
        obj.set('stroke', `rgba(${hexToRgb(borderColorInput.value)},${opacity})`);
        obj.set('opacity', opacity);
        if (obj.type !== 'textbox') obj.set('fill', `rgba(${hexToRgb(bgColorInput.value)},${opacity})`);
        canvas.renderAll();
        saveState();
    }
});

borderColorInput.addEventListener('change', () => {
    const obj = canvas.getActiveObject();
    if (obj) {
        const opacity = parseFloat(bgOpacityInput.value);
        obj.set('stroke', `rgba(${hexToRgb(borderColorInput.value)},${opacity})`);
        canvas.renderAll();
        saveState();
    }
});

borderWidthInput.addEventListener('change', () => {
    const obj = canvas.getActiveObject();
    if (obj) {
        obj.set('strokeWidth', parseInt(borderWidthInput.value));
        canvas.renderAll();
        saveState();
    }
});

rotationInput.addEventListener('input', () => {
    const obj = canvas.getActiveObject();
    if (obj) {
        obj.set('angle', parseInt(rotationInput.value));
        canvas.renderAll();
        saveState();
    }
});

filtersSelect.addEventListener('change', () => {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'image') {
        filterValueInput.style.display = filtersSelect.value ? 'inline' : 'none';
        applyFilter(obj);
    }
});

filterValueInput.addEventListener('input', () => {
    const obj = canvas.getActiveObject();
    if (obj && obj.type === 'image') {
        applyFilter(obj);
    }
});

function applyFilter(obj) {
    obj.filters = [];
    const filter = filtersSelect.value;
    const value = parseFloat(filterValueInput.value);
    if (filter === 'brightness') obj.filters.push(new fabric.Image.filters.Brightness({ brightness: value }));
    if (filter === 'contrast') obj.filters.push(new fabric.Image.filters.Contrast({ contrast: value }));
    if (filter === 'grayscale') obj.filters.push(new fabric.Image.filters.Grayscale());
    obj.applyFilters();
    canvas.renderAll();
    saveState();
}

// Initial state
saveState();