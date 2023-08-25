document.addEventListener("DOMContentLoaded", function() {
    var images = document.querySelectorAll('.dynamic-width');

    images.forEach(function(img) {
        var desiredWidth = img.getAttribute('data-width');
        var desiredHeight = img.getAttribute('data-height');

        if (desiredWidth && desiredHeight) {
            // If both width and height are specified
            img.style.width = desiredWidth + 'px';
            img.style.height = desiredHeight + 'px';
        } else if (desiredWidth) {
            // If only width is specified
            img.style.width = desiredWidth + 'px';
            img.style.height = 'auto';
        } else if (desiredHeight) {
            // If only height is specified
            var aspectRatio = img.naturalWidth / img.naturalHeight;
            img.style.width = (desiredHeight * aspectRatio) + 'px';
            img.style.height = desiredHeight + 'px';
        }
        // If neither width nor height is specified, the image remains unchanged
    });
});
