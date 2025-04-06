const addTextBtn = document.getElementById('addText');
addTextBtn.addEventListener('click', () => {
  const textBox = new fabric.IText('Edit me', {
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: 'center',
    originY: 'center',
    fontFamily: 'Arial',
    fontSize: 24,
    fill: '#333'
  });
  canvas.add(textBox);
  canvas.setActiveObject(textBox);

  // Override the paste handler to simply insert text without modifying formatting
  // Note: textBox.hiddenTextarea is created internally when the IText enters editing.
  // So you may want to attach this listener when editing begins.
  textBox.on('editing:entered', () => {
    if (textBox.hiddenTextarea) {
      textBox.hiddenTextarea.addEventListener('paste', function(e) {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('Text');
        textBox.insertChars(pastedText);
        canvas.renderAll();  // Call renderAll on the canvas
      });
    }
  });  
});
