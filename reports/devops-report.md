# DevOps Report — 2026-11-05 (RED)

**Status: 🔴 RED — VPS Day 89 (2 days to Nov 7 deadline). Cache stamp 5 days stale. `fix-appjsx-final` is a 6-MONTH ROLLBACK BOMB — do NOT merge. master footgun Day 29. 21 branches.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Sandbox timeouts ≠ VPS outage.

---

## Delta vs. Yesterday (Nov 4)

| Item | Nov 4 | Nov 5 (today) |
|------|-------|--------------|
| VPS status | Day 87, 3 days to Nov 7 | **Day 89 — 2 days left** |
| `.venue-baseline` | `404` | ✅ **`404` — eval 134+270=404, no drift** |
| `PEAKLY_BUILD` / `CACHE_NAME` | `20261031a` stale (4d) | ⚠️ **`20261031a` — 5 days stale** |
| Venue count (category grep) | 406 (methodology artifact) | **404** (134 skiing / 270 beach) — CLEAN |
| Origin branches | 21 | **21** — no pruning |
| `master` footgun | Day 28 | **Day 29** |
| `fix-appjsx-final` | Escalated to P0 | **⛔ ROLLBACK BOMB — see P0 #2** |
| New commits to main | Reports only | **Reports only** — no app.jsx changes |

---

## P0 — Fix Today

### P0-1: Cache stamp 5 days stale — users getting stale service worker

`PEAKLY_BUILD = "20261031a"` and `CACHE_NAME = "peakly-20261031a"` haven't moved since October 31. Today is November 5. Users who visited before Oct 31 have a SW that will never self-invalidate until the cache name changes. This is a P0 because new prod deploys (if any happen this week) may not reach users.

The auto-push hook only bumps the stamp when app.jsx/sw.js/index.html change. Five days of reports-only commits means no bump. That's correct behavior — but the **VPS redeploy commit that's coming** MUST bump the stamp.

**Fix (30 seconds):**
```bash
# Update all three files atomically via auto-push.sh's bump logic, or manually:
TODAY=$(date +%Y%m%d)
perl -pi -e "s/const PEAKLY_BUILD = \"[^\"]+\"/const PEAKLY_BUILD = \"${TODAY}a\"/" app.jsx
perl -pi -e "s/const CACHE_NAME = \"[^\"]+\"/const CACHE_NAME = \"peakly-${TODAY}a\"/" sw.js
perl -pi -e "s/app\.jsx\?v=[^\"]*/app.jsx?v=${TODAY}a/" index.html
# Then verify they all match:
grep "20261031\|${TODAY}" app.jsx sw.js index.html
```

**Est. time:** 2 min. Bundle with the VPS redeploy commit.

---

### P0-2: `fix-appjsx-final` IS A 6-MONTH ROLLBACK BOMB — DO NOT MERGE

Prior reports (Day 1–5) have been calling `fix-appjsx-final` a "P0 unmerged fix." This is WRONG and dangerous.

**The numbers:**
- `fix-appjsx-final` app.jsx: **9,095 lines**, `PEAKLY_BUILD = "20260513c"` (May 13, 2026)
- `main` app.jsx: **14,256 lines**, `PEAKLY_BUILD = "20261031a"` (Oct 31, 2026)
- **Merging this branch deletes ~5,161 lines of 6-month work.** Every feature shipped since May 13: improved onboarding, all 2026-07/08/09/10 fixes, App Review prep (PR #20), iOS entitlements, the full 404-venue catalog, the stale-price fix, the geolocation fix — all gone.

The branch contains fixes to 4 IATA codes + a Chamonix dup from May 2026. Those bugs may or may not still exist in current main. **To apply these fixes safely:**

```bash
# Check if each of the 4 specific commits applies cleanly to main:
git log --oneline origin/fix-appjsx-final -- app.jsx | head -5
# Then cherry-pick only the relevant commits (NOT merge the branch):
git cherry-pick <specific-fix-commit-hash>
# Or verify the bugs are already fixed in current main before doing anything.
```

**Do not merge `fix-appjsx-final` into main. Close the branch.**

---

## P1 — Fix This Week

### P1-1: VPS Day 89 — 2 days to the Nov 7 deadline

`server/proxy.js` changes have been committed to the repo for 3+ months but are NOT running on the VPS. The VPS at `/opt/peakly-proxy` is a hand-copied dir, not a git clone.

**What breaks without this redeploy:**
- Two-weekend scoring stays off (forecast_days is 7 not 14 on the VPS, so weekend 2 scores silently fail)
- iOS native proxy calls blocked (CORS missing `capacitor://localhost`)
- Alert deletion silently fails (`DELETE` blocked by CORS preflight)
- `_wxCache` is in-memory — a `pm2 restart` wipes it (Open #23)
- Rate limiter reads wrong IP from X-Forwarded-For

**Fix (SSH session, ~15 min):**
```bash
ssh root@198.199.80.21
# Copy updated proxy.js to VPS (NOT git pull — it's not a git repo):
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
# On VPS:
cd /opt/peakly-proxy
pm2 restart peakly-proxy
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Should show: forecast_days:14, apns:unconfigured (still expected), uptime reset to seconds
```

---

### P1-2: `origin/master` footgun — Day 29

`deploy.yml` triggers on both `main` and `master`. Any commit pushed to `master` goes to production. This has been Day 29 with no action. The risk is a stale auto-push or a force-push to master sending a broken deploy.

**Fix (2 min):**
```bash
# Delete the remote master branch:
git push origin --delete master
# Or protect it in GitHub Settings → Branches → Branch protection rules.
```

If master must stay (iOS Capacitor history?), add a `paths-ignore` to the master trigger so only intentional pushes deploy.

---

## P2 — Fix This Sprint

### P2-1: 21 remote branches — 15 stale `claude/*` agent branches

```
origin/claude/analyze-test-coverage-WVIsT    (agent branch, unreviewed)
origin/claude/code-review-cleanup-HjoCS
origin/claude/condense-alert-page-jzdLo
origin/claude/enhance-loading-screen-rZ1dc
origin/claude/fix-app-jsx-content
origin/claude/implement-todo-lNL7W
origin/claude/improve-peakly-ui-UHCHG
origin/claude/improve-scoring-system-XYGY6
origin/claude/product-reliability-assessment-w0poL
origin/claude/redesign-front-page-EndKs
origin/claude/review-peakly-ux-UQ0Qu
origin/claude/simplify-alerts-page-2ejGB
origin/claude/simplify-profile-page-Bi2Tc
origin/claude/standardize-venue-data-CufiQ
origin/claude/streamline-onboarding-account-97XRR
origin/cursor/finish-peakly-ship-c015
origin/fix-appjsx-final    ← ROLLBACK BOMB, see P0-2
origin/restore-appjsx
origin/test-small
```

**Fix (5 min):**
```bash
# Delete all stale cloud-agent branches:
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

### P2-2: No SRI on CDN scripts (Open #10)

4 CDN scripts in index.html have no `integrity=` attribute:
- React 18.3.1 (cdnjs)
- ReactDOM 18.3.1 (cdnjs)
- Babel Standalone 7.24.7 (cdnjs — dev only, stripped in prod)
- Sentry (sentry-cdn, no pinned version)

If the CDN is compromised, XSS is trivial. Plausible is `defer` from plausible.io — no pin needed.

**Fix for the three pinnable cdnjs scripts:**
```html
<!-- Get hashes: -->
<!-- curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A -->
<script crossorigin
  src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_HERE">
</script>
```

Low priority until MAU > 1K. Sentry's CDN script version is a floating minor — pin it or drop it.

---

## Infrastructure is Clean

| Check | Status |
|-------|--------|
| Plausible analytics | ✅ Present, uncommented, correct domain |
| Travelpayouts token | ✅ Server-side only (`process.env.TRAVELPAYOUTS_TOKEN` in proxy.js) |
| SUPABASE_ANON_KEY | ✅ Public-safe anon key (RLS-gated), expected in client |
| TP_MARKER `710303` | ✅ Public affiliate marker, not a secret |
| FLIGHT_PROXY | ✅ HTTPS (`peakly-api.duckdns.org`) — no HTTP P0 this run |
| fetchTravelpayoutsPrice timeout | ✅ 4000ms AbortController |
| .gitignore | ✅ Covers `.env`, `.pem`, `.p8`, `.key`, `.mobileprovision` |
| Open-Meteo forecast_days | ✅ 14 weather / 10 marine in client |
| Image lazy loading | ✅ 9/9 `<img>` tags have `loading="lazy"` |
| Venue count | ✅ 404 (134 skiing / 270 beach), matches `.venue-baseline` |
| lateSeason venues | ✅ 15 (matches CLAUDE.md expected count) |
| Recent commits with secrets | ✅ No secrets in last 15 commits |

---

## Performance Snapshot

- **app.jsx**: 14,256 lines / 759 KB source. Production build via `deploy.yml` → esbuild minifies to ~439 KB (est.), Babel stripped.
- **Bundle load (prod)**: dist/app.min.js ~439 KB + React/ReactDOM ~150 KB UMD = ~590 KB total. Acceptable for a PWA with offline SW.
- **Biggest bottleneck**: Weather fetching is batched 50/2s with 404 venues = ~16 seconds for a full first-load data pass. This is by design (Open-Meteo rate limit) but means the first render is fast (skeletons), subsequent sorts take 16s to fully populate. **At Reddit-scale traffic (1K+ concurrent users), all hitting the same 404 venues = 404 × Open-Meteo direct calls per session.** The VPS proxy cache (Open #19) is the only fix for this — 404 unique coords become 1 upstream call per 2h window.

---

## Cost Estimate

| Scale | DigitalOcean ($6 droplet) | Open-Meteo (free tier 10K/day) | Total/month |
|-------|--------------------------|-------------------------------|-------------|
| Current (<10 MAU) | $6 | Free | **$6** |
| 1K MAU | $6 | Free (1K × 1 session/day × ~5 unique calls = 5K/day) | **$6** |
| 10K MAU | $6 → $12 (need 2GB RAM) | ⚠️ **At risk** (10K × 5 = 50K/day > 10K limit) | **$12 + rate limit pain** |
| 100K MAU | $24–48 (load balanced) | **$0 if VPS cache works; $200+/mo if not** | **$30–250** |

**Cost optimization**: VPS proxy cache (Open #19) eliminates the Open-Meteo exposure entirely at scale. A $6/mo droplet handles 10K MAU easily if the cache is warm. Without it, you're one HN front page away from a 48-hour rate-limited outage.

---

## What Breaks First at Scale

The app survives single-digit MAU with zero infra changes. At 100–500 concurrent users (a Reddit post), the **single failure point is Open-Meteo rate limiting** — 404 venues × N users = N×5 direct API calls per session, potentially thousands per minute, well above the free tier's 10K/day cap. The VPS proxy's shared in-memory cache is the fix and has been committed for 3 months; the redeploy needed to activate it has been pending since before launch. Bump this if any viral post is planned. The VPS hardware ($6/mo 1GB) handles the proxy load fine through 10K MAU. After that, the open-meteo cache keeps costs linear; without it, you're renting the free tier's ceiling as a DDoS vector against yourself.

---

*Report generated: 2026-11-05 14:14 UTC. App.jsx: 14,256 lines / 759 KB. Venues: 404 (134 ski / 270 beach). Cache stamp: `20261031a` (5 days stale). VPS: Day 89, 2 days to Nov 7 deadline.*
