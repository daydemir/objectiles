/**
 * Popup content creator for objectiles
 * @param {Object} params - Popup parameters
 * @param {string} params.id - Unique identifier for the popup
 * @param {Object} params.content - Content object (text, image, or video) with html method
 * @param {boolean} [params.fadeIn=true] - Whether to fade in
 * @param {boolean} [params.fadeOut=true] - Whether to fade out
 * @param {Function} [params.onDismiss=null] - Function to call when dismissed
 * @returns {Object} - Popup object with display methods
 */
function popup({ id, content, fadeIn = true, fadeOut = true, onDismiss = null } = {}) {
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
  
  return {
    /**
     * Display as centered popup
     * @param {number} [topMargin=0] - Top margin in pixels
     * @param {number} [leftMargin=0] - Left margin in pixels
     * @param {boolean} [tintBackground=true] - Whether to tint the background
     * @param {boolean} [dismissOnBackgroundClick=true] - Whether to dismiss when background is clicked
     * @param {string} [style=''] - Additional CSS classes to apply
     * @returns {Object} - This popup object for method chaining
     */
    showCentered(topMargin = 0, leftMargin = 0, tintBackground = true, dismissOnBackgroundClick = true, style = '') {
      // Set classes
      popupEl.className = 'popup centered';
      if (style) style.split(' ').forEach(c => popupEl.classList.add(c));
      
      // Set margins
      popupEl.style.marginTop = topMargin ? `${topMargin}px` : '0';
      popupEl.style.marginLeft = leftMargin ? `${leftMargin}px` : '0';
      
      // Set content
      popupEl.innerHTML = content.html();
      
      // Setup overlay
      overlayEl.style.display = tintBackground ? 'block' : 'none';
      if (tintBackground && dismissOnBackgroundClick) {
        overlayEl.onclick = dismiss;
      } else {
        overlayEl.onclick = null;
      }
      
      // Handle clicks
      popupEl.onclick = (e) => {
        if (typeof content.nextSlide === 'function') {
          content.nextSlide(() => dismiss());
          popupEl.innerHTML = content.html();
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
     * @param {boolean} [tintBackground=false] - Whether to tint the background
     * @param {boolean} [dismissOnBackgroundClick=true] - Whether to dismiss when background is clicked
     * @param {string} [style=''] - Additional CSS classes to apply
     * @returns {Object} - This popup object for method chaining
     */
    showPlaced(tintBackground = false, dismissOnBackgroundClick = true, style = '') {
      // Set classes
      popupEl.className = 'popup placed';
      if (style) style.split(' ').forEach(c => popupEl.classList.add(c));
      
      // Set position to absolute
      popupEl.style.position = 'absolute';
      
      // Set content
      popupEl.innerHTML = content.html();
      
      // Setup overlay
      overlayEl.style.display = tintBackground ? 'block' : 'none';
      if (tintBackground && dismissOnBackgroundClick) {
        overlayEl.onclick = dismiss;
      } else {
        overlayEl.onclick = null;
      }
      
      // Handle clicks
      popupEl.onclick = (e) => {
        if (typeof content.nextSlide === 'function') {
          content.nextSlide(() => dismiss());
          popupEl.innerHTML = content.html();
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
