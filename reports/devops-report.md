# DevOps Report — 2026-11-17 (RED)

**Status: 🔴 RED — VPS Day 101. Cache stamp 17 days stale. App Review MISSED +3 days (Whistler opens in 5 days — CRITICAL WINDOW). `master` footgun Day 41. `fix-appjsx-final` rollback bomb Day 18. 20 stale branches (+1 new). 17 days no code commits.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress confirmed blocked). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 16)

| Item | Nov 16 | Nov 17 (today) |
|------|--------|----------------|
| VPS status | Day 100 | 🚨 **Day 101 — still undeployed** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (16d) | 🚨 **`20261031a` — 17 days stale** |
| App Review hard stop | MISSED +2 days | 🚨 **MISSED +3 days — Whistler in 5d (Nov 22)** |
| `fix-appjsx-final` | Rollback bomb Day 17 | **Day 18** |
| `master` footgun | Day 40 | **Day 41** |
| New app.jsx commits | 0 (28d) | **0 — 17 days no code commits (last: 2026-10-31)** |
| Venue count | 406 (drift flagged) | ✅ **404 — FALSE ALARM CLEARED (Content Nov 16 confirmed 2 comment lats, not venues)** |
| `.venue-baseline` | ⚠️ 404 vs 406 drift | ✅ **404 matches eval — drift false alarm cleared** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| lateSeason count | ⚠️ 10 (grep undercounts) | ✅ **15 confirmed (10 unquoted + 5 JSON-quoted = 15 total)** |
| Remote branches | 19 stale | 🚨 **20 stale (+1 new since yesterday)** |
| Plausible analytics | ✅ present | ✅ present, uncommented |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ in app.jsx | ⚠️ same — `710303` affiliate marker only, not a secret |
| Supabase anon key | ✅ public-safe (RLS-gated) | ✅ RLS-gated per design |
| Image lazy loading | ✅ | ✅ 9/9 `<img>` tags use `loading="lazy"` |
| .gitignore | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |
| GEAR_ITEMS | ✅ removed | ✅ 0 — Amazon cut holds |
| `CLOUD_SHARE_ENABLED` | ✅ false | ✅ false |
| app.jsx size | 14,256 lines / 760 KB | ✅ **14,256 lines / 760 KB — unchanged** |

---

## Closures From Yesterday

- ✅ **Venue count drift CLOSED** — Content report Nov 16 confirmed the eval "406" count was a false alarm caused by 2 coordinate values appearing in `// lat:` comment lines inside `AP_CONTINENT`. `.venue-baseline` = 404, eval = 404, everything aligned. No drift.
- ✅ **lateSeason confusion CLOSED** — `grep -c "lateSeason:true"` returns 10 because 5 entries use quoted JSON keys (`"lateSeason": true`). Both checks combined = **15**, which matches the CLAUDE.md authoritative count. Use the node eval method for future counts.

---

## NEW: Branch Count at 20 — One New Branch Since Yesterday

19 → 20 stale non-main branches. A new `claude/*` branch appeared overnight (agent session). The pattern flagged by PM v213 continues — sessions are creating branches without merging or cleaning up. The rollback bombs (`fix-appjsx-final`, `restore-appjsx`) are on Day 18 and Day 18. No merge has happened to any stale branch in 18+ days.

---

## P0 — Fix Today

### P0-1: App Review MISSED +3 days — Whistler opens in 5 days. Reply NOW.

Submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e` (Guideline 2.1) has been waiting for Jack's reply since before Nov 14. It is now Nov 17 — 3 days past the Nov 14 hard stop. Whistler opens **Nov 22 (5 days from today)** — the first significant ski-traffic event of the season. If Apple auto-rejects before then, there is no path to live iOS before Whistler.

**This is a 10-minute action. Jack only. Do it now.**
```
1. App Store Connect → App Review → submission 468d466e-ab22-4db5-bc51-d897a9bcfb8e
2. Paste the prepared reply block from docs/APP_REVIEW_NOTES.md → "Paste this"
3. Attach screen recording per the shot list in docs/APP_REVIEW_NOTES.md
4. Hit Submit Reply
```

Time remaining before Whistler traffic: **5 days**. Apple's typical review turnaround after a reply: 24-72 hours. The math is tight. Every hour of delay is real risk.

---

### P0-2: VPS Day 101 — redeploy before Whistler (5 days)

Same finding, day 101. `server/proxy.js` changes committed 2026-08-11 have never landed in production. Whistler opens in 5 days. Without this:
- Two-weekend scoring stays off (proxy serves 7-day data, second weekend scores are blank)
- iOS native CORS blocked — native app can't reach proxy at all
- Alert deletion fails silently — `DELETE` not in `Access-Control-Allow-Methods`
- Rate limiter forgeable — reads first X-Forwarded-For instead of last

**Action: Jack SSH, ~10 minutes.**
```bash
ssh root@198.199.80.21
curl -sSL https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js \
  -o /opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
sleep 5
curl https://peakly-api.duckdns.org/health
# Expected: {"status":"ok","uptime":<seconds>,"apns":"configured" or "unconfigured","wx_cache_size":0}
```

If `pm2 restart` fails:
```bash
pm2 logs peakly-proxy --lines 50
# If pm2 not in PATH: $(npm root -g)/.bin/pm2 restart peakly-proxy
```

---

## P1 — Fix This Week

### P1-1: Cache stamp 17 days stale — bump before Whistler traffic

`PEAKLY_BUILD = "20261031a"` and `CACHE_NAME = "peakly-20261031a"` — Halloween. Users who visited on Oct 31 are still served from a cached service worker. Any code changes that land between now and Whistler (5 days) won't reach them. With ski-season traffic incoming, this needs to be bumped.

**Exact fix — 3 files in lockstep:**
```bash
# In peakly/:
TODAY=$(date +%Y%m%d)
NEW_STAMP="${TODAY}a"

perl -pi -e "s/const PEAKLY_BUILD = \"[^\"]+\"/const PEAKLY_BUILD = \"${NEW_STAMP}\"/" app.jsx
perl -pi -e "s/const CACHE_NAME = \"peakly-[^\"]+\"/const CACHE_NAME = \"peakly-${NEW_STAMP}\"/" sw.js

# Verify lockstep:
grep "PEAKLY_BUILD" app.jsx | head -1
grep "CACHE_NAME" sw.js | head -1

git add app.jsx sw.js
git commit -m "auto: bump cache stamp ${NEW_STAMP}"
git push origin main
```

### P1-2: 20 stale remote branches — delete them (Whistler rollback risk)

20 stale branches including two **rollback bombs** (`fix-appjsx-final`, `restore-appjsx`) that contain "restore app.jsx" commits. If anyone merges them accidentally — including an AI session that misreads branch state — the current 14,256-line app.jsx gets overwritten with an older version. 18 days on the board.

**Fix: 5 minutes. Jack only.**
```bash
# Preview what gets deleted:
git branch -r | grep -v "origin/main\|origin/HEAD"

# Delete all claude/* branches:
git branch -r | grep "origin/claude/" | sed 's|origin/||' \
  | xargs -I{} git push origin --delete {}

# Delete rollback bombs and misc stale branches:
git push origin --delete fix-appjsx-final restore-appjsx test-small
git push origin --delete cursor/finish-peakly-ship-c015
# Keep master deletion for P2-1 (coordinate with deploy.yml change)
```

---

## P2 — Fix This Sprint

### P2-1: `master` branch footgun — Day 41

`origin/master` points to May 2026 (`b6dc033`), 41+ commits behind `origin/main`. `deploy.yml` deploys on push to `main + master`. A push to master triggers a deploy from a 6-month-old checkout. With new sessions creating branches (20 stale now), the chance of a fat-finger increases daily.

**Fix:**
```bash
# Tag for history:
git tag archive/master-20261117 origin/master
git push origin archive/master-20261117
git push origin --delete master
```

Then in `.github/workflows/deploy.yml` remove `master` from triggers:
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

### P2-2: Supabase delete-account SQL still not deployed

`server/sql/delete-account.sql` was committed in June for App Store Guideline 5.1.1(v). The client ships a graceful fallback ("email us") until the SQL is pasted into Supabase. This is a manual Jack action — paste into the Supabase SQL editor at `wsoqcfwkvvemtlddcgfc.supabase.co`. ~2 minutes. Needed before the iOS app can go live.

---

## Security Summary

| Check | Status |
|-------|--------|
| Travelpayouts API token (server-side only) | ✅ Token via `process.env.TRAVELPAYOUTS_TOKEN` on VPS; `TP_MARKER = "710303"` in client is a public affiliate marker, not a secret |
| Supabase anon key | ✅ Public-safe per Supabase design — RLS enforces auth, anon key intentionally exposed |
| `.gitignore` coverage | ✅ Covers `.env`, `.p8`, `.pem`, `.key`, `.p12`, `.mobileprovision` |
| Recent commits (last 5) | ✅ Reports only — no code changes, no secrets |
| Plausible analytics | ✅ Present, uncommented, correct domain (`j1mmychu.github.io/peakly`) |
| Sentry DSN | ✅ Live and initialized |
| `CLOUD_SHARE_ENABLED` | ✅ `false` — no user-generated public content |
| HTTP proxy endpoint | ✅ `peakly-api.duckdns.org` is HTTPS |
| GEAR_ITEMS | ✅ 0 — Amazon cut holds, no affiliate leak |

---

## Performance Summary

| Metric | Value |
|--------|-------|
| `app.jsx` | 14,256 lines / 760 KB source / 439 KB minified (esbuild, production) |
| React 18 UMD (cdnjs) | 143 KB gzipped |
| Babel Standalone | 7.24.7 — present in root `index.html`, **stripped from `dist/index.html`** (production path is clean) |
| Supabase JS (lazy) | ~80 KB gzipped — only loads on sign-in |
| Images | ✅ All 9 `<img>` tags use `loading="lazy"` |
| **Total cold-start JS (production)** | ~602 KB (React 143 + app.min 439 + Sentry ~20) |

**Biggest bottleneck:** 406-venue weather fetch on cold start. The VPS proxy cache (P0-2) is the structural fix — once deployed, it absorbs all duplicate coord requests within 2 hours, moving the Open-Meteo rate ceiling from ~13 DAU cold-starters to essentially infinite at current scale.

---

## Cost Projections

| Scale | DO ($6 droplet) | Supabase | CDN/Other | Total |
|-------|-----------------|----------|-----------|-------|
| Current (<100 MAU) | $6/mo | Free tier | $0 | **$6/mo** |
| 1K MAU | $6/mo | Free tier | $0 | **$6/mo** |
| 10K MAU | $6/mo | Pro $25/mo | $0 | **$31/mo** |
| 100K MAU | $24/mo (4GB or LB) | Pro $25/mo | $50/mo CDN | **~$99/mo** |

---

## What Breaks First at Scale

**Open-Meteo free tier ceiling at ~13 DAU cold-starters.**

Each new user on a cold cache fires up to 812 Open-Meteo requests (406 venues × weather + marine). Open-Meteo's free tier is 10,000 calls/day. That's 10,000 / 812 = **12.3 unique cold-start users per day** before rate limiting hits. After that, weather fetches fail silently — scores fall back to 50 for every venue, the grid looks fine but every score is wrong. The VPS proxy weather cache (P0-2) is the fix. Without it, any Reddit/HN post drives immediate rate limiting. This finding is 180+ days old and unblocked only by the VPS redeploy.

---

*Report generated: 2026-11-17 14:10 UTC by peakly-devops routine.*
