(function() {
    'use strict';

    // --- Global State ---
    // Tracks Dropzone instances, current view index, and zoom/pan settings
    let currentDropzones = [];       // Holds active Dropzone objects for cleanup
    let currentView = 0;             // Current slide index (0: front, 1: rightSleeve, 2: back, 3: leftSleeve)
    let scale = 1.0;                 // Zoom level (0.5 to 2.0, default 1.0 = 100%)
    let panX = 0, panY = 0;          // Panning offsets for zoomed views
    const views = ["front", "rightSleeve", "back", "leftSleeve"]; // 4-slide order for infinite scroll

    // --- Utility Functions ---

    // Debounces rapid function calls to optimize performance (e.g., dropdown changes)
    // - func: Function to debounce
    // - wait: Delay in milliseconds before execution
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Displays a toast notification for user feedback
    // - message: Text to show (e.g., "Image uploaded successfully!")
    const showToast = (message) => {
        const toast = document.getElementById("toast");
        if (!toast) return; // Safety check if element is missing
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000); // Fades out after 3 seconds
    };

    // --- Dropdown Population ---

    // Populates the clothing style dropdown with options from tshirtConfigs
    const populateClothingStyles = () => {
        const styleSelect = document.getElementById('clothingStyle');
        if (!styleSelect) return; // Exit if element not found
        styleSelect.innerHTML = ''; // Clear any existing options
        Object.keys(tshirtConfigs).forEach(style => {
            const option = document.createElement('option');
            option.value = style;
            option.textContent = style.replace('_', ' ').toUpperCase(); // Formats "half_sleeve" to "HALF SLEEVE"
            styleSelect.appendChild(option);
        });
    };

    // Populates the color dropdown based on the selected style
    // - selectedStyle: The currently selected style (e.g., "half_sleeve")
    const populateClothingColors = (selectedStyle) => {
        const colorSelect = document.getElementById('clothingColor');
        if (!colorSelect) return; // Exit if element not found
        colorSelect.innerHTML = ''; // Clear existing options
        const styleConfig = tshirtConfigs[selectedStyle];
        if (!styleConfig) return; // Exit if no config exists for the style
        Object.keys(styleConfig).forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color.toUpperCase(); // Formats "black" to "BLACK"
            colorSelect.appendChild(option);
        });
    };

    // --- Preview Management ---

    // Syncs the preview carousel with the customization area in real-time
    const updatePreview = () => {
        views.forEach(section => { // Iterate over the 4 unique views
            const base = document.getElementById(`${section}-base`);
            const overlay = document.getElementById(`${section}-overlay`);
            const previewBase = document.getElementById(`preview-${section}-base`);
            const previewOverlay = document.getElementById(`preview-${section}-overlay`);

            // Sync base images from customization to preview
            if (base && previewBase) previewBase.src = base.src;

            // Sync overlay images with exact designatedArea positioning
            if (overlay && previewOverlay) {
                previewOverlay.src = overlay.src;
                previewOverlay.style.display = overlay.style.display;
                const config = tshirtConfigs[document.getElementById("clothingStyle").value]?.[document.getElementById("clothingColor").value]?.sections[section];
                if (config) {
                    previewOverlay.style.top = config.designatedArea.top;
                    previewOverlay.style.left = config.designatedArea.left;
                    previewOverlay.style.width = config.designatedArea.width;
                    previewOverlay.style.height = config.designatedArea.height;
                }
            }
        });
        updateSlider(); // Refresh carousel position, zoom, and pan
    };

    // Updates the carousel’s position, applies zoom and panning to the current slide
    const updateSlider = () => {
        const slider = document.querySelector(".preview-slider");
        const slideWidthPercentage = 100 / views.length; // 25% per slide (4 slides)
        slider.style.transform = `translateX(-${currentView * slideWidthPercentage}%)`; // Shift to current view
        const currentSlide = document.querySelectorAll(".preview-slide")[currentView];
        currentSlide.style.transform = `scale(${scale}) translate(${panX}px, ${panY}px)`; // Apply zoom and pan to current slide only
        document.querySelector(".view-label").textContent = views[currentView].replace(/([A-Z])/g, ' $1').trim(); // Update label (e.g., "Right Sleeve")
    };

    // --- Customizer Initialization ---

    // Initializes the customization area with Dropzones for a given style and color
    // - style: Selected style (e.g., "half_sleeve")
    // - color: Selected color (e.g., "black")
    const initializeCustomizer = (style, color) => {
        currentDropzones.forEach(dz => dz.destroy && dz.destroy()); // Destroy existing Dropzones to prevent memory leaks
        currentDropzones = [];
        currentView = 0; // Reset to front view on initialization

        const config = tshirtConfigs[style]?.[color];
        if (!config) return; // Exit if no configuration exists for the style/color combo

        Object.keys(config.sections).forEach(sectionKey => {
            const sectionConfig = config.sections[sectionKey];
            const baseImgElem = document.getElementById(sectionKey + "-base");
            if (baseImgElem) baseImgElem.src = sectionConfig.baseImage; // Set the base t-shirt image

            const dropzoneElem = document.getElementById(sectionKey + "-dropzone");
            if (!dropzoneElem) return; // Skip if dropzone element not found

            // Apply designated area properties for the upload zone
            dropzoneElem.style.position = "absolute";
            dropzoneElem.style.top = sectionConfig.designatedArea.top;
            dropzoneElem.style.left = sectionConfig.designatedArea.left;
            dropzoneElem.style.width = sectionConfig.designatedArea.width;
            dropzoneElem.style.height = sectionConfig.designatedArea.height;
            dropzoneElem.style.border = "2px dashed #fff";
            dropzoneElem.style.boxSizing = "border-box";
            dropzoneElem.style.pointerEvents = "auto";

            // Set up Dropzone for image uploads
            const dz = new Dropzone("#" + sectionKey + "-dropzone", {
                url: sectionConfig.uploadEndpoint, // Backend endpoint (placeholder since no backend yet)
                maxFiles: 1, // Limit to one file per section
                acceptedFiles: "image/*", // Accept only images
                autoProcessQueue: false, // Don’t auto-upload (local preview only)
                clickable: dropzoneElem,
                previewsContainer: false, // No preview thumbnails
                init: function() {
                    this.on("addedfile", function(file) {
                        dropzoneElem.classList.add("uploading"); // Show loading state
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const overlayImg = document.getElementById(sectionKey + "-overlay");
                            if (overlayImg) {
                                overlayImg.src = event.target.result;
                                overlayImg.style.display = "block";
                                dropzoneElem.classList.remove("uploading");
                                showToast("Image uploaded successfully!");
                                updatePreview(); // Reflect changes in preview immediately
                            }
                        };
                        reader.readAsDataURL(file); // Convert file to data URL for display
                    });
                }
            });
            currentDropzones.push(dz); // Store for cleanup
        });
        updatePreview(); // Initial sync with preview
    };

    // --- Design Saving and Loading ---

    // Saves the current design to localStorage
    const saveDesign = () => {
        const style = document.getElementById("clothingStyle").value;
        const color = document.getElementById("clothingColor").value;
        const designs = {
            front: document.getElementById("front-overlay").src || "",
            back: document.getElementById("back-overlay").src || "",
            leftSleeve: document.getElementById("leftSleeve-overlay").src || "",
            rightSleeve: document.getElementById("rightSleeve-overlay").src || ""
        };
        const timestamp = Date.now(); // Unique ID based on current time
        const savedDesigns = JSON.parse(localStorage.getItem("savedDesigns") || "[]");
        savedDesigns.push({ id: timestamp, style, color, designs });
        localStorage.setItem("savedDesigns", JSON.stringify(savedDesigns));
        showToast("Design saved!");
        populateSavedDesigns(); // Refresh gallery
    };

    // Populates the saved designs gallery with load and delete options
    const populateSavedDesigns = () => {
        const list = document.getElementById("saved-designs-list");
        const savedDesigns = JSON.parse(localStorage.getItem("savedDesigns") || "[]");
        list.innerHTML = ""; // Clear existing entries
        savedDesigns.forEach(design => {
            const div = document.createElement("div");
            div.className = "saved-design";
            div.innerHTML = `
                <span>${design.style.replace('_', ' ')} (${design.color}) - ${new Date(design.id).toLocaleTimeString()}</span>
                <button class="load-btn" data-id="${design.id}">Load</button>
                <button class="delete-btn" data-id="${design.id}">Delete</button>
            `;
            list.appendChild(div);
        });

        // Load button: Restores a saved design to the customizer
        document.querySelectorAll(".load-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const id = this.dataset.id;
                const design = savedDesigns.find(d => d.id == id);
                if (design) {
                    document.getElementById("clothingStyle").value = design.style;
                    populateClothingColors(design.style);
                    document.getElementById("clothingColor").value = design.color;
                    initializeCustomizer(design.style, design.color);
                    Object.keys(design.designs).forEach(section => {
                        const overlay = document.getElementById(section + "-overlay");
                        if (overlay && design.designs[section]) {
                            overlay.src = design.designs[section];
                            overlay.style.display = "block";
                        }
                    });
                    showToast("Design loaded!");
                    updatePreview(); // Sync preview with loaded design
                }
            });
        });

        // Delete button: Removes a design from localStorage
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const id = this.dataset.id;
                const updatedDesigns = savedDesigns.filter(d => d.id != id);
                localStorage.setItem("savedDesigns", JSON.stringify(updatedDesigns));
                populateSavedDesigns();
                showToast("Design deleted!");
            });
        });
    };

    // --- Event Listeners and Initialization ---

    document.addEventListener("DOMContentLoaded", function() {
        // Cache DOM elements for efficiency
        const styleSelect = document.getElementById('clothingStyle');
        const colorSelect = document.getElementById('clothingColor');
        const slider = document.querySelector(".preview-slider");
        const prevBtn = document.querySelector(".prev");
        const nextBtn = document.querySelector(".next");
        const zoomSlider = document.querySelector(".zoom-slider");

        // Initial setup: Populate dropdowns and saved designs
        populateClothingStyles();
        if (styleSelect.value) populateClothingColors(styleSelect.value);
        populateSavedDesigns();
        if (styleSelect.value && colorSelect.value) {
            initializeCustomizer(styleSelect.value, colorSelect.value);
        }

        // Handle style dropdown changes with debounce to reduce calls
        styleSelect.addEventListener("change", debounce(function() {
            populateClothingColors(this.value);
            if (colorSelect.value) initializeCustomizer(this.value, colorSelect.value);
        }, 300));

        // Handle color dropdown changes with debounce
        colorSelect.addEventListener("change", debounce(function() {
            initializeCustomizer(styleSelect.value, this.value);
        }, 300));

        // Save design on button click
        document.getElementById("save-btn").addEventListener("click", saveDesign);

        // Navigation: Move to previous view with dynamic repositioning
        prevBtn.addEventListener("click", () => {
            const slides = document.querySelectorAll(".preview-slide");
            if (currentView === 0) { // At front, move to leftSleeve
                const firstSlide = slides[0]; // Front slide
                slider.style.transition = "none"; // Disable animation for reposition
                slider.appendChild(firstSlide); // Move front to end
                currentView = views.length - 1; // Set to leftSleeve
                slider.style.transform = `translateX(-${currentView * 25}%)`; // Position at leftSleeve
                requestAnimationFrame(() => {
                    slider.style.transition = "transform 0.5s ease"; // Restore animation
                    currentView--; // Move to back (normal transition)
                    updateSlider();
                });
            } else {
                currentView--; // Normal backward move
                updateSlider();
            }
        });

        // Navigation: Move to next view with dynamic repositioning
        nextBtn.addEventListener("click", () => {
            const slides = document.querySelectorAll(".preview-slide");
            if (currentView === views.length - 1) { // At leftSleeve, move to front
                const lastSlide = slides[views.length - 1]; // LeftSleeve slide
                slider.style.transition = "none"; // Disable animation for reposition
                slider.insertBefore(lastSlide, slides[0]); // Move leftSleeve to start
                currentView = 0; // Set to front
                slider.style.transform = `translateX(0%)`; // Position at front
                requestAnimationFrame(() => {
                    slider.style.transition = "transform 0.5s ease"; // Restore animation
                    currentView++; // Move to rightSleeve (normal transition)
                    updateSlider();
                });
            } else {
                currentView++; // Normal forward move
                updateSlider();
            }
        });

        // Swipe Support: Detect touch gestures for navigation
        let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
        slider.addEventListener("touchstart", e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        slider.addEventListener("touchmove", e => {
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        });
        slider.addEventListener("touchend", () => {
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) { // Horizontal swipe > 30px
                if (diffX > 0) nextBtn.click(); // Swipe left
                else prevBtn.click(); // Swipe right
            }
        });

        // Zoom Control: Adjust scale via slider
        zoomSlider.addEventListener("input", function() {
            scale = this.value / 100; // Convert 50-200 range to 0.5-2.0
            panX = 0; panY = 0; // Reset panning when zoom changes
            updateSlider();
        });

        // Panning: Drag zoomed image with mouse or touch
        let isDragging = false, startX, startY;
        slider.addEventListener("mousedown", e => {
            if (scale > 1) { // Only pan when zoomed in
                isDragging = true;
                startX = e.clientX - panX;
                startY = e.clientY - panY;
            }
        });
        slider.addEventListener("mousemove", e => {
            if (isDragging) {
                panX = e.clientX - startX;
                panY = e.clientY - startY;
                updateSlider();
            }
        });
        slider.addEventListener("mouseup", () => isDragging = false);
        slider.addEventListener("mouseleave", () => isDragging = false);

        slider.addEventListener("touchstart", e => {
            if (scale > 1) {
                isDragging = true;
                startX = e.touches[0].clientX - panX;
                startY = e.touches[0].clientY - panY;
            }
        });
        slider.addEventListener("touchmove", e => {
            if (isDragging) {
                panX = e.touches[0].clientX - startX;
                panY = e.touches[0].clientY - startY;
                updateSlider();
            }
        });
        slider.addEventListener("touchend", () => isDragging = false);
    });
})();