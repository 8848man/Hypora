/* ==========================================================================
   Hypora Landing — Shared Motion Design System engine
   (DISPOSABLE PLANNING ARTIFACT — not production code)

   Two responsibilities, and nothing else:
     1. Gate all motion behind prefers-reduced-motion, once, globally.
     2. Toggle .in-view on each .reveal-section the first time it scrolls
        into the viewport (once — never replays), and .scrolled on the
        page's .scroll-chrome element past a small scroll threshold.

   All actual timing/easing/distance lives in motion-system.css's tokens
   and utility classes — this file only flips state classes.
   Linked identically by concept_a.html / concept_b.html / concept_c.html.
   ========================================================================== */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.documentElement.classList.add('reduced-motion');
  }

  function revealAllImmediately() {
    document.querySelectorAll('.reveal-section').forEach(function (section) {
      section.classList.add('in-view');
    });
  }

  if (reduced || !('IntersectionObserver' in window)) {
    revealAllImmediately();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    document.querySelectorAll('.reveal-section').forEach(function (section) {
      observer.observe(section);
    });
  }

  var chrome = document.querySelector('.scroll-chrome');
  if (chrome) {
    window.addEventListener('scroll', function () {
      chrome.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }
})();
