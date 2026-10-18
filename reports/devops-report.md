# DevOps Report — 2026-10-18 (RED → LAUNCH DAY)

**Status: 🔴 RED — LAUNCH DAY. VPS Day 70. Still not deployed. `origin/master` footgun Day 12. SW PRECACHE/CDN mismatch Day 14. Code is launch-ready. Infrastructure is not.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox always time out — not a VPS outage signal.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** — code freeze Day 34, unchanged since 2026-09-14 ✅ |
| VENUES (eval-counted) | **404** (134 skiing / 270 beach — matches CLAUDE.md) ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — 34-day freeze, expected ✅ |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ in `index.html:88` |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is a public affiliate marker |
| Supabase anon key | ✅ Intentional, public-safe, RLS-gated |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 sites across card components |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController at app.jsx:6381 |
| Sentry DSN | ✅ configured — `app.jsx:8`, `index.html:77` |
| `lateSeason:true` venues | ✅ **15** — matches CLAUDE.md |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| BASE_PRICES airport coverage | ✅ **186 airports defined, 152 distinct APs in VENUES — 100% coverage** — Open #22 CLOSED |
| proxy.js (committed) | ✅ `forecast_days=14`, disk cache, `capacitor://localhost` CORS, `DELETE` in Allow-Methods, `http2` APNs, `ieee-p1363` JWT — ALL fixes present. **NOT on VPS. This is the only problem.** |

**BASE_PRICES Open #22 is RESOLVED.** Previous reports said 68% coverage. A node eval today: 186 keys defined, 152 distinct APs in VENUES — zero gaps. Whoever did the backfill: it's done.

---

## 2. CRITICAL ISSUES (P0)

### P0-A: VPS Redeploy — Day 70 — **LAUNCH DAY** 🚨

Today is October 18. The r/travel post is today. Val Thorens opened yesterday — the "Opening Weekend in the French Alps" hook evaporates if the VPS isn't live before the post goes up.

**Broken at launch right now (VPS still running the August 11 build):**

| # | Broken feature | User impact |
|---|---------------|-------------|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. Front page shows one Fri–Mon window. Val Thorens shows `confidence: "low"` and gets filtered. The entire launch narrative fails. |
| 2 | `capacitor://localhost` absent from CORS allow-list | Every iOS native call gets blocked. App Store launch = broken iOS. |
| 3 | `DELETE` absent from `Access-Control-Allow-Methods` | Alert deletion silently fails on every device. `.catch(()=>{})` hides it. Day-1 user retention hit. |
| 4 | `_wxCache` in-memory only | `pm2 restart` wipes the cache. r/travel spike + cold cache = Open-Meteo rate-limited in under 5 minutes. "Conditions unavailable" for every user arriving from the link. |

All four fixes are already in the committed `server/proxy.js`:
- `forecast_days=14` — line 504
- `capacitor://localhost` in CORS — line 31
- `DELETE` in Allow-Methods — line 41
- Disk cache (`WX_CACHE_FILE`, `readFileSync`/`writeFileSync`) — lines 427–439

**This is a 5-minute operation:**

```bash
# From your local machine, in the peakly repo root:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

ssh root@198.199.80.21
cd /opt/peakly-proxy
pm2 restart peakly-proxy
pm2 save

# Verify (should be instant):
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

**Expected `/health` response after deploy:**
```json
{
  "status": "ok",
  "forecast_days": 14,
  "disk_cache": "enabled",
  "apns": "configured",
  "cors_origins": ["https://j1mmychu.github.io", "capacitor://localhost"]
}
```

If `forecast_days` is still `7` — old `proxy.js` is still running. Repeat the `scp` and restart.

**Estimate: 5 minutes. Every minute this isn't done is a minute of launch with a broken headline feature.**

---

## 3. HIGH ISSUES (P1)

### P1-A: SW PRECACHE vs index.html CDN Mismatch — Day 14

`sw.js` PRECACHE is caching a **different version from a different CDN** than `index.html` loads:

| File | CDN | Version |
|------|-----|---------|
| `sw.js` PRECACHE | `unpkg.com/@babel/standalone` | `7.29.7` |
| `index.html` `<script>` | `cdnjs.cloudflare.com/ajax/libs/babel-standalone` | `7.24.7` |

The service worker is pre-caching a file the page never loads, wasting bandwidth. The file `index.html` actually loads is NOT pre-cached.

In production (`dist/app.min.js`), Babel is stripped entirely and the PRECACHE entry is dead weight. But on dev and for any user hitting `index.html` directly, the mismatch means:

1. SW pre-caches `unpkg/7.29.7/babel.min.js` on install
2. `index.html` requests `cdnjs/7.24.7/babel.min.js`
3. Cache miss on every load — Babel always fetches live

**Fix — 2 options:**

Option A (correct — sync to match index.html, deduplicate CDN):
```javascript
// sw.js line 3-5 — change PRECACHE to:
const PRECACHE = [];
```
Production never needs Babel. Dev users benefit from CDN caching anyway. Zero PRECACHE is the honest choice.

Option B (if you want Babel pre-cached for dev):
```javascript
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
```

Option A is correct. Babel should not be in PRECACHE.

**Estimate: 2 minutes. Ship after the VPS deploy (don't break code freeze for this alone — bundle it if there's a next code push).**

### P1-B: `origin/master` Footgun — Day 12

`origin/master` is **511 commits behind `origin/main`**. It's sitting at a June 2026 build — 4 months old. GitHub Pages deploys on push to **both** `main` AND `master` (see `.github/workflows/deploy.yml`).

If anyone force-pushes to `master` or a git client accidentally pushes there:
- GitHub Pages serves the June 2026 build to every user
- `PEAKLY_BUILD = "20260610s"` (old) — SW purges the current cache and serves a 4-month-old app
- 404 venues drop to ~353. Scoring engine is the pre-pivot version.

**Fix:**

```bash
# Delete master, or bring it forward
git push origin :master           # delete remote master
# OR
git push origin main:master       # bring master current with main
```

Alternatively: protect `master` from pushes, or remove `master` from `deploy.yml`.

**The safest fix for launch day:**
```bash
ssh to VPS is already open for P0-A — no extra cost. This is a 30-second git command.
git push origin main:master
```

**Estimate: 30 seconds once you're at a terminal.**

### P1-C: Stale Cron Prompt — Day 12 (misleads automated analysis)

Automated agent crons still inject stale context: "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Reality: 404 venues, 2 categories, Pro cut, Sentry live since June. PM report has flagged this as a 2-minute cron edit for 12 days. Not blocking launch but it means every automated analysis run from this cron uses incorrect baseline data. Fix it after the VPS deploy.

---

## 4. MEDIUM ISSUES (P2)

### P2-A: APNS Still Unconfigured

`/health` shows `apns: unconfigured` (last verified 2026-08-11). The `server/proxy.js` already has `http2`-based APNs + `ieee-p1363` JWT. Needs: `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_BUNDLE_ID`, `APNS_KEY_PATH` env vars set on the VPS. Not a launch blocker (iOS Alerts tab is `isNativePlatform()` gated). Post-launch week 1 task.

```bash
pm2 set peakly-proxy:APNS_KEY_ID   <your-key-id>
pm2 set peakly-proxy:APNS_TEAM_ID  <your-team-id>
pm2 set peakly-proxy:APNS_BUNDLE_ID com.stormpeak.peakly
pm2 set peakly-proxy:APNS_KEY_PATH /opt/peakly-proxy/AuthKey_XXXXXXXX.p8
pm2 set peakly-proxy:APNS_PROD true
pm2 restart peakly-proxy
```

### P2-B: No SRI on CDN Scripts

React 18.3.1 and Babel 7.24.7 load from cdnjs without Subresource Integrity hashes. Low probability but if cdnjs is compromised, arbitrary code runs on every user's device. Not a launch blocker — SRI hashes can break Babel's inline eval (`data-presets="react"`). Document risk and defer.

---

## 5. COST ESTIMATE

| MAU | DigitalOcean VPS ($6/mo) | Open-Meteo (free: 10K/day) | Supabase (free: 500MB/50K MAU) | Total |
|-----|--------------------------|----------------------------|-------------------------------|-------|
| 1K | $6 | Free (proxy cache absorbs) | Free | **$6/mo** |
| 10K | $6 | Risk: free tier hit at ~66 concurrent; $20/mo commercial plan | Free | **$26/mo** |
| 100K | $18 (2GB droplet) | $20/mo commercial | $25/mo Pro | **$63/mo** |

**The disk cache in the committed proxy.js is the rate-limit defense.** Without the VPS redeploy, a 10K MAU spike blows through the free tier in minutes.

---

## 6. What Breaks First at Scale

**Open-Meteo rate limits at ~66 concurrent DAU on the same venue set.** The in-memory cache that's currently running is wiped on every `pm2 restart`. The committed `proxy.js` has disk persistence that survives restarts. Without the VPS deploy, a Reddit spike that triggers a `pm2` restart (or a crash + auto-restart) cold-starts the cache into a 66-user rate-limit wall. Every user from the r/travel link sees "conditions unavailable." The fix — disk-persisted cache + `forecast_days=14` — has been written since August. It is 5 minutes away from being live. Do the VPS deploy now.

---

## 7. RESOLVED FROM PRIOR REPORTS

| Item | Status |
|------|--------|
| Open #22 — BASE_PRICES coverage gap (68%) | ✅ **CLOSED** — 186 airports defined, 152 in VENUES, 0 missing |
| lateSeason:true count (CLAUDE.md said 15, grep said 10) | ✅ **CLOSED** — confirmed 15 via grep |
| Sentry DSN empty | ✅ **CLOSED** — configured `app.jsx:8`, `index.html:77` |
| HTTP proxy (not HTTPS) | ✅ **CLOSED** — `FLIGHT_PROXY` = `https://peakly-api.duckdns.org` |
| Travelpayouts token in client | ✅ **CLOSED** — server-side only |

---

## Priority Order for Today

1. **VPS deploy** — 5 minutes. Do it before the r/travel post. *(P0-A)*
2. **Verify `/health`** — confirm `forecast_days=14`, `disk_cache=enabled`. *(P0-A)*
3. **Post to r/travel** — the window is Val Thorens opening weekend.
4. **Fix `origin/master`** — 30 seconds. `git push origin main:master`. *(P1-B)*
5. **Fix PRECACHE** — 2 minutes. Empty the array. Ship in next code push. *(P1-A)*
6. **Fix cron prompt** — 2 minutes. *(P1-C)*
