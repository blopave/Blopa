// capture.mjs — Take screenshots of project sites
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(import.meta.dirname, '..', 'assets', 'img', 'projects', 'captures');
mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1440, height: 900 };

// Sites to capture with scroll positions
const sites = [
  {
    name: 'basslayer',
    url: 'https://basslayer.io',
    waitFor: 3000,
    scrollStops: [0, 900, 1800],
  },
  {
    name: 'indoyoga',
    url: 'https://indoyoga.org',
    waitFor: 3000,
    scrollStops: [0, 900, 1800, 2700, 3600],
  },
];

// Local projects served via file://
const localBase = join(import.meta.dirname, '..');
const localSites = [
  { name: 'pulz', file: 'projects/pulz.html' },
  { name: 'beokey', file: 'projects/beokey.html' },
  { name: 'lavere', file: 'projects/lavere.html' },
  { name: 'yaricasanova', file: 'projects/yaricasanova.html' },
  { name: 'sopla', file: 'projects/sopla.html' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });

  // Capture remote sites
  for (const site of sites) {
    console.log(`\n📸 ${site.name} — ${site.url}`);
    const page = await context.newPage();
    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(site.waitFor);

      for (let i = 0; i < site.scrollStops.length; i++) {
        await page.evaluate(y => window.scrollTo(0, y), site.scrollStops[i]);
        await page.waitForTimeout(800);
        const path = join(OUT, `${site.name}-${i + 1}.jpg`);
        await page.screenshot({ path, type: 'jpeg', quality: 90 });
        console.log(`  ✓ ${site.name}-${i + 1}.jpg (scroll: ${site.scrollStops[i]}px)`);
      }

      // Full page capture
      const fullPath = join(OUT, `${site.name}-full.jpg`);
      await page.screenshot({ path: fullPath, type: 'jpeg', quality: 85, fullPage: true });
      console.log(`  ✓ ${site.name}-full.jpg (full page)`);
    } catch (err) {
      console.error(`  ✗ ${site.name} failed:`, err.message);
    }
    await page.close();
  }

  // Capture local project detail pages
  for (const local of localSites) {
    const url = `file://${join(localBase, local.file)}`;
    console.log(`\n📸 ${local.name} (local) — ${local.file}`);
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 10000 });
      await page.waitForTimeout(1500);

      // Hero screenshot
      const heroPath = join(OUT, `${local.name}-hero.jpg`);
      await page.screenshot({ path: heroPath, type: 'jpeg', quality: 90 });
      console.log(`  ✓ ${local.name}-hero.jpg`);

      // Scroll down for detail
      await page.evaluate(() => window.scrollTo(0, 900));
      await page.waitForTimeout(600);
      const detailPath = join(OUT, `${local.name}-detail-cap.jpg`);
      await page.screenshot({ path: detailPath, type: 'jpeg', quality: 90 });
      console.log(`  ✓ ${local.name}-detail-cap.jpg`);
    } catch (err) {
      console.error(`  ✗ ${local.name} failed:`, err.message);
    }
    await page.close();
  }

  await browser.close();
  console.log(`\n✅ Done — captures saved to ${OUT}`);
})();
