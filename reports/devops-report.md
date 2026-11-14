# DevOps Report — 2026-11-14 (RED)

**Status: 🔴 RED — VPS Day 98 (Whistler opens in 7 days). Cache stamp 14 days stale. `master` footgun Day 38. `fix-appjsx-final` rollback bomb Day 15. App Review hard stop was YESTERDAY (Nov 14 — missed). 19 stale branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block confirmed). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 13)

| Item | Nov 13 | Nov 14 (today) |
|------|--------|----------------|
| VPS status | Day 97 | 🚨 **Day 98 — no movement** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (13d) | 🚨 **`20261031a` — 14 days stale** |
| App Review hard stop | TODAY (Nov 14) | 🚨 **MISSED — Nov 14 was yesterday** |
| `fix-appjsx-final` | Rollback bomb Day 14 | **Rollback bomb Day 15** |
| `master` footgun | Day 37 | **Day 38** |
| New app.jsx commits | 0 (27d no code commits) | **0 — 28 days no code commits** |
| Venue count (.venue-baseline) | 404 | ✅ **404 — unchanged** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| lateSeason count | 15 | ✅ **15 confirmed** |
| Remote branches | 19 stale | **19 stale (unchanged)** |
| Plausible analytics | ✅ present | ✅ present, uncommented |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ in app.jsx (see note) | ⚠️ same — `710303` in client code |
| Supabase anon key | ✅ public-safe (RLS-gated) | ✅ RLS-gated per design |
| Image lazy loading | ✅ present | ✅ 9+ img sites use `loading="lazy"` |
| .gitignore | ✅ covers .env, .p8, .pem | ✅ no gaps found |
| GEAR_ITEMS | ✅ removed (count: 0) | ✅ 0 — Amazon cut holds |

---

## P0 — Fix Today

### P0-1: App Review hard stop was YESTERDAY — reply NOW

The Nov 14 deadline PM and DevOps flagged for 14 consecutive days has passed. The Thanksgiving ski window (Whistler opens Nov 21 — 7 days away) is the last viable target for meaningful App Store traffic this year. The submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e` is still in Guideline 2.1 (Information Needed) state — it has not been auto-rejected yet, only waiting on a reply.

**Action: 10 minutes. Jack only.**
1. Open App Store Connect → App Review → submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e`
2. Paste the block from `docs/APP_REVIEW_NOTES.md` into the reply box
3. Attach a screen recording per the shot list in `docs/APP_REVIEW_NOTES.md`
4. Hit Submit Reply

No code changes required. The binary (build 3, iOS 15.0, `CFBundleVersion: 3`) is already uploaded. This is a documentation reply, not a resubmission.

---

### P0-2: VPS Day 98 — Whistler opens in 7 days, two-weekend scoring broken

Same finding. No movement. Active breakage (confirmed from committed `server/proxy.js` vs. deployed code):

1. `forecast_days=7` → `scoreWeekend` returns `confidence:low` for any day >6 → ski venues drop off front page exactly when ski traffic peaks (Whistler Nov 21)
2. `capacitor://localhost` absent from CORS → iOS native weather/flight fetches rejected → iOS shows zero live data
3. `DELETE` missing from `Access-Control-Allow-Methods` → alert deletion silently fails (every delete since Aug 11 is broken)
4. `_wxCache` in-memory only → `pm2 restart` wipes it → cold spike after deploy hits Open-Meteo rate ceiling

**Hard deadline: Whistler opens Nov 21. That's 7 days.**

**Fix — 10 minutes, requires Jack SSH:**
```bash
# 1. Copy committed proxy.js to VPS (not a git clone — no git on VPS)
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js

# 2. Restart
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"

# 3. Verify
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: forecast_days:14, apns:unconfigured, uptime resets to seconds
```

No `npm install` needed — zero new npm deps since last deploy.

---

## P1 — Fix This Week

### P1-1: Cache stamp `20261031a` — 14 days stale (Day 15 tomorrow)

`PEAKLY_BUILD`, `CACHE_NAME` (sw.js), and `app.jsx?v=` query param all locked at `20261031a`. Service worker will not invalidate cached assets for returning users. Any user who visited before Oct 31 is running the old build in their SW cache.

No app.jsx commits have landed in 28 days. The stamp is correct for the current code — but the moment App Review feedback or Thanksgiving content triggers a commit, it must bump in lockstep. The `auto-push.sh` hook handles this automatically on Edit/Write. Zero manual action needed now.

**When next code commit lands, verify:**
```bash
grep "PEAKLY_BUILD" app.jsx     # should match today's date
grep "CACHE_NAME" sw.js         # must match
grep "app.jsx?v=" index.html    # must match
```

---

### P1-2: `fix-appjsx-final` rollback bomb — Day 15

Branch is 5 commits ahead of `origin/main`, all titled "Restore app.jsx". An accidental merge deploys old code over the live site. `deploy.yml` triggers on push to `main` **and** `master`.

```bash
# Inspect before deleting:
git log --oneline origin/main..origin/fix-appjsx-final

# Delete:
git push origin --delete fix-appjsx-final
```

---

### P1-3: `master` branch footgun — Day 38

`master` exists on origin. `deploy.yml` deploys on push to both `main` and `master`. Anyone pushing to `master` triggers a live deploy.

```bash
# Option A: Delete master (verify it's just a stale copy of main first)
git diff origin/main origin/master -- app.jsx | wc -l
# If 0 lines diff: safe to delete
git push origin --delete master
```

---

### P1-4: TP_MARKER `710303` is in client-side app.jsx

`TP_MARKER = "710303"` is at app.jsx:6690. This is the Travelpayouts **affiliate marker**, not the secret token (the secret `TP_TOKEN` stays server-side — ✅ confirmed not in client code). The marker itself is not a credential and Travelpayouts affiliate markers are inherently public (embedded in deep links). No security risk. However it is worth noting: if someone wanted to hijack affiliate credit, they could replace this marker in a fork. Low risk, no action required, documenting for completeness.

---

### P1-5: `restore-appjsx` branch — also a rollback risk

Along with `fix-appjsx-final`, `restore-appjsx` is another named rollback branch. Same risk class: an accidental merge would deploy a prior state. Verify and delete:

```bash
git log --oneline origin/main..origin/restore-appjsx
git push origin --delete restore-appjsx
```

---

### P1-6: 19 stale remote branches

19 branches on origin that are not `main` or `master`. 15 `claude/*` worktree branches, 2 `cursor/*`, 2 rollback branches (`fix-appjsx-final`, `restore-appjsx`), plus `test-small`.

None of these trigger `deploy.yml`. Risk is clutter + accidental-merge footgun for the 2 rollback branches above. The `claude/*` and `cursor/*` branches contain unreviewed experimental changes — confirm none are needed before mass-delete.

```bash
# Delete all claude/* branches at once (after confirming none are open PRs):
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
  claude/streamline-onboarding-account-97XRR

# Delete cursor/* and test-small:
git push origin --delete cursor/finish-peakly-ship-c015 test-small

# Rollback bombs (see P1-2 and P1-5):
git push origin --delete fix-appjsx-final restore-appjsx
```

---

## P2 — Fix This Sprint

### P2-1: Babel Standalone still present in `index.html` dev path

`index.html` loads `babel-standalone/7.24.7/babel.min.js` and processes `app.jsx` client-side. The production path (`deploy.yml` → `build-web.mjs` → esbuild → `dist/`) strips Babel correctly. The dev file is fine as-is. But the `dist/index.html` must not load Babel. Verify:

```bash
grep -i "babel" dist/index.html
# Expected: 0 matches — if any exist, the build script's strip regex broke
```

### P2-2: No Content Security Policy header or meta tag

`index.html` has no `<meta http-equiv="Content-Security-Policy">` and GitHub Pages doesn't allow custom headers. Without a CSP, XSS via a compromised CDN script has no browser-enforced backstop. Medium risk for a static SPA with no server-rendered HTML.

The fix is blocked on the fact that Babel inline eval requires `'unsafe-eval'` in the dev path. The production `dist/` build has no inline eval. A CSP meta tag in `dist/index.html` only (not `index.html`) is safe:

```html
<!-- Add to dist/index.html <head>, generated by build-web.mjs -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://cdnjs.cloudflare.com https://js.sentry-cdn.com https://plausible.io;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https://source.unsplash.com https://images.unsplash.com https://plus.unsplash.com;
  connect-src 'self' https://wsoqcfwkvvemtlddcgfc.supabase.co https://peakly-api.duckdns.org https://api.open-meteo.com https://marine-api.open-meteo.com https://plausible.io;
">
```

Add this to `scripts/build-web.mjs` output step. ~30 min.

### P2-3: No SRI hashes on CDN scripts

`index.html` loads React, ReactDOM, and Babel from cdnjs without Subresource Integrity hashes. If cdnjs is compromised, malicious JS runs in the app with no browser check. CDN URLs are pinned to exact versions (18.3.1 / 7.24.7) which limits the window.

```html
<!-- Generate SRI hashes: -->
<!-- curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | base64 -->
<script crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH>">
</script>
```

~45 min to generate and add all three hashes.

---

## Infrastructure Cost Model

| Tier | MAU | DigitalOcean | Open-Meteo | Supabase | Total/mo |
|------|-----|-------------|------------|---------|---------|
| Now | <100 | $6 | Free | Free | **$6** |
| Growth | 1K | $6 | Free (429 venues × 2 req/batch = ~850 req/day, well within free 10K/day ceiling) | Free (500MB) | **$6** |
| Scale | 10K | $12 (2GB droplet for cache) | Free if proxy cache hit rate >95% | $25 (Pro) | **$37** |
| Viral | 100K | $48 (4GB + load balancer) | $29/mo (commercial) | $599 (Pro Tier 2) | **$676** |

**Current monthly burn: $6.** Zero risk of bill shock until 10K+ MAU. The VPS redeploy in P0-2 is free (same droplet, no resize needed).

---

## Scale Failure Mode

**The VPS.** The in-memory `_wxCache` on the proxy holds 4000 entries max. At 10K+ concurrent users, two things happen simultaneously: (1) LRU eviction thrashes on a cache designed for <100 concurrent users, and (2) a single spike (Reddit/HN post, App Store feature) blows past Open-Meteo's free-tier ceiling before the cache refills. The `forecast_days:14` fix already in committed `server/proxy.js` buys 2× temporal coverage, but the **disk persistence fix (Open #23)** is the survival mechanism — without it, every `pm2 restart` drops the cache cold. Bundle disk persistence with the VPS redeploy in P0-2 (same SSH session, ~30 lines of `fs.writeFileSync/readFileSync` in `server/proxy.js`). If the VPS gets hit with real traffic before this lands, every user gets direct Open-Meteo calls, which start failing for the 2nd+ user hitting the same venue at the same second.

---

## Action Priority

1. **Reply to App Review** — 10 min, Jack only. `docs/APP_REVIEW_NOTES.md` has the paste. Thanksgiving window closes fast.
2. **VPS redeploy** — 10 min, Jack SSH. `scp server/proxy.js` + `pm2 restart`. Whistler opens Nov 21.
3. **Delete rollback bombs** — 2 min. `fix-appjsx-final` and `restore-appjsx` are live footguns. See P1-2 and P1-5.
4. **Delete stale branches** — 5 min. 19 branches including `master`. See P1-3 and P1-6.
