// popup-video.js - Video popup content creation

/**
 * Creates a video popup content element
 * @param {Object} popupInstance - The popup instance from the fluent API
 */
function createVideoPopup(popupInstance) {
  if (!popupInstance || !popupInstance.content || popupInstance.type !== 'video') {
    console.error('[popup-video] Invalid video popup instance');
    return null;
  }
  
  const videos = popupInstance.content;
  const options = popupInstance.contentOptions || {};
  
  // Extract video-specific options
  const fullscreen = options.fullscreen || false;
  const autoplay = options.autoplay !== undefined ? options.autoplay : true;
  const loop = options.loop || false;
  const endAction = options.endAction || (loop ? 'loop' : 'dismiss');
  const dismissOnEnd = options.dismissOnEnd;
  
  // Create a function that will be called after any delay
  const createVideoContent = () => {
    // Create video container
    const container = document.createElement('div');
    container.className = fullscreen ? 'video-container fullscreen' : 'video-container';
    
    // Create video element
    const video = document.createElement('video');
    video.src = videos[0]; // Start with first video
    video.controls = true;
    video.autoplay = autoplay;
    
    container.appendChild(video);
    
    // Track current step
    let currentStep = 0;
    
    // Handle video end
    const handleVideoEnd = () => {
      if (currentStep < videos.length - 1) {
        // Still have more videos, handle internally
        currentStep++;
        video.src = videos[currentStep];
        video.play();
        return false; // Signal that we handled the event
      } else if (endAction === 'loop') {
        // Loop back to the first video
        currentStep = 0;
        video.src = videos[currentStep];
        video.play();
        return false; // Signal that we handled the event
      } else {
        // No more videos and not looping, signal to popup.js that we're done
        // Store the callback for popup.js to call if needed
        if (typeof dismissOnEnd === 'function') {
          container.onDismissCallback = dismissOnEnd;
        }
        return true; // Signal that popup.js should handle dismissal
      }
    };
    
    // Add event listener for video end
    video.addEventListener('ended', handleVideoEnd);
    
    // Add click handler for container (not video)
    container.onclick = function(e) {
      // Only handle clicks directly on the container, not on the video
      if (e.target === container) {
        return handleVideoEnd();
      }
      return false; // Don't dismiss if clicking on the video itself
    };
    
    // Add a method to check if there are more steps
    container.hasMoreSteps = function() {
      return currentStep < videos.length - 1 || endAction === 'loop';
    };
    
    // Return the container
    return container;
  };
  
  // Create the video content
  const container = createVideoContent();
  
  // If there's a delay, we'll handle it in popup.js
  if (options.delay && options.delay > 0) {
    container.delayMs = options.delay;
  }
  
  return container;
}

// Export the function for popup.js to use
window.createVideoPopup = createVideoPopup;
