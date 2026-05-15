/**
 * AniTrack — Main Entry Point
 * Initializes the app, sets up routing, auth, and renders shell components
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
import { initAuth, onAuthChange } from './auth.js';
import { migrateLocalToCloud, loadCloudData, invalidateFirestoreCache } from './data/storage.js';

// Initialize app
async function init() {
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

  // Initialize Firebase Auth — waits for initial auth state
  try {
    await initAuth();
  } catch (e) {
    console.warn('Firebase auth init failed (app will work in offline/local mode):', e);
  }

  // Handle auth state changes — migrate data and reload cloud data
  onAuthChange(async (user, previousUser) => {
    if (user) {
      // User just signed in
      invalidateFirestoreCache();

      // Migrate localStorage data to their cloud account
      const migrated = await migrateLocalToCloud();
      if (migrated) {
        console.log('AniTrack: Local data migrated to cloud');
      }

      // Load cloud data into cache
      await loadCloudData();

      // Re-render the current page to reflect synced data
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else if (previousUser) {
      // User just signed out — reset to localStorage
      invalidateFirestoreCache();
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
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
