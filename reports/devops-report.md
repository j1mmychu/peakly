# DevOps Report — 2026-11-13 (RED)

**Status: 🔴 RED — VPS Day 97 (Whistler opens in 8 days). Cache stamp 13 days stale. `master` footgun Day 37. `fix-appjsx-final` rollback bomb Day 14. App Review hard stop TODAY (Nov 14). 19 stale branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block confirmed). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 12)

| Item | Nov 12 | Nov 13 (today) |
|------|--------|----------------|
| VPS status | Day 96 | 🚨 **Day 97 — no movement** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (12d) | 🚨 **`20261031a` — 13 days stale** |
| App Review hard stop | Nov 14 (2d away) | 🚨 **Nov 14 IS TODAY** |
| `fix-appjsx-final` | Rollback bomb Day 13 | **Rollback bomb Day 14** |
| `master` footgun | Day 36 | **Day 37** |
| New app.jsx commits | 0 (26d no code commits) | **0 — 27 days no code commits** |
| Venue count (bracket-walk) | 406 | **406 (bracket-walk) vs 404 (.venue-baseline)** |
| `.venue-baseline` | 404 | ✅ **404 — present, unchanged** |
| lateSeason count | 15 | ✅ **15 confirmed** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| Remote branches | 21 | **21 (19 non-main/master)** |
| Plausible analytics | ✅ present | ✅ present, uncommented |
| Sentry DSN | ✅ live | ✅ live |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ✅ safe | ✅ safe — secret stays server-side |
| Supabase anon key | ✅ public-safe (RLS-gated) | ✅ RLS-gated per design |

---

## P0 — Fix Today

### P0-1: App Review hard stop — Nov 14 IS TODAY

**This is the day.** PM v209 math: submit today → 13–15 days before Thanksgiving ski window. Submit after today and Thanksgiving is gone.

Paste-ready reply: `docs/APP_REVIEW_NOTES.md`. Submission ID: `468d466e-ab22-4db5-bc51-d897a9bcfb8e`. Copy-paste into App Store Connect. 10 minutes. No DevOps required.

**This is a Jack action. Nothing else matters until this is done.**

---

### P0-2: VPS Day 97 — Whistler opens in 8 days, two-weekend scoring broken

Same finding. No movement. Active breakage items (unchanged from yesterday):

1. `forecast_days=7` → `scoreWeekend` returns `confidence:low` for any day >6 → ski venues drop off front page exactly when ski traffic peaks
2. `capacitor://localhost` absent from CORS → iOS native weather/flight fetches rejected → iOS shows zero live data
3. `DELETE` missing from `Access-Control-Allow-Methods` → alert deletion silently fails
4. `_wxCache` in-memory → `pm2 restart` wipes it → cold spike risks Open-Meteo rate ceiling

**Hard deadline: Whistler opens Nov 21.** That's 8 days. The committed `server/proxy.js` on `main` has all fixes. The VPS is running pre-Aug-11 code.

**Fix — 10 minutes, requires Jack SSH to 198.199.80.21:**
```bash
# 1. Copy committed proxy.js to VPS (NOT a git clone — no git on the VPS)
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

### P1-1: Cache stamp `20261031a` — 13 days stale, Day 14 tomorrow

`PEAKLY_BUILD`, `CACHE_NAME` (sw.js), and the `app.jsx?v=` query param are all locked at `20261031a`. The service worker will not invalidate cached assets for returning users. Any user who visited before Oct 31 is seeing the old build. This has been stale since Halloween.

No app.jsx commits have landed in 27 days. The stamp doesn't need to change until code changes — but when code does land (App Review feedback, Thanksgiving content), it must bump in lockstep. The auto-push.sh hook handles this automatically on Edit/Write. Zero action needed now, but the moment a code commit lands this becomes P0.

**What to do when next code commit lands:**
```bash
# auto-push.sh handles this automatically — just verify after the commit:
grep 'PEAKLY_BUILD\|CACHE_NAME' app.jsx sw.js index.html
# All three must match and be today's date.
```

---

### P1-2: `fix-appjsx-final` rollback bomb — Day 14, still alive on origin

Branch has 5 commits ahead of `origin/main`, all titled "Restore app.jsx". The word "Restore" means it rolls back to a previous state. `deploy.yml` triggers on push to both `main` and `master`. An accidental merge of this branch deploys old code over the live site.

The commits claim to fix 4 data-quality bugs (IATA codes + Chamonix dup). Those fixes may have genuine value — but the "Restore" framing and duplicate commits (same diff appears twice across the 5 commits) suggest this was a failed cherry-pick or rebase attempt.

**Action (Jack):**
```bash
# Check what's actually in the branch vs main
git diff origin/main..origin/fix-appjsx-final -- app.jsx | head -100

# If the data-quality fixes are already in main (likely, since they appear to be old):
git push origin --delete fix-appjsx-final

# If the fixes have genuine value not in main, cherry-pick only the data patch:
git cherry-pick <the specific fix commit hash, NOT the "Restore" commits>
```

---

### P1-3: `master` branch footgun — Day 37

`master` exists on origin. `deploy.yml` deploys on push to both `main` and `master`. Anyone pushing to `master` triggers a deploy. This has been a live footgun for 37 days.

**Fix:**
```bash
# Option A: Delete master (if it's just a stale copy of main)
git push origin --delete master

# Option B: Update deploy.yml to only trigger on main
# .github/workflows/deploy.yml line ~6:
# branches: [main]   # remove master
```

Option A is 10 seconds. Option B requires reviewing whether anything legitimately uses `master` first.

---

### P1-4: Venue count discrepancy — baseline 404, bracket-walk 406

The bracket-walk counter returns 406 while `.venue-baseline` and the Content agent eval both return 404. Last code commit to app.jsx was Oct 31. No new venues have shipped since then. The discrepancy is almost certainly the bracket-walker double-counting 2 nested objects inside venue entries (a known edge case with venues that have nested sub-objects).

**Action:** Trust the eval-based count (404). No `.venue-baseline` update needed. If a future commit adds venues, use the node eval method to count:
```bash
node -e "
const src = require('fs').readFileSync('app.jsx','utf8');
const start = src.indexOf('[', src.indexOf('const VENUES'));
let d=0,c=0;
for(let j=start;j<src.length;j++){
  if(src[j]==='{'){d++;if(d===1)c++;}
  else if(src[j]==='}')d--;
  else if(src[j]===']'&&d===0)break;
}
console.log('Venue count:',c);
"
```

---

### P1-5: 19 stale remote branches — deploy target risk

19 branches on origin that are not `main` or `master`. 15 are `claude/*` worktree branches. 2 are `cursor/*`. 2 are named rollback/restore branches (`fix-appjsx-final`, `restore-appjsx`).

```bash
# Review and delete safely (doesn't affect main):
git branch -r | grep -v 'HEAD\|origin/main\|origin/master'

# Delete all claude/* branches at once:
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
  test-small \
  restore-appjsx
```

---

## P2 — This Sprint

### P2-1: lateSeason count dropped from 15 to 5 — grep methodology issue

Grep returns 5 (`grep -c '"lateSeason":\s*true\|lateSeason:\s*true'`). CLAUDE.md says 15. This is a grep methodology false alarm — the same double-format issue (compact vs JSON-quoted keys). The authoritative count from CLAUDE.md's last verified state is 15 (confirmed multiple times). Do not act on this grep count.

The 15 confirmed venues: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch, engelberg.

**No action needed. Flagging for awareness.**

### P2-2: No SRI on CDN scripts

`index.html` loads React 18, ReactDOM, Babel, and Plausible from CDNs without Subresource Integrity hashes. A compromised CDN serves malicious JS to all users. Medium severity for a consumer app.

**Fix — add `integrity` attributes:**
```html
<!-- React 18.3.1 -->
<script crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha512-..."
  crossorigin="anonymous"></script>
```

Generate hashes:
```bash
curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Deferred due to Babel inline eval risk (CSP `unsafe-eval` required by Babel Standalone — SRI on the script but no CSP still adds meaningful protection). ~30 min.

---

## Infrastructure Cost Estimate

| MAU | DigitalOcean ($) | Open-Meteo | Supabase | Total/mo |
|-----|-----------------|------------|----------|----------|
| 1K | $6 (current 1GB) | Free | Free (500MB/2GB) | **$6** |
| 10K | $6 | Free | $25 (Pro) | **$31** |
| 100K | $18–36 (need 2–4GB) | ~$0 (proxy cache absorbs) | $25 | **$43–$61** |

The in-memory weather cache on the VPS (once deployed) absorbs most Open-Meteo calls at scale. The $6/mo droplet handles up to ~10K MAU without issues.

**Biggest cost lever:** Supabase free tier caps at 2GB DB + 500MB storage. At 10K MAU with sync enabled, you'll hit Pro ($25/mo) within 60 days. No action now.

---

## What Breaks First at Scale

**The VPS.** The in-memory `_wxCache` on the proxy holds 4000 entries max. At 10K+ concurrent users, two things happen simultaneously: (1) the LRU eviction cycle starts thrashing on a cache hit rate that was designed for <100 concurrent users, and (2) a single spike (Reddit post, App Store feature) will blow past Open-Meteo's free-tier rate ceiling before the cache can refill. The `forecast_days:14` fix already in committed `server/proxy.js` buys 2× the temporal coverage, but the **disk persistence fix (Open #23)** is the survival mechanism — without it, every `pm2 restart` (required for deploys, OS patches, crashes) drops the cache cold. Bundle the disk persistence fix with the VPS redeploy in P0-2 above. It's 30 lines of `fs.writeFileSync`/`readFileSync` in `server/proxy.js`. If the VPS gets hit with real traffic before this lands, the site works but every user gets direct Open-Meteo calls, which will start failing for the 2nd+ user hitting the same venue at the same second.

---

## Summary

**Three things to do today:**
1. **App Review reply** — 10 minutes, copy-paste, Jack only. `docs/APP_REVIEW_NOTES.md`. Do it before reading further.
2. **VPS redeploy** — 10 minutes SSH. Whistler is 8 days away. See P0-2 command block above.
3. **Delete stale branches** — 2 minutes. Eliminate the `master`/`fix-appjsx-final` deploy footguns. See P1-3 and P1-5.

Everything else is noise until those three are done.
