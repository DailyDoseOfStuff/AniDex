/**
 * Anime Hover Popup Component (Desktop only)
 * Shows on hover: title, genres, summary, add-to-list button
 */
import { getPreferredTitle, getAnimeStatus } from '../data/storage.js';
import { showListModal } from './listModal.js';

let currentPopup = null;
let popupTimeout = null;

/**
 * Show popup near the hovered card
 */
export function showPopup(anime, cardElement) {
  hidePopup();

  const root = document.getElementById('popup-root');
  const rect = cardElement.getBoundingClientRect();
  const title = getPreferredTitle(anime.title);
  const genres = (anime.genres || []).join(', ');
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
  const status = getAnimeStatus(anime.id);

  // Clean description (remove HTML tags and limit length)
  let description = anime.description || 'No description available.';
  description = description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
  if (description.length > 280) {
    description = description.substring(0, 280).trim() + '...';
  }

  const popup = document.createElement('div');
  popup.className = 'anime-popup popup-enter fixed bg-surface-container-high border border-white/10 rounded-xl shadow-2xl p-4 backdrop-blur-xl';
  popup.id = 'anime-hover-popup';

  // Position: to the right of the card, or left if not enough space
  let left = rect.right + 12;
  let top = rect.top;

  if (left + 380 > window.innerWidth) {
    left = rect.left - 380 - 12;
  }
  if (left < 8) left = 8;

  if (top + 300 > window.innerHeight) {
    top = window.innerHeight - 320;
  }
  if (top < 72) top = 72;

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;

  const statusLabel = status ? `
    <span class="inline-flex items-center gap-1 bg-primary/20 text-primary text-[11px] font-semibold px-2 py-0.5 rounded">
      <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
      In your list
    </span>
  ` : '';

  popup.innerHTML = `
    <div class="space-y-3">
      <div>
        <h3 class="font-headline-md text-headline-md text-white leading-tight">${title}</h3>
        ${statusLabel}
      </div>
      <div class="flex items-center gap-3 text-caption font-caption text-on-surface-variant">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px] star-gold" style="font-variation-settings: 'FILL' 1;">star</span>
          ${score}
        </span>
        <span>${anime.episodes ? anime.episodes + ' eps' : 'Ongoing'}</span>
        <span>${anime.format || ''}</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        ${(anime.genres || []).slice(0, 4).map(g => `
          <span class="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold border border-primary/20">${g}</span>
        `).join('')}
      </div>
      <p class="text-on-surface-variant text-[12px] leading-relaxed">${description}</p>
      <div class="flex gap-2 pt-1">
        <button class="popup-add-btn flex-1 bg-primary text-on-primary px-3 py-2 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-[18px]">add</span>
          ${status ? 'Change List' : 'Add to List'}
        </button>
        <button class="popup-detail-btn bg-secondary-container text-on-secondary-container px-3 py-2 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-[18px]">info</span>
          Details
        </button>
      </div>
    </div>
  `;

  // Keep popup alive when hovering over it
  popup.addEventListener('mouseenter', () => {
    clearTimeout(popupTimeout);
  });
  popup.addEventListener('mouseleave', () => {
    hidePopup();
  });

  // Add to list button
  popup.querySelector('.popup-add-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    showListModal(anime, e.currentTarget);
    hidePopup();
  });

  // Detail button
  popup.querySelector('.popup-detail-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.hash = `/anime/${anime.id}`;
    hidePopup();
  });

  root.appendChild(popup);
  currentPopup = popup;
}

/**
 * Hide the current popup
 */
export function hidePopup() {
  clearTimeout(popupTimeout);
  if (currentPopup) {
    currentPopup.classList.remove('popup-enter');
    currentPopup.classList.add('popup-exit');
    const el = currentPopup;
    setTimeout(() => el.remove(), 150);
    currentPopup = null;
  }
}
