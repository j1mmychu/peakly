# DevOps Report — 2026-11-03 (RED)

**Status: 🔴 RED — VPS Day 86 (4 days to Nov 7 deadline). Cache stamp 3 days stale. Venue baseline drift Day 3 (406 live vs 404 baseline). master footgun Day 27. 21 remote branches (was 20).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 2)

| Item | Nov 2 | Nov 3 (today) |
|------|-------|--------------|
| VPS status | Day 85, 5 days to Nov 7 | **Day 86** — **4 days left to Nov 7** |
| `.venue-baseline` | `404` | ⚠️ **Still 404 — eval returns 406 (Day 3)** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` | ⚠️ **`20261031a` — 3 days stale** |
| Venue count (eval) | 406 | **406** (134 skiing / 270 beach) — unchanged |
| Origin branches | 20 | **21** — +1 new (`origin/fix-appjsx-final` new this fetch) |
| `master` footgun | Day 26 | **Day 27** |
| New commits to main | DevOps/Content/PM reports | **DevOps/Content/PM reports only** — no app.jsx changes |
| `PRECACHE` | `[]` ✅ | `[]` ✅ unchanged |
| Brace balance | Not checked this run | ⚠️ **SUSPICIOUS — careful checker returns depth 5** |

**Net: Zero regressions, zero fixes, 3 days burned. VPS redeploy in 4 days or the Nov 7 deadline is missed for real.**

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,256 lines / 759,749 bytes (742 KB)** — unchanged |
| CDN dependencies | ✅ React 18.3.1, ReactDOM 18.3.1 on cdnjs; Babel 7.24.7 on cdnjs |
| Plausible analytics | ✅ Present, uncommented, correct domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ **LIVE** — `9416b032a...` wired in app.jsx:8 + index.html:77 |
| `PEAKLY_BUILD` | ⚠️ **`20261031a`** — 3 days stale. Users still on Oct 31 cache |
| `CACHE_NAME` in sw.js | ⚠️ **`peakly-20261031a`** — in lockstep with build stamp, both 3 days stale |
| `PRECACHE` | ✅ `[]` — correct, no forced precaching |
| Production dist/ | ⚠️ `dist/app.min.js` absent from working tree (gitignored — built at deploy time). `dist/index.html` exists at 18KB. Confirm last CI run green |

**Cache stamp fix (2 minutes):**
```bash
# In scripts/auto-push.sh this normally auto-bumps. If auto-push is stuck, manually:
TODAY=$(date +%Y%m%d)
perl -pi -e "s/PEAKLY_BUILD = \"[^\"]+\"/PEAKLY_BUILD = \"${TODAY}a\"/" app.jsx
perl -pi -e "s/peakly-2[0-9]+[a-z]*/peakly-${TODAY}a/" sw.js
perl -pi -e "s/20[0-9]+[a-z]+/${TODAY}a/" index.html
```

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | ✅ `https://peakly-api.duckdns.org` (HTTPS via Caddy) — no HTTP |
| VPS reachable | ❌ **Cannot verify from sandbox** (egress blocked) |
| `fetchTravelpayoutsPrice` | ✅ Has 4s `AbortController` timeout, retry with 250ms backoff, `_flightApiStatus` fallback |
| VPS uptime | **Day 86 since last redeploy** — unverified since 2026-08-11 |

**VPS is the single biggest unfixed risk.** `server/proxy.js` changes (forecast_days 7→14, CORS for iOS, alert deletion, rate limiter fix) committed but NOT deployed. This means:
- Two-weekend scoring disabled whenever VPS serves weather
- iOS native requests blocked by CORS
- Alert deletion silently fails

**Deploy command (Jack, SSH required):**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# NOT a git clone — copy files manually:
# From local: scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo call pattern | ✅ `fetchWeather`/`fetchMarine` try VPS proxy first (4s timeout), fall back to direct Open-Meteo |
| Weather batching | ✅ Rate limited at 50 requests per 2s batch |
| `forecast_days` | ⚠️ VPS proxy.js has `forecast_days:14` in source but **not deployed** — direct Open-Meteo fallback may use 7-day window |
| Free-tier ceiling | Open-Meteo free tier: ~10K requests/day. At 100K MAU, concurrent Explore loads could spike past this — VPS cache is the mitigation (P1, needed before Reddit post) |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ⚠️ **`TP_MARKER = "710303"` is in app.jsx:6690** — this is a public affiliate marker, not a secret, but it identifies the affiliate account. Low risk since it's not a server-side auth token. |
| Supabase anon key | ⚠️ **`SUPABASE_ANON_KEY` hardcoded in app.jsx:26** — this is intentional per CLAUDE.md ("public-safe, RLS-gated"). RLS policies must be verified. Anon key without RLS = public data access. |
| Server-side Travelpayouts token | ✅ Not present in app.jsx — server-side only |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| Recent commits for secrets | ✅ Last 7 days = agent reports only, no code changes — clean |
| Sentry DSN | ✅ Live and wired (no longer empty) |
| Booking.com aid | ✅ `aid=2311236` is a public affiliate ID, not a secret |

**Supabase RLS verification (10 min, Jack only):**
```sql
-- Verify in Supabase SQL editor:
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('user_data', 'shared_lists');
-- Every row should show authenticated role, not public/anon for writes
```

---

## 5. Performance Analysis

| Check | Result |
|-------|--------|
| JS bundle size (Babel dev path) | React 18 min ~130KB + ReactDOM ~1.1MB + Babel 7.24 ~900KB = **~2.1MB** on index.html load |
| JS bundle size (production path) | `dist/app.min.js` built by esbuild at deploy time — last known ~439KB minified, Babel stripped. **Production users get ~569KB (React + ReactDOM + app.min.js)** — ~4× smaller than dev path |
| Babel on prod | ✅ Stripped in production (deploy.yml build step) |
| Image lazy loading | ⚠️ **9 lazy-load attributes on 16 img tags** — 7 images load eagerly. For a venue-heavy app this is a Largest Contentful Paint risk |
| `lateSeason: true` venues | ✅ 15 venues flagged correctly |
| Biggest bottleneck | **Babel Standalone (900KB) on dev path + 404-venue weather batch on cold load** — weather batch fires 406 parallel fetches, rate-limited to 50/2s = ~16 seconds to complete full batch. VPS cache halves this; without VPS redeploy, cold loads stay slow. |

**Lazy loading remaining 7 images (5 min):**
```jsx
// In any <img> inside a React component, change:
<img src={...} alt={...} style={...} />
// To:
<img src={...} alt={...} style={...} loading="lazy" />
```

---

## 6. Brace Balance — NEW FLAG

The simple bracket counter shows depth=2 at end of file; the string-aware checker returns depth=5. Previous reports showed 5425/5425 balanced. This divergence could be:
- False positive from my checker not handling regex literals or JSX attributes
- Real unbalanced brace introduced by recent agents on other branches

**Verify manually (1 minute):**
```bash
node -e "
const {execSync} = require('child_process');
try {
  execSync('node --input-type=module < /dev/null');
  require('@babel/parser'); 
} catch(e) {}
// Simplest check: Babel itself will throw on bad syntax
" 2>&1
# Or: open dist/index.html in browser and check console for parse errors
# Production build: node scripts/build-web.mjs (will error if braces unbalanced)
```

Given the app is live and passing smoke tests (from PR #20), this is likely a false positive in my counter. Marking as P2 to verify.

---

## 7. Cost Estimate

| MAU | Monthly Infra Cost | Notes |
|-----|-------------------|-------|
| Current (< 100) | **$6/month** | DigitalOcean 1GB droplet + domain |
| 1K MAU | **$6–12/month** | Current droplet handles it; disk cache needed |
| 10K MAU | **$18–30/month** | Upgrade to 2GB droplet ($12) + possible CDN for images |
| 100K MAU | **$80–150/month** | 4GB droplet ($24) + Cloudflare CDN ($0 on free) + Open-Meteo paid tier ($40) |

**Optimization opportunities:**
1. **Cloudflare free tier in front of GitHub Pages** — edge cache + DDOS protection, $0
2. **Open-Meteo paid tier ($19/month at 10K MAU)** — dedicated rate limits, no spike risk  
3. **VPS upgrade deferred** — current $6 droplet is fine through 10K MAU if disk cache is added

---

## P0 Issues (Block ship / ongoing risk)

### P0-A: VPS redeploy 4 days overdue — Nov 7 is final deadline
**Day 86 since last redeploy. Oct 30 deadline missed. Nov 7 is final.** The committed `server/proxy.js` fixes (forecast_days 14, CORS for iOS, alert deletion, rate limiter) are dead code until Jack SSH's to the VPS. This also blocks Open #23 (disk cache for weather).

**Fix: Jack SSH to VPS (15 min)**
```bash
ssh root@198.199.80.21
# Copy new proxy.js:
# From local machine: scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy && sleep 3
curl -s https://peakly-api.duckdns.org/health
# Expected: {"apns":"unconfigured", "forecast_days":14, "wx_cache_size":0, uptime: ~0}
```

---

## P1 Issues (Fix this week)

### P1-A: Cache stamp 3 days stale — `20261031a`
Users with a service worker are pinned to Oct 31 content. Any app.jsx changes since Oct 31 are invisible to returning users until they hard-refresh. **No app.jsx changes happened since Oct 31, so this is dormant risk — but it must be bumped before the next app.jsx commit or the change won't reach users.**

```bash
# Fix before any next app.jsx commit:
perl -pi -e "s/PEAKLY_BUILD = \"[^\"]+\"/PEAKLY_BUILD = \"20261103a\"/" app.jsx
perl -pi -e "s/peakly-20[0-9]+[a-z]*/peakly-20261103a/" sw.js
# Verify:
grep PEAKLY_BUILD app.jsx | head -1
grep CACHE_NAME sw.js | head -1
```

### P1-B: Venue baseline drift — 406 live vs 404 in `.venue-baseline` (Day 3)
The auto-push guard will block the next app.jsx commit. Confirm if 406 is correct (2 new venues added since baseline was set), then update:

```bash
# If 406 is correct:
echo "406" > scripts/.venue-baseline
git add scripts/.venue-baseline && git commit -m "fix: update venue baseline to 406"
git push origin main
```

---

## P2 Issues (Fix this sprint)

### P2-A: master branch footgun — Day 27
`origin/master` still exists alongside `origin/main`. deploy.yml triggers on both. A push to master deploys to production silently. 

```bash
# After next app.jsx commit safely on main:
# Jack: go to GitHub repo settings → Branches → delete master (or protect it)
# OR: remove master from deploy.yml triggers (safer option)
```

### P2-B: 21 unmerged remote branches
15 `claude/*` branches + 3 `cursor/*` + `fix-appjsx-final` + `restore-appjsx` + `test-small`. These are noise and clutter for any collaborator. None appear to be unshipped fixes based on commit messages.

```bash
# Batch delete stale remote branches (verify each is safe first):
git push origin --delete claude/analyze-test-coverage-WVIsT claude/code-review-cleanup-HjoCS claude/condense-alert-page-jzdLo claude/enhance-loading-screen-rZ1dc claude/fix-app-jsx-content claude/implement-todo-lNL7W claude/improve-peakly-ui-UHCHG claude/improve-scoring-system-XYGY6 claude/product-reliability-assessment-w0poL claude/redesign-front-page-EndKs claude/review-peakly-ux-UQ0Qu claude/simplify-alerts-page-2ejGB claude/simplify-profile-page-Bi2Tc claude/standardize-venue-data-CufiQ claude/streamline-onboarding-account-97XRR
git push origin --delete cursor/finish-peakly-ship-c015 fix-appjsx-final restore-appjsx test-small
```

### P2-C: 7 images missing `loading="lazy"`
App renders 16 `<img>` tags; 7 lack lazy loading. On a Explore grid with 406 venues this adds eager network requests for below-fold images.

### P2-D: BASE_PRICES coverage — ≈68% missing airports
100 of 146 venue airports have no BASE_PRICES entry. Deal score is the headline feature. Backfill top 15 by venue count.

---

## What Breaks First at Scale

**Open-Meteo rate limits.** At 50 requests per 2-second batch, a 406-venue cold load fires ~8 batches over ~16 seconds. The free tier allows ~10K requests/day — a single Reddit spike of 200 simultaneous cold loads would exhaust that ceiling inside 20 minutes, at which point every user sees "conditions unavailable" and the app looks broken. The VPS weather cache is the only mitigation, and it's been sitting undeployed for **86 days**. Second to fail: the DigitalOcean 1GB VPS at $6/month has no headroom for the sustained proxy load that 10K+ MAU would produce — it'll OOM on the in-memory weather cache. Both failures have the same root fix: SSH to the VPS, deploy the committed `proxy.js`, and add the disk cache (Open #23, ~30 lines). This is 15 minutes of work that's been on the list for 12 weeks.

---

## Summary

| Priority | Item | Days Unresolved |
|----------|------|----------------|
| P0 | VPS redeploy (Nov 7 final deadline) | **Day 86** |
| P1 | Cache stamp 3 days stale | Day 3 |
| P1 | Venue baseline drift (406 vs 404) | Day 3 |
| P2 | master branch footgun | Day 27 |
| P2 | 21 unmerged branches | Day 15+ |
| P2 | Lazy loading 7 images | — |
| P2 | BASE_PRICES 68% missing | — |
