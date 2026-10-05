# DevOps Report — 2026-10-05 (YELLOW)

**Status: 🟡 YELLOW — VPS Day 57. Oct 4 deadline MISSED (yesterday). `origin/master` footgun Day 13. NEW: VENUES bracket-walker count 406 vs category-grep 404 — 2-venue discrepancy needs investigation. Code freeze Day 21 clean. All application code GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN (with one new flag)

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 759 KB raw** (unchanged Day 21) |
| VENUES (category grep) | **404 total — 134 skiing / 270 beach** ✅ matches CLAUDE.md |
| VENUES (bracket walker) | **406** ⚠️ 2-venue discrepancy — see P2 below |
| lateSeason:true venues | **15 confirmed** ✅ |
| Plausible analytics | ✅ present, uncommented (index.html:32) |
| React 18.3.1 (cdnjs) | ✅ |
| Babel Standalone 7.24.7 (cdnjs) | ✅ dev-only; production CI drops it |
| Sentry DSN | ✅ configured (`9416b032...`, index.html:77 + app.jsx:7–8) |
| PEAKLY_BUILD / CACHE_NAME stamp | ⚠️ `"20260914a"` — frozen Day 21. Auto-bumps on next app.jsx commit. |
| All API calls HTTPS | ✅ FLIGHT_PROXY = `https://peakly-api.duckdns.org` |
| No secrets in client | ✅ Supabase anon key exposed intentionally (RLS-gated, public-safe) |
| Image lazy loading | ✅ 9 `loading="lazy"` tags confirmed |
| fetchTravelpayoutsPrice timeout | ✅ AbortController 4s, 2 retries, 429/500 backoff |

**Zero code commits to app.jsx/sw.js/index.html in 21 days. Code freeze holds.**

---

## 2. Flight Proxy Status — 🔴 RED (Day 57 — yesterday was the PM-set deadline)

The Oct 4 deadline passed yesterday. From PM v170: "The 4 deploy commands have been documented in every report since Aug 11. The code in `server/proxy.js` is correct, committed, and ready."

**What is broken without VPS redeploy:**
- Two-weekend scoring returns null for all 404 venues (proxy still returns 7-day forecasts)
- iOS CORS block (capacitor://localhost not in Access-Control-Allow-Origin)
- Alert deletion silently fails (preflight blocks DELETE)
- Rate limiter reads first X-Forwarded-For entry — spoofable
- Weather cache wiped on every pm2 restart (no disk persistence)

**The 4 commands. Paste these. Done in under 2 minutes:**
```bash
# From local machine with repo cloned:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"

# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Should show: forecast_days:14, apns:configured or apns:unconfigured, fresh uptime
```

**Estimated time:** 2 minutes if SSH keys are configured.

---

## 3. New Finding: VENUES Bracket-Walker vs Category-Grep Discrepancy — P2

Today's bracket-walker count: **406**. Yesterday and all prior reports: **404**. Category grep: `134 skiing + 270 beach = 404`.

This means 2 objects exist inside the `VENUES = [...]` array that have no `category` field (or have a category other than "skiing"/"beach"). These would silently render as venues with undefined category, potentially crashing the score engine or the category filter.

**Investigate with:**
```bash
node -e "
const fs = require('fs');
const code = fs.readFileSync('app.jsx', 'utf8');
// Quick check: find venues without category
const matches = [...code.matchAll(/\{[^{}]*\"id\"[^{}]*\}/gs)].filter(m => !m[0].includes('category'));
console.log('Venues missing category:', matches.length);
matches.forEach(m => console.log(m[0].substring(0, 120)));
"
```

Or a more reliable approach — eval the actual array:
```bash
node -e "
const fs = require('fs');
let src = fs.readFileSync('app.jsx', 'utf8');
const start = src.indexOf('const VENUES = [');
const end = src.indexOf('];', start) + 2;
const venuesSrc = src.slice(start, end).replace('const VENUES = ', '');
const venues = eval(venuesSrc);
const noCat = venues.filter(v => !v.category);
console.log('Total:', venues.length, '| No category:', noCat.length);
noCat.forEach(v => console.log(v.id, v.title));
"
```

**If 2 venues have no category:** they pass `applyFilters` but produce NaN scores. Fix: add the correct category to each.

**Estimated time:** 5 minutes to identify + fix.

---

## 4. SW PRECACHE Babel URL Mismatch — P3 (Day 2, unchanged)

`sw.js` PRECACHE caches a URL nobody loads:

```js
// sw.js line 3–5:
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"  // ← wrong CDN, wrong version
];

// index.html line 88 loads:
// https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js
```

Two problems:
1. **Wrong CDN** — SW caches from `unpkg.com`, page loads from `cdnjs.cloudflare.com`. Cached entry is never used.
2. **Wrong version** — 7.29.7 vs 7.24.7.

Production is unaffected (dist/app.min.js, no Babel). Dev/local users get Babel uncached. Fix:

```js
// sw.js — replace PRECACHE with:
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
```

Or clear it: `const PRECACHE = [];` since Babel's cache-busting behavior is already handled by the browser's HTTP cache and CDN ETags.

**Estimated time:** 30 seconds.

---

## 5. `origin/master` Footgun — P1 (Day 13)

`origin/master` is **50 commits BEHIND** `origin/main`. The `scripts/auto-push.sh` pipeline pushes `master:main` (refspec that pushes local master → remote main). But any `git push` run without auto-push.sh defaults to `master → origin/master`, which silently diverges the stale branch further.

Worst case: a session runs `git checkout master && <edits> && git push` thinking they're on main, and creates `origin/master` noise that a future merge re-introduces stale code.

**Fix — run once, same terminal as VPS deploy:**
```bash
git push origin --delete master
```

That's it. 10 seconds.

---

## 6. Security Audit — ✅ GREEN

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ NOT present. Server-side only via VPS proxy. |
| Supabase anon key in client | ✅ Intentional, public-safe (RLS-gated per architecture). JWT exp 2093. |
| Sentry DSN in client | ✅ Intentional. Front-end SDK design. |
| .gitignore covers .env, *.pem, *.p8, *.key | ✅ Confirmed. |
| Recent commits with secrets | ✅ No secrets in last 15 commits (all daily reports + one proxy.js auto-push from Aug 11). |
| git secret scan on recent app.jsx | ✅ No token/key patterns found beyond the above known-acceptable ones. |

---

## 7. Performance Analysis — ✅ GREEN (with known bottleneck)

| Asset | Size |
|-------|------|
| app.jsx (raw) | 759 KB |
| dist/app.min.js (production) | ~439 KB minified (esbuild, per CLAUDE.md) |
| React 18.3.1 + ReactDOM UMD | ~140 KB gzipped |
| Babel Standalone (dev only) | ~620 KB gzipped |
| Supabase JS (lazy-loaded) | ~80 KB gzipped |

**Production total (Pages path):** ~439 KB app + ~140 KB React = **~580 KB gzipped** on first load. Reasonable.

**Single largest bottleneck:** The Supabase SDK lazy-load fires on any existing session or magic-link callback. At scale, if you ever sign in 10K+ concurrent users after a Reddit spike, the 80 KB Supabase fetch hits on every one of them. Not a problem today. Put it behind `requestIdleCallback` if it becomes a LCP issue.

**All `<img>` tags:** 9 confirmed `loading="lazy"` ✅

---

## 8. Cost Projection

| Scale | GitHub Pages | DigitalOcean VPS | Supabase | Open-Meteo | Total |
|-------|-------------|-----------------|----------|------------|-------|
| Current (<100 MAU) | $0 | $6/mo | $0 (free tier) | $0 (free tier) | **$6/mo** |
| 1K MAU | $0 | $6/mo | $0 (free tier, 500MB DB) | $0 (free tier, <1M reqs/day) | **$6/mo** |
| 10K MAU | $0 | $12/mo (upgrade to 2GB RAM) | ~$25/mo (Pro tier) | $0 | **~$37/mo** |
| 100K MAU | $0 | $48/mo (4GB, or CDN-fronted) | ~$25/mo | ~$20/mo | **~$93/mo** |

Revenue at $7.58/1K MAU covers infra from Day 1. At 10K MAU: $75.80 revenue vs $37 infra = profitable.

**Cost optimization already in place:** weather proxy caches upstream calls (2hr TTL, 4000-entry LRU). Main risk at scale is the Open-Meteo free tier ceiling (~66 concurrent DAU hitting uncached coords). Disk persistence for the weather cache (#23 in CLAUDE.md) prevents the cold-restart problem.

---

## What Breaks First at Scale

**Open-Meteo rate limiting.** The free tier allows roughly 600 requests/minute across all endpoints. At 100 concurrent users hitting Explore simultaneously with uncached coords, you'll exceed that ceiling. The VPS proxy's in-memory cache is the mitigation — but a pm2 restart wipes it cold. A Reddit or HN spike that coincides with a VPS restart (unlikely but possible) results in 100 concurrent uncached weather fetches, all hitting Open-Meteo raw, triggering a 429 storm. The fix is Open #23 (disk persistence on the weather cache — 30 lines, bundle with the VPS deploy). Without it, the post-spike "conditions unavailable" banner is the fallback — it works, it's ungraceful but not a crash. Implement disk persistence before any traffic-driving social post.

---

## Open Items (priority order)

| # | Item | Status | Day count |
|---|------|--------|-----------|
| P0 | VPS redeploy (proxy.js to 198.199.80.21) | ❌ UNDEPLOYED | Day 57 |
| P1 | `origin/master` branch footgun | ❌ OPEN | Day 13 |
| P2 | VENUES bracket-walker 406 vs grep 404 discrepancy | 🆕 NEW today | Day 1 |
| P2 | Open #23 — weather cache disk persistence (bundle with VPS deploy) | ❌ OPEN | — |
| P3 | SW PRECACHE Babel URL mismatch (unpkg 7.29.7 vs cdnjs 7.24.7) | ❌ OPEN | Day 2 |
| — | Code stamp frozen at `20260914a` | ℹ️ expected during freeze | Day 21 |
