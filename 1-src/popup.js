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
      popupEl.className = 'popup placed';
      popupEl.style.cssText = '';
      if (style) popupEl.style.cssText += style;
      popupEl.style.position = 'absolute';
      popupEl.innerHTML = content.html();
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
      // Handle click on popup: advance slide if possible, else dismiss
      popupEl.onclick = (e) => {
        if (typeof content.nextSlide === 'function') {
          content.nextSlide(() => dismiss());
          popupEl.innerHTML = content.html();
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
