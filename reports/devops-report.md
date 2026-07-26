# Peakly DevOps Report — 2026-07-26

**Status: YELLOW** — No P0s. Two persistent P1s that are pre-traffic blockers per PM v99. Critical new finding: APNS_LIVE flipped to `true` but the VPS still runs the unfixed proxy, meaning iOS users can now register alerts that will never fire. That's the headline today.

---

## What shipped since yesterday's report (2026-07-25)

17 commits landed: APNS P1363+HTTP/2 fix, alert-id randomUUID guard, scoring dateline bug fix, paint-from-cache first-paint tier, iOS widget Capacitor bridge fixes, dist/+ios build artifacts checked in for Xcode, and `APNS_LIVE = true`.

---

## 1. Live Site Health

**app.jsx:** 13,718 lines / 690 KB source. +1,218 lines since yesterday's count (~12,500). Growth is real: widget bridge, scoring remap, splash watchdog.

**dist/app.min.js:** 457 KB minified (was 439 KB — 18 KB growth, normal). Babel correctly absent from dist/. Production users see pre-compiled bundle. Dev loop (index.html + Babel) unchanged.

**Cache stamp: `20260725d` — STALE.** Today is 2026-07-26. The stamp is yesterday's. This means the service worker won't invalidate cached assets from yesterday's pushes, and the build stamp in the Profile tab says yesterday. Fix:

```bash
# In app.jsx:17, sw.js:2, dist/index.html:390 — change in lockstep:
perl -pi -e 's/20260725d/20260726a/g' app.jsx sw.js dist/index.html
# auto-push.sh handles this on next Edit/Write via hook
```

**dist/ force-tracked in git (commit `87f8352`):** The `dist/` directory is in `.gitignore` but was force-added for a one-off Xcode build. `deploy.yml` calls `fs.rmSync(DIST)` before rebuilding, so the committed snapshot is overwritten on every CI push — no functional harm. But it bloats the repo and creates confusion about what's authoritative. Un-track it after the Xcode session:

```bash
git rm -r --cached dist/
# then commit — deploy.yml will continue to rebuild it at deploy time
```

**Plausible:** Present and active on both index.html and dist/index.html. ✓

**Sentry DSN:** Configured (`9416b032a46681d74645b056fcb08eb7`). ✓ No longer a gap.

**GitHub Pages / live site:** Sandbox blocks outbound HTTPS to duckdns.org and github.io (403 from proxy). Cannot verify live status from here. Last confirmed-live state: 2026-07-24 verified session. Verify manually:
```bash
curl -s https://j1mmychu.github.io/peakly/ | head -5
```

---

## 2. P1 — VPS Redeploy Still Not Done (day 2+)

Every proxy.js fix — forecast_days 14, P1363 JWT, HTTP/2 APNs, CORS capacitor://localhost, DELETE method for alerts, rate-limiter XFF last-entry — is committed to repo but the VPS at `198.199.80.21` runs a stale copy. `/opt/peakly-proxy` is NOT a git clone; `git pull` fails there.

**The urgency has escalated today** because `APNS_LIVE = true` landed in commit `495a0b9`. iOS users can now see the Alerts tab and register push alerts. The stale VPS is still running the DER-encoded JWT and HTTP/1.1 fetch against APNs — zero pushes will be delivered. Users signing up for alerts on iOS are getting a broken experience right now.

```bash
# One SSH session — covers items 19 + 21 + 23 from CLAUDE.md
ssh user@198.199.80.21

# Copy the updated proxy (from your local machine)
rsync -av --exclude=node_modules server/ user@198.199.80.21:/opt/peakly-proxy/server/

# Install deps (check if jsonwebtoken version changed)
cd /opt/peakly-proxy && npm install

# Restart
pm2 restart peakly-proxy

# Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: apns_configured: true (if .p8 is in place), wx_cache_size: 0 (cold, refills fast)
```

**Estimated time:** 10 minutes hands-on.

---

## 3. P1 — Weather Cache Disk Persistence (Open #23)

The in-memory `_wxCache` (Map, up to 4000 entries) is wiped on every `pm2 restart`. The VPS redeploy requires a restart. A cold-cache hit from any traffic spike after the restart will send 373 × N uncached requests directly to Open-Meteo. This must go in the same SSH session as item #2.

**~30-line fix in `server/proxy.js`:**

```javascript
// Add at top after `const http2 = require('http2');`
const path = require('path');
const CACHE_FILE = path.join(__dirname, '.wx-cache.json');

// After `const _wxCache = new Map();` — restore from disk on startup:
try {
  const saved = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  const now = Date.now();
  for (const [k, v] of Object.entries(saved)) {
    if (now - v.ts < WX_TTL_MS) _wxCache.set(k, v);
  }
  console.log(`[cache] restored ${_wxCache.size} wx entries from disk`);
} catch (_) {}

// Replace _wxCacheSet body:
function _wxCacheSet(key, data) {
  if (_wxCache.size >= WX_CACHE_MAX) {
    const firstKey = _wxCache.keys().next().value;
    if (firstKey) _wxCache.delete(firstKey);
  }
  _wxCache.set(key, { data, ts: Date.now() });
  setImmediate(() => {
    try {
      const obj = {};
      for (const [k, v] of _wxCache) obj[k] = v;
      fs.writeFileSync(CACHE_FILE, JSON.stringify(obj));
    } catch (_) {}
  });
}
```

**Estimated time:** 25 minutes (write + test + deploy).

---

## 4. P1 — BASE_PRICES Covers Only 4.8% of Venues

**Numbers are worse than CLAUDE.md stated.** The actual measure by venue count: **355 of 373 venues (95.2%) have destination airports absent from BASE_PRICES**. Only 18 venues use airports in the 15-entry table. The deal score is a headline feature. When 95% of venues fall back to estimate pricing, the deal label is meaningless.

```
BASE_PRICES airports (15): YVR JFK LAX SFO ORD MIA SEA BOS ATL DEN DFW LAS PHX MSP DTW
Covered venues: 18 (4.8%)

Top missing airports by venue count:
CUN:9  SLC:8  SYD:8  GVA:7  IBZ:7  DPS:7  RNO:6  CMF:6  HKT:6
BTV:5  NCE:5  ZNZ:5  MRU:5  SCL:5  YYC:5  BOB:4  AUA:3  STT:3  SXM:3
```

Add the top 20 airports to `BASE_PRICES` in app.jsx. Values below are ballpark USD round-trip annual averages — verify against Aviasales before shipping:

```javascript
// Proposed additions to BASE_PRICES (~app.jsx line 860):
CUN: 420,   // Cancun — 9 venues
SLC: 280,   // Salt Lake City — 8 venues
SYD: 900,   // Sydney — 8 venues
GVA: 750,   // Geneva — 7 venues
IBZ: 680,   // Ibiza — 7 venues
DPS: 850,   // Bali/Denpasar — 7 venues
RNO: 290,   // Reno/Tahoe — 6 venues
CMF: 720,   // Chambery (Courchevel) — 6 venues
HKT: 900,   // Phuket — 6 venues
BTV: 310,   // Burlington/Stowe — 5 venues
NCE: 680,   // Nice — 5 venues
ZNZ: 950,   // Zanzibar — 5 venues
MRU: 880,   // Mauritius — 5 venues
SCL: 750,   // Santiago — 5 venues
YYC: 380,   // Calgary/Banff area — 5 venues
BOB: 1200,  // Bora Bora
AUA: 480,   // Aruba
STT: 450,   // St. Thomas
SXM: 460,   // St. Maarten
```

**Estimated time:** 1–2 hours including price verification.

---

## 5. P2 — APNS_LIVE = true but Alert Store is In-Memory

iOS alerts are now live-facing. The in-memory `_alerts` Map on the VPS is wiped on every `pm2 restart`. Any user who registered before the redeploy loses their alert silently. Minimum fix — persist to disk alongside `_wxCache`:

```javascript
const ALERTS_FILE = path.join(__dirname, '.alerts.json');

// On startup, after _wxCache restore:
try {
  const saved = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf8'));
  for (const [k, v] of Object.entries(saved)) _alerts.set(k, v);
  console.log(`[alerts] restored ${_alerts.size} alerts from disk`);
} catch (_) {}

// After every _alerts.set() and _alerts.delete(), add:
function _persistAlerts() {
  try {
    const obj = {};
    for (const [k, v] of _alerts) obj[k] = v;
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(obj));
  } catch (_) {}
}
```

Call `_persistAlerts()` after every `_alerts.set()` and `_alerts.delete()`. Bundle with VPS redeploy. **Estimated time:** 20 minutes.

---

## 6. P2 — Cache Stamp Stale

`PEAKLY_BUILD = "20260725d"` across app.jsx, sw.js, dist/index.html. Today is 2026-07-26. Bump before next ship:

```bash
perl -pi -e 's/20260725d/20260726a/g' app.jsx sw.js dist/index.html
```

---

## 7. P2 — dist/ Force-Tracked in Git

`dist/` is `.gitignore`-listed but was force-added for a one-off Xcode build (commit `87f8352`). deploy.yml rebuilds it from scratch on every push, so no functional issue. But it adds 557 KB to every `git clone` and will confuse future contributors. Remove after Xcode work is done:

```bash
git rm -r --cached dist/
git commit -m "chore: un-track dist/ (rebuilt by deploy.yml on every push)"
```

---

## 8. P2 — Stale Remote Branches (15 claude/*)

15 unmerged `claude/*` branches sitting on origin. None appear in CLAUDE.md as in-flight. Verify none are in-progress work, then delete:

```bash
git branch -r | grep "origin/claude/" | sed 's|  origin/||' | xargs -I{} git push origin --delete {}
```

---

## 9. Security Audit

| Item | Status |
|------|--------|
| Travelpayouts token in client (TP_MARKER `710303`) | ✓ Affiliate marker, not a secret — public by design |
| Supabase anon key in client | ✓ Public-safe, RLS-gated |
| Travelpayouts API token | ✓ Server-side only (env var `TRAVELPAYOUTS_TOKEN`) |
| `.gitignore` covers `.env`, `.pem`, `.key`, `.p12`, `.p8` | ✓ |
| Secrets in recent git log | ✓ None found |
| Alert ownership model | ✓ randomUUID capability token + pushToken ownership check |
| Rate limiter XFF | ✓ Uses `.pop()` (last entry) — forgery-resistant |
| Waitlist endpoint XFF (line 854) | ⚠ Still uses `[0]` (first entry) — forgeable. Low risk, fix for consistency |
| SRI on CDN scripts | ❌ Open #10 — no `integrity=` on React/ReactDOM/Babel tags. P2 |
| CSP meta tag | ❌ Open #10 — missing. P2 |

**Waitlist XFF one-liner fix:**
```javascript
// server/proxy.js line 854 — replace split(',')[0] with .pop():
ip: (xff ? xff.split(',').pop().trim() : '') || req.socket.remoteAddress,
```

---

## 10. Performance

**Production bundle (dist/):**
- `app.min.js`: 457 KB — no Babel, pre-compiled. ✓
- React + ReactDOM: ~53 KB gzipped
- Sentry SDK: ~50 KB gzipped
- Total first-load: ~560 KB gzipped. Reasonable for the scope.

**First-paint tier (commit `a634b6a`):** 12 venues rendered synchronously from cache before weather fetch completes. Good UX on repeat visits. ✓

**Images:** `loading="lazy"` present at all 5 render sites. ✓

**CDN versions:**
- React 18.3.1: latest 18.x ✓
- Babel Standalone 7.29.7: recent (dev-only, not in prod) ✓

---

## 11. Cost Estimate

| Scale | Est. monthly cost |
|-------|------------------|
| <10 MAU (now) | $6 VPS + $0 GH Pages = **$6** |
| 1K MAU | $6 VPS = **$6** (VPS cache absorbs it) |
| 10K MAU | $12–18 VPS (2GB RAM) = **$18** |
| 100K MAU | $48–60 VPS (4GB) = **$60** |

Open-Meteo free tier: no stated hard limit but throttles at volume. At 100K MAU the VPS weather cache is what keeps the infra bill at $60 instead of $600+.

---

## What Breaks First at Scale

**The VPS cold-start weather cache is the single point of failure.** The required redeploy will `pm2 restart` and wipe the in-memory `_wxCache`. A Reddit/HN spike in the 30–60 minutes after restart — before the cache warms up — sends up to 373 × N uncached requests directly to Open-Meteo per concurrent user. At 100 concurrent users that's 37,300 upstream calls in a 2-hour window. Open-Meteo doesn't publish a hard limit but will throttle and could start returning errors, causing every Explore load to show "conditions unavailable." The disk-persistence fix (#23 above) eliminates this entirely: the cache reloads in seconds from `.wx-cache.json` on startup, and a `pm2 restart` costs zero upstream calls. There is no other mitigation that doesn't require a paid tier. This fix must land in the same SSH session as the redeploy.

---

## Action Checklist

- [ ] **P1 TODAY** — SSH to 198.199.80.21, copy `server/proxy.js`, `pm2 restart peakly-proxy`. Verify `/health` shows `apns_configured: true`.
- [ ] **P1 SAME SESSION** — Write weather cache disk persistence to `server/proxy.js` before restart.
- [ ] **P1 SAME SESSION** — Write alerts disk persistence to `server/proxy.js`.
- [ ] **P1 THIS WEEK** — Add top 20 missing airports to `BASE_PRICES` in app.jsx.
- [ ] **P2** — Un-track `dist/` from git after Xcode build complete.
- [ ] **P2** — Bump cache stamp to `20260726a`.
- [ ] **P2** — Delete 15 stale `claude/*` remote branches.
- [ ] **P3** — Fix waitlist endpoint XFF to use `.pop()` for consistency with rate limiter.
