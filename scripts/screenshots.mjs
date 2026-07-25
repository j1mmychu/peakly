// App Store screenshot generator — captures 6.9" iPhone shots (1320×2868 px)
// of the real app with seeded (deterministic, realistic) weather so every
// screen renders fully scored — no waiting on live APIs, no blank states.
//
// Run:  node scripts/screenshots.mjs
// Out:  app-store/screenshots/*.png  (upload directly to App Store Connect)
//
// Serves dist/ locally (run `node scripts/build-ios.mjs` first if dist/ is
// stale) and intercepts the weather/marine/flight endpoints with plausible
// July conditions: southern-hemisphere ski venues get powder, beaches get sun.

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "app-store", "screenshots");
const PORT = 8003;

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright not found. Run: npm install && npx playwright install chromium");
  process.exit(1);
}

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("dist/ missing — run `node scripts/build-ios.mjs` first.");
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

// ─── static server for dist/ ─────────────────────────────────────────────────
const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".css": "text/css", ".xml": "application/xml", ".txt": "text/plain" };
const server = http.createServer((req, res) => {
  let p = req.url.split("?")[0];
  if (p === "/") p = "/index.html";
  const file = path.join(DIST, decodeURIComponent(p));
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end("nope");
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(PORT, r));

// ─── deterministic fake conditions ───────────────────────────────────────────
const hash01 = (lat, lon) => {
  let h = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
  return h - Math.floor(h);
};
const days14 = () => {
  const out = [];
  const d = new Date();
  for (let i = 0; i < 14; i++) { out.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
  return out;
};
const arr = (n, f) => Array.from({ length: 14 }, (_, i) => +(f(i)).toFixed(1));

function fakeWeather(lat, lon) {
  const r = hash01(lat, lon);
  const ski = lat < -25; // July: southern-hemisphere winter
  const daily = ski ? {
    time: days14(),
    temperature_2m_max: arr(14, i => 22 + r * 10 + Math.sin(i) * 3),
    temperature_2m_min: arr(14, i => 10 + r * 8 + Math.sin(i) * 2),
    precipitation_sum: arr(14, i => (i % 3 === 0 ? 4 + r * 6 : 0.5)),
    snowfall_sum: arr(14, i => (i % 3 === 0 ? 8 + r * 14 : 2 + r * 4)),
    snow_depth_max: arr(14, i => 1.0 + r * 0.8 + i * 0.015),
    wind_speed_10m_max: arr(14, () => 6 + r * 8),
    wind_gusts_10m_max: arr(14, () => 14 + r * 10),
    wind_direction_10m_dominant: arr(14, () => 220),
    uv_index_max: arr(14, () => 3 + r * 2),
    weather_code: Array.from({ length: 14 }, (_, i) => (i % 3 === 0 ? 73 : i % 3 === 1 ? 71 : 0)),
    precipitation_probability_max: arr(14, i => (i % 3 === 0 ? 70 : 25)),
    sunshine_duration: arr(14, i => (i % 3 === 2 ? 28000 : 14000)),
    rain_sum: arr(14, () => 0),
    showers_sum: arr(14, () => 0),
    relative_humidity_2m_max: arr(14, () => 70 + r * 10),
    cloud_cover_max: arr(14, i => (i % 3 === 0 ? 85 : 35)),
  } : {
    time: days14(),
    temperature_2m_max: arr(14, i => 80 + r * 9 + Math.sin(i) * 2),
    temperature_2m_min: arr(14, i => 68 + r * 6),
    precipitation_sum: arr(14, i => (r > 0.75 && i % 5 === 0 ? 1.5 : 0)),
    snowfall_sum: arr(14, () => 0),
    snow_depth_max: arr(14, () => 0),
    wind_speed_10m_max: arr(14, () => 5 + r * 7),
    wind_gusts_10m_max: arr(14, () => 10 + r * 8),
    wind_direction_10m_dominant: arr(14, () => 180),
    uv_index_max: arr(14, () => 7.5 + r * 2),
    weather_code: Array.from({ length: 14 }, (_, i) => (i % 4 === 3 ? 1 : 0)),
    precipitation_probability_max: arr(14, () => 5 + r * 15),
    sunshine_duration: arr(14, () => 36000 + r * 8000),
    rain_sum: arr(14, () => 0),
    showers_sum: arr(14, () => 0),
    relative_humidity_2m_max: arr(14, () => 52 + r * 18),
    cloud_cover_max: arr(14, () => 8 + r * 25),
  };
  return { latitude: lat, longitude: lon, daily };
}
const fakeMarine = (lat, lon) => ({
  latitude: lat, longitude: lon,
  daily: { time: days14(), sea_surface_temperature_max: arr(14, () => 24 + hash01(lat, lon) * 4) },
});
const q = (url, key) => parseFloat(new URL(url).searchParams.get(key));

// Real typical prices from the app itself, so fake fares read believable
// (12–30% below typical, not "$215 to New Zealand").
let BASE_PRICES = {};
try {
  const src = fs.readFileSync(path.join(ROOT, "app.jsx"), "utf8");
  const start = src.indexOf("const BASE_PRICES = {");
  const slice = src.slice(start + "const BASE_PRICES = ".length);
  let depth = 0, end = 0;
  for (let i = 0; i < slice.length; i++) {
    if (slice[i] === "{") depth++;
    else if (slice[i] === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  BASE_PRICES = new Function("return " + slice.slice(0, end))();
} catch { /* fall back to flat pricing */ }

// ─── browser ─────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 440, height: 956 },  // 6.9" iPhone pts — ×3 = 1320×2868
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  timezoneId: "America/Denver",
});

await ctx.addInitScript(() => {
  const now = Date.now();
  localStorage.setItem("peakly_profile", JSON.stringify({
    name: "", email: "", homeAirport: "DEN", homeAirport2: "", homeAirports: ["DEN"],
    sports: ["skiing", "beach"], skillLevels: {}, skill: "Intermediate",
    hasAccount: true, onboarded_at: now, notifyPeak: true, notifyDeal: true, notifyWeekly: false,
  }));
  localStorage.setItem("peakly_scoring_explainer_dismissed", "true");
  localStorage.setItem("peakly_install_dismissed", JSON.stringify(now));
  localStorage.setItem("peakly_account_nudge_dismissed", JSON.stringify(now));
  localStorage.setItem("peakly_airport_setup_done", "true");
  localStorage.setItem("peakly_score_seen", "true");
  // Keep the service worker from hijacking reloads mid-run
  if (navigator.serviceWorker) navigator.serviceWorker.register = () => Promise.resolve({});
});

const page = await ctx.newPage();

// Weather — proxy shape and direct shape
await page.route("**/api/weather*", route => route.fulfill({ json: { success: true, data: fakeWeather(q(route.request().url(), "lat"), q(route.request().url(), "lon")) } }));
await page.route("**/api/marine*", route => route.fulfill({ json: { success: true, data: fakeMarine(q(route.request().url(), "lat"), q(route.request().url(), "lon")) } }));
await page.route("**api.open-meteo.com/**", route => route.fulfill({ json: fakeWeather(q(route.request().url(), "latitude"), q(route.request().url(), "longitude")) }));
await page.route("**marine-api.open-meteo.com/**", route => route.fulfill({ json: fakeMarine(q(route.request().url(), "latitude"), q(route.request().url(), "longitude")) }));
// Flights — plausible weekend fares
await page.route("**/api/flights*", route => {
  const u = new URL(route.request().url());
  const dest = u.searchParams.get("destination") || "XXX";
  const origin = u.searchParams.get("origin") || "DEN";
  const dd = u.searchParams.get("depart_date") || days14()[1];
  const rd = u.searchParams.get("return_date") || days14()[3];
  let h = 0; for (const c of dest) h = (h * 31 + c.charCodeAt(0)) % 997;
  const typical = BASE_PRICES[dest]?.[origin] || BASE_PRICES[dest]?.DEN || 550;
  const price = Math.round(typical * (0.72 + (h % 100) / 100 * 0.18)); // 10–28% below typical
  return route.fulfill({ json: { success: true, data: { [dest]: { "0": { price, found_at: new Date().toISOString(), depart_date: dd, return_date: rd } } } } });
});
// Kill analytics/Sentry noise
for (const pat of ["**plausible.io/**", "**sentry**"]) await page.route(pat, r => r.fulfill({ status: 204, body: "" }));

const shot = async (name) => {
  await page.screenshot({ path: path.join(OUT, name) });
  console.log("✓", name);
};
const tryStep = async (label, fn) => {
  try { await fn(); } catch (e) { console.warn("⚠ skipped", label, "—", e.message.split("\n")[0]); }
};

console.log("Loading app…");
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "load" });
await page.waitForTimeout(20000); // let all venue batches score

// 1. Explore — default (beach in N-hemisphere July)
await shot("1-explore-beach.png");

// 2. Explore — skiing (southern winter powder)
await tryStep("ski pill", async () => {
  await page.getByText("Skiing", { exact: true }).first().click();
  await page.waitForTimeout(4000);
  await shot("2-explore-ski.png");
});

// 3. Venue detail sheet (7-day view)
await tryStep("detail sheet", async () => {
  await page.getByText("View Details", { exact: true }).first().click();
  await page.waitForTimeout(2500);
  await shot("3-venue-detail.png");
});

// 4. Why this score? breakdown
await tryStep("score breakdown", async () => {
  await page.getByText("Why this score?").first().click();
  await page.waitForTimeout(1200);
  await shot("4-score-breakdown.png");
});

// Sheet doesn't close on Escape — reload instead (weather is localStorage-cached
// by now, so re-render is fast) and go straight to the tabs.
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(8000);

// 5. Alerts tab — bottom-nav coordinates (text locators miss the nav labels)
await tryStep("alerts tab", async () => {
  await page.mouse.click(222, 920);
  await page.waitForTimeout(1800);
  await shot("5-alerts.png");
});

// 6. Profile tab
await tryStep("profile tab", async () => {
  await page.mouse.click(358, 920);
  await page.waitForTimeout(1800);
  await shot("6-profile.png");
});

await browser.close();
server.close();
console.log(`\nDone → ${OUT}`);
console.log("Each PNG is 1320×2868 (6.9\" iPhone). Upload the keepers to App Store Connect → your app → iOS App → Screenshots.");
