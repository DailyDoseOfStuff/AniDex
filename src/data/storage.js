/**
 * Abstracted Storage Layer
 * Currently uses localStorage. Designed to be swapped for a cloud backend later.
 * 
 * All public methods return/accept plain objects.
 * When migrating to cloud, only the internal implementation needs to change.
 */

const STORAGE_KEYS = {
  WATCHLIST: 'anitrack_watchlist',
  SETTINGS: 'anitrack_settings',
  CACHE: 'anitrack_cache'
};

// Valid watchlist categories
export const LIST_CATEGORIES = {
  WATCHING: 'watching',
  COMPLETED: 'completed',
  PLAN_TO_WATCH: 'planToWatch',
  ON_HOLD: 'onHold'
};

export const LIST_LABELS = {
  [LIST_CATEGORIES.WATCHING]: 'Watching',
  [LIST_CATEGORIES.COMPLETED]: 'Completed',
  [LIST_CATEGORIES.PLAN_TO_WATCH]: 'Plan to Watch',
  [LIST_CATEGORIES.ON_HOLD]: 'On Hold'
};

export const LIST_ICONS = {
  [LIST_CATEGORIES.WATCHING]: 'play_circle',
  [LIST_CATEGORIES.COMPLETED]: 'check_circle',
  [LIST_CATEGORIES.PLAN_TO_WATCH]: 'bookmark',
  [LIST_CATEGORIES.ON_HOLD]: 'pause_circle'
};

// ========== Internal Helpers ==========

function _read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function _write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write failed:', e);
  }
}

function _getWatchlist() {
  return _read(STORAGE_KEYS.WATCHLIST) || {
    watching: [],
    completed: [],
    planToWatch: [],
    onHold: []
  };
}

function _saveWatchlist(watchlist) {
  _write(STORAGE_KEYS.WATCHLIST, watchlist);
}

// ========== Watchlist API ==========

/**
 * Add anime to a list category
 * @param {number} animeId - AniList media ID
 * @param {object} animeData - Basic anime data to store { id, title, coverImage, genres, episodes, format, status, averageScore }
 * @param {string} category - One of LIST_CATEGORIES values
 */
export function addToList(animeId, animeData, category) {
  const watchlist = _getWatchlist();

  // Remove from any existing category first
  removeFromAllLists(animeId);

  // Re-read after removal
  const updated = _getWatchlist();

  // Add to specified category
  if (!updated[category]) updated[category] = [];
  updated[category].push({
    id: animeId,
    addedAt: Date.now(),
    title: animeData.title,
    coverImage: animeData.coverImage,
    genres: animeData.genres,
    episodes: animeData.episodes,
    format: animeData.format,
    status: animeData.status,
    averageScore: animeData.averageScore
  });

  _saveWatchlist(updated);
  _dispatchChange();
}

/**
 * Remove anime from a specific list
 */
export function removeFromList(animeId, category) {
  const watchlist = _getWatchlist();
  if (watchlist[category]) {
    watchlist[category] = watchlist[category].filter(a => a.id !== animeId);
    _saveWatchlist(watchlist);
    _dispatchChange();
  }
}

/**
 * Remove anime from all lists
 */
export function removeFromAllLists(animeId) {
  const watchlist = _getWatchlist();
  for (const cat of Object.values(LIST_CATEGORIES)) {
    if (watchlist[cat]) {
      watchlist[cat] = watchlist[cat].filter(a => a.id !== animeId);
    }
  }
  _saveWatchlist(watchlist);
  _dispatchChange();
}

/**
 * Move anime between categories
 */
export function moveToList(animeId, newCategory) {
  const watchlist = _getWatchlist();
  let animeData = null;

  // Find and remove from current category
  for (const cat of Object.values(LIST_CATEGORIES)) {
    if (watchlist[cat]) {
      const found = watchlist[cat].find(a => a.id === animeId);
      if (found) {
        animeData = found;
        watchlist[cat] = watchlist[cat].filter(a => a.id !== animeId);
        break;
      }
    }
  }

  if (animeData) {
    if (!watchlist[newCategory]) watchlist[newCategory] = [];
    animeData.addedAt = Date.now(); // Update timestamp
    watchlist[newCategory].push(animeData);
    _saveWatchlist(watchlist);
    _dispatchChange();
  }
}

/**
 * Get all anime in a specific list
 */
export function getList(category) {
  const watchlist = _getWatchlist();
  return watchlist[category] || [];
}

/**
 * Get the full watchlist (all categories)
 */
export function getAllLists() {
  return _getWatchlist();
}

/**
 * Check which list an anime is in (returns category string or null)
 */
export function getAnimeStatus(animeId) {
  const watchlist = _getWatchlist();
  for (const cat of Object.values(LIST_CATEGORIES)) {
    if (watchlist[cat]?.some(a => a.id === animeId)) {
      return cat;
    }
  }
  return null;
}

/**
 * Get all anime IDs across all lists
 */
export function getAllAnimeIds() {
  const watchlist = _getWatchlist();
  const ids = [];
  for (const cat of Object.values(LIST_CATEGORIES)) {
    if (watchlist[cat]) {
      ids.push(...watchlist[cat].map(a => a.id));
    }
  }
  return ids;
}

/**
 * Get counts for each category
 */
export function getListCounts() {
  const watchlist = _getWatchlist();
  return {
    watching: (watchlist.watching || []).length,
    completed: (watchlist.completed || []).length,
    planToWatch: (watchlist.planToWatch || []).length,
    onHold: (watchlist.onHold || []).length,
    total: Object.values(LIST_CATEGORIES).reduce((sum, cat) => sum + (watchlist[cat] || []).length, 0)
  };
}

/**
 * Get user's top genres (from all watchlist anime)
 */
export function getTopGenres(limit = 5) {
  const watchlist = _getWatchlist();
  const genreCounts = {};

  for (const cat of Object.values(LIST_CATEGORIES)) {
    if (watchlist[cat]) {
      for (const anime of watchlist[cat]) {
        if (anime.genres) {
          for (const genre of anime.genres) {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          }
        }
      }
    }
  }

  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre, count]) => ({ genre, count }));
}

/**
 * Get total episodes in watchlist (completed)
 */
export function getTotalEpisodesWatched() {
  const completed = getList(LIST_CATEGORIES.COMPLETED);
  return completed.reduce((sum, anime) => sum + (anime.episodes || 0), 0);
}

/**
 * Get recently added anime (across all lists, sorted by addedAt)
 */
export function getRecentlyAdded(limit = 10) {
  const watchlist = _getWatchlist();
  const all = [];
  for (const cat of Object.values(LIST_CATEGORIES)) {
    if (watchlist[cat]) {
      all.push(...watchlist[cat].map(a => ({ ...a, listCategory: cat })));
    }
  }
  return all.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, limit);
}

// ========== Settings API ==========

function _getSettings() {
  return _read(STORAGE_KEYS.SETTINGS) || {
    titleLanguage: 'english', // 'english' | 'romaji' | 'native'
  };
}

function _saveSettings(settings) {
  _write(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * Get title language preference
 */
export function getTitleLanguage() {
  return _getSettings().titleLanguage;
}

/**
 * Set title language preference
 */
export function setTitleLanguage(lang) {
  const settings = _getSettings();
  settings.titleLanguage = lang;
  _saveSettings(settings);
  _dispatchChange();
}

/**
 * Get the preferred title from a title object
 */
export function getPreferredTitle(titleObj) {
  if (!titleObj) return 'Unknown Title';
  const lang = getTitleLanguage();
  if (lang === 'romaji') return titleObj.romaji || titleObj.english || titleObj.native || 'Unknown';
  if (lang === 'native') return titleObj.native || titleObj.romaji || 'Unknown';
  // Default to english
  return titleObj.english || titleObj.romaji || titleObj.native || 'Unknown';
}

// ========== Change Events ==========

const listeners = new Set();

function _dispatchChange() {
  for (const fn of listeners) {
    try { fn(); } catch (e) { console.error('Storage listener error:', e); }
  }
}

/**
 * Subscribe to storage changes
 */
export function onChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback); // Returns unsubscribe function
}

/**
 * Export all data (for future migration)
 */
export function exportData() {
  return {
    watchlist: _getWatchlist(),
    settings: _getSettings(),
    exportedAt: new Date().toISOString()
  };
}

/**
 * Import data (for future migration)
 */
export function importData(data) {
  if (data.watchlist) _saveWatchlist(data.watchlist);
  if (data.settings) _saveSettings(data.settings);
  _dispatchChange();
}
