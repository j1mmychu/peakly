# DevOps Report — 2026-10-31 (RED)

**Status: 🔴 RED — VPS Day 83. Oct 30 hard deadline MISSED by 1 day. Nov 7 is the new Jack-stated deadline (7 days). PRECACHE P1 Day 24. master footgun Day 24. Cache stamp 47 days stale. 15 unmerged `claude/*` branches + 3 others persist on origin. No app.jsx code change since Oct 12 (19 days).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,237 lines / 758,944 bytes (741 KB)** — unchanged since Oct 12 (19 days) |
| Venue count (eval) | **404** (134 skiing / 270 beach) — matches CLAUDE.md ✅ |
| `lateSeason:true` venues | **15** (confirmed via grep) ✅ |
| `.venue-baseline` | ❌ **MISSING** — auto-push guard will FAIL on next app.jsx commit |
| `PEAKLY_BUILD` / `CACHE_NAME` | `"20260914a"` — **47 days stale** ⚠️ (auto-bumps on next ship) |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18 / Babel CDN | ✅ pinned to specific versions (`18.3.1` / `7.24.7`) |
| PRECACHE | ⚠️ **P1 Day 24** — contains `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js`, but `index.html:88` loads `7.24.7` via cdnjs. Version mismatch: SW caches a Babel it will never serve |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS confirmed |
| Sentry DSN | ✅ configured and initializing (`app.jsx:8`, `index.html:77`) |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ all `<img>` tags covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController (`app.jsx:5521`) |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| `fetchAllWeather` ReferenceError | ✅ FIXED — `onRefresh` wired to `fetchInitialWeather` (app.jsx:14129) |
| `forecast_days` (client) | ✅ 14 days (`app.jsx:5546`) |
| Unmerged origin branches | ❌ **18 branches** — 15 `claude/*` + `fix-appjsx-final` (597 commits ahead of main!), `restore-appjsx`, `test-small` |

---

## 2. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts server token | ✅ server-side only — `TP_MARKER="710303"` in client is a public affiliate marker |
| Supabase anon key in client | ✅ intentional — public-safe, RLS-gated (documented in CLAUDE.md) |
| `.env` secrets in git | ✅ none — `.gitignore` covers all secret file patterns |
| Recent commits (last 10) | ✅ only report files, no code changes |
| `server/proxy.js` — APNs JWT encoding | ⚠️ **Open #21 — unresolved** — DER vs P1363 + HTTP/1.1 vs HTTP/2. Still blocked if anyone tries to configure APNS |
| Alert IDs | ⚠️ Open #21 — `crypto.randomUUID()` fix was in working tree 2026-07-25 but never confirmed committed |

No new security regressions vs. yesterday.

---

## 3. Issues

### P0-A: VPS Redeploy — Day 83, Nov 7 Hard Deadline (7 Days Left)

`server/proxy.js` fixes have been committed to this repo since **2026-07-24** — 99 days ago. They are NOT on the VPS. Until this SSH copy happens:

- Two-weekend scoring is **off** (VPS returns 7-day forecasts, client expects 14)
- iOS native app **cannot reach the proxy** (CORS missing `capacitor://localhost`)
- Alert deletion **silently fails** (DELETE not in `Access-Control-Allow-Methods`)
- Weather cache has **no disk persistence** — a `pm2 restart` wipes it cold

```bash
# Jack: SSH to VPS and run this
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-tmp
cp /tmp/peakly-tmp/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health
# Confirm: forecast_days:14, CORS shows capacitor://localhost, DELETE in methods
rm -rf /tmp/peakly-tmp
```

**Estimated fix time: 10 minutes.** This is the single biggest unblocked item. Every day it doesn't ship, Whistler opens Nov 21 and ski-season scoring is broken.

### P0-B: `.venue-baseline` Missing

The `scripts/auto-push.sh` venue-count guard reads `.venue-baseline`. File is gone. The next `app.jsx` commit will either fail silently (if the guard errors out) or skip the count check, losing protection against venue regressions.

```bash
cd /home/user/peakly
echo "404" > .venue-baseline
git add .venue-baseline
git commit -m "restore .venue-baseline at 404"
git push origin main
```

**Estimated fix time: 2 minutes.**

---

### P1-A: PRECACHE Version Mismatch — Day 24

`sw.js:4` caches `babel@7.29.7` from unpkg. `index.html:88` loads `babel@7.24.7` from cdnjs. These are different URLs and different versions. The SW is caching an asset it will never serve — every SW install makes a useless network request to unpkg for a file nobody loads.

**Fix (`sw.js` line 3-5):**
```js
// Option A: match index.html (clear and correct)
const PRECACHE = [];

// Option B: actually precache the real Babel (makes cold loads faster)
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
```
Option A is safest — PRECACHE was `[]` for most of the app's history. Option B adds cold-load speedup. Either eliminates the mismatch. **Whichever is picked, bump CACHE_NAME + PEAKLY_BUILD + index.html cache buster in lockstep.**

**Estimated fix time: 5 minutes.**

### P1-B: master Branch Footgun — Day 24

`origin/master` exists and `deploy.yml` deploys from both `main` and `master`. An accidental push to `master` (easy to do if a local clone was created before the rename) silently deploys to production, bypassing the `main` PR flow and all branch protections. CLAUDE.md documents this but it remains live.

**Fix (Jack, GitHub UI):**
1. Go to repo Settings → Branches → delete `master` branch rule if present
2. `git push origin --delete master`
3. Update `deploy.yml` to remove the `master` trigger:

```yaml
# .github/workflows/deploy.yml — remove master
on:
  push:
    branches: [ main ]  # remove "- master"
```

**Estimated fix time: 5 minutes.**

---

### P2-A: 18 Unmerged Branches on Origin (15 `claude/*` + 3 others)

No change from yesterday. `fix-appjsx-final` is 597 commits ahead of `main` — that's a substantial diverging history, likely from a long agent session. `restore-appjsx` and `test-small` appear to contain the same "Fix 4 data-quality bugs" set.

**Risk:** An agent or Jack could accidentally merge one of these, rebasing months of diverged history onto main.

**Fix (Jack, GitHub):**
```bash
# Review non-claude branches before deleting
git log --oneline origin/fix-appjsx-final ^origin/main | head -20
git log --oneline origin/restore-appjsx ^origin/main | head -10

# If the data-quality fixes in restore-appjsx/test-small aren't already in main, cherry-pick them first
# Then delete all stale branches:
git push origin --delete fix-appjsx-final restore-appjsx test-small
git branch -r | grep 'origin/claude/' | sed 's|.*origin/||' | xargs git push origin --delete
```
**Estimated fix time: 15 minutes (including review).**

### P2-B: Cache Stamp 47 Days Stale

`PEAKLY_BUILD = "20260914a"` and `CACHE_NAME = "peakly-20260914a"`. The auto-push hook bumps these automatically on every edit — this self-corrects on the next ship. No standalone action needed, but: **first ship MUST bump all three files in lockstep** (app.jsx, sw.js, index.html). The hook handles it.

### P2-C: Stale Cron Prompt

This scheduled agent's stored prompt still references outdated numbers from early in the project's life. Jack: 2-minute fix in the Claude.ai scheduled tasks interface. Not a prod risk.

---

## 4. Performance Analysis

| Metric | Value |
|--------|-------|
| `dist/app.min.js` (production) | ~439 KB minified (per CLAUDE.md — not rebuilt since Oct 12) |
| Babel CDN (dev only) | ~1 MB — stripped in production build |
| React 18 UMD gzipped | ~45 KB |
| Plus Jakarta Sans | ~20 KB per weight |
| **Total production parse budget** | ~510 KB cold |

**Biggest bottleneck:** Weather fetch batching (50 venues / 2s) = ~16s to populate all 404 venues. Already mitigated by showing estimates immediately. This is the right design; no change needed.

No new performance regressions.

---

## 5. Cost Estimate

| MAU | Open-Meteo | VPS | Pages | Total/mo |
|-----|-----------|-----|-------|----------|
| 1K | Free | $6 | Free | **$6** |
| 10K | $0 (proxy cache) | $6 | Free | **$6** |
| 100K | $0 with disk cache (P0-A) | $12 (2GB upgrade) | Free | **$12** |
| 1M | ~$50–200 commercial tier | $24 (4GB) | Free | **$74–224** |

VPS disk cache (in the P0-A redeploy) is the entire cost strategy for 100K MAU. Without it, a cold restart after a Reddit spike fans out 404 raw Open-Meteo calls simultaneously and hits rate limits before the cache warms up.

---

## 6. What Breaks First at Scale

The VPS is the single point of failure, and it's running on 99-day-old code. When the Reddit post lands (Whistler opens Nov 21 — 21 days), two things hit simultaneously: (a) traffic spike fans out weather requests, and (b) iOS users find alert deletion doesn't work and CORS blocks native API calls. The VPS redeploy is 10 minutes of SSH; the cost of deferring it is a degraded launch. Disk cache persistence (already written, just not deployed) is the difference between "Reddit spike = 1 upstream Open-Meteo call" and "Reddit spike = 404 simultaneous calls that blow the free-tier ceiling."

---

## Delta vs. Yesterday

| Item | Yesterday (Oct 30) | Today (Oct 31) |
|------|-----------|-------|
| VPS status | Day 82, deadline MISSED | Day 83 (+1) |
| app.jsx changes | none since Oct 12 | none (Day 19) |
| Venue count | 404 | 404 ✅ |
| New origin branches | 18 | 18 (no change) |
| `.venue-baseline` | MISSING | ❌ STILL MISSING |
| PRECACHE mismatch | Day 23 | Day 24 |
| master footgun | Day 23 | Day 24 |
| lateSeason count | 5 (grep-grepped wrong) | **15** (confirmed correct) ✅ |

**Action item for Jack today:** Fix `.venue-baseline` (2 min), then SSH the VPS (10 min). Everything else is noise.
