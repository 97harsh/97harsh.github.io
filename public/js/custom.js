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

document.addEventListener("DOMContentLoaded", function() {
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
});
