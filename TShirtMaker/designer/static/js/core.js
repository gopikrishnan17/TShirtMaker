document.addEventListener('DOMContentLoaded', () => {
    const canvasWidth = (typeof window.canvasWidth === 'number' && window.canvasWidth) ? window.canvasWidth : 800;
    const canvasHeight = (typeof window.canvasHeight === 'number' && window.canvasHeight) ? window.canvasHeight : 600;

    const canvas = new fabric.Canvas('playground', {
        width: canvasWidth,
        height: canvasHeight,
        preserveObjectStacking: true,
        backgroundColor: '#ffffff'
    });
    window.canvas = canvas; // Expose canvas globally for image.js
    console.log('Canvas initialized:', canvas.width, canvas.height);

    const history = [];
    let historyIndex = -1;
    let isLoadingState = false;

    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');
    const downloadBtn = document.getElementById('downloadBtn');
    const bgColorInput = document.getElementById('bgColor');
    const includeBgCheckbox = document.getElementById('includeBg');
    const downloadFormat = document.getElementById('downloadFormat');
    const downloadResolution = document.getElementById('downloadResolution');

    function saveState() {
        if (isLoadingState) return;
        try {
            history.length = historyIndex + 1;
            history.push(JSON.stringify(canvas.toJSON()));
            historyIndex++;
            if (history.length > 10) {
                history.shift();
                historyIndex--;
            }
            updateUndoRedoButtons();
        } catch (e) {
            console.error('Save state failed:', e);
        }
    }

    window.saveState = saveState;

    function updateUndoRedoButtons() {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= history.length - 1;
    }

    function loadState(index) {
        isLoadingState = true;
        canvas.loadFromJSON(history[index], () => {
            canvas.renderAll();
            canvas.getObjects().forEach(obj => obj.setCoords());
            updateUndoRedoButtons();
            bgColorInput.value = rgbToHex(canvas.backgroundColor) || '#ffffff';
            isLoadingState = false;
        });
    }

    const debounceSave = debounce(saveState, 300);
    canvas.on('object:added', () => { if (!isLoadingState) debounceSave(); });
    canvas.on('object:modified', () => { if (!isLoadingState) debounceSave(); });
    canvas.on('object:removed', () => { if (!isLoadingState) debounceSave(); });

    undoBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            loadState(historyIndex);
        }
    });

    redoBtn.addEventListener('click', () => {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            loadState(historyIndex);
        }
    });

    bgColorInput.addEventListener('change', () => {
        try {
            canvas.setBackgroundColor(bgColorInput.value, () => {
                canvas.renderAll();
                debounceSave();
            });
        } catch (e) {
            console.error('Background color change failed:', e);
        }
    });

    function rgbToHex(color) {
        if (!color || color.startsWith('#')) return color || '#ffffff';
        const result = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(color);
        if (result) {
            return "#" +
                ("0" + parseInt(result[1], 10).toString(16)).slice(-2) +
                ("0" + parseInt(result[2], 10).toString(16)).slice(-2) +
                ("0" + parseInt(result[3], 10).toString(16)).slice(-2);
        }
        return '#ffffff';
    }

    function setBackgroundColorAsync(color) {
        return new Promise(resolve => {
            canvas.setBackgroundColor(color, () => {
                canvas.renderAll();
                resolve();
            });
        });
    }

    downloadBtn.addEventListener('click', async () => {
        try {
            const includeBg = includeBgCheckbox.checked;
            const format = downloadFormat.value;
            const multiplier = parseInt(downloadResolution.value) || 1;
            let dataURL;
            if (!includeBg) {
                const originalBg = canvas.backgroundColor;
                await setBackgroundColorAsync(null);
                dataURL = format === 'svg' 
                    ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(canvas.toSVG())
                    : canvas.toDataURL({ format, quality: format === 'jpeg' ? 0.9 : 1.0, multiplier });
                await setBackgroundColorAsync(originalBg);
            } else {
                dataURL = format === 'svg' 
                    ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(canvas.toSVG())
                    : canvas.toDataURL({ format, quality: format === 'jpeg' ? 0.9 : 1.0, multiplier });
            }
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `playground.${format}`;
            link.click();
        } catch (e) {
            console.error('Download failed:', e);
        }
    });

    function debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    saveState();
    updateUndoRedoButtons();
    canvas.calcOffset();
});