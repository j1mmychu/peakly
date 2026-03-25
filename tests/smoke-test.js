#!/usr/bin/env node
/**
 * Peakly Smoke Test
 *
 * Runs headless browser checks against the live site + API endpoints.
 *
 * Requirements: puppeteer or puppeteer-core
 *   npm install puppeteer
 *
 * Usage:
 *   node tests/smoke-test.js
 *   node tests/smoke-test.js --url http://localhost:8000   # test local
 *
 * Exit codes: 0 = all passed, 1 = one or more checks failed
 */

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

// ─── Config ───────────────────────────────────────────────────────────────────

const SITE_URL = process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'https://j1mmychu.github.io/peakly/';

const FLIGHT_API_URL = 'https://peakly-api.duckdns.org/api/flights?origin=LAX&destination=CDG&depart_date=2026-04-15&return_date=2026-04-22&currency=USD';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=43.0&longitude=-74.0&daily=temperature_2m_max&forecast_days=1';
const MARINE_API_URL = 'https://marine-api.open-meteo.com/v1/marine?latitude=33.9&longitude=-118.4&daily=wave_height_max&forecast_days=1';

const TIMEOUT_MS = 30000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results = [];

function pass(name) {
  passed++;
  results.push({ status: 'PASS', name });
  console.log(`  ✓  ${name}`);
}

function fail(name, reason) {
  failed++;
  results.push({ status: 'FAIL', name, reason });
  console.error(`  ✗  ${name}`);
  console.error(`     └─ ${reason}`);
}

function fetchUrl(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.on('error', reject);
  });
}

function checkPuppeteer() {
  try {
    require.resolve('puppeteer');
    return true;
  } catch {
    return false;
  }
}

// ─── API checks (no browser required) ────────────────────────────────────────

async function checkApiEndpoints() {
  console.log('\n── API Endpoints ──────────────────────────────────────────────');

  // Open-Meteo Weather
  try {
    const res = await fetchUrl(WEATHER_API_URL);
    if (res.status === 200 && res.body.includes('temperature_2m_max')) {
      pass('Open-Meteo weather API responds with forecast data');
    } else {
      fail('Open-Meteo weather API', `HTTP ${res.status}, unexpected body`);
    }
  } catch (e) {
    fail('Open-Meteo weather API', e.message);
  }

  // Open-Meteo Marine
  try {
    const res = await fetchUrl(MARINE_API_URL);
    if (res.status === 200 && res.body.includes('wave_height_max')) {
      pass('Open-Meteo marine API responds with wave data');
    } else {
      fail('Open-Meteo marine API', `HTTP ${res.status}, unexpected body`);
    }
  } catch (e) {
    fail('Open-Meteo marine API', e.message);
  }

  // Flight proxy (Peakly VPS)
  try {
    const res = await fetchUrl(FLIGHT_API_URL, 12000);
    if (res.status === 200) {
      pass('Peakly flight proxy (peakly-api.duckdns.org) returns HTTP 200');
    } else if (res.status === 429) {
      pass('Peakly flight proxy reachable (rate-limited — upstream quota, not a proxy failure)');
    } else if (res.status === 502 || res.status === 503) {
      fail('Peakly flight proxy', `HTTP ${res.status} — VPS or Caddy may be down`);
    } else {
      // Non-200 still means the proxy is reachable
      pass(`Peakly flight proxy reachable (HTTP ${res.status})`);
    }
  } catch (e) {
    fail('Peakly flight proxy reachable', e.message + ' — check VPS at 198.199.80.21');
  }
}

// ─── Static site checks (no browser required) ────────────────────────────────

async function checkStaticSite() {
  console.log('\n── Static Site ────────────────────────────────────────────────');

  try {
    const res = await fetchUrl(SITE_URL, 15000);

    if (res.status === 200) {
      pass(`Site returns HTTP 200 (${SITE_URL})`);
    } else {
      fail('Site HTTP status', `Got ${res.status}, expected 200`);
      return; // Can't do further checks on the body
    }

    if (res.body.includes('<title>') && res.body.toLowerCase().includes('peakly')) {
      pass('Page title contains "Peakly"');
    } else {
      fail('Page title', 'Title tag missing or does not contain "Peakly"');
    }

    if (res.body.includes('app.jsx')) {
      pass('app.jsx script tag present in HTML');
    } else {
      fail('app.jsx script tag', 'Script tag for app.jsx not found in HTML');
    }

    if (res.body.includes('manifest.json')) {
      pass('PWA manifest linked in HTML');
    } else {
      fail('PWA manifest', 'manifest.json link not found in HTML');
    }

    if (res.body.includes('sw.js') || res.body.includes('serviceWorker')) {
      pass('Service worker registration present');
    } else {
      fail('Service worker', 'sw.js or serviceWorker registration not found in HTML');
    }

    // Check Content-Security headers (nice-to-have)
    const contentType = res.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      pass('Response Content-Type is text/html');
    } else {
      fail('Content-Type', `Expected text/html, got: ${contentType}`);
    }

  } catch (e) {
    fail('Site reachable', e.message);
  }
}

// ─── Browser checks (puppeteer) ──────────────────────────────────────────────

async function checkWithBrowser() {
  console.log('\n── Browser Rendering ──────────────────────────────────────────');

  if (!checkPuppeteer()) {
    console.log('  ⚠  puppeteer not installed — skipping browser checks');
    console.log('     Install with: npm install puppeteer');
    return;
  }

  const puppeteer = require('puppeteer');
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: TIMEOUT_MS,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 }); // iPhone 14 Pro

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Navigate
    try {
      await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: TIMEOUT_MS });
      pass('Page loads without navigation error');
    } catch (e) {
      fail('Page load', e.message);
      return;
    }

    // Title
    const title = await page.title();
    if (title && title.toLowerCase().includes('peakly')) {
      pass(`Page title is "${title}"`);
    } else {
      fail('Page title in browser', `Got "${title}", expected to contain "Peakly"`);
    }

    // Wait for React to hydrate — look for venue cards
    try {
      // Cards have data-testid or just look for card-like elements
      // The app renders ListingCard / CompactCard — look for venue names or score badges
      await page.waitForFunction(() => {
        const cards = document.querySelectorAll('[style*="border-radius"][style*="background"]');
        return cards.length > 3;
      }, { timeout: 15000 });
      pass('Venue cards rendered (React hydrated successfully)');
    } catch (e) {
      fail('Venue cards', 'No cards found after 15s — React may have failed to render');
    }

    // Bottom nav (3 tabs: Explore, Alerts, Profile)
    const navPresent = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Explore') && text.includes('Alerts') && text.includes('Profile');
    });
    if (navPresent) {
      pass('Bottom nav tabs present (Explore, Alerts, Profile)');
    } else {
      fail('Bottom nav', 'Could not find Explore / Alerts / Profile tab labels');
    }

    // Search bar / filter area
    const searchPresent = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, [placeholder]');
      // Also check for the pill buttons (category filters)
      const pills = document.querySelectorAll('[style*="border-radius"][style*="pill"], button');
      return inputs.length > 0 || pills.length > 5;
    });
    if (searchPresent) {
      pass('Search bar / filter controls present');
    } else {
      fail('Search bar', 'No input or filter pill elements found');
    }

    // No fatal console errors (Babel parse errors show up here)
    const fatalErrors = consoleErrors.filter(e =>
      e.includes('SyntaxError') ||
      e.includes('Unexpected token') ||
      e.includes('Cannot read') ||
      e.includes('is not defined')
    );
    if (fatalErrors.length === 0) {
      pass('No fatal JavaScript errors in console');
    } else {
      fail('Console errors', fatalErrors.slice(0, 3).join(' | '));
    }

  } catch (e) {
    fail('Browser test runner', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function printSummary() {
  console.log('\n── Summary ────────────────────────────────────────────────────');
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total:  ${passed + failed}`);

  if (failed > 0) {
    console.log('\n  Failed checks:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`    ✗ ${r.name}: ${r.reason}`);
    });
    console.log('');
    process.exit(1);
  } else {
    console.log('\n  All checks passed.\n');
    process.exit(0);
  }
}

// ─── Run ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('Peakly Smoke Test');
  console.log(`Target: ${SITE_URL}`);
  console.log(`Time:   ${new Date().toISOString()}`);

  await checkStaticSite();
  await checkApiEndpoints();
  await checkWithBrowser();
  printSummary();
})();
