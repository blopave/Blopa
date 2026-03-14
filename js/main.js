/* ══════════════════════════════════════════════════
   main.js — blo pa/ Portfolio
   Pablo Vela · 2026
   ══════════════════════════════════════════════════ */

'use strict';


/* ─────────────────────────────────────────────────
   UTILS
───────────────────────────────────────────────── */

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

let pageVisible = true;
document.addEventListener('visibilitychange', () => {
  pageVisible = !document.hidden;
});

const isTouch = window.matchMedia('(pointer: coarse)').matches;


/* ─────────────────────────────────────────────────
   PRELOADER + INTRO SEQUENCE
───────────────────────────────────────────────── */

const preloader = $('preloader');
const isRepeatVisit = sessionStorage.getItem('blopa_visited');

function triggerHeroReveals() {
  document.body.classList.add('loaded');

  [
    { el: $('hl1'), delay: 0.25 },
    { el: $('hl2'), delay: 0.45 },
  ].forEach(({ el, delay }) => {
    if (!el) return;
    el.style.transition = `transform 1.1s cubic-bezier(.77,0,.18,1) ${delay}s`;
    el.style.transform = 'translateY(0)';
  });
}

if (isRepeatVisit) {
  preloader.remove();
  triggerHeroReveals();
} else {
  sessionStorage.setItem('blopa_visited', '1');
  setTimeout(() => {
    preloader.classList.add('pre-done');
    triggerHeroReveals();
    preloader.addEventListener('transitionend', () => preloader.remove());
  }, 2000);
}


/* ─────────────────────────────────────────────────
   CUSTOM CURSOR  (desktop only)
───────────────────────────────────────────────── */

let mx = -200, my = -200;

if (!isTouch) {
  const cDot  = $('c-dot');
  const cRing = $('c-ring');
  const cLabel = $('c-label');

  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cDot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
  });

  (function animRing() {
    if (pageVisible) {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      cRing.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(animRing);
  })();

  $$('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('is-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('is-link'));
  });

  $$('.pl-row').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('is-proj');
      cLabel.textContent = 'Ver';
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('is-proj');
    });
  });
}


/* ─────────────────────────────────────────────────
   CANVAS  — scan line effect (logo click)
───────────────────────────────────────────────── */

const canvas = $('fx-canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = innerWidth;
  canvas.height = innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


/* ─────────────────────────────────────────────────
   SCAN LINE  — reusable canvas effect
   speed: frames to cross screen (lower = faster)
───────────────────────────────────────────────── */

function fireScanLine(speed = 40, intensity = 1) {
  let ly = 0;
  const iv = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = `rgba(255,255,255,${0.18 * intensity})`;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(canvas.width, ly); ctx.stroke();

    ctx.strokeStyle = `rgba(255,255,255,${0.04 * intensity})`;
    ctx.lineWidth   = 12;
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(canvas.width, ly); ctx.stroke();

    ctx.strokeStyle = `rgba(255,255,255,${0.01 * intensity})`;
    ctx.lineWidth   = 1;
    for (let i = 0; i < canvas.height; i += 4) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    ly += canvas.height / speed;
    if (ly > canvas.height) {
      clearInterval(iv);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, 20);
}


/* ─────────────────────────────────────────────────
   LOGO  — click: glitch animation (no navigation)
───────────────────────────────────────────────── */

const logoEl   = $('logo');
const logoWrap = document.querySelector('.logo-wrap');

logoEl.setAttribute('data-text', logoEl.textContent);

if (!isTouch) {
  logoEl.addEventListener('click', () => {
    if (logoWrap.classList.contains('sc')) return;

    logoWrap.classList.add('sc');
    fireScanLine(40, 1);

    setTimeout(() => {
      logoWrap.classList.remove('sc');
      logoWrap.classList.add('fg');
      setTimeout(() => logoWrap.classList.remove('fg'), 580);
    }, 850);
  });
}


/* ─────────────────────────────────────────────────
   WAVEFORM BARS
───────────────────────────────────────────────── */

const wfEl = $('wavef');

for (let i = 0; i < 26; i++) {
  const b = document.createElement('div');
  b.className = 'wb';
  b.style.height            = (6 + Math.sin(i * 0.65) * 20 + Math.random() * 13) + 'px';
  b.style.animationDelay    = (i * 0.065) + 's';
  b.style.animationDuration = (1.1 + Math.random() * 0.75) + 's';
  wfEl.appendChild(b);
}


/* ─────────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────────── */

const wrap     = $('scroll-wrap');
const sections = Array.from($$('section'));
const navDots  = $$('.nd');
const footer   = $('ft');
const hint     = $('s-hint');
const progressBar = $('progress-bar');

const ACCENT = '#34d399';

let currentIdx   = 0;
let scrollLocked = false;
let lockTimer    = null;

function activateSection(idx) {
  sections.forEach((s, i) => {
    if (i <= idx) s.classList.add('sec-in');
  });
  navDots.forEach((d, i) => d.classList.toggle('on', i === idx));
  footer.classList.toggle('show', idx > 0);
  hint.classList.toggle('gone', idx > 0);
  currentIdx = idx;

  /* Update progress bar */
  const pct = ((idx + 1) / sections.length) * 100;
  progressBar.style.width = pct + '%';
}

function goTo(idx) {
  if (idx < 0 || idx >= sections.length || scrollLocked) return;

  scrollLocked = true;
  if (lockTimer) clearTimeout(lockTimer);

  sections[currentIdx].classList.add('sec-out');
  setTimeout(() => sections[currentIdx].classList.remove('sec-out'), 500);

  wrap.scrollTo({ top: sections[idx].offsetTop, behavior: 'smooth' });
  activateSection(idx);

  lockTimer = setTimeout(() => { scrollLocked = false; }, 950);
}

navDots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
hint.addEventListener('click', () => goTo(1));

let lastWheel = 0;
wrap.addEventListener('wheel', e => {
  e.preventDefault();
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

  const now = Date.now();
  if (now - lastWheel < 80) return;
  if (Math.abs(e.deltaY) < 20) return;
  lastWheel = now;

  goTo(currentIdx + (e.deltaY > 0 ? 1 : -1));
}, { passive: false });

window.addEventListener('keydown', e => {
  const down = ['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key);
  const up   = ['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key);
  if (down || up) {
    e.preventDefault();
    goTo(currentIdx + (down ? 1 : -1));
  }
});

let touchY0 = 0;
wrap.addEventListener('touchstart', e => { touchY0 = e.touches[0].clientY; }, { passive: true });
wrap.addEventListener('touchend', e => {
  const dy = touchY0 - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 50) goTo(currentIdx + (dy > 0 ? 1 : -1));
}, { passive: true });

wrap.addEventListener('scroll', () => {
  if (scrollLocked) return;
  const mid = window.innerHeight * 0.5;
  let found = 0;
  sections.forEach((s, i) => { if (wrap.scrollTop >= s.offsetTop - mid) found = i; });
  if (found !== currentIdx) activateSection(found);
}, { passive: true });

activateSection(0);


/* ─────────────────────────────────────────────────
   PROJECT LIST  — expand inline detail
───────────────────────────────────────────────── */

$$('.pl-row').forEach(row => {
  row.addEventListener('click', () => {
    const item = row.closest('.pl-item');
    const wasOpen = item.classList.contains('pl-open');

    /* Close any other open item */
    $$('.pl-item.pl-open').forEach(el => {
      if (el !== item) {
        el.classList.remove('pl-open');
        el.querySelector('.pl-row').setAttribute('aria-expanded', 'false');
      }
    });

    if (!wasOpen) {
      item.classList.add('pl-open');
      row.setAttribute('aria-expanded', 'true');
    } else {
      /* Closing — just close */
      item.classList.remove('pl-open');
      row.setAttribute('aria-expanded', 'false');
    }
  });
});


/* ─────────────────────────────────────────────────
   FLOATING PROJECT PREVIEW  — follows cursor on hover
   (desktop only)
───────────────────────────────────────────────── */

if (!isTouch) {
  const preview    = $('proj-preview');
  const previewImg = $('proj-preview-img');
  let prevX = -200, prevY = -200;
  let previewActive = false;

  $$('.pl-row').forEach(row => {
    const item = row.closest('.pl-item');
    const imgSrc = item.dataset.img;

    row.addEventListener('mouseenter', () => {
      if (!imgSrc) return;
      previewImg.src = imgSrc;
      previewActive = true;
      preview.classList.add('active');
    });

    row.addEventListener('mouseleave', () => {
      previewActive = false;
      preview.classList.remove('active');
    });
  });

  (function animPreview() {
    if (previewActive && pageVisible) {
      prevX += (mx - prevX) * 0.08;
      prevY += (my - prevY) * 0.08;
      preview.style.left = prevX + 'px';
      preview.style.top  = (prevY - 140) + 'px';
    }
    requestAnimationFrame(animPreview);
  })();
}


/* ─────────────────────────────────────────────────
   EMAIL  — split for hover animation
───────────────────────────────────────────────── */

const emLink = $('em-link');
if (emLink) {
  emLink.innerHTML =
    '<span class="em-user">blopave</span>' +
    '<span class="em-at">@</span>' +
    '<span class="em-domain">proton.me</span>';
}


/* ─────────────────────────────────────────────────
   BACK TO TOP
───────────────────────────────────────────────── */

const ctBack = $('ct-back');
if (ctBack) {
  ctBack.addEventListener('click', () => goTo(0));
  if (!isTouch) {
    ctBack.addEventListener('mouseenter', () => document.body.classList.add('is-link'));
    ctBack.addEventListener('mouseleave', () => document.body.classList.remove('is-link'));
  }
}


/* ─────────────────────────────────────────────────
   DOT GRID CANVAS  — fixed full-site background
   Dots brighten + connect near cursor (accent lines)
   Idle sine wave keeps it alive across all sections
───────────────────────────────────────────────── */

if (!isTouch) {
  const hCanvas = $('hero-canvas');
  const hCtx    = hCanvas.getContext('2d');

  const GRID     = 38;
  const BASE_R   = 1;
  const BASE_A   = 0.05;
  const M_RADIUS = 130;
  const M_GLOW   = 0.2;

  let dots = [];
  let heroMX = -999, heroMY = -999;

  function resizeHero() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = innerWidth;
    const h = innerHeight;
    hCanvas.width  = w * dpr;
    hCanvas.height = h * dpr;
    hCtx.scale(dpr, dpr);
    initDots(w, h);
  }

  function initDots(w, h) {
    dots = [];
    const cols = Math.ceil(w / GRID) + 1;
    const rows = Math.ceil(h / GRID) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          bx: c * GRID,
          by: r * GRID,
          x: c * GRID,
          y: r * GRID,
        });
      }
    }
  }

  document.addEventListener('mousemove', e => {
    heroMX = e.clientX;
    heroMY = e.clientY;
  });

  const ACCENT_RGB = { r: 255, g: 255, b: 255 };

  function drawHero() {
    if (!pageVisible) {
      requestAnimationFrame(drawHero);
      return;
    }

    const w = innerWidth;
    const h = innerHeight;
    hCtx.clearRect(0, 0, w, h);

    const time = Date.now() * 0.001;
    const glowing = [];

    for (const d of dots) {
      const wave = Math.sin(d.bx * 0.008 + time * 0.4) * 1.5
                 + Math.sin(d.by * 0.006 + time * 0.3) * 1.0;

      const baseY = d.by + wave;

      const dx = heroMX - d.bx;
      const dy = heroMY - baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let alpha = BASE_A;
      let radius = BASE_R;

      if (dist < M_RADIUS) {
        const t = 1 - dist / M_RADIUS;
        alpha = BASE_A + t * M_GLOW;
        radius = BASE_R + t * 1.8;

        const angle = Math.atan2(dy, dx);
        const push = t * 5;
        d.x = d.bx - Math.cos(angle) * push;
        d.y = baseY - Math.sin(angle) * push;

        glowing.push({ x: d.x, y: d.y, t });
      } else {
        d.x += (d.bx - d.x) * 0.08;
        d.y += (baseY - d.y) * 0.08;
      }

      hCtx.fillStyle = `rgba(255,255,255,${alpha})`;
      hCtx.fillRect(d.x - radius * 0.5, d.y - radius * 0.5, radius, radius);
    }

    /* Connection lines — accent color */
    const accent = ACCENT_RGB;
    const maxConn = GRID * 1.6;
    for (let i = 0; i < glowing.length; i++) {
      for (let j = i + 1; j < glowing.length; j++) {
        const a = glowing[i];
        const b = glowing[j];
        const ddx = a.x - b.x;
        const ddy = a.y - b.y;
        const dd = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dd < maxConn) {
          const lineAlpha = (1 - dd / maxConn) * Math.min(a.t, b.t) * 0.08;
          hCtx.beginPath();
          hCtx.moveTo(a.x, a.y);
          hCtx.lineTo(b.x, b.y);
          hCtx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${lineAlpha})`;
          hCtx.lineWidth = 0.5;
          hCtx.stroke();
        }
      }
    }

    requestAnimationFrame(drawHero);
  }

  window.addEventListener('resize', resizeHero);
  resizeHero();
  requestAnimationFrame(drawHero);
}


/* ─────────────────────────────────────────────────
   SECTION TITLE  — per-letter stagger reveal
   Splits text into individual <span> elements
   CSS handles the staggered clip-path animation
───────────────────────────────────────────────── */

$$('.sec-title').forEach(title => {
  const text = title.textContent;
  let idx = 0;
  title.innerHTML = text.split('').map(char => {
    if (char === ' ') return ' ';
    return `<span class="title-char" style="--i:${idx++}">${char}</span>`;
  }).join('');
});


/* ─────────────────────────────────────────────────
   MAGNETIC EFFECT  — CTA button pulls toward cursor
───────────────────────────────────────────────── */

if (!isTouch) {
  $$('.mu-cta').forEach(btn => {
    const strength = 0.25;

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
      btn.style.transform = '';
      setTimeout(() => { btn.style.transition = ''; }, 400);
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = '';
    });
  });
}


/* ─────────────────────────────────────────────────
   LIVE CLOCK  — Buenos Aires time
───────────────────────────────────────────────── */

const clockTimeEl = $('clock-time');

function updateClock() {
  const now = new Date();
  const ba = now.toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  clockTimeEl.textContent = ba;
}

updateClock();
setInterval(updateClock, 10000);


/* ─────────────────────────────────────────────────
   HERO PARALLAX  — subtle mouse-driven depth
   (desktop only)
───────────────────────────────────────────────── */

if (!isTouch) {
  const hl1 = $('hl1');
  const hl2 = $('hl2');

  document.addEventListener('mousemove', e => {
    if (currentIdx !== 0) return;

    const cx = (e.clientX / innerWidth  - 0.5) * 2;
    const cy = (e.clientY / innerHeight - 0.5) * 2;

    if (hl1) hl1.style.transform = `translateY(0) translate(${cx * -8}px, ${cy * -4}px)`;
    if (hl2) hl2.style.transform = `translateY(0) translate(${cx * -14}px, ${cy * -6}px)`;
  });
}
