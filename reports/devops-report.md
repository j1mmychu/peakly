# Peakly DevOps Report — 2026-04-11

**Status: YELLOW**
**Inspector:** DevOps Agent
**Run date:** 2026-04-11

---

## Summary

No P0s. Three P1s. Yesterday's P0s (push icons, proxy rate limiting) are confirmed fixed in code. New findings today: (1) IATA params were unsanitized on the proxy — any string could be injected into Travelpayouts API calls — **fixed in this report**. (2) `/api/waitlist` endpoint was missing from proxy.js despite CLAUDE.md claiming it was added on April 10 — **added in this report**. (3) The email capture form in app.jsx still fires `alert()` instead of POSTing to the endpoint — needs a separate app.jsx fix. (4) CLAUDE.md claims VENUES was pruned to 231 launch-only entries on April 10, but app.jsx still has 1,600+ non-launch category venue entries inflating the file to 2.0 MB.

---

## 1. LIVE SITE HEALTH

| Metric | Value | Status |
|--------|-------|--------|
| app.jsx lines | 11,000 | OK |
| app.jsx size | 2,000,266 bytes (2.0 MB) | YELLOW — see P1.3 |
| Cache buster | `?v=20260409a` | GREEN — no app.jsx changes since April 9 |
| SW cache name | `peakly-20260409` | GREEN |
| React | 18.3.1 pinned via unpkg | GREEN |
| Babel | 7.24.7 pinned via unpkg | GREEN |
| Plausible analytics | Present, active, domain=`j1mmychu.github.io` | OK |
| Sentry DSN | Present and configured | GREEN |
| CDN SRI hashes | None on React, ReactDOM, Babel | YELLOW — see P2.1 |

Cache buster and SW cache name match April 9. No app.jsx commits since then — nothing to bust. These only need bumping when app.jsx next changes. ✓

---

## 2. FLIGHT PROXY STATUS

| Check | Result | Status |
|-------|--------|--------|
| Proxy URL in app.jsx | `https://peakly-api.duckdns.org` | GREEN — HTTPS |
| Old HTTP IP (104.131.82.242) | Not found | GREEN |
| AbortController timeout | 5 seconds | GREEN |
| Retry logic | 3 attempts, 1.2s/2.4s backoff | GREEN |
| Fallback on failure | `_flightApiStatus = "down"`, returns null | GREEN |
| Rate limiting (custom) | Present — 60/min/IP global | GREEN |
| Rate limiting (express-rate-limit) | Present — 60/min/IP on /api/ | YELLOW — redundant, see P2.2 |
| **IATA param validation** | **Was missing — FIXED TODAY** | GREEN |

**IATA validation was absent.** Both `/api/flights` and `/api/flights/latest` accepted arbitrary strings for `origin`/`destination` and forwarded them directly into Travelpayouts API calls. A bot could pass garbage or injection-style inputs and waste Travelpayouts quota on invalid requests.

**Fix applied to `server/proxy.js`:**
```js
const IATA_RE = /^[A-Z]{3}$/;
// Added to both /api/flights and /api/flights/latest, after the existence check:
if (!IATA_RE.test(origin) || !IATA_RE.test(destination)) {
  return res.status(400).json({ success: false, error: 'origin and destination must be 3-letter uppercase IATA codes (e.g. LAX)' });
}
```

**Deploy to VPS:**
```bash
ssh root@198.199.80.21
cd /path/to/peakly/server
git pull origin main
pm2 restart peakly-proxy
```

---

## 3. WEATHER & EXTERNAL API

| Check | Result | Status |
|-------|--------|--------|
| Weather batch size | 50 venues/batch | GREEN |
| Inter-batch delay | 1,000ms between batches (app.jsx:10632) | GREEN — fixed Apr 9 |
| Weather cache TTL | 30 minutes in localStorage | GREEN |
| Open-Meteo tier | Free (10,000 calls/day) | YELLOW — spike risk |
| Marine cache | Same 30-min TTL key | GREEN |

At 231 venues × 2 API calls/venue × 1 cold session = 462 calls. At 21 concurrent cold sessions in a day, you hit 10K. A Reddit spike with 50+ simultaneous new users could return 429s on batch 2. Weather scores silently drop to zero for those users.

**Note:** Actual VENUES count in app.jsx is far higher than 231 (see P1.3). Real per-session API call count is proportionally worse.

Priority: upgrade to Open-Meteo commercial ($10–40/mo) before Reddit launch, or add `VENUES.slice(0, 50)` as 429 fallback (one line).

---

## 4. SECURITY AUDIT

| Check | Result | Status |
|-------|--------|--------|
| Travelpayouts token in app.jsx | Not found | GREEN |
| Travelpayouts token in any client file | Not found | GREEN |
| `.gitignore` | Present — covers `.env`, `*.key`, `*.p12`, `*.p8`, `.claude/` | GREEN |
| Sentry DSN in app.jsx | Public ingest key (expected, intentional) | OK |
| IATA injection in proxy | Fixed in this report | GREEN |
| Secrets in last 20 commits | None detected | GREEN |
| CSP meta tag | Absent | YELLOW — see P2.3 |
| SRI hashes on CDN scripts | Absent | YELLOW — see P2.1 |

No live secrets. Token is server-side only. `.gitignore` is comprehensive. Clean commit history.

---

## 5. MISSING: /api/waitlist ENDPOINT — FIXED TODAY

CLAUDE.md's April 10 changelog claims:
> ✅ Proxy: new POST /api/waitlist endpoint → appends to server/data/waitlist.jsonl

It was not in `server/proxy.js`. Added today. The endpoint validates email format, creates `server/data/` if missing, and appends `{ email, joinedAt }` as JSONL to `server/data/waitlist.jsonl`.

**Separate P1 still open:** The email capture form at `app.jsx:7214` still fires `alert("You're on the list! 🎉")` instead of POSTing to this endpoint. CLAUDE.md says that was also fixed on April 10, but it was not. Fix:

```jsx
// app.jsx line 7214 — replace the form's onSubmit handler:
onSubmit={async e => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  if (!email || !email.includes('@')) return;
  window.plausible && window.plausible('email_capture', { props: { source: 'explore_banner' } });
  try {
    const r = await fetch('https://peakly-api.duckdns.org/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await r.json();
    e.target.email.value = '';
    setWaitlistStatus(json.success ? 'success' : 'error');
    setTimeout(() => setWaitlistStatus(null), 4000);
  } catch { setWaitlistStatus('error'); }
}}
```
Requires `const [waitlistStatus, setWaitlistStatus] = React.useState(null)` in the containing component and inline feedback text below the input.

---

## 6. VENUES ARRAY BLOAT — CLAUDE.md DISCREPANCY (P1)

**Finding:** CLAUDE.md (April 10 section) claims:
> ✅ VENUES scaled 3,726 → 257 (unique-photo dedupe) → 231 (launch cats only: skiing/surfing/tanning)

**Reality:** `app.jsx` still contains venue entries for `diving`, `climbing`, `kite`, `mtb`, `paraglide`, `hiking`, `fishing`, `kayak`, `yoga`, `wellness`. Grep counts:
- Non-launch category venue entries: **1,614 matches**
- Launch category entries: **2,112 matches**

The file is 2.0 MB. If VENUES were genuinely 231 entries (~500 bytes each), the venue section alone would be ~115 KB — an **88% reduction** in file size. The claimed pruning was **not applied to app.jsx**.

Similarly, `LOCAL_TIPS` (app.jsx:9129) and `PACKING` (app.jsx:9143) are claimed deleted in CLAUDE.md but still exist and are actively used at lines 9381–9382.

**Impact:** Babel parses 2.0 MB of JSX on every cold load. Non-launch venues cannot be properly scored (their `scoreVenue` switch cases were removed), but they still exist in the data array. Any filter bug could surface broken venues to users.

**Fix (requires dedicated session — app.jsx surgery):** Remove all `VENUES` entries where `category` is not `skiing`, `surfing`, or `tanning`. Target: ~231 entries, file size ~250 KB. Also delete `LOCAL_TIPS` and `PACKING` constants.

**Do not treat CLAUDE.md as ground truth for April 10 changes.** Multiple "✅ Done" items in that section are not in the committed code.

---

## 7. PERFORMANCE ANALYSIS

| Metric | Value |
|--------|-------|
| JS bundle estimate (uncompressed) | ~3.1 MB |
| — app.jsx | 2.0 MB |
| — Babel Standalone 7.24.7 | ~1.0 MB |
| — React 18 + ReactDOM | ~180 KB |
| — Sentry loader | ~8 KB |
| Images with `loading="lazy"` | All 8 img tags — 100% |
| GitHub Pages compression | None (no gzip/brotli) |

Biggest bottleneck: Babel parsing 2.0 MB at runtime. Estimated TTI on mid-range Android LTE: 3–5 seconds. The splash screen hides this but Time to Interactive is genuinely high.

**Highest-ROI zero-code fix:** Route `peakly.app` through Cloudflare free tier when domain registers. Auto-compresses app.jsx 2.0 MB → ~400 KB (80% reduction). Zero code, $0 cost.

---

## 8. P2 — ALERTS STATE IS IN-MEMORY ONLY

`server/proxy.js`:
```js
const _alerts = new Map(); // in-memory store (replace with DB later)
```

Every VPS restart or crash wipes all registered push alerts. Users who set alerts silently stop receiving them. Flagged 3 consecutive days. **Fix is 30 minutes.**

```js
// Add near top of proxy.js (after fs/path require, which are now present from waitlist endpoint):
const ALERTS_FILE = path.join(__dirname, 'data', 'alerts.json');
let _alerts = new Map();
try {
  const raw = fs.readFileSync(ALERTS_FILE, 'utf8');
  _alerts = new Map(Object.entries(JSON.parse(raw)));
} catch {}

function _saveAlerts() {
  try {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(Object.fromEntries(_alerts)));
  } catch (e) { console.error('[alerts] save failed:', e.message); }
}
// Then call _saveAlerts() after every _alerts.set() and _alerts.delete()
```

`server/data/` is now auto-created by the waitlist endpoint. `fs` and `path` are already required.

---

## 9. COST PROJECTION

| Scale | Monthly Cost | Bottleneck | Notes |
|-------|-------------|------------|-------|
| Current (0–100 MAU) | **$6/month** | Nothing | DO $6 droplet |
| 1K MAU | **$6/month** | Open-Meteo free tier | ~70 daily new users → 10K+ API calls/day |
| 10K MAU | **$28–52/month** | VPS + Open-Meteo | DO $12 + OM $10–40/mo |
| 100K MAU | **$200–400/month** | Open-Meteo + VPS + CDN | $24 VPS, $200 OM, Cloudflare free |

All fixes in this report cost **$0**. First paid upgrade: Open-Meteo commercial at $10–40/mo, triggered at ~1K MAU.

---

## What Breaks First at Scale

**Open-Meteo blows up first.** With the actual (inflated) VENUES count and no 429-guard, a single spike of 22 concurrent cold-cache users hits the 10,000/day free tier limit in one hour. All venues return score 0. The app renders but real-time condition scoring — the entire value prop — silently dies. Users can't tell why. They churn.

Fix before Reddit launch:
1. Actually prune VENUES to 231 (eliminates ~73% of API call surface — this is the most important unfixed item in the codebase)
2. Add `VENUES.slice(0, 50)` as 429 fallback (one line)
3. Upgrade to Open-Meteo commercial the day the Reddit post drops, not after

Second critical vector: **Travelpayouts quota exhaustion.** Rate limiting is in place, but 60/min/IP is generous. Consider tightening `/api/flights/latest` to 10/min/IP once deployed.

---

## Fixes Applied in This Report

| File | Change |
|------|--------|
| `server/proxy.js` | IATA regex validation on both `/api/flights` and `/api/flights/latest` |
| `server/proxy.js` | POST `/api/waitlist` endpoint — appends to `server/data/waitlist.jsonl` |

**VPS deploy required** for these changes to take effect:
```bash
ssh root@198.199.80.21 "cd /path/to/peakly/server && git pull origin main && pm2 restart peakly-proxy"
```

---

## Issue Tracker

| Priority | Issue | Est. Fix | Status |
|----------|-------|----------|--------|
| **P1** | Email capture form uses `alert()` — not POSTing to /api/waitlist | 20 min | Open — app.jsx change |
| **P1** | VENUES array not pruned to 231 launch-only entries (2.0 MB vs target ~250 KB) | 2 hr | Open — app.jsx surgery |
| **P1** | LOCAL_TIPS / PACKING constants still in app.jsx (claimed deleted in CLAUDE.md) | 15 min | Open — app.jsx |
| **P2** | Alerts state in-memory only — lost on VPS restart | 30 min | Open — proxy.js |
| **P2** | Double rate limiter in proxy.js (custom + express-rate-limit both active on /api/) | 5 min | Open — cleanup |
| **P2** | No SRI hashes on React, ReactDOM, Babel CDN scripts | 30 min | Open |
| **P2** | No CSP meta tag — blocked by Babel inline eval | Deferred | Known |
| **P2** | Plausible domain `j1mmychu.github.io` → `peakly.app` when domain registered | 2 min | Blocked on domain |
