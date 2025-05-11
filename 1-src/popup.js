// popup.js - Core popup management module

// Global popup state
let popupEl = null;
let overlayEl = null;

// Track multiple popups by id
const popups = {};
let popupIdCounter = 1;

// Intro popup queue
const introPopupQueue = [];
let introPopupShown = false;

/**
 * Create shared popup DOM elements if they don't exist
 */
function createPopupElements() {
  if (!popupEl) {
    popupEl = document.createElement('div');
    popupEl.className = 'popup shared-popup';
    document.body.appendChild(popupEl);
  }
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.className = 'tint-background shared-popup-overlay';
    document.body.appendChild(overlayEl);
  }
  
  // Ensure elements are in a clean state
  popupEl.style.display = 'none';
  overlayEl.style.display = 'none';
}

/**
 * Show the background overlay
 * @param {boolean} dismissOnClick - Whether clicking the overlay should dismiss the popup
 */
function showOverlay(dismissOnClick = true) {
  if (overlayEl) {
    overlayEl.style.display = 'block';
    overlayEl.classList.add('show');
    overlayEl.style.pointerEvents = 'auto';
    
    // Add or remove click event based on dismissOnClick
    overlayEl.removeEventListener('click', hide);
    if (dismissOnClick) {
      overlayEl.addEventListener('click', hide);
    }
  }
  if (popupEl) {
    popupEl.style.pointerEvents = 'auto';
  }
}

/**
 * Hide the background overlay
 */
function hideOverlay() {
  if (overlayEl) {
    overlayEl.classList.remove('show');
    overlayEl.style.display = 'none';
    overlayEl.style.pointerEvents = 'none';
    overlayEl.removeEventListener('click', hide);
  }
  if (popupEl) {
    // Keep pointer events active for popups even when overlay is hidden
    // This ensures popups are clickable even when tintBackground is false
    popupEl.style.pointerEvents = 'auto';
  }
}

// Current onDismiss callback for the main popup
let _onDismiss = null;

/**
 * Hide the main popup
 */
function hide() {
  if (popupEl) {
    // If we're fading out, do it with animation
    if (popupEl.classList.contains('fade-transition')) {
      popupEl.style.opacity = '0';
      setTimeout(() => {
        popupEl.classList.remove('show', 'fade-transition');
        popupEl.className = 'popup shared-popup';
        popupEl.innerHTML = '';
        popupEl.style.opacity = '';
      }, 300);
    } else {
      popupEl.classList.remove('show');
      popupEl.className = 'popup shared-popup';
      popupEl.innerHTML = '';
    }
  }
  // Note: hideOverlay is called here but may be overridden by specific popup functions
  // to maintain the tintBackground setting
  hideOverlay();
  
  if (typeof _onDismiss === 'function') {
    try { _onDismiss(); } catch (e) { console.error('[popup] onDismiss error', e); }
    _onDismiss = null;
  }
  
  // Check if there are any intro popups in the queue
  setTimeout(showNextIntroPopup, 500);
}

/**
 * Apply fade-in effect to a popup element
 * @param {HTMLElement} element - The popup element to fade in
 */
function applyFadeIn(element) {
  if (!element) return;
  
  // Set initial state
  element.classList.add('fade-transition');
  element.style.opacity = '0';
  
  // Force browser to recognize the initial state before changing
  setTimeout(() => {
    element.style.opacity = '1';
  }, 10);
}

/**
 * Apply fade-out effect to a popup element and then perform an action
 * @param {HTMLElement} element - The popup element to fade out
 * @param {Function} afterFadeAction - Function to call after fade completes
 */
function applyFadeOut(element, afterFadeAction) {
  if (!element) return;
  
  element.classList.add('fade-transition');
  element.style.opacity = '0';
  
  setTimeout(() => {
    if (typeof afterFadeAction === 'function') {
      afterFadeAction();
    }
  }, 300); // Match the transition duration in CSS
}

/**
 * Dismiss a popup
 * @param {Object} popupInstance - The popup instance to dismiss
 */
function dismissPopup(popupInstance) {
  if (popupInstance && typeof popupInstance.dismiss === 'function') {
    popupInstance.dismiss();
    delete popups[popupInstance.id];
  } else {
    // Fallback to hide if no specific popup instance
    hide();
  }
}

/**
 * Programmatically dismiss a popup by id
 * @param {string} id - The ID of the popup to dismiss
 * @returns {boolean} Whether the popup was successfully dismissed
 */
function dismissPopupById(id) {
  if (!id || !popups[id]) return false;
  
  const popup = popups[id];
  const element = popup.element;
  
  if (element && element.parentNode) {
    // If we want to fade out
    if (popup.settings && popup.settings.fadeOut) {
      applyFadeOut(element, () => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        if (popup.settings && typeof popup.settings.onDismiss === 'function') {
          try { popup.settings.onDismiss(); } catch (e) { console.error('[popup] onDismiss error', e); }
        }
        delete popups[id];
      });
    } else {
      // No fade, remove immediately
      element.parentNode.removeChild(element);
      if (popup.settings && typeof popup.settings.onDismiss === 'function') {
        try { popup.settings.onDismiss(); } catch (e) { console.error('[popup] onDismiss error', e); }
      }
      delete popups[id];
    }
  }
  
  return true;
}

/**
 * Show the next intro popup in the queue
 */
function showNextIntroPopup() {
  if (introPopupQueue.length > 0 && !introPopupShown) {
    const popupInstance = introPopupQueue.shift();
    introPopupShown = true;
    
    // Add event to mark intro as shown once it's dismissed
    const originalOnDismiss = popupInstance.settings.onDismiss;
    popupInstance.settings.onDismiss = function() {
      if (typeof originalOnDismiss === 'function') {
        originalOnDismiss();
      }
      introPopupShown = false;
      // Check if there are more intros to show
      setTimeout(showNextIntroPopup, 500);
    };
    
    popupInstance.show();
  }
}

/**
 * Display a popup with the given content element and settings
 * @param {Object} popupInstance - The popup instance
 * @param {HTMLElement} contentElement - The content element to display
 */
function displayPopup(popupInstance, contentElement) {
  if (!popupInstance || !contentElement) {
    console.error('[popup] Cannot display popup without content element');
    return;
  }
  
  const settings = popupInstance.settings;
  
  // For takeover popups (centered or fullscreen)
  if (settings.center) {
    createPopupElements();
    const popupEl = document.querySelector('.shared-popup');
    if (!popupEl) return;
    
    popupEl.innerHTML = '';
    
    // Apply fade-in effect if requested
    if (settings.fadeIn) {
      applyFadeIn(popupEl);
    }
    
    // Apply positioning based on style
    if (settings.style && typeof settings.style === 'string') {
      popupEl.className = 'popup show precision-placed';
      popupEl.classList.remove('centered');
      popupEl.setAttribute('style', settings.style);
    } else {
      popupEl.className = 'popup show centered';
      popupEl.classList.remove('precision-placed');
      popupEl.removeAttribute('style');
    }
    
    // Show or hide the overlay based on settings
    if (settings.tintBackground) {
      showOverlay(settings.dismissOnBackgroundClick);
    } else {
      hideOverlay();
    }
    
    // Add the content element to the popup
    popupEl.appendChild(contentElement);
    
    // Set the onDismiss callback
    if (typeof settings.onDismiss === 'function') {
      _onDismiss = settings.onDismiss;
    }
    
    // Add a close button
    const closeButton = document.createElement('div');
    closeButton.className = 'popup-close-button';
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '1010';
    closeButton.style.color = '#fff';
    
    closeButton.addEventListener('click', function(e) {
      e.stopPropagation();
      dismissPopup(popupInstance);
    });
    
    popupEl.appendChild(closeButton);
    
    // Set up dismiss function
    popupInstance.dismiss = function() {
      if (settings.fadeOut) {
        applyFadeOut(popupEl, () => {
          hide();
        });
      } else {
        hide();
      }
    };
  } else {
    // Non-takeover behavior (multiple popups, no overlay)
    if (popupInstance.id && popups[popupInstance.id]) {
      console.log('[popup] Popup already exists with id:', popupInstance.id);
      return;
    }
    
    // Create a new popup element
    const newPopup = document.createElement('div');
    newPopup.id = popupInstance.id;
    newPopup.className = 'popup show';
    
    if (settings.style) {
      newPopup.setAttribute('style', settings.style);
      newPopup.classList.add('precision-placed');
    } else {
      newPopup.classList.add('centered');
    }
    
    // Apply fade-in effect if requested
    if (settings.fadeIn) {
      applyFadeIn(newPopup);
    }
    
    // Add the content element to the popup
    newPopup.appendChild(contentElement);
    document.body.appendChild(newPopup);
    
    // Store popup reference
    popups[popupInstance.id] = {
      element: newPopup,
      instance: popupInstance,
      settings: settings
    };
    
    // Add close button
    const closeBtn = document.createElement('div');
    closeBtn.className = 'popup-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      dismissPopup(popupInstance.id);
    };
    newPopup.appendChild(closeBtn);
    
    // Set content dismiss callback if provided
    if (typeof onContentDismiss === 'function') {
      // This will be called by the content when it needs to dismiss itself
      popupInstance.contentDismiss = function() {
        dismissPopup(popupInstance.id);
      };
    }
  }

  // Ensure video loops properly when dismissOnEnd is false
  if (!dismissOnEnd) {
    // Give the video time to be created
    setTimeout(() => {
      const video = document.getElementById('popupVideo');
      if (video) {
        video.loop = true;
      }
    }, 50);
  }
}

// Initialize intro popups when the page loads
window.addEventListener('load', () => {
  setTimeout(showNextIntroPopup, 500);
});

/**
 * Main popup API - Fluent interface
 * @param {string} id - Unique identifier for this popup
 * @returns {Object} Popup builder object with fluent interface
 */
function popupBuilder(id) {
  // Normalize the ID
  const popupId = id || `popup-${popupIdCounter++}`;
  
  // Create a new popup instance
  const instance = {
    id: popupId,
    type: null,
    content: null,
    contentOptions: {},
    settings: {
      center: true,
      style: null,
      fadeIn: false,
      fadeOut: false,
      tintBackground: true,
      dismissOnBackgroundClick: true,
      onDismiss: null
    },
    
    // Set content type to text
    text: function(texts) {
      this.type = 'text';
      this.content = Array.isArray(texts) ? texts : [texts];
      return this;
    },
    
    // Set content type to image
    image: function(images) {
      this.type = 'image';
      this.content = Array.isArray(images) ? images : [images];
      return this;
    },
    
    // Set content type to video
    video: function(video, delay = false, loop = false, autoplay = true, dismissOnEnd = null) {
      this.type = 'video';
      this.content = Array.isArray(video) ? video : [video];
      this.contentOptions = {
        delay: delay ? 1000 : 0, // Default 1 second delay if true
        loop: loop,
        autoplay: autoplay,
        dismissOnEnd: dismissOnEnd,
        endAction: loop ? 'loop' : 'dismiss'
      };
      return this;
    },
    
    // Configure display settings
    settings: function(options = {}) {
      if (options.center !== undefined) this.settings.center = !!options.center;
      if (options.style !== undefined) this.settings.style = options.style;
      if (options.fadeIn !== undefined) this.settings.fadeIn = !!options.fadeIn;
      if (options.fadeOut !== undefined) this.settings.fadeOut = !!options.fadeOut;
      if (options.tintBackground !== undefined) this.settings.tintBackground = !!options.tintBackground;
      if (options.dismissOnBackgroundClick !== undefined) this.settings.dismissOnBackgroundClick = !!options.dismissOnBackgroundClick;
      if (options.onDismiss !== undefined) this.settings.onDismiss = options.onDismiss;
      return this;
    },
    
    // Show the popup immediately
    show: function() {
      if (!this.type || !this.content) {
        console.error('[popup] Cannot show popup without content type and content');
        return this;
      }
      
      // Store the popup instance in the popups object
      popups[this.id] = this;
      
      // Create the appropriate popup based on type
      let contentElement = null;
      if (this.type === 'text') {
        contentElement = createTextPopup(this);
      } else if (this.type === 'image') {
        contentElement = createImagePopup(this);
      } else if (this.type === 'video') {
        contentElement = createVideoPopup(this);
      }
      
      // Display the popup if content was created
      if (contentElement) {
        // Store a reference to the content element
        this.contentElement = contentElement;
        
        // Add a wrapper click handler that coordinates with content-specific handlers
        contentElement.addEventListener('click', function(e) {
          // Let the content-specific click handler run first (if any)
          // If it returns true, it means we should dismiss the popup
          // If it returns false, it means it handled the click internally
          const shouldDismiss = e.target.onclick && e.target.onclick(e);
          
          if (shouldDismiss === true) {
            // Content is done with its steps, dismiss the popup
            dismissPopup(this);
          }
        }.bind(this));
        
        // Handle any delay for videos
        if (contentElement.delayMs > 0) {
          setTimeout(() => {
            displayPopup(this, contentElement);
          }, contentElement.delayMs);
        } else {
          displayPopup(this, contentElement);
        }
      }
      
      return this;
    },
    
    // Queue the popup to show when the page loads
    showAsIntro: function() {
      introPopupQueue.push(this);
      return this;
    }
  };
  
  return instance;
}

// Export the popup API
window.popup = popupBuilder;

// Export core functions for popup modules
window.displayPopup = displayPopup;
window.dismissPopup = dismissPopup;
window.hide = hide;

// Remove all legacy functions
