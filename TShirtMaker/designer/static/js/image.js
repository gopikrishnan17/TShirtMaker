document.addEventListener('DOMContentLoaded', () => {
    if (!window.canvas) throw new Error('Canvas not initialized. Ensure core.js loads first.');
    const canvas = window.canvas;

    const addImageBtn = document.getElementById('addImage');
    const imageUpload = document.getElementById('imageUpload');
    const deleteBtn = document.getElementById('delete');
    const imageToolbox = document.getElementById('imageToolbox');
    const cropBtn = document.getElementById('cropBtn');
    const flipHBtn = document.getElementById('flipHBtn');
    const flipVBtn = document.getElementById('flipVBtn');
    const grayscaleSlider = document.getElementById('grayscale');
    const toolboxRotate = document.getElementById('toolboxRotate');
    const openStickerModalBtn = document.getElementById('openStickerModal');
    const stickerModal = document.getElementById('stickerModal');
    const closeStickerModal = document.getElementById('closeStickerModal');

    function addImageToCanvas(url, left, top) {
        fabric.Image.fromURL(url, (img) => {
            const margin = 20;
            const canvasMaxWidth = canvas.width - margin;
            const canvasMaxHeight = canvas.height - margin;
            let scaleFactor = 1;
            if (img.width > canvasMaxWidth || img.height > canvasMaxHeight) {
                scaleFactor = Math.min(canvasMaxWidth / img.width, canvasMaxHeight / img.height);
            }
            scaleFactor = Math.min(scaleFactor, 1);
            if (img.width * scaleFactor < 50 || img.height * scaleFactor < 50) {
                scaleFactor = Math.max(50 / img.width, 50 / img.height);
            }
            img.set({
                left: left || canvas.width / 2,
                top: top || canvas.height / 2,
                originX: 'center',
                originY: 'center',
                centeredRotation: true,
                scaleX: scaleFactor,
                scaleY: scaleFactor,
                hasControls: true,
                hasBorders: true,
                cornerSize: 12,
                transparentCorners: false,
                cornerStyle: 'circle',
                padding: 10,
                selectable: true,
                evented: true
            });
            img.setCoords();
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            window.saveState();
        }, { crossOrigin: 'anonymous' }, (err) => {
            console.error('Image load failed:', err);
        });
    }

    addImageBtn.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => addImageToCanvas(event.target.result, 50, 50);
            reader.readAsDataURL(file);
        } else {
            console.error('Invalid file type');
        }
        e.target.value = '';
    });

    document.addEventListener('paste', (e) => {
        const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'));
        if (item) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => addImageToCanvas(event.target.result, 100, 100);
            reader.readAsDataURL(blob);
        }
    });

    deleteBtn.addEventListener('click', () => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            canvas.renderAll();
            window.saveState();
        }
    });

    // Fixed selection event syntax and ensured toolbox visibility
    canvas.on('selection:created', (e) => {
        const activeObj = e.target;
        if (activeObj && activeObj.type === 'image') {
            imageToolbox.classList.remove('hidden');
            toolboxRotate.value = activeObj.angle || 0;
        } else {
            imageToolbox.classList.add('hidden');
        }
    });
    canvas.on('selection:updated', (e) => {
        const activeObj = e.target;
        if (activeObj && activeObj.type === 'image') {
            imageToolbox.classList.remove('hidden');
            toolboxRotate.value = activeObj.angle || 0;
        } else {
            imageToolbox.classList.add('hidden');
        }
    });
    canvas.on('selection:cleared', () => {
        imageToolbox.classList.add('hidden');
    });

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    toolboxRotate.addEventListener('input', debounce((e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.set('angle', parseInt(e.target.value, 10));
            activeObj.setCoords();
            canvas.renderAll();
            window.saveState();
        }
    }, 100));

    cropBtn.addEventListener('click', () => {
        console.log('Crop functionality not yet implemented.');
    });

    flipHBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === 'image') {
            activeObj.set('flipX', !activeObj.flipX);
            activeObj.setCoords();
            canvas.renderAll();
            window.saveState();
        }
    });

    flipVBtn.addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === 'image') {
            activeObj.set('flipY', !activeObj.flipY);
            activeObj.setCoords();
            canvas.renderAll();
            window.saveState();
        }
    });

    grayscaleSlider.addEventListener('input', debounce((e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === 'image') {
            activeObj.filters = activeObj.filters.filter(f => !(f instanceof fabric.Image.filters.Grayscale));
            if (parseFloat(e.target.value) > 0) {
                activeObj.filters.push(new fabric.Image.filters.Grayscale());
            }
            activeObj.applyFilters();
            canvas.renderAll();
            window.saveState();
        }
    }, 100));

    openStickerModalBtn.addEventListener('click', () => {
        stickerModal.classList.remove('hidden');
    });

    closeStickerModal.addEventListener('click', () => {
        stickerModal.classList.add('hidden');
    });

    document.querySelector('emoji-picker').addEventListener('emoji-click', (event) => {
        const emoji = event.detail.unicode;
        const textEmoji = new fabric.Text(emoji, {
            left: 150,
            top: 150,
            fontSize: 40,
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true
        });
        canvas.add(textEmoji);
        canvas.setActiveObject(textEmoji);
        canvas.renderAll();
        window.saveState();
        stickerModal.classList.add('hidden');
    });
});