// Modal popup (centered, takeover)
// API: modal({id, content, fadeIn, fadeOut, tintBackground, style, onDismiss}).show()

function modal({ id, content, fadeIn = true, fadeOut = true, tintBackground = false, style = '', onDismiss = null } = {}) {
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
      // If tintBackground is false and content is text, wrap .text-content with .modal-box
      let html = content.html();
      let isText = /class=["']text-content["']/.test(html);
      let boxStyle = '';
      if (isText && style) boxStyle = ` style='${style}'`;
      if (!tintBackground && isText) {
        html = `<div class='modal-box'${boxStyle}>${html}</div>`;
      } else {
        // If not boxed, try to apply style directly to .text-content
        if (isText && style) {
          html = html.replace(/class=(['"])text-content\1/, `class=$1text-content$1 style='${style}'`);
        }
      }
      modalEl.innerHTML = html;
      overlayEl.style.display = tintBackground ? 'block' : 'none';
      overlayEl.onclick = dismiss;
      modalEl.onclick = (e) => { dismiss(); e.stopPropagation(); };
      modalEl.addEventListener('dismiss', dismiss);
      if (fadeIn) {
        modalEl.style.opacity = 0;
        modalEl.style.display = 'flex';
        modalEl.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          modalEl.style.opacity = 1;
          setTimeout(() => { modalEl.style.transition = ''; }, 300);
        }, 10);
      } else {
        modalEl.style.opacity = 1;
        modalEl.style.display = 'flex';
      }
      isVisible = true;
      // --- Fade out fix ---
      // Save original dismiss
      const originalDismiss = dismiss;
      // Replace dismiss with fadeOut logic
      let fadeOutDismiss = dismiss;
      if (fadeOut) {
        fadeOutDismiss = () => {
          if (!isVisible) return;
          modalEl.style.opacity = 1;
          modalEl.style.transition = 'opacity 0.3s';
          setTimeout(() => {
            modalEl.style.opacity = 0;
            setTimeout(() => {
              modalEl.style.display = 'none';
              overlayEl.style.display = 'none';
              isVisible = false;
              if (typeof onDismiss === 'function') onDismiss();
              modalEl.style.transition = '';
            }, 300);
          }, 10);
        };
      }
      // Fix dismissOnBackgroundClick
      // Always dismiss on overlay click
      overlayEl.onclick = fadeOutDismiss;
      // --- Multi-step support for text and image ---
      // If content has nextSlide, clicking modal advances or dismisses
      let isImage = false;
      if (typeof content.html === 'function') {
        let html = content.html();
        isImage = /<img /.test(html);
      }
      if (typeof content.nextSlide === 'function') {
        modalEl.onclick = (e) => {
          e.stopPropagation();
          let prevHtml = modalEl.innerHTML;
          let finished = false;
          content.nextSlide(() => { finished = true; });
          // If content changed, update modal
          let newHtml = (() => {
            let html = content.html();
            let isText = /class=["']text-content["']/.test(html);
            let boxStyle = '';
            if (isText && style) boxStyle = ` style='${style}'`;
            if (!tintBackground && isText) {
              return `<div class='modal-box'${boxStyle}>${html}</div>`;
            } else if (isText && style) {
              return html.replace(/class=(['"])text-content\1/, `class=$1text-content$1 style='${style}'`);
            }
            if (isImage) {
              return html;
            }
            return html;
          })();
          if (!finished && newHtml !== prevHtml) {
            modalEl.innerHTML = newHtml;
          } else {
            fadeOutDismiss();
          }
        };
      } else {
        modalEl.onclick = (e) => { fadeOutDismiss(); e.stopPropagation(); };
      }
      // Add .modal-image class for image modals
      if (isImage) {
        modalEl.classList.add('modal-image');
      } else {
        modalEl.classList.remove('modal-image');
      }
      modalEl.addEventListener('dismiss', fadeOutDismiss);
      return this;
    }
  };
}
