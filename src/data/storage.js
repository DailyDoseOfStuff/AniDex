/**
 * Abstracted Storage Layer
 * Uses Firestore when logged in, falls back to localStorage for guests.
 * 
 * All public methods return/accept plain objects.
 * Firestore path: users/{uid}/data/watchlist and users/{uid}/data/settings
 */
import { db } from '../firebase.js';
import { getCurrentUser, isLoggedIn, isAnonymous } from '../auth.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

// ========== In-memory cache for Firestore data ==========
// Prevents re-reading Firestore on every single getter call
let _firestoreWatchlistCache = null;
let _firestoreSettingsCache = null;
let _firestoreCacheDirty = true; // true = need to re-fetch from Firestore

/**
 * Mark the Firestore cache as needing refresh (e.g. after auth change)
 */
export function invalidateFirestoreCache() {
  _firestoreWatchlistCache = null;
  _firestoreSettingsCache = null;
  _firestoreCacheDirty = true;
}

// ========== Internal Helpers: localStorage ==========

function _readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function _writeLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write failed:', e);
  }
}

// ========== Internal Helpers: Firestore ==========

function _getUserDocRef(collection) {
  const user = getCurrentUser();
  if (!user) return null;
  return doc(db, 'users', user.uid, 'data', collection);
}

async function _readFirestore(collection) {
  const docRef = _getUserDocRef(collection);
  if (!docRef) return null;
  try {
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error(`AniTrack: Firestore read error (${collection}):`, e);
    throw e; // Rethrow to allow caller to handle failure
  }
}

async function _writeFirestore(collection, data) {
  const docRef = _getUserDocRef(collection);
  if (!docRef) return;
  try {
    await setDoc(docRef, data);
  } catch (e) {
    console.error(`Firestore write error (${collection}):`, e);
  }
}

// ========== Unified Read/Write ==========

function _useFirestore() {
  const user = getCurrentUser();
  return user !== null; // Use Firestore for any authenticated user (including anonymous)
}

function _getWatchlistSync() {
  // Synchronous — uses cache for Firestore, direct read for localStorage
  if (_useFirestore()) {
    return _firestoreWatchlistCache; // Could be null if not loaded yet
  }
  return _readLocal(STORAGE_KEYS.WATCHLIST) || _defaultWatchlist();
}

function _defaultWatchlist() {
  return { watching: [], completed: [], planToWatch: [], onHold: [] };
}

async function _getWatchlistAsync() {
  if (_useFirestore()) {
    if (_firestoreWatchlistCache && !_firestoreCacheDirty) {
      return _firestoreWatchlistCache;
    }
    const data = await _readFirestore('watchlist');
    _firestoreWatchlistCache = data || _defaultWatchlist();
    _firestoreCacheDirty = false;
    return _firestoreWatchlistCache;
  }
  return _readLocal(STORAGE_KEYS.WATCHLIST) || _defaultWatchlist();
}

async function _saveWatchlist(watchlist) {
  if (_useFirestore()) {
    _firestoreWatchlistCache = watchlist;
    await _writeFirestore('watchlist', watchlist);
  } else {
    _writeLocal(STORAGE_KEYS.WATCHLIST, watchlist);
  }
}

function _getSettingsSync() {
  if (_useFirestore() && _firestoreSettingsCache !== null) {
    return _firestoreSettingsCache;
  }
  return _readLocal(STORAGE_KEYS.SETTINGS) || { titleLanguage: 'english' };
}

async function _getSettingsAsync() {
  if (_useFirestore()) {
    if (_firestoreSettingsCache && !_firestoreCacheDirty) {
      return _firestoreSettingsCache;
    }
    const data = await _readFirestore('settings');
    _firestoreSettingsCache = data || { titleLanguage: 'english' };
    return _firestoreSettingsCache;
  }
  return _readLocal(STORAGE_KEYS.SETTINGS) || { titleLanguage: 'english' };
}

async function _saveSettings(settings) {
  if (_useFirestore()) {
    _firestoreSettingsCache = settings;
    await _writeFirestore('settings', settings);
  } else {
    _writeLocal(STORAGE_KEYS.SETTINGS, settings);
  }
}

// ========== Migration: localStorage → Firestore ==========

/**
 * Migrate existing localStorage data to Firestore for the current user.
 * Called on first login. Merges local data into cloud (won't overwrite existing cloud data).
 */
export async function migrateLocalToCloud() {
  if (!_useFirestore()) return false;

  const localWatchlist = _readLocal(STORAGE_KEYS.WATCHLIST);
  const localSettings = _readLocal(STORAGE_KEYS.SETTINGS);

  if (!localWatchlist && !localSettings) return false; // Nothing to migrate

  // Check if cloud already has data
  const cloudWatchlist = await _readFirestore('watchlist');

  if (cloudWatchlist && Object.values(LIST_CATEGORIES).some(cat => (cloudWatchlist[cat] || []).length > 0)) {
    // Cloud already has data — merge local into it (avoid duplicates)
    if (localWatchlist) {
      for (const cat of Object.values(LIST_CATEGORIES)) {
        const cloudList = cloudWatchlist[cat] || [];
        const localList = localWatchlist[cat] || [];
        const cloudIds = new Set(cloudList.map(a => a.id));
        for (const anime of localList) {
          if (!cloudIds.has(anime.id)) {
            cloudList.push(anime);
          }
        }
        cloudWatchlist[cat] = cloudList;
      }
      await _writeFirestore('watchlist', cloudWatchlist);
      _firestoreWatchlistCache = cloudWatchlist;
    }
  } else {
    // Cloud is empty — push local data up
    if (localWatchlist) {
      await _writeFirestore('watchlist', localWatchlist);
      _firestoreWatchlistCache = localWatchlist;
    }
  }

  // Migrate settings (cloud wins if exists)
  const cloudSettings = await _readFirestore('settings');
  if (!cloudSettings && localSettings) {
    await _writeFirestore('settings', localSettings);
    _firestoreSettingsCache = localSettings;
  }

  // Clear local data after migration
  localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);

  _firestoreCacheDirty = false;
  return true;
}

let _loadingCloudData = false;

/**
 * Load Firestore data into cache (call after auth state change)
 */
export async function loadCloudData() {
  if (!_useFirestore() || _loadingCloudData) return;
  
  _loadingCloudData = true;
  try {
    console.log('AniTrack: Loading cloud data...');
    const watchlist = await _readFirestore('watchlist');
    const settings = await _readFirestore('settings');
    
    // Only update cache if we actually got data (or null meaning doc doesn't exist)
    _firestoreWatchlistCache = watchlist || _defaultWatchlist();
    _firestoreSettingsCache = settings || { titleLanguage: 'english' };
    _firestoreCacheDirty = false;
    
    console.log('AniTrack: Cloud data loaded successfully');
    _dispatchChange();
  } catch (e) {
    console.error('AniTrack: Failed to load cloud data:', e);
    // If it fails, we keep the previous cache to avoid showing an empty list
  } finally {
    _loadingCloudData = false;
  }
}

/**
 * Check if data is currently loaded (or if we are in local mode)
 */
export function isDataLoaded() {
  if (!_useFirestore()) return true;
  return _firestoreWatchlistCache !== null;
}

// ========== Watchlist API ==========

/**
 * Add anime to a list category
 * @param {number} animeId - AniList media ID
 * @param {object} animeData - Basic anime data to store
 * @param {string} category - One of LIST_CATEGORIES values
 */
export async function addToList(animeId, animeData, category) {
  // Remove from any existing category first
  await removeFromAllLists(animeId);

  // Re-read after removal
  const updated = await _getWatchlistAsync();

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

  await _saveWatchlist(updated);
  _dispatchChange();
}

/**
 * Add multiple anime to list categories in a single batch operation.
 * @param {Array<{id: number, data: object, category: string}>} items 
 */
export async function addManyToLists(items) {
  const updated = await _getWatchlistAsync();

  for (const item of items) {
    const { id: animeId, data: animeData, category } = item;

    // Remove from existing
    for (const cat of Object.values(LIST_CATEGORIES)) {
      if (updated[cat]) {
        updated[cat] = updated[cat].filter(a => a.id !== animeId);
      }
    }

    // Add to new
    if (!updated[category]) updated[category] = [];
    updated[category].push({
      id: animeId,
      addedAt: Date.now(), // might be slightly inaccurate for batch, but fine
      title: animeData.title,
      coverImage: animeData.coverImage,
      genres: animeData.genres,
      episodes: animeData.episodes,
      format: animeData.format,
      status: animeData.status,
      averageScore: animeData.averageScore
    });
  }

  await _saveWatchlist(updated);
  _dispatchChange();
}

/**
 * Remove anime from a specific list
 */
export async function removeFromList(animeId, category) {
  const watchlist = await _getWatchlistAsync();
  if (watchlist[category]) {
    watchlist[category] = watchlist[category].filter(a => a.id !== animeId);
    await _saveWatchlist(watchlist);
    _dispatchChange();
  }
}

/**
 * Remove anime from all lists
 */
export async function removeFromAllLists(animeId) {
  const watchlist = await _getWatchlistAsync();
  for (const cat of Object.values(LIST_CATEGORIES)) {
    if (watchlist[cat]) {
      watchlist[cat] = watchlist[cat].filter(a => a.id !== animeId);
    }
  }
  await _saveWatchlist(watchlist);
  _dispatchChange();
}

/**
 * Clear all anime from the watchlist completely
 */
export async function clearWatchlist() {
  await _saveWatchlist(_defaultWatchlist());
  _dispatchChange();
}

/**
 * Move anime between categories
 */
export async function moveToList(animeId, newCategory) {
  const watchlist = await _getWatchlistAsync();
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
    await _saveWatchlist(watchlist);
    _dispatchChange();
  }
}

/**
 * Get all anime in a specific list (sync - uses cache)
 */
export function getList(category) {
  const watchlist = _getWatchlistSync();
  if (!watchlist) return [];
  return watchlist[category] || [];
}

/**
 * Get the full watchlist (all categories) (sync - uses cache)
 */
export function getAllLists() {
  return _getWatchlistSync();
}

/**
 * Check which list an anime is in (returns category string or null)
 */
export function getAnimeStatus(animeId) {
  const watchlist = _getWatchlistSync();
  if (!watchlist) return null;
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
  const watchlist = _getWatchlistSync();
  if (!watchlist) return [];
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
  const watchlist = _getWatchlistSync();
  if (!watchlist) return { watching: 0, completed: 0, planToWatch: 0, onHold: 0, total: 0 };
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
  const watchlist = _getWatchlistSync();
  if (!watchlist) return [];
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
  const watchlist = _getWatchlistSync();
  if (!watchlist) return [];
  const all = [];
  for (const cat of Object.values(LIST_CATEGORIES)) {
    if (watchlist[cat]) {
      all.push(...watchlist[cat].map(a => ({ ...a, listCategory: cat })));
    }
  }
  return all.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, limit);
}

// ========== Settings API ==========

/**
 * Get title language preference (sync)
 */
export function getTitleLanguage() {
  return _getSettingsSync().titleLanguage;
}

/**
 * Set title language preference
 */
export async function setTitleLanguage(lang) {
  const settings = _useFirestore()
    ? (await _getSettingsAsync())
    : _getSettingsSync();
  settings.titleLanguage = lang;
  await _saveSettings(settings);
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
    watchlist: _getWatchlistSync(),
    settings: _getSettingsSync(),
    exportedAt: new Date().toISOString()
  };
}

/**
 * Import data (for future migration)
 */
export async function importData(data) {
  if (data.watchlist) await _saveWatchlist(data.watchlist);
  if (data.settings) await _saveSettings(data.settings);
  _dispatchChange();
}
