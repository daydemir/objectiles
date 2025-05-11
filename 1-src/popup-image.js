// popup-image.js - Image popup content creation

/**
 * Creates an image popup content element
 * @param {Object} popupInstance - The popup instance from the fluent API
 */
function createImagePopup(popupInstance) {
  if (!popupInstance || !popupInstance.content || popupInstance.type !== 'image') {
    console.error('[popup-image] Invalid image popup instance');
    return null;
  }
  
  const images = popupInstance.content;
  
  // Determine if fullscreen mode is requested (can be added to contentOptions)
  const fullscreen = popupInstance.contentOptions && popupInstance.contentOptions.fullscreen;
  
  // Create image container
  const container = document.createElement('div');
  container.className = fullscreen ? 'image-container fullscreen' : 'image-container';
  
  // Create image element
  const img = document.createElement('img');
  img.src = images[0]; // Start with first image
  img.alt = 'Popup Image';
  
  container.appendChild(img);
  
  // Track current step
  let currentStep = 0;
  
  // Step through images when clicked
  container.onclick = function(e) {
    e.stopPropagation();
    if (currentStep < images.length - 1) {
      // Still have more steps, handle internally
      currentStep++;
      img.src = images[currentStep];
      return false; // Signal that we handled the click
    } else {
      // No more steps, signal to popup.js that we're done
      return true; // Signal that popup.js should handle dismissal
    }
  };
  
  // Add a method to check if there are more steps
  container.hasMoreSteps = function() {
    return currentStep < images.length - 1;
  };
  
  // Return the content element for the popup system
  return container;
}

// Export the function for popup.js to use
window.createImagePopup = createImagePopup;
