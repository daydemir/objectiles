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
loadCSS('1-src/cover.css');
loadCSS('1-src/modal.css');
loadCSS('1-src/content/text.css');
loadCSS('1-src/content/image.css');
loadCSS('1-src/content/video.css');

// Load JS files in the correct order (respecting dependencies)
const scripts = [
  '1-src/popup.js',
  '1-src/cover.js',
  '1-src/modal.js',
  '1-src/content/text.js',
  '1-src/content/image.js',
  '1-src/content/video.js',
  '1-src/layout.js',
  '1-src/fade.js'
];
scripts.forEach(src => loadScript(src));