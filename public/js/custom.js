document.addEventListener("DOMContentLoaded", function() {
    var images = document.querySelectorAll('.dynamic-width');

    images.forEach(function(img) {
        var desiredWidth = img.getAttribute('data-width');
        if (desiredWidth) {
            img.style.width = desiredWidth + 'px';
        }
    });
});