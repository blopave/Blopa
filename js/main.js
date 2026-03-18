/* ══════════════════════════════════════════════════
   main.js — blo pa/ Portfolio
   Pablo Vela · 2026
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
   INSTANT LOAD — no preloader, immediate reveal
───────────────────────────────────────────────── */

document.body.classList.add('loaded');

const logo = $('logo');
if (logo) {
  logo.style.transition = 'transform 1.1s cubic-bezier(.77,0,.18,1) 0.1s';
  logo.style.transform = 'translateY(0)';
}


/* ─────────────────────────────────────────────────
   SMOOTH SCROLL ENGINE
───────────────────────────────────────────────── */

const wrap = $('scroll-wrap');
let smoothY = 0;
let targetY = 0;
const LERP = 0.08;
let smoothEnabled = false;

if (!isTouch) {
  const contentHeight = wrap.offsetHeight;

  document.documentElement.classList.add('smooth-scroll');
  smoothEnabled = true;

  const spacer = document.createElement('div');
  spacer.id = 'scroll-spacer';
  spacer.style.height = contentHeight + 'px';
  document.body.appendChild(spacer);

  function setSpacer() {
    wrap.style.position = 'static';
    spacer.style.height = '0px';
    const h = wrap.offsetHeight;
    wrap.style.position = '';
    spacer.style.height = h + 'px';
  }

  window.addEventListener('resize', setSpacer);
  $$('img[loading="lazy"]').forEach(img => {
    img.addEventListener('load', setSpacer, { once: true });
  });
  window.addEventListener('load', setSpacer);

  window.addEventListener('scroll', () => {
    targetY = window.scrollY;
  }, { passive: true });

  targetY = window.scrollY;
  smoothY = targetY;
}

if (prefersReducedMotion && smoothEnabled) {
  smoothEnabled = false;
  document.documentElement.classList.remove('smooth-scroll');
  const spacer = $('scroll-spacer');
  if (spacer) spacer.remove();
}


/* ─────────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────────── */

let mx = -200, my = -200;

if (!isTouch) {
  const cDot  = $('c-dot');
  const cRing = $('c-ring');

  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cDot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
  });

  (function animRing() {
    if (pageVisible) {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      cRing.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(animRing);
  })();

  $$('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('is-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('is-link'));
  });

  let scrollRingTimer = null;
  window.addEventListener('scroll', () => {
    document.body.classList.add('is-scrolling');
    if (scrollRingTimer) clearTimeout(scrollRingTimer);
    scrollRingTimer = setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 300);
  }, { passive: true });
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
   SCROLL-DRIVEN REVEALS
───────────────────────────────────────────────── */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -80px 0px'
});

$$('.reveal').forEach(el => revealObserver.observe(el));


/* ─────────────────────────────────────────────────
   SCROLL PARALLAX
───────────────────────────────────────────────── */

const parallaxEls = $$('[data-speed]');

function updateParallax() {
  if (prefersReducedMotion) return;
  const vh = window.innerHeight;

  for (const el of parallaxEls) {
    const rect = el.getBoundingClientRect();
    if (rect.top > vh * 1.5 || rect.bottom < -vh * 0.5) continue;

    const speed = parseFloat(el.dataset.speed);
    const center = rect.top + rect.height / 2;
    const offset = (center - vh / 2) * speed;

    el.style.transform = `translateY(${offset}px)`;
  }
}


/* ─────────────────────────────────────────────────
   MAIN RENDER LOOP
───────────────────────────────────────────────── */

if (smoothEnabled) {
  (function renderLoop() {
    if (pageVisible) {
      smoothY += (targetY - smoothY) * LERP;
      if (Math.abs(targetY - smoothY) < 0.5) smoothY = targetY;

      wrap.style.transform = `translate3d(0, ${-smoothY}px, 0)`;
      updateParallax();
    }

    requestAnimationFrame(renderLoop);
  })();
} else {
  function onNativeScroll() {
    updateParallax();
  }

  window.addEventListener('scroll', onNativeScroll, { passive: true });
  onNativeScroll();
}


/* ─────────────────────────────────────────────────
   EMAIL — split for hover animation
───────────────────────────────────────────────── */

const emLink = $('em-link');
if (emLink) {
  emLink.innerHTML =
    '<span class="em-user">blopave</span>' +
    '<span class="em-at">@</span>' +
    '<span class="em-domain">proton.me</span>';
}


/* ─────────────────────────────────────────────────
   PAGE TRANSITIONS
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


/* ─────────────────────────────────────────────────
   HASH DEEP LINK
───────────────────────────────────────────────── */

if (window.location.hash === '#work') {
  const workSection = $('work');
  if (workSection) {
    requestAnimationFrame(() => {
      workSection.scrollIntoView({ behavior: 'instant' });
      if (smoothEnabled) {
        targetY = window.scrollY;
        smoothY = targetY;
      }
      history.replaceState(null, '', window.location.pathname);
    });
  }
}


/* ─────────────────────────────────────────────────
   NAV DOTS — scroll tracking + click navigation
───────────────────────────────────────────────── */

if (!isTouch) {
  const navDots = $$('.nav-dot');
  const sections = ['hero', 'work', 'contacto'].map(id => $(id)).filter(Boolean);

  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navDots.forEach(dot => {
          dot.classList.toggle('active', dot.dataset.section === id);
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0
  });

  sections.forEach(section => dotObserver.observe(section));

  navDots.forEach(dot => {
    dot.addEventListener('click', e => {
      e.preventDefault();
      const target = $(dot.dataset.section);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth' });
      if (smoothEnabled) {
        setTimeout(() => {
          targetY = window.scrollY;
        }, 50);
      }
    });
  });
}


/* ─────────────────────────────────────────────────
   HERO CLOCK — Buenos Aires time
───────────────────────────────────────────────── */

const heroClock = $('hero-clock');
if (heroClock) {
  function updateClock() {
    const now = new Date().toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    heroClock.textContent = now;
  }
  updateClock();
  setInterval(updateClock, 30000);
}
