/**
 * Apex Innovators — fast-nav.js
 * Instant preloading & fast navigation engine.
 * Prefetches destination pages on link hover/touch/focus for 0ms transition delays.
 */

(function () {
  const prefetchedUrls = new Set();

  function prefetch(url) {
    if (!url || prefetchedUrls.has(url)) return;
    // Only prefetch internal links
    const origin = window.location.origin;
    if (!url.startsWith('/') && !url.startsWith(origin) && url.includes('://')) return;

    prefetchedUrls.add(url);

    // Use link rel=prefetch if supported, fallback to fetch
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
  }

  function initInstantPrefetch() {
    document.addEventListener('mouseover', (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href && !anchor.dataset.noPrefetch) {
        prefetch(anchor.href);
      }
    }, { passive: true });

    document.addEventListener('touchstart', (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href && !anchor.dataset.noPrefetch) {
        prefetch(anchor.href);
      }
    }, { passive: true });

    document.addEventListener('focusin', (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href && !anchor.dataset.noPrefetch) {
        prefetch(anchor.href);
      }
    }, { passive: true });
  }

  // Register service worker if available
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstantPrefetch);
  } else {
    initInstantPrefetch();
  }
})();
