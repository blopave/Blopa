import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(import.meta.dirname, '..', 'assets', 'img', 'projects', 'captures');
mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  console.log('📸 basslayer — interactive capture');

  await page.goto('https://basslayer.io', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Dismiss modal
  const btn = await page.$('button:has-text("ENTENDIDO"), button:has-text("entendido")');
  if (btn) {
    await btn.click();
    console.log('  ✓ Modal dismissed');
    await page.waitForTimeout(1500);
  }

  // Capture the hero/landing as-is (light mode)
  await page.screenshot({ path: join(OUT, 'basslayer-hero-light.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-hero-light.jpg');

  // Try to hover on "Bass" text to reveal the events section
  const bassText = await page.$('text=Bass');
  if (bassText) {
    await bassText.hover();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(OUT, 'basslayer-bass-hover.jpg'), type: 'jpeg', quality: 90 });
    console.log('  ✓ basslayer-bass-hover.jpg (hovering Bass)');
  }

  // Try "Layer" text for crypto section
  const layerText = await page.$('text=LAYER');
  if (layerText) {
    await layerText.hover();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(OUT, 'basslayer-layer-hover.jpg'), type: 'jpeg', quality: 90 });
    console.log('  ✓ basslayer-layer-hover.jpg (hovering Layer)');
  }

  // Try clicking on Bass to enter that section
  if (bassText) {
    await bassText.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(OUT, 'basslayer-events-1.jpg'), type: 'jpeg', quality: 90 });
    console.log('  ✓ basslayer-events-1.jpg');

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(OUT, 'basslayer-events-2.jpg'), type: 'jpeg', quality: 90 });
    console.log('  ✓ basslayer-events-2.jpg');

    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(OUT, 'basslayer-events-3.jpg'), type: 'jpeg', quality: 90 });
    console.log('  ✓ basslayer-events-3.jpg');
  }

  // Go back and try Layer
  await page.goto('https://basslayer.io', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  const btn2 = await page.$('button:has-text("ENTENDIDO"), button:has-text("entendido")');
  if (btn2) { await btn2.click(); await page.waitForTimeout(1500); }

  const layerText2 = await page.$('text=Layer');
  if (layerText2) {
    await layerText2.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(OUT, 'basslayer-crypto-1.jpg'), type: 'jpeg', quality: 90 });
    console.log('  ✓ basslayer-crypto-1.jpg');

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(OUT, 'basslayer-crypto-2.jpg'), type: 'jpeg', quality: 90 });
    console.log('  ✓ basslayer-crypto-2.jpg');
  }

  // Dark mode toggle
  const darkToggle = await page.$('[class*="dark"], [class*="theme"], button:has-text("🌙"), [aria-label*="theme"], [aria-label*="dark"]');
  if (darkToggle) {
    await darkToggle.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT, 'basslayer-dark.jpg'), type: 'jpeg', quality: 90 });
    console.log('  ✓ basslayer-dark.jpg');
  }

  await browser.close();
  console.log('\n✅ Done');
})();
