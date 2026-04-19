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

let ticking = false;
const isTouch = window.matchMedia('(pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ─────────────────────────────────────────────────
   INSTANT LOAD — no preloader, immediate reveal
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

/* Logo reveal is handled by CSS (.loaded .hero-line-inner) */


/* ─────────────────────────────────────────────────
   SCROLL ENGINE — native (sticky cards need it)
───────────────────────────────────────────────── */

const wrap = $('scroll-wrap');
const smoothEnabled = false;


/* ─────────────────────────────────────────────────
   CUSTOM CURSOR — context-aware states + label
───────────────────────────────────────────────── */

if (!isTouch) {
  const cDot = $('c-dot');
  const cLabel = $('c-label');
  const cursorStates = ['is-logo', 'is-link'];

  let cursorX = -200, cursorY = -200;
  let targetCX = -200, targetCY = -200;
  const CURSOR_LERP = 0.15;

  function setCursorState(state, label) {
    cursorStates.forEach(s => cDot.classList.remove(s));
    if (state) cDot.classList.add(state);
    if (cLabel) cLabel.textContent = label || '';
  }

  document.addEventListener('mousemove', e => {
    targetCX = e.clientX;
    targetCY = e.clientY;
  });

  // Lerp loop — cursor smoothly follows mouse
  (function cursorLoop() {
    if (!pageVisible) { requestAnimationFrame(cursorLoop); return; }
    cursorX += (targetCX - cursorX) * CURSOR_LERP;
    cursorY += (targetCY - cursorY) * CURSOR_LERP;
    cDot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(cursorLoop);
  })();

  // Logo — large inverted disc
  const logo = $('logo');
  if (logo) {
    logo.addEventListener('mouseenter', () => setCursorState('is-logo'));
    logo.addEventListener('mouseleave', () => setCursorState(null));
  }

  // Project slides — subtle link cursor
  $$('.proj-slide').forEach(el => {
    el.addEventListener('mouseenter', () => setCursorState('is-link'));
    el.addEventListener('mouseleave', () => setCursorState(null));
  });

  // Links, buttons — small ring
  $$('a:not(.proj-slide):not(.nav-dot), button, .em-link, .ft-link').forEach(el => {
    el.addEventListener('mouseenter', () => setCursorState('is-link'));
    el.addEventListener('mouseleave', () => setCursorState(null));
  });
}


/* ─────────────────────────────────────────────────
   LOGO — split into letters + magnetic hover
───────────────────────────────────────────────── */

const logoEl = $('logo');
if (logoEl && !isTouch && !prefersReducedMotion) {
  const text = logoEl.textContent.trim();
  logoEl.innerHTML = '';
  const chars = [];

  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.className = 'logo-char';
    span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
    logoEl.appendChild(span);
    chars.push(span);
  }

  // Terminal cursor — uses the font's own underscore for perfect alignment
  const cursor = document.createElement('span');
  cursor.className = 'logo-char terminal-cursor';
  cursor.textContent = '_';
  cursor.setAttribute('aria-hidden', 'true');
  logoEl.appendChild(cursor);

  let logoHovered = false;
  let mouseX = 0, mouseY = 0;

  logoEl.addEventListener('mouseenter', () => { logoHovered = true; tick(); });
  logoEl.addEventListener('mouseleave', () => {
    logoHovered = false;
    chars.forEach(c => { c.style.transform = ''; });
  });

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function tick() {
    if (!logoHovered) return;

    for (const char of chars) {
      const rect = char.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const strength = Math.max(0, 1 - dist / 250);
      char.style.transform = `translate(${dx * strength * 0.12}px, ${dy * strength * 0.15}px)`;
    }

    requestAnimationFrame(tick);
  }
} else if (logoEl) {
  // Touch / reduced-motion fallback — still add cursor
  const cursor = document.createElement('span');
  cursor.className = 'terminal-cursor';
  cursor.textContent = '_';
  cursor.setAttribute('aria-hidden', 'true');
  logoEl.appendChild(cursor);
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
window.addEventListener('beforeunload', () => revealObserver.disconnect());


/* ─────────────────────────────────────────────────
   SCROLL PARALLAX
───────────────────────────────────────────────── */

const parallaxEls = $$('[data-speed]');

function updateParallax() {
  if (prefersReducedMotion || parallaxEls.length === 0) return;
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
   HERO PARALLAX EXIT — logo drifts up + fades on scroll
───────────────────────────────────────────────── */

const heroCenter = $('hero-center');
const heroBottom = document.querySelector('.hero-bottom');
const heroSection = $('hero');

function updateHeroParallax() {
  if (prefersReducedMotion || !heroCenter || !heroSection) return;

  const scrollY = window.scrollY;
  const heroH = heroSection.offsetHeight;
  const progress = Math.min(1, scrollY / (heroH * 0.6));

  const yShift = progress * -80;
  const opacity = 1 - progress * 1.2;

  heroCenter.style.transform = `translateY(${yShift}px)`;
  heroCenter.style.opacity = Math.max(0, opacity);

  if (heroBottom) {
    heroBottom.style.transform = `translateY(${yShift * 0.4}px)`;
    heroBottom.style.opacity = Math.max(0, opacity);
  }
}


/* ─────────────────────────────────────────────────
   SCROLL HANDLER
───────────────────────────────────────────────── */

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateHeroParallax();
      updateParallax();
      updateSlides();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
updateParallax();


/* ─────────────────────────────────────────────────
   STICKY SLIDES — opacity fade + overlay reveal
───────────────────────────────────────────────── */

const projSlides = $$('.proj-slide');
let updateSlides = () => {};

const _indEl   = $('proj-indicator');
const _indName = $('proj-ind-name');
const _indType = $('proj-ind-type');
const _indNum  = $('proj-ind-num');
let _indCurrent = -1;
const _indTotal = projSlides.length;

if (projSlides.length && !prefersReducedMotion) {
  updateSlides = function() {
    const vh = window.innerHeight;

    // ── 1. Find the frontmost pinned slide (topmost z-index whose top <= 0) ──
    let activeIdx = -1;
    for (let i = projSlides.length - 1; i >= 0; i--) {
      const top = projSlides[i].getBoundingClientRect().top;
      if (top <= 0) { activeIdx = i; break; }
    }

    // ── 2. Animate all slides ──
    for (let i = 0; i < projSlides.length; i++) {
      const slide = projSlides[i];
      const rect = slide.getBoundingClientRect();
      const img = slide.querySelector('.proj-slide-img');

      // Reveal: 0 when top is at 60vh → 1 when top reaches 0
      const revealProgress = Math.max(0, Math.min(1, 1 - rect.top / (vh * 0.6)));

      if (!img) continue;

      const inset = 30 * (1 - revealProgress);
      const scale = 1.25 - 0.23 * revealProgress;
      const brightness = 0.4 + 0.52 * revealProgress;

      // Cover: how much the next card is covering this one
      const cover = Math.max(0, Math.min(1, 1 - rect.bottom / vh));

      if (cover > 0 && i < projSlides.length - 1) {
        img.style.clipPath = 'inset(0%)';
        img.style.opacity = Math.max(0.15, 0.9 - cover * 0.75);
        img.style.transform = `scale(${scale - cover * 0.06})`;
        img.style.filter = `brightness(${brightness})`;
      } else {
        img.style.clipPath = `inset(${inset}%)`;
        img.style.opacity = revealProgress > 0 ? 0.9 : '';
        img.style.transform = `scale(${scale})`;
        img.style.filter = `brightness(${brightness})`;
      }
    }

    // ── 3. Indicator synced to active slide ──
    if (!_indEl) return;

    if (activeIdx < 0) {
      _indEl.style.opacity = 0;
      _indEl.style.transform = 'translateY(-14px)';
      _indCurrent = -1;
      return;
    }

    const activeSlide = projSlides[activeIdx];
    const activeRect = activeSlide.getBoundingClientRect();
    const reveal = Math.max(0, Math.min(1, 1 - activeRect.top / (vh * 0.6)));
    const cover = Math.max(0, Math.min(1, 1 - activeRect.bottom / vh));

    // Indicator fades in with card reveal (40%→80%), fades out when covered
    const fadeIn = Math.max(0, Math.min(1, (reveal - 0.4) / 0.4));
    const fadeOut = 1 - Math.max(0, cover * 3);
    const eased = 1 - Math.pow(1 - fadeIn, 2.5);
    const opacity = Math.max(0, Math.min(eased, fadeOut));

    _indEl.style.opacity = opacity;
    _indEl.style.transform = `translateY(${(1 - eased) * -14}px)`;

    // Update text when slide changes
    if (activeIdx !== _indCurrent) {
      _indName.textContent = activeSlide.dataset.name;
      _indType.textContent = activeSlide.dataset.type;
      _indNum.textContent  = activeSlide.dataset.num + ' / ' + String(_indTotal).padStart(2, '0');
      _indCurrent = activeIdx;
    }
  }

  updateSlides();
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

const pageTransition = $('page-transition');

document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;

  e.preventDefault();

  if (pageTransition) {
    pageTransition.classList.add('is-covering');
    setTimeout(() => { window.location.href = href; }, 620);
  } else {
    window.location.href = href;
  }
});

/* bfcache restore — reset page visibility when navigating back */
window.addEventListener('pageshow', e => {
  if (e.persisted && pageTransition) {
    pageTransition.classList.remove('is-covering');
    document.body.classList.remove('page-entering');
    document.body.classList.add('page-entered');
  }
});


/* ─────────────────────────────────────────────────
   HASH DEEP LINK
───────────────────────────────────────────────── */

if (window.location.hash === '#work') {
  const workSection = $('work');
  if (workSection) {
    requestAnimationFrame(() => {
      workSection.scrollIntoView({ behavior: 'instant' });
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
  window.addEventListener('beforeunload', () => { dotObserver.disconnect(); });

  navDots.forEach(dot => {
    dot.addEventListener('click', e => {
      e.preventDefault();
      const target = $(dot.dataset.section);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}


/* ─────────────────────────────────────────────────
   SCROLL INDICATOR — hide on scroll
───────────────────────────────────────────────── */

const heroScroll = $('hero-scroll');
if (heroScroll) {
  let scrollHidden = false;
  window.addEventListener('scroll', () => {
    if (!scrollHidden && window.scrollY > 100) {
      heroScroll.style.opacity = '0';
      scrollHidden = true;
    }
  }, { passive: true });
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
  const clockId = setInterval(updateClock, 1000);
  window.addEventListener('beforeunload', () => clearInterval(clockId));
}


