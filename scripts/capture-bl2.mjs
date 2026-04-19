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
  console.log('📸 basslayer — mouse coordinate approach');

  await page.goto('https://basslayer.io', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Dismiss modal
  try {
    await page.click('text=ENTENDIDO', { timeout: 5000 });
    console.log('  ✓ Modal dismissed');
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('  - No modal found');
  }

  // Hero capture
  await page.screenshot({ path: join(OUT, 'basslayer-hero.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-hero.jpg');

  // Move mouse slowly to "Bass" area (left side of the text, roughly center of viewport)
  // The text "Bass LAYER" is centered, "Bass" is roughly at x:500, y:450
  await page.mouse.move(400, 450, { steps: 20 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, 'basslayer-bass-hover.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-bass-hover.jpg');

  // Click on Bass area
  await page.mouse.click(400, 450);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(OUT, 'basslayer-bass-click.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-bass-click.jpg');

  // Scroll down in case content appeared
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(OUT, 'basslayer-bass-scroll1.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-bass-scroll1.jpg');

  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(OUT, 'basslayer-bass-scroll2.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-bass-scroll2.jpg');

  // Go back to top, try Layer side (right side, x:900, y:450)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.mouse.move(900, 450, { steps: 20 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, 'basslayer-layer-hover.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-layer-hover.jpg');

  await page.mouse.click(900, 450);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(OUT, 'basslayer-layer-click.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-layer-click.jpg');

  // Try navigating directly to routes
  console.log('\n  Trying direct routes...');

  await page.goto('https://basslayer.io/bass', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(OUT, 'basslayer-bass-route.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-bass-route.jpg');

  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(OUT, 'basslayer-bass-route-2.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-bass-route-2.jpg');

  await page.goto('https://basslayer.io/layer', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(OUT, 'basslayer-layer-route.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-layer-route.jpg');

  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(OUT, 'basslayer-layer-route-2.jpg'), type: 'jpeg', quality: 90 });
  console.log('  ✓ basslayer-layer-route-2.jpg');

  await browser.close();
  console.log('\n✅ Done');
})();
