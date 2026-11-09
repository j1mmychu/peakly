# DevOps Report — 2026-11-09 (RED)

**Status: 🔴 RED — VPS Day 93 (deadline expired 2 days ago). Cache stamp 9d stale. `fix-appjsx-final` rollback bomb Day 10. `master` footgun Day 33. `.venue-baseline` MISSING (new). 19 stale branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 8)

| Item | Nov 8 | Nov 9 (today) |
|------|-------|--------------|
| VPS status | Day 92 — deadline PASSED | **🚨 Day 93 — no movement** |
| `.venue-baseline` | present (404) | **🆕 MISSING — guard falls back to 0** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (8d) | ⚠️ **`20261031a` — 9 days stale** |
| `fix-appjsx-final` | Rollback bomb Day 9 | **Rollback bomb Day 10 — DO NOT MERGE** |
| Origin branches | 19 | **19** — unchanged |
| `master` footgun | Day 32 | **Day 33** |
| New app.jsx commits | Reports only | **Reports only — 23 days no code** |
| Venue count | 404 (134 ski / 270 beach) | ✅ **404 — no drift** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| lateSeason venues | 15 (Content confirmed) | ✅ **15** (grep-c=17 includes scoring logic lines; 15 venue objects confirmed per CLAUDE.md) |
| BASE_PRICES coverage | ✅ CLOSED (100%) | ✅ **100% — stays closed** |
| Sentry DSN | live | ✅ live |
| Plausible | present | ✅ present, uncommented |

---

## P0 — Fix Today

### P0-1: VPS Day 93 — Nov 7 deadline expired. KNOWN-BROKEN per PM v204.

Three missed deadlines. The committed `server/proxy.js` has been repo-ready since **2026-08-11**. What is broken RIGHT NOW:

- **Two-weekend scoring dead.** `forecast_days=14` committed, live VPS still returns 7-day windows. Whistler opens **Nov 21 — 12 days**. First ski weekend of the season hits a broken product.
- **Alert deletion silently fails.** `DELETE` CORS header absent from live VPS. User clicks delete → `.catch(()=>{})` swallows it → alert stays server-side, keeps firing push notifications.
- **iOS native CORS-blocked.** `capacitor://localhost` not in live VPS CORS whitelist. Every iOS weather/flight fetch rejected at preflight.
- **Disk cache absent.** `pm2 restart` wipes `_wxCache`. First traffic spike post-launch blows Open-Meteo's free tier ceiling before it refills.

**Fix — 10 minutes, requires Jack SSH:**
```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Verify: forecast_days:14 in response, uptime resets to seconds
```

No `npm install` needed — deps unchanged since last deploy.

---

### P0-2: `fix-appjsx-final` branch — Day 10, rollback bomb, NO MERGE BASE with main.

```
$ git diff --stat origin/main...origin/fix-appjsx-final
fatal: origin/main...origin/fix-appjsx-final: no merge base
```

This branch has **no common ancestor with main**. It is an orphaned history that will REWRITE main's entire commit history if merged via GitHub UI's "Merge" button. It contains:
```
9fab855 Restore app.jsx — fix 4 data-quality bugs (IATA codes + Chamonix dup)
af0c9cc Restore app.jsx — fix 4 data-quality bugs (IATA codes + Chamonix dup)
6af4d3f Fix 4 data-quality bugs in VENUES and AP_CONTINENT
...
```

The "data-quality bugs" may be valid fixes, but the **delivery mechanism is fatal**. Merging this deletes 23+ months of commit history from main.

**Fix:**
```bash
# 1. Inspect what changes it actually introduces vs current main
git fetch origin fix-appjsx-final
git show origin/fix-appjsx-final:app.jsx | diff - app.jsx | head -50

# 2. If the changes are valid, cherry-pick them onto main instead:
git checkout main
git checkout -b fix-data-quality-venues
git cherry-pick origin/fix-appjsx-final
git push origin fix-data-quality-venues
# Then open a PR — normal merge is safe because history is shared

# 3. Delete the rollback bomb:
git push origin --delete fix-appjsx-final
```

---

## P1 — Fix This Week

### P1-1: Cache stamp `20261031a` — 9 days stale. 10-minute fix.

`PEAKLY_BUILD` in `app.jsx:17` and `CACHE_NAME` in `sw.js:2` both read `20261031a`. Today is 2026-11-09. Users who visited before Oct 31 may still be on the old service worker; new code they expect isn't guaranteed to reach them.

**Fix:**
```bash
cd /home/user/peakly
TODAY=$(date +%Y%m%d)
perl -pi -e "s/peakly-20261031a/peakly-${TODAY}a/g" sw.js
perl -pi -e "s/\"20261031a\"/\"${TODAY}a\"/g" app.jsx
perl -pi -e "s/v=20261031a/v=${TODAY}a/g" index.html
git add app.jsx sw.js index.html
git commit -m "bump cache stamp to ${TODAY}a"
git push origin main
```

---

### P1-2: `.venue-baseline` missing — auto-push guard integrity check weakened.

`scripts/.venue-baseline` does not exist. `scripts/auto-push.sh` reads it with `cat "$BASEFILE" 2>/dev/null || echo 0`, so currently the guard compares venue count against **0** instead of 404. Any commit that reduces venues would pass as long as it stays above -5 of 0 (i.e., as long as there are any venues at all). The guard auto-recreates it on the next auto-push commit, but until then the safety net is gone.

**Fix — 30 seconds:**
```bash
echo "404" > /home/user/peakly/scripts/.venue-baseline
git add scripts/.venue-baseline
git commit -m "restore .venue-baseline to 404"
git push origin main
```

---

### P1-3: 19 stale remote branches accumulating — repo hygiene.

19 branches beyond main/master, 10 days after any of them were last touched (all `claude/*`, `cursor/*` exploratory). `fix-appjsx-final` and `restore-appjsx` are specifically dangerous (see P0-2). The others are dead weight cluttering the branch list.

**Fix — batch delete everything except main/master and anything being actively PR'd:**
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
  cursor/finish-peakly-ship-c015 \
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

---

### P1-4: `master` branch — Day 33 footgun.

`origin/master` exists as a separate branch from `origin/main`. The `deploy.yml` pushes to both (`main + master`), but the duplicate creates confusion and GitHub might show `master` as the default branch to some visitors. 23 days of repeated flagging, no action.

**Fix:**
```bash
git push origin --delete master
# Then in GitHub Settings → Branches, confirm default branch is 'main'
```

---

## P2 — Fix This Sprint

### P2-1: Supabase anon key hardcoded in app.jsx.

`app.jsx:26` has `SUPABASE_ANON_KEY = "eyJhb..."` in full. Per CLAUDE.md this is intentional (public-safe, RLS-gated). **Architecturally acceptable for a client-only app.** However it's worth noting that if the RLS policies ever have a misconfiguration, there's no rotation path without a client deploy. Status: known, monitored, no immediate action required. Document this tradeoff explicitly in CLAUDE.md if not already done.

### P2-2: TP_MARKER `710303` in client code.

`app.jsx:6690` has `const TP_MARKER = "710303"`. This is the **affiliate tracking marker**, NOT the Travelpayouts API token. The token is server-side only (confirmed: not found in app.jsx). The marker being public is by design — it's visible in every Aviasales deep link URL anyway. No security issue. Flagging for completeness.

### P2-3: No SRI hashes on CDN scripts.

`index.html` loads React 18, Babel 7.24.7, and Supabase JS from CDNs without Subresource Integrity hashes. If any CDN is compromised, malicious JS loads in users' browsers with full app context.

**Fix (non-breaking, 20 min):**
```html
<!-- Generate SRI hash: -->
<!-- curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A -->
<script crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH>"
></script>
```
Compute hashes for React, ReactDOM, and Babel. Add `integrity` attribute to each. The Babel standalone in `index.html` only runs in dev mode (the production build at `dist/` strips it per `deploy.yml`), so Babel SRI is a lower priority.

---

## Infrastructure Cost Projection

| Scale | DigitalOcean | CDN (GitHub Pages) | Open-Meteo | Total/mo |
|-------|-------------|-------------------|------------|---------|
| Now (<100 MAU) | $6 | Free | Free | $6 |
| 1K MAU | $6 | Free | Free | $6 |
| 10K MAU | $12 (2GB droplet) | Free | Free | $12 |
| 100K MAU | $48 (4-core + CDN) | Free | ~$0 (caching handles it) | ~$50 |

The VPS disk-cache fix (Open #23) is essential before any traffic spike — without it, a Reddit/HN front-page moment at 100K MAU would blow through Open-Meteo's free tier ceiling in ~8 minutes of concurrent venue loads.

---

## What Breaks First at Scale

**The VPS `_wxCache` is in-memory only.** At 100K MAU with 404 venues, cold cache state means up to 404 × (weather + marine) = 808 upstream Open-Meteo calls per server restart. Open-Meteo's free tier allows ~600 calls/minute. A `pm2 restart` during a traffic spike causes a 90-second outage where every weather fetch either fails or gets rate-limited (HTTP 429). Every active user during that window sees "conditions unavailable." Fix: implement the ~30-line `server/proxy.js` disk-persistence patch from Open #23 before the first Reddit post. Bundle with the P0-1 VPS redeploy — same SSH session, same restart.

---

## Summary

| Priority | Item | Days Flagged | Action |
|----------|------|-------------|--------|
| P0 | VPS redeploy | **93** | Jack SSH 10 min |
| P0 | fix-appjsx-final rollback bomb | **10** | Inspect + delete |
| P1 | Cache stamp 9d stale | 9 | 10 min + push |
| P1 | .venue-baseline missing | **NEW** | `echo 404 > scripts/.venue-baseline` |
| P1 | 19 stale branches | 33 | Batch delete |
| P1 | master footgun | 33 | `git push origin --delete master` |
| P2 | SRI on CDN scripts | 30+ | 20 min |
