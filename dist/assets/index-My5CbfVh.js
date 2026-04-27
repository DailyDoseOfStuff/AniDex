(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[],t=null,n=null;function r(t,n){let r=[],i=t.replace(/:([^/]+)/g,(e,t)=>(r.push(t),`([^/]+)`));e.push({pattern:t,regex:RegExp(`^${i}$`),paramNames:r,handler:n})}function i(e){window.location.hash=e}function a(){return window.location.hash.slice(1)||`/home`}function o(){window.addEventListener(`hashchange`,s),s()}async function s(){let r=a(),i=document.getElementById(`app`);if(n){try{n()}catch(e){console.error(`Page cleanup error:`,e)}n=null}document.getElementById(`popup-root`).innerHTML=``,document.getElementById(`modal-root`).innerHTML=``,document.getElementById(`anime-hover-popup`)?.remove(),document.querySelectorAll(`#move-dropdown, #list-modal-backdrop, #list-modal-dropdown`).forEach(e=>e.remove());for(let t of e){let e=r.match(t.regex);if(e){let a={};t.paramNames.forEach((t,n)=>{a[t]=e[n+1]}),i.classList.remove(`page-enter`),i.offsetWidth,i.classList.add(`page-enter`);try{let e=await t.handler(a);typeof e==`function`&&(n=e)}catch(e){console.error(`Route handler error:`,e),i.innerHTML=`
          <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-20 text-center">
            <span class="material-symbols-outlined text-[64px] text-error mb-4">error</span>
            <h1 class="font-headline-lg text-headline-lg text-on-surface mb-2">Something went wrong</h1>
            <p class="text-on-surface-variant font-body-md">${e.message}</p>
            <button onclick="location.hash='/home'" class="mt-6 bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">
              Go Home
            </button>
          </div>
        `}window.dispatchEvent(new CustomEvent(`routechange`,{detail:{path:r,params:a}}));return}}t?t():i.innerHTML=`
      <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-20 text-center">
        <span class="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">explore_off</span>
        <h1 class="font-headline-lg text-headline-lg text-on-surface mb-2">Page Not Found</h1>
        <p class="text-on-surface-variant font-body-md">The page you're looking for doesn't exist.</p>
        <button onclick="location.hash='/home'" class="mt-6 bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">
          Go Home
        </button>
      </div>
    `,window.dispatchEvent(new CustomEvent(`routechange`,{detail:{path:r}}))}var c={WATCHLIST:`anitrack_watchlist`,SETTINGS:`anitrack_settings`,CACHE:`anitrack_cache`},l={WATCHING:`watching`,COMPLETED:`completed`,PLAN_TO_WATCH:`planToWatch`,ON_HOLD:`onHold`},u={[l.WATCHING]:`Watching`,[l.COMPLETED]:`Completed`,[l.PLAN_TO_WATCH]:`Plan to Watch`,[l.ON_HOLD]:`On Hold`},d={[l.WATCHING]:`play_circle`,[l.COMPLETED]:`check_circle`,[l.PLAN_TO_WATCH]:`bookmark`,[l.ON_HOLD]:`pause_circle`};function f(e){try{let t=localStorage.getItem(e);return t?JSON.parse(t):null}catch{return null}}function p(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch(e){console.error(`Storage write failed:`,e)}}function m(){return f(c.WATCHLIST)||{watching:[],completed:[],planToWatch:[],onHold:[]}}function h(e){p(c.WATCHLIST,e)}function g(e,t,n){m(),_(e);let r=m();r[n]||(r[n]=[]),r[n].push({id:e,addedAt:Date.now(),title:t.title,coverImage:t.coverImage,genres:t.genres,episodes:t.episodes,format:t.format,status:t.status,averageScore:t.averageScore}),h(r),j()}function _(e){let t=m();for(let n of Object.values(l))t[n]&&(t[n]=t[n].filter(t=>t.id!==e));h(t),j()}function v(e,t){let n=m(),r=null;for(let t of Object.values(l))if(n[t]){let i=n[t].find(t=>t.id===e);if(i){r=i,n[t]=n[t].filter(t=>t.id!==e);break}}r&&(n[t]||(n[t]=[]),r.addedAt=Date.now(),n[t].push(r),h(n),j())}function y(e){return m()[e]||[]}function b(e){let t=m();for(let n of Object.values(l))if(t[n]?.some(t=>t.id===e))return n;return null}function ee(){let e=m(),t=[];for(let n of Object.values(l))e[n]&&t.push(...e[n].map(e=>e.id));return t}function x(){let e=m();return{watching:(e.watching||[]).length,completed:(e.completed||[]).length,planToWatch:(e.planToWatch||[]).length,onHold:(e.onHold||[]).length,total:Object.values(l).reduce((t,n)=>t+(e[n]||[]).length,0)}}function S(e=5){let t=m(),n={};for(let e of Object.values(l))if(t[e]){for(let r of t[e])if(r.genres)for(let e of r.genres)n[e]=(n[e]||0)+1}return Object.entries(n).sort((e,t)=>t[1]-e[1]).slice(0,e).map(([e,t])=>({genre:e,count:t}))}function C(){return y(l.COMPLETED).reduce((e,t)=>e+(t.episodes||0),0)}function w(e=10){let t=m(),n=[];for(let e of Object.values(l))t[e]&&n.push(...t[e].map(t=>({...t,listCategory:e})));return n.sort((e,t)=>(t.addedAt||0)-(e.addedAt||0)).slice(0,e)}function T(){return f(c.SETTINGS)||{titleLanguage:`english`}}function E(e){p(c.SETTINGS,e)}function D(){return T().titleLanguage}function O(e){let t=T();t.titleLanguage=e,E(t),j()}function k(e){if(!e)return`Unknown Title`;let t=D();return t===`romaji`?e.romaji||e.english||e.native||`Unknown`:t===`native`?e.native||e.romaji||`Unknown`:e.english||e.romaji||e.native||`Unknown`}var A=new Set;function j(){for(let e of A)try{e()}catch(e){console.error(`Storage listener error:`,e)}}function te(e){return A.add(e),()=>A.delete(e)}function ne(){return{watchlist:m(),settings:T(),exportedAt:new Date().toISOString()}}function re(){let e=document.getElementById(`header-root`),t=D();e.innerHTML=`
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
          <span class="font-label-md text-label-md" id="title-lang-label">${t===`english`?`EN`:t===`romaji`?`JP`:`日本`}</span>
        </button>
        <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors active:scale-95 duration-200">
          <span class="material-symbols-outlined text-sky-400">notifications</span>
        </button>
      </div>
    </header>
  `,document.getElementById(`title-toggle-btn`).addEventListener(`click`,()=>{let e=D(),t;t=e===`english`?`romaji`:`english`,O(t);let n=t===`english`?`EN`:t===`romaji`?`JP`:`日本`;document.getElementById(`title-lang-label`).textContent=n,window.dispatchEvent(new CustomEvent(`titleLanguageChanged`))}),ie(),window.addEventListener(`routechange`,ie)}function ie(){let e=a();document.querySelectorAll(`#desktop-nav .nav-link`).forEach(t=>{let n=t.getAttribute(`data-route`);e.startsWith(n)?t.className=`nav-link text-sky-400 font-bold px-3 py-1.5 rounded-lg font-['Be_Vietnam_Pro'] tracking-tight hover:bg-white/5 transition-colors`:t.className=`nav-link text-slate-400 px-3 py-1.5 rounded-lg font-['Be_Vietnam_Pro'] tracking-tight hover:bg-white/5 transition-colors`}),document.querySelectorAll(`#mobile-nav .mobile-nav-btn`).forEach(t=>{let n=t.getAttribute(`data-route`),r=t.querySelector(`.material-symbols-outlined`);t.querySelector(`.nav-label`),e.startsWith(n)?(t.className=`mobile-nav-btn flex flex-col items-center justify-center text-sky-400 bg-sky-400/10 rounded-lg py-1 px-3 active:scale-90 transition-transform duration-150`,r&&(r.style.fontVariationSettings=`'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24`)):(t.className=`mobile-nav-btn flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 active:scale-90 transition-transform duration-150`,r&&(r.style.fontVariationSettings=`'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`))})}function ae(){let e=document.getElementById(`bottom-nav-root`);e.innerHTML=`
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
  `}var oe=`https://graphql.anilist.co`,M=new Map,se=300*1e3;async function N(e,t={},n=null){if(n&&M.has(n)){let e=M.get(n);if(Date.now()-e.timestamp<se)return e.data;M.delete(n)}let r=await fetch(oe,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({query:e,variables:t})});if(r.status===429)return await new Promise(e=>setTimeout(e,2e3)),N(e,t,n);if(!r.ok)throw Error(`AniList API error: ${r.status}`);let i=await r.json();if(i.errors)throw Error(i.errors[0].message);return n&&M.set(n,{data:i.data,timestamp:Date.now()}),i.data}var P=`
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
`,ce=`
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
`;async function le(e=1,t=6){return(await N(`
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          ${P}
        }
      }
    }
  `,{page:e,perPage:t},`trending_${e}_${t}`)).Page}async function ue(e=1,t=10){let n=new Date,r=n.getMonth(),i;i=r>=0&&r<=2?`WINTER`:r>=3&&r<=5?`SPRING`:r>=6&&r<=8?`SUMMER`:`FALL`;let a=n.getFullYear();return(await N(`
    query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: POPULARITY_DESC, season: $season, seasonYear: $seasonYear, isAdult: false) {
          ${P}
        }
      }
    }
  `,{page:e,perPage:t,season:i,seasonYear:a},`season_${i}_${a}_${e}`)).Page}async function de(e=1,t=6){return(await N(`
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: POPULARITY_DESC, status: NOT_YET_RELEASED, isAdult: false) {
          ${P}
        }
      }
    }
  `,{page:e,perPage:t},`upcoming_${e}`)).Page}async function fe(e){return(await N(`
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${ce}
      }
    }
  `,{id:e},`detail_${e}`)).Media}async function pe({search:e=``,genres:t=[],sort:n=`TRENDING_DESC`,page:r=1,perPage:i=20}={}){let a={page:r,perPage:i,sort:[n]},o=``,s=``;return e&&e.trim()&&(a.search=e.trim(),s=`$search: String,`),t.length>0&&(a.genres=t,o=`$genres: [String],`),(await N(`
    query ($page: Int, $perPage: Int, ${s} ${o} $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, ${e?`search: $search,`:``} ${t.length?`genre_in: $genres,`:``} sort: $sort, isAdult: false) {
          ${P}
        }
      }
    }
  `,a,null)).Page}async function me(e,t=[],n=1,r=10){return(await N(`
    query ($page: Int, $perPage: Int, $genres: [String], $excludeIds: [Int]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, genre_in: $genres, id_not_in: $excludeIds, sort: SCORE_DESC, isAdult: false) {
          ${P}
        }
      }
    }
  `,{page:n,perPage:r,genres:e,excludeIds:t},`recs_${e.join(`,`)}_${n}`)).Page}function he(){let e=new Date,t=e.getMonth(),n,r;return t>=0&&t<=2?(n=`WINTER`,r=`Winter`):t>=3&&t<=5?(n=`SPRING`,r=`Spring`):t>=6&&t<=8?(n=`SUMMER`,r=`Summer`):(n=`FALL`,r=`Fall`),{season:n,seasonName:r,year:e.getFullYear()}}var ge=[`Action`,`Adventure`,`Comedy`,`Drama`,`Ecchi`,`Fantasy`,`Horror`,`Mahou Shoujo`,`Mecha`,`Music`,`Mystery`,`Psychological`,`Romance`,`Sci-Fi`,`Slice of Life`,`Sports`,`Supernatural`,`Thriller`],_e=[{label:`Trending`,value:`TRENDING_DESC`},{label:`Popularity`,value:`POPULARITY_DESC`},{label:`Score`,value:`SCORE_DESC`},{label:`Newest`,value:`START_DATE_DESC`},{label:`Title`,value:`TITLE_ENGLISH`}];async function F(e,t){return(await N(`
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
  `,{airingAt_greater:e,airingAt_lesser:t},`schedule_${e}_${t}`)).Page.airingSchedules||[]}function ve(e=new Date){let t=new Date(e),n=t.getDay(),r=t.getDate()-n+(n===0?-6:1);return t.setDate(r),t.setHours(0,0,0,0),t}var I=[`Monday`,`Tuesday`,`Wednesday`,`Thursday`,`Friday`,`Saturday`,`Sunday`],L=null;function R(e,t){z();let n=document.getElementById(`modal-root`),r=b(e.id),i=document.createElement(`div`);i.className=`fixed inset-0 z-[200] backdrop-enter`,i.id=`list-modal-backdrop`,i.addEventListener(`click`,z);let a=document.createElement(`div`);a.className=`fixed z-[201] bg-surface-container-high border border-white/10 rounded-xl shadow-2xl py-2 popup-enter min-w-[200px]`,a.id=`list-modal-dropdown`;let o=t.getBoundingClientRect(),s=o.left,c=o.bottom+8;s+220>window.innerWidth&&(s=window.innerWidth-228),c+250>window.innerHeight&&(c=o.top-250),s<8&&(s=8),c<8&&(c=8),a.style.left=`${s}px`,a.style.top=`${c}px`,a.innerHTML=`
    <div class="px-4 py-2 border-b border-white/5">
      <p class="font-label-lg text-label-lg text-on-surface truncate max-w-[180px]">${e.title?.english||e.title?.romaji||`Unknown`}</p>
      <p class="font-caption text-caption text-on-surface-variant">${r?`Currently: `+u[r]:`Not in your list`}</p>
    </div>
    <div class="py-1" id="list-options">
      ${Object.entries(l).map(([e,t])=>`
        <button class="list-option w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-white/5 transition-colors ${r===t?`text-primary`:`text-on-surface`}" data-category="${t}">
          <span class="material-symbols-outlined text-[20px]" ${r===t?`style="font-variation-settings: 'FILL' 1;"`:``}>${d[t]}</span>
          <span class="font-label-lg text-label-lg">${u[t]}</span>
          ${r===t?`<span class="material-symbols-outlined text-[16px] ml-auto">check</span>`:``}
        </button>
      `).join(``)}
    </div>
    ${r?`
      <div class="border-t border-white/5 py-1">
        <button class="remove-btn w-full px-4 py-2.5 text-left flex items-center gap-3 text-error hover:bg-error/5 transition-colors">
          <span class="material-symbols-outlined text-[20px]">delete</span>
          <span class="font-label-lg text-label-lg">Remove from List</span>
        </button>
      </div>
    `:``}
  `,a.querySelectorAll(`.list-option`).forEach(t=>{t.addEventListener(`click`,n=>{let r=t.getAttribute(`data-category`);g(e.id,e,r),ye(`Added to ${u[r]}`),z()})});let f=a.querySelector(`.remove-btn`);f&&f.addEventListener(`click`,()=>{_(e.id),ye(`Removed from list`),z()}),n.appendChild(i),n.appendChild(a),L={backdrop:i,dropdown:a}}function z(){L&&=(L.backdrop.remove(),L.dropdown.remove(),null)}function ye(e){let t=document.getElementById(`toast-msg`);t&&t.remove();let n=document.createElement(`div`);n.id=`toast-msg`,n.className=`fixed bottom-28 md:bottom-8 left-1/2 -translate-x-1/2 bg-surface-container-high text-on-surface border border-white/10 px-6 py-3 rounded-xl shadow-2xl font-label-lg text-label-lg z-[300] popup-enter flex items-center gap-2`,n.innerHTML=`
    <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
    ${e}
  `,document.body.appendChild(n),setTimeout(()=>{n.classList.add(`popup-exit`),setTimeout(()=>n.remove(),200)},2e3)}var B=null,V=null;function be(e,t){H();let n=document.getElementById(`popup-root`),r=t.getBoundingClientRect(),i=k(e.title);(e.genres||[]).join(`, `);let a=e.averageScore?(e.averageScore/10).toFixed(1):`N/A`,o=b(e.id),s=e.description||`No description available.`;s=s.replace(/<[^>]*>/g,``).replace(/\n/g,` `),s.length>280&&(s=s.substring(0,280).trim()+`...`);let c=document.createElement(`div`);c.className=`anime-popup popup-enter fixed bg-surface-container-high border border-white/10 rounded-xl shadow-2xl p-4 backdrop-blur-xl`,c.id=`anime-hover-popup`;let l=r.right+12,u=r.top;l+380>window.innerWidth&&(l=r.left-380-12),l<8&&(l=8),u+300>window.innerHeight&&(u=window.innerHeight-320),u<72&&(u=72),c.style.left=`${l}px`,c.style.top=`${u}px`,c.innerHTML=`
    <div class="space-y-3">
      <div>
        <h3 class="font-headline-md text-headline-md text-white leading-tight">${i}</h3>
        ${o?`
    <span class="inline-flex items-center gap-1 bg-primary/20 text-primary text-[11px] font-semibold px-2 py-0.5 rounded">
      <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
      In your list
    </span>
  `:``}
      </div>
      <div class="flex items-center gap-3 text-caption font-caption text-on-surface-variant">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px] star-gold" style="font-variation-settings: 'FILL' 1;">star</span>
          ${a}
        </span>
        <span>${e.episodes?e.episodes+` eps`:`Ongoing`}</span>
        <span>${e.format||``}</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        ${(e.genres||[]).slice(0,4).map(e=>`
          <span class="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold border border-primary/20">${e}</span>
        `).join(``)}
      </div>
      <p class="text-on-surface-variant text-[12px] leading-relaxed">${s}</p>
      <div class="flex gap-2 pt-1">
        <button class="popup-add-btn flex-1 bg-primary text-on-primary px-3 py-2 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-[18px]">add</span>
          ${o?`Change List`:`Add to List`}
        </button>
        <button class="popup-detail-btn bg-secondary-container text-on-secondary-container px-3 py-2 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
          <span class="material-symbols-outlined text-[18px]">info</span>
          Details
        </button>
      </div>
    </div>
  `,c.addEventListener(`mouseenter`,()=>{clearTimeout(V)}),c.addEventListener(`mouseleave`,()=>{H()}),c.querySelector(`.popup-add-btn`).addEventListener(`click`,t=>{t.stopPropagation(),R(e,t.currentTarget),H()}),c.querySelector(`.popup-detail-btn`).addEventListener(`click`,t=>{t.stopPropagation(),window.location.hash=`/anime/${e.id}`,H()}),n.appendChild(c),B=c}function H(){if(clearTimeout(V),B){B.classList.remove(`popup-enter`),B.classList.add(`popup-exit`);let e=B;setTimeout(()=>e.remove(),150),B=null}}function U(e,t={}){let n=document.createElement(`div`);n.className=`flex flex-col gap-2 group cursor-pointer anime-card`,n.setAttribute(`data-anime-id`,e.id);let r=k(e.title),i=e.coverImage?.extraLarge||e.coverImage?.large||e.coverImage?.medium||``,a=(e.genres||[]).slice(0,2).join(` • `),o=e.averageScore?(e.averageScore/10).toFixed(1):null,s=e.status,c=b(e.id),l=``;e.nextAiringEpisode?l=`<span class="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">EP ${e.nextAiringEpisode.episode}/${e.episodes||`?`}</span>`:s===`FINISHED`&&e.episodes?l=`<span class="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">${e.episodes} EPS</span>`:s===`RELEASING`?l=`<span class="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded">AIRING</span>`:s===`NOT_YET_RELEASED`&&(l=`<span class="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1 rounded">UPCOMING</span>`);let u=o?`<span class="bg-sky-500 text-white text-[10px] font-bold px-2 py-1 rounded">★ ${o}</span>`:``;n.innerHTML=`
    <div class="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-low shadow-lg group-hover:ring-2 ring-primary transition-all duration-300">
      <img 
        src="${i}" 
        alt="${r}" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute top-2 right-2 flex flex-col gap-1">
        ${l}
        ${u}
      </div>
      ${c?`
    <div class="absolute top-2 left-2">
      <span class="bg-primary/90 text-on-primary text-[10px] font-bold px-2 py-1 rounded">IN LIST</span>
    </div>
  `:``}
      <button class="add-btn absolute bottom-4 right-4 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-10" title="Add to list">
        <span class="material-symbols-outlined">add</span>
      </button>
      <div class="absolute inset-0 scrim-gradient opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
    <div class="px-1">
      <h3 class="font-label-lg text-label-lg text-on-surface truncate anime-title">${r}</h3>
      <p class="font-caption text-caption text-outline">${a||e.format||``}</p>
    </div>
  `,n.addEventListener(`click`,t=>{t.target.closest(`.add-btn`)||(window.location.hash=`/anime/${e.id}`)});let d=n.querySelector(`.add-btn`);d.addEventListener(`click`,t=>{t.stopPropagation(),R(e,d)});let f;return n.addEventListener(`mouseenter`,t=>{window.innerWidth<768||(f=setTimeout(()=>{be(e,n)},400))}),n.addEventListener(`mouseleave`,()=>{clearTimeout(f),H()}),n}function W(e=6,t=`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6`){let n=document.createElement(`div`);n.className=`grid ${t} gap-md`;for(let t=0;t<e;t++)n.innerHTML+=`
      <div class="flex flex-col gap-2">
        <div class="aspect-[2/3] rounded-xl skeleton"></div>
        <div class="h-3 w-3/4 skeleton rounded"></div>
        <div class="h-2.5 w-1/2 skeleton rounded"></div>
      </div>
    `;return n}function xe(){let e=document.createElement(`div`);return e.className=`grid grid-cols-1 md:grid-cols-12 gap-gutter`,e.innerHTML=`
    <div class="md:col-span-8 h-[400px] rounded-xl skeleton"></div>
    <div class="md:col-span-4 grid grid-rows-2 gap-gutter">
      <div class="rounded-xl skeleton"></div>
      <div class="rounded-xl skeleton"></div>
    </div>
  `,e}function Se(){let e=document.createElement(`div`);return e.innerHTML=`
    <div class="relative h-[300px] md:h-[400px] w-full skeleton mb-8"></div>
    <div class="max-w-[1200px] mx-auto px-md -mt-32 relative z-10">
      <div class="flex flex-col md:flex-row gap-8">
        <div class="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
          <div class="aspect-[2/3] rounded-xl skeleton"></div>
          <div class="mt-6 h-12 skeleton rounded-lg"></div>
        </div>
        <div class="flex-grow space-y-4">
          <div class="flex gap-2">
            <div class="h-6 w-20 skeleton rounded-full"></div>
            <div class="h-6 w-20 skeleton rounded-full"></div>
          </div>
          <div class="h-10 w-3/4 skeleton rounded"></div>
          <div class="h-4 w-full skeleton rounded"></div>
          <div class="h-4 w-5/6 skeleton rounded"></div>
          <div class="h-4 w-2/3 skeleton rounded"></div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div class="h-20 skeleton rounded-xl"></div>
            <div class="h-20 skeleton rounded-xl"></div>
            <div class="h-20 skeleton rounded-xl"></div>
            <div class="h-20 skeleton rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  `,e}function G(e=20){return W(e,`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`)}async function Ce(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-8 space-y-xl">
      <div id="hero-section">${xe().outerHTML}</div>
      <section class="space-y-md">
        <div class="h-8 w-48 skeleton rounded"></div>
        <div id="trending-section">${W(6).outerHTML}</div>
      </section>
    </div>
  `;try{let t=ve(),n=new Date(t);n.setDate(n.getDate()+7);let r=Math.floor(t.getTime()/1e3),i=Math.floor(n.getTime()/1e3),[a,o,s,c]=await Promise.all([le(1,12),ue(1,10),de(1,6),F(r,i).catch(()=>[])]),l=a.media||[],u=o.media||[];s.media;let d=he(),f=x(),p=C(),m=[],h=S(3);if(h.length>0){let e=ee();try{m=(await me(h.map(e=>e.genre),e,1,6)).media||[]}catch(e){console.warn(`Failed to fetch recommendations:`,e)}}let g=l[0],_=g?k(g.title):``,v=g?.description?.replace(/<[^>]*>/g,``).substring(0,200)+`...`||``;e.innerHTML=`
      <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-8 space-y-xl page-enter">
        
        <!-- Hero Section -->
        <section class="grid grid-cols-1 md:grid-cols-12 gap-gutter" id="hero-bento">
          <div class="md:col-span-8 relative h-[400px] rounded-xl overflow-hidden group cursor-pointer" id="hero-featured">
            <img 
              src="${g?.bannerImage||g?.coverImage?.extraLarge||``}" 
              alt="${_}" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-lg space-y-sm">
              <div class="flex gap-2">
                <span class="bg-primary text-on-primary font-label-md text-label-md px-2 py-1 rounded">TRENDING #1</span>
                ${g?.nextAiringEpisode?`<span class="bg-white/10 backdrop-blur-md text-white font-label-md text-label-md px-2 py-1 rounded">EP ${g.nextAiringEpisode.episode}</span>`:``}
              </div>
              <h1 class="font-headline-xl text-headline-xl text-white">${_}</h1>
              <p class="text-on-surface-variant font-body-md text-body-md max-w-xl line-clamp-2">${v}</p>
              <div class="flex gap-3 pt-2 flex-wrap">
                ${(g?.genres||[]).slice(0,3).map(e=>`
                  <span class="bg-white/10 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-1 rounded">${e}</span>
                `).join(``)}
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
                <h3 class="font-headline-md text-headline-md text-primary">${d.seasonName} ${d.year}</h3>
                <p class="text-on-surface-variant font-body-md text-body-md">Your progress this season</p>
              </div>
              <div class="space-y-3 mt-3">
                <div class="flex justify-between font-label-md text-label-md">
                  <span>Anime in List</span>
                  <span class="text-sky-400">${f.total}</span>
                </div>
                <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-primary shadow-[0_0_8px_rgba(132,207,255,0.5)]" style="width: ${Math.min(f.total*5,100)}%"></div>
                </div>
                <div class="flex justify-between font-label-md text-label-md">
                  <span>Completed</span>
                  <span class="text-sky-400">${f.completed}</span>
                </div>
                <div class="flex justify-between font-label-md text-label-md">
                  <span>Episodes Watched</span>
                  <span class="text-sky-400">${p}</span>
                </div>
              </div>
            </div>
            <div class="bg-surface-container-high rounded-xl p-md relative overflow-hidden group border border-white/5 cursor-pointer" id="quick-resume-card">
              <div class="relative z-10">
                <h3 class="font-headline-md text-headline-md text-white">Watching</h3>
                <p class="text-on-surface-variant font-body-md text-body-md">${f.watching} anime in progress</p>
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
        ${m.length>0?`
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
        `:``}
      </div>
    `;let y=document.getElementById(`trending-grid`);y&&l.slice(0,6).forEach(e=>{y.appendChild(U(e))});let b=document.getElementById(`seasonal-scroll`);b&&u.forEach(e=>{let t=k(e.title),n=e.coverImage?.large||e.coverImage?.medium||``,r=(e.genres||[]).slice(0,2).join(` • `),i=e.averageScore?(e.averageScore/10).toFixed(2):`N/A`,a=document.createElement(`div`);a.className=`flex-shrink-0 w-[300px] bg-surface-container rounded-xl overflow-hidden border border-white/5 flex snap-start hover:bg-surface-variant transition-colors group cursor-pointer`,a.innerHTML=`
          <div class="w-24 h-full relative flex-shrink-0">
            <img src="${n}" alt="${t}" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <div class="p-md flex flex-col justify-center flex-1 min-w-0">
            <h3 class="font-label-lg text-label-lg text-white group-hover:text-primary transition-colors truncate">${t}</h3>
            <p class="font-caption text-caption text-on-surface-variant mb-2">${r}</p>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[14px] star-gold" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="text-caption font-caption">${i}</span>
            </div>
          </div>
        `,a.addEventListener(`click`,()=>{window.location.hash=`/anime/${e.id}`}),b.appendChild(a)});let w=document.getElementById(`schedule-scroll`);if(w){let e=new Date,n=e.getDay()===0?6:e.getDay()-1,r={};for(let e=0;e<7;e++)r[e]=[];for(let e of c){let t=new Date(e.airingAt*1e3).getDay();t=t===0?6:t-1,r[t]&&r[t].push(e)}I.forEach((e,i)=>{let a=new Date(t);a.setDate(a.getDate()+i);let o=a.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`}),s=i===n,c=r[i]||[],l=document.createElement(`section`);l.className=`flex-shrink-0 w-[260px] md:w-[280px] snap-center rounded-xl p-4 border transition-all ${s?`bg-surface-container border-primary/30 ring-1 ring-primary/20`:`bg-surface-container border-white/5`}`;let u=`
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-headline-md text-[15px] font-semibold ${s?`text-primary`:`text-on-surface-variant`}">${e}</h3>
            ${s?`<span class="font-label-md text-label-md bg-primary text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold">TODAY</span>`:`<span class="font-label-md text-label-md text-on-surface-variant/60">${o}</span>`}
          </div>
        `,d=``;d=c.length===0?`
            <div class="text-center py-6 text-on-surface-variant/30">
              <span class="material-symbols-outlined text-[24px] mb-1">event_busy</span>
              <p class="font-caption text-caption">No releases</p>
            </div>
          `:c.slice(0,4).map(e=>{let t=e.media;if(!t)return``;let n=k(t.title),r=t.coverImage?.medium||``,i=new Date(e.airingAt*1e3).toLocaleTimeString(`en-US`,{hour:`2-digit`,minute:`2-digit`,hour12:!1})+` JST`;return`
              <div class="schedule-card flex gap-3 p-2.5 bg-surface-container-low rounded-lg border border-white/5 hover:bg-surface-variant transition-all cursor-pointer active:scale-[0.98]" data-anime-id="${t.id}">
                <div class="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  ${r?`<img src="${r}" alt="${n}" class="w-full h-full object-cover" loading="lazy" />`:`<div class="w-full h-full bg-surface-container-high"></div>`}
                </div>
                <div class="flex flex-col justify-center flex-1 min-w-0">
                  <span class="font-label-md text-label-md text-primary mb-0.5 text-[10px]">${i}</span>
                  <h4 class="font-label-lg text-[12px] font-semibold text-on-surface leading-tight truncate">${n}</h4>
                  <span class="font-label-md text-label-md text-on-surface-variant/60 text-[10px] mt-0.5">Episode ${e.episode}</span>
                </div>
              </div>
            `}).join(``),l.innerHTML=u+`<div class="flex flex-col gap-2">${d}</div>`,l.querySelectorAll(`.schedule-card`).forEach(e=>{e.addEventListener(`click`,()=>{window.location.hash=`/anime/${e.dataset.animeId}`})}),w.appendChild(l)});let i=w.children[n];i&&setTimeout(()=>{i.scrollIntoView({behavior:`smooth`,block:`nearest`,inline:`center`})},100)}let T=document.getElementById(`recommended-grid`);T&&m.length>0&&m.forEach(e=>{T.appendChild(U(e))}),g&&(document.getElementById(`hero-featured`)?.addEventListener(`click`,e=>{e.target.closest(`button`)||(window.location.hash=`/anime/${g.id}`)}),document.getElementById(`hero-detail-btn`)?.addEventListener(`click`,()=>{window.location.hash=`/anime/${g.id}`}),document.getElementById(`hero-add-btn`)?.addEventListener(`click`,e=>{R(g,e.currentTarget)})),document.getElementById(`quick-resume-card`)?.addEventListener(`click`,()=>{window.location.hash=`/library`})}catch(t){console.error(`Home page error:`,t),e.innerHTML=`
      <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-20 text-center">
        <span class="material-symbols-outlined text-[64px] text-error mb-4">cloud_off</span>
        <h1 class="font-headline-lg text-headline-lg text-on-surface mb-2">Failed to Load</h1>
        <p class="text-on-surface-variant font-body-md mb-6">${t.message}</p>
        <button onclick="location.reload()" class="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">
          Retry
        </button>
      </div>
    `}}function we(e,t){let n=document.createElement(`div`);if(n.className=`flex flex-wrap items-center justify-center gap-3 mt-10 mb-6`,!e||e.lastPage<=1)return n;let{currentPage:r,lastPage:i}=e;n.innerHTML=`
    <button class="prev-btn flex items-center gap-1 px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${r<=1?`bg-surface-container text-outline cursor-not-allowed opacity-50`:`bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest active:scale-95`}" ${r<=1?`disabled`:``}>
      <span class="material-symbols-outlined text-[18px]">chevron_left</span>
      Prev
    </button>

    <div class="flex items-center gap-2">
      <span class="text-on-surface-variant font-label-md">Page</span>
      <input 
        type="number" 
        class="page-input w-16 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1.5 text-center text-on-surface font-label-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value="${r}"
        min="1"
        max="${i}"
      />
      <span class="text-on-surface-variant font-label-md">of ${i}</span>
    </div>

    <button class="next-btn flex items-center gap-1 px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${r>=i?`bg-surface-container text-outline cursor-not-allowed opacity-50`:`bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest active:scale-95`}" ${r>=i?`disabled`:``}>
      Next
      <span class="material-symbols-outlined text-[18px]">chevron_right</span>
    </button>
  `;let a=n.querySelector(`.prev-btn`);r>1&&a.addEventListener(`click`,()=>t(r-1));let o=n.querySelector(`.next-btn`);r<i&&o.addEventListener(`click`,()=>t(r+1));let s=n.querySelector(`.page-input`),c=()=>{let e=parseInt(s.value);(isNaN(e)||e<1)&&(e=1),e>i&&(e=i),e===r?s.value=r:t(e)};return s.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),c())}),s.addEventListener(`blur`,c),n}var K={search:``,genres:[],sort:`TRENDING_DESC`,page:1};async function Te(){let e=document.getElementById(`app`);e.innerHTML=`
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
            value="${K.search}"
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
              ${_e.map(e=>`
                <option value="${e.value}" ${K.sort===e.value?`selected`:``}>${e.label}</option>
              `).join(``)}
            </select>
          </div>
        </div>
      </section>

      <!-- Results Grid -->
      <section id="search-results">
        ${G(20).outerHTML}
      </section>

      <!-- Pagination -->
      <div id="pagination-container"></div>
    </div>
  `;let t=document.getElementById(`genre-pills`);ge.forEach(e=>{let n=document.createElement(`button`);n.className=`font-label-lg text-label-lg px-4 py-2 rounded-full transition-colors ${K.genres.includes(e)?`bg-primary text-on-primary`:`bg-secondary-container text-on-secondary-container hover:bg-surface-container-high`}`,n.textContent=e,n.addEventListener(`click`,()=>{K.genres.includes(e)?K.genres=K.genres.filter(t=>t!==e):K.genres.push(e),K.page=1,Ee(),q()}),t.appendChild(n)});let n;return document.getElementById(`search-input`).addEventListener(`input`,e=>{clearTimeout(n),n=setTimeout(()=>{K.search=e.target.value,K.page=1,q()},400)}),document.getElementById(`sort-select`).addEventListener(`change`,e=>{K.sort=e.target.value,K.page=1,q()}),q(),()=>{}}function Ee(){document.querySelectorAll(`#genre-pills button`).forEach(e=>{let t=e.textContent;e.className=`font-label-lg text-label-lg px-4 py-2 rounded-full transition-colors ${K.genres.includes(t)?`bg-primary text-on-primary`:`bg-secondary-container text-on-secondary-container hover:bg-surface-container-high`}`})}async function q(){let e=document.getElementById(`search-results`),t=document.getElementById(`pagination-container`),n=document.getElementById(`results-count`);e.innerHTML=G(20).outerHTML,t&&(t.innerHTML=``);try{let r=await pe({search:K.search,genres:K.genres,sort:K.sort,page:K.page,perPage:20}),i=r.media||[],a=r.pageInfo;if(n&&(n.textContent=`Showing ${i.length} of ${a.total||0} Results`),e.innerHTML=``,i.length===0){e.innerHTML=`
        <div class="text-center py-16">
          <span class="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">search_off</span>
          <h3 class="font-headline-md text-headline-md text-on-surface mb-2">No results found</h3>
          <p class="text-on-surface-variant font-body-md">Try different search terms or filters</p>
        </div>
      `;return}let o=document.createElement(`div`);if(o.className=`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md`,i.forEach(e=>{o.appendChild(U(e))}),e.appendChild(o),t&&a){let e=we(a,e=>{K.page=e,q(),document.getElementById(`search-results`)?.scrollIntoView({behavior:`smooth`,block:`start`})});t.innerHTML=``,t.appendChild(e)}}catch(t){console.error(`Search error:`,t),e.innerHTML=`
      <div class="text-center py-16">
        <span class="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h3 class="font-headline-md text-headline-md text-on-surface mb-2">Search Failed</h3>
        <p class="text-on-surface-variant font-body-md">${t.message}</p>
        <button onclick="location.reload()" class="mt-4 bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">Retry</button>
      </div>
    `}}var J=l.WATCHING,Y=null;async function De(){let e=document.getElementById(`app`);X(e),Y=te(()=>X(e));let t=()=>X(e);return window.addEventListener(`titleLanguageChanged`,t),()=>{Y&&Y(),window.removeEventListener(`titleLanguageChanged`,t)}}function X(e){let t=x(),n=y(J);e.innerHTML=`
    <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-8 pb-8 page-enter">
      <h1 class="font-headline-xl text-headline-xl text-on-background mb-6">My Library</h1>

      <!-- Tabs -->
      <div class="flex gap-1 bg-surface-container rounded-xl p-1 mb-8 overflow-x-auto hide-scrollbar">
        ${Object.entries(l).map(([e,n])=>{let r=J===n,i=t[n]||0;return`
            <button class="library-tab flex-1 min-w-[120px] px-4 py-3 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all whitespace-nowrap ${r?`bg-primary text-on-primary shadow-lg`:`text-on-surface-variant hover:bg-white/5`}" data-tab="${n}">
              <span class="material-symbols-outlined text-[18px]" ${r?`style="font-variation-settings: 'FILL' 1;"`:``}>${d[n]}</span>
              ${u[n]}
              ${i>0?`<span class="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">${i}</span>`:``}
            </button>
          `}).join(``)}
      </div>

      <!-- List Content -->
      <div id="library-content">
        ${n.length===0?ke():Oe(n)}
      </div>
    </div>
  `,document.querySelectorAll(`.library-tab`).forEach(t=>{t.addEventListener(`click`,()=>{J=t.getAttribute(`data-tab`),X(e)})}),Ae()}function Oe(e){return`
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-md">
      ${e.map(e=>{let t=k(e.title),n=e.coverImage?.extraLarge||e.coverImage?.large||e.coverImage?.medium||``,r=(e.genres||[]).slice(0,2).join(` • `),i=e.averageScore?(e.averageScore/10).toFixed(1):null;return`
          <div class="flex flex-col gap-2 group cursor-pointer library-card" data-anime-id="${e.id}">
            <div class="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-low shadow-lg group-hover:ring-2 ring-primary transition-all duration-300">
              <img 
                src="${n}" 
                alt="${t}" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              ${i?`
                <div class="absolute top-2 right-2">
                  <span class="bg-sky-500 text-white text-[10px] font-bold px-2 py-1 rounded">★ ${i}</span>
                </div>
              `:``}
              <!-- Action buttons on hover -->
              <div class="absolute inset-x-0 bottom-0 p-2 flex gap-1 justify-end opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <button class="move-btn w-8 h-8 bg-surface-container-high/90 backdrop-blur-md text-on-surface rounded-lg flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors" title="Move to another list">
                  <span class="material-symbols-outlined text-[18px]">swap_horiz</span>
                </button>
                <button class="remove-btn w-8 h-8 bg-surface-container-high/90 backdrop-blur-md text-error rounded-lg flex items-center justify-center hover:bg-error hover:text-on-error transition-colors" title="Remove from list">
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              <div class="absolute inset-0 scrim-gradient opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
            <div class="px-1">
              <h3 class="font-label-lg text-label-lg text-on-surface truncate">${t}</h3>
              <p class="font-caption text-caption text-outline">${r}</p>
            </div>
          </div>
        `}).join(``)}
    </div>
  `}function ke(){let e={[l.WATCHING]:{icon:`play_circle`,text:`No anime currently watching`,sub:`Start watching something from the search page!`},[l.COMPLETED]:{icon:`check_circle`,text:`No completed anime yet`,sub:`Finish watching some anime to see them here.`},[l.PLAN_TO_WATCH]:{icon:`bookmark`,text:`Nothing planned to watch`,sub:`Browse and add anime you want to watch later.`},[l.ON_HOLD]:{icon:`pause_circle`,text:`Nothing on hold`,sub:`Anime you pause will appear here.`}}[J];return`
    <div class="text-center py-20">
      <span class="material-symbols-outlined text-[80px] text-on-surface-variant/30 mb-4">${e.icon}</span>
      <h3 class="font-headline-md text-headline-md text-on-surface mb-2">${e.text}</h3>
      <p class="text-on-surface-variant font-body-md mb-6">${e.sub}</p>
      <a href="#/search" class="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label-lg text-label-lg active:scale-95 transition-transform">
        <span class="material-symbols-outlined text-[18px]">search</span>
        Browse Anime
      </a>
    </div>
  `}function Ae(){document.querySelectorAll(`.library-card`).forEach(e=>{e.addEventListener(`click`,t=>{if(t.target.closest(`.move-btn`)||t.target.closest(`.remove-btn`))return;let n=e.getAttribute(`data-anime-id`);window.location.hash=`/anime/${n}`})}),document.querySelectorAll(`.move-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.closest(`.library-card`);je(parseInt(n.getAttribute(`data-anime-id`)),e)})}),document.querySelectorAll(`.remove-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.closest(`.library-card`);_(parseInt(n.getAttribute(`data-anime-id`)))})})}function je(e,t){document.getElementById(`move-dropdown`)?.remove();let n=t.getBoundingClientRect(),r=document.createElement(`div`);r.id=`move-dropdown`,r.className=`fixed z-[200] bg-surface-container-high border border-white/10 rounded-xl shadow-2xl py-1 popup-enter min-w-[160px]`;let i=n.left,a=n.bottom+4;i+170>window.innerWidth&&(i=window.innerWidth-178),a+200>window.innerHeight&&(a=n.top-200),r.style.left=`${i}px`,r.style.top=`${a}px`,r.innerHTML=Object.entries(l).filter(([e,t])=>t!==J).map(([e,t])=>`
    <button class="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-on-surface" data-category="${t}">
      <span class="material-symbols-outlined text-[18px]">${d[t]}</span>
      <span class="font-label-lg text-label-lg">${u[t]}</span>
    </button>
  `).join(``),r.querySelectorAll(`button`).forEach(t=>{t.addEventListener(`click`,()=>{v(e,t.getAttribute(`data-category`)),r.remove(),o.remove()})});let o=document.createElement(`div`);o.className=`fixed inset-0 z-[199]`,o.addEventListener(`click`,()=>{r.remove(),o.remove()}),document.body.appendChild(o),document.body.appendChild(r)}async function Me(e){let t=document.getElementById(`app`),n=parseInt(e.id);t.innerHTML=``,t.appendChild(Se());try{let e=await fe(n);if(!e)throw Error(`Anime not found`);let r=k(e.title),i=e.title?.native||``,a=e.title?.romaji===r?e.title?.english||``:e.title?.romaji,o=e.bannerImage||e.coverImage?.extraLarge||``,s=e.coverImage?.extraLarge||e.coverImage?.large||``,c=e.description?.replace(/<[^>]*>/g,``)||`No description available.`,l=e.genres||[],d=e.averageScore?e.averageScore+`%`:`N/A`,f=e.meanScore?(e.meanScore/10).toFixed(1):`N/A`,p=e.popularity?`#`+e.popularity.toLocaleString():`N/A`,m=e.favourites?e.favourites.toLocaleString():`0`,h=e.status?.replace(/_/g,` `)||`Unknown`,g=e.format?.replace(/_/g,` `)||`Unknown`,_=e.episodes||`?`,v=e.duration?e.duration+` min`:``,y=e.season?`${e.season.charAt(0)}${e.season.slice(1).toLowerCase()} ${e.seasonYear||``}`:``,ee=e.studios?.nodes?.find(e=>e.isAnimationStudio)?.name||e.studios?.nodes?.[0]?.name||`Unknown`,x=e.source?.replace(/_/g,` `)||``,S=b(n),C=(e.characters?.edges||[]).slice(0,8),w=(e.recommendations?.nodes||[]).filter(e=>e.mediaRecommendation).map(e=>e.mediaRecommendation).slice(0,6),T=(e.relations?.edges||[]).filter(e=>e.node?.type===`ANIME`).slice(0,4),E=e.startDate?.year?`${e.startDate.month||`?`}/${e.startDate.day||`?`}/${e.startDate.year}`:``,D=e.endDate?.year?`${e.endDate.month||`?`}/${e.endDate.day||`?`}/${e.endDate.year}`:``;t.innerHTML=`
      <div class="page-enter">
        <!-- Banner -->
        <div class="relative h-[250px] md:h-[350px] w-full overflow-hidden">
          ${o?`<img src="${o}" alt="" class="w-full h-full object-cover" />`:`<div class="w-full h-full bg-surface-container"></div>`}
          <div class="absolute inset-0 scrim-bottom"></div>
        </div>

        <div class="max-w-[1200px] mx-auto px-4 md:px-lg -mt-32 relative z-10">
          <div class="flex flex-col md:flex-row gap-8">
            
            <!-- Left Sidebar: Poster + Actions + Info -->
            <div class="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
              <div class="rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3]">
                <img src="${s}" alt="${r}" class="w-full h-full object-cover" />
              </div>

              <!-- Action Buttons -->
              <div class="mt-6 flex flex-col gap-3">
                <button id="detail-add-btn" class="bg-primary text-on-primary font-label-lg py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">
                    ${S?`check_circle`:`add`}
                  </span>
                  ${S?u[S]:`Add to List`}
                </button>
              </div>

              <!-- Info Sidebar -->
              <div class="mt-6 space-y-4 bg-surface-container/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Status</span>
                  <span class="text-primary font-label-lg">${h}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Format</span>
                  <span class="text-on-surface font-label-lg">${g} (${_} eps${v?` × `+v:``})</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Studio</span>
                  <span class="text-on-surface font-label-lg">${ee}</span>
                </div>
                ${y?`
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Season</span>
                  <span class="text-on-surface font-label-lg">${y}</span>
                </div>
                `:``}
                ${x?`
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Source</span>
                  <span class="text-on-surface font-label-lg">${x}</span>
                </div>
                `:``}
                ${E?`
                <div class="flex flex-col">
                  <span class="text-on-surface-variant font-label-md">Aired</span>
                  <span class="text-on-surface font-label-lg">${E}${D?` to `+D:``}</span>
                </div>
                `:``}
              </div>
            </div>

            <!-- Main Content -->
            <div class="flex-grow min-w-0">
              <!-- Genre Tags -->
              <div class="flex flex-wrap items-center gap-2 mb-3">
                ${l.map(e=>`
                  <a href="#/search" class="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md border border-primary/20 hover:bg-primary/20 transition-colors genre-link" data-genre="${e}">${e}</a>
                `).join(``)}
              </div>

              <!-- Title -->
              <h1 class="text-headline-xl font-headline-xl text-on-background">${r}</h1>
              ${a?`<p class="text-on-surface-variant font-body-md mt-1">${a}</p>`:``}
              ${i&&i!==r?`<p class="text-on-surface-variant/50 font-body-md">${i}</p>`:``}

              <!-- Description -->
              <p class="text-on-surface-variant font-body-lg max-w-2xl mt-4 leading-relaxed">${c}</p>

              <!-- Stats Cards -->
              <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col items-center">
                  <span class="text-headline-md text-primary font-headline-md">${d}</span>
                  <span class="text-on-surface-variant font-label-md mt-1">Average Score</span>
                </div>
                <div class="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col items-center">
                  <span class="text-headline-md text-on-surface font-headline-md">${p}</span>
                  <span class="text-on-surface-variant font-label-md mt-1">Popularity</span>
                </div>
                <div class="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col items-center">
                  <span class="text-headline-md text-on-surface font-headline-md">${m}</span>
                  <span class="text-on-surface-variant font-label-md mt-1">Favourites</span>
                </div>
                <div class="bg-surface-container p-4 rounded-xl border border-white/5 flex flex-col items-center">
                  <span class="text-headline-md text-on-surface font-headline-md">${f}</span>
                  <span class="text-on-surface-variant font-label-md mt-1">Mean Score</span>
                </div>
              </div>

              <!-- Characters -->
              ${C.length>0?`
              <div class="mt-12">
                <h3 class="text-headline-md font-headline-md text-on-background mb-6">Characters</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${C.map(e=>{let t=e.node,n=e.voiceActors?.[0],r=t?.image?.medium||``,i=t?.name?.full||`Unknown`,a=e.role?.charAt(0)+(e.role?.slice(1).toLowerCase()||``),o=n?.name?.full||``;return`
                      <div class="bg-surface-container-high rounded-lg overflow-hidden flex border border-white/5 hover:border-primary/30 transition-colors">
                        ${r?`<img src="${r}" alt="${i}" class="w-16 h-16 object-cover flex-shrink-0" loading="lazy" />`:`<div class="w-16 h-16 bg-surface-container flex-shrink-0"></div>`}
                        <div class="p-3 flex justify-between items-center w-full min-w-0">
                          <div class="min-w-0">
                            <p class="text-on-surface font-label-lg truncate">${i}</p>
                            <p class="text-on-surface-variant font-caption">${a}</p>
                          </div>
                          ${o?`
                          <div class="text-right min-w-0 ml-2">
                            <p class="text-on-surface font-label-lg truncate">${o}</p>
                            <p class="text-on-surface-variant font-caption">Japanese</p>
                          </div>
                          `:``}
                        </div>
                      </div>
                    `}).join(``)}
                </div>
              </div>
              `:``}

              <!-- Relations -->
              ${T.length>0?`
              <div class="mt-12">
                <h3 class="text-headline-md font-headline-md text-on-background mb-6">Relations</h3>
                <div class="flex gap-md overflow-x-auto pb-4 custom-scrollbar">
                  ${T.map(e=>{let t=e.node,n=k(t.title),r=t.coverImage?.large||``,i=e.relationType?.replace(/_/g,` `)||``;return`
                      <div class="flex-shrink-0 w-[200px] cursor-pointer group relation-card" data-anime-id="${t.id}">
                        <div class="aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-low shadow-lg mb-2 group-hover:ring-2 ring-primary transition-all">
                          <img src="${r}" alt="${n}" class="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <p class="text-primary font-label-md text-label-md uppercase tracking-wider">${i}</p>
                        <h4 class="font-label-lg text-label-lg text-on-surface truncate">${n}</h4>
                      </div>
                    `}).join(``)}
                </div>
              </div>
              `:``}

              <!-- Recommendations -->
              ${w.length>0?`
              <div class="mt-12">
                <h3 class="text-headline-md font-headline-md text-on-background mb-6">Recommendations</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-md" id="detail-recs-grid"></div>
              </div>
              `:``}
            </div>
          </div>
        </div>
      </div>
    `;let O=document.getElementById(`detail-recs-grid`);O&&w.forEach(e=>{O.appendChild(U(e))}),document.getElementById(`detail-add-btn`)?.addEventListener(`click`,t=>{R(e,t.currentTarget)}),document.querySelectorAll(`.genre-link`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let n=e.getAttribute(`data-genre`);window.location.hash=`/search`,setTimeout(()=>{let e=document.getElementById(`search-input`);e&&(e.value=``),window.dispatchEvent(new CustomEvent(`setSearchGenre`,{detail:{genre:n}}))},100)})}),document.querySelectorAll(`.relation-card`).forEach(e=>{e.addEventListener(`click`,()=>{window.location.hash=`/anime/${e.getAttribute(`data-anime-id`)}`})})}catch(e){console.error(`Detail page error:`,e),t.innerHTML=`
      <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-20 text-center">
        <span class="material-symbols-outlined text-[64px] text-error mb-4">error</span>
        <h1 class="font-headline-lg text-headline-lg text-on-surface mb-2">Failed to Load Anime</h1>
        <p class="text-on-surface-variant font-body-md mb-6">${e.message}</p>
        <button onclick="history.back()" class="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg">Go Back</button>
      </div>
    `}}var Z=null;async function Ne(){let e=document.getElementById(`app`);return Pe(e),Z=te(()=>Pe(e)),()=>{Z&&Z()}}function Pe(e){let t=x(),n=C(),r=S(8),i=w(8),a=n*24,o=Math.floor(a/60),s=a%60,c=r.length>0?r[0].count:1;e.innerHTML=`
    <div class="max-w-[1200px] mx-auto px-4 md:px-lg pt-8 pb-8 page-enter">
      
      <!-- Profile Header -->
      <div class="bg-surface-container rounded-xl border border-white/5 p-8 mb-8">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-[48px] text-primary">person</span>
          </div>
          <div class="text-center md:text-left">
            <h1 class="font-headline-xl text-headline-xl text-on-background">My Profile</h1>
            <p class="text-on-surface-variant font-body-lg mt-1">Your anime tracking overview</p>
          </div>
          <div class="md:ml-auto">
            <button id="export-btn" class="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-lg text-label-lg flex items-center gap-2 hover:bg-surface-variant transition-colors border border-white/5">
              <span class="material-symbols-outlined text-[18px]">download</span>
              Export Data
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-surface-container p-6 rounded-xl border border-white/5 text-center">
          <span class="text-headline-lg text-primary font-headline-lg">${t.total}</span>
          <p class="text-on-surface-variant font-label-md mt-2">Total Anime</p>
        </div>
        <div class="bg-surface-container p-6 rounded-xl border border-white/5 text-center">
          <span class="text-headline-lg text-on-surface font-headline-lg">${n}</span>
          <p class="text-on-surface-variant font-label-md mt-2">Episodes Watched</p>
        </div>
        <div class="bg-surface-container p-6 rounded-xl border border-white/5 text-center">
          <span class="text-headline-lg text-on-surface font-headline-lg">${o}h ${s}m</span>
          <p class="text-on-surface-variant font-label-md mt-2">Est. Watch Time</p>
        </div>
        <div class="bg-surface-container p-6 rounded-xl border border-white/5 text-center">
          <span class="text-headline-lg text-on-surface font-headline-lg">${t.completed}</span>
          <p class="text-on-surface-variant font-label-md mt-2">Completed</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- Watchlist Breakdown -->
        <div class="bg-surface-container rounded-xl border border-white/5 p-6">
          <h2 class="font-headline-md text-headline-md text-on-background mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">pie_chart</span>
            Watchlist Breakdown
          </h2>
          <div class="space-y-4">
            ${Object.entries(l).map(([e,n])=>{let r=t[n]||0,i=t.total>0?Math.round(r/t.total*100):0;return`
                <div class="flex items-center gap-4">
                  <span class="material-symbols-outlined text-[20px] text-primary" style="font-variation-settings: 'FILL' 1;">${d[n]}</span>
                  <div class="flex-1">
                    <div class="flex justify-between mb-1">
                      <span class="font-label-lg text-label-lg text-on-surface">${u[n]}</span>
                      <span class="font-label-md text-label-md text-on-surface-variant">${r} (${i}%)</span>
                    </div>
                    <div class="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-primary rounded-full transition-all duration-500" style="width: ${i}%"></div>
                    </div>
                  </div>
                </div>
              `}).join(``)}
          </div>
        </div>

        <!-- Favorite Genres -->
        <div class="bg-surface-container rounded-xl border border-white/5 p-6">
          <h2 class="font-headline-md text-headline-md text-on-background mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">auto_awesome</span>
            Favorite Genres
          </h2>
          ${r.length>0?`
            <div class="space-y-3">
              ${r.map((e,t)=>{let n=Math.round(e.count/c*100);return`
                  <div class="flex items-center gap-3">
                    <span class="font-label-md text-label-md text-on-surface-variant w-4 text-right">${t+1}</span>
                    <div class="flex-1">
                      <div class="flex justify-between mb-1">
                        <span class="font-label-lg text-label-lg text-on-surface">${e.genre}</span>
                        <span class="font-label-md text-label-md text-on-surface-variant">${e.count} anime</span>
                      </div>
                      <div class="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" style="width: ${n}%; background: linear-gradient(90deg, #3db4f2, #84cfff);"></div>
                      </div>
                    </div>
                  </div>
                `}).join(``)}
            </div>
          `:`
            <div class="text-center py-8">
              <span class="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-2">category</span>
              <p class="text-on-surface-variant font-body-md">Add anime to your list to see genre stats</p>
            </div>
          `}
        </div>
      </div>

      <!-- Recently Added -->
      <div class="mt-8 bg-surface-container rounded-xl border border-white/5 p-6">
        <h2 class="font-headline-md text-headline-md text-on-background mb-6 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">history</span>
          Recently Added
        </h2>
        ${i.length>0?`
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${i.map(e=>{let t=k(e.title),n=e.coverImage?.medium||e.coverImage?.large||``,r=u[e.listCategory]||``,i=e.addedAt?new Date(e.addedAt).toLocaleDateString():``;return`
                <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer recent-card" data-anime-id="${e.id}">
                  <img src="${n}" alt="${t}" class="w-12 h-16 rounded object-cover flex-shrink-0" loading="lazy" />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-label-lg text-label-lg text-on-surface truncate">${t}</h4>
                    <p class="font-caption text-caption text-on-surface-variant">${r} • ${i}</p>
                  </div>
                </div>
              `}).join(``)}
          </div>
        `:`
          <div class="text-center py-8">
            <span class="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-2">playlist_add</span>
            <p class="text-on-surface-variant font-body-md">No anime added yet. Start browsing!</p>
          </div>
        `}
      </div>
    </div>
  `,document.querySelectorAll(`.recent-card`).forEach(e=>{e.addEventListener(`click`,()=>{window.location.hash=`/anime/${e.getAttribute(`data-anime-id`)}`})}),document.getElementById(`export-btn`)?.addEventListener(`click`,()=>{let e=ne(),t=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`anitrack_export_${new Date().toISOString().split(`T`)[0]}.json`,r.click(),URL.revokeObjectURL(n)})}var Q=0;async function Fe(){let e=document.getElementById(`app`);Q=0,await $(e)}async function $(e){let t=new Date,n=t.getDay()===0?6:t.getDay()-1,r=ve(t);r.setDate(r.getDate()+Q*7);let i=new Date(r);i.setDate(i.getDate()+7);let a=Q===0;e.innerHTML=`
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
      <div class="text-on-surface-variant font-label-lg text-label-lg mb-4">${a?`This Week`:Q===1?`Next Week`:Q===-1?`Last Week`:`Week of ${r.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`})}`}</div>

      <!-- Loading skeleton -->
      <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar" id="schedule-grid">
        ${I.map(()=>`
          <div class="flex-shrink-0 w-[260px] min-w-[240px] bg-surface-container rounded-xl p-4 border border-white/5 min-h-[300px]">
            <div class="h-5 w-24 skeleton rounded mb-4"></div>
            <div class="space-y-3">
              <div class="h-20 skeleton rounded-lg"></div>
              <div class="h-20 skeleton rounded-lg"></div>
            </div>
          </div>
        `).join(``)}
      </div>
    </div>
  `,document.getElementById(`week-prev`)?.addEventListener(`click`,()=>{Q--,$(e)}),document.getElementById(`week-next`)?.addEventListener(`click`,()=>{Q++,$(e)});try{let e=await F(Math.floor(r.getTime()/1e3),Math.floor(i.getTime()/1e3)),t={};for(let e=0;e<7;e++)t[e]=[];for(let n of e){let e=new Date(n.airingAt*1e3).getDay();e=e===0?6:e-1,t[e]&&t[e].push(n)}let o=document.getElementById(`schedule-grid`);if(o.innerHTML=``,I.forEach((e,i)=>{let s=new Date(r);s.setDate(s.getDate()+i);let c=s.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`}),l=a&&i===n,u=a&&i<n,d=t[i]||[],f=document.createElement(`div`);if(f.className=`flex-shrink-0 w-[260px] min-w-[240px] rounded-xl p-4 border transition-all min-h-[300px] ${l?`bg-surface-container border-primary/30 ring-1 ring-primary/20`:`bg-surface-container border-white/5`} ${u?`opacity-50`:``}`,f.innerHTML=`
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-[14px] ${l?`text-primary`:`text-on-surface-variant`}">
            ${e}
          </h3>
          ${l?`<span class="bg-primary text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">TODAY</span>`:`<span class="text-on-surface-variant/50 text-[11px]">${c}</span>`}
        </div>
        <div class="flex flex-col gap-3" id="day-${i}-entries">
          ${d.length===0?`<div class="text-center py-8 text-on-surface-variant/30">
                <span class="material-symbols-outlined text-[28px] mb-1">event_busy</span>
                <p class="text-[11px]">No releases</p>
              </div>`:``}
        </div>
      `,d.length>0){let e=f.querySelector(`#day-${i}-entries`);d.forEach(t=>{let n=t.media;if(!n)return;let r=k(n.title),i=n.coverImage?.medium||n.coverImage?.large||``,a=new Date(t.airingAt*1e3).toLocaleTimeString(`en-US`,{hour:`2-digit`,minute:`2-digit`,hour12:!1})+` JST`,o=n.episodes?Math.round(t.episode/n.episodes*100):0,s=document.createElement(`div`);s.className=`flex gap-3 p-2.5 bg-surface-container-low rounded-lg border border-white/5 hover:bg-surface-variant transition-all cursor-pointer active:scale-[0.98]`,s.innerHTML=`
            <div class="w-16 h-[88px] rounded-lg overflow-hidden flex-shrink-0">
              ${i?`<img src="${i}" alt="${r}" class="w-full h-full object-cover" loading="lazy" />`:`<div class="w-full h-full bg-surface-container-high flex items-center justify-center">
                    <span class="material-symbols-outlined text-on-surface-variant/30 text-[18px]">image</span>
                  </div>`}
            </div>
            <div class="flex flex-col justify-center flex-1 min-w-0">
              <span class="text-primary text-[10px] font-semibold mb-0.5">${a}</span>
              <h4 class="text-on-surface text-[13px] font-semibold leading-tight mb-1.5 line-clamp-2">${r}</h4>
              <div class="flex items-center gap-2">
                <span class="bg-outline-variant/30 text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-medium">EP ${t.episode}</span>
                ${n.episodes?`
                  <div class="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full" style="width: ${o}%"></div>
                  </div>
                `:``}
              </div>
            </div>
          `,s.addEventListener(`click`,()=>{window.location.hash=`/anime/${n.id}`}),e.appendChild(s)})}o.appendChild(f)}),a){let e=o.children[n];e&&setTimeout(()=>{e.scrollIntoView({behavior:`smooth`,block:`nearest`,inline:`center`})},200)}}catch(e){console.error(`Schedule error:`,e);let t=document.getElementById(`schedule-grid`);t&&(t.innerHTML=`
        <div class="w-full text-center py-16">
          <span class="material-symbols-outlined text-[64px] text-error mb-4">error</span>
          <h3 class="font-headline-md text-headline-md text-on-surface mb-2">Failed to Load Schedule</h3>
          <p class="text-on-surface-variant font-body-md">${e.message}</p>
        </div>
      `)}}function Ie(){re(),ae(),r(`/home`,()=>Ce()),r(`/search`,()=>Te()),r(`/library`,()=>De()),r(`/schedule`,()=>Fe()),r(`/profile`,()=>Ne()),r(`/anime/:id`,e=>Me(e)),window.addEventListener(`titleLanguageChanged`,()=>{let e=new HashChangeEvent(`hashchange`);window.dispatchEvent(e)}),(!window.location.hash||window.location.hash===`#`)&&i(`/home`),o()}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,Ie):Ie();