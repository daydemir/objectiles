// video.js - Video utility functions

/**
 * Shows an intro video using the popup API.
 * 
 * @param {string} videoPath - Path to the video file
 * @param {number} delay - Delay in milliseconds before showing the video
 * @param {boolean} tintBackground - Whether to show a background overlay
 * @param {boolean} center - Whether the popup is centered on screen
 * @param {boolean} fullscreen - Whether the video should fill the container without margins
 * @param {boolean} autoplay - Whether the video should autoplay
 * @param {string=} nextScene - Optional path to navigate to after the video ends
 * @param {string=} endAction - What to do when video ends: 'dismiss' (default) or 'loop'
 */
function showIntroVideo(videoPath, delay = 0, tintBackground = true, center = true, fullscreen = false, autoplay = true, nextScene = null, endAction = 'dismiss') {
    // If the popup module isn't loaded yet, wait for it
    if (!window.popup) {
        console.error('[showIntroVideo] Error: popup.js not loaded');
        return;
    }
    
    // Set up the onDismiss callback if nextScene is provided
    let onDismiss = null;
    if (nextScene) {
        onDismiss = () => {
            // Direct navigation without additional fade
            window.location.href = nextScene;
        };
    }
    
    // Use the new popup API
    if (delay > 0) {
        setTimeout(() => {
            window.popup.showVideo({
                videos: videoPath,
                name: 'intro-video',
                fullscreen: fullscreen,
                tintBackground: tintBackground,
                takeOverScreen: true,
                style: center ? null : 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
                fade: true,
                onDismiss: onDismiss,
                dismissOnEnd: endAction !== 'loop'
            });
        }, delay);
    } else {
        window.popup.showVideo({
            videos: videoPath,
            name: 'intro-video',
            fullscreen: fullscreen,
            tintBackground: tintBackground,
            takeOverScreen: true,
            style: center ? null : 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
            fade: true,
            onDismiss: onDismiss,
            dismissOnEnd: endAction !== 'loop'
        });
    }
}

// Video utilities for shared functionality
window.videoUtils = {
    /**
     * Creates a video element with standard settings
     * @param {Object} options - Configuration options
     * @param {string} options.src - Source URL for the video
     * @param {number} options.fadeDuration - Duration of fade effect in ms
     * @param {boolean} options.autoplay - Whether video should autoplay
     * @param {boolean} options.muted - Whether video should be muted
     * @param {boolean} options.playsinline - Whether video should play inline on mobile
     * @param {boolean} options.skippable - Whether video can be skipped
     * @param {boolean} options.loop - Whether video should loop
     * @param {Function} options.onFadeOut - Callback when video fades out
     * @returns {HTMLVideoElement} The created video element
     */
    createSharedVideoElement: function(options) {
        const {
            src,
            fadeDuration = 0,
            autoplay = true,
            muted = true,
            playsinline = true,
            skippable = true,
            loop = false,
            onFadeOut = null
        } = options || {};

        const video = document.createElement('video');
        video.src = src;
        video.autoplay = autoplay;
        video.muted = muted;
        video.playsinline = true;
        video.setAttribute('playsinline', '');
        
        // Simply set the loop attribute based on the loop parameter
        video.loop = loop;
        
        // Don't show controls for consistent styling with intro videos
        video.controls = false;
        
        // Handle fade effect if specified
        if (typeof onFadeOut === 'function' && fadeDuration > 0 && !loop) {
            video.addEventListener('ended', function() {
                onFadeOut(video, fadeDuration);
            });
        }
        
        return video;
    }
}
