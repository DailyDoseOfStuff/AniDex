/**
 * Profile Page
 * User stats: total watched, episodes, favorite genres, recently added
 * Shows user info when logged in, sign-in prompt when not
 */
import { 
  getListCounts, getTotalEpisodesWatched, getTopGenres, 
  getRecentlyAdded, getPreferredTitle, LIST_LABELS, LIST_ICONS, LIST_CATEGORIES,
  onChange, exportData, importData, addToList, clearWatchlist
} from '../data/storage.js';
import { fetchAnimeByMalIds, fetchAnimeByALIds } from '../api.js';
import { getCurrentUser, getUserInfo, signOut, isLoggedIn, isAnonymous } from '../auth.js';
import { showAuthModal } from '../components/authModal.js';

let unsubscribe = null;

export async function renderProfilePage() {
  const app = document.getElementById('app');
  renderPage(app);

  unsubscribe = onChange(() => renderPage(app));

  // Re-render on auth change
  const authHandler = () => renderPage(app);
  window.addEventListener('authStateChanged', authHandler);

  return () => {
    if (unsubscribe) unsubscribe();
    window.removeEventListener('authStateChanged', authHandler);
  };
}

function renderPage(app) {
  const counts = getListCounts();
  const episodes = getTotalEpisodesWatched();
  const topGenres = getTopGenres(8);
  const recent = getRecentlyAdded(8);
  const totalMinutes = episodes * 24; // Rough estimate: 24 min/episode
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const user = getCurrentUser();
  const userInfo = getUserInfo();

  // Genre distribution for visual bars
  const maxGenreCount = topGenres.length > 0 ? topGenres[0].count : 1;

  app.innerHTML = `
    <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-8 pb-8 page-enter">
      
      <!-- Profile Header -->
      <div class="bg-surface-container rounded-xl border border-white/5 p-8 mb-8">
        <div class="flex flex-col md:flex-row items-center gap-6">
          ${user && userInfo.photoURL ? `
            <img src="${userInfo.photoURL}" alt="${userInfo.displayName}" class="w-24 h-24 rounded-full border-2 border-primary object-cover" referrerpolicy="no-referrer" />
          ` : `
            <div class="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-[48px] text-primary">${userInfo?.isAnonymous ? 'person_off' : 'person'}</span>
            </div>
          `}
          <div class="text-center md:text-left">
            <h1 class="font-headline-xl text-headline-xl text-on-background">${userInfo ? userInfo.displayName : 'My Profile'}</h1>
            <p class="text-on-surface-variant font-body-lg mt-1">
              ${user
                ? (userInfo.isAnonymous 
                    ? 'Guest account — create an account to save your data permanently'
                    : (userInfo.email || 'Your anime tracking overview'))
                : 'Sign in to sync your anime list across devices'}
            </p>
            ${!user ? `
              <button id="profile-signin-btn" class="mt-4 inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-lg text-label-lg hover:bg-primary/90 transition-colors active:scale-95 duration-200">
                <span class="material-symbols-outlined text-[18px]">login</span>
                Sign In
              </button>
            ` : ''}
            ${userInfo?.isAnonymous ? `
              <button id="profile-upgrade-btn" class="mt-4 inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-lg text-label-lg hover:bg-primary/90 transition-colors active:scale-95 duration-200">
                <span class="material-symbols-outlined text-[18px]">upgrade</span>
                Create Account
              </button>
            ` : ''}
          </div>
          <div class="md:ml-auto flex gap-2 flex-wrap justify-center md:justify-end items-center">
            <select id="import-mode" class="bg-surface-container-high text-on-surface-variant px-3 py-2 rounded-lg border border-white/5 outline-none font-label-md appearance-none cursor-pointer">
              <option value="merge">Merge (Add to existing)</option>
              <option value="replace">Replace (Overwrite existing)</option>
            </select>
            <button id="import-btn" class="relative bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 hover:bg-surface-variant transition-colors border border-white/5 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">upload</span>
              Import Data
              <input type="file" id="import-file" accept=".json,.xml" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
            </button>
            <button id="export-btn" class="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 hover:bg-surface-variant transition-colors border border-white/5">
              <span class="material-symbols-outlined text-[18px]">download</span>
              Export Data
            </button>
            ${user && !userInfo.isAnonymous ? `
              <button id="signout-btn" class="bg-surface-container-high text-error px-4 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 hover:bg-error/10 transition-colors border border-white/5">
                <span class="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            ` : ''}
          </div>
        </div>

        ${user ? `
          <!-- Account Info Badge -->
          <div class="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-3">
            <div class="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg">
              <span class="material-symbols-outlined text-[16px] text-primary">cloud_done</span>
              <span class="font-caption text-caption text-on-surface-variant">Synced to cloud</span>
            </div>
            ${userInfo.providerId === 'google.com' ? `
              <div class="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg">
                <svg width="14" height="14" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                <span class="font-caption text-caption text-on-surface-variant">Google account</span>
              </div>
            ` : ''}
            ${userInfo.providerId === 'password' ? `
              <div class="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg">
                <span class="material-symbols-outlined text-[14px] text-on-surface-variant">mail</span>
                <span class="font-caption text-caption text-on-surface-variant">Email account</span>
              </div>
            ` : ''}
            ${userInfo.isAnonymous ? `
              <div class="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-lg">
                <span class="material-symbols-outlined text-[14px] text-amber-400">warning</span>
                <span class="font-caption text-caption text-amber-400">Guest — data may be lost</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-surface-container p-6 rounded-xl border border-white/5 text-center">
          <span class="text-headline-lg text-primary font-headline-lg">${counts.total}</span>
          <p class="text-on-surface-variant font-label-md mt-2">Total Anime</p>
        </div>
        <div class="bg-surface-container p-6 rounded-xl border border-white/5 text-center">
          <span class="text-headline-lg text-on-surface font-headline-lg">${episodes}</span>
          <p class="text-on-surface-variant font-label-md mt-2">Episodes Watched</p>
        </div>
        <div class="bg-surface-container p-6 rounded-xl border border-white/5 text-center">
          <span class="text-headline-lg text-on-surface font-headline-lg">${hours}h ${mins}m</span>
          <p class="text-on-surface-variant font-label-md mt-2">Est. Watch Time</p>
        </div>
        <div class="bg-surface-container p-6 rounded-xl border border-white/5 text-center">
          <span class="text-headline-lg text-on-surface font-headline-lg">${counts.completed}</span>
          <p class="text-on-surface-variant font-label-md mt-2">Completed</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- Watchlist Breakdown -->
        <div class="bg-surface-container rounded-xl border border-white/5 p-6">
          <h2 class="font-headline-md text-headline-md text-on-background mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">pie_chart</span>
            Watchlist Breakdown
          </h2>
          <div class="space-y-4">
            ${Object.entries(LIST_CATEGORIES).map(([key, value]) => {
              const count = counts[value] || 0;
              const pct = counts.total > 0 ? Math.round((count / counts.total) * 100) : 0;
              return `
                <div class="flex items-center gap-4">
                  <span class="material-symbols-outlined text-[20px] text-primary" style="font-variation-settings: 'FILL' 1;">${LIST_ICONS[value]}</span>
                  <div class="flex-1">
                    <div class="flex justify-between mb-1">
                      <span class="font-label-lg text-label-lg text-on-surface">${LIST_LABELS[value]}</span>
                      <span class="font-label-md text-label-md text-on-surface-variant">${count} (${pct}%)</span>
                    </div>
                    <div class="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-primary rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Favorite Genres -->
        <div class="bg-surface-container rounded-xl border border-white/5 p-6">
          <h2 class="font-headline-md text-headline-md text-on-background mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">auto_awesome</span>
            Favorite Genres
          </h2>
          ${topGenres.length > 0 ? `
            <div class="space-y-3">
              ${topGenres.map((g, i) => {
                const pct = Math.round((g.count / maxGenreCount) * 100);
                return `
                  <div class="flex items-center gap-3">
                    <span class="font-label-md text-label-md text-on-surface-variant w-4 text-right">${i + 1}</span>
                    <div class="flex-1">
                      <div class="flex justify-between mb-1">
                        <span class="font-label-lg text-label-lg text-on-surface">${g.genre}</span>
                        <span class="font-label-md text-label-md text-on-surface-variant">${g.count} anime</span>
                      </div>
                      <div class="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" style="width: ${pct}%; background: linear-gradient(90deg, #3db4f2, #84cfff);"></div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="text-center py-8">
              <span class="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-2">category</span>
              <p class="text-on-surface-variant font-body-md">Add anime to your list to see genre stats</p>
            </div>
          `}
        </div>
      </div>

      <!-- Recently Added -->
      <div class="mt-8 bg-surface-container rounded-xl border border-white/5 p-6">
        <h2 class="font-headline-md text-headline-md text-on-background mb-6 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">history</span>
          Recently Added
        </h2>
        ${recent.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${recent.map(anime => {
              const title = getPreferredTitle(anime.title);
              const cover = anime.coverImage?.medium || anime.coverImage?.large || '';
              const listLabel = LIST_LABELS[anime.listCategory] || '';
              const addedDate = anime.addedAt ? new Date(anime.addedAt).toLocaleDateString() : '';
              return `
                <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer recent-card" data-anime-id="${anime.id}">
                  <img src="${cover}" alt="${title}" class="w-12 h-16 rounded object-cover flex-shrink-0" loading="lazy" />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-label-lg text-label-lg text-on-surface truncate">${title}</h4>
                    <p class="font-caption text-caption text-on-surface-variant">${listLabel} • ${addedDate}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="text-center py-8">
            <span class="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-2">playlist_add</span>
            <p class="text-on-surface-variant font-body-md">No anime added yet. Start browsing!</p>
          </div>
        `}
      </div>
    </div>
  `;

  // Recent card click → detail
  document.querySelectorAll('.recent-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = `/anime/${card.getAttribute('data-anime-id')}`;
    });
  });

  // Import button logic
  const importFile = document.getElementById('import-file');
  if (importFile) {
    importFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const importMode = document.getElementById('import-mode')?.value || 'merge';

      // Show temporary loading indicator
      const btn = document.getElementById('import-btn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">sync</span> Importing...';
      btn.style.pointerEvents = 'none';

      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target.result;
        
        let alItems = []; // { id, category }
        let malItems = []; // { malId, category }

        try {
          if (importMode === 'replace') {
            await clearWatchlist();
          }

          if (file.name.endsWith('.json')) {
            const data = JSON.parse(text);
            if (data.watchlist) {
              // Native AniTrack JSON
              await importData(data);
              alert('Import successful!');
              return;
            } else {
              // 3rd party JSON format
              for (const [key, list] of Object.entries(data)) {
                let category = LIST_CATEGORIES.PLAN_TO_WATCH;
                if (key.toLowerCase() === 'watching') category = LIST_CATEGORIES.WATCHING;
                else if (key.toLowerCase() === 'completed') category = LIST_CATEGORIES.COMPLETED;
                else if (key.toLowerCase() === 'on-hold' || key.toLowerCase() === 'onhold') category = LIST_CATEGORIES.ON_HOLD;
                
                for (const item of list) {
                  if (item.al) {
                    const match = item.al.match(/anilist\.co\/anime\/(\d+)/);
                    if (match) alItems.push({ id: parseInt(match[1]), category });
                  } else if (item.mal) {
                    const match = item.mal.match(/myanimelist\.net\/anime\/(\d+)/);
                    if (match) malItems.push({ malId: parseInt(match[1]), category });
                  }
                }
              }
            }
          } else if (file.name.endsWith('.xml')) {
            // MAL XML format
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const animes = xmlDoc.getElementsByTagName('anime');
            
            for (let i = 0; i < animes.length; i++) {
              const node = animes[i];
              const malId = parseInt(node.getElementsByTagName('series_animedb_id')[0]?.textContent);
              const statusStr = node.getElementsByTagName('my_status')[0]?.textContent || '';
              
              let category = LIST_CATEGORIES.PLAN_TO_WATCH;
              if (statusStr === 'Watching') category = LIST_CATEGORIES.WATCHING;
              else if (statusStr === 'Completed') category = LIST_CATEGORIES.COMPLETED;
              else if (statusStr === 'On-Hold' || statusStr === 'Dropped') category = LIST_CATEGORIES.ON_HOLD;
              
              if (!isNaN(malId)) {
                malItems.push({ malId, category });
              }
            }
          } else if (file.name.endsWith('.txt')) {
            // Plain text format with URLs
            const lines = text.split('\n');
            let currentCategory = LIST_CATEGORIES.PLAN_TO_WATCH;
            
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('###')) {
                const catStr = trimmed.replace('###', '').trim().toLowerCase();
                if (catStr === 'watching') currentCategory = LIST_CATEGORIES.WATCHING;
                else if (catStr === 'completed') currentCategory = LIST_CATEGORIES.COMPLETED;
                else if (catStr === 'on-hold' || catStr === 'on hold') currentCategory = LIST_CATEGORIES.ON_HOLD;
                else if (catStr === 'planning' || catStr === 'plan to watch') currentCategory = LIST_CATEGORIES.PLAN_TO_WATCH;
                continue;
              }
              
              const alMatch = trimmed.match(/anilist\.co\/anime\/(\d+)/);
              if (alMatch) {
                alItems.push({ id: parseInt(alMatch[1]), category: currentCategory });
                continue;
              }
              
              const malMatch = trimmed.match(/myanimelist\.net\/anime\/(\d+)/);
              if (malMatch) {
                malItems.push({ malId: parseInt(malMatch[1]), category: currentCategory });
              }
            }
          }

          // Fetch missing AniList data
          let importedCount = 0;
          
          if (malItems.length > 0) {
            const fetchedMal = await fetchAnimeByMalIds(malItems.map(d => d.malId));
            for (const item of malItems) {
              const anime = fetchedMal.find(a => a.idMal === item.malId);
              if (anime) {
                await addToList(anime.id, anime, item.category);
                importedCount++;
              }
            }
          }
          
          if (alItems.length > 0) {
            const fetchedAl = await fetchAnimeByALIds(alItems.map(d => d.id));
            for (const item of alItems) {
              const anime = fetchedAl.find(a => a.id === item.id);
              if (anime) {
                await addToList(anime.id, anime, item.category);
                importedCount++;
              }
            }
          }

          if (importedCount === 0 && (malItems.length > 0 || alItems.length > 0)) {
            alert('Found items but failed to fetch data from AniList.');
          } else if (importedCount > 0) {
            alert(`Successfully imported ${importedCount} anime!`);
          } else {
            alert('No valid anime found in the file.');
          }

        } catch (err) {
          console.error(err);
          alert('Failed to parse or import file.');
        } finally {
          btn.innerHTML = originalText;
          btn.style.pointerEvents = 'auto';
          importFile.value = ''; // Reset file input
        }
      };
      reader.readAsText(file);
    });
  }

  // Export button
  document.getElementById('export-btn')?.addEventListener('click', () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anitrack_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Sign out button
  document.getElementById('signout-btn')?.addEventListener('click', async () => {
    await signOut();
  });

  // Sign in button
  document.getElementById('profile-signin-btn')?.addEventListener('click', () => {
    showAuthModal();
  });

  // Upgrade from guest
  document.getElementById('profile-upgrade-btn')?.addEventListener('click', () => {
    showAuthModal();
  });
}
