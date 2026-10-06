# DevOps Report — 2026-10-06 (YELLOW)

**Status: 🟡 YELLOW — VPS Day 58 (Oct 4 deadline missed, now Day 58). Code freeze Day 22 clean. TWO P1/P2 items closed today: `origin/master` footgun RESOLVED (branch gone from remote), bracket-walker 406 discrepancy EXPLAINED (comment-embedded coord objects, not real venues — real count remains 404). 12 days to Oct 18 launch.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 759 KB raw** (unchanged, code freeze Day 22) |
| VENUES (eval bracket-walker) | **404 total — 134 skiing / 270 beach** ✅ |
| Bracket-walker discrepancy RESOLVED | 406 = 404 real venues + 2 `{lat,lon}` coord objects embedded in code comments (lines 4723, 4734). Not real entries. The walker doesn't skip comment text. Count is correct at 404. |
| lateSeason:true venues | **15** ✅ — 10 compact format (`lateSeason:true`) + 5 JSON format (`"lateSeason": true`) — grep-only returns 10, wrong. CLAUDE.md is correct. |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| Sentry DSN | ✅ configured (`index.html:77`) |
| React 18.3.1 (cdnjs) | ✅ |
| Babel Standalone 7.24.7 (cdnjs) | ✅ dev-only; esbuild strips it in production |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | ℹ️ `"20260914a"` — frozen Day 22 (expected: no app.jsx commits) |
| All API calls HTTPS | ✅ `FLIGHT_PROXY = "https://peakly-api.duckdns.org"` |
| No secrets in client | ✅ Supabase anon key is intentional/public-safe (RLS-gated). No Travelpayouts token in client. |
| Image lazy loading | ✅ 9 `loading="lazy"` tags confirmed |
| fetchTravelpayoutsPrice timeout | ✅ AbortController 4s at `app.jsx:6381` |

**Zero code commits to app.jsx/sw.js/index.html in 22 days. Code freeze holds.**

---

## 2. P1 Resolved: `origin/master` Footgun — ✅ CLOSED (Day 13 → RESOLVED)

`git branch -r` returns only `origin/main`. The stale `origin/master` branch is gone from the remote. This was a P1 footgun for 13 days — now gone. No action needed.

---

## 3. P2 Resolved: Bracket-Walker 406 Discrepancy — ✅ EXPLAINED (Day 1 → RESOLVED)

Yesterday's report flagged a 406 vs 404 discrepancy. Root cause confirmed today:

`server/proxy.js` comment lines inside the VENUES array embed airport coordinate objects:
```
// CPT:{lat:-33.9648,lon:18.6017} added to AIRPORT_COORDS.  (app.jsx:4723)
// GIG:{lat:-22.8100,lon:-43.2507} added to AIRPORT_COORDS.  (app.jsx:4734)
```

The bracket-walker counts `{` at array depth-1, which includes these comment-embedded objects. The actual venue count is **404** — the category grep is right. The bracket-walker needs comment stripping to be fully reliable:

```js
// Improved bracket-walker: strip // comments before counting
const stripped = src.replace(/\/\/[^\n]*/g, '');
```

Don't break code freeze for this. Carry forward as a fix for the next dev session's bracket-walker script update. Not a product bug.

---

## 4. Flight Proxy Status — 🔴 RED (Day 58 — Oct 4 deadline missed)

No change. From source (`server/proxy.js`), the committed but undeployed fixes remain:
- `forecast_days: 14` (currently serving 7 — two-weekend scoring returns null for all 404 venues)
- `capacitor://localhost` in CORS (iOS native calls blocked)
- `DELETE` in `Access-Control-Allow-Methods` (alert deletion silently fails)
- Rate limiter reads first X-Forwarded-For (forgeable)
- Weather cache in-memory only (wiped on pm2 restart)

**12 days to launch. This is the only blocking infra item. The 4-line deploy:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, uptime <60s, apns:unconfigured|configured
```

2 minutes with SSH keys configured. The code is right. It just needs to land on the box.

---

## 5. SW PRECACHE Babel Mismatch — P3 (Day 3)

`sw.js:4` caches: `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js`
`index.html:88` loads: `https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js`

Wrong CDN, wrong version — the cached entry is never used. Production is unaffected (dist/ path uses no Babel). Fix:

```js
// sw.js line 3-5 — either clear or align:
const PRECACHE = []; // simplest — browser HTTP cache + CDN ETags handle Babel fine
// OR align with index.html:
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
```

Don't break code freeze for this. Queue for the first app.jsx commit post-launch.

---

## 6. Security Audit — ✅ GREEN

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ NOT present — `TP_MARKER="710303"` (affiliate marker, not a secret) only |
| Supabase anon key in client | ✅ Intentional, public-safe (RLS-gated). JWT expires 2093. |
| Sentry DSN in client | ✅ Intentional. Front-end SDK design. |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ Confirmed |
| Recent git commits with secrets | ✅ Clean — 5 most recent are daily reports only |

---

## 7. Performance Analysis — ✅ GREEN (no change)

| Asset | Size |
|-------|------|
| app.jsx raw | 759 KB |
| dist/app.min.js (production esbuild) | ~439 KB minified |
| React 18 + ReactDOM UMD (cdnjs) | ~140 KB gzipped |
| Babel Standalone (dev only) | ~620 KB gzipped |
| Supabase JS (lazy-loaded) | ~80 KB gzipped |

**Production first load: ~580 KB gzipped** (app.min.js + React). Reasonable.
**Bottleneck:** Same as prior reports — Open-Meteo rate ceiling at concurrent load spike. Fix is Open #23 (disk cache, 30 lines, bundle with VPS deploy).
**9 `loading="lazy"` img tags** confirmed.

---

## 8. Cost Projection (no change)

| Scale | GitHub Pages | DigitalOcean VPS | Supabase | Open-Meteo | Total |
|-------|-------------|-----------------|----------|------------|-------|
| Current (<100 MAU) | $0 | $6/mo | $0 | $0 | **$6/mo** |
| 1K MAU | $0 | $6/mo | $0 (free tier) | $0 | **$6/mo** |
| 10K MAU | $0 | $12/mo (2GB) | ~$25/mo (Pro) | $0 | **~$37/mo** |
| 100K MAU | $0 | $48/mo | ~$25/mo | ~$20/mo | **~$93/mo** |

Revenue at $7.58/1K MAU covers infra from Day 1.

---

## What Breaks First at Scale

**Open-Meteo rate limiting on cold-cache restart.** A traffic spike immediately after the required VPS redeploy (which wipes the in-memory weather cache) hits all 404 venues' weather endpoints raw. Free tier: ~600 req/min. A modest 30 concurrent users on Explore hits ~300 uncached coord pairs in the first minute. With the in-memory cache wiped cold, you'll hit rate limits before it fills. Open #23 (disk-persisted cache, ~30 lines) prevents this. Bundle it with the VPS deploy — same SSH session, same pm2 restart. Without it, "conditions unavailable — pull to refresh" is the fallback. Ungraceful, not a crash, but bad look on Reddit Day 1.

---

## Open Items (priority order)

| # | Item | Status | Day count |
|---|------|--------|-----------|
| P0 | VPS redeploy (proxy.js → 198.199.80.21) | ❌ UNDEPLOYED | **Day 58** |
| P2 | Open #23 — weather cache disk persistence | ❌ OPEN | Bundle with VPS |
| P3 | SW PRECACHE Babel CDN/version mismatch | ❌ OPEN | Day 3 |
| ✅ | `origin/master` footgun | **RESOLVED** | Was Day 13 |
| ✅ | Bracket-walker 406 discrepancy | **EXPLAINED** | Was Day 1 |
| ℹ️ | Code stamp frozen at `20260914a` | Expected during freeze | Day 22 |

**12 days to Oct 18. Only blocker is the VPS deploy. Everything else is clean.**
