/**
 * Popup content creator for objectiles
 * @param {Object} params - Popup parameters
 * @param {string} params.id - Unique identifier for the popup
 * @param {Object} params.content - Content object (text, image, or video) with html method
 * @param {boolean} [params.fadeIn=true] - Whether to fade in
 * @param {boolean} [params.fadeOut=true] - Whether to fade out
 * @param {Function} [params.onDismiss=null] - Function to call when dismissed
 * @param {boolean} [params.dismissOnVideoEnd=false] - Dismiss popup when last video ends (only for video content)
 * @returns {Object} - Popup object with display methods
 */
function popup({ id, content, fadeIn = true, fadeOut = true, onDismiss = null, dismissOnVideoEnd = false } = {}) {
  // Validate required parameters
  if (!id || typeof id !== 'string') throw new Error('Popup requires a valid id');
  if (!content || typeof content.html !== 'function') throw new Error('Popup requires valid content');

  // Create popup element if it doesn't exist
  let popupEl = document.getElementById(id);
  if (!popupEl) {
    popupEl = document.createElement('div');
    popupEl.id = id;
    popupEl.className = 'popup';
    document.body.appendChild(popupEl);
  }

  // Create or get overlay element
  let overlayEl = document.querySelector('.popup-overlay');
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.className = 'popup-overlay';
    document.body.appendChild(overlayEl);
  }

  // State tracking
  let isVisible = false;

  // Setup dismissal function
  const dismiss = () => {
    if (!isVisible) return;

    const completeDismiss = () => {
      popupEl.style.display = 'none';
      overlayEl.style.display = 'none';
      isVisible = false;
      if (typeof onDismiss === 'function') onDismiss();
    };

    if (fadeOut) {
      popupEl.style.opacity = 0;
      setTimeout(completeDismiss, 300);
    } else {
      completeDismiss();
    }
  };

  // Set up initial styles
  popupEl.style.display = 'none';
  popupEl.style.transition = 'opacity 0.3s ease';

  // If content supports onLastVideoEnd and dismissOnVideoEnd, wire up dismiss
  if (typeof content.onLastVideoEnd === 'function' && dismissOnVideoEnd) {
    content.onLastVideoEnd(() => dismiss());
  }

  return {
    /**
     * Display as centered popup
     * @param {number} [topMargin=0] - Top margin in pixels
     * @returns {Object} - This popup object for method chaining
     */
    showCentered({ topMargin, leftMargin, dismissOnBackgroundClick, style } = {}) {
      // Set classes
      popupEl.className = 'popup centered';
      if (style) style.split(' ').forEach(c => popupEl.classList.add(c));

      // Set margins
      popupEl.style.marginTop = topMargin ? `${topMargin}px` : '0';
      popupEl.style.marginLeft = leftMargin ? `${leftMargin}px` : '0';

      // Set content
      if (content && content.html && content.html().includes('class="text-content"')) {
        popupEl.innerHTML = `<div class=\"popup-inner\">${content.html()}</div>`;
        // Apply custom style string as inline CSS to .text-content if provided
        if (style && (style.includes(':') || style.includes(';'))) {
          const textContent = popupEl.querySelector('.text-content');
          if (textContent) textContent.style.cssText += style;
        }
      } else {
        popupEl.innerHTML = content.html();
      }

      // Setup overlay
      overlayEl.style.display = 'block';
      if (dismissOnBackgroundClick) {
        overlayEl.onclick = dismiss;
      } else {
        overlayEl.onclick = null;
      }

      // Handle clicks
      popupEl.onclick = (e) => {
        if (typeof content.nextSlide === 'function') {
          content.nextSlide(() => dismiss());
          if (content && content.html && content.html().includes('class="text-content"')) {
            popupEl.innerHTML = `<div class=\"popup-inner\">${content.html()}</div>`;
          } else {
            popupEl.innerHTML = content.html();
          }
        } else {
          dismiss();
        }
        e.stopPropagation();
      };

      // Set dismiss event listener
      popupEl.addEventListener('dismiss', dismiss);

      // Show with fade if enabled
      if (fadeIn) {
        popupEl.style.opacity = 0;
        popupEl.style.display = 'block';
        setTimeout(() => popupEl.style.opacity = 1, 10);
      } else {
        popupEl.style.opacity = 1;
        popupEl.style.display = 'block';
      }

      isVisible = true;
      return this;
    },

    /**
     * Display as placed popup with absolute positioning
     * @param {Object} options - Options for the popup  
     * @param {boolean} options.dismissOnBackgroundClick - Whether to dismiss when background is clicked
     * @param {string} options.style - Additional CSS classes to apply
     * @returns {Object} - This popup object for method chaining
     */
    showPlaced({ dismissOnBackgroundClick, style } = {}) {
      // Set classes
      popupEl.className = 'popup placed';
      // Support explicit placement via CSS string or class names
      if (style && (style.includes(':') || style.includes(';'))) {
        popupEl.style.cssText += ';' + style;
      } else if (style) {
        style.split(' ').forEach(c => popupEl.classList.add(c));
      }
      // Set position to absolute
      popupEl.style.position = 'absolute';

      // Set content
      if (content && content.html && content.html().includes('class="text-content"')) {
        popupEl.innerHTML = `<div class=\"popup-inner\">${content.html()}</div>`;
      } else {
        popupEl.innerHTML = content.html();
      }

      // Setup overlay
      overlayEl.style.display = 'block';
      if (dismissOnBackgroundClick) {
        overlayEl.onclick = dismiss;
      } else {
        overlayEl.onclick = null;
      }

      // Handle clicks
      popupEl.onclick = (e) => {
        if (typeof content.nextSlide === 'function') {
          content.nextSlide(() => dismiss());
          if (content && content.html && content.html().includes('class="text-content"')) {
            popupEl.innerHTML = `<div class=\"popup-inner\">${content.html()}</div>`;
          } else {
            popupEl.innerHTML = content.html();
          }
        } else {
          dismiss();
        }
        e.stopPropagation();
      };

      // Set dismiss event listener
      popupEl.addEventListener('dismiss', dismiss);

      // Show with fade if enabled
      if (fadeIn) {
        popupEl.style.opacity = 0;
        popupEl.style.display = 'block';
        setTimeout(() => popupEl.style.opacity = 1, 10);
      } else {
        popupEl.style.opacity = 1;
        popupEl.style.display = 'block';
      }

      isVisible = true;
      return this;
    }
  };
}
