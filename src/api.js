/**
 * AniList GraphQL API Client
 * Endpoint: https://graphql.anilist.co
 * Rate limit: ~90 requests/minute
 */

const API_URL = 'https://graphql.anilist.co';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function query(graphql, variables = {}, cacheKey = null) {
  // Check cache
  if (cacheKey && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: graphql, variables })
  });

  if (response.status === 429) {
    // Rate limited — wait and retry
    await new Promise(r => setTimeout(r, 2000));
    return query(graphql, variables, cacheKey);
  }

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  // Cache result
  if (cacheKey) {
    cache.set(cacheKey, { data: json.data, timestamp: Date.now() });
  }

  return json.data;
}

// ========== Media Fragment ==========
const MEDIA_CARD_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  genres
  averageScore
  popularity
  episodes
  status
  season
  seasonYear
  format
  description(asHtml: false)
  studios(isMain: true) {
    nodes { name }
  }
  nextAiringEpisode {
    airingAt
    episode
    timeUntilAiring
  }
  trending
  meanScore
`;

const MEDIA_DETAIL_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    medium
    color
  }
  bannerImage
  genres
  tags {
    name
    rank
    category
  }
  averageScore
  meanScore
  popularity
  favourites
  episodes
  duration
  status
  season
  seasonYear
  format
  source
  description(asHtml: false)
  studios {
    nodes { name isAnimationStudio }
  }
  startDate { year month day }
  endDate { year month day }
  nextAiringEpisode {
    airingAt
    episode
    timeUntilAiring
  }
  characters(sort: ROLE, page: 1, perPage: 8) {
    edges {
      role
      voiceActors(language: JAPANESE, sort: RELEVANCE) {
        name { full }
        image { medium }
      }
      node {
        name { full }
        image { medium }
      }
    }
  }
  recommendations(sort: RATING_DESC, page: 1, perPage: 8) {
    nodes {
      mediaRecommendation {
        id
        title { romaji english }
        coverImage { large }
        averageScore
        genres
        episodes
        format
        status
      }
    }
  }
  relations {
    edges {
      relationType
      node {
        id
        title { romaji english }
        coverImage { large }
        format
        status
        type
      }
    }
  }
`;

// ========== Queries ==========

/**
 * Fetch trending anime
 */
export async function fetchTrending(page = 1, perPage = 6) {
  const data = await query(`
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `, { page, perPage }, `trending_${page}_${perPage}`);
  return data.Page;
}

/**
 * Fetch popular anime this season
 */
export async function fetchPopularThisSeason(page = 1, perPage = 10) {
  const now = new Date();
  const month = now.getMonth();
  let season;
  if (month >= 0 && month <= 2) season = 'WINTER';
  else if (month >= 3 && month <= 5) season = 'SPRING';
  else if (month >= 6 && month <= 8) season = 'SUMMER';
  else season = 'FALL';
  const year = now.getFullYear();

  const data = await query(`
    query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: POPULARITY_DESC, season: $season, seasonYear: $seasonYear, isAdult: false) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `, { page, perPage, season, seasonYear: year }, `season_${season}_${year}_${page}`);
  return data.Page;
}

/**
 * Fetch upcoming / not yet released anime
 */
export async function fetchUpcoming(page = 1, perPage = 6) {
  const data = await query(`
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: POPULARITY_DESC, status: NOT_YET_RELEASED, isAdult: false) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `, { page, perPage }, `upcoming_${page}`);
  return data.Page;
}

/**
 * Fetch full anime detail
 */
export async function fetchAnimeDetail(id) {
  const data = await query(`
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_DETAIL_FIELDS}
      }
    }
  `, { id }, `detail_${id}`);
  return data.Media;
}

/**
 * Search anime with filters
 */
export async function searchAnime({ search = '', genres = [], sort = 'TRENDING_DESC', page = 1, perPage = 20 } = {}) {
  const variables = { page, perPage, sort: [sort] };
  let genreFilter = '';
  let searchFilter = '';

  if (search && search.trim()) {
    variables.search = search.trim();
    searchFilter = '$search: String,';
  }
  if (genres.length > 0) {
    variables.genres = genres;
    genreFilter = '$genres: [String],';
  }

  const data = await query(`
    query ($page: Int, $perPage: Int, ${searchFilter} ${genreFilter} $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, ${search ? 'search: $search,' : ''} ${genres.length ? 'genre_in: $genres,' : ''} sort: $sort, isAdult: false) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `, variables, null); // Don't cache search results
  return data.Page;
}

/**
 * Fetch anime by genre (for recommendations)
 */
export async function fetchByGenres(genres, excludeIds = [], page = 1, perPage = 10) {
  const data = await query(`
    query ($page: Int, $perPage: Int, $genres: [String], $excludeIds: [Int]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, genre_in: $genres, id_not_in: $excludeIds, sort: SCORE_DESC, isAdult: false) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `, { page, perPage, genres, excludeIds }, `recs_${genres.join(',')}_${page}`);
  return data.Page;
}

/**
 * Fetch multiple anime by IDs (for loading watchlist details)
 */
export async function fetchAnimeByIds(ids) {
  if (!ids || ids.length === 0) return [];

  // Batch into chunks of 50
  const chunks = [];
  for (let i = 0; i < ids.length; i += 50) {
    chunks.push(ids.slice(i, i + 50));
  }

  const results = [];
  for (const chunk of chunks) {
    const data = await query(`
      query ($ids: [Int]) {
        Page(perPage: 50) {
          media(type: ANIME, id_in: $ids, isAdult: false) {
            ${MEDIA_CARD_FIELDS}
          }
        }
      }
    `, { ids: chunk });
    results.push(...data.Page.media);
  }
  return results;
}

/**
 * Get current anime season info
 */
export function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth();
  let season, seasonName;
  if (month >= 0 && month <= 2) { season = 'WINTER'; seasonName = 'Winter'; }
  else if (month >= 3 && month <= 5) { season = 'SPRING'; seasonName = 'Spring'; }
  else if (month >= 6 && month <= 8) { season = 'SUMMER'; seasonName = 'Summer'; }
  else { season = 'FALL'; seasonName = 'Fall'; }
  return { season, seasonName, year: now.getFullYear() };
}

/**
 * Available genres list
 */
export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy',
  'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery',
  'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller'
];

/**
 * Sort options
 */
export const SORT_OPTIONS = [
  { label: 'Trending', value: 'TRENDING_DESC' },
  { label: 'Popularity', value: 'POPULARITY_DESC' },
  { label: 'Score', value: 'SCORE_DESC' },
  { label: 'Newest', value: 'START_DATE_DESC' },
  { label: 'Title', value: 'TITLE_ENGLISH' }
];

/**
 * Fetch airing schedule for a date range
 * Returns anime episodes airing between two unix timestamps, sorted by time
 */
export async function fetchAiringSchedule(startTimestamp, endTimestamp) {
  const data = await query(`
    query ($airingAt_greater: Int, $airingAt_lesser: Int) {
      Page(perPage: 50) {
        airingSchedules(airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: TIME) {
          airingAt
          episode
          media {
            id
            title { romaji english native }
            coverImage { large medium }
            episodes
            genres
            format
            status
            averageScore
          }
        }
      }
    }
  `, { airingAt_greater: startTimestamp, airingAt_lesser: endTimestamp },
  `schedule_${startTimestamp}_${endTimestamp}`);
  return data.Page.airingSchedules || [];
}

/**
 * Get the start of a week (Monday) as a Date for a given reference date
 */
export function getWeekStart(referenceDate = new Date()) {
  const date = new Date(referenceDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get day names
 */
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Clear API cache
 */
export function clearCache() {
  cache.clear();
}
