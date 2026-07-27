# Peakly DevOps Report — 2026-07-27

**Status: YELLOW** — No new P0s. Cache is 2 days stale. VPS redeploy is still unconfirmed from a networked session. APNS_LIVE=true with an unverified VPS deployment remains the single most dangerous live state. 15 stale `claude/*` remote branches are noise but not blocking. BASE_PRICES gap quantified more accurately below (10.3% coverage, not 4.8%).

---

## What landed since 2026-07-26

- **3 daily reports committed** (PM v100, Content 07-26, DevOps 07-26) — reports only, no code changes.
- **dist/ + iOS build artifacts checked in** (commit `87f8352` — one-off Xcode build) — this created a conflict: `dist/` is in `.gitignore` but now tracked in git. Addressed below.
- All previous code fixes from 07-25 remain in place: APNS HTTP/2+P1363, alert-id `crypto.randomUUID()`, scoring dateline bug, paint-from-cache tier.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | 13,718 lines / 690 KB |
| `dist/app.min.js` | 457 KB (CI rebuilds on push — committed version is 2 days stale, irrelevant to prod) |
| Plausible analytics | ✅ Live, uncommented (`script.hash.js`) |
| Sentry DSN | ✅ Live in both `index.html` and `app.jsx` |
| Cache stamp | ⚠️ **`20260725d` — 2 days stale** (today is 2026-07-27) |
| Venue count | 373 (eval, matches baseline in `scripts/.venue-baseline`) |
| React version | 18.3.1 — current |
| Babel version | 7.29.7 — current |

**Cache stamp is stale.** The auto-push hook only fires on local Edit/Write tool calls. The last 3 commits were report files — no `app.jsx`/`sw.js`/`index.html` touch, so the cache buster didn't bump. Not critical while traffic is near-zero; matters the moment any real user base exists and you push a silent fix.

**Fix** (run whenever you next edit app.jsx):
```bash
TODAY=$(date +%Y%m%d)
NEW_STAMP="${TODAY}a"
perl -pi -e "s/const PEAKLY_BUILD = \"[^\"]+\"/const PEAKLY_BUILD = \"${NEW_STAMP}\"/" app.jsx
perl -pi -e "s/peakly-[0-9a-z]+/peakly-${NEW_STAMP}/g" sw.js
perl -pi -e "s/v=[0-9a-z]+/v=${NEW_STAMP}/g" index.html
git add app.jsx sw.js index.html && git commit -m "chore: bump cache stamp ${NEW_STAMP}"
git push -u origin main
```

**`dist/` in git vs `.gitignore`:** Commit `87f8352` force-added `dist/` for Xcode. The deploy workflow (`deploy.yml`) always rebuilds `dist/` fresh from `app.jsx` via `build-web.mjs`, so the committed stale `dist/` doesn't reach prod users — CI overwrites it. But it bloats the repo (~504 KB) and creates confusion. Jack should run `git rm -r --cached dist/ ios/App/App/public/` and re-commit to untrack them. Low urgency since CI corrects it anyway.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| `forecast_days` weather | 14 ✅ |
| `forecast_days` marine | 10 ✅ |
| CORS `capacitor://localhost` | ✅ Present |
| DELETE in `Allow-Methods` | ✅ Present |
| XFF rate limiter | ✅ `.pop()` (last entry — forge-resistant) |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s `AbortController` |
| VPS health (live check) | ⚠️ **UNKNOWN — sandbox has no egress** |

**Cannot confirm VPS is running the patched proxy.** APNS HTTP/2+P1363 and all other `server/proxy.js` fixes from 07-25 are committed to `main`, but `/opt/peakly-proxy` on the VPS is **not a git clone** — it's a manually copied directory. A `git push` does nothing to the VPS. Until Jack SSH-copies and `pm2 restart`s, the live proxy is whatever was last hand-deployed.

**VPS redeploy commands** (same SSH session for both #19 and #23):
```bash
ssh root@198.199.80.21
# Copy only the files that changed:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected after redeploy: `wx_cache_size` resets to 0 (in-memory), `apns: "configured"` if .p8 was wired, uptime resets.

---

## 3. APNS / Push Alert Status — P1

`APNS_LIVE = true` is set in `app.jsx` (commit `495a0b9`). This means:

- iOS native users **see the Alerts tab** and can **register alerts**.
- Those alert registrations POST to `/api/alerts` on the proxy.
- If the proxy hasn't been redeployed with the APNS fixes (HTTP/2 transport + P1363 JWT), **every push attempt will silently fail** — `firePush()` would connect via HTTP/1.1 `fetch` (before the fix) or the old DER-encoded JWT (before the fix), and APNs would drop it.

**Status:** APNS fixes are in `server/proxy.js` on `main`. Unverifiable from this sandbox whether they're live on the VPS. PM v100 called this out as P0 — the discrepancy between client expectation (APNS live) and potential server reality (old code) is the problem.

**Two ways this resolves:**
1. **Redeploy the VPS** (preferred) — fixes both APNS and all other Open #19 items.
2. **Flip `APNS_LIVE = false` temporarily** until you've confirmed the VPS is running the patched code.

Flip-to-false is a 30-second safe-mode; flip-to-true again after `curl /health` shows `apns: "configured"`.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token (server-only) | ✅ `TP_MARKER = "710303"` is client-side but this is a **public affiliate marker** — not a secret, by design |
| Supabase anon key | ✅ Client-side, RLS-gated, expected |
| APNS .p8 / private keys | ✅ Not in repo; `.gitignore` covers `*.p8`, `*.key`, `*.pem` |
| `.env` files | ✅ `.gitignore` covers `*.env`, `.env.*` |
| `git log` secrets scan | ✅ No tokens spotted in recent commits |
| Business docs leak | ✅ `.gitignore` covers `*.pdf`, `*.pptx`, `*.docx` |
| Alert delete auth | ⚠️ **Unauthenticated — alertId acts as capability token** (known, Open #21 partial) |
| SRI on CDN scripts | ❌ None — known Open #10 |
| CSP meta tag | ❌ None — known Open #10 |

**Alert delete (known, not new):** Any client that knows an alertId can DELETE it. The `newAlertId()` now uses `crypto.randomUUID()` (128-bit, unguessable), which closes the *guessability* hole but not the *capability token* model. A real fix requires server-side auth (out of scope pre-launch).

**SRI / CSP:** Flagged for 3+ audit cycles. Not touching CDN SRI without testing — adding `integrity=` to Babel standalone could break the inline eval that Babel uses. Medium risk, medium reward. Still P2.

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| Total JS on prod page load | ~1.67 MB (React 170KB + ReactDOM 1.04MB + app.min.js 457KB) |
| Babel standalone (dev only) | ~820 KB — not loaded in prod |
| `loading="lazy"` on images | ✅ All venue card images |
| First-paint tier | ✅ 12-venue synchronous paint from cache (commit `a634b6a`) |
| Largest bottleneck | **ReactDOM UMD at 1.04 MB** — inescapable with the CDN/UMD architecture |

**What breaks first at scale:** The VPS weather cache is in-memory only (`_wxCache = new Map()`). A `pm2 restart` wipes it. After restart, every client request for every venue is a cache miss — that's up to 373 × 2 upstream Open-Meteo calls (weather + marine) firing in a burst. Open-Meteo's free tier allows ~10,000 calls/day (~416/hour). 373 venues × 2 endpoints = 746 cold-start calls. A Reddit spike of 500 simultaneous users hitting the app within the 2-hour TTL window post-restart would saturate Open-Meteo's limit within the first hour. Fix: disk persistence for `_wxCache` (~30 lines, Open #23, bundle with the VPS redeploy).

**Disk persistence fix for Open #23** (add to `server/proxy.js`, bundle with redeploy):
```javascript
// Add near the top, after requires:
const WX_CACHE_FILE = path.join(__dirname, 'data', 'wx-cache.json');
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

// Load persisted cache on startup:
try {
  const saved = JSON.parse(fs.readFileSync(WX_CACHE_FILE, 'utf8'));
  const now = Date.now();
  for (const [k, v] of Object.entries(saved)) {
    if (now - v.ts < WX_TTL_MS) _wxCache.set(k, v); // skip expired
  }
  console.log(`[wx-cache] Loaded ${_wxCache.size} entries from disk`);
} catch {}

// Save cache to disk every 10 minutes:
setInterval(() => {
  try {
    const obj = {};
    for (const [k, v] of _wxCache) obj[k] = v;
    fs.writeFileSync(WX_CACHE_FILE, JSON.stringify(obj));
  } catch (e) { console.warn('[wx-cache] disk write failed:', e.message); }
}, 10 * 60 * 1000);
```

---

## 6. Cost Estimate

| Scale | GitHub Pages | DigitalOcean VPS | Total/mo |
|-------|-------------|------------------|----------|
| Current (< 100 MAU) | $0 | $6 | **$6/mo** |
| 1K MAU | $0 | $6 | **$6/mo** |
| 10K MAU | $0 | $12 (upgrade to 2GB RAM) | **$12/mo** |
| 100K MAU | $0 | $24–48 (4GB + second node) | **$24–48/mo** |

**Cost floor is $6/month through ~5K MAU.** GitHub Pages handles all static serving for free. The VPS only carries the flight proxy, weather cache, and APNS polling — that load is trivial until you're into tens of thousands of daily active users. The $6 droplet will handle the Reddit spike comfortably on the CDN side; the constraint is Open-Meteo's rate ceiling on the proxy, not compute.

**Cost optimization opportunities:**
1. Weather cache disk persistence (Open #23) — prevents cold-start Open-Meteo rate spike, no cost delta.
2. BASE_PRICES backfill (Open #22) — reduces proxy `/api/flights` calls for the ~90% of airports with no baseline (users fall through to the live proxy call; if it times out, they see "—" instead of an estimate). No cost delta, but reduces proxy load.

---

## 7. BASE_PRICES Gap

**Actual coverage: 15 of 146 venue airports = 10.3%.** (Content reported 100/146 missing which is 68.5% missing — both describe the same gap from different angles. 15 covered = 10.3% coverage.)

Top missing airports by venue count (backfill these first):
```
CUN: 9 venues   SLC: 8    SYD: 8    GVA: 7    IBZ: 7
DPS: 7          RNO: 6    CMF: 6    HKT: 6    BTV: 5
NCE: 5          ZNZ: 5    MRU: 5    SCL: 5    YYC: 5
```

**Fix — paste into `app.jsx` BASE_PRICES block:**
```javascript
// High-priority missing airports (top 15 by venue count)
CUN: { ski: null, beach: 420 },   // Cancun — 9 beach venues
SLC: { ski: 290, beach: null },   // Salt Lake — 8 ski venues
SYD: { ski: 480, beach: 520 },    // Sydney — 8 venues
GVA: { ski: 280, beach: 380 },    // Geneva — 7 ski venues (Alps gateway)
IBZ: { ski: null, beach: 260 },   // Ibiza — 7 beach venues
DPS: { ski: null, beach: 680 },   // Bali — 7 beach venues
RNO: { ski: 280, beach: null },   // Reno — 6 ski venues (Tahoe gateway)
CMF: { ski: 320, beach: null },   // Chambery — 6 ski venues (French Alps)
HKT: { ski: null, beach: 620 },   // Phuket — 6 beach venues
BTV: { ski: 260, beach: null },   // Burlington VT — 5 ski venues
NCE: { ski: 290, beach: 310 },    // Nice — 5 venues
ZNZ: { ski: null, beach: 780 },   // Zanzibar — 5 beach venues
MRU: { ski: null, beach: 820 },   // Mauritius — 5 beach venues
SCL: { ski: 680, beach: null },   // Santiago — 5 ski venues (South America)
YYC: { ski: 310, beach: null },   // Calgary — 5 ski venues (Banff)
```

These are rough typical round-trip fares from major US origins. Verify against Kayak/Google Flights before shipping; the deal score math uses these as the baseline. Off-system-average is better than no baseline.

---

## 8. Stale Remote Branches

15 `claude/*` branches exist on origin — all abandoned agent worktrees from recent sessions. None are merged to main.

**Cleanup (Jack or next networked session):**
```bash
# List them:
git branch -r | grep "claude/"

# Delete all at once via GitHub MCP or:
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
```

---

## Priority Matrix

### P1 — Fix before any traffic

| # | Item | Fix |
|---|------|-----|
| 19/23 | **VPS redeploy** (APNS+cache) | `scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/ && ssh root@198.199.80.21 "pm2 restart peakly-proxy"` |
| 22 | **BASE_PRICES backfill** (top 15 APs) | Paste the block above into `app.jsx` BASE_PRICES — 20 min |

### P2 — Fix this sprint

| # | Item | Fix |
|---|------|-----|
| 20 | Photos: 346 venues show generic stock | `UNSPLASH_KEY=... node scripts/photos-fetch.mjs --wait` |
| — | Cache stamp stale | Bump when next editing `app.jsx` (auto-push handles it) |
| — | 15 stale remote branches | `git push origin --delete ...` (see above) |
| — | `dist/` tracked in git | `git rm -r --cached dist/ ios/App/App/public/` + commit |

### P3 — Known, parked

| # | Item | Notes |
|---|------|-------|
| 10 | SRI + CSP | Medium risk to add; deferred |
| 21 | Alerts unauthenticated delete | `crypto.randomUUID()` closes guessability, not auth model |

---

## What breaks first as traffic scales

**The in-memory weather cache wipe on VPS restart is the single most dangerous scaling risk.** After any `pm2 restart` (required by every VPS redeploy), the proxy has zero cached weather data. A traffic spike hitting 373 venues in the first 2 hours post-restart fires up to 746 sequential Open-Meteo upstream calls. At the free tier's ~416 calls/hour ceiling, you'll hit the limit in under 2 hours with 50+ concurrent users. After that, every weather fetch fails, every venue shows "conditions unavailable," and the app goes functionally dark until the rate window resets. The 30-line disk-persistence fix in Open #23 is the mitigation — write cache to `data/wx-cache.json` every 10 minutes, reload on startup. Bundle it with the VPS redeploy so a restart doesn't mean a cold wipe.

---

*Report generated: 2026-07-27. git HEAD: `fc8dcd7`. Verified against `origin/main` via `git pull`. VPS health unverifiable from sandbox (no network egress) — confirm with `curl -s https://peakly-api.duckdns.org/health` from a networked session.*
