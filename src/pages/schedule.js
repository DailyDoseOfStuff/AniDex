/**
 * Schedule Page
 * Weekly airing schedule with horizontal day columns
 * Shows which anime episodes air on which days
 */
import { fetchAiringSchedule, getWeekStart, DAY_NAMES } from '../api.js';
import { getPreferredTitle } from '../data/storage.js';

let weekOffset = 0; // 0 = current week, 1 = next week, -1 = previous week

export async function renderSchedulePage() {
  const app = document.getElementById('app');
  weekOffset = 0;
  await renderWeek(app);
}

async function renderWeek(app) {
  const now = new Date();
  const todayDow = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday=0...Sunday=6

  // Calculate week start
  const weekStart = getWeekStart(now);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const isCurrentWeek = weekOffset === 0;

  // Week label
  const weekLabel = isCurrentWeek ? 'This Week' :
    weekOffset === 1 ? 'Next Week' :
    weekOffset === -1 ? 'Last Week' :
    `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Show loading
  app.innerHTML = `
    <div class="max-w-[1400px] mx-auto px-4 md:px-lg pt-8 pb-8 page-enter">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary text-[28px]">calendar_month</span>
          <div>
            <h1 class="font-headline-lg text-headline-lg text-on-surface">Weekly Release Schedule</h1>
            <p class="font-body-md text-body-md text-on-surface-variant">Stay updated with new releases</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button id="week-prev" class="px-4 py-2 rounded-lg font-label-lg text-label-lg bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest transition-colors active:scale-95">
            Previous
          </button>
          <button id="week-next" class="px-4 py-2 rounded-lg font-label-lg text-label-lg bg-primary text-on-primary hover:bg-primary-container transition-colors active:scale-95">
            Upcoming
          </button>
        </div>
      </div>

      <!-- Week indicator -->
      <div class="text-on-surface-variant font-label-lg text-label-lg mb-4">${weekLabel}</div>

      <!-- Loading skeleton -->
      <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar" id="schedule-grid">
        ${DAY_NAMES.map(() => `
          <div class="flex-shrink-0 w-[260px] min-w-[240px] bg-surface-container rounded-xl p-4 border border-white/5 min-h-[300px]">
            <div class="h-5 w-24 skeleton rounded mb-4"></div>
            <div class="space-y-3">
              <div class="h-20 skeleton rounded-lg"></div>
              <div class="h-20 skeleton rounded-lg"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Wire up navigation buttons
  document.getElementById('week-prev')?.addEventListener('click', () => {
    weekOffset--;
    renderWeek(app);
  });
  document.getElementById('week-next')?.addEventListener('click', () => {
    weekOffset++;
    renderWeek(app);
  });

  try {
    // Fetch airing data for the week
    const startTs = Math.floor(weekStart.getTime() / 1000);
    const endTs = Math.floor(weekEnd.getTime() / 1000);
    const schedules = await fetchAiringSchedule(startTs, endTs);

    // Group by day of week
    const dayGroups = {};
    for (let i = 0; i < 7; i++) {
      dayGroups[i] = [];
    }

    for (const sched of schedules) {
      const airDate = new Date(sched.airingAt * 1000);
      let dow = airDate.getDay();
      dow = dow === 0 ? 6 : dow - 1; // Monday=0...Sunday=6
      if (dayGroups[dow]) {
        dayGroups[dow].push(sched);
      }
    }

    // Build the columns
    const grid = document.getElementById('schedule-grid');
    grid.innerHTML = '';

    DAY_NAMES.forEach((dayName, i) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isToday = isCurrentWeek && i === todayDow;
      const isPast = isCurrentWeek && i < todayDow;
      const entries = dayGroups[i] || [];

      const column = document.createElement('div');
      column.className = `flex-shrink-0 w-[260px] min-w-[240px] rounded-xl p-4 border transition-all min-h-[300px] ${
        isToday
          ? 'bg-surface-container border-primary/30 ring-1 ring-primary/20'
          : 'bg-surface-container border-white/5'
      } ${isPast ? 'opacity-50' : ''}`;

      column.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-[14px] ${isToday ? 'text-primary' : 'text-on-surface-variant'}">
            ${dayName}
          </h3>
          ${isToday
            ? `<span class="bg-primary text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">TODAY</span>`
            : `<span class="text-on-surface-variant/50 text-[11px]">${dateStr}</span>`
          }
        </div>
        <div class="flex flex-col gap-3" id="day-${i}-entries">
          ${entries.length === 0
            ? `<div class="text-center py-8 text-on-surface-variant/30">
                <span class="material-symbols-outlined text-[28px] mb-1">event_busy</span>
                <p class="text-[11px]">No releases</p>
              </div>`
            : ''
          }
        </div>
      `;

      // Add anime cards for this day
      if (entries.length > 0) {
        const entriesContainer = column.querySelector(`#day-${i}-entries`);
        entries.forEach(sched => {
          const anime = sched.media;
          if (!anime) return;

          const title = getPreferredTitle(anime.title);
          const cover = anime.coverImage?.medium || anime.coverImage?.large || '';
          const airTime = new Date(sched.airingAt * 1000);
          const timeStr = airTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' JST';
          const progress = anime.episodes ? Math.round((sched.episode / anime.episodes) * 100) : 0;

          const card = document.createElement('div');
          card.className = 'flex gap-3 p-2.5 bg-surface-container-low rounded-lg border border-white/5 hover:bg-surface-variant transition-all cursor-pointer active:scale-[0.98]';
          card.innerHTML = `
            <div class="w-16 h-[88px] rounded-lg overflow-hidden flex-shrink-0">
              ${cover
                ? `<img src="${cover}" alt="${title}" class="w-full h-full object-cover" loading="lazy" />`
                : `<div class="w-full h-full bg-surface-container-high flex items-center justify-center">
                    <span class="material-symbols-outlined text-on-surface-variant/30 text-[18px]">image</span>
                  </div>`
              }
            </div>
            <div class="flex flex-col justify-center flex-1 min-w-0">
              <span class="text-primary text-[10px] font-semibold mb-0.5">${timeStr}</span>
              <h4 class="text-on-surface text-[13px] font-semibold leading-tight mb-1.5 line-clamp-2">${title}</h4>
              <div class="flex items-center gap-2">
                <span class="bg-outline-variant/30 text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-medium">EP ${sched.episode}</span>
                ${anime.episodes ? `
                  <div class="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full" style="width: ${progress}%"></div>
                  </div>
                ` : ''}
              </div>
            </div>
          `;

          card.addEventListener('click', () => {
            window.location.hash = `/anime/${anime.id}`;
          });

          entriesContainer.appendChild(card);
        });
      }

      grid.appendChild(column);
    });

    // Auto-scroll to today's column on current week
    if (isCurrentWeek) {
      const todayCol = grid.children[todayDow];
      if (todayCol) {
        setTimeout(() => {
          todayCol.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 200);
      }
    }

  } catch (error) {
    console.error('Schedule error:', error);
    const grid = document.getElementById('schedule-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="w-full text-center py-16">
          <span class="material-symbols-outlined text-[64px] text-error mb-4">error</span>
          <h3 class="font-headline-md text-headline-md text-on-surface mb-2">Failed to Load Schedule</h3>
          <p class="text-on-surface-variant font-body-md">${error.message}</p>
        </div>
      `;
    }
  }
}

