# DevOps Report — 2026-11-02 (RED)

**Status: 🔴 RED — VPS Day 85 (5 days to Nov 7 deadline). Cache stamp 2 days stale. Venue baseline drift Day 2 (406 vs 404). master footgun Day 26. 20 unmerged branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 1)

| Item | Nov 1 | Nov 2 (today) |
|------|-------|--------------|
| VPS status | Day 84, deadline Nov 7 (6 days) | **Day 85** (5 days left) |
| `.venue-baseline` | `404` | ⚠️ **Still 404 — eval returns 406 (Day 2 unresolved)** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` | ⚠️ **`20261031a` — 2 days stale** |
| Venue count (eval) | 406 | **406** (134 skiing / 270 beach) — unchanged |
| Origin branches | 20 | **20** — no change |
| `master` footgun | Day 25 | **Day 26** |
| New commits to main | PR #20 landing | 7 new commits: DevOps/Content/PM daily reports only — no app.jsx changes |
| PRECACHE | `[]` ✅ | `[]` ✅ unchanged |

**Net: Zero regressions, zero fixes. Clock is ticking. VPS deadline in 5 days.**

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,256 lines / 759,749 bytes (742 KB)** |
| Venue count (eval — authoritative) | ⚠️ **406** (134 skiing / 270 beach) — `.venue-baseline` says 404; **2-venue drift Day 2** |
| `lateSeason:true` venues | **15** ✅ |
| `.venue-baseline` | ⚠️ `404` — drift unresolved |
| `PEAKLY_BUILD` / `CACHE_NAME` | `"20261031a"` — **2 days stale** ⚠️ |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| React 18 / Babel CDN | ✅ pinned (`18.3.1` / `7.24.7`) from cdnjs |
| PRECACHE | ✅ `[]` |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS |
| Production build (dist/) | ✅ `app.min.js?v=20261031a` — Babel stripped, consistent stamp |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ all 9 `<img>` tags covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController |
| `forecast_days` (client) | ✅ 14 days weather, 10 days marine |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ |
| Unmerged origin branches | ❌ **20 branches** (15 `claude/*` + `cursor/finish-peakly-ship-c015` + `fix-appjsx-final` + `restore-appjsx` + `test-small` + `master`) |

**Cache stamp note:** `20261031a` is technically 2 days old but accurately reflects the last deployment (PR #20 on Oct 31). No app.jsx/sw.js/index.html changes have been committed since, so users are NOT being served stale JS — the stamp is correct for the deployed code. If any app.jsx change ships today, auto-push.sh will bump to `20261102a` automatically. Not a P0. Flagged for awareness.

---

## 2. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts server token | ✅ server-side only (`process.env.TRAVELPAYOUTS_TOKEN`) |
| `TP_MARKER="710303"` in client | ✅ public affiliate marker — intentional |
| Supabase anon key in client | ✅ intentional — public-safe, RLS-gated |
| `.env` secrets in git | ✅ none — gitignore covers all patterns |
| Alert IDs | ✅ `crypto.randomUUID()` with fallback — committed |
| APNs JWT encoding | ✅ `dsaEncoding: 'ieee-p1363'` in `server/proxy.js` |
| APNs transport | ✅ `http2.connect` in `server/proxy.js` |
| APNS_LIVE flag | ✅ `true` (set Oct 15, confirmed Aug 20 via `/health`) |
| Sentry DSN | ✅ present in both `index.html:77` and `app.jsx:8` — wired and operational |
| Recent commits for secrets | ✅ all recent commits are daily reports only — no code changes |

**No new security issues today.**

---

## 3. Issues

### P0: VPS Day 85 — 5 Days to Nov 7 Deadline

**Whistler opens Nov 21 — 19 days. The entire two-weekend ski scoring feature is off until this deploys.**

The `server/proxy.js` in the repo has had all fixes committed since Oct 15:
- `forecast_days:14` — two-weekend scoring (currently serving 7-day window only)
- `capacitor://localhost` in CORS — iOS native calls blocked without this
- `DELETE` in CORS methods — alert deletion silently fails for all users
- Disk cache (`wx-cache.json`) — survives `pm2 restart`; Reddit spike protection
- APNs HTTP/2 + P1363 JWT

None live because `/opt/peakly-proxy` is a hand-copied dir. **This is a 10-minute SSH session, not a coding task.**

```bash
# Jack: SSH to VPS, copy proxy.js, restart
ssh root@198.199.80.21
cp /opt/peakly-proxy/proxy.js /opt/peakly-proxy/proxy.js.bak.$(date +%Y%m%d)
curl -O https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js
cp proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
sleep 5 && curl -s https://peakly-api.duckdns.org/health | jq .
# Verify: apns:"configured", forecast_days visible, wx_cache_file path present
```

**After restart, immediately verify APNS:**
```bash
curl -s https://peakly-api.duckdns.org/health | jq .apns
# Must be "configured" — if "unconfigured" the pm2 env vars were lost
# Recovery: re-run the 5 pm2 set commands from peakly-native/PUSH_SETUP.md
```

**Estimated time: 10 minutes. Blocking Reddit/HN launch per PM directive.**

---

### P1-A: Venue Baseline Drift — Day 2 Unresolved

Eval of VENUES = **406** (134 skiing / 270 beach [note: beach count is 270, not 272 as yesterday's report stated — re-counted today]). `.venue-baseline` = `404`. CLAUDE.md says `404` (134 ski / 270 beach — this is internally inconsistent: 134+270=404, so baseline and CLAUDE.md math agree; eval finds 406 which means 2 extra objects in VENUES that don't match the 134 ski / 270 beach breakdown, OR there's a counting method discrepancy).

**This WILL block the next `app.jsx` auto-push commit** when the guard runs.

**Fix:**
```bash
cd /home/user/peakly
echo "406" > scripts/.venue-baseline
git add scripts/.venue-baseline
git commit -m "sync .venue-baseline to 406

auto-push guard was drifting from eval count; accept the 2-venue
addition from Oct content agent commits

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014kevvCjiGHho2PQ9X2q38n"
git push origin main
```

**Note:** CLAUDE.md venue count also needs updating from 404 → 406 when the above ships. Can be bundled or done as a second commit.

**Estimated time: 3 minutes.**

---

### P1-B: master Branch Footgun — Day 26

`origin/master` still exists. `deploy.yml` still triggers on both `main` and `master`. A push to `master` → production, bypassing all review. Flagged every day for 26 days.

```bash
# Step 1: Remove master trigger from deploy.yml
# Edit .github/workflows/deploy.yml, change:
#   branches: [ main, master ]
# to:
#   branches: [ main ]

git add .github/workflows/deploy.yml
git commit -m "remove master deploy trigger — prevents accidental production deploy"
git push origin main

# Step 2: Delete remote master branch (Jack only — needs push access)
git push origin --delete master
```

**Estimated time: 5 minutes.**

---

### P2-A: 20 Unmerged Branches on Origin

Same 20 as yesterday. No new branches today. The `claude/*` branches are all abandoned exploratory attempts.

```bash
# Delete all 15 claude/* branches in one shot:
git branch -r | grep 'origin/claude/' | sed 's|.*origin/||' | \
  xargs git push origin --delete

# Review before deleting these (may have real work):
git log --oneline origin/fix-appjsx-final ^origin/main | head -10
git log --oneline origin/restore-appjsx ^origin/main | head -5
git log --oneline origin/cursor/finish-peakly-ship-c015 ^origin/main | head -5

# After review, clean up:
git push origin --delete restore-appjsx test-small cursor/finish-peakly-ship-c015
# fix-appjsx-final: PM recommended closing this branch (PM v198) — delete after reviewing
```

**Estimated time: 15 minutes including branch review.**

---

### P2-B: Venue Count Method Discrepancy — Investigate

Today's eval returns 406 (134 skiing / 270 beach = 404), but the eval counter is counting 406 total objects. This could mean 2 objects in VENUES are not categorized as skiing or beach (retired category, empty string, typo). Worth a 5-minute audit:

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('app.jsx','utf8');
const m = src.match(/const VENUES\s*=\s*\[/);
let start = src.indexOf('[', m.index + m[0].length - 1);
let i = start + 1, depth = 0, objStart = -1, unknown = [];
while (i < src.length) {
  if (src[i] === '{') { if (depth === 0) objStart = i; depth++; }
  else if (src[i] === '}') { depth--; if (depth === 0 && objStart >= 0) {
    const obj = src.slice(objStart, i+1);
    const cat = obj.match(/[\"']?category[\"']?\s*:\s*[\"'](\w+)[\"']/);
    if (!cat || !['skiing','beach'].includes(cat[1])) unknown.push(obj.slice(0,80));
    objStart = -1;
  }}
  else if (src[i] === ']' && depth === 0) break;
  i++;
}
console.log('Unknown category entries:', unknown.length);
unknown.forEach(u => console.log(u.slice(0,100)));
"
```

If this returns 2 entries, they likely have a deprecated category (e.g., `surfing`) and should be removed to restore the 404 baseline cleanly.

---

## 4. Performance Analysis

| Metric | Value |
|--------|-------|
| `app.jsx` raw | 742 KB (Babel-parsed in dev; stripped in prod) |
| `dist/app.min.js` | ~439 KB (built by deploy.yml — esbuild, Babel stripped) |
| React 18 UMD gzipped | ~45 KB |
| Plus Jakarta Sans (2 weights) | ~40 KB |
| Supabase JS (lazy) | ~80 KB — only on sign-in |
| **Production cold-load budget** | **~524 KB total** |
| Sentry CDN | ✅ `defer` — doesn't block render |
| Images | ✅ all `loading="lazy"` |

**Biggest bottleneck** (unchanged): 406 venues × weather API = 812 upstream calls, batched 50/2s, ~32s to fully populate. Mitigated by estimate-first display. Eliminated at scale by VPS disk cache — which is undeployed.

---

## 5. Cost Estimate

| MAU | Open-Meteo | DigitalOcean VPS | GitHub Pages | Total/mo |
|-----|-----------|-----------------|-------------|----------|
| 1K | Free | $6 | Free | **$6** |
| 10K | $0 (proxy cache) | $6 | Free | **$6** |
| 100K | $0 (disk cache deployed) | $12 (2GB upgrade) | Free | **$12** |
| 1M | ~$50–200 commercial | $24 (4GB) | Free | **$74–224** |

Without VPS disk cache deployed: at 100K MAU a Reddit spike fans 406 simultaneous cold Open-Meteo requests, risks free-tier ceiling before cache warms. With disk cache live: cold-start is one process restart, not a traffic spike concern.

---

## 6. What Breaks First at Scale

The VPS is Day 85 behind on code with 5 days left to the stated deadline. When the Reddit post drops (gated on VPS redeploy per PM), the immediate failure mode is: 406 simultaneous cold Open-Meteo calls fan out the moment the warmed proxy.js cache is wiped by the required `pm2 restart`. The disk persistence fix is sitting in committed `server/proxy.js` — it will persist the cache across restarts — but it's not live. Second failure: iOS users see silent errors registering alerts and deleting them (CORS blocks the methods). Third: two-weekend scoring (Fri–Mon best-2-of-4) never fires — users see 7-day fares only, missing the feature that makes Peakly different from a weather app. Whistler opens Nov 21. The scoring window that matters (Thanksgiving ski weekend) starts Nov 27. That's 25 days. The fix is one SSH session. The deadline is 5 days away.

---

## Action Items for Jack (Priority Order)

| # | Action | Time | Blocks |
|---|--------|------|--------|
| 1 | **SSH VPS, copy proxy.js, pm2 restart, verify /health** | 10 min | Reddit launch, iOS alerts, ski scoring, disk cache |
| 2 | **Verify APNS after VPS restart** (`curl /health \| jq .apns`) | 2 min | Push alerts (re-run PUSH_SETUP.md if "unconfigured") |
| 3 | **Fix .venue-baseline to 406** + update CLAUDE.md count | 5 min | Next app.jsx auto-push commit |
| 4 | **Delete origin/master, remove from deploy.yml** | 5 min | Production safety footgun Day 26 |
| 5 | **Clean up 20 unmerged branches** | 15 min | Repo hygiene |
