/**
 * Video content creator for objectiles
 * @param {Object} params - Video parameters
 * @param {string} params.video - Video URL to display
 * @param {boolean} [params.loop=true] - Whether to loop the video
 * @param {boolean} [params.autoplay=true] - Whether to autoplay the video
 * @param {boolean} [params.dismissOnEnd=false] - Whether to dismiss when video ends
 * @returns {Object} - Video object with html method
 */
function video({
    videos,
    loop = true,
    autoplay = true,
    dismissOnEnd = false
} = {}) {
    if (!Array.isArray(videos) || videos.length === 0 || !videos.every(v => typeof v === 'string')) {
        throw new Error('Video content requires a non-empty array of video URLs');
    }
    let currentIndex = 0;
    return {
        html: function () {
            const loopAttr = loop ? 'loop' : '';
            const autoplayAttr = autoplay ? 'autoplay' : '';
            const muteAttr = autoplay ? 'muted' : '';
            const playsinlineAttr = 'playsinline';
            return `
        <div class="video-container">
          <video ${autoplayAttr} ${loopAttr} ${muteAttr} ${playsinlineAttr}>
            <source src="${videos[currentIndex]}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `;
        },
        nextSlide: function(onFinish, eventType) {
            const atLast = currentIndex === videos.length - 1;
            console.log('[video.js] nextSlide called', {currentIndex, eventType, atLast});
            if (atLast) {
                if (eventType === 'ended' && typeof this._onLastVideoEnd === 'function') {
                    console.log('[video.js] Calling onLastVideoEnd callback');
                    this._onLastVideoEnd();
                }
                if (eventType !== 'ended' && typeof onFinish === 'function') {
                    onFinish();
                    return true;
                }
                return false;
            } else {
                currentIndex++;
                return false;
            }
        },
        onLastVideoEnd: function(cb) {
            console.log('[video.js] onLastVideoEnd callback set');
            this._onLastVideoEnd = cb;
        }
    };
}
