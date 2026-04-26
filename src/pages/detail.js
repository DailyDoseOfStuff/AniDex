/**
 * Anime Detail Page
 * Full anime information: banner, poster, stats, characters, recommendations
 */
import { fetchAnimeDetail } from '../api.js';
import { getPreferredTitle, getAnimeStatus, LIST_LABELS } from '../data/storage.js';
import { showListModal } from '../components/listModal.js';
import { createAnimeCard } from '../components/animeCard.js';
import { createDetailSkeleton } from '../components/skeleton.js';

export async function renderDetailPage(params) {
  const app = document.getElementById('app');
  const animeId = parseInt(params.id);

  // Show skeleton
  app.innerHTML = '';
  app.appendChild(createDetailSkeleton());

  try {
    const anime = await fetchAnimeDetail(animeId);
    if (!anime) throw new Error('Anime not found');

    const title = getPreferredTitle(anime.title);
    const nativeTitle = anime.title?.native || '';
    const altTitle = anime.title?.romaji !== title ? anime.title?.romaji : anime.title?.english || '';
    const banner = anime.bannerImage || anime.coverImage?.extraLarge || '';
    const cover = anime.coverImage?.extraLarge || anime.coverImage?.large || '';
    const description = anime.description?.replace(/<[^>]*>/g, '') || 'No description available.';
    const genres = anime.genres || [];
    const score = anime.averageScore ? anime.averageScore + '%' : 'N/A';
    const meanScore = anime.meanScore ? (anime.meanScore / 10).toFixed(1) : 'N/A';
    const popularity = anime.popularity ? '#' + anime.popularity.toLocaleString() : 'N/A';
    const favourites = anime.favourites ? anime.favourites.toLocaleString() : '0';
    const status = anime.status?.replace(/_/g, ' ') || 'Unknown';
    const format = anime.format?.replace(/_/g, ' ') || 'Unknown';
    const episodes = anime.episodes || '?';
    const duration = anime.duration ? anime.duration + ' min' : '';
    const season = anime.season ? `${anime.season.charAt(0)}${anime.season.slice(1).toLowerCase()} ${anime.seasonYear || ''}` : '';
    const studio = anime.studios?.nodes?.find(s => s.isAnimationStudio)?.name || anime.studios?.nodes?.[0]?.name || 'Unknown';
    const source = anime.source?.replace(/_/g, ' ') || '';
    const currentStatus = getAnimeStatus(animeId);

    // Characters
    const characters = (anime.characters?.edges || []).slice(0, 8);

    // Recommendations
    const recommendations = (anime.recommendations?.nodes || [])
      .filter(n => n.mediaRecommendation)
      .map(n => n.mediaRecommendation)
      .slice(0, 6);

    // Relations
    const relations = (anime.relations?.edges || [])
      .filter(e => e.node?.type === 'ANIME')
      .slice(0, 4);

    // Start/End dates
    const startDate = anime.startDate?.year ? `${anime.startDate.month || '?'}/${anime.startDate.day || '?'}/${anime.startDate.year}` : '';
    const endDate = anime.endDate?.year ? `${anime.endDate.month || '?'}/${anime.endDate.day || '?'}/${anime.endDate.year}` : '';

    app.innerHTML = `
      <div class="page-enter">
        <!-- Banner -->
        <div class="relative h-[250px] md:h-[350px] w-full overflow-hidden">
          ${banner ? `<img src="${banner}" alt="" class="w-full h-full object-cover" />` : `<div class="w-full h-full bg-surface-container"></div>`}
          <div class="absolute inset-0 scrim-bottom"></div>
        </div>

        <div class="max-w-[1200px] mx-auto px-4 md:px-lg -mt-32 relative z-10">
          <div class="flex flex-col md:flex-row gap-8">
            
            <!-- Left Sidebar: Poster + Actions + Info -->
            <div class="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
              <div class="rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3]">
                <img src="${cover}" alt="${title}" class="w-full h-full object-cover" />
              </div>

              <!-- Action Buttons -->
              <div class="mt-6 flex flex-col gap-3">
                <button id="detail-add-btn" class="bg-primary text-on-primary font-label-lg py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">
                    ${currentStatus ? 'check_circle' : 'add'}
                  </span>
                  ${currentStatus ? LIST_LABELS[currentStatus] : 'Add to List'}
                </button>
              </div>

              <!-- Info Sidebar -->
              <div class="mt-6 space-y-4 bg-surface-container/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Status</span>
                  <span class="text-primary font-label-lg">${status}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Format</span>
                  <span class="text-on-surface font-label-lg">${format} (${episodes} eps${duration ? ' × ' + duration : ''})</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Studio</span>
                  <span class="text-on-surface font-label-lg">${studio}</span>
                </div>
                ${season ? `
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Season</span>
                  <span class="text-on-surface font-label-lg">${season}</span>
                </div>
                ` : ''}
                ${source ? `
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Source</span>
                  <span class="text-on-surface font-label-lg">${source}</span>
                </div>
                ` : ''}
                ${startDate ? `
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Aired</span>
                  <span class="text-on-surface font-label-lg">${startDate}${endDate ? ' to ' + endDate : ''}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Main Content -->
            <div class="flex-grow min-w-0">
              <!-- Genre Tags -->
              <div class="flex flex-wrap items-center gap-2 mb-3">
                ${genres.map(g => `
                  <a href="#/search" class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md border border-primary/20 hover:bg-primary/20 transition-colors genre-link" data-genre="${g}">${g}</a>
                `).join('')}
              </div>

              <!-- Title -->
              <h1 class="text-headline-xl font-headline-xl text-on-background">${title}</h1>
              ${altTitle ? `<p class="text-on-surface-variant font-body-md mt-1">${altTitle}</p>` : ''}
              ${nativeTitle && nativeTitle !== title ? `<p class="text-on-surface-variant/50 font-body-md">${nativeTitle}</p>` : ''}

              <!-- Description -->
              <p class="text-on-surface-variant font-body-lg max-w-2xl mt-4 leading-relaxed">${description}</p>

              <!-- Stats Cards -->
              <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col items-center">
                  <span class="text-headline-md text-primary font-headline-md">${score}</span>
                  <span class="text-on-surface-variant font-label-md mt-1">Average Score</span>
                </div>
                <div class="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col items-center">
                  <span class="text-headline-md text-on-surface font-headline-md">${popularity}</span>
                  <span class="text-on-surface-variant font-label-md mt-1">Popularity</span>
                </div>
                <div class="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col items-center">
                  <span class="text-headline-md text-on-surface font-headline-md">${favourites}</span>
                  <span class="text-on-surface-variant font-label-md mt-1">Favourites</span>
                </div>
                <div class="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col items-center">
                  <span class="text-headline-md text-on-surface font-headline-md">${meanScore}</span>
                  <span class="text-on-surface-variant font-label-md mt-1">Mean Score</span>
                </div>
              </div>

              <!-- Characters -->
              ${characters.length > 0 ? `
              <div class="mt-12">
                <h3 class="text-headline-md font-headline-md text-on-background mb-6">Characters</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${characters.map(edge => {
                    const char = edge.node;
                    const va = edge.voiceActors?.[0];
                    const charImg = char?.image?.medium || '';
                    const charName = char?.name?.full || 'Unknown';
                    const role = edge.role?.charAt(0) + (edge.role?.slice(1).toLowerCase() || '');
                    const vaName = va?.name?.full || '';

                    return `
                      <div class="bg-surface-container-high rounded-lg overflow-hidden flex border border-white/5 hover:border-primary/30 transition-colors">
                        ${charImg ? `<img src="${charImg}" alt="${charName}" class="w-16 h-16 object-cover flex-shrink-0" loading="lazy" />` : `<div class="w-16 h-16 bg-surface-container flex-shrink-0"></div>`}
                        <div class="p-3 flex justify-between items-center w-full min-w-0">
                          <div class="min-w-0">
                            <p class="text-on-surface font-label-lg truncate">${charName}</p>
                            <p class="text-on-surface-variant font-caption">${role}</p>
                          </div>
                          ${vaName ? `
                          <div class="text-right min-w-0 ml-2">
                            <p class="text-on-surface font-label-lg truncate">${vaName}</p>
                            <p class="text-on-surface-variant font-caption">Japanese</p>
                          </div>
                          ` : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
              ` : ''}

              <!-- Relations -->
              ${relations.length > 0 ? `
              <div class="mt-12">
                <h3 class="text-headline-md font-headline-md text-on-background mb-6">Relations</h3>
                <div class="flex gap-md overflow-x-auto pb-4 custom-scrollbar">
                  ${relations.map(edge => {
                    const rel = edge.node;
                    const relTitle = getPreferredTitle(rel.title);
                    const relCover = rel.coverImage?.large || '';
                    const relType = edge.relationType?.replace(/_/g, ' ') || '';
                    return `
                      <div class="flex-shrink-0 w-[200px] cursor-pointer group relation-card" data-anime-id="${rel.id}">
                        <div class="aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-low shadow-lg mb-2 group-hover:ring-2 ring-primary transition-all">
                          <img src="${relCover}" alt="${relTitle}" class="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <p class="text-primary font-label-md text-label-md uppercase tracking-wider">${relType}</p>
                        <h4 class="font-label-lg text-label-lg text-on-surface truncate">${relTitle}</h4>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
              ` : ''}

              <!-- Recommendations -->
              ${recommendations.length > 0 ? `
              <div class="mt-12">
                <h3 class="text-headline-md font-headline-md text-on-background mb-6">Recommendations</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md" id="detail-recs-grid"></div>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Populate recommendation cards
    const recsGrid = document.getElementById('detail-recs-grid');
    if (recsGrid) {
      recommendations.forEach(rec => {
        recsGrid.appendChild(createAnimeCard(rec));
      });
    }

    // Add to list button
    document.getElementById('detail-add-btn')?.addEventListener('click', (e) => {
      showListModal(anime, e.currentTarget);
    });

    // Genre links → search filtered
    document.querySelectorAll('.genre-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const genre = link.getAttribute('data-genre');
        window.location.hash = '/search';
        // We'll set the genre filter after navigation
        setTimeout(() => {
          const searchInput = document.getElementById('search-input');
          if (searchInput) searchInput.value = '';
          // Trigger genre selection via custom event
          window.dispatchEvent(new CustomEvent('setSearchGenre', { detail: { genre } }));
        }, 100);
      });
    });

    // Relation card clicks
    document.querySelectorAll('.relation-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.hash = `/anime/${card.getAttribute('data-anime-id')}`;
      });
    });

  } catch (error) {
    console.error('Detail page error:', error);
    app.innerHTML = `
      <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-20 text-center">
        <span class="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h1 class="font-headline-lg text-headline-lg text-on-surface mb-2">Failed to Load Anime</h1>
        <p class="text-on-surface-variant font-body-md mb-6">${error.message}</p>
        <button onclick="history.back()" class="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">Go Back</button>
      </div>
    `;
  }
}
