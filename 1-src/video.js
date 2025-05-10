// video.js - Simplified video handling functionality
// This script handles intro videos with automatic fade-out and skip-on-click behavior

/**
 * Creates and displays an intro video overlay that automatically fades out when the video ends
 * All videos are skippable by clicking on them
 * 
 * @param {string} video - Path to the video file (required)
 * @param {number} [fadeDuration=1000] - Duration of the fade out animation in ms
 * @param {boolean} [autoplay=true] - Whether the video should autoplay
 * @param {boolean} [muted=true] - Whether the video should be muted
 * @param {boolean} [playsinline=true] - Whether the video should play inline
 * @param {boolean} [skippable=true] - Whether the video is skippable by click
 * @param {string|null} [destinationHref=null] - If set, redirects to this URL when the video ends
 */
function createSharedVideoElement({
  src,
  fadeDuration = 1000,
  autoplay = true,
  muted = true,
  playsinline = true,
  skippable = true,
  onFadeOut = null
} = {}) {
  if (!src) {
    console.error('createSharedVideoElement: src is required');
    return null;
  }
  // Create video element
  const videoElement = document.createElement('video');
  videoElement.autoplay = autoplay;
  videoElement.muted = muted;
  videoElement.playsInline = playsinline;
  videoElement.setAttribute('playsinline', '');
  videoElement.setAttribute('webkit-playsinline', '');
  videoElement.setAttribute('muted', '');
  // Hide scrubber/controls unless explicitly requested
  videoElement.controls = false;
  // Source
  const source = document.createElement('source');
  source.src = src;
  source.type = 'video/mp4';
  videoElement.appendChild(source);
  // Fade out on end
  videoElement.addEventListener('ended', () => {
    if (onFadeOut) {
      onFadeOut(videoElement, fadeDuration);
    }
  });
  // Skippable by click (triggers fade out)
  if (skippable) {
    videoElement.style.cursor = 'pointer';
    videoElement.addEventListener('click', () => {
      if (onFadeOut) {
        onFadeOut(videoElement, fadeDuration);
      }
    });
  }
  return videoElement;
}

function showIntroVideo(video, fadeDuration = 1000, autoplay = true, muted = true, playsinline = true, skippable = true, destinationHref = null) {
  // Validate required parameter
  if (!video) {
    console.error('showIntroVideo: video path is required');
    return;
  }

  // Create the intro overlay container
  window.addEventListener('DOMContentLoaded', () => {
    // Create the overlay container
    const introOverlay = document.createElement('div');
    introOverlay.id = 'intro';
    introOverlay.className = 'intro-overlay';

    // Create the video element
    const videoElement = document.createElement('video');
    videoElement.id = 'introVideo';
    // Set attributes directly as properties
    videoElement.autoplay = autoplay;
    videoElement.muted = muted;
    videoElement.playsInline = playsinline;

    // Create the source element
    const source = document.createElement('source');
    source.src = video;
    source.type = 'video/mp4';

    // Assemble the elements
    videoElement.appendChild(source);
    introOverlay.appendChild(videoElement);

    // Add the overlay as the first child of the body
    document.body.insertBefore(introOverlay, document.body.firstChild);

    // If autoplay is off, clicking the video will start it
    if (!autoplay) {
      function startVideo() {
        videoElement.play();
        videoElement.removeEventListener('click', startVideo);
      }
      videoElement.addEventListener('click', startVideo);
      videoElement.style.cursor = 'pointer';
    }

    // Set up the fade out or redirect when the video ends
    videoElement.addEventListener('ended', () => {
      if (destinationHref) {
        window.location.href = destinationHref;
      } else {
        introOverlay.classList.add('fade-out');
        setTimeout(() => {
          introOverlay.remove();
        }, fadeDuration);
      }
    });

    // Make the video skippable if enabled
    if (skippable) {
      videoElement.style.cursor = 'pointer';
      videoElement.addEventListener('click', () => {
        // Trigger the ended event to simulate video completion
        const endEvent = new Event('ended');
        videoElement.dispatchEvent(endEvent);
      });
    }
  });
}

// Export for backward compatibility
window.videoUtils = {
  showIntroVideo,
  createSharedVideoElement
};
