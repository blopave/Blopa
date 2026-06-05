/* ══════════════════════════════════════════════════
   shared.js — Interaction system for project pages
   blo pa/ Portfolio · 2026
   ══════════════════════════════════════════════════ */

'use strict';

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

let pageVisible = true;
document.addEventListener('visibilitychange', () => {
  pageVisible = !document.hidden;
});

const isTouch = window.matchMedia('(pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ─────────────────────────────────────────────────
   BODY LOADED — enable cursor hide immediately
───────────────────────────────────────────────── */

document.body.classList.add('loaded');

const TRANSITION_KEY = 'pt-transitioning';
const TRANSITION_MS = 550;
const pageTransition = $('page-transition');

/* If we arrived via a curtain navigation, the overlay
   needs to start in "covering" position (no transition),
   then animate upward off-screen. */
const arrivingViaTransition =
  pageTransition &&
  !prefersReducedMotion &&
  sessionStorage.getItem(TRANSITION_KEY) === '1';

if (arrivingViaTransition) {
  sessionStorage.removeItem(TRANSITION_KEY);
  pageTransition.classList.add('is-snapped');
}

document.body.classList.add('page-entering');
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.body.classList.remove('page-entering');
    document.body.classList.add('page-entered');

    if (arrivingViaTransition) {
      pageTransition.classList.remove('is-snapped');
      pageTransition.classList.add('is-exiting');
      setTimeout(() => {
        pageTransition.classList.remove('is-exiting');
      }, TRANSITION_MS + 50);
    }
  });
});


/* ─────────────────────────────────────────────────
   CUSTOM CURSOR — context-aware states
───────────────────────────────────────────────── */

if (!isTouch) {
  const cDot = $('c-dot');

  if (cDot) {
    const cursorStates = ['is-logo', 'is-link'];

    function setCursorState(state) {
      cursorStates.forEach(s => cDot.classList.remove(s));
      if (state) cDot.classList.add(state);
    }

    document.addEventListener('mousemove', e => {
      cDot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    });

    $$('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => setCursorState('is-link'));
      el.addEventListener('mouseleave', () => setCursorState(null));
    });
  }
}


/* ─────────────────────────────────────────────────
   LAZY IMAGE FADE-IN
───────────────────────────────────────────────── */

$$('img[loading="lazy"]').forEach(img => {
  if (img.complete) {
    img.classList.add('is-loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  }
});


/* ─────────────────────────────────────────────────
   SCROLL-DRIVEN REVEALS  — IntersectionObserver
───────────────────────────────────────────────── */

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  $$('.reveal').forEach(el => revealObserver.observe(el));
} else {
  /* Reduced motion — show everything immediately */
  $$('.reveal').forEach(el => el.classList.add('is-visible'));
}


/* ─────────────────────────────────────────────────
   PAGE TRANSITIONS  — continuous curtain between pages
───────────────────────────────────────────────── */

document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;

  e.preventDefault();

  if (pageTransition && !prefersReducedMotion) {
    sessionStorage.setItem(TRANSITION_KEY, '1');
    pageTransition.classList.remove('is-exiting', 'is-snapped');
    pageTransition.classList.add('is-covering');
    setTimeout(() => { window.location.href = href; }, TRANSITION_MS + 30);
  } else {
    window.location.href = href;
  }
});

/* bfcache restore — reset page visibility when navigating back */
window.addEventListener('pageshow', e => {
  if (e.persisted && pageTransition) {
    sessionStorage.removeItem(TRANSITION_KEY);
    pageTransition.classList.remove('is-covering', 'is-snapped', 'is-exiting');
    document.body.classList.remove('page-entering');
    document.body.classList.add('page-entered');
  }
});


/* ─────────────────────────────────────────────────
   PREFETCH prev/next project — warm the cache so the
   continuous curtain isn't stalled by network on arrival.
───────────────────────────────────────────────── */

const schedulePrefetch = window.requestIdleCallback
  ? cb => requestIdleCallback(cb, { timeout: 2000 })
  : cb => setTimeout(cb, 1200);

schedulePrefetch(() => {
  ['.proj-nav-prev', '.proj-nav-next'].forEach(sel => {
    const a = document.querySelector(sel);
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = href;
    document.head.appendChild(link);
  });
});
