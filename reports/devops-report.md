# DevOps Report — 2026-10-24 (RED)

**Status: 🔴 RED — VPS Day 76. Whistler window = 17 days. Code freeze lifted yesterday. Cache stamp 40 days stale. `origin/master` footgun Day 17. PRECACHE→CDN mismatch confirmed.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Do not interpret sandbox timeouts as VPS outage.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,237 lines / 758,944 bytes** — unchanged. Code freeze Day 39 ended yesterday ✅ |
| Total venues (category grep, authoritative) | **404** (134 skiing / 270 beach) ✅ |
| Bracket-walker count | **406** ⚠️ 2-venue discrepancy vs category grep — likely bracket noise in comments or non-venue objects. Category grep is authoritative (matches CLAUDE.md). |
| Duplicate venue IDs | 0 ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — **40 days stale.** Code freeze lifted. First edit MUST bump in lockstep across app.jsx + sw.js + index.html. Auto-push.sh should handle this automatically. ⚠️ |
| Plausible analytics | ✅ present, uncommented — `index.html:32` |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs, dev-only) | ✅ stripped by CI build-web.mjs in prod |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, no raw IP |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is a public affiliate marker only — correct |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated (`app.jsx:26`) |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 `<img>` sites — all covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController (`app.jsx:6381`) |
| Sentry DSN | ✅ configured — `app.jsx:8`, `index.html:77` |
| `lateSeason:true` venues | ✅ 15 — matches CLAUDE.md |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| `proxy.js` (committed, NOT on VPS) | ✅ `forecast_days=14`, disk cache, iOS CORS, `DELETE` allow, `http2` APNs, `ieee-p1363` JWT |
| PRECACHE→CDN alignment | 🔴 **MISMATCH** — see P1-A below |
| `origin/master` footgun | 🔴 **LIVE** — see P0-B below |

---

## 2. Critical Issues (P0) — Fix Today

### P0-A: VPS Redeploy — Day 76. Whistler Window = 17 Days 🚨

Same four bugs. VPS is running 2026-08-11 code. Nothing changed overnight. The fix is 3 commands and 5 minutes.

| # | Broken feature | User impact |
|---|---------------|-------------|
| 1 | `forecast_days: 7` not `14` | Two-weekend scoring disabled. Whistler/Tignes/Val Thorens invisible on front page during early-season windows. |
| 2 | `capacitor://localhost` absent from CORS | Every iOS native API call blocked. App Store build = broken on every iPhone. |
| 3 | `DELETE` absent from `Access-Control-Allow-Methods` | Alert deletion silently fails. `.catch(()=>{})` hides it. |
| 4 | `_wxCache` in-memory only | `pm2 restart` after deployment wipes cache → cold Open-Meteo rate-limit on traffic spike. |

**Hard deadline: Nov 5 (13 days).** Whistler likely opens ~Nov 10. The Reddit post can't be finalized without the VPS running `forecast_days:14` for the screenshot. VPS ships before the post goes up.

```bash
# SSH to VPS (198.199.80.21), then:
cd /opt/peakly-proxy
cp proxy.js proxy.js.bak.$(date +%Y%m%d)
# Copy server/proxy.js from repo to /opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Verify: forecast_days=14 in weather endpoint, apns:configured or unconfigured
```

**Time: 5 minutes. Blocking: Whistler post, iOS App Store, alert deletion, two-weekend scoring.**

---

### P0-B: `origin/master` Footgun — Day 17 🚨

`deploy.yml` deploys both `main` AND `master`. `origin/master` branch is 5 months behind (May 2026). One accidental `git push origin master` by any Claude session or auto-push.sh misconfiguration rolls back the live site to May 2026 code — 404 venues → ~339, onboarding flow, scoring changes all reverted.

This is a 30-second fix:

```bash
# Delete the remote master branch (deploy.yml still works — it just won't trigger on master anymore)
git push origin --delete master

# OR: edit deploy.yml to remove master from the on-push branches list
# .github/workflows/deploy.yml line 6-7:
# branches:
#   - main      ← keep this
#   - master    ← DELETE THIS LINE
```

**Prefer the branch delete** — it eliminates the surface entirely. If master needs to exist for some reason (it doesn't), update deploy.yml to remove it from the trigger list.

**Time: 30 seconds. Risk of not doing it: catastrophic silent rollback.**

---

## 3. High Issues (P1)

### P1-A: PRECACHE→CDN URL Mismatch 🔴

`sw.js` PRECACHE array contains:
```js
"https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
```

But `index.html` loads Babel from:
```
https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js
```

Two problems:
1. **Different CDN, different version** (7.29.7 vs 7.24.7). The SW precaches a URL that the page never requests. The actual Babel the page loads is never precached.
2. **Prod build doesn't load Babel at all** — `build-web.mjs` strips it. The SW is burning bandwidth on a first install to cache something that prod never uses and dev doesn't benefit from (dev loads it fresh from cdnjs anyway).

Fix:
```js
// sw.js — option A: align URL (still useless in prod but at least correct in dev)
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];

// sw.js — option B (recommended): empty it
const PRECACHE = [];
```

Option B is correct. Prod build strips Babel. Dev doesn't need SW caching. An empty PRECACHE is what the repo had before this stale entry appeared.

**Time: 2 minutes. Bundle with cache stamp bump — it's a sw.js edit anyway.**

---

### P1-B: Tag Quality Degradation — 225/404 Venues (55.7%) Have Only 2 Tags

`scoreVibeMatch` and search recall degraded for majority of catalog. Already tracked as P1 in PM sprint queue. Not repeating full analysis here — Content report has the breakdown. Sprint item #6.

---

## 4. Medium Issues (P2)

### P2-A: Cache Stamp 40 Days Stale

`PEAKLY_BUILD = "20260914a"`, `CACHE_NAME = "peakly-20260914a"`. Code freeze lifted. First post-freeze edit will trigger auto-push.sh, which should auto-bump the stamp in lockstep across all three files. **Verify auto-push.sh actually runs to completion on first edit** — the 2026-08-11 session found the venue-integrity guard had a broken regex that silently killed the script. If the stamp doesn't bump on first edit, check `/tmp/peakly-auto-push.log`.

Expected new stamp format: `20261024a` (today's date).

### P2-B: Gili Trawangan Duplicate Live

`beach_gilit` (ap: LOP, line 614) and `gili-trawangan` (ap: DPS, line 5061) — same beach, two venue IDs, two scoring profiles. Sprint item #4 per PM. Fix: delete one. DPS (Bali) is the more common routing airport for Gili T. Recommendation: keep `gili-trawangan`/DPS, delete `beach_gilit`/LOP. **Verify the deleted ID isn't in any user's localStorage wishlists first** — old IDs become orphans in saved lists.

### P2-C: Stale `dist/index.html` in Repo

`dist/index.html` committed to repo has only a Plausible comment, no script tag. Not a prod bug — CI `fs.rmSync(DIST,...)` + full rebuild on every push generates the correct file. But it's a misleading artifact. Any developer who opens `dist/index.html` locally sees a broken page. Delete it or add to `.gitignore`. Bundle with first sprint commit.

### P2-D: 15 Unmerged `claude/*` Branches on Origin

15 remote branches from exploratory sessions haven't been merged:
- `claude/redesign-front-page-EndKs`
- `claude/improve-scoring-system-XYGY6`
- `claude/streamline-onboarding-account-97XRR`
- etc.

These are dead weight. Per PM Decision 3: evaluate post-Whistler, close most. Until then they're noise in `git branch -r`. Not a functional issue.

---

## 5. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ NOT present — `TP_MARKER` is a public affiliate marker |
| Supabase anon key | ✅ Intentional, RLS-gated. Public-safe by design. |
| `.env` files in git | ✅ `.gitignore` covers all `.env*` patterns |
| `*.p8` / `*.pem` / `*.key` in git | ✅ gitignored |
| Recent commits for secrets | ✅ Last 3 commits are report files only — no app.jsx changes |
| Sentry DSN | ✅ configured — public DSN is intentionally client-side |
| `alert_id` generation | ✅ `crypto.randomUUID()` with `getRandomValues` fallback (`app.jsx:10887`) — Open #21 fix shipped |
| APNs key on server | ✅ `.p8` gitignored, stored only on VPS |

**No credentials exposed. Clean.**

---

## 6. Performance Analysis

| Metric | Value |
|--------|-------|
| `app.jsx` raw | 758,944 bytes |
| `dist/app.min.js` (esbuild) | ~439KB minified (~120KB gzipped est.) |
| React 18.3.1 (cdnjs) | ~44KB gzipped |
| ReactDOM 18.3.1 (cdnjs) | ~130KB gzipped |
| Sentry SDK | ~35KB gzipped |
| Plus Jakarta Sans | ~25KB gzipped |
| **Total prod cold load** | **~354KB gzipped** |
| Supabase JS | ~80KB gzipped (lazy — only on auth) |
| Babel (dev only) | ~825KB gzipped (stripped in prod ✅) |

**Single largest bottleneck:** 404 venues × 2 weather API calls each = 808 concurrent Open-Meteo requests at cold cache. The VPS proxy with shared cache (Open #7, committed to proxy.js) eliminates this, but it's not deployed. At <10 MAU this doesn't matter. At 100+ concurrent DAU hitting the same venue (post-Reddit), it hits Open-Meteo's free tier ceiling.

**Image lazy loading:** ✅ All 9 `<img>` tags have `loading="lazy"`. Venue photos are Wikimedia/Unsplash URLs — no CDN, no image optimization. Not a current blocker.

---

## 7. Cost Estimate

| MAU | Infra cost | Notes |
|-----|-----------|-------|
| Current (<10) | $6/mo | DigitalOcean 1GB droplet + GitHub Pages (free) |
| 1K | $6/mo | No change needed — VPS handles weather proxy; Open-Meteo free tier covers 10K req/day |
| 10K | $12–18/mo | May need 2GB droplet; Open-Meteo rate limiting becomes real |
| 100K | $50–100/mo | Need Open-Meteo commercial ($39/mo), 4GB VPS, CDN for images |

**Cost optimization opportunity:** The VPS `_wxCache` disk persistence (Open #23, committed but not deployed) means a `pm2 restart` doesn't wipe the cache — critical for traffic spike survival. At 10K MAU, losing the cache on a restart = 808 uncached upstream calls = rate-limited = product broken for everyone. This is the single most important server-side change after `forecast_days:14`.

---

## 8. What Breaks First at Scale

**Open-Meteo rate limiting.** The app makes 1–2 weather API calls per venue per user, direct from the browser. At 50+ concurrent DAU hitting overlapping venue sets, it exceeds Open-Meteo's free tier ceiling and starts returning errors — which the client shows as "conditions unavailable." The VPS proxy with shared cache (committed, not deployed) solves this: N simultaneous users hitting the same venue = 1 upstream call. Without the VPS redeploy, a Whistler Reddit post that drives 200 simultaneous users breaks the product for all of them within 60 seconds of the post going live. **Ship the VPS before the Reddit post. No exceptions.**

---

## Action Summary

| Priority | Item | Time | Blocking |
|----------|------|------|---------|
| 🔴 P0-A | VPS redeploy (proxy.js) | 5 min SSH | Whistler post, iOS App Store, alert deletion |
| 🔴 P0-B | Delete `origin/master` | 30 sec | Catastrophic rollback risk |
| 🟡 P1-A | Fix PRECACHE in sw.js (clear or align) | 2 min | Bundle with stamp bump |
| 🟡 P2-A | Cache stamp bump (auto on first edit) | Auto | Service worker refresh |
| 🟡 P2-B | Gili Trawangan dedup | 5 min | Clean catalog |
| 🟡 P2-C | Remove stale `dist/index.html` | 1 min | Misleading artifact |
