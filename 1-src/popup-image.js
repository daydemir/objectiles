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

  // Create image container
  const container = document.createElement('div');
  container.className = 'image-container';

  // Create image element
  const img = document.createElement('img');
  img.src = images[0]; // Start with first image
  img.alt = 'Popup Image';
  
  // Set basic image styles
  img.style.maxWidth = '100%';
  img.style.maxHeight = '100%';
  img.style.objectFit = 'contain';

  container.appendChild(img);

  // Add step indicator for multi-image popups
  if (images.length > 1) {
    const stepIndicator = document.createElement('div');
    stepIndicator.className = 'step-indicator';
    stepIndicator.textContent = `1/${images.length}`;
    stepIndicator.style.position = 'absolute';
    stepIndicator.style.bottom = '20px';
    stepIndicator.style.right = '20px';
    stepIndicator.style.backgroundColor = 'rgba(0,0,0,0.5)';
    stepIndicator.style.color = 'white';
    stepIndicator.style.padding = '5px 10px';
    stepIndicator.style.borderRadius = '5px';
    container.appendChild(stepIndicator);
  }

  // Track current step
  let currentStep = 0;

  // Add a method to check if there are more steps
  container.hasMoreSteps = function () {
    return currentStep < images.length - 1;
  };
  
  // Add a method to advance to the next step
  container.advanceToNextStep = function () {
    if (currentStep < images.length - 1) {
      // Advance to the next image
      currentStep++;
      img.src = images[currentStep];
      
      // Update step indicator if it exists
      const stepIndicator = container.querySelector('.step-indicator');
      if (stepIndicator) {
        stepIndicator.textContent = `${currentStep + 1}/${images.length}`;
      }
      
      return true; // Successfully advanced
    }
    return false; // No more steps to advance to
  };

  // Return the content element for the popup system
  return container;
}

// Export the function for popup.js to use
window.createImagePopup = createImagePopup;
