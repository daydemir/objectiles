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
  const settings = popupInstance.settings || {};

  // Create the content container
  const contentElement = document.createElement('div');
  contentElement.className = 'text-content';
  contentElement.textContent = texts[0]; // Start with first text
  contentElement.setAttribute('tabindex', '0');
  
  // Add a container box if there's no background tint
  if (settings.tintBackground === false) {
    contentElement.classList.add('no-tint-container');
  }
  
  // Apply any text-specific styles if they exist in the style parameter
  // This handles text styling like color, font-size, etc.
  if (settings.style && typeof settings.style === 'string') {
    // Extract text-specific styles (color, font-size, font-family, text-align)
    const styleObj = {};
    const styleRegex = /(color|font-size|font-family|text-align|font-weight|line-height|letter-spacing|text-transform|text-decoration):\s*([^;]+);?/g;
    let match;
    while ((match = styleRegex.exec(settings.style)) !== null) {
      styleObj[match[1]] = match[2].trim();
    }
    
    // Apply text styles directly to the content element
    for (const [prop, value] of Object.entries(styleObj)) {
      contentElement.style[prop] = value;
    }
  }

  // Track current step
  let currentStep = 0;

  // Add a method to check if there are more steps
  contentElement.hasMoreSteps = function () {
    return currentStep < texts.length - 1;
  };
  
  // Add a method to advance to the next step
  contentElement.advanceToNextStep = function () {
    if (currentStep < texts.length - 1) {
      currentStep++;
      contentElement.textContent = texts[currentStep];
      return true; // Successfully advanced
    }
    return false; // No more steps to advance to
  };

  // Return the content element for the popup system
  return contentElement;
}

// Export the function for popup.js to use
window.createTextPopup = createTextPopup;
