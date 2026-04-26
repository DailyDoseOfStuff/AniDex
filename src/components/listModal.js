/**
 * List Modal Component
 * Dropdown to add anime to watchlist categories
 */
import { addToList, removeFromAllLists, getAnimeStatus, LIST_CATEGORIES, LIST_LABELS, LIST_ICONS } from '../data/storage.js';

let currentModal = null;

/**
 * Show the list selection modal/dropdown
 */
export function showListModal(anime, anchorElement) {
  closeListModal();

  const root = document.getElementById('modal-root');
  const currentStatus = getAnimeStatus(anime.id);

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-[200] backdrop-enter';
  backdrop.id = 'list-modal-backdrop';
  backdrop.addEventListener('click', closeListModal);

  // Create dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'fixed z-[201] bg-surface-container-high border border-white/10 rounded-xl shadow-2xl py-2 popup-enter min-w-[200px]';
  dropdown.id = 'list-modal-dropdown';

  // Position near anchor
  const rect = anchorElement.getBoundingClientRect();
  let left = rect.left;
  let top = rect.bottom + 8;

  if (left + 220 > window.innerWidth) {
    left = window.innerWidth - 228;
  }
  if (top + 250 > window.innerHeight) {
    top = rect.top - 250;
  }
  if (left < 8) left = 8;
  if (top < 8) top = 8;

  dropdown.style.left = `${left}px`;
  dropdown.style.top = `${top}px`;

  // Header
  dropdown.innerHTML = `
    <div class="px-4 py-2 border-b border-white/5">
      <p class="font-label-lg text-label-lg text-on-surface truncate max-w-[180px]">${anime.title?.english || anime.title?.romaji || 'Unknown'}</p>
      <p class="font-caption text-caption text-on-surface-variant">${currentStatus ? 'Currently: ' + LIST_LABELS[currentStatus] : 'Not in your list'}</p>
    </div>
    <div class="py-1" id="list-options">
      ${Object.entries(LIST_CATEGORIES).map(([key, value]) => `
        <button class="list-option w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-white/5 transition-colors ${currentStatus === value ? 'text-primary' : 'text-on-surface'}" data-category="${value}">
          <span class="material-symbols-outlined text-[20px]" ${currentStatus === value ? 'style="font-variation-settings: \'FILL\' 1;"' : ''}>${LIST_ICONS[value]}</span>
          <span class="font-label-lg text-label-lg">${LIST_LABELS[value]}</span>
          ${currentStatus === value ? '<span class="material-symbols-outlined text-[16px] ml-auto">check</span>' : ''}
        </button>
      `).join('')}
    </div>
    ${currentStatus ? `
      <div class="border-t border-white/5 py-1">
        <button class="remove-btn w-full px-4 py-2.5 text-left flex items-center gap-3 text-error hover:bg-error/5 transition-colors">
          <span class="material-symbols-outlined text-[20px]">delete</span>
          <span class="font-label-lg text-label-lg">Remove from List</span>
        </button>
      </div>
    ` : ''}
  `;

  // Category click handlers
  dropdown.querySelectorAll('.list-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = btn.getAttribute('data-category');
      addToList(anime.id, anime, category);
      showToast(`Added to ${LIST_LABELS[category]}`);
      closeListModal();
    });
  });

  // Remove handler
  const removeBtn = dropdown.querySelector('.remove-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeFromAllLists(anime.id);
      showToast('Removed from list');
      closeListModal();
    });
  }

  root.appendChild(backdrop);
  root.appendChild(dropdown);
  currentModal = { backdrop, dropdown };
}

/**
 * Close the list modal
 */
export function closeListModal() {
  if (currentModal) {
    currentModal.backdrop.remove();
    currentModal.dropdown.remove();
    currentModal = null;
  }
}

/**
 * Show a brief toast notification
 */
function showToast(message) {
  const existing = document.getElementById('toast-msg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-msg';
  toast.className = 'fixed bottom-28 md:bottom-8 left-1/2 -translate-x-1/2 bg-surface-container-high text-on-surface border border-white/10 px-6 py-3 rounded-xl shadow-2xl font-label-lg text-label-lg z-[300] popup-enter flex items-center gap-2';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
    ${message}
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('popup-exit');
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}
