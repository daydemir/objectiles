/**
 * Image content creator for objectiles
 * @param {Object} params - Image parameters
 * @param {string[]} params.images - Array of image URLs to display
 * @returns {Object} - Image object with html and nextSlide methods
 */
function image({ images } = {}) {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error('Image content requires a non-empty array of image URLs');
  }

  let currentIndex = 0;

  return {
    /**
     * Returns HTML for the current image slide
     * @returns {string} HTML representation of the current image slide
     */
    html: function() {
      return `<div class="image-container"><img src="${images[currentIndex]}" alt="Slide ${currentIndex + 1}"></div>`;
    },

    /**
     * Advances to the next image slide if available
     * @param {Function} onFinish - Callback to execute when the last slide is passed
     */
    nextSlide: function(onFinish) {
      currentIndex++;
      if (currentIndex >= images.length) {
        currentIndex = images.length - 1;
        if (typeof onFinish === 'function') {
          onFinish();
        }
      }
    }
  };
}