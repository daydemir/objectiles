/**
 * Objectiles.js - Main entry point for Objectiles framework
 * This file loads all required CSS and JS files in the correct order
 */

// Helper function to load CSS files
function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

// Helper function to load JS files
function loadScript(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;

  // Handle callback when script is loaded
  if (callback) {
    script.onload = callback;
  }

  document.head.appendChild(script);
}

// Load all CSS files
loadCSS('1-src/main.css');
loadCSS('1-src/popup.css');
loadCSS('1-src/popup-text.css');
loadCSS('1-src/popup-image.css');
loadCSS('1-src/popup-video.css');

// Load JS files in the correct order (respecting dependencies)
// First load core files
loadScript('1-src/popup.js', function () {
  // After popup.js is loaded, load the content-specific modules
  loadScript('1-src/popup-text.js');
  loadScript('1-src/popup-image.js');
  loadScript('1-src/popup-video.js');

  // Then load other utilities
  loadScript('1-src/fade.js');
  loadScript('1-src/layout.js');
});
