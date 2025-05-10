// popup.js - Shared popup module

// Global popup state
let popupEl = null;
let overlayEl = null;
let currentTextArray = null;
let currentTextStep = 0;
let currentImageArray = null;
let currentImageStep = 0;
let popupMode = null; // 'text' or 'image'

// Track multiple popups by id
const popups = {};
let popupIdCounter = 1;

// Create popup DOM elements if they don't exist
function createPopupElements() {
  if (!popupEl) {
    popupEl = document.createElement('div');
    popupEl.className = 'popup shared-popup';
    document.body.appendChild(popupEl);
  }
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.className = 'fade-overlay shared-popup-overlay';
    overlayEl.addEventListener('click', hide);
    document.body.appendChild(overlayEl);
  }
}

// Show the background overlay
function showOverlay() {
  if (overlayEl) {
    overlayEl.style.display = 'block';
    overlayEl.classList.add('show');
    overlayEl.style.pointerEvents = 'auto';
  }
  if (popupEl) {
    popupEl.style.pointerEvents = 'auto';
  }
}

// Hide the background overlay
function hideOverlay() {
  if (overlayEl) {
    overlayEl.classList.remove('show');
    overlayEl.style.display = 'none';
    overlayEl.style.pointerEvents = 'none';
  }
  if (popupEl) {
    popupEl.style.pointerEvents = 'none';
  }
}

// Hide the modal popup
function hide() {
  if (popupEl) {
    popupEl.classList.remove('show');
    popupEl.className = 'popup shared-popup';
    popupEl.innerHTML = '';
  }
  hideOverlay();
  currentTextArray = null;
  currentTextStep = 0;
  currentImageArray = null;
  currentImageStep = 0;
  popupMode = null;
}

/**
 * Show a text popup.
 * @param {Object} opts
 * @param {boolean} opts.tintBackground
 * @param {boolean} opts.takeOverScreen
 * @param {string=} opts.style - Optional inline style string for popup container (e.g. 'top: 730px; left: 0px; width: 440px; height: auto;')
 */
/**
 * Show a text popup.
 * @param {Object} opts
 * @param {boolean} opts.tintBackground
 * @param {boolean} opts.takeOverScreen
 * @param {string=} opts.style - Optional inline style string for popup container (e.g. 'top: 730px; left: 0px; width: 440px; height: auto;')
 * @param {string=} opts.popupName - Optional unique name for this popup. Prevents duplicate popups with the same name.
 */
function showTextPopup({ tintBackground = true, takeOverScreen = true, style = null, popupName = null, fade = false } = {}) {
  if (takeOverScreen) {
    // Old modal behavior (single popup, overlay)
    if (!popupEl || !currentTextArray) return;
    popupEl.innerHTML = '';
    if (fade) {
      popupEl.style.transition = 'opacity 3s';
      popupEl.style.opacity = '0';
      setTimeout(() => { popupEl.style.opacity = '1'; }, 10);
    } else {
      popupEl.style.transition = '';
      popupEl.style.opacity = '';
    }
    
    // Extract style properties
    let containerStyle = '';
    let contentStyle = '';
    
    if (style && typeof style === 'string') {
      // Parse the style string to separate positioning styles from text styles
      const styleProps = style.split(';').filter(s => s.trim());
      
      styleProps.forEach(prop => {
        const [key, value] = prop.split(':').map(s => s.trim());
        // Text-related properties go to content, positioning to container
        if (['font-size', 'font-family', 'color', 'font-weight', 'text-align', 'line-height'].includes(key)) {
          contentStyle += `${key}: ${value}; `;
        } else {
          containerStyle += `${key}: ${value}; `;
        }
      });
      
      popupEl.className = 'popup show precision-placed';
      popupEl.classList.remove('centered');
      if (containerStyle) {
        popupEl.setAttribute('style', containerStyle);
      }
    } else {
      popupEl.className = 'popup show centered';
      popupEl.classList.remove('precision-placed');
      popupEl.removeAttribute('style');
    }
    
    if (tintBackground) {
      showOverlay();
      // Modal content
      const contentDiv = document.createElement('div');
      contentDiv.className = 'modal-content';
      contentDiv.textContent = currentTextArray[currentTextStep];
      
      // Apply text-specific styles to the content
      if (contentStyle) {
        contentDiv.setAttribute('style', contentStyle);
      }
      
      popupEl.appendChild(contentDiv);
      // Step through text
      popupEl.onclick = function (e) {
        e.stopPropagation();
        if (currentTextStep < currentTextArray.length - 1) {
          currentTextStep++;
          contentDiv.textContent = currentTextArray[currentTextStep];
        } else {
          if (fade) {
            popupEl.style.transition = 'opacity 3s';
            popupEl.style.opacity = '0';
            setTimeout(() => {
              hide();
            }, 3000);
          } else {
            hide();
          }
        }
      };
      contentDiv.onclick = null;
    } else {
      hideOverlay();
      // Create a padded, dark container for the text
      const container = document.createElement('div');
      container.className = 'popup-inner';
      container.textContent = currentTextArray[currentTextStep];
      container.setAttribute('tabindex', '0');
      
      // Apply text-specific styles to the content
      if (contentStyle) {
        container.setAttribute('style', contentStyle);
      }
      
      popupEl.appendChild(container);
      popupEl.onclick = null;
      console.log('[popup] .popup-inner created:', container, 'step:', currentTextStep);
      container.onclick = function (e) {
        console.log('[popup] .popup-inner clicked:', container, 'step:', currentTextStep);
        e.stopPropagation();
        if (currentTextStep < currentTextArray.length - 1) {
          currentTextStep++;
          container.textContent = currentTextArray[currentTextStep];
          console.log('[popup] advanced to step:', currentTextStep);
        } else {
          console.log('[popup] dismissing popup');
          if (fade) {
            popupEl.style.transition = 'opacity 3s';
            popupEl.style.opacity = '0';
            setTimeout(() => {
              hide();
            }, 3000);
          } else {
            hide();
          }
        }
      };
      console.log('[popup] .popup-inner onclick attached:', container);
    }
    return 'modal';
  } else {
    // Multiple popups allowed, use popupName as id if provided
    const popupId = popupName ? `popup-${popupName}` : `popup-${popupIdCounter++}`;
    if (popups[popupId]) {
      // Popup with this id already open
      return popupId;
    }
    const popupDiv = document.createElement('div');
    popupDiv.className = (style ? 'popup show precision-placed' : 'popup show centered');
    if (style && typeof style === 'string') {
      popupDiv.setAttribute('style', style);
    }
    popupDiv.setAttribute('data-popup-id', popupId);
    // Multi-step support for non-modal popups
    const container = document.createElement('div');
    container.className = 'popup-inner';
    let step = 0;
    const arr = currentTextArray && currentTextArray.length ? currentTextArray : [''];
    container.textContent = arr[0];
    container.setAttribute('tabindex', '0');
    popupDiv.appendChild(container);
    document.body.appendChild(popupDiv);
    popups[popupId] = popupDiv;
    console.log('[popup] created non-modal popup', popupId, popupDiv, 'content:', container.textContent);
    // Step-through logic
    container.onclick = function (e) {
      e.stopPropagation();
      if (step < arr.length - 1) {
        step++;
        container.textContent = arr[step];
        console.log('[popup] advanced to step:', step);
      } else {
        if (tintBackground && fade) {
          popupDiv.style.transition = 'opacity 3s';
          popupDiv.style.opacity = '0';
          setTimeout(() => {
            popupDiv.remove();
            delete popups[popupId];
            console.log('[popup] dismissed non-modal popup', popupId);
          }, 3000);
        } else {
          popupDiv.remove();
          delete popups[popupId];
          console.log('[popup] dismissed non-modal popup', popupId);
        }
      }
    };
    return popupId;
  }
}

/**
 * Programmatically dismiss a popup by id (for non-modal popups).
 * Example:
 *   popup.showText({
 *     texts: ['Hello!'],
 *     name: 'my-popup',
 *     takeOverScreen: false,
 *     style: 'top:100px;left:100px;'
 *   });
 *   popup.dismissPopup('popup-my-popup'); // closes the popup
 */
function dismissPopup(id) {
  if (popups[id]) {
    popups[id].remove();
    delete popups[id];
  }
}

/**
 * Show an image popup.
 * @param {string|string[]} imagePath - Single image path or array of image paths for slideshow
 * @param {Object} opts
 * @param {boolean} opts.tintBackground - Whether to show a background overlay
 * @param {boolean} opts.takeOverScreen - Whether the popup takes over the screen (modal)
 * @param {boolean} opts.fullscreen - Whether the image should fill the container without margins
 * @param {string=} opts.style - Optional inline style string for popup container
 * @param {string=} opts.popupName - Optional unique name for this popup. Prevents duplicate popups with the same name.
 */
function showImagePopup(imagePath, { tintBackground = true, takeOverScreen = true, fullscreen = false, style = null, popupName = null, fade = false } = {}) {
  if (takeOverScreen) {
    // Old modal behavior (single popup, overlay)
    if (!popupEl) return;
    popupEl.innerHTML = '';
    popupEl.className = fullscreen ? 'popup shared-popup show fullscreen' : 'popup shared-popup show';
    if (fade) {
      popupEl.style.transition = 'opacity 3s';
      popupEl.style.opacity = '0';
      setTimeout(() => { popupEl.style.opacity = '1'; }, 10);
    } else {
      popupEl.style.transition = '';
      popupEl.style.opacity = '';
    }
    
    // Handle image path (single string or array)
    const isSlideshow = Array.isArray(currentImageArray) && currentImageArray.length > 0;
    const currentImageSrc = isSlideshow ? currentImageArray[currentImageStep] : imagePath;
    
    if (tintBackground) {
      showOverlay();
      popupEl.style.display = 'flex'; // ensure flex centering
      popupEl.style.alignItems = 'center';
      popupEl.style.justifyContent = 'center';
      const img = document.createElement('img');
      img.src = currentImageSrc;
      img.id = 'popupImage'; // Add ID for easier reference
      
      // Apply fullscreen mode if requested
      if (fullscreen) {
        img.style.maxWidth = '100vw';
        img.style.maxHeight = '100vh';
        img.style.margin = '0';
        img.style.padding = '0';
        img.style.objectFit = 'cover'; // aspect fill
      } else {
        // Default margin mode
        img.style.maxWidth = '80vw';
        img.style.maxHeight = '80vh';
        img.style.margin = '20px';
        img.style.padding = '10px';
        img.style.objectFit = 'contain';
      }
      
      popupEl.appendChild(img);
      
      if (isSlideshow) {
        // For slideshows, advance to next image on click
        popupEl.onclick = function (e) {
          e.stopPropagation();
          if (currentImageStep < currentImageArray.length - 1) {
            currentImageStep++;
            document.getElementById('popupImage').src = currentImageArray[currentImageStep];
          } else {
            if (fade) {
              popupEl.style.transition = 'opacity 3s';
              popupEl.style.opacity = '0';
              setTimeout(() => {
                hide();
              }, 3000);
            } else {
              hide();
            }
          }
        };
        img.onclick = function (e) {
          e.stopPropagation();
          if (currentImageStep < currentImageArray.length - 1) {
            currentImageStep++;
            document.getElementById('popupImage').src = currentImageArray[currentImageStep];
          } else {
            if (fade) {
              popupEl.style.transition = 'opacity 3s';
              popupEl.style.opacity = '0';
              setTimeout(() => {
                hide();
              }, 3000);
            } else {
              hide();
            }
          }
        };
      } else {
        // For single images, just close on click
        if (takeOverScreen) {
          popupEl.onclick = function (e) {
            e.stopPropagation();
            if (fade) {
              popupEl.style.transition = 'opacity 3s';
              popupEl.style.opacity = '0';
              setTimeout(() => {
                hide();
              }, 3000);
            } else {
              hide();
            }
          };
          img.onclick = function (e) {
            e.stopPropagation();
            if (fade) {
              popupEl.style.transition = 'opacity 3s';
              popupEl.style.opacity = '0';
              setTimeout(() => {
                hide();
              }, 3000);
            } else {
              hide();
            }
          };
        } else {
          popupEl.onclick = null;
          img.onclick = function (e) {
            e.stopPropagation();
            if (fade) {
              popupEl.style.transition = 'opacity 3s';
              popupEl.style.opacity = '0';
              setTimeout(() => {
                hide();
              }, 3000);
            } else {
              hide();
            }
          };
        }
      }
    } else {
      hideOverlay();
      popupEl.style.display = 'flex';
      popupEl.style.alignItems = 'center';
      popupEl.style.justifyContent = 'center';
      popupEl.style.background = 'transparent'; // Ensure transparent background
      // Create a padded, dark container for the image
      const container = document.createElement('div');
      container.className = 'popup-inner';
      container.style.background = 'transparent'; // Ensure transparent background
      const img = document.createElement('img');
      img.src = currentImageSrc;
      img.id = 'popupImage'; // Add ID for easier reference
      
      // Apply fullscreen mode if requested
      if (fullscreen) {
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.margin = '0';
        img.style.padding = '0';
        img.style.objectFit = 'cover'; // aspect fill
        container.style.padding = '0';
      } else {
        // Default margin mode
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.margin = '10px';
        img.style.objectFit = 'contain';
      }
      
      container.appendChild(img);
      popupEl.appendChild(container);
      
      if (isSlideshow) {
        // For slideshows, advance to next image on click
        container.onclick = function(e) {
          e.stopPropagation();
          if (currentImageStep < currentImageArray.length - 1) {
            currentImageStep++;
            document.getElementById('popupImage').src = currentImageArray[currentImageStep];
          } else {
            if (fade) {
              popupEl.style.transition = 'opacity 3s';
              popupEl.style.opacity = '0';
              setTimeout(() => {
                hide();
              }, 3000);
            } else {
              hide();
            }
          }
        };
      } else {
        // For single images, just close on click
        if (takeOverScreen) {
          popupEl.onclick = function (e) {
            e.stopPropagation();
            if (fade) {
              popupEl.style.transition = 'opacity 3s';
              popupEl.style.opacity = '0';
              setTimeout(() => {
                hide();
              }, 3000);
            } else {
              hide();
            }
          };
        } else {
          popupEl.onclick = null;
          container.onclick = function (e) {
            e.stopPropagation();
            if (fade) {
              popupEl.style.transition = 'opacity 3s';
              popupEl.style.opacity = '0';
              setTimeout(() => {
                hide();
              }, 3000);
            } else {
              hide();
            }
          };
        }
      }
    }
  } else {
    // Multiple popups allowed, use popupName as id if provided
    const popupId = popupName ? `popup-${popupName}` : `popup-${popupIdCounter++}`;
    if (popups[popupId]) {
      // Popup with this id already open
      return popupId;
    }
    const popupDiv = document.createElement('div');
    popupDiv.className = (fullscreen ? 'popup show fullscreen ' : 'popup show ') + (style ? 'precision-placed' : 'centered');
    if (fade) {
      popupDiv.style.transition = 'opacity 3s';
      popupDiv.style.opacity = '0';
      setTimeout(() => { popupDiv.style.opacity = '1'; }, 10);
    } else {
      popupDiv.style.transition = '';
      popupDiv.style.opacity = '';
    }
    if (style && typeof style === 'string') {
      popupDiv.setAttribute('style', style);
    }
    popupDiv.setAttribute('data-popup-id', popupId);
    const container = document.createElement('div');
    container.className = 'popup-inner';
    const img = document.createElement('img');
    img.src = imagePath;
    container.appendChild(img);
    popupDiv.appendChild(container);
    document.body.appendChild(popupDiv);
    popups[popupId] = popupDiv;
    // Dismiss on click
    container.onclick = function (e) {
      e.stopPropagation();
      if (fade) {
        popupDiv.style.opacity = '0';
        setTimeout(() => {
          popupDiv.remove();
          delete popups[popupId];
        }, 3000);
      } else {
        popupDiv.remove();
        delete popups[popupId];
      }
    };
    return popupId;
  }
}

/**
 * Show a text popup with named parameters.
 * @param {Object} params - The parameters object
 * @param {string|string[]} params.texts - Single text string or array of text strings for slideshow
 * @param {string} params.name - Unique name for this popup
 * @param {boolean} params.tintBackground - Whether to show a background overlay
 * @param {boolean} params.takeOverScreen - Whether the popup takes over the screen (modal)
 * @param {string} params.style - Optional inline style string for popup container
 */
function showText({ texts, name = null, tintBackground = true, takeOverScreen = true, style = null, fade = false }) {
  createPopupElements();
  currentTextArray = Array.isArray(texts) ? texts : [texts];
  currentTextStep = 0;
  popupMode = 'text';
  
  // Configure options
  const opts = {
    popupName: name,
    tintBackground: tintBackground,
    takeOverScreen: takeOverScreen,
    style: style,
    fade: fade
  };
  
  // Show the popup
  if (opts.takeOverScreen === false) {
    // Temporarily store and restore currentTextArray for each popup
    const arr = currentTextArray;
    const id = showTextPopup(opts);
    currentTextArray = arr;
    return id;
  } else {
    showTextPopup(opts);
  }
}

// Legacy API for backward compatibility
function text(arr) {
  createPopupElements();
  currentTextArray = arr;
  currentTextStep = 0;
  popupMode = 'text';
  return {
    show: function (opts = {}) {
      if (typeof opts === 'boolean') opts = { tintBackground: opts };
      // Allow passing popupName for uniqueness
      if (opts && opts.takeOverScreen === false) {
        // Temporarily store and restore currentTextArray for each popup
        const arr = currentTextArray;
        const id = showTextPopup(opts);
        currentTextArray = arr;
        return id;
      } else {
        showTextPopup(opts);
      }
    }
  };
}

/**
 * Show an image popup with named parameters.
 * @param {Object} params - The parameters object
 * @param {string|string[]} params.images - Single image path or array of image paths for slideshow
 * @param {string} params.name - Unique name for this popup
 * @param {boolean} params.fullscreen - Whether the image should fill the container without margins
 * @param {boolean} params.tintBackground - Whether to show a background overlay
 * @param {boolean} params.takeOverScreen - Whether the popup takes over the screen (modal)
 * @param {string} params.style - Optional inline style string for popup container
 */
function showImage({ images, name = null, fullscreen = false, tintBackground = true, takeOverScreen = true, style = null, fade = false }) {
  createPopupElements();
  popupMode = 'image';
  
  // Handle both single image path and array of image paths
  if (Array.isArray(images)) {
    currentImageArray = images;
    currentImageStep = 0;
  } else {
    currentImageArray = null;
    currentImageStep = 0;
  }
  
  // Configure options
  const opts = {
    popupName: name,
    fullscreen: fullscreen,
    tintBackground: tintBackground,
    takeOverScreen: takeOverScreen,
    style: style,
    fade: fade
  };
  
  // Show the popup
  if (opts.takeOverScreen === false && Array.isArray(images)) {
    // For non-modal slideshows, we need special handling
    console.warn('Image slideshows are not supported in non-modal mode yet');
    // Use just the first image for now
    showImagePopup(images[0], opts);
  } else {
    showImagePopup(images, opts);
  }
}

// Expose the popup API globally
window.popup = { 
  dismissPopup,
  showText,
  showImage
};
