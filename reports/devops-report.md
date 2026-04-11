# Peakly DevOps Report — 2026-04-11

**Status: YELLOW**
**Inspector:** DevOps Agent
**Run date:** 2026-04-11

---

## Summary

Status improved significantly from yesterday. The remote landed a massive codebase update (commits `266a3c7` and `9777271`) that applied the launch-scope cut and scoring accuracy pass. app.jsx shrank from 2.0 MB to 467 KB — 77% reduction. VENUES pruned to exactly 231 launch-only entries. Email capture now POSTs to `/api/waitlist`. Cache buster and SW bumped to `20260411a`. One new P1 fixed in this report: IATA params were unsanitized on the proxy, allowing arbitrary strings to reach the Travelpayouts API. Two P2s remain open: `_alerts` in-memory state and SRI hashes on CDN scripts.

---

## 1. LIVE SITE HEALTH

| Metric | Value | Status |
|--------|-------|--------|
| app.jsx lines | 6,998 | GREEN — was 11,000 yesterday |
| app.jsx size | 467,509 bytes (467 KB) | GREEN — was 2.0 MB |
| Cache buster | `?v=20260411a` | GREEN — current |
| SW cache name | `peakly-20260411a` | GREEN — current |
| React | 18.3.1 pinned via unpkg | GREEN |
| Babel | 7.24.7 pinned via unpkg | GREEN |
| Plausible analytics | Present, active | GREEN |
| Sentry DSN | Configured | GREEN |
| CDN SRI hashes | None on React, ReactDOM, Babel | YELLOW — see P2.1 |

app.jsx dropped 77% due to the VENUES pruning from ~3,726 entries to 231. Babel parse time at runtime: estimated drop from ~3–5s TTI to ~0.8–1.5s on mid-range Android LTE. This is the most impactful perf improvement shipped to date.

---

## 2. FLIGHT PROXY STATUS

| Check | Result | Status |
|-------|--------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` | GREEN — HTTPS |
| Old HTTP IP (104.131.82.242) | Not found | GREEN |
| AbortController timeout | 5 seconds | GREEN |
| Retry logic | 3 attempts, 1.2s/2.4s backoff | GREEN |
| Fallback on failure | `_flightApiStatus = "down"`, returns null | GREEN |
| Rate limiting | 60/min/IP on all routes | GREEN |
| **IATA param validation** | **Missing → Fixed in this report** | GREEN |

**IATA validation was absent.** Both `/api/flights` and `/api/flights/latest` accepted arbitrary strings for `origin`/`destination` and forwarded them directly to the Travelpayouts API. A garbage call with `origin=XXXXX` would consume quota against an invalid route. A scan bot could drain quota in minutes.

**Fix applied to `server/proxy.js` (both endpoints):**
```js
const IATA_RE = /^[A-Z]{3}$/;

// In both /api/flights and /api/flights/latest, immediately after query extraction:
if (!IATA_RE.test(origin || '') || !IATA_RE.test(destination || '')) {
  return res.status(400).json({ success: false, error: 'origin and destination must be 3-letter IATA codes' });
}
```

Also added `period_type` enum validation (`month | year`) to `/api/flights/latest` — was accepting any string, passing it directly into the upstream URL.

**Deploy to VPS after this commit lands:**
```bash
ssh root@198.199.80.21 "cd /path/to/peakly/server && git pull origin main && pm2 restart peakly-proxy"
```

---

## 3. WEATHER & EXTERNAL API

| Check | Result | Status |
|-------|--------|--------|
| Weather batch size | 50 venues/batch | GREEN |
| Inter-batch delay | 1,000ms between batches (app.jsx:10632 → now ~line 4800 after prune) | GREEN |
| Weather cache TTL | 30 minutes in localStorage | GREEN |
| Open-Meteo tier | Free (10,000 calls/day) | YELLOW — spike risk |
| Venues fetched per cold session | 231 × ~2 API calls = ~462 | GREEN |
| Concurrent users before 10K limit | ~21 simultaneous cold sessions | YELLOW |

At 231 venues × 2 API calls × 1 cold session = 462 calls. Free tier limit: 10,000/day. At 21 concurrent cold sessions, you hit it. Before the Reddit launch, either:
1. Pre-register for Open-Meteo commercial (~$10–40/mo) — do this day of launch, not after
2. Add a one-line 429 guard: `if (resp.status === 429) return VENUES.slice(0, 50)` to cut load in half as fallback

---

## 4. SECURITY AUDIT

| Check | Result | Status |
|-------|--------|--------|
| Travelpayouts token in app.jsx | Not found | GREEN |
| Travelpayouts token in any client file | Not found | GREEN |
| `.gitignore` | Present — covers `.env`, `*.key`, `*.p12`, `*.p8`, `.claude/` | GREEN |
| Sentry DSN | Public ingest key (expected) | OK |
| IATA injection in proxy | Fixed in this report | GREEN |
| Secrets in last 20 commits | None detected | GREEN |
| CSP meta tag | Absent | YELLOW — see P2.2 |
| SRI hashes on CDN scripts | Absent | YELLOW — see P2.1 |

---

## 5. CONFIRMED FIXES FROM REMOTE COMMITS

The following CLAUDE.md "✅ Done" items are now verified in the actual code:

| Item | Verification |
|------|-------------|
| VENUES pruned to 231 launch-only entries | `grep -c 'category:\"skiing\"\|\"surfing\"\|\"tanning\"'` → 231 |
| Non-launch venues removed (diving, climbing, kite, mtb, etc.) | `grep -c non-launch categories` → 0 |
| Email capture POSTs to `/api/waitlist` | app.jsx:3361 `fetch(\`${FLIGHT_PROXY}/api/waitlist\`, ...)` |
| `/api/waitlist` endpoint in proxy.js | Present at server/proxy.js, appends to `data/waitlist.jsonl` |
| Cache buster bumped to `20260411a` | index.html:346, sw.js:2 |
| LOCAL_TIPS / PACKING constants removed | Not found in app.jsx |

---

## 6. PERFORMANCE ANALYSIS

| Metric | Value | Change |
|--------|-------|--------|
| app.jsx (uncompressed) | 467 KB | -77% from yesterday's 2.0 MB |
| Babel Standalone 7.24.7 | ~1.0 MB | unchanged |
| React 18 + ReactDOM | ~180 KB | unchanged |
| Total JS load (uncompressed) | ~1.65 MB | was ~3.1 MB |
| Est. TTI (mid-range Android, LTE) | ~1–2s | was ~3–5s |
| Images with `loading="lazy"` | All img tags | GREEN |
| GitHub Pages compression | None (no gzip/brotli) | YELLOW |

Babel remains the largest single dependency at ~1.0 MB. This is accepted tech debt — the no-build-step architecture requires it. No action until post-launch.

**Highest-ROI zero-cost improvement:** Register `peakly.app` + Cloudflare free tier. Auto-compresses 467 KB app.jsx → ~95 KB at the edge. TTI drops another 40–50%.

---

## 7. P2 — ALERTS STATE IS IN-MEMORY ONLY (3rd day flagged)

`server/proxy.js`:
```js
const _alerts = new Map(); // in-memory store (replace with DB later)
```

Every VPS restart wipes all registered push alerts. Users silently stop receiving notifications. The `fs` and `path` modules are now already required (added by waitlist endpoint). **Fix is 25 minutes.**

```js
// Add near the _alerts declaration in proxy.js:
const ALERTS_FILE = path.join(__dirname, 'data', 'alerts.json');
let _alerts = new Map();
try {
  const raw = fs.readFileSync(ALERTS_FILE, 'utf8');
  _alerts = new Map(Object.entries(JSON.parse(raw)));
} catch {}

function _saveAlerts() {
  try {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(Object.fromEntries(_alerts)));
  } catch (e) { console.error('[alerts] save failed:', e.message); }
}
// Call _saveAlerts() after every _alerts.set() and _alerts.delete()
```

---

## 8. COST PROJECTION

| Scale | Monthly Cost | Bottleneck | Notes |
|-------|-------------|------------|-------|
| Current (0–100 MAU) | **$6/month** | Nothing | DO $6 droplet, all APIs free |
| 1K MAU | **$6/month** | Open-Meteo free tier | 70+ daily new users risks 10K/day limit |
| 10K MAU | **$28–52/month** | VPS + Open-Meteo | DO $12 + OM $10–40/mo |
| 100K MAU | **$200–400/month** | Open-Meteo + VPS + Cloudflare | $24 VPS, $200 OM, Cloudflare free |

All proxy hardening fixes cost **$0**. First paid upgrade: Open-Meteo commercial $10–40/mo at ~1K MAU.

---

## What Breaks First at Scale

**Open-Meteo hits the ceiling first.** 231 venues × 2 calls × 21 simultaneous cold-cache users = 10,002 calls — just over the 10,000/day free tier. The day Peakly gets mentioned on Reddit, this fires. All venue scores go to zero. The app loads but the value prop — real-time conditions — silently breaks. Users see uniform zeroes, assume the app is broken, leave.

Prevention: sign up for Open-Meteo commercial the *day* of the Reddit post, not the day after. At $10–40/mo it's the cheapest line item relative to what it protects.

Second: **Travelpayouts quota.** Rate limiter is in place, IATA validation is now in place. The remaining vector is the app itself firing too many concurrent lookups on a cold session. The 5-second AbortController + 3-retry logic means worst case each venue takes ~18 seconds before giving up. With 231 venues × batch concurrency, the proxy can see 50+ requests/minute from a single user. Consider a tighter per-IP flight rate (10/min) on the VPS.

---

## Fixes Applied in This Report

| File | Change |
|------|--------|
| `server/proxy.js` | IATA regex validation (`/^[A-Z]{3}$/`) on `/api/flights` and `/api/flights/latest` |
| `server/proxy.js` | Removed duplicate IATA check left by merge conflict resolution |
| `server/proxy.js` | `period_type` enum validation on `/api/flights/latest` |

**VPS deploy required:**
```bash
ssh root@198.199.80.21 "cd /path/to/peakly/server && git pull origin main && pm2 restart peakly-proxy"
```

---

## Issue Tracker

| Priority | Issue | Est. Fix | Status |
|----------|-------|----------|--------|
| **P2** | Alerts state in-memory only — lost on VPS restart | 25 min | Open — proxy.js |
| **P2** | No SRI hashes on React, ReactDOM, Babel CDN scripts | 30 min | Open |
| **P2** | No CSP meta tag — blocked by Babel inline eval | Deferred | Known |
| **P2** | Plausible domain `j1mmychu.github.io` → `peakly.app` when domain registered | 2 min | Blocked on domain |
| **P3** | Open-Meteo free tier — upgrade to commercial before Reddit launch | $10–40/mo | Pre-launch task |
| **P3** | Cloudflare free tier for auto-compression (peakly.app domain) | 30 min | Blocked on domain |
