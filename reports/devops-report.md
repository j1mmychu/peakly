# DevOps Report — 2026-07-30

**Status: RED**
**git HEAD:** `059d58f` (verified against origin/main via `git pull` — was 36 commits behind at session start)
**app.jsx:** 13,724 lines / 690,800 bytes raw
**dist/app.min.js:** 457 KB (built 2026-07-30 14:02 by deploy.yml — content matches 20260725d stamp)
**Venues:** 373 (131 ski / 242 beach) — stable, matches PM v103

---

## Status: RED

Day 6 of VPS undeployed. This is no longer a "P1 enhancement" — it is a P0 regression that has been sitting for six consecutive days while every daily report documents it. Two-weekend scoring is OFF. iOS native calls to the proxy are blocked by CORS. Alert deletion silently fails. The fix is committed and ready. What's missing is 10 minutes of Jack's time at an SSH terminal.

---

## P0 — Fix Today

### P0-1: VPS Not Redeployed — Day 6 (Open #19)

**Impact:** Critical features broken in production:
- Two-weekend scoring is disabled (`forecast_days` was 7 in the old proxy, now 14 in the committed fix — but the old proxy is still running on the VPS)
- iOS native app cannot reach the proxy (missing `capacitor://localhost` in CORS — also fixed in committed proxy.js but not deployed)
- Alert deletion silently fails (missing `DELETE` in `Access-Control-Allow-Methods` — fixed in committed proxy.js but not deployed)
- Rate limiter bypass via forged XFF header is still live in production (`.pop()` fix is committed, `.split(',')[0]` is what's running)

**What's in proxy.js that is NOT live:**
| Fix | Committed | Deployed |
|-----|-----------|----------|
| `forecast_days` 7→14 | ✅ `ff3be20` era | ❌ |
| `capacitor://localhost` CORS | ✅ | ❌ |
| `DELETE` in Allow-Methods | ✅ | ❌ |
| XFF `.pop()` rate limiter | ✅ | ❌ |
| HTTP/2 APNS transport | ✅ | ❌ |
| `dsaEncoding: 'ieee-p1363'` | ✅ | ❌ |

**Fix — 10 minutes, requires SSH:**
```bash
# From local machine:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# SSH in:
ssh root@198.199.80.21

# On VPS — but first fix Open #23 disk persistence BELOW, then:
pm2 restart peakly-proxy

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: forecast_days:14, apns:unconfigured (or configured), DELETE in CORS
```

**Do NOT restart pm2 until Open #23 disk persistence is added** — a cold restart wipes the entire weather cache, guaranteeing an Open-Meteo rate limit hit if any traffic lands in the refill window.

---

### P0-2: Weather Cache Has No Disk Persistence — Open #23

**Impact:** Every pm2 restart (including the required VPS redeploy above) cold-wipes the in-memory `_wxCache`. If any traffic hits in the minutes after restart, all 373 venues need fresh upstream Open-Meteo calls. Open-Meteo's free tier is ~10K calls/day. 373 × 2 (weather + marine) = 746 calls for a full cache warm. That's fine in isolation. Not fine if concurrent users trigger duplicate requests before the cache fills. At Reddit-spike scale (500 simultaneous users, 373 venues), the upstream call count is unbounded without the cache.

**This fix should be applied to proxy.js BEFORE the pm2 restart:**

```javascript
// Add at top of server/proxy.js, after requires:
const CACHE_FILE = '/opt/peakly-proxy/wx-cache.json';

// Replace the _wxCache Map() initialization block with:
const _wxCache = new Map();

function _loadCacheDisk() {
  try {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const entries = JSON.parse(raw);
    const now = Date.now();
    let loaded = 0;
    for (const [k, v] of entries) {
      if (v && v.ts && (now - v.ts) < WX_TTL_MS) {
        _wxCache.set(k, v);
        loaded++;
      }
    }
    console.log(`[wx-cache] Loaded ${loaded} warm entries from disk`);
  } catch (e) {
    console.log('[wx-cache] No disk cache found — starting cold');
  }
}

function _saveCacheDisk() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify([..._wxCache.entries()]));
  } catch (e) {
    console.error('[wx-cache] Disk save failed:', e.message);
  }
}

// Call at startup (before app.listen):
_loadCacheDisk();

// Persist every 5 minutes and on process exit:
setInterval(_saveCacheDisk, 5 * 60 * 1000);
process.on('SIGTERM', () => { _saveCacheDisk(); process.exit(0); });
process.on('SIGINT',  () => { _saveCacheDisk(); process.exit(0); });
```

**Time to implement: 30 min. Bundle with P0-1 — same SSH session.**

---

## P1 — Fix This Week

### P1-1: Cache Stamp Stale (20260725d — 5 Days Old)

**What's happening:** The cache stamp is `20260725d`. Today is 2026-07-30. The stamp only auto-bumps when app.jsx/sw.js/index.html are edited through the auto-push hook — and no feature code has landed in 5 days (only agent report commits, which don't touch those files). This is technically correct behavior, but:

- Service worker users see `peakly-20260725d` as their cache name
- Any user who has the SW installed gets no refresh signal until a new stamp lands
- `dist/app.min.js` was rebuilt today (deploy.yml ran) but contains the same 20260725d stamp from app.jsx

**Fix:** When the VPS deploy is done and proxy.js changes are live, bump the cache stamp manually:

```bash
# In app.jsx, update line 17:
# const PEAKLY_BUILD = "20260730a";

# In sw.js, update line 2:
# const CACHE_NAME = "peakly-20260730a";

# In index.html, update line 395:
# src="./app.jsx?v=20260730a"
```

Auto-push.sh will handle lockstep if you just edit app.jsx — it'll bump all three in sync.

### P1-2: BASE_PRICES Coverage: 15 of ~146 Venue Airports (10.3%)

Still unfixed. Deal scores are broken for 90% of venues — `getDealScore()` returns the `getTypicalPrice()` estimate path for ~131 airports, making the "Cheap flight" signal meaningless for any venue whose departure airport is missing.

**Current BASE_PRICES airports (15):** YVR, JFK, LAX, SFO, ORD, MIA, SEA, BOS, ATL, DEN, DFW, LAS, PHX, MSP, DTW

**Add these high-priority entries (covers the biggest gaps by venue count):**

```javascript
// Paste into BASE_PRICES object in app.jsx (~line 6136)
// Format: DEST_AP: { ORIGIN_AP: price_usd, ... }
// Prices are annual-mean round-trip estimates

// Caribbean/Mexico (biggest gap — CUN, STT, SJU, AUA, SXM all missing)
CUN: { JFK:380, MIA:220, ORD:420, DFW:350, ATL:380, LAX:500, BOS:420, DEN:450 },
SJU: { JFK:280, MIA:180, BOS:300, ORD:380, ATL:320, LAX:550, DFW:420 },
AUA: { JFK:420, MIA:280, BOS:450, ORD:480, ATL:400, LAX:580 },
STT: { JFK:380, MIA:260, BOS:420, ATL:380, ORD:450, DFW:480 },

// Pacific Islands
HNL: { LAX:380, SFO:360, SEA:400, DEN:480, PHX:420, ORD:580, JFK:620 },
PPT: { LAX:750, SFO:720, SEA:780 },
BOB: { LAX:820, SFO:800, SEA:850 },

// Europe hubs (ski venues)
GVA: { JFK:680, BOS:650, LAX:780, ORD:720, MIA:720 },
ZRH: { JFK:650, BOS:630, LAX:750, ORD:700, ATL:710 },
NCE: { JFK:700, BOS:670, LAX:800, ORD:730 },
CDG: { JFK:550, BOS:520, LAX:680, ORD:620, MIA:640, ATL:600 },
LHR: { JFK:480, BOS:460, LAX:620, ORD:560, MIA:600, ATL:580, DFW:580 },

// Australia/NZ (southern hemi ski)
SYD: { LAX:980, SFO:960, SEA:1020 },
MEL: { LAX:1020, SFO:1000, SEA:1060 },
AKL: { LAX:880, SFO:860, SEA:900 },

// Canada (ski)
YYC: { LAX:380, SFO:360, SEA:280, DEN:280, ORD:380, JFK:450 },
YEG: { SEA:300, DEN:300, LAX:400, ORD:400, JFK:480 },
```

**Time to implement: ~30 min (paste + verify brace balance).**

---

## P2 — Fix This Sprint

### P2-1: 15 Stale Remote Branches

Same count as yesterday. All `claude/*` branches are orphaned worktree experiments. None have open PRs.

```bash
# Delete all stale claude/* branches from remote:
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
  fix-appjsx-final \
  restore-appjsx \
  test-small

# Also clean up local refs:
git remote prune origin
```

**Time: 2 min.**

### P2-2: Waitlist IP Logging Uses XFF[0] (Minor)

The rate limiter correctly uses `.pop()` (last XFF entry — the one Caddy appends, which can't be forged). But the waitlist endpoint at proxy.js:854 still logs `XFF.split(',')[0]` — the first entry, which a client can forge. This is server-side logging only, doesn't affect security, but will produce garbage analytics if anyone spoofs it.

```javascript
// proxy.js ~line 854 — change:
ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress,
// to:
ip: (req.headers['x-forwarded-for']?.split(',').pop()?.trim()) || req.socket.remoteAddress,
```

**Time: 30 seconds.**

---

## Audit Checklist

### 1. Live Site Health

| Check | Result | Status |
|-------|--------|--------|
| app.jsx lines / bytes | 13,724 / 690 KB | ✅ |
| dist/app.min.js | 457 KB | ✅ under 500 KB |
| All CDN deps present in index.html | React 18.3.1, ReactDOM 18.3.1, Babel 7.29.7 | ✅ |
| Plausible analytics active | Line 32, uncommented | ✅ |
| Sentry DSN wired | index.html:77 + app.jsx:8 | ✅ |
| Cache stamp | `20260725d` — **5 days stale** | ⚠️ |
| Venue count | 373 (131 ski / 242 beach) | ✅ |
| dist/ synced with app.jsx | Built 2026-07-30 14:02 | ✅ |

### 2. Flight Proxy Status

| Check | Result | Status |
|-------|--------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS) | ✅ |
| Old HTTP IP (104.131...) in client | Not found | ✅ |
| Travelpayouts token in client | **TP_MARKER=710303 is affiliate marker, NOT token** | ✅ safe |
| fetchTravelpayoutsPrice timeout | 4s timeout present | ✅ |
| CORS includes capacitor://localhost | In committed proxy.js — **not deployed** | ❌ |
| DELETE in CORS | In committed proxy.js — **not deployed** | ❌ |

### 3. Weather & External APIs

| Check | Result | Status |
|-------|--------|--------|
| Open-Meteo direct (fallback) | `api.open-meteo.com` present | ✅ |
| VPS proxy weather endpoint | `peakly-api.duckdns.org/api/weather` | ✅ (in code) |
| forecast_days | 14 (in committed proxy.js) | ❌ old VPS still runs 7 |
| THROTTLE_MS between batches | 500ms between 100-venue batches | ✅ |
| Weather cache disk persistence | None — in-memory Map() only | ❌ Open #23 |
| Marine forecast_days | 10 | ✅ |
| AP_CONTINENT airport coverage | 228 airports | ✅ |

### 4. Security Audit

| Check | Result | Status |
|-------|--------|--------|
| Travelpayouts token in client | Not present — server-side only | ✅ |
| Supabase service role key | Not present — anon key only (RLS-gated) | ✅ |
| .gitignore covers .env, *.pem, *.p8 | Yes | ✅ |
| Sentry DSN in client | Expected — public-facing error DSN | ✅ |
| Git history for leaked secrets | Clean — last scrub 2026-05-09, no new secrets in recent commits | ✅ |
| Alert IDs | `crypto.randomUUID()` with getRandomValues fallback | ✅ |
| APNS_LIVE flag | `false` — correct, VPS not redeployed | ✅ |
| XFF rate limiter (proxy) | `.pop()` — correct, not forgeable | ✅ |
| Alerts API auth | Capability-token (random UUID) — no server-side user auth | ⚠️ acceptable for v1 |

### 5. Performance

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| app.min.js (production) | 457 KB | < 500 KB | ✅ |
| app.jsx raw | 690 KB | N/A | ✅ |
| React + ReactDOM CDN | ~150 KB | N/A | ✅ |
| Babel Standalone | 7.4 MB (dev only, not in dist) | Dev only | ✅ |
| `loading="lazy"` on all images | All cards, carousel, sheets | 100% | ✅ |
| Weather batch size | 100 venues per batch | — | ✅ |
| Batch throttle delay | 500ms between batches | — | ✅ |
| First-paint tier | 12 venues | — | ✅ |

**Largest performance bottleneck (unchanged):** Unsplash image load on Explore. 373 venues each fetch from `images.unsplash.com` with no `srcset`, no `sizes`, and a fixed `?w=800&h=600`. On low-end Android this is the single biggest perceived-speed issue. Minimum fix: swap `?w=800` to `?w=400` for card renders (~50% bandwidth reduction). Proper fix is the photo pipeline (Open #20 — UNSPLASH_KEY required).

### 6. Cost Estimate

| MAU | GitHub Pages | Supabase | VPS (DO) | Open-Meteo | Total |
|-----|-------------|----------|----------|------------|-------|
| 1K | Free | Free tier | $6/mo | Free (proxy cache) | **$6/mo** |
| 10K | Free | $25/mo (Pro) | $12/mo (2GB) | Free | **$37/mo** |
| 100K | Free | $25/mo + overages | $24/mo (4GB) | $50–200/mo | **$100–260/mo** |

Revenue at 100K MAU: ~$758/mo. Profitable at scale. No changes from yesterday.

---

## What Breaks First at Scale

**Open-Meteo + cold cache after restart.** This is the same answer as Day 5 and Day 4 because the fix has not been deployed. When the VPS redeploy finally happens (Open #19), pm2 restarts and every entry in `_wxCache` is gone. If any traffic arrives in the 30-60 second window before the cache refills from real requests, every concurrent user triggers a separate upstream Open-Meteo call for the same coordinate. 373 venues × 2 endpoints = 746 cold calls minimum, multiplied by however many concurrent users fire before the first cache entry writes. Open-Meteo's free tier evaporates in under 2 minutes under this scenario. The disk persistence fix (Open #23) costs 30 lines and prevents this entirely. **It must land before the pm2 restart, not after.**

---

## Action Items — Ordered by Impact

| Priority | Action | Owner | Time |
|----------|--------|-------|------|
| **P0** | Add disk persistence to proxy.js (Open #23) | Jack/Claude | 30 min |
| **P0** | SCP proxy.js to VPS + pm2 restart (Open #19) | **Jack** (SSH required) | 10 min |
| **P0** | Verify health after redeploy: `curl https://peakly-api.duckdns.org/health` | Jack | 2 min |
| **P1** | Bump cache stamp to `20260730a` | auto via app.jsx edit | 1 min |
| **P1** | Backfill BASE_PRICES top-15 airports (Open #22) | Claude | 30 min |
| **P2** | Delete 18 stale remote branches | Claude/Jack | 2 min |
| **P2** | Fix waitlist IP logging XFF[0] → .pop() | Claude | 1 min |

**This is Day 6. The VPS redeploy is a 10-minute SSH task. Every day it doesn't ship is a day two-weekend scoring is off, iOS native is CORS-blocked, and the alert deletion bug is live. There is no technical blocker — just execution.**
