import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(import.meta.dirname, '..', 'assets', 'img', 'projects', 'captures');
mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1440, height: 900 };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });

  // ── BassLayer — dismiss modal then capture ──
  console.log('\n📸 basslayer — dismiss modal + capture');
  const blPage = await context.newPage();
  try {
    await blPage.goto('https://basslayer.io', { waitUntil: 'networkidle', timeout: 25000 });
    await blPage.waitForTimeout(3000);

    // Dismiss the welcome modal
    const btn = await blPage.$('button:has-text("ENTENDIDO"), button:has-text("entendido"), [class*="modal"] button');
    if (btn) {
      await btn.click();
      console.log('  ✓ Modal dismissed');
      await blPage.waitForTimeout(2000);
    }

    // Capture multiple views
    const stops = [0, 400, 900, 1400, 2000];
    for (let i = 0; i < stops.length; i++) {
      await blPage.evaluate(y => window.scrollTo(0, y), stops[i]);
      await blPage.waitForTimeout(1000);
      const path = join(OUT, `basslayer-${i + 1}.jpg`);
      await blPage.screenshot({ path, type: 'jpeg', quality: 90 });
      console.log(`  ✓ basslayer-${i + 1}.jpg (scroll: ${stops[i]}px)`);
    }

    // Full page
    const fullPath = join(OUT, 'basslayer-full.jpg');
    await blPage.screenshot({ path: fullPath, type: 'jpeg', quality: 85, fullPage: true });
    console.log('  ✓ basslayer-full.jpg');
  } catch (err) {
    console.error('  ✗ basslayer failed:', err.message);
  }
  await blPage.close();

  // ── Local projects — more scroll stops ──
  const localBase = join(import.meta.dirname, '..');
  const locals = [
    { name: 'pulz', file: 'projects/pulz.html', stops: [0, 600, 1200, 1800, 2400] },
    { name: 'beokey', file: 'projects/beokey.html', stops: [0, 600, 1200, 1800] },
    { name: 'lavere', file: 'projects/lavere.html', stops: [0, 600, 1200, 1800] },
    { name: 'yaricasanova', file: 'projects/yaricasanova.html', stops: [0, 600, 1200, 1800] },
    { name: 'sopla', file: 'projects/sopla.html', stops: [0, 600, 1200, 1800] },
  ];

  for (const local of locals) {
    const url = `file://${join(localBase, local.file)}`;
    console.log(`\n📸 ${local.name} (local)`);
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 10000 });
      await page.waitForTimeout(2000);

      for (let i = 0; i < local.stops.length; i++) {
        await page.evaluate(y => window.scrollTo(0, y), local.stops[i]);
        await page.waitForTimeout(800);
        const path = join(OUT, `${local.name}-${i + 1}.jpg`);
        await page.screenshot({ path, type: 'jpeg', quality: 90 });
        console.log(`  ✓ ${local.name}-${i + 1}.jpg (scroll: ${local.stops[i]}px)`);
      }
    } catch (err) {
      console.error(`  ✗ ${local.name} failed:`, err.message);
    }
    await page.close();
  }

  await browser.close();
  console.log('\n✅ Done');
})();
