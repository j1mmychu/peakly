# DevOps Report — 2026-10-21 (RED → LAUNCH DAY +3)

**Status: 🔴 RED — VPS Day 73. Val Thorens opening-weekend hook expires TOMORROW (Oct 22). The r/travel post still hasn't gone up. This is the last possible day it's useful.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox always time out — not a VPS outage signal.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** — code freeze Day 37, unchanged since 2026-09-14 ✅ |
| VENUES (eval-counted today) | **404** (134 skiing / 270 beach) — matches CLAUDE.md ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — code freeze Day 37, expected ✅ |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ `index.html:88` |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, no raw IP |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is a public affiliate marker only |
| Supabase anon key | ✅ Intentional, public-safe, RLS-gated |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 img sites across card components |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController |
| Sentry DSN | ✅ configured — `app.jsx:8`, `index.html:77` |
| `lateSeason:true` venues | ✅ 15 — matches CLAUDE.md |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| BASE_PRICES coverage | ✅ full coverage (186 airports) |
| proxy.js (committed) | ✅ `forecast_days=14`, disk cache, iOS CORS, `DELETE` Allow-Methods, `http2` APNs, `ieee-p1363` JWT. **NOT on VPS.** |

---

## 2. CRITICAL ISSUES (P0)

### P0-A: VPS Redeploy — Day 73 🚨 TONIGHT OR NEVER

**Val Thorens opening-weekend hook expires Oct 22. That's tomorrow. A post on Oct 23 is just another alps post, not "opening weekend."**

Broken on the live VPS right now (still running the Aug 11 build):

| # | Broken feature | User impact |
|---|---------------|-------------|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. Front page shows one window. High-altitude venues score `confidence:"low"` — filtered off front page. Val Thorens may be invisible on launch day. |
| 2 | `capacitor://localhost` absent from CORS | Every iOS native API call blocked. App Store = broken experience on every iPhone. |
| 3 | `DELETE` absent from `Access-Control-Allow-Methods` | Alert deletion silently fails on every device. `.catch(()=>{})` hides it. Day-1 retention hit. |
| 4 | `_wxCache` in-memory only | r/travel spike + cold restart = Open-Meteo rate-limited = "conditions unavailable" for every new user during the 10-minute window that makes or breaks the thread. |

**The fix is committed and on disk. 3 commands, under 5 minutes:**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Post-deploy, `/health` should show: `"forecast_days": 14`, `"disk_cache": true`, `"apns": "configured"` (if .p8 is on the VPS).

**If VPS ships today: post tonight or tomorrow morning (Oct 21 PM / Oct 22 AM ET = r/travel peak).**
**If VPS slips past Oct 21: defer the post to Whistler early-season (~Nov 10) and stop chasing Val Thorens.**

---

### P0-B: `origin/master` Footgun — Day 14 🚨

`origin/master` is 50+ commits behind `origin/main`. `deploy.yml` deploys **both** branches. An accidental `git push origin master` during post-launch activity rolls the live site back to May while the r/travel thread is active.

**30-second fix — do this in the same terminal session as the VPS deploy:**

```bash
git push origin --delete master
```

---

## 3. High Issues (P1)

### P1-A: Gili Trawangan Duplicate — App Store Risk

Two venues representing the same place in the VENUES array:

- `app.jsx:614` — `id:"beach_gilit"`, `ap:"LOP"`, "Lombok, Indonesia"
- `app.jsx:5061` — `id:"gili-trawangan"`, `ap:"DPS"`, "West Lombok, Indonesia"

Different IDs (so the boot-time dup validator doesn't catch it) and different airports (LOP vs DPS). Users searching "Gili" see the same destination twice with different prices. Confusing.

**Fix — delete the lower-quality entry (the DPS one has worse coordinates and 3× fewer reviews):**

In `app.jsx` around line 5061, delete the entire `{id:"gili-trawangan", ...}` object and its trailing comma. The `beach_gilit` entry (LOP, higher-rated, 14,600 reviews) is the keeper.

**Time: 2 minutes. Defer to post-freeze (Oct 23+) sprint per code freeze policy.**

### P1-B: Tag Quality — 225/404 Venues at ≤2 Tags (55.7%)

`scoreVibeMatch` and keyword search are degraded for more than half the catalog. Post-launch Week 2 task. No emergency, but the magnitude is worse than previously understood (Content corrected their count: 225 thin-tag, not 91).

---

## 4. Medium Issues (P2)

### P2-A: SW PRECACHE Version Mismatch — Day 17

`sw.js` line 4 precaches **Babel 7.29.7 from unpkg**:
```js
"https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
```

`index.html` line 88 loads **Babel 7.24.7 from cdnjs**:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"></script>
```

Two problems: (1) different versions, (2) different CDNs. The service worker caches a URL the browser never actually fetches. The precache wastes bandwidth pre-fetching a 1.1 MB file the user never uses. The intent was offline caching; neither the local dev path nor the production path benefits.

**Fix — either empty the PRECACHE or align it. Easiest: just empty it:**

```js
// sw.js line 3
const PRECACHE = [];
```

Production doesn't use Babel at all (`dist/app.min.js` strips it). Dev doesn't benefit from SW caching. This is dead weight.

**Time: 30 seconds. Defer to post-freeze sprint.**

### P2-B: Stale Cron Prompt — Day 14

PM, DevOps, and Content cron prompts still reference "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." Every AI analysis is miscalibrated by these stale premises.

Jack: edit the stored cron prompt in Claude Code settings. 2 minutes. Replace "182 venues, 12 categories" with "404 venues, 2 categories (skiing + beach)." Remove Pro and Sentry references.

### P2-C: Stale Remote Branches — 18 abandoned `claude/` branches

New branches appeared since yesterday's report. Full list currently:

```
claude/analyze-test-coverage-WVIsT
claude/code-review-cleanup-HjoCS
claude/condense-alert-page-jzdLo
claude/enhance-loading-screen-rZ1dc
claude/fix-app-jsx-content
claude/implement-todo-lNL7W
claude/improve-peakly-ui-UHCHG
claude/improve-scoring-system-XYGY6
claude/product-reliability-assessment-w0poL
claude/redesign-front-page-EndKs
claude/review-peakly-ux-UQ0Qu
claude/simplify-alerts-page-2ejGB
claude/simplify-profile-page-Bi2Tc
claude/standardize-venue-data-CufiQ
claude/streamline-onboarding-account-97XRR
fix-appjsx-final
restore-appjsx
test-small
```

Code freeze is Day 37. None of these are in active PRs. Batch delete:

```bash
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

---

## 5. Security Audit — CLEAN ✅

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | ✅ Not present. `TP_MARKER="710303"` is public affiliate marker |
| Supabase anon key | ✅ Public-safe by Supabase design; all access RLS-gated |
| `.env` / secret files tracked | ✅ `.gitignore` covers `.env*`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| Sentry DSN | ✅ Real DSN wired in `app.jsx:8` and `index.html:77` |
| Recent commits for secret leaks | ✅ Last 5 commits are daily report files only |
| APNS .p8 key | ✅ `.gitignore` covers `*.p8`; key never in repo |

---

## 6. Performance Analysis

| Metric | Value |
|--------|-------|
| app.jsx unminified | 758,944 bytes (741 KB) |
| dist/app.min.js (esbuild) | ~439 KB — Babel stripped, served to users |
| Babel Standalone (cdnjs) | 1.1 MB — loaded only in local dev, not production |
| React 18.3.1 UMD (cdnjs) | ~130 KB min+gzip |
| Supabase JS | ~80 KB gzipped (lazy-loaded on auth only) |
| Sentry SDK | ~50 KB (deferred) |
| Image lazy loading | ✅ all 9 img sites use `loading="lazy"` |

**Biggest bottleneck in production:** 404-venue batched weather fetch (50/2s) = 8 requests per user session to Open-Meteo. Absorbed by VPS proxy cache once deployed. Without VPS: 500 concurrent users = 4,000 upstream calls in 2s.

---

## 7. Cost Estimate

| Scale | Infrastructure | Monthly Cost |
|-------|---------------|--------------|
| Current (<100 MAU) | 1 GB DO droplet ($6) + GitHub Pages (free) | **$6/month** |
| 1K MAU | Same droplet + VPS proxy cache absorbs Open-Meteo | **$6/month** |
| 10K MAU | 2 GB DO ($12) + Cloudflare CDN free | **~$12/month** |
| 100K MAU | 4 GB DO ($24) + Cloudflare Pro ($20) + may need Open-Meteo commercial | **~$44/month** |

---

## 8. What Breaks First at Scale

Without the VPS redeploy: **Open-Meteo, in the first 60 seconds of a Reddit spike.** 500 simultaneous users × 8 requests each = 4,000 upstream API calls per 2-second batch. Open-Meteo's free tier soft-limits at ~10,000 req/day total. A single Reddit thread exhausts the daily budget before the first commenter has refreshed the page. Every subsequent user for the rest of the day sees "conditions unavailable." This is the catastrophic first-impression scenario. The VPS proxy's shared in-memory + disk cache collapses that to near-zero upstream calls for warm venues (cache hit rate ~90% after the first user loads a popular region). Deploy it.

---

## Summary: One Thing That Must Happen Today

**`scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"` — 5 minutes.**

Then delete `origin/master`. Then post r/travel tonight or tomorrow morning.

Oct 22 is the last day the Val Thorens hook lands. Oct 23 you're posting in a generic ski thread. The code is done. The VPS is the only thing between you and a live launch with a real seasonal hook.
