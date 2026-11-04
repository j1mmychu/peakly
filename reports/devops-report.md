# DevOps Report — 2026-11-04 (RED)

**Status: 🔴 RED — VPS Day 87 (3 days to Nov 7 deadline). Cache stamp 4 days stale. Venue baseline drift Day 4 (406 live vs 404 baseline). master footgun Day 28. 21 remote branches (unchanged). fix-appjsx-final still unmerged.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 3)

| Item | Nov 3 | Nov 4 (today) |
|------|-------|--------------|
| VPS status | Day 86, 4 days to Nov 7 | **Day 87 — 3 days left to Nov 7** |
| `.venue-baseline` | `404` | ⚠️ **Still `404` — eval returns 406 (Day 4 of drift)** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale | ⚠️ **`20261031a` — 4 days stale** |
| Venue count (eval) | 406 | **406** (134 skiing / 270 beach) — unchanged |
| Origin branches | 21 | **21** — no pruning, no new ones |
| `master` footgun | Day 27 | **Day 28** |
| New commits to main | Reports only | **Reports only** — no app.jsx changes |
| `fix-appjsx-final` branch | Escalated to P0 | **Still unmerged** — 3 days since P0 escalation |

**Net: 4th consecutive day of zero fixes. VPS redeploy in 3 days or the Nov 7 deadline is missed.**

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,256 lines / 759,749 bytes (742 KB)** — unchanged |
| CDN dependencies | ✅ React 18.3.1, ReactDOM 18.3.1 on cdnjs; Babel 7.24.7 on cdnjs |
| Plausible analytics | ✅ Present, uncommented, correct domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ **LIVE** — `9416b032a...` wired in both app.jsx and index.html |
| `PEAKLY_BUILD` | ⚠️ **`20261031a`** — 4 days stale. Users running Oct 31 bundle |
| `CACHE_NAME` in sw.js | ⚠️ **`peakly-20261031a`** — in lockstep with build stamp, both 4 days stale |
| `PRECACHE` | ✅ `[]` — correct |
| Production dist/ | ⚠️ `dist/app.min.js` absent from working tree (gitignored — built by CI). `dist/index.html` present. CI builds on push |

**Cache stamp is 4 days stale.** No app.jsx edits have landed in that time, so auto-push hasn't auto-bumped it. No user-visible bug — everyone's running the same Oct 31 build — but the moment app.jsx changes land (VPS redeploy or fix-appjsx-final), the stamp will be wrong and old cached bundles will linger.

**Manual cache-stamp fix (2 min):**
```bash
TODAY=$(date +%Y%m%d)
perl -pi -e "s/PEAKLY_BUILD = \"[^\"]+\"/PEAKLY_BUILD = \"${TODAY}a\"/" app.jsx
perl -pi -e "s/peakly-2[0-9]+[a-z]*/peakly-${TODAY}a/" sw.js
perl -pi -e "s/v=2[0-9]+[a-z]*/v=${TODAY}a/" index.html
```

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | ✅ HTTPS — `https://peakly-api.duckdns.org` (no HTTP leak) |
| Proxy constant location | `app.jsx:6355` — `const FLIGHT_PROXY = "https://peakly-api.duckdns.org"` |
| Timeout | ✅ `1500ms` per request with 2 attempts (tightened 2026-08-21) |
| Fallback | ✅ Falls back to `~$X` BASE_PRICES estimate on timeout/failure |
| Semaphore | ✅ Max 8 concurrent flight requests |
| VPS redeployment | ⚠️ **`server/proxy.js` committed but NOT deployed to `/opt/peakly-proxy`** |

**VPS deadline: 3 days (Nov 7).** The committed `proxy.js` has been live in the repo since August 11 but `/opt/peakly-proxy` is a hand-copied dir not a git clone. SSH redeploy required. Without it: `forecast_days=14` is off, iOS native hits CORS errors, alert deletion silently fails, and Open-Meteo disk cache (Open #23) stays unbuilt.

**VPS redeploy commands (from Jack's machine — 198.199.80.21):**
```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly peakly-deploy
cp peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | jq .
```

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo endpoints | ✅ Direct calls to `api.open-meteo.com` and `marine-api.open-meteo.com` |
| `forecast_days` (client) | ✅ 14 days weather, 10 days marine |
| `forecast_days` (VPS proxy) | ⚠️ **Unknown until VPS redeployed** — committed fix sets 14 days but current deployed version unknown |
| Rate limiting | ⚠️ **BATCH_SIZE = 100 with semaphore, but no inter-batch delay verified** |
| Cache TTL | ✅ 2h localStorage per-coord cache in client |

**Open-Meteo free tier ceiling: ~600 calls/min.** With 406 venues, a full cold-cache load = 406 weather + ~270 marine = ~676 API calls per user (all from the client, not the VPS). At 100 concurrent users hitting stale cache simultaneously this blows through the ceiling. The VPS shared cache is the fix — which requires the VPS redeploy.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Only `TP_MARKER = "710303"` (public affiliate marker — OK) |
| Travelpayouts server token | ✅ Server-side only via VPS proxy |
| Supabase anon key | ⚠️ **`SUPABASE_ANON_KEY` hardcoded in app.jsx:26** — this is intentional (public-safe, RLS-gated) per architecture decisions. Not a leak. |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision` |
| Recent commits for secrets | ✅ No secrets in last 15 commits — only report files |
| Sentry DSN | ✅ Public-facing DSN in index.html is intentional (browser error reporting) |
| APNS credentials | ✅ No `.p8` files in repo (gitignored) |

**No new secret exposure. Supabase anon key is by-design public (confirmed architecture note in CLAUDE.md).**

---

## 5. Performance Analysis

**JavaScript bundle loaded (dev mode via index.html):**
- React 18.3.1 minified: ~44 KB gzipped
- ReactDOM 18.3.1 minified: ~130 KB gzipped
- Babel Standalone 7.24.7: **~400 KB gzipped** ← the wall
- app.jsx (source, Babel transpiles in-browser): 742 KB raw (~180 KB gzipped estimate)
- Supabase JS (lazy-loaded): ~80 KB gzipped

**Production mode (dist/ via CI build):**
- Babel stripped entirely by `build-web.mjs` (esbuild pre-transpile)
- React/ReactDOM/Supabase still CDN
- `app.min.js`: ~439 KB minified (from CLAUDE.md note, 06-20 commit)
- **The 3–5s Babel parse wall is eliminated in production**

**Biggest bottleneck: 406 venues × 2 API calls = 812 Open-Meteo requests per cold load, all from the client.** Each user triggers this. With no VPS shared cache, every concurrent user fires independent requests against the free tier. This is the first thing that breaks.

**Images: ✅ All 9 `<img>` renders in app.jsx use `loading="lazy"`. No hero above-fold images checked for `fetchpriority="high"` — missing this means LCP is slower than it needs to be.**

**CDN version audit:**
- React/ReactDOM 18.3.1 — ✅ current stable
- Babel 7.24.7 — ✅ dev only (stripped in prod)
- Supabase lazy-loaded at `@2.106.2` in main (but `fix-appjsx-final` bumps to `@2.45.4` — an older version? That looks like a downgrade; `2.106.2 > 2.45.4`. Verify before merging.)

---

## 6. Cost Estimate

| MAU | DigitalOcean ($6/mo droplet) | GitHub Pages | Open-Meteo | Total/mo |
|-----|------------------------------|--------------|------------|----------|
| 1K | $6 | Free | Free | **$6** |
| 10K | $6–$12 (may need $12/mo droplet) | Free | Free (if VPS cache works) | **$6–$12** |
| 100K | $24–$48 (larger droplet + possible CDN) | Free | ⚠️ **May need $20/mo paid plan** | **$44–$68** |

**Cost risk at scale:** Open-Meteo free tier has no documented rate SLA for sustained high-volume clients. If 100K MAU each cold-load, the VPS shared cache is the only protection. Without it, they may rate-limit or bill. The VPS redeploy is a cost-control action, not just a feature.

---

## 7. `fix-appjsx-final` Branch — P0 (Jack action required)

The branch was escalated to P0 by PM v200 (yesterday). Key changes vs main:
- Removes `CLOUD_SHARE_ENABLED` constant (share feature stays off anyway)
- **Removes Leaflet map view** (lazy-loaded, so not a perf issue, but it's a feature cut)
- Bumps Supabase to `@2.45.4` — **this is a downgrade from main's `@2.106.2`** (semver: 2.106 > 2.45). Verify intended.
- Resets `PEAKLY_BUILD` to `20260513c` — 5 months stale. Would immediately misidentify the build version for all users.
- 146 files changed, 39K lines deleted — this is a major rewrite/cleanup, not a small fix.

**Before merging this branch: verify (1) Supabase version intent, (2) build stamp gets bumped to today's date, (3) all features still render correctly. A broken merge here pushes the Nov 7 deadline.**

---

## 8. Venue Baseline Drift (Day 4)

```
scripts/.venue-baseline: 404
app.jsx eval count:        406
Delta:                     +2 venues
```

4th consecutive day of drift. The auto-push guard compares eval count against `.venue-baseline` and will fail if they diverge by more than the configured tolerance. This guard has historically broken silently — if auto-push starts going quiet, the guard is the first place to check.

**Fix (30 seconds):**
```bash
echo "406" > scripts/.venue-baseline
```

Do this AFTER confirming the eval count is correct (406 is real — 134 ski + 270 beach + 2 new additions since the last baseline write).

---

## 9. master Branch Footgun (Day 28)

`origin/master` and `origin/main` both exist. `deploy.yml` fires on pushes to both. Any push to `master` triggers a parallel deploy. This has been flagged for 28 consecutive days.

**Risk:** a Claude agent or confused manual push to `master` deploys whatever is on that branch, potentially overwriting a good `main` deploy with stale content.

**Fix (1 minute — Jack must do this, requires repo admin):**
```bash
# On GitHub UI: Settings → Branches → change default branch to main → delete master
# OR via API:
gh api repos/j1mmychu/peakly --method PATCH -f default_branch=main
# After confirming main is default, delete master:
git push origin --delete master
```

---

## 10. Remote Branch Sprawl (21 branches, Day 28)

21 remote branches. 15 are `claude/*` exploratory agent branches from automated sessions. None appear to have been merged.

**Risk:** these branches are targets. Any session that checks out one of these branches and pushes will deploy on merge. They also confuse `git log --all` and cost background fetch time.

**Prune all stale `claude/*` and unmerged experiment branches (5 minutes):**
```bash
# Delete all remote claude/* branches (these were exploratory, not meant to persist)
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}
# Review remaining non-main/master branches before deleting:
# origin/cursor/finish-peakly-ship-c015
# origin/fix-appjsx-final    ← DO NOT DELETE — P0 work
# origin/restore-appjsx      ← review, probably safe to delete
# origin/test-small          ← safe to delete
```

---

## What Breaks First at Scale

**The single failure point at scale is the Open-Meteo rate ceiling.** Every user who cold-loads the app fires 406+ direct API requests in a 50-concurrent semaphore pattern. The VPS shared cache (which deduplicated these to 1 upstream call per venue per 2 hours) is committed to `server/proxy.js` but not deployed. At ~66 simultaneous DAU all hitting uncached venues simultaneously, Open-Meteo's free tier begins dropping requests and the entire app degrades to "conditions unavailable" for every venue at once — not gracefully, but as a full-page degradation. The fix is 15 minutes of SSH work: copy `proxy.js` to the VPS, `pm2 restart`, verify `/health`. Every day this doesn't land is another day closer to a Reddit post triggering a site-wide conditions outage.

---

## Priority Summary

| Priority | Item | Days Flagged | Time to Fix | Owner |
|----------|------|-------------|-------------|-------|
| **P0** | VPS redeploy (proxy.js, disk cache) | 87 | 20 min SSH | Jack |
| **P0** | `fix-appjsx-final` merge decision | 3 | 30 min review + merge | Jack |
| **P1** | Cache stamp (`20261031a` → today) | 4 | 2 min | Auto on next edit |
| **P1** | `.venue-baseline` drift (404→406) | 4 | 30 sec | Agent |
| **P1** | Delete `origin/master` branch | 28 | 1 min | Jack (admin) |
| **P2** | Prune 15 stale `claude/*` branches | 28 | 5 min | Jack |
| **P2** | Hero image `fetchpriority="high"` | — | 15 min | Agent |
| **P2** | Verify Supabase version in fix-appjsx-final (`@2.45.4` vs `@2.106.2`) | — | 5 min | Jack |
