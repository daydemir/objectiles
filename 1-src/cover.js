/**
 * Cover content creator for objectiles
 * @param {Object} params - Cover parameters
 * @param {string} params.id - Unique identifier for the cover element
 * @param {Object} params.content - Content object (text, image, or video) with html method
 * @param {boolean} [params.fadeIn=true] - Whether to fade in
 * @param {boolean} [params.fadeOut=true] - Whether to fade out
 * @param {Function} [params.onDismiss=null] - Function to call when dismissed
 * @returns {Object} - Cover object with display methods
 */
function cover({ id, content, fadeIn = true, fadeOut = true, onDismiss = null } = {}) {
  // Validate required parameters
  if (!id || typeof id !== 'string') throw new Error('Cover requires a valid id');
  if (!content || typeof content.html !== 'function') throw new Error('Cover requires valid content');

  // Create cover element if it doesn't exist
  let coverEl = document.getElementById(id);
  if (!coverEl) {
    coverEl = document.createElement('div');
    coverEl.id = id;
    coverEl.className = 'cover-container';
    document.body.appendChild(coverEl);
  }

  // Create or get overlay element
  let overlayEl = document.querySelector('.cover-overlay');
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.className = 'cover-overlay';
    document.body.appendChild(overlayEl);
  }

  // State tracking
  let isVisible = false;

  // Setup dismissal function
  const dismiss = () => {
    if (!isVisible) return;
    
    const completeDismiss = () => {
      coverEl.style.display = 'none';
      overlayEl.style.display = 'none';
      isVisible = false;
      if (typeof onDismiss === 'function') onDismiss();
    };
    
    if (fadeOut) {
      coverEl.classList.add('cover-fade-out');
      overlayEl.classList.add('cover-fade-out');
      coverEl.style.opacity = 0;
      overlayEl.style.opacity = 0;
      const onTransitionEnd = () => {
        coverEl.removeEventListener('transitionend', onTransitionEnd);
        completeDismiss();
        coverEl.classList.remove('cover-fade-out');
        overlayEl.classList.remove('cover-fade-out');
      };
      coverEl.addEventListener('transitionend', onTransitionEnd);
    } else {
      completeDismiss();
    }
  };

  // Set up initial styles
  coverEl.style.display = 'none';
  coverEl.style.transition = 'opacity 0.3s ease';
  
  return {
    /**
     * Display as cover on page load
     * @param {string} [style=''] - Additional CSS classes to apply
     * @returns {Object} - This cover object for method chaining
     */
    makeIntro(style = '') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          coverEl.classList.add('cover-intro');
          this.showCover(style);
        });
      } else {
        coverEl.classList.add('cover-intro');
        this.showCover(style);
      }
      return this;
    },

    /**
     * Display cover immediately
     * @param {string} [style=''] - CSS styles to apply directly to the cover element
     * @returns {Object} - This cover object for method chaining
     */
    showCover(style = '') {
      // Set base class
      coverEl.className = 'cover-container';
      
      // Apply style directly if it contains CSS properties
      if (style && (style.includes(':') || style.includes(';'))) {
        coverEl.style.cssText = style;
      }
      // Otherwise treat as class names
      else if (style) {
        style.split(' ').forEach(c => coverEl.classList.add(c));
      }
      
      // Set content
      coverEl.innerHTML = content.html();
      // Always apply custom style to .text-content after setting content
      if (style && (style.includes(':') || style.includes(';'))) {
        const textContent = coverEl.querySelector('.text-content');
        if (textContent) textContent.style.cssText += style;
      }
      // Set initial opacity before fade-in
      coverEl.style.opacity = 0;
      overlayEl.style.opacity = 0;
      
      // Show overlay
      overlayEl.style.display = 'block';
      
      // Handle clicks
      coverEl.onclick = (e) => {
        if (typeof content.nextSlide === 'function') {
          content.nextSlide(() => dismiss());
          coverEl.innerHTML = content.html();
          // Always apply custom style to .text-content after setting content
          if (style && (style.includes(':') || style.includes(';'))) {
            const textContent = coverEl.querySelector('.text-content');
            if (textContent) textContent.style.cssText += style;
          }
        } else {
          dismiss();
        }
        e.stopPropagation();
      };


      
      // Set dismiss event listener
      coverEl.addEventListener('dismiss', dismiss);
      
      // Show with fade if enabled
      coverEl.style.display = 'block';
      overlayEl.style.display = 'block';
      if (fadeIn) {
        coverEl.classList.add('cover-fade-in');
        overlayEl.classList.add('cover-fade-in');
        coverEl.style.opacity = 0;
        overlayEl.style.opacity = 0;
        requestAnimationFrame(() => {
          coverEl.style.opacity = 1;
          overlayEl.style.opacity = 1;
        });
        const onTransitionEnd = () => {
          coverEl.removeEventListener('transitionend', onTransitionEnd);
          coverEl.classList.remove('cover-fade-in');
          overlayEl.classList.remove('cover-fade-in');
        };
        coverEl.addEventListener('transitionend', onTransitionEnd);
      } else {
        coverEl.style.opacity = 1;
        overlayEl.style.opacity = 1;
      }
      
      isVisible = true;
      return this;
    }
  };
}
