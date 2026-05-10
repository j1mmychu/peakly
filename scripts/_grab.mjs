import { chromium, devices } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ ...devices['iPhone 14 Pro'] });
const page = await ctx.newPage();
await page.goto('https://j1mmychu.github.io/peakly/?bust=' + Date.now(), { waitUntil: 'networkidle', timeout: 30000 }).catch(()=>{});
await page.waitForTimeout(3500);
await page.screenshot({ path: '/tmp/peakly-shots/01-explore.png', fullPage: false });
await page.locator('#root').first().scrollIntoViewIfNeeded().catch(()=>{});
// Try to capture filters/search if visible
await page.screenshot({ path: '/tmp/peakly-shots/02-explore-full.png', fullPage: true });
// Tap a venue card
const cards = page.locator('[role="button"], [data-testid]').first();
const card = page.locator('div').filter({ hasText: /from\s*\$/i }).first();
await card.click({ timeout: 5000 }).catch(()=>{});
await page.waitForTimeout(1200);
await page.screenshot({ path: '/tmp/peakly-shots/03-detail.png', fullPage: false });
await page.screenshot({ path: '/tmp/peakly-shots/04-detail-full.png', fullPage: true });
// Profile tab
await page.goBack().catch(()=>{});
await page.waitForTimeout(800);
const profileTab = page.locator('text=Profile').first();
await profileTab.click({ timeout: 5000 }).catch(()=>{});
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/peakly-shots/05-profile.png', fullPage: true });
// Alerts tab
const alertsTab = page.locator('text=Alerts').first();
await alertsTab.click({ timeout: 5000 }).catch(()=>{});
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/peakly-shots/06-alerts.png', fullPage: true });
await browser.close();
console.log('OK shots in /tmp/peakly-shots/');
