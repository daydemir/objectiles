// Minimal placed popup implementation
// API: popup({id, content, fadeIn, fadeOut, dismissOnBackgroundClick, style, onDismiss}).show()

function popup({ id, content, fadeIn = true, fadeOut = true, dismissOnBackgroundClick = true, style = '', onDismiss = null } = {}) {
  if (!id || !content || typeof content.html !== 'function') throw new Error('popup requires id and content.html()');
  let popupEl = document.getElementById(id);
  if (!popupEl) {
    popupEl = document.createElement('div');
    popupEl.id = id;
    popupEl.className = 'popup placed';
    document.body.appendChild(popupEl);
  }
  let isVisible = false;
  const dismiss = () => {
    if (!isVisible) return;
    // Remove document click listener if present
    if (popupEl._backgroundListener) {
      document.removeEventListener('mousedown', popupEl._backgroundListener);
      popupEl._backgroundListener = null;
    }
    if (fadeOut) {
      popupEl.style.opacity = 0;
      setTimeout(() => {
        popupEl.style.display = 'none';
        isVisible = false;
        if (typeof onDismiss === 'function') onDismiss();
      }, 200);
    } else {
      popupEl.style.display = 'none';
      isVisible = false;
      if (typeof onDismiss === 'function') onDismiss();
    }
  };
  return {
    show() {
      // Add .popup-text class if content is text (has .text-content)
      popupEl.className = 'popup placed';
      popupEl.style.cssText = '';
      // Split style string into positional (for popupEl) and non-positional (for content)
      function splitStyles(style) {
        const positional = ['top','left','right','bottom','width','height','min-width','min-height','max-width','max-height','position'];
        let popupStyles = '', contentStyles = '';
        if (!style) return { popupStyles, contentStyles };
        style.split(';').forEach(rule => {
          const [prop, val] = rule.split(':').map(s => s && s.trim());
          if (prop && val) {
            if (positional.some(p => prop.startsWith(p))) {
              popupStyles += `${prop}: ${val};`;
            } else {
              contentStyles += `${prop}: ${val};`;
            }
          }
        });
        return { popupStyles, contentStyles };
      }
      const { popupStyles, contentStyles } = splitStyles(style);
      if (popupStyles) popupEl.style.cssText += popupStyles;
      popupEl.style.position = 'absolute';
      popupEl.innerHTML = content.html();
      // If this is a text popup, add .popup-text class for container styling
      if (popupEl.querySelector('.text-content')) {
        popupEl.classList.add('popup-text');
      } else {
        popupEl.classList.remove('popup-text');
      }
      applyCustomStyle();
      popupEl.style.opacity = fadeIn ? 0 : 1;
      popupEl.style.display = 'block';
      // Remove any previous document click listener
      if (popupEl._backgroundListener) {
        document.removeEventListener('mousedown', popupEl._backgroundListener);
        popupEl._backgroundListener = null;
      }
      if (dismissOnBackgroundClick) {
        popupEl._backgroundListener = function(e) {
          if (!popupEl.contains(e.target)) {
            dismiss();
          }
        };
        setTimeout(() => document.addEventListener('mousedown', popupEl._backgroundListener), 0);
      }
      // Helper to apply inline style to .text-content or .image-container
      function applyCustomStyle() {
        if (contentStyles) {
          let el = popupEl.querySelector('.text-content') || popupEl.querySelector('.image-container');
          if (el) el.style.cssText += contentStyles;
        }
      }
      // Handle click on popup: advance slide if possible, else dismiss
      popupEl.onclick = (e) => {
        if (typeof content.nextSlide === 'function') {
          content.nextSlide(() => dismiss());
          popupEl.innerHTML = content.html();
          applyCustomStyle();
        } else {
          dismiss();
        }
        e.stopPropagation();
      };
      popupEl.addEventListener('dismiss', dismiss);
      if (fadeIn) setTimeout(() => { popupEl.style.opacity = 1; }, 10);
      isVisible = true;
      return this;
    },
    dismiss
  };
}
