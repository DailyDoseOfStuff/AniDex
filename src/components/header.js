/**
 * Header Component
 * Sticky top bar with logo, nav links, title toggle, and auth button
 */
import { getTitleLanguage, setTitleLanguage } from '../data/storage.js';
import { getCurrentPath } from '../router.js';
import { getCurrentUser, isLoggedIn, isAnonymous, signOut, getUserInfo } from '../auth.js';
import { showAuthModal } from './authModal.js';

export function renderHeader() {
  const root = document.getElementById('header-root');

  function render() {
    const lang = getTitleLanguage();
    const langLabel = lang === 'english' ? 'EN' : lang === 'romaji' ? 'JP' : '日本';
    const user = getCurrentUser();
    const userInfo = getUserInfo();

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
          ${user ? `
            <!-- Logged-in user avatar/button -->
            <div class="relative" id="user-menu-container">
              <button id="user-avatar-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:ring-2 ring-primary/50 transition-all duration-200 overflow-hidden ${userInfo.photoURL ? '' : 'bg-primary/20 border border-primary/30'}">
                ${userInfo.photoURL
                  ? `<img src="${userInfo.photoURL}" alt="${userInfo.displayName}" class="w-full h-full object-cover rounded-full" referrerpolicy="no-referrer" />`
                  : `<span class="material-symbols-outlined text-primary text-[22px]">${userInfo.isAnonymous ? 'person_off' : 'person'}</span>`
                }
              </button>
            </div>
          ` : `
            <!-- Sign-in button -->
            <button id="sign-in-btn" class="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary/90 transition-colors active:scale-95 duration-200">
              <span class="material-symbols-outlined text-[18px]">login</span>
              Sign In
            </button>
          `}
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

    // Auth handlers
    const signInBtn = document.getElementById('sign-in-btn');
    if (signInBtn) {
      signInBtn.addEventListener('click', () => showAuthModal());
    }

    const avatarBtn = document.getElementById('user-avatar-btn');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', () => {
        showUserDropdown(avatarBtn);
      });
    }

    // Update active nav link
    updateActiveNavLink();
  }

  // Initial render
  render();

  // Re-render on auth state change
  window.addEventListener('authStateChanged', () => render());
  window.addEventListener('routechange', updateActiveNavLink);
}

function showUserDropdown(anchorEl) {
  // Remove existing
  document.getElementById('user-dropdown')?.remove();
  document.getElementById('user-dropdown-backdrop')?.remove();

  const userInfo = getUserInfo();
  const rect = anchorEl.getBoundingClientRect();

  const dropdown = document.createElement('div');
  dropdown.id = 'user-dropdown';
  dropdown.className = 'fixed z-[200] bg-surface-container-high border border-white/10 rounded-xl shadow-2xl py-2 popup-enter min-w-[220px]';

  let left = rect.right - 220;
  let top = rect.bottom + 8;
  if (left < 8) left = 8;

  dropdown.style.left = `${left}px`;
  dropdown.style.top = `${top}px`;

  dropdown.innerHTML = `
    <div class="px-4 py-3 border-b border-white/5">
      <p class="font-label-lg text-label-lg text-on-surface truncate">${userInfo.displayName}</p>
      ${userInfo.email ? `<p class="font-caption text-caption text-on-surface-variant truncate">${userInfo.email}</p>` : ''}
      ${userInfo.isAnonymous ? `<p class="font-caption text-caption text-on-surface-variant">Guest account</p>` : ''}
    </div>
    <div class="py-1">
      <button id="dropdown-profile" class="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-on-surface">
        <span class="material-symbols-outlined text-[18px]">person</span>
        <span class="font-label-lg text-label-lg">Profile</span>
      </button>
      ${userInfo.isAnonymous ? `
        <button id="dropdown-upgrade" class="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-primary">
          <span class="material-symbols-outlined text-[18px]">upgrade</span>
          <span class="font-label-lg text-label-lg">Create Account</span>
        </button>
      ` : ''}
      <button id="dropdown-signout" class="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-error">
        <span class="material-symbols-outlined text-[18px]">logout</span>
        <span class="font-label-lg text-label-lg">Sign Out</span>
      </button>
    </div>
  `;

  const ddBackdrop = document.createElement('div');
  ddBackdrop.id = 'user-dropdown-backdrop';
  ddBackdrop.className = 'fixed inset-0 z-[199]';
  ddBackdrop.addEventListener('click', () => {
    dropdown.remove();
    ddBackdrop.remove();
  });

  // Handlers
  dropdown.querySelector('#dropdown-profile')?.addEventListener('click', () => {
    window.location.hash = '/profile';
    dropdown.remove();
    ddBackdrop.remove();
  });

  dropdown.querySelector('#dropdown-upgrade')?.addEventListener('click', () => {
    dropdown.remove();
    ddBackdrop.remove();
    showAuthModal();
  });

  dropdown.querySelector('#dropdown-signout')?.addEventListener('click', async () => {
    dropdown.remove();
    ddBackdrop.remove();
    await signOut();
  });

  document.body.appendChild(ddBackdrop);
  document.body.appendChild(dropdown);
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
