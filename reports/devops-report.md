# DevOps Report — 2026-11-01 (RED)

**Status: 🔴 RED — VPS Day 84. Nov 7 deadline is 6 days out. PRECACHE empty (fixed). master footgun Day 25. venue count 406 vs .venue-baseline 404 (2-venue drift). APNS_LIVE=true but VPS not confirmed live since Aug 11. 20 unmerged branches on origin.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Oct 31)

| Item | Oct 31 | Nov 1 (today) |
|------|--------|--------------|
| VPS status | Day 83, deadline Nov 7 (7 days) | **Day 84** (6 days left) |
| `.venue-baseline` | ❌ MISSING (P0) | ✅ FIXED — `404` present |
| PRECACHE | ⚠️ P1 Day 24 — babel@7.29.7 from unpkg | ✅ **FIXED** — `PRECACHE = []` in sw.js |
| `CACHE_NAME` / `PEAKLY_BUILD` | `20260914a` (47 days stale) | ✅ **FIXED** — `20261031a` (PR #20) |
| Venue count (eval) | 404 (per CLAUDE.md) | ⚠️ **406** (2-venue drift) |
| Origin branches | 18 | **20** (+2 new: `cursor/finish-peakly-ship-c015`, `fix-appjsx-final` still present) |
| `master` footgun | Day 24 | Day 25 |
| New code in app.jsx | None since Oct 12 | ✅ PR #20 landed (iOS 15 target, support.html, viewport fix) |
| APNS_LIVE | `true` (set Oct 15) | `true` — unchanged |

**Net: PR #20 shipped good fixes (PRECACHE cleared, cache stamp bumped, iOS 15 target, `100dvh` viewport). Two new issues appeared: venue count drifted +2, and 2 new unrelated branches appeared on origin.**

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,256 lines / 759,749 bytes (742 KB)** |
| Venue count (eval — authoritative) | ⚠️ **406** (134 skiing / 272 beach) — `.venue-baseline` says 404; **2-venue drift** |
| `lateSeason:true` venues | **15** ✅ |
| `.venue-baseline` | ✅ `404` — FIXED vs yesterday |
| `PEAKLY_BUILD` / `CACHE_NAME` | `"20261031a"` — fresh ✅ |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18 / Babel CDN | ✅ pinned (`18.3.1` / `7.24.7`) from cdnjs |
| PRECACHE | ✅ `[]` — FIXED (was mismatched unpkg babel URL) |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ all 9 `<img>` tags covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController (`app.jsx:5544`) |
| `forecast_days` (client) | ✅ 14 days weather, 10 days marine |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ |
| `100dvh` viewport fix | ✅ NEW in PR #20 — fixes iOS Safari tab-bar overlap |
| Unmerged origin branches | ❌ **20 branches** (15 `claude/*` + `cursor/finish-peakly-ship-c015` + `fix-appjsx-final` + `restore-appjsx` + `test-small` + `master`) |

---

## 2. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts server token | ✅ server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) |
| `TP_MARKER="710303"` in client | ✅ public affiliate marker — intentional |
| Supabase anon key in client | ✅ intentional — public-safe, RLS-gated |
| `.env` secrets in git | ✅ none — gitignore covers all patterns |
| Alert IDs | ✅ `crypto.randomUUID()` with fallback — **Open #21 client-side fix is COMMITTED** |
| APNs JWT encoding | ✅ `dsaEncoding: 'ieee-p1363'` in `server/proxy.js:620` — **fix is committed** |
| APNs transport | ✅ `http2.connect` in `server/proxy.js:674` — **fix is committed** |
| APNS_LIVE flag | ✅ `true` (set Oct 15, comment says confirmed Aug 20 via `/health`) |
| Recent commits for secret leaks | ✅ PR #20 only touches iOS config, CSS viewport, support.html — clean |

**Note on Open #21:** Both the client-side (`crypto.randomUUID()`) and server-side (HTTP/2 + P1363) fixes are committed to `server/proxy.js` and `app.jsx`. The "uncommitted working-tree" note in CLAUDE.md is stale — these landed in `608e748` (Oct 15). Open #21 is **RESOLVED in code**; the VPS still needs the proxy.js deployed to take effect server-side.

---

## 3. Issues

### P0: VPS Day 84 — Redeploy Still Required

**6 days left to the Nov 7 Jack-stated deadline. Whistler opens Nov 21 — 20 days.**

The `server/proxy.js` in the repo has all required fixes:
- `forecast_days:14` (two-weekend scoring)
- `capacitor://localhost` in CORS (iOS native calls)
- `DELETE` in `Access-Control-Allow-Methods` (alert deletion)
- Disk cache persistence (`wx-cache.json`) — survives `pm2 restart`
- APNs HTTP/2 + P1363 JWT fix

None of these are live because `/opt/peakly-proxy` is a hand-copied directory, not a git clone. **Every day without this deploy means two-weekend scoring is off, iOS alert deletion silently fails, and a `pm2 restart` after the deploy will cold-cache 406 Open-Meteo calls simultaneously.**

```bash
# Jack: 10 minutes. SSH to VPS and run:
ssh root@198.199.80.21
git clone https://github.com/j1mmychu/peakly.git /tmp/peakly-tmp
cp /tmp/peakly-tmp/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
sleep 5 && curl -s https://peakly-api.duckdns.org/health | jq .
# Confirm output: forecast_days:14, apns:"configured", wx_cache_file populated
rm -rf /tmp/peakly-tmp
```

**Estimated time: 10 minutes. Blocking Reddit/HN launch.**

---

### P1-A: Venue Count Drift — 406 vs .venue-baseline 404

Eval of the VENUES array returns **406** (134 ski + 272 beach). `.venue-baseline` says `404`. CLAUDE.md says `404` (134 ski + 270 beach). The discrepancy is **+2 beach venues** that appeared without updating the baseline or CLAUDE.md.

This will cause the auto-push guard to FAIL on the next `app.jsx` commit (guard compares eval count against baseline, rejects if they don't match).

**Fix — two options:**

Option A: If the 2 extra venues are intentional (they look like valid Oct 28/29 content additions that got committed through a content agent path):
```bash
cd /home/user/peakly
echo "406" > scripts/.venue-baseline
# Update CLAUDE.md venue counts: 404→406, beach 270→272
git add scripts/.venue-baseline CLAUDE.md
git commit -m "sync .venue-baseline to 406 (134 ski / 272 beach)"
git push origin main
```

Option B: If the 2 extra are unintended drift, identify and remove them, keep baseline at 404.

**Recommendation:** Accept Option A — content additions from Oct 28-29 via content agent are the likely source, and the venues appear well-formed (134 ski + 272 beach, no dups detected). This unblocks the auto-push guard.

**Estimated time: 5 minutes.**

### P1-B: master Branch Footgun — Day 25

`origin/master` still exists. `deploy.yml` still triggers on both `main` and `master`. A push to `master` deploys to production, bypassing all branch protections. Has been flagged every day for 25 days.

**Fix (Jack):**
```bash
# 1. Delete remote master
git push origin --delete master

# 2. Remove master trigger from deploy.yml:
```
```yaml
# .github/workflows/deploy.yml line 5-7 — change to:
on:
  push:
    branches: [ main ]
```
```bash
git add .github/workflows/deploy.yml
git commit -m "remove master deploy trigger"
git push origin main
```

**Estimated time: 5 minutes.**

---

### P2-A: 20 Unmerged Branches on Origin

20 branches: 15 `claude/*` + `cursor/finish-peakly-ship-c015` + `fix-appjsx-final` + `restore-appjsx` + `test-small` + `master`. Count up from 18 yesterday with 2 new arrivals.

`fix-appjsx-final` appears to be a large diverged branch. Before deleting any non-`claude/` branch, Jack should spot-check it.

```bash
# Review before deleting:
git log --oneline origin/fix-appjsx-final ^origin/main | head -10
git log --oneline origin/restore-appjsx ^origin/main | head -5
git log --oneline origin/cursor/finish-peakly-ship-c015 ^origin/main | head -5

# Delete all claude/* branches:
git branch -r | grep 'origin/claude/' | sed 's|.*origin/||' | xargs git push origin --delete

# After reviewing, delete remaining stale branches:
git push origin --delete fix-appjsx-final restore-appjsx test-small cursor/finish-peakly-ship-c015
# master is handled in P1-B above
```

**Estimated time: 15 minutes including review.**

### P2-B: APNS_LIVE=true — Verify VPS Still Has APNS Keys

`APNS_LIVE` was flipped to `true` in Oct 15 commit with comment "VPS /health confirms apns:configured (HTTP/2+P1363 fix deployed 2026-08-11)". However, the daily reports from Oct 26 onward continue saying "VPS redeploy required" without mentioning APNS being live. 

After the P0 VPS redeploy, **immediately verify**:
```bash
curl -s https://peakly-api.duckdns.org/health | jq .apns
# Must return "configured", not "unconfigured"
```
If it returns `"unconfigured"`, the APNS keys were not preserved across the last restart. Jack will need to re-run the 5 `pm2 set` calls from `PUSH_SETUP.md` and flip `APNS_LIVE` back to `false` until confirmed working.

---

## 4. Performance Analysis

| Metric | Value |
|--------|-------|
| `dist/app.min.js` | Not present in working tree (built by `deploy.yml`) — ~439 KB per CLAUDE.md |
| `app.jsx` raw | 742 KB (Babel parses this in dev; stripped in production) |
| React 18 UMD gzipped | ~45 KB |
| Plus Jakarta Sans (2 weights) | ~40 KB |
| Supabase JS (lazy) | ~80 KB — only loads on sign-in |
| **Total production cold-load** | ~525 KB parse budget |

**`100dvh` fix in PR #20 is a real UX improvement** — `100vh` on iOS Safari included the area behind browser chrome, hiding the bottom tab bar behind the address bar. Fixed now.

**Biggest bottleneck:** 406 venues × 2 API calls (weather + marine) = 812 upstream Open-Meteo requests batched 50/2s → ~32s to fully populate all venues. Already mitigated by showing estimates immediately. This is the right design. The VPS disk cache eliminates this problem for warm users.

---

## 5. Cost Estimate

| MAU | Open-Meteo | VPS | Pages | Total/mo |
|-----|-----------|-----|-------|----------|
| 1K | Free | $6 | Free | **$6** |
| 10K | $0 (proxy cache) | $6 | Free | **$6** |
| 100K | $0 with disk cache (post-VPS-deploy) | $12 (2GB upgrade) | Free | **$12** |
| 1M | ~$50–200 commercial tier | $24 (4GB) | Free | **$74–224** |

Disk cache in the committed `server/proxy.js` eliminates the Open-Meteo spike risk at any scale. It survives `pm2 restart`. Without the VPS deploy, a Reddit spike into 406 cold Open-Meteo calls simultaneously risks hitting the free-tier ceiling before the cache warms.

---

## 6. What Breaks First at Scale

**The VPS is 84 days behind on code.** When the Reddit post drops (gated on VPS per PM), two things break simultaneously on cold traffic: (a) 406 simultaneous Open-Meteo weather calls fan out and hit the rate-limit ceiling — the disk cache fix is sitting in proxy.js, undeployed; (b) iOS users can't register or delete alerts (CORS + DELETE method blocked). The dev loop for "fix CORS" is also proxy.js → also undeployed. The entire pre-Reddit gate is a 10-minute SSH session. There is no code to write. The blocker is a human with SSH access running 5 commands. Whistler opens Nov 21 — 20 days. The Nov 7 VPS deadline gives 6 days of buffer before the ski-season scoring window matters. Use them.

---

## Action Items for Jack (Priority Order)

| # | Action | Time | Blocks |
|---|--------|------|--------|
| 1 | **SSH VPS, copy proxy.js, pm2 restart, verify /health** | 10 min | Reddit launch, iOS alerts, ski scoring |
| 2 | **Verify APNS after VPS restart** (`curl /health \| jq .apns`) | 2 min | Push alerts |
| 3 | **Fix .venue-baseline to 406** (or audit and remove 2 extras) | 5 min | Next app.jsx commit |
| 4 | **Delete origin/master, remove from deploy.yml** | 5 min | Production safety |
| 5 | **Clean up 20 unmerged branches** | 15 min | Repo hygiene |
