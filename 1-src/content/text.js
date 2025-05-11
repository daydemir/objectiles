/**
 * Text content creator for objectiles
 * @param {Object} params - Text parameters
 * @param {string[]} params.texts - Array of text slides to display
 * @returns {Object} - Text object with html and nextSlide methods
 */
function text({ texts } = {}) {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error('Text content requires a non-empty array of text strings');
  }

  let currentIndex = 0;

  return {
    /**
     * Returns HTML for the current text slide
     * @returns {string} HTML representation of the current text slide
     */
    html: function() {
      return `<div class="text-content">${texts[currentIndex]}</div>`;
    },

    /**
     * Advances to the next text slide if available
     * @param {Function} onFinish - Callback to execute when the last slide is passed
     */
    nextSlide: function(onFinish) {
      currentIndex++;
      if (currentIndex >= texts.length) {
        currentIndex = texts.length - 1;
        if (typeof onFinish === 'function') {
          onFinish();
        }
      }
    }
  };
}