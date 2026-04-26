/**
 * Library Page
 * Watchlist with tabs: Watching, Completed, Plan to Watch, On Hold
 */
import { getList, getListCounts, removeFromAllLists, moveToList, getPreferredTitle, LIST_CATEGORIES, LIST_LABELS, LIST_ICONS, onChange } from '../data/storage.js';

let activeTab = LIST_CATEGORIES.WATCHING;
let unsubscribe = null;

export async function renderLibraryPage() {
  const app = document.getElementById('app');
  renderPage(app);

  // Re-render when watchlist changes
  unsubscribe = onChange(() => renderPage(app));

  // Listen for title language changes
  const titleHandler = () => renderPage(app);
  window.addEventListener('titleLanguageChanged', titleHandler);

  return () => {
    if (unsubscribe) unsubscribe();
    window.removeEventListener('titleLanguageChanged', titleHandler);
  };
}

function renderPage(app) {
  const counts = getListCounts();
  const currentList = getList(activeTab);

  app.innerHTML = `
    <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-8 pb-8 page-enter">
      <h1 class="font-headline-xl text-headline-xl text-on-background mb-6">My Library</h1>

      <!-- Tabs -->
      <div class="flex gap-1 bg-surface-container rounded-xl p-1 mb-8 overflow-x-auto hide-scrollbar">
        ${Object.entries(LIST_CATEGORIES).map(([key, value]) => {
          const isActive = activeTab === value;
          const count = counts[value] || 0;
          return `
            <button class="library-tab flex-1 min-w-[120px] px-4 py-3 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              isActive 
                ? 'bg-primary text-on-primary shadow-lg' 
                : 'text-on-surface-variant hover:bg-white/5'
            }" data-tab="${value}">
              <span class="material-symbols-outlined text-[18px]" ${isActive ? 'style="font-variation-settings: \'FILL\' 1;"' : ''}>${LIST_ICONS[value]}</span>
              ${LIST_LABELS[value]}
              ${count > 0 ? `<span class="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">${count}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- List Content -->
      <div id="library-content">
        ${currentList.length === 0 ? renderEmptyState() : renderAnimeGrid(currentList)}
      </div>
    </div>
  `;

  // Tab click handlers
  document.querySelectorAll('.library-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.getAttribute('data-tab');
      renderPage(app);
    });
  });

  // Card action handlers
  attachCardHandlers();
}

function renderAnimeGrid(animeList) {
  return `
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-md">
      ${animeList.map(anime => {
        const title = getPreferredTitle(anime.title);
        const cover = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.coverImage?.medium || '';
        const genres = (anime.genres || []).slice(0, 2).join(' • ');
        const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

        return `
          <div class="flex flex-col gap-2 group cursor-pointer library-card" data-anime-id="${anime.id}">
            <div class="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-low shadow-lg group-hover:ring-2 ring-primary transition-all duration-300">
              <img 
                src="${cover}" 
                alt="${title}" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              ${score ? `
                <div class="absolute top-2 right-2">
                  <span class="bg-sky-500 text-white text-[10px] font-bold px-2 py-1 rounded">★ ${score}</span>
                </div>
              ` : ''}
              <!-- Action buttons on hover -->
              <div class="absolute inset-x-0 bottom-0 p-2 flex gap-1 justify-end opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <button class="move-btn w-8 h-8 bg-surface-container-high/90 backdrop-blur-md text-on-surface rounded-lg flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors" title="Move to another list">
                  <span class="material-symbols-outlined text-[18px]">swap_horiz</span>
                </button>
                <button class="remove-btn w-8 h-8 bg-surface-container-high/90 backdrop-blur-md text-error rounded-lg flex items-center justify-center hover:bg-error hover:text-on-error transition-colors" title="Remove from list">
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              <div class="absolute inset-0 scrim-gradient opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            <div class="px-1">
              <h3 class="font-label-lg text-label-lg text-on-surface truncate">${title}</h3>
              <p class="font-caption text-caption text-outline">${genres}</p>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderEmptyState() {
  const messages = {
    [LIST_CATEGORIES.WATCHING]: { icon: 'play_circle', text: 'No anime currently watching', sub: 'Start watching something from the search page!' },
    [LIST_CATEGORIES.COMPLETED]: { icon: 'check_circle', text: 'No completed anime yet', sub: 'Finish watching some anime to see them here.' },
    [LIST_CATEGORIES.PLAN_TO_WATCH]: { icon: 'bookmark', text: 'Nothing planned to watch', sub: 'Browse and add anime you want to watch later.' },
    [LIST_CATEGORIES.ON_HOLD]: { icon: 'pause_circle', text: 'Nothing on hold', sub: 'Anime you pause will appear here.' }
  };

  const msg = messages[activeTab];
  return `
    <div class="text-center py-20">
      <span class="material-symbols-outlined text-[80px] text-on-surface-variant/30 mb-4">${msg.icon}</span>
      <h3 class="font-headline-md text-headline-md text-on-surface mb-2">${msg.text}</h3>
      <p class="text-on-surface-variant font-body-md mb-6">${msg.sub}</p>
      <a href="#/search" class="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label-lg text-label-lg active:scale-95 transition-transform">
        <span class="material-symbols-outlined text-[18px]">search</span>
        Browse Anime
      </a>
    </div>
  `;
}

function attachCardHandlers() {
  // Click card → detail page
  document.querySelectorAll('.library-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.move-btn') || e.target.closest('.remove-btn')) return;
      const id = card.getAttribute('data-anime-id');
      window.location.hash = `/anime/${id}`;
    });
  });

  // Move button → show move dropdown
  document.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.library-card');
      const animeId = parseInt(card.getAttribute('data-anime-id'));
      showMoveDropdown(animeId, btn);
    });
  });

  // Remove button
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.library-card');
      const animeId = parseInt(card.getAttribute('data-anime-id'));
      removeFromAllLists(animeId);
    });
  });
}

function showMoveDropdown(animeId, anchorEl) {
  // Remove existing dropdown
  document.getElementById('move-dropdown')?.remove();

  const rect = anchorEl.getBoundingClientRect();
  const dropdown = document.createElement('div');
  dropdown.id = 'move-dropdown';
  dropdown.className = 'fixed z-[200] bg-surface-container-high border border-white/10 rounded-xl shadow-2xl py-1 popup-enter min-w-[160px]';
  
  let left = rect.left;
  let top = rect.bottom + 4;
  if (left + 170 > window.innerWidth) left = window.innerWidth - 178;
  if (top + 200 > window.innerHeight) top = rect.top - 200;
  
  dropdown.style.left = `${left}px`;
  dropdown.style.top = `${top}px`;

  const otherCategories = Object.entries(LIST_CATEGORIES).filter(([_, v]) => v !== activeTab);
  dropdown.innerHTML = otherCategories.map(([key, value]) => `
    <button class="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-on-surface" data-category="${value}">
      <span class="material-symbols-outlined text-[18px]">${LIST_ICONS[value]}</span>
      <span class="font-label-lg text-label-lg">${LIST_LABELS[value]}</span>
    </button>
  `).join('');

  dropdown.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      moveToList(animeId, btn.getAttribute('data-category'));
      dropdown.remove();
      backdrop.remove();
    });
  });

  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-[199]';
  backdrop.addEventListener('click', () => {
    dropdown.remove();
    backdrop.remove();
  });

  document.body.appendChild(backdrop);
  document.body.appendChild(dropdown);
}
