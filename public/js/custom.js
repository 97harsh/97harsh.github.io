console.log('custom.js loaded');

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing components...');
    initializeWelcomeModal();
    initializeFontToggle();
    initializeDynamicImages();
});

function initializeWelcomeModal() {
    // Check if user has already made a font selection
    const hasChosenFont = localStorage.getItem('hasChosenFont');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    
    if (!welcomeOverlay) return;
    
    // If it's the first visit, show the welcome modal
    if (!hasChosenFont) {
        welcomeOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Set up font selection in welcome modal
    const fontOptions = welcomeOverlay.querySelectorAll('.font-option');
    const continueBtn = document.getElementById('continue-btn');
    let selectedFont = localStorage.getItem('preferredFont') || 'default';
    
    // Highlight the initially selected font
    fontOptions.forEach(option => {
        if (option.dataset.font === selectedFont) {
            option.classList.add('selected');
        }
        
        option.addEventListener('click', function() {
            // Remove selected class from all options
            fontOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            selectedFont = this.dataset.font;
        });
    });
    
    // Handle continue button click
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            // Save the font preference
            localStorage.setItem('preferredFont', selectedFont);
            localStorage.setItem('hasChosenFont', 'true');
            
            // Apply the selected font
            applyFontPreference(selectedFont);
            updateToggleButton(selectedFont === 'opendyslexic');
            
            // Hide the welcome modal
            welcomeOverlay.style.display = 'none';
            document.body.style.overflow = ''; // Re-enable scrolling
            
            // Show confirmation
            showNotification('Font preference saved!');
        });
    }
}

function initializeFontToggle() {
    console.log('Initializing font toggle...');
    
    // Get elements
    const fontToggle = document.getElementById('font-toggle');
    const fontModal = document.getElementById('font-selection-modal');
    const fontOptions = document.querySelectorAll('.font-option');
    const confirmBtn = document.getElementById('font-confirm-btn');
    let selectedFont = localStorage.getItem('preferredFont') || 'default';

    if (!fontToggle) {
        console.error('Font toggle button not found!');
        return;
    }

    // Apply saved font preference on page load
    applyFontPreference(selectedFont);
    updateToggleButton(selectedFont === 'opendyslexic');

    // Toggle font when clicking the font toggle
    fontToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const currentFont = document.body.classList.contains('opendyslexic') ? 'opendyslexic' : 'default';
        const newFont = currentFont === 'default' ? 'opendyslexic' : 'default';
        
        console.log(`Toggling font from ${currentFont} to ${newFont}`);
        
        applyFontPreference(newFont);
        updateToggleButton(newFont === 'opendyslexic');
        
        // Show notification
        const message = newFont === 'opendyslexic' 
            ? 'OpenDyslexic font applied.' 
            : 'Default font applied.';
        showNotification(message);
    });

    // Handle font selection in modal
    if (fontOptions.length && confirmBtn) {
        fontOptions.forEach(option => {
            option.addEventListener('click', function() {
                fontOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                selectedFont = this.getAttribute('data-font');
            });
        });

        confirmBtn.addEventListener('click', function() {
            console.log('Confirming font selection:', selectedFont);
            applyFontPreference(selectedFont);
            updateToggleButton(selectedFont === 'opendyslexic');
            
            // Close modal
            if (fontModal) {
                fontModal.classList.remove('active');
                setTimeout(() => {
                    fontModal.style.display = 'none';
                }, 300);
            }
            
            showNotification(selectedFont === 'opendyslexic' 
                ? 'OpenDyslexic font applied. You can change this anytime using the font toggle in the sidebar.'
                : 'Default font applied. You can change this anytime using the font toggle in the sidebar.'
            );
        });
    }
}

function applyFontPreference(font) {
    console.log('Applying font preference:', font);
    
    if (font === 'opendyslexic') {
        document.body.classList.add('opendyslexic');
        localStorage.setItem('preferredFont', 'opendyslexic');
    } else {
        document.body.classList.remove('opendyslexic');
        localStorage.setItem('preferredFont', 'default');
    }
    
    // Force reflow to ensure font change is applied
    document.body.offsetHeight;
}

function updateToggleButton(isOpenDyslexic) {
    const fontToggle = document.getElementById('font-toggle');
    if (!fontToggle) return;
    
    if (isOpenDyslexic) {
        fontToggle.classList.add('active');
        fontToggle.innerHTML = '<i class="fa fa-font"></i><span>Switch to Default Font</span>';
    } else {
        fontToggle.classList.remove('active');
        fontToggle.innerHTML = '<i class="fa fa-font"></i><span>Switch to OpenDyslexic</span>';
    }
}

function showNotification(message) {
    // Check if notification already exists
    let notification = document.querySelector('.font-notification');
    
    if (!notification) {
        // Create notification element
        notification = document.createElement('div');
        notification.className = 'font-notification';
        document.body.appendChild(notification);
        
        // Add styles for the notification if they don't exist
        if (!document.getElementById('font-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'font-notification-styles';
            style.textContent = `
                .font-notification {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    background-color: #4a90e2;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    pointer-events: none;
                    max-width: 90%;
                    text-align: center;
                }
                .font-notification.show {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Dynamic Image Resizing Function
 * 
 * This function adjusts the dimensions of images with the class `.dynamic-width` based on provided data attributes.
 * By default, images are centered. The alignment can be changed using the `data-align` attribute.
 * 
 * Usage:
 * - To set width: `data-width="300"`
 * - To set height: `data-height="200"`
 * - To align left: `data-align="left"`
 * - To align right: `data-align="right"`
 * 
 * Example:
 * <img src="/path/to/image.jpg" class="dynamic-width" data-width="300" data-align="left" alt="Description">
 */

function initializeDynamicImages() {
    // Font selection elements
    const fontModal = document.getElementById('font-selection-modal');
    const fontToggle = document.getElementById('font-toggle');
    const fontOptions = document.querySelectorAll('.font-option');
    const confirmBtn = document.getElementById('font-confirm-btn');
    let selectedFont = 'default';

    // Check if user has a font preference saved
    const savedFont = localStorage.getItem('preferredFont');
    const isFirstVisit = !localStorage.getItem('hasVisitedBefore');

    // Apply saved font preference if it exists
    if (savedFont === 'opendyslexic') {
        document.body.classList.add('opendyslexic');
        // Add active class to toggle button if OpenDyslexic is enabled
        if (fontToggle) fontToggle.classList.add('active');
    } else {
        // Ensure default font is set
        localStorage.setItem('preferredFont', 'default');
        if (fontToggle) fontToggle.classList.remove('active');
    }

    // Show modal on first visit
    if (isFirstVisit) {
        setTimeout(() => {
            fontModal.style.display = 'flex';
            setTimeout(() => fontModal.classList.add('active'), 10);
            localStorage.setItem('hasVisitedBefore', 'true');
        }, 1000); // Small delay to ensure page is loaded
    }

    // Font option selection
    fontOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            fontOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            selectedFont = option.getAttribute('data-font');
        });
    });

    // Confirm font selection
    confirmBtn.addEventListener('click', () => {
        // Save the selected font preference
        localStorage.setItem('preferredFont', selectedFont);
        
        // Apply the selected font
        if (selectedFont === 'opendyslexic') {
            document.body.classList.add('opendyslexic');
            showNotification('OpenDyslexic font applied. You can change this anytime using the font toggle in the sidebar.');
        } else {
            document.body.classList.remove('opendyslexic');
            showNotification('Default font applied. You can change this anytime using the font toggle in the sidebar.');
        }
        
        // Close the modal
        closeModal();
    });

    // Toggle font when clicking the font toggle
    if (fontToggle) {
        console.log('Font toggle button found, adding click handler');
        
        fontToggle.addEventListener('click', function(e) {
            console.log('Font toggle clicked');
            e.preventDefault();
            e.stopPropagation();
            
            const isOpenDyslexic = document.body.classList.contains('opendyslexic');
            console.log('Current font:', isOpenDyslexic ? 'OpenDyslexic' : 'Default');
            
            if (isOpenDyslexic) {
                console.log('Switching to default font');
                document.body.classList.remove('opendyslexic');
                fontToggle.classList.remove('active');
                localStorage.setItem('preferredFont', 'default');
                showNotification('Default font applied.');
            } else {
                console.log('Switching to OpenDyslexic font');
                document.body.classList.add('opendyslexic');
                fontToggle.classList.add('active');
                localStorage.setItem('preferredFont', 'opendyslexic');
                showNotification('OpenDyslexic font applied.');
            }
            
            // Log the current state after toggling
            console.log('New font class on body:', document.body.className);
            console.log('Active classes on toggle button:', fontToggle.className);
            
            // Force a reflow to ensure the transition happens
            document.body.offsetHeight;
        });
        
        // Log the initial state
        console.log('Font toggle button initialized');
        console.log('Initial preferredFont from localStorage:', localStorage.getItem('preferredFont'));
        console.log('Initial body classes:', document.body.className);
    } else {
        console.error('Font toggle button not found in the DOM');
    }

    // Close modal when clicking outside the content
    fontModal.addEventListener('click', (e) => {
        if (e.target === fontModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fontModal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        fontModal.classList.remove('active');
        setTimeout(() => {
            fontModal.style.display = 'none';
        }, 300); // Match the transition duration
    }

    function showNotification(message) {
        // Check if notification already exists
        let notification = document.querySelector('.font-notification');
        
        if (!notification) {
            // Create notification element
            notification = document.createElement('div');
            notification.className = 'font-notification';
            document.body.appendChild(notification);
            
            // Add styles for the notification
            const style = document.createElement('style');
            style.textContent = `
                .font-notification {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #4a90e2;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    pointer-events: none;
                }
                .font-notification.show {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set message and show notification
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Dynamic image resizing
    var images = document.querySelectorAll('.dynamic-width');

    images.forEach(function(img) {
        var desiredWidth = img.getAttribute('data-width');
        var desiredHeight = img.getAttribute('data-height');
        var alignment = img.getAttribute('data-align');

        if (desiredWidth && desiredHeight) {
            img.style.width = desiredWidth + 'px';
            img.style.height = desiredHeight + 'px';
        } else if (desiredWidth) {
            img.style.width = desiredWidth + 'px';
            img.style.height = 'auto';
        } else if (desiredHeight) {
            var aspectRatio = img.naturalWidth / img.naturalHeight;
            img.style.width = (desiredHeight * aspectRatio) + 'px';
            img.style.height = desiredHeight + 'px';
        }

        if (alignment === 'left') {
            img.classList.add('align-left');
        } else if (alignment === 'right') {
            img.classList.add('align-right');
        }
    });
}
