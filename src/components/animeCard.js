/**
 * Anime Card Component
 * Poster card with hover effects and popup trigger
 */
import { getPreferredTitle, getAnimeStatus } from '../data/storage.js';
import { showPopup, hidePopup } from './animePopup.js';
import { showListModal } from './listModal.js';

/**
 * Create an anime card element
 * @param {object} anime - Anime data from AniList API
 * @param {object} options - { showRank: boolean, rank: number }
 * @returns {HTMLElement}
 */
export function createAnimeCard(anime, options = {}) {
  const card = document.createElement('div');
  card.className = 'flex flex-col gap-2 group cursor-pointer anime-card';
  card.setAttribute('data-anime-id', anime.id);

  const title = getPreferredTitle(anime.title);
  const coverUrl = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.coverImage?.medium || '';
  const genres = (anime.genres || []).slice(0, 2).join(' • ');
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const status = anime.status;
  const currentStatus = getAnimeStatus(anime.id);

  let statusBadge = '';
  if (anime.nextAiringEpisode) {
    statusBadge = `<span class="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">EP ${anime.nextAiringEpisode.episode}/${anime.episodes || '?'}</span>`;
  } else if (status === 'FINISHED' && anime.episodes) {
    statusBadge = `<span class="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">${anime.episodes} EPS</span>`;
  } else if (status === 'RELEASING') {
    statusBadge = `<span class="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded">AIRING</span>`;
  } else if (status === 'NOT_YET_RELEASED') {
    statusBadge = `<span class="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1 rounded">UPCOMING</span>`;
  }

  let scoreBadge = score ? `<span class="bg-sky-500 text-white text-[10px] font-bold px-2 py-1 rounded">★ ${score}</span>` : '';

  let listIndicator = currentStatus ? `
    <div class="absolute top-2 left-2">
      <span class="bg-primary/90 text-on-primary text-[10px] font-bold px-2 py-1 rounded">IN LIST</span>
    </div>
  ` : '';

  card.innerHTML = `
    <div class="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-low shadow-lg group-hover:ring-2 ring-primary transition-all duration-300">
      <img 
        src="${coverUrl}" 
        alt="${title}" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute top-2 right-2 flex flex-col gap-1">
        ${statusBadge}
        ${scoreBadge}
      </div>
      ${listIndicator}
      <button class="add-btn absolute bottom-4 right-4 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-10" title="Add to list">
        <span class="material-symbols-outlined">add</span>
      </button>
      <div class="absolute inset-0 scrim-gradient opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
    <div class="px-1">
      <h3 class="font-label-lg text-label-lg text-on-surface truncate anime-title">${title}</h3>
      <p class="font-caption text-caption text-outline">${genres || anime.format || ''}</p>
    </div>
  `;

  // Click card → navigate to detail (for mobile, direct; for desktop, also works)
  card.addEventListener('click', (e) => {
    if (e.target.closest('.add-btn')) return; // Don't navigate on add button click
    window.location.hash = `/anime/${anime.id}`;
  });

  // Add button → show list modal
  const addBtn = card.querySelector('.add-btn');
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showListModal(anime, addBtn);
  });

  // Hover popup (desktop only)
  let hoverTimeout;
  card.addEventListener('mouseenter', (e) => {
    if (window.innerWidth < 768) return; // Skip on mobile
    hoverTimeout = setTimeout(() => {
      showPopup(anime, card);
    }, 400);
  });

  card.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout);
    hidePopup();
  });

  return card;
}

/**
 * Update all visible anime card titles (after language toggle)
 */
export function refreshCardTitles() {
  // This will be called when titleLanguageChanged fires
  // We re-render the current page instead of trying to patch individual cards
}
