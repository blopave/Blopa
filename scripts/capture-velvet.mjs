// capture-velvet.mjs — captura screenshots de Velvet desde el dev server local.
// Velvet usa Lenis + ScrollTrigger pin del hero, así que window.scrollTo no funciona
// y los offsets en píxeles tampoco. Estrategia: scroll por mouse.wheel hasta que
// la sección target quede en el viewport (medido por getBoundingClientRect en vivo).
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(import.meta.dirname, '..', 'assets', 'img', 'projects');
const CAPTURES = join(OUT, 'captures');
mkdirSync(CAPTURES, { recursive: true });

const VIEWPORT = { width: 1440, height: 900 };
const URL = process.env.VELVET_URL || 'http://localhost:4322/';
const SETTLE_MS = 1200; // Lenis tarda ~1s en terminar la interpolación tras un wheel.
const CONVERGENCE_PX = 80;

const shots = [
  { name: 'velvet-mode-stack',    selector: '#work' },
  { name: 'velvet-mode-services', selector: '#services' },
  { name: 'velvet-mode-archive',  selector: '#archive' },
];

async function getElementTop(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? el.getBoundingClientRect().top : null;
  }, selector);
}

async function scrollUntilInView(page, selector, maxSteps = 120) {
  let lastTop = null;
  for (let i = 0; i < maxSteps; i++) {
    const top = await getElementTop(page, selector);
    if (top === null) throw new Error(`Selector no encontrado: ${selector}`);
    if (Math.abs(top) < CONVERGENCE_PX) {
      lastTop = top;
      break;
    }
    // Delta proporcional para evitar oscilar al pasar el target.
    const delta = Math.sign(top) * Math.min(250, Math.max(40, Math.abs(top) / 2));
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(60);
    lastTop = top;
  }
  await page.waitForTimeout(SETTLE_MS);
  return lastTop;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`  → ${URL}`);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);

  await page.screenshot({ path: join(OUT, 'velvet.jpg'), quality: 88, type: 'jpeg' });
  console.log(`     ✓ velvet.jpg (card)`);

  await page.screenshot({ path: join(CAPTURES, 'velvet-mode-cover.jpg'), quality: 88, type: 'jpeg' });
  console.log(`     ✓ velvet-mode-cover.jpg`);

  for (const s of shots) {
    const top = await scrollUntilInView(page, s.selector);
    await page.screenshot({ path: join(CAPTURES, `${s.name}.jpg`), quality: 88, type: 'jpeg' });
    console.log(`     ✓ ${s.name}.jpg (selector ${s.selector}, top: ${top?.toFixed(0)})`);
  }

  await browser.close();
  console.log('✅ done');
})();
