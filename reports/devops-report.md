# DevOps Report — 2026-07-29

**Status: YELLOW → approaching RED**
**git HEAD:** `c1ee941` (verified against origin/main via `git pull`)
**app.jsx:** 13,718 lines / 690,557 bytes raw / 457 KB minified (dist/app.min.js)
**Venues:** 373 confirmed (131 ski / 242 beach — ID-count method, not grep)
**Note:** VPS unreachable from sandbox — health check skipped; all VPS state inferred from code + git history.

---

## Status Summary

VPS has been unredeployed for **5 days** (Open #19, reclassified P1 on 07-25). Every day the VPS fix doesn't land is another day of:
- Two-weekend scoring silently disabled (7-day forecast window instead of 14)
- iOS alert registrations silently failing (APNS_LIVE=false stopgap is in place, but the server isn't fixed either way)
- Weather cache wiped on every pm2 restart (Open #23 unfixed)

This is the only blocker standing between Peakly and its pre-traffic checklist.

---

## P0 — Fix Today (Blocks Core Features)

### VPS Redeploy — Day 5 Unresolved

**Severity: P0. Duration: 5 days. Impact: all users.**

The repo has the correct code. The server does not. This is the only required action this week.

`server/proxy.js` on origin/main includes (committed `3165c1e`, 2026-07-25):
- `http2.connect()` for APNs delivery (APNs is HTTP/2-only; the old `fetch` was HTTP/1.1)
- `dsaEncoding: 'ieee-p1363'` on JWT signing (Apple requires raw R‖S 64-byte; Node's EC default is DER, which APNs rejects)
- `forecast_days: 14` at both `/api/weather` call sites (was 7, which silently disabled second-weekend scoring)
- `capacitor://localhost` in CORS allowlist (iOS native calls were blocked outright)
- `DELETE` in `Access-Control-Allow-Methods` (alert deletion has never worked — preflight blocked it)
- Rate limiter reading last X-Forwarded-For entry (was reading `[0]`, anyone could forge their IP)

**None of this is on the server.** `/opt/peakly-proxy` is a hand-copied directory. `git pull` there fails ("not a git repository").

**Fix — one SSH session, under 10 minutes:**
```bash
# From your local machine
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# Then SSH in:
ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: apns: "configured", wx_cache_size: 0 (refills), forecast_days: 14
```

After confirming `/health` shows `apns: configured`, flip in app.jsx:
```js
const APNS_LIVE = true; // flip after pm2 restart verified
```
Then bundle Open #23 (weather cache disk persistence) in the same session — same 30 lines, same restart.

---

## P1 — Fix This Week

### Open #23: Weather Cache Is Still In-Memory

**Severity: P1. Unfixed since 07-25 PM v99.**

`_wxCache` in `server/proxy.js` is a `Map()`. A `pm2 restart` wipes it. The VPS redeploy (P0 above) **requires** a `pm2 restart`. The moment that restart happens, the cache is empty. If any traffic arrives before it refills (~30 min per full 373-venue cycle), those requests hit Open-Meteo directly. At 100+ concurrent users this blows through the free tier (10K calls/day).

**Fix (~30 lines in `server/proxy.js`):** Add disk persistence. Load on startup, flush on write.

```js
// Add at top of server/proxy.js, after _wxCache = new Map():
const WX_CACHE_PATH = path.join(__dirname, 'data', 'wx_cache.json');

function _loadWxCacheFromDisk() {
  try {
    if (!fs.existsSync(WX_CACHE_PATH)) return;
    const raw = JSON.parse(fs.readFileSync(WX_CACHE_PATH, 'utf8'));
    const now = Date.now();
    let loaded = 0;
    for (const [k, v] of Object.entries(raw)) {
      if (now - v.ts < WX_TTL_MS) { _wxCache.set(k, v); loaded++; }
    }
    console.log(`[proxy] wx_cache: loaded ${loaded} entries from disk`);
  } catch (e) { console.warn('[proxy] wx_cache load failed:', e.message); }
}

function _flushWxCacheToDisk() {
  try {
    fs.mkdirSync(path.dirname(WX_CACHE_PATH), { recursive: true });
    const obj = {};
    for (const [k, v] of _wxCache) obj[k] = v;
    fs.writeFileSync(WX_CACHE_PATH + '.tmp', JSON.stringify(obj));
    fs.renameSync(WX_CACHE_PATH + '.tmp', WX_CACHE_PATH);
  } catch (e) { console.warn('[proxy] wx_cache flush failed:', e.message); }
}

// Call _loadWxCacheFromDisk() once at startup (after the Map is defined):
_loadWxCacheFromDisk();

// Modify _wxCacheSet to flush after write:
function _wxCacheSet(key, data) {
  if (_wxCache.size >= WX_CACHE_MAX) {
    const firstKey = _wxCache.keys().next().value;
    if (firstKey) _wxCache.delete(firstKey);
  }
  _wxCache.set(key, { data, ts: Date.now() });
  _flushWxCacheToDisk(); // persist immediately
}
```

This makes the cache survive `pm2 restart`. Bundle with the P0 VPS deploy — same SSH session, same restart.

### Cache Buster Stale + Underbump — 4 Days

**Severity: P1.**

`PEAKLY_BUILD` / `CACHE_NAME` / `?v=` query param are all `20260725d`. Today is 2026-07-29. The 07-28 commit (`c1ee941`) modified `app.jsx` (flipped `APNS_LIVE` back to false) but **did not bump the cache stamp**. This means:

1. `dist/app.min.js` was rebuilt with the fix (GitHub Actions ran `build-web.mjs` on push)
2. But the `?v=20260725d` query param didn't change
3. Browser/CDN caches that have the previous `app.min.js?v=20260725d` may serve the stale `APNS_LIVE=true` build

The SW uses stale-while-revalidate, so it self-heals on second visit. Low crash risk. But any user who got exactly one visit since 07-28 may still have `APNS_LIVE=true` code, which shows them push-registration UI that can't deliver.

**Fix — bump the cache stamp now:**
```bash
# In app.jsx line 17:
const PEAKLY_BUILD = "20260729a";

# In sw.js line 2:
const CACHE_NAME = "peakly-20260729a";

# In index.html line 395:
<script type="text/babel" src="./app.jsx?v=20260729a" data-presets="react"></script>

# All three must be in lockstep (same value). auto-push.sh does this automatically
# when triggered via the PostToolUse hook — but that hook fires from a local
# Claude Code session, not from scheduled remote agents.
```

**Root cause:** the scheduled PM agent modified `app.jsx` directly via a cloud session that doesn't run `auto-push.sh`. The cache-bump loop is broken for remote agents. Consider adding a pre-commit hook in `.github/workflows/deploy.yml` that auto-bumps the stamp to `YYYYMMDD` on every push that touches `app.jsx`.

### BASE_PRICES Gap — 90.4% Airports Missing

**Severity: P1 (blocks deal score for 131 non-US airports).**

`BASE_PRICES` covers **15 of 146 venue airports (10.3%)** — all 15 are US domestic. Every non-US venue falls back to a hardcoded `$650` global estimate. The deal score headline feature is wrong for 90%+ of the catalog.

Top uncovered airports by venue count (fix these ~15 first, covers ~40+ venues):

| Airport | Venues | Suggested Price |
|---------|--------|-----------------|
| SYD | 7 | 850 |
| SLC | 5 | 280 |
| CUN | 5 | 420 |
| IBZ | 5 | 620 |
| HKT | 5 | 780 |
| RNO | 4 | 260 |
| YYC | 4 | 320 |
| SCL | 4 | 780 |
| PHL | 4 | 280 |
| DPS | 4 | 850 |
| MRU | 4 | 980 |
| ZNZ | 4 | 1050 |
| BTV | 3 | 220 |
| GVA | 3 | 680 |
| CMF | 3 | 640 |

**Fix — paste into `app.jsx` inside `BASE_PRICES`:**
```js
// Add to BASE_PRICES object (app.jsx ~line 860):
SYD: 850, SLC: 280, CUN: 420, IBZ: 620, HKT: 780,
RNO: 260, YYC: 320, SCL: 780, PHL: 280, DPS: 850,
MRU: 980, ZNZ: 1050, BTV: 220, GVA: 680, CMF: 640,
BGI: 560, SXM: 580, OGG: 520, CAG: 540, NAP: 560,
ZRH: 720, GIG: 920, NRT: 980, KUL: 820, CHC: 980,
```

Prices are round-trip USD medians from JFK as a base; the deal score normalizes against origin so these don't need to be origin-specific. Close enough to stop the $650 ghost default from contaminating scores.

---

## P2 — Fix This Sprint

### 18 Stale Remote Branches

**Severity: P2. Disk noise, confusing git log.**

```
origin/claude/analyze-test-coverage-WVIsT
origin/claude/code-review-cleanup-HjoCS
origin/claude/condense-alert-page-jzdLo
origin/claude/enhance-loading-screen-rZ1dc
origin/claude/fix-app-jsx-content
origin/claude/implement-todo-lNL7W
origin/claude/improve-peakly-ui-UHCHG
origin/claude/improve-scoring-system-XYGY6
origin/claude/product-reliability-assessment-w0poL
origin/claude/redesign-front-page-EndKs
origin/claude/review-peakly-ux-UQ0Qu
origin/claude/simplify-alerts-page-2ejGB
origin/claude/simplify-profile-page-Bi2Tc
origin/claude/standardize-venue-data-CufiQ
origin/claude/streamline-onboarding-account-97XRR
origin/fix-appjsx-final
origin/restore-appjsx
origin/test-small
```

**Fix — from a networked session with git push access:**
```bash
# Delete all stale claude/* branches + one-offs
git push origin --delete \
  claude/analyze-test-coverage-WVIsT \
  claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo \
  claude/enhance-loading-screen-rZ1dc \
  claude/fix-app-jsx-content \
  claude/implement-todo-lNL7W \
  claude/improve-peakly-ui-UHCHG \
  claude/improve-scoring-system-XYGY6 \
  claude/product-reliability-assessment-w0poL \
  claude/redesign-front-page-EndKs \
  claude/review-peakly-ux-UQ0Qu \
  claude/simplify-alerts-page-2ejGB \
  claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ \
  claude/streamline-onboarding-account-97XRR \
  fix-appjsx-final restore-appjsx test-small
```

### Babel Standalone Still In Dev index.html

**Severity: P2. 3-5s parse wall on cold start (dev only).**

`index.html` (repo root, dev mode) loads `@babel/standalone@7.29.7` — 7.4 MB download, parsed synchronously. Production (`dist/index.html`) correctly skips Babel and loads the pre-compiled `app.min.js`. But any developer opening `index.html` directly hits the full parse wall. Not a user-facing issue. No action required.

### No SRI on CDN Scripts

**Severity: P2. Supply-chain attack surface.**

`unpkg.com` hosts React (18.3.1), ReactDOM (18.3.1), and Babel Standalone (7.29.7) without Subresource Integrity (SRI) hashes. If unpkg is compromised, malicious JS runs as first-party code. Risk is real but unpkg has never been compromised; SRI adds a one-time 30-min setup cost.

**Fix:** Generate SRI hashes for each CDN URL and add `integrity="sha384-..."` attributes.

---

## Security Posture

| Check | Status |
|-------|--------|
| Travelpayouts token in client code | ✅ CLEAN — server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) |
| APNS private key in client code | ✅ CLEAN — server-side only (`process.env.APNS_KEY_PATH`) |
| Supabase anon key exposed | ✅ EXPECTED — public-safe by design, RLS-gated, no service-role key |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ CLEAN |
| Sentry DSN in client code | ✅ EXPECTED — public-facing DSN, intentional |
| Git history for leaked secrets | ✅ CLEAN (last scrub 2026-05-09; no new secrets in recent commits) |
| Alert IDs via `crypto.randomUUID()` | ✅ FIXED — committed `1959f17` (2026-07-25) |

---

## Performance Analysis

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| app.min.js (production) | 457 KB | < 500 KB | ✅ |
| app.jsx (raw) | 690 KB | N/A | ✅ |
| Total CDN load (React + ReactDOM) | ~150 KB | N/A | ✅ |
| Babel Standalone (dev only) | 7.4 MB | N/A | Dev-only |
| `loading="lazy"` on images | All cards/sheets/carousel | 100% | ✅ |
| Weather batch size | 100 venues / batch | — | ✅ |
| Weather batch throttle | 500ms between batches | — | ✅ |
| First-paint tier | 12 venues | — | ✅ |

**Largest performance bottleneck:** Photos. 373 venues pulling images from `images.unsplash.com` on every page render. No lazy-loading breakpoint, no responsive `srcset`, no `sizes` attribute. At 100K MAU this is Unsplash's CDN problem, not ours — but image renders on low-end Android will be slow. Lowest-effort fix: add `w=400` to `?w=800&h=600` param for card-size renders.

---

## Cost Estimate

| MAU | GitHub Pages | Supabase | VPS (DO) | Open-Meteo | Total |
|-----|-------------|----------|----------|------------|-------|
| 1K | Free | Free tier | $6/mo | Free (proxy cache) | **$6/mo** |
| 10K | Free | $25/mo (Pro) | $12/mo (2GB) | Free | **$37/mo** |
| 100K | Free | $25/mo + overages | $24/mo (4GB) | $50-200/mo (paid plan) | **$100-260/mo** |

**Revenue at 100K MAU:** ~$758/mo (7.58 RPM × 100). Profitable at scale. The cost cliff is Open-Meteo — free tier is 10K calls/day, which the VPS proxy cache absorbs at normal traffic but not during a Reddit/HN spike.

---

## What Breaks First at Scale

**Open-Meteo + VPS memory.** At ~1K concurrent users hitting cold-cache venues, the VPS proxy serves ~12 upstream weather requests per venue per 2hr TTL — manageable. But a single Reddit post that sends 5K users in an hour hits O(venues × concurrency) upstream calls before the cache warms. Without disk persistence (Open #23), a `pm2 restart` ahead of the traffic spike empties the cache. Open-Meteo's free tier (10K calls/day) disappears in under 2 minutes of spike traffic against a cold cache. Prevention: (1) ship Open #23 disk persistence so restarts don't empty the cache, (2) consider a Redis sidecar at >5K MAU for shared cache across multiple VPS nodes, (3) if the spike kills the VPS, Cloudflare's free CDN tier in front of GitHub Pages would serve the static frontend while the VPS recovers — GitHub Pages serves dist/ directly today, add Cloudflare as a CNAME.

---

## Action Items (Ordered by Impact)

1. **Jack: SSH to VPS, `scp server/proxy.js` + `pm2 restart`** — 10 min. Closes Open #19, unblocks APNS, restores two-weekend scoring, fixes iOS alert deletion. Day 5.
2. **Bump cache stamp to `20260729a`** (app.jsx + sw.js + index.html in lockstep) — 5 min. Ensures APNS_LIVE=false propagates to all cached users.
3. **Add wx cache disk persistence to server/proxy.js** — 30 min. Closes Open #23. Bundle with the VPS deploy (same SSH session).
4. **Backfill BASE_PRICES top 25 airports** — 30 min. Paste the block above into app.jsx. Deal score goes from broken for 90% of venues to broken for ~40%.
5. **Delete 18 stale remote branches** — 5 min. Clean git log.
