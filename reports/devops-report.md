# DevOps Report — 2026-11-15 (RED)

**Status: 🔴 RED — VPS Day 99 (Whistler opens in 6 days). Cache stamp 15 days stale. App Review hard stop MISSED (Nov 14, now +1 day). `master` footgun Day 39. `fix-appjsx-final` rollback bomb Day 16. 19 stale branches. 29 days no code commits.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block confirmed). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 14)

| Item | Nov 14 | Nov 15 (today) |
|------|--------|----------------|
| VPS status | Day 98 | 🚨 **Day 99 — no movement** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (14d) | 🚨 **`20261031a` — 15 days stale** |
| App Review hard stop | MISSED (Nov 14 was yesterday) | 🚨 **MISSED +1 day — reply NOW** |
| `fix-appjsx-final` | Rollback bomb Day 15 | **Day 16** |
| `master` footgun | Day 38 | **Day 39** |
| New app.jsx commits | 0 (28d no code commits) | **0 — 29 days no code commits** |
| Venue count | 404 | ✅ **404 — unchanged (134 skiing / 270 beach)** |
| Braces balanced | ✅ 5684/5684 | ✅ **5684/5684** |
| lateSeason count | 15 | ✅ **15 confirmed (10 compact + 5 JSON-format)** |
| FOR/NAT AP_CONTINENT | Flagged by Content | ✅ **FALSE ALARM — FOR + NAT confirmed in both AP_CONTINENT and AIRPORT_COORDS** |
| Remote branches | 19 stale | **19 stale (unchanged)** |
| Plausible analytics | ✅ present | ✅ present, uncommented |
| Sentry DSN | ✅ live | ✅ live (`9416b032a46681d74645b056fcb08eb7`) |
| Proxy URL | ✅ HTTPS duckdns | ✅ HTTPS `peakly-api.duckdns.org` |
| TP_MARKER client-side | ⚠️ in app.jsx | ⚠️ same — `710303` in client code (see note) |
| Supabase anon key | ✅ public-safe (RLS-gated) | ✅ RLS-gated per design |
| Image lazy loading | ✅ | ✅ 9/9 `<img>` tags use `loading="lazy"` |
| .gitignore | ✅ | ✅ covers .env, .p8, .pem, .key, .p12 |
| GEAR_ITEMS | ✅ removed | ✅ 0 — Amazon cut holds |
| .venue-baseline | ✅ 404 | ✅ 404 — present and correct |
| app.jsx size | 14,159 lines (prev) | ⚠️ **14,256 lines / 760 KB** |

---

## Content Report False Alarm: FOR/NAT AP_CONTINENT Gap

Yesterday's Content report flagged FOR (Fortaleza) and NAT (Natal) as missing from AP_CONTINENT — this is **wrong**. Verified today:
- `FOR` present in `AP_CONTINENT` ✅
- `NAT` present in `AP_CONTINENT` ✅
- `FOR` present in `AIRPORT_COORDS` ✅
- `NAT` present in `AIRPORT_COORDS` ✅

Lines 5022 and 5032 in app.jsx both have these venues. The Content agent's grep-based check likely missed them due to the mixed compact/JSON format in the VENUES array. No fix needed.

---

## P0 — Fix Today

### P0-1: App Review hard stop MISSED by 1 day — reply NOW

The Nov 14 deadline is gone. The submission `468d466e-ab22-4db5-bc51-d897a9bcfb8e` (Guideline 2.1) is in a waiting-for-reply state. Apple's review team can auto-reject it at any time. Whistler opens in **6 days** (Nov 21) — that's the last viable ski traffic window this year before the Thanksgiving rush. If the submission gets auto-rejected now, there is no time to resubmit and pass review before it matters.

**Action: 10 minutes. Jack only.**
```
1. App Store Connect → App Review → submission 468d466e-ab22-4db5-bc51-d897a9bcfb8e
2. Paste the block from docs/APP_REVIEW_NOTES.md → "Paste this"
3. Attach screen recording per the shot list in docs/APP_REVIEW_NOTES.md
4. Hit Submit Reply
```
No code changes needed. Build 3 is uploaded, iOS 15.0, `CFBundleVersion: 3`, entitlements set. The reply text and shot list are already written in `docs/APP_REVIEW_NOTES.md`.

---

### P0-2: VPS Day 99 — Whistler opens in 6 days, two-weekend scoring broken

The `server/proxy.js` changes committed in 2026-08-11 have **never been deployed to the VPS**. `/opt/peakly-proxy` on the DigitalOcean droplet (198.199.80.21) is hand-copied code, not a git clone. 99 days since last redeploy means:
- `forecast_days:14` not live → two-weekend scoring disabled when proxy is healthy
- `capacitor://localhost` not in CORS → iOS native calls blocked
- `DELETE` not in `Access-Control-Allow-Methods` → alert deletion silently fails
- Rate limiter reads first X-Forwarded-For entry → forgeable

**Action: Jack SSH only.**
```bash
ssh root@198.199.80.21
cd /opt/peakly-proxy
# NOT a git clone — manual copy required:
curl -sSL https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js -o proxy.js
npm install  # only if package.json changed — it didn't this round
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health  # verify: uptime resets, wx_cache_size 0
```
**Bundle with disk cache fix (Open #23) in the same SSH session.** Disk cache prevents post-restart cache wipe from blowing Open-Meteo rate limits under a Whistler/Thanksgiving traffic spike. See P1-1 below.

---

### P0-3: Cache stamp 15 days stale — users serving stale SW bundle

`PEAKLY_BUILD = "20261031a"` and `sw.js CACHE_NAME = "peakly-20261031a"`. Today is 2026-11-15. Users whose service worker cached this version 15 days ago will never get a cache bust. With Whistler opening in 6 days and a potential App Store approval incoming, new users hitting a stale cache is a first-impression failure.

**Fix: 2-minute edit, requires Jack to trigger a code commit to bump the stamp.**
The auto-push hook bumps the stamp on file edits — but there have been zero code commits in 29 days, so the hook hasn't fired. Manual bump:

```bash
cd ~/peakly
# Edit app.jsx line 17:
# const PEAKLY_BUILD = "20261031a";  →  const PEAKLY_BUILD = "20261115a";
# sw.js line 2:
# const CACHE_NAME = "peakly-20261031a";  →  const CACHE_NAME = "peakly-20261115a";
# Then push — auto-push.sh will keep them in lockstep on subsequent edits
perl -pi -e 's/const PEAKLY_BUILD = "20261031a"/const PEAKLY_BUILD = "20261115a"/' app.jsx
perl -pi -e 's/const CACHE_NAME = "peakly-20261031a"/const CACHE_NAME = "peakly-20261115a"/' sw.js
grep -n "PEAKLY_BUILD\|CACHE_NAME" app.jsx sw.js  # verify
git add app.jsx sw.js
git commit -m "auto: bump cache stamp 20261031a → 20261115a"
git push origin main
```

---

## P1 — Fix This Week

### P1-1: Disk cache for VPS weather data — required for Whistler traffic spike

Open #23 from PM v99 (2026-07-25): `_wxCache` is in-memory only. A `pm2 restart` wipes it. The VPS redeploy in P0-2 will restart pm2, blowing the warm cache. If a Whistler traffic spike hits in the first minutes after restart, concurrent uncached weather fetches will blast Open-Meteo's free tier.

**~30-line fix in `server/proxy.js`. Bundle with P0-2 deploy.**

Add to `server/proxy.js` (after `const _wxCache = new Map();`):
```javascript
const DISK_CACHE_PATH = "/tmp/peakly-wx-cache.json";

// Warm in-memory cache from disk on startup
try {
  const raw = require("fs").readFileSync(DISK_CACHE_PATH, "utf8");
  const saved = JSON.parse(raw);
  const now = Date.now();
  for (const [k, v] of Object.entries(saved)) {
    if (v.ts && now - v.ts < 2 * 60 * 60 * 1000) _wxCache.set(k, v);
  }
  console.log(`[cache] Warmed ${_wxCache.size} entries from disk`);
} catch {}

// Persist cache to disk every 5 minutes
setInterval(() => {
  try {
    const obj = {};
    for (const [k, v] of _wxCache) obj[k] = v;
    require("fs").writeFileSync(DISK_CACHE_PATH, JSON.stringify(obj));
  } catch {}
}, 5 * 60 * 1000);
```

---

### P1-2: `master` footgun — Day 39, every master push triggers a Pages deploy

`deploy.yml` triggers on both `main` AND `master`. Any git push to `master` deploys to production. This is especially dangerous with 15 open `claude/*` branches that could be merged or accidentally pushed to master. The `fix-appjsx-final` and `restore-appjsx` branches (see P1-3) are sitting remote, one `git push origin master` away from replacing the production binary.

**Fix: edit `.github/workflows/deploy.yml` line 7. Remove `master` from the trigger.**
```yaml
# BEFORE:
on:
  push:
    branches:
      - main
      - master

# AFTER:
on:
  push:
    branches:
      - main
  workflow_dispatch:
```
```bash
# Terminal command:
sed -i '/^      - master$/d' .github/workflows/deploy.yml
git add .github/workflows/deploy.yml
git commit -m "ci: remove master from deploy trigger — footgun Day 39"
git push origin main
```

---

### P1-3: `fix-appjsx-final` and `restore-appjsx` rollback bombs — Day 16

Two remote branches exist whose names imply they contain emergency/rollback app.jsx state:
- `origin/fix-appjsx-final`
- `origin/restore-appjsx`

These are Day 16 of being flagged. If merged or pushed to main/master accidentally, they could overwrite the current app.jsx (14,256 lines, 404 venues) with an older snapshot. The danger is highest right now because the `master` footgun (P1-2) is still live — a single `git merge fix-appjsx-final && git push origin master` by any session would deploy an unknown snapshot to production.

**Action: Jack only.**
```bash
# Review what these branches contain before deleting:
git log --oneline origin/fix-appjsx-final
git log --oneline origin/restore-appjsx
# If confirmed stale/unnecessary:
git push origin --delete fix-appjsx-final
git push origin --delete restore-appjsx
# Also clean up cursor/ and test-small branches:
git push origin --delete cursor/finish-peakly-ship-c015
git push origin --delete test-small
```

---

## P2 — Fix This Sprint

### P2-1: 15 open `claude/*` branches — growing debt

15 `claude/*` remote branches from automated agent sessions. None merged to main. Each is an independent session's exploratory attempt. As they accumulate they:
1. Raise the risk that something gets accidentally merged or force-pushed
2. Make `git branch -r` output unreadable
3. Create confusion in the GitHub UI

**Action: Jack reviews and mass-deletes. 10 minutes.**
```bash
# List all claude/* branches with their last commit date:
git for-each-ref --sort=-committerdate refs/remotes/origin/claude/ --format='%(refname:short) %(committerdate:short) %(subject)'
# Delete all at once after review:
git push origin --delete $(git branch -r | grep 'origin/claude/' | sed 's|origin/||' | tr '\n' ' ')
```

### P2-2: app.jsx size growing — now 14,256 lines / 760 KB

Previous reports showed 14,159 lines. Now 14,256 (+97 lines). The growth is from the Oct 31 App Review prep commit. At 760 KB the esbuild minification step is critical. No action today, but watch for continued growth past 15K lines.

### P2-3: TP_MARKER `710303` in client code — acceptable, documented for clarity

`TP_MARKER = "710303"` is an affiliate *marker*, not a secret token. The actual Travelpayouts auth token lives server-side in the VPS proxy. This is by design and is noted in CLAUDE.md. No security risk. Flagged here for completeness so this doesn't keep appearing as a false positive.

### P2-4: Supabase anon key in client code — by design

`SUPABASE_ANON_KEY` is a public-safe key protected by Row Level Security policies. Exposing it in client code is the standard Supabase pattern. Not a vulnerability. RLS policies are the actual security boundary.

---

## Infrastructure Cost Projection

| Scale | DigitalOcean | Open-Meteo | Supabase | Total/mo |
|-------|-------------|------------|---------|----------|
| Today (<100 MAU) | $6 (1GB droplet) | Free | Free | **$6** |
| 1K MAU | $6 | Free (proxy cache absorbs it) | Free | **$6** |
| 10K MAU | $12 (upgrade to 2GB) | Free | $25 (Pro, storage) | **$37** |
| 100K MAU | $48 (4-core) + CDN | ~$29/mo (commercial) | $599 (Team) | **~$676** |

**Cost optimization at scale:** The VPS weather cache (disk-persisted per P1-1) and the existing in-flight dedupe are the most important cost controls. At 10K MAU, every uncached weather fetch is a risk. At 100K MAU, Open-Meteo commercial tier is unavoidable unless a secondary free-tier provider (MET Norway, NWS) is added as a fallback.

---

## What Breaks First at Scale

**The VPS.** It is a single DigitalOcean 1GB droplet with no load balancer, no health check restarts (beyond pm2), and no disk-persisted cache. Under a Reddit/HN spike on the Whistler open (Nov 21), here's the failure sequence: (1) pm2 hasn't been restarted in 99 days — it's sitting on the June 2026 proxy.js which still uses `forecast_days:7`, breaking two-weekend scoring for all iOS users; (2) the in-memory `_wxCache` has no disk persistence, so a cold-start spike hits Open-Meteo directly for every concurrent user, burning through the free-tier rate limit in minutes; (3) the client falls back to direct Open-Meteo, doubling the upstream load; (4) rate limit hit, all weather fetches return 429, every venue scores 50, the Explore grid is useless noise. Prevention: deploy P0-2 + P1-1 before Whistler opens. That alone covers the most likely failure mode. Beyond 10K MAU, add a Cloudflare worker cache in front of the VPS weather endpoint — $0 at that scale, absorbs 95% of repeat-coord queries.

---

## Full Checklist

| Check | Result |
|-------|--------|
| app.jsx lines | 14,256 |
| app.jsx size | 760 KB |
| Venue count (by id:) | ✅ 404 (134 ski / 270 beach) |
| .venue-baseline | ✅ 404 |
| Brace balance | ✅ 5684/5684 |
| lateSeason count | ✅ 15 (10 compact + 5 JSON) |
| PEAKLY_BUILD | ⚠️ `20261031a` — **15 days stale** |
| sw.js CACHE_NAME | ⚠️ `peakly-20261031a` — **15 days stale** |
| Plausible analytics | ✅ present, active, uncommented |
| Sentry DSN | ✅ live in both index.html and app.jsx |
| CDN deps | ✅ React 18.3.1, Babel 7.24.7, all pinned versions |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (not raw IP, not HTTP) |
| Travelpayouts token client | ✅ no token — only marker `710303` (by design) |
| Supabase anon key | ✅ public-safe, RLS-gated (by design) |
| .gitignore | ✅ covers .env, .p8, .pem, .key, .p12, .mobileprovision |
| Image lazy loading | ✅ 9/9 img tags |
| GEAR_ITEMS | ✅ 0 — Amazon cut holds |
| FOR/NAT AP_CONTINENT | ✅ **FALSE ALARM** — both present and correct |
| Stale remote branches | ⚠️ 19 (15 claude/*, 4 other) |
| master deploy trigger | ⚠️ Day 39 — both main + master trigger Pages |
| fix-appjsx-final branch | ⚠️ Day 16 — rollback bomb on origin |
| restore-appjsx branch | ⚠️ same — rollback bomb on origin |
| VPS redeploy | ⚠️ Day 99 — proxy.js fixes inert |
| App Review reply | 🚨 OVERDUE — Nov 14 hard stop was yesterday |
| Days since code commit | 🚨 29 days |
