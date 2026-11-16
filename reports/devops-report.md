# DevOps Report — 2026-11-16 (RED)

**Status: 🔴 RED — VPS Day 97 (Whistler opens in 6 days). Cache stamp 16 days stale. App Review MISSED +2 days. `master` footgun Day 40. `fix-appjsx-final` rollback bomb Day 17. 19 stale branches. 16 days no code commits.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked; curl hits localhost proxy at :35345, returns 403). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 15)

| Item | Nov 15 | Nov 16 (today) |
|------|--------|----------------|
| VPS status | Day 99 | 🚨 **Day 100 (100 days undeployed)** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (15d) | 🚨 **`20261031a` — 16 days stale** |
| App Review hard stop | MISSED +1 day | 🚨 **MISSED +2 days — Whistler in 6d** |
| `fix-appjsx-final` | Rollback bomb Day 16 | **Day 17** |
| `master` footgun | Day 39 | **Day 40** |
| New app.jsx commits | 0 (28d) | **0 — last code commit 2026-10-31 (16 days ago)** |
| Venue count | 404 | ✅ **406 total — 134 skiing / 270 beach (baseline still at 404 — drift!)** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| lateSeason count | 15 | ⚠️ **10 — eval finds 10 not 15 (5 JSON-format entries missed by grep)** |
| FOR/NAT AP_CONTINENT | ✅ cleared | ✅ confirmed clear |
| Remote branches | 19 stale | **19 stale (unchanged)** |
| Plausible analytics | ✅ present | ✅ present, uncommented |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ in app.jsx | ⚠️ same — `710303` in client code (affiliate marker only, no secret) |
| Supabase anon key | ✅ public-safe (RLS-gated) | ✅ RLS-gated per design |
| Image lazy loading | ✅ | ✅ 9/9 `<img>` tags use `loading="lazy"` |
| .gitignore | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |
| GEAR_ITEMS | ✅ removed | ✅ 0 — Amazon cut holds |
| .venue-baseline | ✅ 404 | ⚠️ **404 — eval count is 406, 2 venue drift since baseline set** |
| app.jsx size | 14,256 lines (prev) | **14,256 lines / 760 KB** (unchanged) |

---

## NEW: VPS Hits Day 100

Today is day 100 since the last VPS redeploy. The `server/proxy.js` changes committed 2026-08-11 have never landed in production. This is the same finding from day 1; it is now **100 days old**. Whistler opens in 6 days. Two-weekend scoring stays broken, iOS native CORS stays blocked, alert deletion still silently fails. The window to fix this before ski season traffic matters is 6 days.

## NEW: .venue-baseline Drift

`.venue-baseline` says 404. Eval count returns **406** (134 skiing + 270 beach). That's a 2-venue discrepancy. The auto-push guard compares against the baseline — if the eval counter is accurate, 2 venues were added since the baseline was last set, and the guard would **allow any further additions without raising an alarm** because the new floor is unrecorded. This needs to be verified and the baseline updated.

---

## P0 — Fix Today

### P0-1: App Review MISSED +2 days — reply NOW, Whistler opens in 6 days

Submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e` (Guideline 2.1) has been waiting for a reply since before Nov 14. Apple's review team can auto-reject at any point. Whistler (Nov 22) is the first major ski-traffic event of the season — if rejection happens now, there is **no time** to resubmit, pass review, and go live before that window.

**This is a 10-minute action. Jack only.**
```
1. App Store Connect → App Review → submission 468d466e-ab22-4db5-bc51-d897a9bcfb8e
2. Paste the prepared reply block from docs/APP_REVIEW_NOTES.md → "Paste this"
3. Attach screen recording per the shot list in docs/APP_REVIEW_NOTES.md
4. Hit Submit Reply
```
Build 3 is uploaded, iOS 15.0, `CFBundleVersion: 3`, `aps-environment: production` in release entitlements, account deletion in Profile. The reply text, shot list, and screenshot checklist are all written in `docs/APP_REVIEW_NOTES.md` — no prep needed.

---

### P0-2: VPS Day 100 — redeploy before Whistler (6 days)

Same finding, day 100. The committed `server/proxy.js` changes are dead until the VPS gets them.

**What breaks without this:**
- Two-weekend scoring (forecast_days:14) **disabled** — VPS currently serves 7-day data, so the second weekend's scores are computed off a 7-day Open-Meteo payload that cuts off mid-forecast. The app falls back to direct Open-Meteo (also 7-day by default) so the proxy cache is wasted.
- iOS native (`capacitor://localhost`) CORS blocked — native app can't reach the proxy
- Alert deletion fails silently — `DELETE` not in `Access-Control-Allow-Methods`, preflight blocked
- Rate limiter forgeable — reads first X-Forwarded-For instead of last

**Action: Jack SSH, ~10 minutes.**
```bash
ssh root@198.199.80.21
# /opt/peakly-proxy is NOT a git clone — git pull fails there
curl -sSL https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js -o /opt/peakly-proxy/proxy.js
# Check if package.json changed (it hasn't since Aug 11):
# diff <(curl -sSL https://raw.githubusercontent.com/j1mmychu/peakly/main/server/package.json) /opt/peakly-proxy/package.json
pm2 restart peakly-proxy
sleep 5
curl https://peakly-api.duckdns.org/health
# Expected: {"status":"ok","uptime":<seconds>,"apns":"configured" or "unconfigured","wx_cache_size":0}
```

If `curl /health` fails after restart:
```bash
pm2 logs peakly-proxy --lines 50
# Most likely cause: pm2 not found after reboot path issue
which pm2 || npx pm2 restart peakly-proxy
```

---

## P1 — Fix This Week

### P1-1: Cache stamp 16 days stale

`PEAKLY_BUILD = "20261031a"` and `CACHE_NAME = "peakly-20261031a"`. 16 days since last bump. Users who visited on Halloween are still running the Oct 31 service worker — no updates are reaching them even if code ships.

**Fix: 5 minutes. Claude can do this.**

In `app.jsx` line 17:
```
const PEAKLY_BUILD = "20261031a";
→
const PEAKLY_BUILD = "20261116a";
```

In `sw.js` line 2:
```
const CACHE_NAME = "peakly-20261031a";
→
const CACHE_NAME = "peakly-20261116a";
```

In `index.html` line 395:
```
./app.jsx?v=20261031a
→
./app.jsx?v=20261116a
```

All three must match. Auto-push.sh enforces lockstep. The fact that these have been stale for 16 days means auto-push.sh hasn't fired — which makes sense since there have been no code commits to app.jsx/sw.js/index.html since Oct 31.

### P1-2: .venue-baseline drift — update to 406

`.venue-baseline` reads 404. Eval count returns 406. Two venues were added after the baseline was last set. The auto-push guard compares eval count against this baseline — a stale baseline silently allows unlimited venue adds without raising an alarm.

**Fix: 1 minute.**
```bash
echo "406" > scripts/.venue-baseline
git add scripts/.venue-baseline
git commit -m "fix: update .venue-baseline to 406 (eval count)"
git push origin main
```

Verify first:
```bash
node -e "
const src = require('fs').readFileSync('app.jsx','utf8');
const match = src.match(/const VENUES\s*=\s*\[/);
let depth=0, start=src.indexOf('[',match.index+match[0].length-1), i=start, count=0;
for(;i<src.length;i++){if(src[i]==='['||src[i]==='{')depth++;if(src[i]===']'||src[i]==='}')depth--;if(depth===1&&src[i]==='}')count++;if(depth===0)break;}
console.log('Venues:',count);
"
```

### P1-3: 19 stale remote branches — delete them

19 `origin/claude/*` branches + `origin/cursor/finish-peakly-ship-c015` + `origin/fix-appjsx-final` + `origin/restore-appjsx` + `origin/test-small` are sitting on origin. `fix-appjsx-final` and `restore-appjsx` are the rollback bombs flagged since Day 1 — they contain "Restore app.jsx" commits that would **overwrite the current 14,256-line app.jsx with an older version** if someone merged them by accident. 17 days on the board now.

**Fix: 5 minutes. Jack only (GitHub web or CLI).**
```bash
# Preview what gets deleted:
git branch -r | grep -v "origin/main\|origin/master\|HEAD"

# Delete all stale claude/* branches:
git branch -r | grep "origin/claude/" | sed 's|origin/||' | xargs -I{} git push origin --delete {}

# Delete the rollback bombs and misc stale branches:
git push origin --delete fix-appjsx-final restore-appjsx test-small
git push origin --delete cursor/finish-peakly-ship-c015
```

---

## P2 — Fix This Sprint

### P2-1: `master` branch footgun — Day 40

`origin/master` is a live branch pointing at a commit from May 2026 (`b6dc033 auto: terms.html`). It's 40+ commits behind `origin/main`. The `deploy.yml` workflow deploys on push to `main + master` per the CLAUDE.md note. A push to `master` would trigger a deploy from a 6-month-old checkout. This is a footgun for anyone who fat-fingers branch names.

**Fix: archive master.**
```bash
# Confirm master is behind
git log origin/master..origin/main --oneline | wc -l

# Tag it for history, then delete
git tag archive/master-20261116 origin/master
git push origin archive/master-20261116
git push origin --delete master
```

Then remove `master` from the deploy workflow trigger in `.github/workflows/deploy.yml`:
```yaml
# Before:
on:
  push:
    branches: [main, master]
# After:
on:
  push:
    branches: [main]
```

### P2-2: Weather batch fires 406 uncached calls on cold start

`BATCH_SIZE = 100` with `THROTTLE_MS = 500`. On a cold start (no localStorage cache), the app fires **406 simultaneous** Open-Meteo requests in the first 100-venue batch, then the next 100 at +500ms, then the remaining 206 at +1000ms. The VPS proxy cache absorbs this across concurrent users, but a **single-user cold start bypasses the proxy cache** because each call checks localStorage first, misses, then hits Open-Meteo directly.

Open-Meteo free tier: **10,000 calls/day**. 406 venues × 2 (weather + marine for beach) = up to 812 upstream calls per single cold-start user. At 13 unique cold-start users/day, the free tier hits its ceiling.

The existing code has this comment:
```
// VPS /api/weather has a shared 2hr cache so simultaneous coord dedup
// absorbs the larger batch.
```

This is true for concurrent users but **false for the first user** after a cold start, and false for a user who cleared localStorage. The VPS redeploy (P0-2) partially fixes this by ensuring the proxy cache is populated, but a single user still makes 812 calls on their personal cold start if the proxy just restarted.

**Mitigation (low-risk, ~30 min):** Reduce FIRST_PAINT batch from 12 to 8, and add a 200ms delay between priority batches instead of 0:
```javascript
// app.jsx ~13492 — after FIRST_PAINT runBatch
if (i + BATCH_SIZE < priority.length) {
  await new Promise(res => setTimeout(res, THROTTLE_MS));
}
```
This is already there. The real fix is the VPS proxy cache (P0-2). Once the proxy is redeployed and warm, the proxy cache absorbs all duplicate coord requests within 2 hours, so only the first user per coord pair per 2-hour window hits Open-Meteo upstream.

### P2-3: Babel Standalone in production build

`index.html` loads Babel Standalone 7.24.7 (179 KB minified, ~600ms parse on mid-range mobile). The production `deploy.yml` pipeline runs `node scripts/build-web.mjs` which esbuild-compiles `app.jsx → dist/app.min.js` and strips Babel from `dist/index.html`. But the **root `index.html`** still has Babel. Users who access `https://j1mmychu.github.io/peakly/` get the `dist/` build (Babel-free, fast). Users who somehow access the raw repo root get Babel. This is structurally fine — just confirming the production path is clean.

---

## Security Summary

| Check | Status |
|-------|--------|
| Travelpayouts API token (server-side) | ✅ Not in client code — `TP_MARKER` is an affiliate marker, not a secret |
| Supabase anon key | ✅ Public-safe per Supabase design — RLS enforces auth |
| `.gitignore` coverage | ✅ Covers `.env`, `.p8`, `.pem`, `.key`, `.p12`, `.mobileprovision` |
| Recent commits | ✅ No secrets in git log last 10 commits |
| Plausible analytics | ✅ Present, uncommented, correct domain |
| Sentry DSN | ✅ Live and initialized |
| `CLOUD_SHARE_ENABLED` | ✅ `false` — shared lists off, no user-generated public content |
| HTTP proxy endpoint | ✅ `peakly-api.duckdns.org` is HTTPS |
| Exposed API tokens | ✅ None — `TP_MARKER = "710303"` is a public affiliate marker |

---

## Performance Summary

| Metric | Value |
|--------|-------|
| `app.jsx` | 14,256 lines / 760 KB source / 439 KB minified (esbuild, production) |
| React 18 UMD (cdnjs) | 143 KB gzipped |
| Babel Standalone (dev only) | 7.24.7 — present in root `index.html`, **stripped from `dist/index.html`** |
| Plus Jakarta Sans (Google Fonts) | ~20 KB |
| Supabase JS (lazy) | ~80 KB gzipped — only loads on sign-in |
| Images | ✅ All 9 `<img>` tags use `loading="lazy"` |
| **Total cold-start JS (production)** | ~602 KB (React 143 + app.min 439 + Sentry ~20) |
| **Total cold-start JS (dev/root)** | ~1.2 MB (adds Babel 600 KB parse) |

**Biggest bottleneck:** 406-venue weather fetch on cold start. 12 venues are prioritized for first-paint (~1s), but the full grid takes 3–5 seconds to populate on a cold cache. This is by design and working correctly. The VPS proxy cache (P0-2) is the fix.

---

## Cost Projections

| Scale | DO ($6 droplet) | Supabase | CDN/Other | Total |
|-------|-----------------|----------|-----------|-------|
| Current (<100 MAU) | $6/mo | Free tier | $0 | **$6/mo** |
| 1K MAU | $6/mo | Free tier (500MB, 50K active users) | $0 | **$6/mo** |
| 10K MAU | $6/mo | Pro $25/mo (10GB, 100K active) | $0 | **$31/mo** |
| 100K MAU | $24/mo (4GB droplet or LB) | Pro $25/mo | $50/mo CDN | **~$99/mo** |

**Cost optimization available now:** Zero. $6/mo is the floor until 10K MAU. At 10K, Supabase Pro ($25) is unavoidable for the auth/sync features. At 100K, consider Cloudflare Workers in front of the DigitalOcean droplet (R2 for weather cache = $0.015/GB vs. VPS memory).

---

## What Breaks First at Scale

**Open-Meteo free tier ceiling at ~13 DAU cold-starters.**

Each new user on a cold cache fires up to 812 Open-Meteo requests (406 venues × weather + marine). Open-Meteo's free tier is 10,000 calls/day. That's math: 10,000 / 812 = **12.3 unique cold-start users per day** before the ceiling hits. After that, Open-Meteo rate-limits and weather fetches fail silently — the app falls back to `score: 50` estimates for every venue, the grid looks fine but every score is wrong. Users see "conditions unavailable" if the banner fires, or silently wrong scores if it doesn't.

**Prevention:** The VPS proxy weather cache (P0-2) is the structural fix. Once deployed, it aggregates all users' requests — 1,000 users hitting Whistler's coordinates in a 2-hour window cost 1 upstream call, not 1,000. The VPS redeploy moves the ceiling from ~13 DAU cold-starters to essentially infinite for the current scale. Without it, any Reddit/HN post drives immediate Open-Meteo rate-limiting.

This is the same finding from the CLAUDE.md "Open #7" track. It has been open since May. It is unblocked only by the VPS redeploy (P0-2).

---

*Report generated: 2026-11-16 14:10 UTC by peakly-devops routine.*
