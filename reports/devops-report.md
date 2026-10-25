# DevOps Report — 2026-10-25 (RED)

**Status: 🔴 RED — VPS Day 77. Whistler window = 16 days. Cache stamp 41 days stale. `origin/master` footgun Day 18. PRECACHE→CDN version mismatch confirmed.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Do not interpret sandbox timeouts as VPS outage.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,237 lines / 758,944 bytes** (741 KB) — no code changes since 2026-08-11 ✅ |
| Total venues (both-format grep, authoritative) | **404** (134 skiing / 270 beach) ✅ |
| Duplicate venue IDs | 0 ✅ |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — **41 days stale.** Code freeze lifted Oct 23. First code edit MUST bump in lockstep (auto-push.sh handles this). ⚠️ |
| Plausible analytics | ✅ present, uncommented — `index.html:32` |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ dev-only; stripped by build-web.mjs in prod |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, no raw IP |
| Travelpayouts token in client | ✅ `TP_MARKER="710303"` is public affiliate marker only — correct |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated (`app.jsx:26`) |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ 9 `<img>` sites — all covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController (`app.jsx:6381`) |
| Sentry DSN | ✅ configured — `index.html:77` |
| `lateSeason:true` venues | ✅ **15** (10 compact + 5 JSON-format) — matches CLAUDE.md |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| `proxy.js` (committed, NOT on VPS) | ✅ `forecast_days=14`, disk cache, iOS CORS, `DELETE` allow, `http2` APNs, `ieee-p1363` JWT |
| PRECACHE→CDN alignment | 🔴 **MISMATCH** — see P1-A below |
| `origin/master` footgun | 🔴 **LIVE Day 18** — see P0-B below |

---

## 2. Critical Issues (P0) — Fix Today

### P0-A: VPS Redeploy — Day 77. Whistler Window = 16 Days. 🚨

This is the same finding for the 77th consecutive day. The committed `server/proxy.js` fix has been sitting undeployed since 2026-08-11. The VPS is still running the August 11 code with all four bugs intact.

**Whistler likely opens ~Nov 10. That's 16 days.** The Reddit post requires `forecast_days:14` screenshots to be honest. The VPS must ship before that post. Today is the deadline that slips every day.

| # | Broken feature | User impact today |
|---|---------------|-------------------|
| 1 | `forecast_days: 7` on VPS (not `14`) | Whistler, Tignes, Val d'Isère invisible on front page for next-weekend planning. Two-weekend scoring disabled entirely. |
| 2 | `capacitor://localhost` absent from CORS allowlist | Every iOS native API call blocked with a CORS error. App Store build = broken on every iPhone out of the box. |
| 3 | `DELETE` absent from `Access-Control-Allow-Methods` | Alert deletion silently fails for every user. `.catch(()=>{})` hides it. Users think they deleted alerts; they didn't. |
| 4 | `_wxCache` in-memory only | `pm2 restart` (required by redeploy) cold-flushes the cache. Any traffic spike in the first ~10 minutes post-restart will exceed Open-Meteo's free-tier rate ceiling. |

**The fix is 4 commands:**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
cp ~/peakly/server/proxy.js .   # or scp from local — /opt/peakly-proxy is NOT a git repo
pm2 restart peakly-proxy && pm2 save
```

Verify:
```bash
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: forecast_days_weather:14, wx_cache_size rebuilding, apns:configured or unconfigured
```

---

### P0-B: `origin/master` Footgun — Day 18

`deploy.yml` triggers on both `main` **and** `master`. `auto-push.sh` line 235 pushes `master:main` (a local `master` branch to remote `main`). But `origin/master` also exists as a real remote branch.

**The footgun:** any push that accidentally targets `origin/master` directly — from a stale local clone, a mistyped `git push`, or a branch that drifts — triggers a full GitHub Pages deployment from that commit. Silent, automatic, no review gate.

There are currently **15 open `claude/*` branches** on origin plus `fix-appjsx-final` and `restore-appjsx`. Any of these could be accidentally deployed if a push command targets master instead of main.

**Fix (2 minutes):**
```bash
# 1. Remove master trigger from deploy.yml
# Change:
#   branches:
#     - main
#     - master
# To:
#   branches:
#     - main

# 2. Delete origin/master
git push origin --delete master

# 3. Verify
git branch -r | grep master  # should return nothing
```

Edit deploy.yml directly — line 6-7, remove the `- master` line.

---

## 3. High Issues (P1) — Fix This Week

### P1-A: PRECACHE CDN Mismatch

`sw.js` PRECACHE entry:
```
https://unpkg.com/@babel/standalone@7.29.7/babel.min.js
```

`index.html` actually loads:
```
https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js
```

**Two mismatches: different CDN (unpkg vs cdnjs) AND different version (7.29.7 vs 7.24.7).** The service worker is pre-caching a URL that the page never requests. The real Babel URL is never pre-cached. On repeat visits, Babel re-downloads from cdnjs every time — zero cache benefit.

In production (build-web.mjs output), Babel is stripped entirely, so this only affects dev mode. But the mismatch is confusing and the PRECACHE is pure waste.

**Fix:**
```javascript
// sw.js line 3 — either:
// Option A: clear the PRECACHE (production doesn't need it, dev can't use SW)
const PRECACHE = [];

// Option B: align the URL to match index.html's actual Babel load
const PRECACHE = [
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"
];
```

Option A is correct. Production uses the built dist/app.min.js and doesn't load Babel at all. The SW ships with prod. No need to precache Babel.

Time to fix: 30 seconds. Must bump cache stamp in lockstep across sw.js + app.jsx + index.html when editing sw.js.

---

### P1-B: Cache Stamp 41 Days Stale

`PEAKLY_BUILD = "20260914a"` / `CACHE_NAME = "peakly-20260914a"` / `index.html?v=20260914a`

Code freeze lifted October 23. Any app.jsx edit that ships without a cache bump will be served stale to all existing users who have the Oct 14 entry in their SW cache. The auto-push.sh hook should handle this automatically for local edits — but verify the hook is alive before the first post-freeze commit:

```bash
cat /tmp/peakly-auto-push.log | tail -20
bash -x scripts/auto-push.sh  # dry-run to confirm it reaches the stamp-bump logic
```

If the hook is silent or erroring, the stamp MUST be bumped manually before pushing any code change.

---

## 4. Medium Issues (P2) — Fix This Sprint

### P2-A: 15 Stale `claude/*` Remote Branches

`git fetch` output shows 15 new remote branches (`claude/analyze-test-coverage-WVIsT`, `claude/code-review-cleanup-HjoCS`, etc.) plus `fix-appjsx-final` and `restore-appjsx`. These are open cloud-agent worktrees that never merged and were never cleaned up.

**Risk:** clutter in the remote, someone accidentally checking one out and pushing, deploy.yml's `master` trigger catching one if named `master`.

**Fix:**
```bash
# Delete all stale claude/* branches from origin
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
  fix-appjsx-final \
  restore-appjsx
```

Estimated time: 2 minutes.

### P2-B: No SRI on CDN Scripts (Open #10, long-standing)

`index.html` loads React, ReactDOM, Babel, and Supabase from CDN without `integrity=` attributes. A CDN compromise could inject malicious JS with no browser-level detection.

```html
<!-- Current (no integrity check): -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>

<!-- Fixed (add integrity hash): -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha512-..."
  crossorigin="anonymous"></script>
```

Generate hashes:
```bash
curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js \
  | openssl dgst -sha512 -binary | openssl base64 -A | sed 's/^/sha512-/'
```

Repeat for ReactDOM and Babel. Sentry and Supabase load async via script injection — SRI doesn't apply there. Medium risk: cdnjs has strong SLA; realistic attack surface is low pre-100K MAU.

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| app.jsx raw | 759 KB |
| dist/app.min.js (esbuild, shipped to prod) | ~439 KB minified |
| Babel Standalone (dev only) | ~900 KB (cdnjs) |
| React 18.3.1 UMD | ~132 KB |
| ReactDOM 18.3.1 UMD | ~1.1 MB |
| **Total prod JS payload** | **~1.6 MB** (React + ReactDOM + app.min.js) |

**Largest single bottleneck: ReactDOM UMD at 1.1 MB.** The UMD build includes the dev warning infrastructure even in the production variant (`react-dom.production.min.js`). This is inherent to the CDN/no-build architecture — switching to ESM + tree-shaking would drop this ~40% but requires a build step (against project constraints). Not a change to make now.

All 9 `<img>` tags use `loading="lazy"` ✅. Open-Meteo batches at 50 venues/2s to avoid rate limits ✅. 4s AbortController on proxy fetch ✅.

---

## 6. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ Not present — server-side only |
| Supabase anon key | ✅ `app.jsx:26` — intentional, public-safe, RLS-gated per Supabase design |
| Sentry DSN | ✅ configured in `index.html:77` |
| `.gitignore` | ✅ `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` all covered |
| Git history for recent secrets | ✅ Last 10 commits are report files only — no code changes |
| Open API credentials | ✅ None — Open-Meteo is unauthenticated |
| APNs `.p8` | ✅ gitignored by `*.p8` — not in repo |
| APNS code in proxy.js | ✅ Committed fix uses `ieee-p1363` JWT + `http2.connect` — correct. Not on VPS yet. |

No secrets found. Clean.

---

## 7. Cost Estimate

| Scale | DigitalOcean $6 droplet | Open-Meteo | Supabase | Total/mo |
|-------|------------------------|------------|----------|----------|
| Current (<100 MAU) | $6 | Free (well under 10K req/day) | Free (500MB, 2GB transfer) | **$6** |
| 1K MAU | $6 | Free (batched via proxy cache) | Free | **$6** |
| 10K MAU | $12 (1GB RAM no longer sufficient) | Free (proxy cache absorbs) | Free (DB stays small) | **$12** |
| 100K MAU | $48 (4GB RAM + CDN) | $0 (proxy cache) | $25/mo (Pro) | **$73** |

**Cost optimization available:** Upgrade the $6 1GB droplet to $12 2GB **before** any traffic spike. At peak load (Reddit/HN front page), a 1GB VPS will OOM before the rate limiter kicks in. The proxy's `_wxCache` holds ~600 entries × ~4KB = 2.4MB resident normally, but spikes with in-flight weather requests. Buffer to $12/mo now, swap during the next SSH session that redeploys the code anyway.

---

## 8. Scale Failure Mode

**What breaks first: the VPS OOMs on a Reddit spike, not Open-Meteo.** Here's the sequence: post lands, 500 concurrent users hit the same 50 ski venues, each triggering `fetchWeather`. The `_wxCache` in-memory LRU absorbs duplicate lat/lon pairs — so weather fetches collapse to ~50 upstream calls over ~2 seconds (the batch rate). That's fine. But each of those 500 users also triggers a Travelpayouts flight fetch via the proxy. Travelpayouts has no in-proxy cache by default — 500 simultaneous flight queries on a 1GB droplet with a single Node.js process will exhaust memory and the process will crash or start 502-ing. Prevention: (1) Add a simple in-memory flight-price cache keyed on `origin+dest+date` with a 30-minute TTL — identical to the weather cache, ~5 lines of code; (2) Upgrade to 2GB RAM before the post; (3) The PRECACHE fix (P1-A) is irrelevant to this since the caching happens server-side. Ship (1) and (2) in the same VPS redeploy as P0-A.

---

## 9. Action Summary

| Priority | Item | Est. time | Owner |
|----------|------|-----------|-------|
| P0 | VPS redeploy — 4 SSH commands | 5 min | Jack |
| P0 | Delete `origin/master` + fix deploy.yml | 2 min | Jack or agent |
| P1 | PRECACHE fix (sw.js line 4, clear array) | 30 sec | Agent on next app.jsx edit |
| P1 | Verify auto-push.sh stamp-bump is live | 2 min | Agent pre-first-edit |
| P2 | Delete 17 stale remote branches | 2 min | Agent |
| P2 | SRI hashes for CDN scripts | 30 min | Agent |
| P2 | $6→$12 droplet upgrade | 5 min | Jack (DigitalOcean console) |

**The only item that requires Jack:** VPS redeploy and droplet resize. Everything else is in-repo. The window to do the VPS work and have Whistler appear on the front page before it opens is **16 days**. Every day this slips is a day the app looks broken to skiers planning their first November weekend.
