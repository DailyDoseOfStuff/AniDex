/**
 * Search Page
 * Search input, genre filter pills, sort, paginated grid
 */
import { searchAnime, GENRES, SORT_OPTIONS } from '../api.js';
import { getPreferredTitle } from '../data/storage.js';
import { createAnimeCard } from '../components/animeCard.js';
import { createPagination } from '../components/pagination.js';
import { createSearchSkeletons } from '../components/skeleton.js';

let currentState = {
  search: '',
  genres: [],
  sort: 'TRENDING_DESC',
  page: 1
};

export async function renderSearchPage() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="max-w-[1200px] mx-auto px-4 md:px-lg pb-8 page-enter">
      <!-- Search Input -->
      <section class="pt-8 pb-6">
        <div class="relative group">
          <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
            <span class="material-symbols-outlined">search</span>
          </div>
          <input 
            id="search-input"
            class="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-4 pl-12 pr-4 text-on-surface font-body-lg transition-all outline-none"
            placeholder="Search for anime..."
            type="text"
            value="${currentState.search}"
          />
        </div>
      </section>

      <!-- Genre Filters -->
      <section class="flex flex-col gap-4 overflow-x-hidden">
        <div class="flex items-center justify-between">
          <h2 class="font-headline-md text-headline-md text-on-surface">Browse Categories</h2>
        </div>
        <div class="flex flex-wrap gap-2" id="genre-pills"></div>
      </section>

      <!-- Sort + Results Count -->
      <section class="mt-6 mb-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">filter_list</span>
            <span class="font-label-lg text-label-lg text-outline uppercase tracking-widest" id="results-count">Loading...</span>
          </div>
          <div class="flex items-center gap-3">
            <label class="font-label-md text-label-md text-on-surface-variant">Sort by:</label>
            <select id="sort-select" class="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-on-surface font-label-lg text-label-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer">
              ${SORT_OPTIONS.map(opt => `
                <option value="${opt.value}" ${currentState.sort === opt.value ? 'selected' : ''}>${opt.label}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </section>

      <!-- Results Grid -->
      <section id="search-results">
        ${createSearchSkeletons(20).outerHTML}
      </section>

      <!-- Pagination -->
      <div id="pagination-container"></div>
    </div>
  `;

  // Build genre pills
  const genrePills = document.getElementById('genre-pills');
  GENRES.forEach(genre => {
    const pill = document.createElement('button');
    const isActive = currentState.genres.includes(genre);
    pill.className = `font-label-lg text-label-lg px-4 py-2 rounded-full transition-colors ${
      isActive 
        ? 'bg-primary text-on-primary' 
        : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-high'
    }`;
    pill.textContent = genre;
    pill.addEventListener('click', () => {
      if (currentState.genres.includes(genre)) {
        currentState.genres = currentState.genres.filter(g => g !== genre);
      } else {
        currentState.genres.push(genre);
      }
      currentState.page = 1;
      updatePillStyles();
      performSearch();
    });
    genrePills.appendChild(pill);
  });

  // Search input handler (debounced)
  let searchTimeout;
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentState.search = e.target.value;
      currentState.page = 1;
      performSearch();
    }, 400);
  });

  // Sort handler
  document.getElementById('sort-select').addEventListener('change', (e) => {
    currentState.sort = e.target.value;
    currentState.page = 1;
    performSearch();
  });

  // Initial search
  performSearch();

  // Return cleanup
  return () => {
    // Keep search state for back navigation
  };
}

function updatePillStyles() {
  const pills = document.querySelectorAll('#genre-pills button');
  pills.forEach(pill => {
    const genre = pill.textContent;
    const isActive = currentState.genres.includes(genre);
    pill.className = `font-label-lg text-label-lg px-4 py-2 rounded-full transition-colors ${
      isActive 
        ? 'bg-primary text-on-primary' 
        : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-high'
    }`;
  });
}

async function performSearch() {
  const resultsContainer = document.getElementById('search-results');
  const paginationContainer = document.getElementById('pagination-container');
  const resultsCount = document.getElementById('results-count');

  // Show loading
  resultsContainer.innerHTML = createSearchSkeletons(20).outerHTML;
  if (paginationContainer) paginationContainer.innerHTML = '';

  try {
    const data = await searchAnime({
      search: currentState.search,
      genres: currentState.genres,
      sort: currentState.sort,
      page: currentState.page,
      perPage: 20
    });

    const media = data.media || [];
    const pageInfo = data.pageInfo;

    // Update results count
    if (resultsCount) {
      resultsCount.textContent = `Showing ${media.length} of ${pageInfo.total || 0} Results`;
    }

    // Build grid
    resultsContainer.innerHTML = '';
    if (media.length === 0) {
      resultsContainer.innerHTML = `
        <div class="text-center py-16">
          <span class="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">search_off</span>
          <h3 class="font-headline-md text-headline-md text-on-surface mb-2">No results found</h3>
          <p class="text-on-surface-variant font-body-md">Try different search terms or filters</p>
        </div>
      `;
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md';
    media.forEach(anime => {
      grid.appendChild(createAnimeCard(anime));
    });
    resultsContainer.appendChild(grid);

    // Pagination
    if (paginationContainer && pageInfo) {
      const pagination = createPagination(pageInfo, (newPage) => {
        currentState.page = newPage;
        performSearch();
        // Scroll to top of results
        document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      paginationContainer.innerHTML = '';
      paginationContainer.appendChild(pagination);
    }

  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = `
      <div class="text-center py-16">
        <span class="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h3 class="font-headline-md text-headline-md text-on-surface mb-2">Search Failed</h3>
        <p class="text-on-surface-variant font-body-md">${error.message}</p>
        <button onclick="location.reload()" class="mt-4 bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">Retry</button>
      </div>
    `;
  }
}
