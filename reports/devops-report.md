# DevOps Report — 2026-11-08 (RED)

**Status: 🔴 RED — VPS Day 92 (deadline expired yesterday). Cache stamp 8d stale. `fix-appjsx-final` rollback bomb Day 9. `master` footgun Day 32. 19 branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 7)

| Item | Nov 7 | Nov 8 (today) |
|------|-------|--------------|
| VPS status | Day 91 — deadline PASSED | **🚨 Day 92 — no movement** |
| `.venue-baseline` | `404` | ✅ **`404`** — no drift |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (7d) | ⚠️ **`20261031a` — 8 days stale** |
| `fix-appjsx-final` | Rollback bomb Day 8 | **Rollback bomb Day 9 — DO NOT MERGE** |
| Origin branches | 19 | **19** — unchanged |
| `master` footgun | Day 31 | **Day 32** |
| New app.jsx commits | Reports only | **Reports only** — 22 days no code |
| Venue count | 404 (134 ski / 270 beach) | ✅ **404 — no drift** |
| Braces balanced | ✅ | ✅ **5684/5684** |
| lateSeason venues | 15 (Content confirmed) | ✅ **15** — count verified via `grep -c` |
| **BASE_PRICES coverage** | ⚠️ Open #22 (68% claimed) | ✅ **NEW FINDING: 100% — Open #22 CLOSED** |
| Sentry DSN | live | ✅ live |
| Plausible | present | ✅ present, uncommented |

---

## P0 — Fix Today

### P0-1: VPS Day 92 — Nov 7 deadline expired. KNOWN-BROKEN per PM v204.

Three missed deadlines. The committed `server/proxy.js` has been repo-ready since **2026-08-11**. What is broken RIGHT NOW:

- **Two-weekend scoring dead.** `forecast_days=14` is committed but the live VPS still returns 7-day windows. The second weekend is silently empty — Whistler opens **Nov 21 (13 days)**. First ski weekend of the year hits a broken product.
- **Alert deletion silently fails.** `DELETE` CORS header not in live VPS. User clicks delete → `.catch(()=>{})` swallows it → alert stays server-side, keeps firing push notifications.
- **iOS native CORS-blocked.** `capacitor://localhost` not in live VPS CORS whitelist. Every iOS weather/flight fetch is rejected at the preflight.
- **Disk cache absent.** `pm2 restart` wipes `_wxCache`. First traffic spike post-launch blows Open-Meteo's free tier ceiling.

**Fix — 10 minutes, requires Jack SSH:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Verify: forecast_days:14 in response, uptime resets to seconds, apns status shown
```

No npm install needed — `server/proxy.js` deps haven't changed since last deploy.

---

### P0-2: `fix-appjsx-final` rollback bomb — Day 9. Still not deleted.

This branch forks from the **initial commit** (`d62dadf`). Current stats:

- Branch is **597 commits behind** `origin/main`
- `app.jsx` on this branch: **9,095 lines** vs main's **14,256 lines**
- Delta: **5,161 lines of shipped code GONE** if merged — 6 months of venues (all 404), scoring overhaul, Supabase sync, App Review fixes, everything

It is a live landmine sitting one mis-click away from nuking the product. `restore-appjsx` has the same risk profile.

**Fix — 30 seconds:**
```
GitHub → Branches → fix-appjsx-final → Delete branch
GitHub → Branches → restore-appjsx → Delete branch
```

Or via gh CLI (from a networked machine):
```bash
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/fix-appjsx-final
gh api -X DELETE repos/j1mmychu/peakly/git/refs/heads/restore-appjsx
```

---

## P1 — Fix This Week

### P1-1: Cache stamp 8 days stale.

`PEAKLY_BUILD = "20261031a"` and `CACHE_NAME = "peakly-20261031a"` in both `app.jsx` and `sw.js`. Last code commit was Oct 31 (PR #20). No code has shipped since, so the stamp reflects reality — but the moment any code change lands without bumping the stamp, users get stale cached JS silently. The `auto-push.sh` hook handles this for local edits; cloud agent sessions don't use it.

**Not broken today, but one code commit away from being a problem.** Next code change must bump the stamp. The `auto-push.sh` will handle it automatically when triggered locally.

### P1-2: `master` branch footgun — Day 32.

`deploy.yml` deploys on push to **both** `main` AND `master`. An accidental `git push origin master` from any session deploys to production. This has been flagged for 32 consecutive reports.

```yaml
# Current deploy.yml triggers:
on:
  push:
    branches:
      - main
      - master   # ← footgun

# Fix: remove master trigger (keep it in case of old sessions, or remove entirely)
```

**Fix:**
```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

After applying: `git add .github/workflows/deploy.yml && git commit -m "Remove master deploy trigger" && git push origin main`

---

## P2 — Fix This Sprint

### P2-1: 19 remote branches — 15 are abandoned `claude/` agent branches.

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
cursor/finish-peakly-ship-c015
test-small
```

None of these are open PRs. They are dead-weight clutter. Any of them could be accidentally merged or become a navigation confusion for Jack.

**Fix — bulk delete from a networked machine:**
```bash
for branch in claude/analyze-test-coverage-WVIsT claude/code-review-cleanup-HjoCS \
  claude/condense-alert-page-jzdLo claude/enhance-loading-screen-rZ1dc \
  claude/fix-app-jsx-content claude/implement-todo-lNL7W claude/improve-peakly-ui-UHCHG \
  claude/improve-scoring-system-XYGY6 claude/product-reliability-assessment-w0poL \
  claude/redesign-front-page-EndKs claude/review-peakly-ux-UQ0Qu \
  claude/simplify-alerts-page-2ejGB claude/simplify-profile-page-Bi2Tc \
  claude/standardize-venue-data-CufiQ claude/streamline-onboarding-account-97XRR \
  cursor/finish-peakly-ship-c015 test-small; do
  git push origin --delete "$branch"
done
```

### P2-2: Scheduled agent cron prompt is stale (Day 32+).

PM has flagged this every report: the stored prompt says "182 venues, 12 categories, Peakly Pro $9/mo, Sentry DSN empty." All four facts are wrong. Reality: 404 venues, 2 categories, Pro cut, Sentry live. Fix: update the cron prompt in the Claude.ai interface. 2-minute task.

---

## Closed: Open #22 (BASE_PRICES coverage)

Previous CLAUDE.md listed Open #22 as "68% coverage — 100 of 146 venue airports missing." That number was stale. Today's audit:

```
node -e "
const src = require('fs').readFileSync('app.jsx','utf8');
const bpMatch = src.match(/const BASE_PRICES\s*=\s*\{([\s\S]*?)\n\};/);
const bpKeys = new Set((bpMatch?.[1]||'').match(/[A-Z]{3}/g)||[]);
const venueAPs = new Set([...src.matchAll(/ap:\"([A-Z]{3,4})\"/g)].map(m=>m[1]));
const missing = [...venueAPs].filter(ap=>!bpKeys.has(ap));
console.log('venue APs: '+venueAPs.size+', missing: '+missing.length);
"
# Output: venue APs: 152, missing: 0
```

**All 152 venue airports are covered in `BASE_PRICES`.** The "43% / 68% coverage" figures cited in prior reports were based on a stale data snapshot from before the backfill work. **Open #22 is CLOSED. Remove it from CLAUDE.md's open issues.**

---

## Infra Audit Results

| Check | Result |
|-------|--------|
| `app.jsx` size | 14,256 lines / 759 KB |
| Venue count | ✅ 404 (134 ski / 270 beach) — matches `.venue-baseline` |
| Brace balance | ✅ 5684/5684 |
| lateSeason venues | ✅ 15 (whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` — no HTTP exposure in client |
| Travelpayouts token | ✅ Server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) |
| Supabase anon key | ✅ Client-side by design — RLS-gated, public-safe per Supabase docs |
| `.gitignore` | ✅ `.env`, `*.pem`, `*.p8`, `*.key` all covered |
| Plausible analytics | ✅ Present, uncommented, correct domain |
| Sentry DSN | ✅ Live (`9416b032a46681d74645b056fcb08eb7`) |
| Image lazy loading | ✅ All 9 `<img>` tags have `loading="lazy"` |
| CDN versions pinned | ✅ React 18.3.1, Babel 7.24.7 (Babel stripped from dist/) |
| `dist/app.min.js` | Built by CI (gitignored) — last confirmed 493.8 KB minified |
| BASE_PRICES | ✅ 100% coverage — all 152 venue APs present |

---

## Performance Bottleneck

**Single largest bottleneck: `app.jsx` Babel parse on initial load.**

The dev path (`index.html`) ships `babel-standalone` (7.24.7, ~900 KB gzip) + `app.jsx` (759 KB), which Babel parses at runtime. The production build (`dist/index.html`) strips this entirely via `scripts/build-web.mjs` → `dist/app.min.js` (~493 KB minified, Babel stripped). GitHub Pages serves `dist/`, so live users get the fast path.

The dev path is irrelevant to end-users. No action needed.

**Second bottleneck: 404 sequential Open-Meteo weather fetches.**

Client batches 50 requests per 2 seconds. Full venue list takes ~16 seconds to fetch on cold load. The VPS proxy cache (once deployed) will collapse this to 1 upstream call per venue for warm traffic. This is the strongest argument for P0-1.

---

## Cost at Scale

| MAU | DO VPS | Open-Meteo | GitHub Pages | Total/mo |
|-----|--------|------------|-------------|---------|
| Current (<100) | $6 | Free (well under rate limit) | Free | **$6** |
| 1K | $6 | Free (sequential batch, 404 venues, fine) | Free | **$6** |
| 10K | $12 (2GB droplet) | ⚠️ **Free tier stressed** (~66+ concurrent = rate limit hit without proxy cache) | Free | **$12** |
| 100K | $48+ (3× droplets or managed) | 🚨 **Free tier BROKEN** — need $29/mo commercial plan | Free | **$77+** |

**Scale-breaker:** Open-Meteo free tier collapses at ~66 concurrent users fetching the same venue set without the proxy cache. The VPS proxy cache (committed but undeployed) is the fix. At 10K MAU it's a $0 problem if the VPS is deployed; at 100K MAU it's $29/mo. This is exactly why P0-1 is P0.

---

## What Breaks First

**At the moment of any Reddit/HN post:** multiple users hit Explore simultaneously → 404 direct Open-Meteo fetches × N users → rate limit → all weather fetches return errors → venues score 50 (flat) → Explore grid sorted by noise → product looks broken on the day it matters most.

**Prevention:** Deploy `server/proxy.js` (P0-1). The in-memory LRU cache is in the committed code — 4000-entry, 2hr TTL, in-flight dedupe. One upstream call per venue no matter how many concurrent users. The disk persistence patch is also committed (Open #23), which survives `pm2 restart`. Both ship with the same 10-minute SSH session.

Whistler opens **13 days from today (Nov 21)**. That is the natural catalyst for traffic. The VPS needs to be live before then.
