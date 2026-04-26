/**
 * Simple hash-based SPA router
 * Supports routes like: #/home, #/search, #/anime/12345
 */

const routes = [];
let notFoundHandler = null;
let currentCleanup = null;

/**
 * Register a route
 * @param {string} pattern - Route pattern, e.g. '/home', '/anime/:id'
 * @param {function} handler - Async function(params) that renders the page and optionally returns a cleanup function
 */
export function addRoute(pattern, handler) {
  // Convert pattern to regex
  const paramNames = [];
  const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  routes.push({
    pattern,
    regex: new RegExp(`^${regexStr}$`),
    paramNames,
    handler
  });
}

/**
 * Set handler for unmatched routes
 */
export function setNotFound(handler) {
  notFoundHandler = handler;
}

/**
 * Navigate to a route
 */
export function navigate(path) {
  window.location.hash = path;
}

/**
 * Get current route path
 */
export function getCurrentPath() {
  return window.location.hash.slice(1) || '/home';
}

/**
 * Start the router — listen for hash changes
 */
export function startRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // Handle initial route
}

/**
 * Handle the current route
 */
async function handleRoute() {
  const path = getCurrentPath();
  const app = document.getElementById('app');

  // Run cleanup from previous page
  if (currentCleanup) {
    try { currentCleanup(); } catch (e) { console.error('Page cleanup error:', e); }
    currentCleanup = null;
  }

  // Dismiss any lingering popups/modals
  document.getElementById('popup-root').innerHTML = '';
  document.getElementById('modal-root').innerHTML = '';
  document.getElementById('anime-hover-popup')?.remove();
  document.querySelectorAll('#move-dropdown, #list-modal-backdrop, #list-modal-dropdown').forEach(el => el.remove());

  // Find matching route
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      // Fade transition
      app.classList.remove('page-enter');
      void app.offsetWidth; // Force reflow
      app.classList.add('page-enter');

      try {
        const cleanup = await route.handler(params);
        if (typeof cleanup === 'function') {
          currentCleanup = cleanup;
        }
      } catch (e) {
        console.error('Route handler error:', e);
        app.innerHTML = `
          <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-20 text-center">
            <span class="material-symbols-outlined text-[64px] text-error mb-4">error</span>
            <h1 class="font-headline-lg text-headline-lg text-on-surface mb-2">Something went wrong</h1>
            <p class="text-on-surface-variant font-body-md">${e.message}</p>
            <button onclick="location.hash='/home'" class="mt-6 bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">
              Go Home
            </button>
          </div>
        `;
      }

      // Dispatch custom event for nav updates
      window.dispatchEvent(new CustomEvent('routechange', { detail: { path, params } }));
      return;
    }
  }

  // No matching route
  if (notFoundHandler) {
    notFoundHandler();
  } else {
    app.innerHTML = `
      <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-20 text-center">
        <span class="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">explore_off</span>
        <h1 class="font-headline-lg text-headline-lg text-on-surface mb-2">Page Not Found</h1>
        <p class="text-on-surface-variant font-body-md">The page you're looking for doesn't exist.</p>
        <button onclick="location.hash='/home'" class="mt-6 bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">
          Go Home
        </button>
      </div>
    `;
  }

  window.dispatchEvent(new CustomEvent('routechange', { detail: { path } }));
}
