/**
 * Video content creator for objectiles
 * @param {Object} params - Video parameters
 * @param {string} params.video - Video URL to display
 * @param {boolean} [params.delay=false] - Whether to delay the video start
 * @param {boolean} [params.loop=true] - Whether to loop the video
 * @param {boolean} [params.autoplay=true] - Whether to autoplay the video
 * @param {boolean} [params.dismissOnEnd=false] - Whether to dismiss when video ends
 * @returns {Object} - Video object with html method
 */
function video({
    video,
    delay = false,
    loop = true,
    autoplay = true,
    dismissOnEnd = false
} = {}) {
    if (!video || typeof video !== 'string') {
        throw new Error('Video content requires a valid video URL');
    }

    return {
        /**
         * Returns HTML for the video
         * @returns {string} HTML representation of the video
         */
        html: function () {
            // Apply attributes based on parameters
            const loopAttr = loop ? 'loop' : '';
            const autoplayAttr = autoplay && !delay ? 'autoplay' : ''; // Only autoplay if not delayed
            const muteAttr = autoplay ? 'muted' : ''; // Autoplay requires muted
            const playsinlineAttr = 'playsinline'; // For better mobile support

            // Add event listener for dismiss on end if enabled
            const onEndAttr = dismissOnEnd ?
                'onended="this.closest(\'.popup\').dispatchEvent(new CustomEvent(\'dismiss\'))"' : '';

            return `
        <div class="video-container">
          <video ${autoplayAttr} ${loopAttr} ${muteAttr} ${playsinlineAttr} ${onEndAttr}>
            <source src="${video}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `;
        }
    };
}
