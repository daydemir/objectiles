// Modal popup (centered, takeover)
// API: modal({id, content, fadeIn, fadeOut, tintBackground, dismissOnBackgroundClick, style, onDismiss}).show()

function modal({ id, content, fadeIn = true, fadeOut = true, tintBackground = false, dismissOnBackgroundClick = true, style = '', onDismiss = null } = {}) {
  if (!id || !content) throw new Error('modal requires id and content');
  let modalEl = document.getElementById(id);
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = id;
    modalEl.className = 'modal centered';
    document.body.appendChild(modalEl);
  }
  let overlayEl = document.querySelector('.modal-overlay');
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.className = 'modal-overlay';
    document.body.appendChild(overlayEl);
  }
  let isVisible = false;
  const dismiss = () => {
    if (!isVisible) return;
    modalEl.style.display = 'none';
    overlayEl.style.display = 'none';
    isVisible = false;
    if (typeof onDismiss === 'function') onDismiss();
  };
  return {
    show() {
      modalEl.className = 'modal centered';
      if (style) modalEl.style.cssText += ';' + style;
      modalEl.innerHTML = content.html();
      overlayEl.style.display = tintBackground ? 'block' : 'none';
      overlayEl.onclick = (dismissOnBackgroundClick ? dismiss : null);
      modalEl.onclick = (e) => { dismiss(); e.stopPropagation(); };
      modalEl.addEventListener('dismiss', dismiss);
      if (fadeIn) {
        modalEl.style.opacity = 0;
        modalEl.style.display = 'flex';
        setTimeout(() => modalEl.style.opacity = 1, 10);
      } else {
        modalEl.style.opacity = 1;
        modalEl.style.display = 'flex';
      }
      isVisible = true;
      return this;
    }
  };
}
