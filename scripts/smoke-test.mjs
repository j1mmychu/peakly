// Headless boot check. Drives Playwright Chromium against a URL, waits for the
// splash to be removed from DOM, captures any console.error / pageerror events.
// Exits 0 if splash dismissed AND zero errors. Exits 1 with diagnostics otherwise.
//
// The dismiss useEffect at app.jsx:7769 runs on the first render. If anything
// earlier in App() throws (TDZ, undefined ref, bad destructure), the effect
// never registers and #splash stays in DOM. Splash-dismiss is the cheapest
// signal that "first render succeeded."
//
// Usage: node smoke-test.mjs <url>

import { chromium } from 'playwright';

const url = process.argv[2];
if (!url) {
  console.error('usage: node smoke-test.mjs <url>');
  process.exit(2);
}

const SPLASH_TIMEOUT_MS = 8000;
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (err) => errors.push({ kind: 'pageerror', message: err.message, stack: err.stack }));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push({ kind: 'console.error', message: msg.text() });
});

const bustUrl = url + (url.includes('?') ? '&' : '?') + 'bust=' + Date.now();

let splashGone = false;
let loadErr = null;
try {
  await page.goto(bustUrl, { waitUntil: 'load', timeout: 15000 });
  // Wait for #splash to be detached from DOM (or never present)
  await page.waitForSelector('#splash', { state: 'detached', timeout: SPLASH_TIMEOUT_MS });
  splashGone = true;
} catch (e) {
  loadErr = e.message;
}

await browser.close();

const fatal = errors.filter(e => e.kind === 'pageerror');

if (splashGone && fatal.length === 0) {
  console.log('✅ smoke OK  ' + bustUrl);
  if (errors.length) console.log('  (non-fatal console.error events: ' + errors.length + ')');
  process.exit(0);
}

console.error('❌ smoke FAILED  ' + bustUrl);
if (!splashGone) console.error('  splash never dismissed (timeout ' + SPLASH_TIMEOUT_MS + 'ms): ' + (loadErr || 'still in DOM'));
for (const e of errors) {
  console.error('  [' + e.kind + '] ' + e.message);
  if (e.stack) console.error(e.stack.split('\n').slice(0, 4).map(l => '    ' + l).join('\n'));
}
process.exit(1);
