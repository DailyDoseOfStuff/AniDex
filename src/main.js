/**
 * AniTrack — Main Entry Point
 * Initializes the app, sets up routing, and renders shell components
 */
import './style.css';
import { addRoute, startRouter, navigate } from './router.js';
import { renderHeader } from './components/header.js';
import { renderBottomNav } from './components/bottomNav.js';
import { renderHomePage } from './pages/home.js';
import { renderSearchPage } from './pages/search.js';
import { renderLibraryPage } from './pages/library.js';
import { renderDetailPage } from './pages/detail.js';
import { renderProfilePage } from './pages/profile.js';
import { renderSchedulePage } from './pages/schedule.js';

// Initialize app
function init() {
  // Render persistent shell components
  renderHeader();
  renderBottomNav();

  // Register routes
  addRoute('/home', () => renderHomePage());
  addRoute('/search', () => renderSearchPage());
  addRoute('/library', () => renderLibraryPage());
  addRoute('/schedule', () => renderSchedulePage());
  addRoute('/profile', () => renderProfilePage());
  addRoute('/anime/:id', (params) => renderDetailPage(params));

  // Handle title language changes → re-render current page
  window.addEventListener('titleLanguageChanged', () => {
    // Re-trigger current route
    const event = new HashChangeEvent('hashchange');
    window.dispatchEvent(event);
  });

  // Default route
  if (!window.location.hash || window.location.hash === '#') {
    navigate('/home');
  }

  // Start router
  startRouter();
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
