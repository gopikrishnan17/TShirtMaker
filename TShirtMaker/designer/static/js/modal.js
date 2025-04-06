// modal.js
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('modalContainer');
    const modalClose = document.getElementById('modalClose');
    const editorIframe = document.getElementById('editorIframe');
    
    // Attach click event to each "Edit Design" button
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            // Set the iframe source to the editor page with the section parameter
            editorIframe.src = 'editor/?section=' + encodeURIComponent(section);
            modal.style.display = 'block';
        });
    });
    
    // Close modal when clicking on the close button
    modalClose.addEventListener('click', function() {
        modal.style.display = 'none';
        editorIframe.src = '';
    });
    
    // Listen for messages from the editor page
    window.addEventListener('message', function(event) {
        // In production, validate event.origin as needed.
        if (event.data && event.data.section && event.data.dataURL) {
            const section = event.data.section;
            const dataURL = event.data.dataURL;
            // Update the corresponding overlay image in the customizer
            const overlayImg = document.getElementById(section + '-overlay');
            if (overlayImg) {
                overlayImg.src = dataURL;
                overlayImg.style.display = 'block';
            }
            // Close the modal after receiving the image data
            modal.style.display = 'none';
            editorIframe.src = '';
        }
    });
    
    // Optional: Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            editorIframe.src = '';
        }
    });
});
