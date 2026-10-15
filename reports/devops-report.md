# DevOps Report — 2026-10-15 (RED)

**Status: 🔴 RED — VPS Day 67 (3 days to Oct 18 launch). `origin/master` footgun Day 9 (50 commits behind main, still fires deploys). SW PRECACHE Babel mismatch Day 11. Code freeze Day 31 clean.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health checks from sandbox always time out — not a VPS outage signal.

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 758,944 bytes** — code freeze Day 31, unchanged since 2026-09-14 ✅ |
| VENUES (eval/bracket-counted) | **406** ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — 31-day freeze, **expected**, no action needed under code freeze |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs, dev path) | ✅ esbuild strips in production CI build |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS |
| Travelpayouts token in client | ✅ NOT present. `TP_MARKER="710303"` is a public affiliate marker, not a secret. |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated |
| All API calls HTTPS | ✅ Clean |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key` |
| Image `loading="lazy"` | ✅ 9 sites across card components |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController, 2-attempt retry |
| Sentry DSN | ✅ configured (`app.jsx:8`, `index.html:77`) |
| `AP_CONTINENT` FOR/NAT fix | ✅ confirmed — `FOR:"latam"`, `NAT:"latam"` present |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| `dist/app.min.js` | Not in repo; CI-built on push via `scripts/build-web.mjs` — expected |

---

## 2. CRITICAL ISSUES (P0) — Fix today, blocks launch

### P0-A: VPS Redeploy STILL PENDING — **Day 67, 3 days to Oct 18 launch** 🚨🚨🚨

Day 67. Oct 18 is Saturday. That's 3 days. The VPS runs code from August 11 while every committed fix sits inert.

**What users get TODAY because of this:**

1. **Two-weekend scoring disabled.** Old proxy returns 7-day forecast. Client needs 14 days for second Fri–Mon window. The headline feature is half-functional on launch day.
2. **iOS native completely blocked.** `capacitor://localhost` absent from CORS allowlist. Every iOS App Store user gets CORS errors on all proxy calls. If the App Store submission goes live Saturday, iOS users hit a broken product immediately.
3. **Alert deletion silently fails.** `DELETE` missing from `Access-Control-Allow-Methods`. Client `.catch(()=>{})` hides it — user deletes an alert, sees it vanish from UI, it's still alive server-side.
4. **Weather cache missing disk persistence.** Any `pm2 restart` wipes the in-memory cache. Cold restart right before/during Reddit/HN traffic = Open-Meteo rate limit within minutes. Free tier ceiling ~10K calls/day; a few hundred simultaneous users blow through it.

**Fix. One `scp`. One `pm2 restart`. 5 minutes. All code is done.**

```bash
# From your LOCAL machine, in the peakly repo root:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# SSH in:
ssh root@198.199.80.21
pm2 restart peakly-proxy
pm2 save

# Verify (takes ~5 seconds):
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days:14, disk_cache:"enabled", uptime resets to seconds
```

---

### P0-B: `origin/master` Footgun — **Day 9** 🚨

`deploy.yml` triggers on BOTH `main` AND `master`. `origin/master` is **50 commits behind main**. Any accidental push to master — stale local clone, old worktree, git remote typo — deploys 50-commit-old code silently. No error. No warning. No rollback.

**What a bad push to master does:** silently replaces the live site with a 50-commit regression. Score changes, venue catalog, all Aug–Oct fixes — gone. GitHub Pages deploys in ~2 minutes. You'd miss it unless you were watching the Actions tab.

**Fix A — Delete the master branch (recommended, 30 seconds):**
```bash
# From local machine:
git push origin --delete master
```

**Fix B — Remove master from deploy triggers (keeps branch, removes footgun):**
```diff
# .github/workflows/deploy.yml
 on:
   push:
     branches:
       - main
-      - master
```

Both fixes are one terminal command or one-line edit. Fix B is safer if you're not sure whether anything references master. Pick one. Do it before Oct 18.

---

## 3. HIGH ISSUES (P1)

### P1-A: SW PRECACHE Babel Version Mismatch — **Day 11**

`sw.js` caches `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js` (Day 11 unchanged). `index.html` loads `https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js`. Two different versions, two different CDNs. The SW caches a file that is never loaded by the app. On install, every user's SW fetches and caches 860 KB of dead weight.

Production is unaffected — CI esbuild strips Babel entirely. But the SW wastes bandwidth, and the mismatch is confusing.

**Fix — 2 minutes:**
```javascript
// sw.js line 3-5
const PRECACHE = [];
// That's it. Empty it. Production doesn't need it. Dev path doesn't use the SW.
```

This change requires a cache stamp bump in lockstep (sw.js CACHE_NAME + app.jsx PEAKLY_BUILD + index.html `?v=`). Since code freeze is active, defer to post-launch if you want, but before any Reddit/HN post it should be clean.

---

## 4. MEDIUM ISSUES (P2)

### P2-A: `origin/master` Branch with 16 `claude/` Feature Branches Still Open

16 `claude/` branches visible on origin (analysis, code-review, redesign variants, etc.), none merged to main, some containing experimental changes. Most are stale exploratory work. While individually harmless, they create noise and a small risk: anyone clicking "Compare & merge" on the wrong one triggers a PR that could accidentally land in main if approved.

**Recommended cleanup (local machine, 5 minutes):**
```bash
# List all stale claude/ branches:
git branch -r | grep "origin/claude/"

# Delete each (replace <branch> with actual name):
git push origin --delete claude/<branch>
# Or delete them all at once:
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}
```

Not a launch blocker, but clean state before launch.

### P2-B: No SRI on CDN Scripts

`index.html` loads React 18.3.1 and Babel 7.24.7 from cdnjs without Subresource Integrity hashes. A cdnjs CDN compromise silently injects JS. Low probability, non-zero risk.

```html
<!-- Generate hashes at https://www.srihash.org/ then add: -->
<script crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-GENERATE_THIS">
</script>
```

One-time 20-minute task, post-launch is fine.

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| app.jsx raw | 759 KB |
| `dist/app.min.js` (production, CI-built) | ~439 KB (per CLAUDE.md) |
| React 18 UMD (cdnjs) | ~42 KB gzipped |
| Babel standalone dev-path (cdnjs) | ~860 KB uncompressed — **dev/local only, stripped in production** |
| Supabase JS | ~80 KB gzipped, lazy-loaded |

**Biggest performance bottleneck:** Photos. ~346 of 406 venues use generic stock unrelated to the venue (Open #20). These are Unsplash 1.2MP images, lazy-loaded but not sized for mobile card dimensions. This is the single highest-impact quality gap. Doesn't affect Time-to-Interactive, does affect perceived trust in the product.

**Second:** Babel dev-path (860 KB). **Does not affect production.** GitHub Pages users never parse Babel. Only surfaces if someone opens `index.html` locally.

---

## 6. Cost Estimate

| Scale | Monthly Cost | Notes |
|-------|-------------|-------|
| **Current (<100 MAU)** | **$6/mo** | DO $6 droplet, GitHub Pages free, Supabase free |
| **1K MAU** | **$6/mo** | DO handles it, Supabase free tier |
| **10K MAU** | **$6–12/mo** | VPS proxy cache (if deployed) prevents Open-Meteo blowout |
| **100K MAU** | **$31–55/mo** | DO $12, Supabase Pro $25, CDN egress |

**What breaks first at scale:** Open-Meteo rate limit. Without VPS proxy cache: ~200 concurrent active users exhaust the free tier (10K calls/day). With VPS proxy cache deployed (WX_CACHE_FILE): 406 unique venue pairs × 12 refreshes/day = ~4,872 upstream calls/day max, regardless of concurrent users. 100K MAU stays under the ceiling.

**The VPS deploy is the $0 scale fix. It unlocks launch-gate features AND rate-limit protection.**

---

## 7. Security Posture — ✅ CLEAN

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Not present (server-side only) |
| Supabase anon key | ✅ Intentional, public-safe, RLS-gated |
| `.env`, `*.pem`, `*.p8`, `*.key` gitignored | ✅ Confirmed |
| Secrets in client code | ✅ Clean — full grep scan |
| Sentry DSN | ✅ Configured |
| Recent commits (last 10 days) | ✅ Report files only — no code, no secrets |

---

## Summary: 3 actions, 9 minutes, 3 days left

| Action | Time | Impact |
|--------|------|--------|
| **`scp server/proxy.js` + `pm2 restart`** | 5 min | Unlocks two-weekend scoring, iOS CORS, alert deletion, weather cache. Day 67. |
| **Remove `master` from `deploy.yml`** | 2 min | Defuses a footgun armed for 9 days. |
| **`PRECACHE = []` in sw.js** | 2 min | Stops caching 860 KB dead weight on SW install. (Defer to post-launch if code freeze is sacred.) |

**P0-A and P0-B are not optional before Oct 18.** The VPS especially: launching iOS on the App Store with CORS errors and broken two-weekend scoring is a 1-star review machine.
