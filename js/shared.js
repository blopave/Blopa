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

// Page enter animation
document.body.classList.add('page-entering');
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.body.classList.remove('page-entering');
    document.body.classList.add('page-entered');
  });
});


/* ─────────────────────────────────────────────────
   CUSTOM CURSOR — context-aware states
───────────────────────────────────────────────── */

if (!isTouch) {
  const cDot = $('c-dot');

  if (cDot) {
    const cursorStates = ['is-logo', 'is-link', 'is-proj'];

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
   PAGE TRANSITIONS  — smooth fade between pages
───────────────────────────────────────────────── */

document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;

  e.preventDefault();
  document.body.classList.remove('page-entered');
  document.body.classList.add('page-leaving');
  setTimeout(() => { window.location.href = href; }, 420);
});
