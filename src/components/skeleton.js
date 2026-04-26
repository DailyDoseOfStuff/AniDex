/**
 * Skeleton Loading Components
 * Animated shimmer placeholders while data loads
 */

/**
 * Card skeleton grid
 */
export function createCardSkeletons(count = 6, cols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6') {
  const container = document.createElement('div');
  container.className = `grid ${cols} gap-md`;

  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="flex flex-col gap-2">
        <div class="aspect-[2/3] rounded-xl skeleton"></div>
        <div class="h-3 w-3/4 skeleton rounded"></div>
        <div class="h-2.5 w-1/2 skeleton rounded"></div>
      </div>
    `;
  }
  return container;
}

/**
 * Horizontal card skeletons
 */
export function createHorizontalSkeletons(count = 4) {
  const container = document.createElement('div');
  container.className = 'flex gap-md overflow-hidden';

  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="flex-shrink-0 w-[300px] bg-surface-container rounded-xl overflow-hidden border border-white/5 flex h-[100px]">
        <div class="w-24 h-full skeleton"></div>
        <div class="p-md flex flex-col justify-center flex-1 gap-2">
          <div class="h-3 w-3/4 skeleton rounded"></div>
          <div class="h-2.5 w-1/2 skeleton rounded"></div>
          <div class="h-2.5 w-1/3 skeleton rounded"></div>
        </div>
      </div>
    `;
  }
  return container;
}

/**
 * Hero section skeleton
 */
export function createHeroSkeleton() {
  const container = document.createElement('div');
  container.className = 'grid grid-cols-1 md:grid-cols-12 gap-gutter';
  container.innerHTML = `
    <div class="md:col-span-8 h-[400px] rounded-xl skeleton"></div>
    <div class="md:col-span-4 grid grid-rows-2 gap-gutter">
      <div class="rounded-xl skeleton"></div>
      <div class="rounded-xl skeleton"></div>
    </div>
  `;
  return container;
}

/**
 * Detail page skeleton
 */
export function createDetailSkeleton() {
  const container = document.createElement('div');
  container.innerHTML = `
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
  `;
  return container;
}

/**
 * Search grid skeletons
 */
export function createSearchSkeletons(count = 20) {
  return createCardSkeletons(count, 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5');
}
