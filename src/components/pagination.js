/**
 * Pagination Component
 * Page-based navigation with prev/next arrows and page jump textbox
 */

/**
 * Create pagination controls
 * @param {object} pageInfo - { currentPage, lastPage, hasNextPage, total }
 * @param {function} onPageChange - Callback with new page number
 * @returns {HTMLElement}
 */
export function createPagination(pageInfo, onPageChange) {
  const container = document.createElement('div');
  container.className = 'flex flex-wrap items-center justify-center gap-3 mt-10 mb-6';

  if (!pageInfo || pageInfo.lastPage <= 1) return container;

  const { currentPage, lastPage } = pageInfo;

  container.innerHTML = `
    <button class="prev-btn flex items-center gap-1 px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
      currentPage <= 1 
        ? 'bg-surface-container text-outline cursor-not-allowed opacity-50' 
        : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest active:scale-95'
    }" ${currentPage <= 1 ? 'disabled' : ''}>
      <span class="material-symbols-outlined text-[18px]">chevron_left</span>
      Prev
    </button>

    <div class="flex items-center gap-2">
      <span class="text-on-surface-variant font-label-md">Page</span>
      <input 
        type="number" 
        class="page-input w-16 bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1.5 text-center text-on-surface font-label-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value="${currentPage}"
        min="1"
        max="${lastPage}"
      />
      <span class="text-on-surface-variant font-label-md">of ${lastPage}</span>
    </div>

    <button class="next-btn flex items-center gap-1 px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
      currentPage >= lastPage 
        ? 'bg-surface-container text-outline cursor-not-allowed opacity-50' 
        : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest active:scale-95'
    }" ${currentPage >= lastPage ? 'disabled' : ''}>
      Next
      <span class="material-symbols-outlined text-[18px]">chevron_right</span>
    </button>
  `;

  // Previous button
  const prevBtn = container.querySelector('.prev-btn');
  if (currentPage > 1) {
    prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
  }

  // Next button
  const nextBtn = container.querySelector('.next-btn');
  if (currentPage < lastPage) {
    nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
  }

  // Page input — jump on Enter or blur
  const pageInput = container.querySelector('.page-input');
  const handlePageJump = () => {
    let page = parseInt(pageInput.value);
    if (isNaN(page) || page < 1) page = 1;
    if (page > lastPage) page = lastPage;
    if (page !== currentPage) {
      onPageChange(page);
    } else {
      pageInput.value = currentPage; // Reset if same
    }
  };

  pageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePageJump();
    }
  });

  pageInput.addEventListener('blur', handlePageJump);

  return container;
}
