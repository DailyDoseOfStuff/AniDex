/**
 * Header Component
 * Sticky top bar with logo, nav links, title toggle, and avatar
 */
import { getTitleLanguage, setTitleLanguage } from '../data/storage.js';
import { getCurrentPath } from '../router.js';

export function renderHeader() {
  const root = document.getElementById('header-root');
  const lang = getTitleLanguage();
  const langLabel = lang === 'english' ? 'EN' : lang === 'romaji' ? 'JP' : '日本';

  root.innerHTML = `
    <header class="bg-slate-950/80 backdrop-blur-lg flex justify-between items-center h-16 px-4 w-full z-50 top-0 sticky border-b border-white/10" id="main-header">
      <div class="flex items-center gap-3">
        <a href="#/home" class="flex items-center gap-2">
          <span class="text-xl font-black text-sky-400 tracking-tighter font-['Be_Vietnam_Pro']">AniTrack</span>
        </a>
      </div>
      <nav class="hidden md:flex gap-1" id="desktop-nav">
        <a href="#/home" class="nav-link px-3 py-1.5 rounded-lg font-['Be_Vietnam_Pro'] tracking-tight transition-colors" data-route="/home">Home</a>
        <a href="#/search" class="nav-link px-3 py-1.5 rounded-lg font-['Be_Vietnam_Pro'] tracking-tight transition-colors" data-route="/search">Search</a>
        <a href="#/schedule" class="nav-link px-3 py-1.5 rounded-lg font-['Be_Vietnam_Pro'] tracking-tight transition-colors" data-route="/schedule">Schedule</a>
        <a href="#/library" class="nav-link px-3 py-1.5 rounded-lg font-['Be_Vietnam_Pro'] tracking-tight transition-colors" data-route="/library">Library</a>
        <a href="#/profile" class="nav-link px-3 py-1.5 rounded-lg font-['Be_Vietnam_Pro'] tracking-tight transition-colors" data-route="/profile">Profile</a>
      </nav>
      <div class="flex items-center gap-2">
        <button id="title-toggle-btn" class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container border border-white/10 hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary" title="Toggle title language">
          <span class="material-symbols-outlined text-[18px]">translate</span>
          <span class="font-label-md text-label-md" id="title-lang-label">${langLabel}</span>
        </button>
        <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors active:scale-95 duration-200">
          <span class="material-symbols-outlined text-sky-400">notifications</span>
        </button>
      </div>
    </header>
  `;

  // Title toggle handler
  document.getElementById('title-toggle-btn').addEventListener('click', () => {
    const current = getTitleLanguage();
    let next;
    if (current === 'english') next = 'romaji';
    else if (current === 'romaji') next = 'english';
    else next = 'english';

    setTitleLanguage(next);
    const label = next === 'english' ? 'EN' : next === 'romaji' ? 'JP' : '日本';
    document.getElementById('title-lang-label').textContent = label;

    // Re-render current page
    window.dispatchEvent(new CustomEvent('titleLanguageChanged'));
  });

  // Update active nav link
  updateActiveNavLink();
  window.addEventListener('routechange', updateActiveNavLink);
}

function updateActiveNavLink() {
  const path = getCurrentPath();
  const links = document.querySelectorAll('#desktop-nav .nav-link');
  links.forEach(link => {
    const route = link.getAttribute('data-route');
    if (path.startsWith(route)) {
      link.className = 'nav-link text-sky-400 font-bold px-3 py-1.5 rounded-lg font-[\'Be_Vietnam_Pro\'] tracking-tight hover:bg-white/5 transition-colors';
    } else {
      link.className = 'nav-link text-slate-400 px-3 py-1.5 rounded-lg font-[\'Be_Vietnam_Pro\'] tracking-tight hover:bg-white/5 transition-colors';
    }
  });

  // Also update mobile nav
  const mobileLinks = document.querySelectorAll('#mobile-nav .mobile-nav-btn');
  mobileLinks.forEach(btn => {
    const route = btn.getAttribute('data-route');
    const icon = btn.querySelector('.material-symbols-outlined');
    const label = btn.querySelector('.nav-label');
    if (path.startsWith(route)) {
      btn.className = 'mobile-nav-btn flex flex-col items-center justify-center text-sky-400 bg-sky-400/10 rounded-lg py-1 px-3 active:scale-90 transition-transform duration-150';
      if (icon) icon.style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
    } else {
      btn.className = 'mobile-nav-btn flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-transform duration-150';
      if (icon) icon.style.fontVariationSettings = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
    }
  });
}
