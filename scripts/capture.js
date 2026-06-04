const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_BASE = path.join(ROOT, 'assets/img/projects');
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1.5 };

const projects = [
  {
    name: 'valecasenave',
    url: 'https://valecasenave.com',
    captures: ['vc-mode-cover', 'vc-mode-about', 'vc-mode-frequency', 'vc-mode-stats', 'vc-mode-quote', 'vc-mode-story'],
    indexThumb: { from: 'vc-mode-cover' },
    settleMs: 3500,
  },
  {
    name: 'pulz',
    url: 'https://pulz.run',
    captures: ['pulz-mode-cover', 'pulz-mode-hero', 'pulz-mode-cards', 'pulz-mode-stats', 'pulz-mode-teams', 'pulz-mode-organizers'],
    indexThumb: { name: 'pulz' },
    settleMs: 3500,
    preActions: [
      { evalFn: `(async () => { const b = [...document.querySelectorAll('button, a')].find(x => /aceptar|accept|rechazar|reject|cerrar/i.test((x.textContent||'').trim())); if (b) b.click(); })()` },
      { wait: 1200 },
    ],
  },
  {
    name: 'yaricasanova',
    url: 'http://localhost:5101',
    captures: ['yari-mode-cover', 'yari-mode-hero', 'yari-mode-portrait', 'yari-mode-painting-a', 'yari-mode-painting-b', 'yari-mode-typo'],
    indexThumb: { name: 'yaricasanova' },
    settleMs: 5000,
    skipIntro: true,
  },
  {
    name: 'basslayer',
    url: 'http://localhost:5104',
    indexThumb: { from: 'bass-mode-cover' },
    settleMs: 4000,
    manual: [
      { file: 'bass-mode-cover', actions: [
        { evalFn: `(async () => { const b = [...document.querySelectorAll('button')].find(x => /entendido/i.test(x.textContent)); if (b) b.click(); })()` },
        { wait: 1800 },
      ]},
      { file: 'bass-mode-bass', actions: [
        { hover: '.bl-word-bass' },
        { wait: 1400 },
      ]},
      { file: 'bass-mode-layer', actions: [
        { hover: '.bl-word-layer' },
        { wait: 1400 },
      ]},
      { file: 'bass-mode-layer-scroll', actions: [
        { hover: '.bl-word-layer' },
        { wait: 800 },
        { evalFn: `(async () => { const c = document.querySelector('.bl-layer-content'); if (c) c.scrollTo({ top: 900, behavior: 'instant' }); })()` },
        { wait: 800 },
      ]},
    ],
  },
  {
    name: 'beokey',
    url: 'https://beokey.live',
    indexThumb: { from: 'beokey-mode-cover' },
    settleMs: 3500,
    manual: [
      { file: 'beokey-mode-cover', actions: [{ wait: 400 }] },
      { file: 'beokey-mode-about', actions: [{ click: 'a[href="#sobre-mi"]' }, { wait: 2000 }] },
      { file: 'beokey-mode-therapies', actions: [{ click: 'a[href="#servicios"]' }, { wait: 2000 }] },
      { file: 'beokey-mode-gallery', actions: [{ click: 'a[href="#galeria"]' }, { wait: 2200 }] },
      { file: 'beokey-mode-testimonials', actions: [{ click: 'a[href="#testimonios"]' }, { wait: 2000 }] },
    ],
  },
  {
    name: 'indoyoga',
    url: 'https://indoyoga.org',
    captures: ['indoyoga-mode-cover', 'indoyoga-mode-founder', 'indoyoga-mode-classes', 'indoyoga-mode-training', 'indoyoga-mode-gallery'],
    indexThumb: { name: 'indoyoga' },
    settleMs: 3500,
  },
  {
    name: 'lavere',
    url: 'http://localhost:5102',
    captures: ['lavere-mode-cover', 'lavere-mode-enfoque', 'lavere-mode-roots', 'lavere-mode-suelo', 'lavere-mode-stats'],
    indexThumb: { name: 'lavere' },
    settleMs: 3000,
  },
  {
    name: 'sopla',
    url: 'http://localhost:5103',
    indexThumb: { from: 'sopla-mode-cover' },
    settleMs: 3000,
    manual: [
      { file: 'sopla-mode-cover', actions: [{ wait: 400 }] },
      { file: 'sopla-mode-spot', actions: [
        { click: '.hero-cta-secondary:not(.hero-cta-map)' },
        { wait: 2000 },
      ]},
    ],
  },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture(page, outPath) {
  await page.screenshot({ path: outPath, type: 'jpeg', quality: 88, fullPage: false });
  console.log(`  ✓ ${path.relative(ROOT, outPath)}`);
}

async function detectScrollAxis(page) {
  return page.evaluate(() => {
    const docH = document.documentElement.scrollHeight;
    const docW = document.documentElement.scrollWidth;
    const winH = window.innerHeight;
    const winW = window.innerWidth;
    return docW - winW > docH - winH ? 'x' : 'y';
  });
}

async function runAction(page, action) {
  if (action.wait) return wait(action.wait);
  if (action.click) {
    const handle = await page.$(action.click);
    if (handle) { await handle.click(); }
    else { console.warn(`    (no element for click: ${action.click})`); }
    return;
  }
  if (action.hover) {
    const handle = await page.$(action.hover);
    if (handle) { await handle.hover(); }
    else { console.warn(`    (no element for hover: ${action.hover})`); }
    return;
  }
  if (action.evalFn) {
    await page.evaluate(action.evalFn);
    return;
  }
}

async function processProject(browser, proj) {
  console.log(`\n→ ${proj.name}  (${proj.url})`);
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
  );

  try {
    await page.goto(proj.url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (e) {
    console.warn(`  ! goto warning: ${e.message}`);
  }

  await wait(proj.settleMs || 2500);

  if (proj.preActions) {
    for (const a of proj.preActions) {
      try { await runAction(page, a); } catch (e) { console.warn(`    ! preAction: ${e.message}`); }
    }
  }

  if (proj.skipIntro) {
    try {
      await page.keyboard.press('Escape');
      await page.mouse.click(VIEWPORT.width / 2, VIEWPORT.height / 2);
      await wait(1500);
    } catch (_) {}
  }

  if (proj.manual) {
    // Manual mode: actions per capture
    for (const cap of proj.manual) {
      if (cap.actions) {
        for (const a of cap.actions) {
          try { await runAction(page, a); } catch (e) { console.warn(`    ! action error: ${e.message}`); }
        }
      }
      const outPath = path.join(OUT_BASE, 'captures', `${cap.file}.jpg`);
      await capture(page, outPath);
    }
  } else {
    // Auto scroll mode
    let axis = proj.scrollAxis === 'x' ? 'x' : proj.scrollAxis === 'y' ? 'y' : await detectScrollAxis(page);
    console.log(`  scroll axis: ${axis}`);

    const dims = await page.evaluate(() => ({
      sH: document.documentElement.scrollHeight,
      sW: document.documentElement.scrollWidth,
      wH: window.innerHeight,
      wW: window.innerWidth,
    }));
    console.log(`  page: ${dims.sW}×${dims.sH}, viewport: ${dims.wW}×${dims.wH}`);

    const total = axis === 'x' ? dims.sW - dims.wW : dims.sH - dims.wH;
    const n = proj.captures.length;
    const step = n > 1 ? total / (n - 1) : 0;

    for (let i = 0; i < n; i++) {
      const pos = Math.max(0, Math.round(step * i));
      if (axis === 'x') {
        await page.evaluate((x) => window.scrollTo({ left: x, top: 0, behavior: 'instant' }), pos);
      } else {
        await page.evaluate((y) => window.scrollTo({ left: 0, top: y, behavior: 'instant' }), pos);
      }
      await wait(700);
      const outPath = path.join(OUT_BASE, 'captures', `${proj.captures[i]}.jpg`);
      await capture(page, outPath);
    }
  }

  // Index thumbnail
  if (proj.indexThumb) {
    if (proj.indexThumb.from) {
      const src = path.join(OUT_BASE, 'captures', `${proj.indexThumb.from}.jpg`);
      const dst = path.join(OUT_BASE, `${proj.name}.jpg`);
      fs.copyFileSync(src, dst);
      console.log(`  ↻ thumb ${path.relative(ROOT, dst)} (copied from ${proj.indexThumb.from})`);
    } else {
      const dst = path.join(OUT_BASE, `${proj.indexThumb.name}.jpg`);
      await page.evaluate(() => window.scrollTo({ left: 0, top: 0, behavior: 'instant' }));
      await wait(800);
      await capture(page, dst);
    }
  }

  await page.close();
}

(async () => {
  const args = process.argv.slice(2);
  const filter = args.length ? args : null;
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const proj of projects) {
    if (filter && !filter.includes(proj.name)) continue;
    try {
      await processProject(browser, proj);
    } catch (e) {
      console.error(`✗ ${proj.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\n✓ done');
})();
