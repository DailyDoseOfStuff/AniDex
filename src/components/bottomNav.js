/**
 * Bottom Navigation Component (Mobile)
 */

export function renderBottomNav() {
  const root = document.getElementById('bottom-nav-root');
  root.innerHTML = `
    <nav id="mobile-nav" class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 shadow-2xl rounded-t-xl md:hidden">
      <a href="#/home" class="mobile-nav-btn flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-transform duration-150" data-route="/home">
        <span class="material-symbols-outlined">home</span>
        <span class="nav-label font-['Be_Vietnam_Pro'] text-[10px] font-semibold uppercase tracking-widest mt-0.5">Home</span>
      </a>
      <a href="#/search" class="mobile-nav-btn flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-transform duration-150" data-route="/search">
        <span class="material-symbols-outlined">search</span>
        <span class="nav-label font-['Be_Vietnam_Pro'] text-[10px] font-semibold uppercase tracking-widest mt-0.5">Search</span>
      </a>
      <a href="#/schedule" class="mobile-nav-btn flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-transform duration-150" data-route="/schedule">
        <span class="material-symbols-outlined">calendar_month</span>
        <span class="nav-label font-['Be_Vietnam_Pro'] text-[10px] font-semibold uppercase tracking-widest mt-0.5">Schedule</span>
      </a>
      <a href="#/library" class="mobile-nav-btn flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-transform duration-150" data-route="/library">
        <span class="material-symbols-outlined">bookmarks</span>
        <span class="nav-label font-['Be_Vietnam_Pro'] text-[10px] font-semibold uppercase tracking-widest mt-0.5">Library</span>
      </a>
      <a href="#/profile" class="mobile-nav-btn flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-transform duration-150" data-route="/profile">
        <span class="material-symbols-outlined">person</span>
        <span class="nav-label font-['Be_Vietnam_Pro'] text-[10px] font-semibold uppercase tracking-widest mt-0.5">Profile</span>
      </a>
    </nav>
  `;
}
