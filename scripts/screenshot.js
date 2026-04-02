#!/usr/bin/env node

/**
 * screenshot.js — Capture project screenshots for the portfolio
 *
 * Usage:
 *   node scripts/screenshot.js                     # all projects
 *   node scripts/screenshot.js pulz beokey         # specific projects
 *
 * Captures TWO images per project:
 *   {slug}.jpg       → hero/top (for portfolio card thumbnails)
 *   {slug}-detail.jpg → scrolled interior (for project detail pages)
 */

'use strict';

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'img', 'projects');

// Map slug → config
// wait: ms to wait after load for animations to finish
// detailScroll: pixels to scroll for the detail shot
// dismissIntro: JS to run to skip intro/splash before capturing
const PROJECTS = {
  pulz: {
    path: '/Users/vela/Desktop/PULZ/index.html',
    wait: 3000,
    detailScroll: 3000,
  },
  beokey: {
    path: '/Users/vela/Desktop/BeOkey/index.html',
    wait: 2500,
    detailScroll: 0,
    detailAction: `
      // BeOkey uses horizontal scroll via translateX on .horizontal-container
      // Scroll to the about/services section by clicking nav link
      const aboutLink = document.querySelector('a[href="#sobre-mi"]');
      if (aboutLink) aboutLink.click();
    `,
    detailActionWait: 2000,
  },
  indoyoga: {
    path: '/Users/vela/Desktop/IndoYoga/index.html',
    wait: 5000,
    detailScroll: 3000,
    dismissIntro: `
      const loader = document.getElementById('loader');
      if (loader) loader.style.display = 'none';
    `,
  },
  lavere: {
    path: '/Users/vela/Desktop/LaVereWeb/index.html',
    wait: 3000,
    detailScroll: 2500,
  },
  yaricasanova: {
    path: '/Users/vela/Desktop/YariCasanova/index.html',
    wait: 6000,
    detailScroll: 1500,
    dismissIntro: `
      // Simulate a click to trigger the intro dismissal (which inits Lenis + shows #site)
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    `,
    dismissWait: 3000,
  },
  basslayer: {
    path: '/Users/vela/Desktop/BassLayer/preview.html',
    wait: 4000,
    detailScroll: 0,
    dismissIntro: `
      // Dismiss preloader
      const pre = document.querySelector('.bl-preloader');
      if (pre) pre.classList.add('done');
    `,
    dismissWait: 2000,
    // For the detail shot, navigate to Bass view
    detailAction: `
      // Click Bass to enter the sections view
      const bassWord = document.querySelector('.bl-word-bass');
      if (bassWord) bassWord.click();
    `,
    detailActionWait: 2000,
  },
  sopla: {
    path: '/Users/vela/Desktop/Sopla/index.html',
    wait: 3000,
    dismissIntro: `
      // Center the hero content vertically for a better thumbnail
      var pane0 = document.querySelector('.pane-0');
      if (pane0) pane0.style.alignItems = 'center';
      // Hide theme toggle for cleaner shot
      var theme = document.getElementById('themeToggle');
      if (theme) theme.style.display = 'none';
    `,
    dismissWait: 500,
    detailScroll: 0,
    detailAction: `
      // Select Buenos Aires province to navigate to spots list
      var bsas = document.querySelector('[data-province="bsas"]');
      if (bsas) bsas.click();

      // After transition, expand pane-1 to full width and hide pane-0
      setTimeout(function() {
        var p0 = document.getElementById('pane0');
        if (p0) p0.style.display = 'none';
        var inner = document.querySelector('.pane-1-inner');
        if (inner) { inner.style.maxWidth = '100%'; }
      }, 1200);
    `,
    detailActionWait: 3500,
  },
};

async function hideOverlays(page) {
  await page.evaluate(() => {
    document.querySelectorAll(
      '#c-dot, #c-ring, #grain, .cursor, [id*="cursor"], .scroll-indicator, .scroll-hint, .progress-bar, #progress'
    ).forEach(el => el.style.display = 'none');
  });
}

async function scrollDown(page, slug, distance) {
  await page.evaluate((dist) => {
    // Ensure body is tall enough to scroll
    const docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      dist + window.innerHeight + 500
    );
    document.body.style.minHeight = docH + 'px';

    // 1. Native scroll
    window.scrollTo(0, dist);

    // 2. Lenis API (YariCasanova)
    if (window.lenis) {
      window.lenis.scrollTo(dist, { immediate: true });
      window.lenis.raf(performance.now());
    }

    // 3. Direct transform for custom smooth scroll (#smooth-content — IndoYoga)
    const content = document.getElementById('smooth-content');
    if (content) {
      content.style.transform = 'translateY(' + (-dist) + 'px)';
    }

    // 4. Fixed footer handling (IndoYoga has fixed footer)
    const footer = document.querySelector('footer');
    if (footer && getComputedStyle(footer).position === 'fixed') {
      footer.style.transform = 'translateY(' + (-dist) + 'px)';
    }

    // 5. For scroll-wrap style smooth scroll (position fixed + transform)
    const wrap = document.getElementById('scroll-wrap');
    if (wrap && getComputedStyle(wrap).position === 'fixed') {
      wrap.style.transform = 'translate3d(0, ' + (-dist) + 'px, 0)';
    }
  }, distance);
  // Let any triggered animations settle
  await new Promise(r => setTimeout(r, 2500));
}

async function captureProject(browser, slug, config) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  const url = 'file://' + config.path;
  console.log(`  ${slug}: loading...`);

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, config.wait));

  // Dismiss intro/splash if needed
  if (config.dismissIntro) {
    await page.evaluate(config.dismissIntro);
    const dWait = config.dismissWait || 1000;
    await new Promise(r => setTimeout(r, dWait));
  }

  await hideOverlays(page);

  // 1. Hero screenshot (card thumbnail)
  const heroPath = path.join(OUTPUT_DIR, `${slug}.jpg`);
  await page.screenshot({
    path: heroPath,
    type: 'jpeg',
    quality: 90,
    clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
  });
  console.log(`  ${slug}: hero → ${slug}.jpg`);

  // 2a. Run detail action if defined (e.g. navigate to interior view)
  if (config.detailAction) {
    await page.evaluate(config.detailAction);
    const aWait = config.detailActionWait || 1500;
    await new Promise(r => setTimeout(r, aWait));
    await hideOverlays(page);

    const detailPath = path.join(OUTPUT_DIR, `${slug}-detail.jpg`);
    await page.screenshot({
      path: detailPath,
      type: 'jpeg',
      quality: 90,
    });
    console.log(`  ${slug}: detail → ${slug}-detail.jpg`);
    await page.close();
    return;
  }

  // 2. Prepare for detail: disable smooth scroll, make content static
  await page.evaluate(() => {
    // Kill all position:fixed elements that are large (scroll wrappers, hero sections)
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (s.position === 'fixed' && el.offsetHeight > window.innerHeight * 0.5) {
        el.style.position = 'absolute';
        el.style.transform = 'none';
      }
    });
    // Ensure body is scrollable
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.minHeight = (document.body.scrollHeight + 5000) + 'px';
  });
  await new Promise(r => setTimeout(r, 500));

  // 3. Scroll down via native scroll (now that everything is position:absolute)
  await page.evaluate((dist) => {
    window.scrollTo(0, dist);
  }, config.detailScroll);
  await new Promise(r => setTimeout(r, 1500));
  await hideOverlays(page);

  const detailPath = path.join(OUTPUT_DIR, `${slug}-detail.jpg`);
  // Capture current viewport (no clip — captures what's visible after scroll)
  await page.screenshot({
    path: detailPath,
    type: 'jpeg',
    quality: 90,
  });
  console.log(`  ${slug}: detail → ${slug}-detail.jpg`);

  await page.close();
}

async function main() {
  const args = process.argv.slice(2);
  const slugs = args.length > 0
    ? args.filter(s => PROJECTS[s])
    : Object.keys(PROJECTS);

  if (slugs.length === 0) {
    console.error('No valid projects found. Available:', Object.keys(PROJECTS).join(', '));
    process.exit(1);
  }

  for (const slug of slugs) {
    if (!fs.existsSync(PROJECTS[slug].path)) {
      console.error(`  ${slug}: file not found at ${PROJECTS[slug].path}`);
      process.exit(1);
    }
  }

  console.log(`\nCapturing ${slugs.length} project(s) × 2 screenshots...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const slug of slugs) {
    await captureProject(browser, slug, PROJECTS[slug]);
  }

  await browser.close();
  console.log('\nDone.\n');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
