/**
 * Home Page
 * Hero bento, trending, popular this season, upcoming, recommended for you
 */
import { fetchTrending, fetchPopularThisSeason, fetchUpcoming, fetchByGenres, fetchAiringSchedule, getWeekStart, DAY_NAMES, getCurrentSeason } from '../api.js';
import { getPreferredTitle, getTopGenres, getAllAnimeIds, getListCounts, getTotalEpisodesWatched } from '../data/storage.js';
import { createAnimeCard } from '../components/animeCard.js';
import { showListModal } from '../components/listModal.js';
import { createHeroSkeleton, createCardSkeletons, createHorizontalSkeletons } from '../components/skeleton.js';

export async function renderHomePage() {
  const app = document.getElementById('app');
  
  // Show loading skeletons
  app.innerHTML = `
    <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-8 space-y-xl">
      <div id="hero-section">${createHeroSkeleton().outerHTML}</div>
      <section class="space-y-md">
        <div class="h-8 w-48 skeleton rounded"></div>
        <div id="trending-section">${createCardSkeletons(6).outerHTML}</div>
      </section>
    </div>
  `;

  try {
    // Fetch data in parallel
    // Calculate this week's range for schedule
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const startTs = Math.floor(weekStart.getTime() / 1000);
    const endTs = Math.floor(weekEnd.getTime() / 1000);

    const [trendingData, seasonData, upcomingData, airingSchedules] = await Promise.all([
      fetchTrending(1, 12),
      fetchPopularThisSeason(1, 10),
      fetchUpcoming(1, 6),
      fetchAiringSchedule(startTs, endTs).catch(() => [])
    ]);

    const trending = trendingData.media || [];
    const seasonal = seasonData.media || [];
    const upcoming = upcomingData.media || [];
    const seasonInfo = getCurrentSeason();
    const stats = getListCounts();
    const episodesWatched = getTotalEpisodesWatched();

    // Fetch recommendations based on user's genre preferences
    let recommended = [];
    const topGenres = getTopGenres(3);
    if (topGenres.length > 0) {
      const excludeIds = getAllAnimeIds();
      try {
        const recData = await fetchByGenres(
          topGenres.map(g => g.genre),
          excludeIds,
          1,
          6
        );
        recommended = recData.media || [];
      } catch (e) {
        console.warn('Failed to fetch recommendations:', e);
      }
    }

    // Featured anime (top trending)
    const featured = trending[0];
    const featuredTitle = featured ? getPreferredTitle(featured.title) : '';
    const featuredDesc = featured?.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || '';
    const featuredBanner = featured?.bannerImage || featured?.coverImage?.extraLarge || '';

    app.innerHTML = `
      <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-8 space-y-xl page-enter">
        
        <!-- Hero Section -->
        <section class="grid grid-cols-1 md:grid-cols-12 gap-gutter" id="hero-bento">
          <div class="md:col-span-8 relative h-[400px] rounded-xl overflow-hidden group cursor-pointer" id="hero-featured">
            <img 
              src="${featuredBanner}" 
              alt="${featuredTitle}" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-lg space-y-sm">
              <div class="flex gap-2">
                <span class="bg-primary text-on-primary font-label-md text-label-md px-2 py-1 rounded">TRENDING #1</span>
                ${featured?.nextAiringEpisode ? `<span class="bg-white/10 backdrop-blur-md text-white font-label-md text-label-md px-2 py-1 rounded">EP ${featured.nextAiringEpisode.episode}</span>` : ''}
              </div>
              <h1 class="font-headline-xl text-headline-xl text-white">${featuredTitle}</h1>
              <p class="text-on-surface-variant font-body-md text-body-md max-w-xl line-clamp-2">${featuredDesc}</p>
              <div class="flex gap-3 pt-2 flex-wrap">
                ${(featured?.genres || []).slice(0, 3).map(g => `
                  <span class="bg-white/10 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-1 rounded">${g}</span>
                `).join('')}
              </div>
              <div class="flex gap-4 pt-2">
                <button id="hero-detail-btn" class="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 active:scale-95 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">info</span> View Details
                </button>
                <button id="hero-add-btn" class="bg-secondary-container text-on-secondary-container px-6 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 active:scale-95 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">add</span> Add to List
                </button>
              </div>
            </div>
          </div>
          <div class="md:col-span-4 grid grid-rows-2 gap-gutter">
            <div class="bg-surface-container rounded-xl p-md flex flex-col justify-between border border-white/5">
              <div>
                <h3 class="font-headline-md text-headline-md text-primary">${seasonInfo.seasonName} ${seasonInfo.year}</h3>
                <p class="text-on-surface-variant font-body-md text-body-md">Your progress this season</p>
              </div>
              <div class="space-y-3 mt-3">
                <div class="flex justify-between font-label-md text-label-md">
                  <span>Anime in List</span>
                  <span class="text-sky-400">${stats.total}</span>
                </div>
                <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-primary shadow-[0_0_8px_rgba(132,207,255,0.5)]" style="width: ${Math.min(stats.total * 5, 100)}%"></div>
                </div>
                <div class="flex justify-between font-label-md text-label-md">
                  <span>Completed</span>
                  <span class="text-sky-400">${stats.completed}</span>
                </div>
                <div class="flex justify-between font-label-md text-label-md">
                  <span>Episodes Watched</span>
                  <span class="text-sky-400">${episodesWatched}</span>
                </div>
              </div>
            </div>
            <div class="bg-surface-container-high rounded-xl p-md relative overflow-hidden group border border-white/5 cursor-pointer" id="quick-resume-card">
              <div class="relative z-10">
                <h3 class="font-headline-md text-headline-md text-white">Watching</h3>
                <p class="text-on-surface-variant font-body-md text-body-md">${stats.watching} anime in progress</p>
              </div>
              <div class="absolute right-[-20px] bottom-[-20px] opacity-20 group-hover:opacity-40 transition-opacity">
                <span class="material-symbols-outlined text-[120px] text-sky-400">play_circle</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Trending Now -->
        <section class="space-y-md">
          <div class="flex justify-between items-end">
            <h2 class="font-headline-lg text-headline-lg border-l-4 border-primary pl-4">Trending Now</h2>
            <a href="#/search" class="text-primary font-label-lg text-label-lg flex items-center gap-1 hover:underline">
              View All <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            </a>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md" id="trending-grid"></div>
        </section>

        <!-- Popular this Season -->
        <section class="space-y-md">
          <div class="flex justify-between items-end">
            <h2 class="font-headline-lg text-headline-lg border-l-4 border-primary pl-4">Popular this Season</h2>
          </div>
          <div class="flex gap-md overflow-x-auto pb-4 custom-scrollbar snap-x" id="seasonal-scroll"></div>
        </section>

        <!-- Weekly Release Schedule -->
        <section class="space-y-md">
          <div class="flex justify-between items-end">
            <h2 class="font-headline-lg text-headline-lg border-l-4 border-primary pl-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">calendar_month</span>
              Weekly Release Schedule
            </h2>
            <a href="#/schedule" class="text-primary font-label-lg text-label-lg flex items-center gap-1 hover:underline">
              View Full Schedule <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            </a>
          </div>
          <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x" id="schedule-scroll"></div>
        </section>

        <!-- Recommended for You -->
        ${recommended.length > 0 ? `
        <section class="space-y-md">
          <div class="flex justify-between items-end">
            <h2 class="font-headline-lg text-headline-lg border-l-4 border-primary pl-4">Recommended for You</h2>
            <span class="text-on-surface-variant font-caption text-caption flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">auto_awesome</span>
              Based on your watchlist
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md" id="recommended-grid"></div>
        </section>
        ` : ''}
      </div>
    `;

    // Populate trending grid
    const trendingGrid = document.getElementById('trending-grid');
    if (trendingGrid) {
      trending.slice(0, 6).forEach(anime => {
        trendingGrid.appendChild(createAnimeCard(anime));
      });
    }

    // Populate seasonal scroll
    const seasonalScroll = document.getElementById('seasonal-scroll');
    if (seasonalScroll) {
      seasonal.forEach(anime => {
        const title = getPreferredTitle(anime.title);
        const cover = anime.coverImage?.large || anime.coverImage?.medium || '';
        const genres = (anime.genres || []).slice(0, 2).join(' • ');
        const score = anime.averageScore ? (anime.averageScore / 10).toFixed(2) : 'N/A';

        const card = document.createElement('div');
        card.className = 'flex-shrink-0 w-[300px] bg-surface-container rounded-xl overflow-hidden border border-white/5 flex snap-start hover:bg-surface-variant transition-colors group cursor-pointer';
        card.innerHTML = `
          <div class="w-24 h-full relative flex-shrink-0">
            <img src="${cover}" alt="${title}" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <div class="p-md flex flex-col justify-center flex-1 min-w-0">
            <h3 class="font-label-lg text-label-lg text-white group-hover:text-primary transition-colors truncate">${title}</h3>
            <p class="font-caption text-caption text-on-surface-variant mb-2">${genres}</p>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[14px] star-gold" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="text-caption font-caption">${score}</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => {
          window.location.hash = `/anime/${anime.id}`;
        });
        seasonalScroll.appendChild(card);
      });
    }

    // Populate weekly schedule
    const scheduleScroll = document.getElementById('schedule-scroll');
    if (scheduleScroll) {
      const now = new Date();
      const todayDow = now.getDay() === 0 ? 6 : now.getDay() - 1;

      // Group airing schedules by day
      const dayGroups = {};
      for (let i = 0; i < 7; i++) dayGroups[i] = [];
      for (const sched of airingSchedules) {
        const airDate = new Date(sched.airingAt * 1000);
        let dow = airDate.getDay();
        dow = dow === 0 ? 6 : dow - 1;
        if (dayGroups[dow]) dayGroups[dow].push(sched);
      }

      DAY_NAMES.forEach((dayName, i) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + i);
        const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const isToday = i === todayDow;
        const entries = dayGroups[i] || [];

        const col = document.createElement('section');
        col.className = `flex-shrink-0 w-[260px] md:w-[280px] snap-center rounded-xl p-4 border transition-all ${
          isToday
            ? 'bg-surface-container border-primary/30 ring-1 ring-primary/20'
            : 'bg-surface-container border-white/5'
        }`;

        let headerHTML = `
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-headline-md text-[15px] font-semibold ${isToday ? 'text-primary' : 'text-on-surface-variant'}">${dayName}</h3>
            ${isToday
              ? `<span class="font-label-md text-label-md bg-primary text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold">TODAY</span>`
              : `<span class="font-label-md text-label-md text-on-surface-variant/60">${dateStr}</span>`
            }
          </div>
        `;

        let cardsHTML = '';
        if (entries.length === 0) {
          cardsHTML = `
            <div class="text-center py-6 text-on-surface-variant/30">
              <span class="material-symbols-outlined text-[24px] mb-1">event_busy</span>
              <p class="font-caption text-caption">No releases</p>
            </div>
          `;
        } else {
          cardsHTML = entries.slice(0, 4).map(sched => {
            const anime = sched.media;
            if (!anime) return '';
            const title = getPreferredTitle(anime.title);
            const cover = anime.coverImage?.medium || '';
            const airTime = new Date(sched.airingAt * 1000);
            const timeStr = airTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' JST';
            return `
              <div class="schedule-card flex gap-3 p-2.5 bg-surface-container-low rounded-lg border border-white/5 hover:bg-surface-variant transition-all cursor-pointer active:scale-[0.98]" data-anime-id="${anime.id}">
                <div class="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  ${cover ? `<img src="${cover}" alt="${title}" class="w-full h-full object-cover" loading="lazy" />` : `<div class="w-full h-full bg-surface-container-high"></div>`}
                </div>
                <div class="flex flex-col justify-center flex-1 min-w-0">
                  <span class="font-label-md text-label-md text-primary mb-0.5 text-[10px]">${timeStr}</span>
                  <h4 class="font-label-lg text-[12px] font-semibold text-on-surface leading-tight truncate">${title}</h4>
                  <span class="font-label-md text-label-md text-on-surface-variant/60 text-[10px] mt-0.5">Episode ${sched.episode}</span>
                </div>
              </div>
            `;
          }).join('');
        }

        col.innerHTML = headerHTML + `<div class="flex flex-col gap-2">${cardsHTML}</div>`;

        // Card click handlers
        col.querySelectorAll('.schedule-card').forEach(card => {
          card.addEventListener('click', () => {
            window.location.hash = `/anime/${card.dataset.animeId}`;
          });
        });

        scheduleScroll.appendChild(col);
      });

      // Auto-scroll to today's column
      const todayCol = scheduleScroll.children[todayDow];
      if (todayCol) {
        setTimeout(() => {
          todayCol.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 100);
      }
    }

    // Populate recommended grid
    const recommendedGrid = document.getElementById('recommended-grid');
    if (recommendedGrid && recommended.length > 0) {
      recommended.forEach(anime => {
        recommendedGrid.appendChild(createAnimeCard(anime));
      });
    }

    // Hero button handlers
    if (featured) {
      document.getElementById('hero-featured')?.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        window.location.hash = `/anime/${featured.id}`;
      });
      document.getElementById('hero-detail-btn')?.addEventListener('click', () => {
        window.location.hash = `/anime/${featured.id}`;
      });
      document.getElementById('hero-add-btn')?.addEventListener('click', (e) => {
        showListModal(featured, e.currentTarget);
      });
    }

    // Quick resume card → library
    document.getElementById('quick-resume-card')?.addEventListener('click', () => {
      window.location.hash = '/library';
    });

  } catch (error) {
    console.error('Home page error:', error);
    app.innerHTML = `
      <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-20 text-center">
        <span class="material-symbols-outlined text-[64px] text-error mb-4">cloud_off</span>
        <h1 class="font-headline-lg text-headline-lg text-on-surface mb-2">Failed to Load</h1>
        <p class="text-on-surface-variant font-body-md mb-6">${error.message}</p>
        <button onclick="location.reload()" class="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">
          Retry
        </button>
      </div>
    `;
  }
}
