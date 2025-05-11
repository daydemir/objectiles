// popup-text.js - Text popup content creation

/**
 * Creates a text popup content element
 * @param {Object} popupInstance - The popup instance from the fluent API
 */
function createTextPopup(popupInstance) {
  if (!popupInstance || !popupInstance.content || popupInstance.type !== 'text') {
    console.error('[popup-text] Invalid text popup instance');
    return null;
  }
  
  const texts = popupInstance.content;
  
  // Create the content container
  const contentElement = document.createElement('div');
  contentElement.className = 'text-content';
  contentElement.textContent = texts[0]; // Start with first text
  contentElement.setAttribute('tabindex', '0');
  
  // Track current step
  let currentStep = 0;
  
  // Step through text when clicked
  contentElement.onclick = function(e) {
    e.stopPropagation();
    if (currentStep < texts.length - 1) {
      // Still have more steps, handle internally
      currentStep++;
      contentElement.textContent = texts[currentStep];
      return false; // Signal that we handled the click
    } else {
      // No more steps, signal to popup.js that we're done
      return true; // Signal that popup.js should handle dismissal
    }
  };
  
  // Add a method to check if there are more steps
  contentElement.hasMoreSteps = function() {
    return currentStep < texts.length - 1;
  };
  
  // Return the content element for the popup system
  return contentElement;
}

// Export the function for popup.js to use
window.createTextPopup = createTextPopup;
