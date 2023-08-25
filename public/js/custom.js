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
