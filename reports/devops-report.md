# DevOps Report — 2026-09-12 (YELLOW)

**Status: 🟡 YELLOW — dist/ build collision Day 3 unresolved (P1). VPS proxy.js fixes (#19/#21/#23) Day 32 unresolved (P1). PM's lateSeason "regression" is a FALSE ALARM — code check confirms all 15 venues correctly flagged. Semantic dup still present. No new P0s. Cache stamp stale by 2 days (no app.jsx commit).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. All proxy analysis from committed source only.

---

## What Changed Since Yesterday (Sep 11)

- **0 code commits today.** Three report commits only (DevOps, Content, PM). Three consecutive days without an app.jsx commit.
- **app.jsx**: 14,198 lines, 757,322 bytes — unchanged.
- **Cache stamp**: `20260910a` — stale by **2 days**. Correct by rule (auto-push only bumps on app.jsx/sw.js/index.html changes), but Sep 12 with a Sep 10 stamp signals zero code activity. Straight from the log: no shipping has happened since `c760dfb` (flights fallback fix, Sep 10).
- **VENUES**: **407** (134 skiing / 271 beach / 2 format variants). CLAUDE.md says 395 — 12 behind reality, now stale for 30+ days.
- **lateSeason correction (see §6)**: PM v147 claimed a regression — 10 venues flagged, 5 missing. **Wrong.** Actual count is **15**. All 5 allegedly missing venues (snowbird, zermatt, verbier, val-thorens, engelberg) are correctly flagged. PM report was based on a broken script or stale data. This P1 can be closed.
- **dist/ collision**: Still Day 3. Not fixed.
- **VPS**: Day 32 since Aug-11 redeploy. proxy.js open issues unchanged.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,198** |
| app.jsx bytes | **757,322** (~740 KB unminified) |
| dist/app.min.js | ⚠️ **MISSING** — dist/ poisoned by iOS build artifact. GH Actions rebuilds correctly on deploy. Live site fine. |
| Cache stamp | `20260910a` — stale 2 days, correct by rule |
| Plausible analytics | ✅ `index.html:32` — deferred, domain correct. **NOT in committed dist/index.html** (iOS artifact strips analytics). |
| Sentry DSN | ✅ Active — `9416b032...` wired at `app.jsx:8` + `index.html:77` |
| OG image (index.html) | ✅ Unsplash URL present — fixed in prior session |
| OG image (dist/index.html) | ⚠️ `content=""` — iOS artifact. GH Actions build will overwrite correctly. |
| React CDN | ✅ 18.3.1 — cdnjs.cloudflare.com (pinned, SLA-backed) |
| Babel CDN | ✅ 7.24.7 — cdnjs.cloudflare.com (stripped in prod by esbuild) |
| VENUES (eval) | **407** — CLAUDE.md says 395 (stale by 12) |

---

## 2. P1 — dist/ Build Collision: Day 3 Unresolved

**Same broken state. No fix shipped.**

`dist/` committed to git is the iOS build artifact from `build-ios.mjs`. It references `./vendor/react.production.min.js`, `./vendor/react-dom.production.min.js`, `./vendor/leaflet.css`, `./vendor/leaflet.js` — none of which exist. No `app.min.js`. No Plausible. Empty OG image meta.

```
dist/
  index.html    ← iOS layout (./vendor/* refs, no app.min.js, no Plausible)
  manifest.json ← copy
  robots.txt    ← copy
  sitemap.xml   ← copy
  sw.js         ← iOS sw (correct cache stamp)
  [NO app.min.js, NO vendor/, NO analytics]
```

**Live site is fine** — GH Actions runs `node scripts/build-web.mjs` which calls `fs.rmSync(DIST, {recursive:true,force:true})` before building. The committed dist/ is an iOS artifact from someone running `node scripts/build-ios.mjs` locally and committing the output.

**Root cause:** `build-ios.mjs` writes to `dist/` (line 5: `const DIST = path.join(ROOT, "dist")`). Same directory as `build-web.mjs`. Running iOS build locally trashes the web build output.

**Fix (10 min):**

Change `build-ios.mjs` output from `dist/` to `ios/App/App/public/`:
```js
// scripts/build-ios.mjs line 5 — change:
const DIST = path.join(ROOT, "dist");
// to:
const DIST = path.join(ROOT, "ios", "App", "App", "public");
```

Then fix the committed dist/:
```bash
node scripts/build-web.mjs  # regenerate correct dist/
git add dist/
git commit -m "fix: rebuild dist/ with web build (iOS artifact removed)"
```

This also resolves the `ios/App/App/public/` collision noted in prior reports — the iOS build should write directly there, not to dist/ and then get manually synced.

---

## 3. P1 — VPS Proxy (#19/#21/#23) — Day 32

`server/proxy.js` has been correct in the repo since Aug 11. Not live. `peakly-api.duckdns.org` is running the pre-Aug-11 build. The committed proxy has:
- `forecast_days=14` at both call sites ✅ (pre-Aug-11 was 7 → silently broke 2-weekend scoring)
- `capacitor://localhost` in CORS allowlist ✅ (iOS native blocked without this)
- `DELETE` in `Access-Control-Allow-Methods` ✅ (alert deletion broken without this)
- Rate limiter reads last X-Forwarded-For ✅
- `http2.connect` for APNs ✅
- `dsaEncoding: 'ieee-p1363'` JWT ✅
- Disk-cache for `_wxCache` (Open #23) — **NOT YET IN proxy.js** — still in-memory

Check: `grep -n "fs\.\|diskCache\|persist\|json" server/proxy.js | head` returns nothing weather-cache related. Open #23 still needs the ~30-line disk persistence fix.

**Jack needs to SSH to VPS and copy proxy.js.** Same blockers as 31 days ago:
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Expected after redeploy: `apns: "configured"` if keys are set, `forecast_days: 14` in responses, uptime resets.

**Open #23 (weather cache disk persistence) still needs to be coded before VPS redeploy**, otherwise a pm2 restart wipes the entire wx cache. ~30-line fix:

```js
// server/proxy.js — add after _wxCache declaration (~line 450):
const WX_CACHE_FILE = path.join(os.tmpdir(), 'peakly-wx-cache.json');
function loadWxCache() {
  try {
    if (fs.existsSync(WX_CACHE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(WX_CACHE_FILE, 'utf8'));
      for (const [k, v] of Object.entries(saved)) _wxCache.set(k, v);
      console.log(`[wx-cache] loaded ${_wxCache.size} entries from disk`);
    }
  } catch (e) { console.warn('[wx-cache] load failed:', e.message); }
}
function saveWxCache() {
  try {
    const obj = {};
    for (const [k, v] of _wxCache) obj[k] = v;
    fs.writeFileSync(WX_CACHE_FILE, JSON.stringify(obj));
  } catch (e) { console.warn('[wx-cache] save failed:', e.message); }
}
// Call loadWxCache() at startup, saveWxCache() on cache writes.
// Add 'os' and 'fs' requires at top of file if not present.
```

---

## 4. P1 — Semantic Duplicate: san-vito-lo-capo — Day 3

Two entries for the exact same beach, same coordinates, same airport (TPS):
- `san-vito-lo-capo-t21`: 4.68 rating, 4,719 reviews (lower quality)
- `beach_san_vito_lo_capo`: 4.96 rating, 24,600 reviews (keep this one)

**Fix (1 min, bundle with next app.jsx touch):**
```bash
# Delete line containing san-vito-lo-capo-t21 from app.jsx
grep -n "san-vito-lo-capo-t21" app.jsx
# Then delete that line + ensure surrounding comma hygiene
```
Net venues after fix: **406**.

---

## 5. P1 — CLAUDE.md Venue Count Stale

CLAUDE.md "Current State" section says **395 venues** (confirmed 2026-08-11). Actual count: **407**. Delta: +12 venues shipped since the last CLAUDE.md update. Not a runtime bug but agents (including this one) use CLAUDE.md as ground truth — stale counts propagate into every report.

Update CLAUDE.md line: `**395 venues**` → `**407 venues** (134 skiing / 271 beach)` and bump the date.

---

## 6. CORRECTION — PM v147 lateSeason "Regression" Is a False Alarm

PM report v147 (Sep 11) flagged a P1: "lateSeason count dropped from 14 to 10; snowbird/zermatt/verbier/val-thorens/engelberg missing."

**This is wrong.** Code check on origin/main HEAD:

```bash
grep -c "lateSeason.*true\|\"lateSeason\": true" app.jsx
# → 15
```

All 5 allegedly-missing venues are correctly flagged:
- `snowbird` → `"lateSeason": true` at line 832
- `zermatt` → `"lateSeason": true` at line 1139
- `engelberg` → `"lateSeason": true` at line 1162
- `verbier` → `"lateSeason": true` at line 1734
- `val-thorens` → `"lateSeason": true` at line 1757

Full 15-venue list: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, snowbird, zermatt, engelberg, verbier, val-thorens.

CLAUDE.md previously said 14 (now 15 with hintertux-glacier added). The PM script that produced "count: 10" was broken — likely only counting compact-format entries (`lateSeason:true`) and missing the JSON-format entries (`"lateSeason": true`). **Close this P1. Do not ship a "fix" for a non-bug.**

---

## 7. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts API token | ✅ Server-side only (`server/proxy.js`). Never in client code. |
| TP_MARKER (`710303`) | ✅ In `app.jsx:6668` — this is a public affiliate marker ID, not a private credential. Appears in referral URLs and is legitimately client-visible. |
| SUPABASE_ANON_KEY | ✅ In `app.jsx:26` — documented as public-safe, RLS-gated. Standard Supabase pattern. |
| .gitignore | ✅ Covers `.env`, `*.p8`, `*.pem`, `*.key`, business plan docs, node_modules |
| Sentry DSN | ✅ Active — browser-exposed by design (Sentry DSN is not a secret) |
| git log secrets scan | ✅ Last 10 commits are reports and build fixes — no credentials |
| APNS keys | ✅ `.p8` in `.gitignore`; `APNS_KEY_PATH` is a server env var only |

**One note:** `SUPABASE_ANON_KEY` being committed to a public GitHub repo means anyone can send requests to the Supabase project using the anon role. This is the documented Supabase pattern for client-facing apps — the RLS policies are what actually gate data access. If RLS policies are ever misconfigured, the anon key is the attack surface. Not an action item today, but worth knowing.

---

## 8. Performance Analysis

| Metric | Value |
|--------|-------|
| app.jsx unminified | 757 KB (14,198 lines) |
| dist/app.min.js | Built by GH Actions via esbuild — not in committed dist/ (iOS artifact) |
| Babel Standalone (dev only) | 924 KB — stripped in prod |
| React 18 CDN | ~42 KB gzipped (cdnjs) |
| ReactDOM 18 CDN | ~130 KB gzipped (cdnjs) |
| Supabase lazy | ~80 KB gzipped (lazy-loaded only on auth) |
| Sentry CDN | ~38 KB gzipped (deferred) |
| Total prod parse | ~230 KB JS gzipped + esbuild-compiled app.min.js (~200 KB estimated gzip) |
| **Cold load mobile** | ~2s (esbuild kills the 8-12s Babel wall from pre-Jun-20 builds) |

**Biggest bottleneck**: The 407-venue VENUES array hardcoded in app.jsx. Parsing 757 KB of JS still blocks the main thread. The esbuild build helps but the array itself is ~400 KB of the file. Not actionable without splitting the architecture (which is explicitly forbidden). At current user levels: not a problem. At 10K DAU: first complaints.

**Images**: Unsplash photos use `?w=1200&h=900&fit=crop`. No `loading="lazy"` on img tags — this loads all visible card photos simultaneously. At 407 venues, only ~10-15 render at once, so not critical. The `?q=75&auto=format` params are already in place for the venues with explicit Unsplash params; others use raw Wikipedia Commons URLs without compression params.

---

## 9. Cost Projection

| Scale | DO VPS | GitHub Pages | Supabase | Open-Meteo | Total/mo |
|-------|--------|-------------|----------|------------|---------|
| Today (< 100 MAU) | $6 | $0 | $0 | $0 | **$6** |
| 1K MAU | $6 | $0 | $0 | $0 | **$6** |
| 10K MAU | $12–18 | $0 | $0–25 | $0 | **$12–43** |
| 100K MAU | $48+ | $0 | $25–599 | $0–200 | **$73–850** |

Open-Meteo free tier is 10,000 requests/day. At 407 venues × batch of 50 every 2 seconds = ~9 batches per full refresh cycle. At 100 concurrent users refreshing every 5 min = 180/day refresh cycles × 9 batches = 1,620 API calls/day — well within limits. At 10K DAU the proxy cache becomes essential (which is why #19 is a pre-traffic gate).

**First thing that breaks at scale**: Open-Meteo rate ceiling, mitigated by the proxy cache (Open #19 fix). Without the VPS redeploy, a Reddit/HN spike with 500+ concurrent users will hit the free tier ceiling in minutes and serve stale/errored weather for every venue. The in-memory proxy cache absorbs N→1 fan-out for the same venue. The disk persistence fix (Open #23) means a pm2 restart doesn't reset to cold cache mid-spike.

---

## 10. Action Items Summary

| # | Priority | Item | Fix Time | Blocker? |
|---|----------|------|----------|---------|
| 1 | **P1** | dist/ build collision (Day 3) — change build-ios.mjs output path | 10 min | No (live site fine) |
| 2 | **P1** | VPS redeploy (#19 + #21) — scp proxy.js + pm2 restart | 5 min (Jack only, SSH) | Yes (2-weekend scoring, alert deletion, iOS native) |
| 3 | **P1** | Open #23 — disk-cache ~30-line fix in proxy.js before VPS redeploy | 20 min | Prerequisite for #2 |
| 4 | **P1** | Semantic dup san-vito-lo-capo-t21 deletion | 1 min | No |
| 5 | **P2** | BASE_PRICES airport coverage — 15 airports / ~147 venue airports (10%) | 2 hr | No |
| 6 | **P2** | CLAUDE.md venue count update (395→407) | 2 min | No |
| 7 | **CLOSED** | lateSeason regression (PM P1) — false alarm, 15 venues correctly flagged | — | — |

---

## What Breaks First at Scale

**Open-Meteo free tier**, full stop. At ~500 concurrent users refreshing conditions, the client's direct Open-Meteo calls overwhelm the 10K req/day ceiling in under an hour. The VPS proxy with shared 2hr cache is the designed mitigation — it's already written and correct in `server/proxy.js`. The blocker is that it hasn't been deployed in 32 days because Jack hasn't done the 5-minute SSH copy. Once that's live, a Reddit spike is survivable. Without it, the day after any meaningful press coverage, every venue shows "conditions unavailable" for hours. Fix Open #19 before you post anywhere. The disk-persistence add-on (Open #23) is a bonus — it means a pm2 restart mid-spike doesn't reset the cache and immediately blast through rate limits again.
