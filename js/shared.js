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


/* ─────────────────────────────────────────────────
   CUSTOM CURSOR  (desktop only)
───────────────────────────────────────────────── */

let mx = -200, my = -200;

if (!isTouch) {
  const cDot  = $('c-dot');
  const cRing = $('c-ring');

  if (cDot && cRing) {
    let rx = -200, ry = -200;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cDot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    });

    (function animRing() {
      if (pageVisible) {
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        cRing.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(animRing);
    })();

    $$('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('is-link'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('is-link'));
    });

    /* Scroll ring reaction */
    let scrollRingTimer = null;
    window.addEventListener('scroll', () => {
      document.body.classList.add('is-scrolling');
      if (scrollRingTimer) clearTimeout(scrollRingTimer);
      scrollRingTimer = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 300);
    }, { passive: true });
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
  document.body.classList.add('page-leaving');
  setTimeout(() => { window.location.href = href; }, 350);
});
