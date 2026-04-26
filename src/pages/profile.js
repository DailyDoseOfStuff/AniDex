/**
 * Profile Page
 * User stats: total watched, episodes, favorite genres, recently added
 */
import { 
  getListCounts, getTotalEpisodesWatched, getTopGenres, 
  getRecentlyAdded, getPreferredTitle, LIST_LABELS, LIST_ICONS, LIST_CATEGORIES,
  onChange, exportData 
} from '../data/storage.js';

let unsubscribe = null;

export async function renderProfilePage() {
  const app = document.getElementById('app');
  renderPage(app);

  unsubscribe = onChange(() => renderPage(app));

  return () => {
    if (unsubscribe) unsubscribe();
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

  // Genre distribution for visual bars
  const maxGenreCount = topGenres.length > 0 ? topGenres[0].count : 1;

  app.innerHTML = `
    <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-8 pb-8 page-enter">
      
      <!-- Profile Header -->
      <div class="bg-surface-container rounded-xl border border-white/5 p-8 mb-8">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-[48px] text-primary">person</span>
          </div>
          <div class="text-center md:text-left">
            <h1 class="font-headline-xl text-headline-xl text-on-background">My Profile</h1>
            <p class="text-on-surface-variant font-body-lg mt-1">Your anime tracking overview</p>
          </div>
          <div class="md:ml-auto">
            <button id="export-btn" class="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 hover:bg-surface-variant transition-colors border border-white/5">
              <span class="material-symbols-outlined text-[18px]">download</span>
              Export Data
            </button>
          </div>
        </div>
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
}
