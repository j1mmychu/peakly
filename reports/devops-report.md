# DevOps Report — 2026-10-27 (RED)

**Status: 🔴 RED — VPS Day 79. Whistler opens in 14 days. `origin/master` footgun Day 20. PRECACHE→CDN mismatch still live.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). Do not interpret sandbox timeouts as VPS outage.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` lines / raw size | **14,237 lines / 758,944 bytes** (741 KB) — unchanged since 2026-10-10 ✅ |
| Total venues | **406** (eval-counted) ⚠️ — was 404 per CLAUDE.md; 2 added by Content report 2026-10-10 but CLAUDE.md not updated |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | `"20260914a"` — **43 days stale**. No code shipped since Aug 11 so this is expected; first edit MUST bump in lockstep. ⚠️ |
| Plausible analytics | ✅ present, uncommented — `index.html:32` |
| React 18.3.1 (cdnjs) | ✅ pinned |
| Babel 7.24.7 (cdnjs) | ✅ dev-only; stripped by `build-web.mjs` in prod |
| `FLIGHT_PROXY` | ✅ `https://peakly-api.duckdns.org` — HTTPS, no raw IP |
| Travelpayouts token in client | ✅ `TP_MARKER="710303"` is public affiliate marker only — no secret |
| Supabase anon key in client | ✅ Intentional, public-safe, RLS-gated (`app.jsx:26`) |
| Sentry DSN | ✅ configured — `app.jsx:8`, `index.html:77` |
| `.gitignore` | ✅ covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` |
| Image `loading="lazy"` | ✅ all `<img>` tags covered |
| `fetchTravelpayoutsPrice` timeout | ✅ 4s AbortController timeout wired |
| `lateSeason:true` venues | ✅ **15** (eval-confirmed: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, snowbird, zermatt, engelberg, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch) |
| GEAR_ITEMS | ✅ 0 instances — Amazon cut confirmed |
| All API calls HTTPS | ✅ Open-Meteo, marine, proxy all HTTPS |
| BASE_PRICES coverage | ✅ **181 airports** — Open #22 CLOSED |
| `proxy.js` source (committed, NOT on VPS) | ✅ `forecast_days=14`, disk cache, iOS CORS, `DELETE` allow, `http2` APNs, `ieee-p1363` JWT |

---

## 2. Critical Issues (P0)

### P0-A: VPS Redeploy — Day 79 (Deadline: Oct 30 per PM v192)

**The single most important action in the repo. Nothing else matters more this week.**

The committed `server/proxy.js` includes: `forecast_days:14` (two-weekend scoring), disk-cached `_wxCache` (cold-start protection), `capacitor://localhost` CORS (iOS native), alert `DELETE` support, `http2` APNs, `ieee-p1363` JWT. None of it is running. The VPS is on the Aug 11 build.

Whistler opens Nov 10. That's 14 days. The Reddit post that will drive the first traffic spike is being planned for that day per PM reports. Without the disk-persisted cache, a `pm2 restart` immediately before launch leaves a cold cache that fans out ~406 Open-Meteo requests per concurrent user. PM deadline is Oct 30 — 3 days.

**Exact SSH commands (Jack):**
```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-deploy
cp /tmp/peakly-deploy/server/proxy.js /opt/peakly-proxy/proxy.js
pm2 restart peakly-proxy
# Verify:
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Should show: forecast_days:14, uptime resets to <60s, apns configured if .p8 is set
rm -rf /tmp/peakly-deploy
```

**Time: 5 minutes.** There is no technical blocker. This is a manual action.

---

## 3. High Issues (P1)

### P1-A: PRECACHE Contains CDN URL — Service Worker Caches Non-App Code

`sw.js:3–5`:
```js
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];
```

This caches the Babel standalone build in the service worker. In **production**, `build-web.mjs` strips Babel entirely — `dist/index.html` loads `dist/app.min.js` and has no Babel dependency. The PRECACHE entry is a leftover from pre-production builds that:

1. Adds ~800 KB to SW cache for a file that production doesn't use.
2. Pins to `7.29.7` (unpkg) — a version different from the dev build's `7.24.7` (cdnjs). These two versions are not in lockstep.
3. If unpkg has a CDN hiccup during SW install, the SW install stalls (allSettled mitigates, but the intent is wrong).

**Fix (`sw.js:3`):**
```js
const PRECACHE = [];
```

**Time: 30 seconds. Zero risk — allSettled means an empty array installs fine.**

### P1-B: `origin/master` Footgun — Day 20

`origin/master` branch is 5 commits **behind** `origin/main` (and 0 commits ahead). The `deploy.yml` deploys both `main` and `master`. This means:

- A push to `master` deploys the Aug 11 codebase, silently overwriting everything since.
- Anyone who clones the repo and pushes to `master` instead of `main` deploys stale code with zero warning.
- `auto-push.sh` pushes `master:main` — this force-overwrites main with master's content. If master diverged, this is data loss.

**Day 20 of this being flagged. No action taken.**

**Fix — Jack only (2 minutes):**
```bash
# Step 1: Confirm master is truly stale (not needed for deploy)
git log origin/master..origin/main --oneline | wc -l  # should show >0

# Step 2: Delete master branch
git push origin --delete master

# Step 3: Update deploy.yml to remove master trigger (1-line change)
# .github/workflows/deploy.yml — find: branches: [main, master]
# change to:             branches: [main]
```

Until master is deleted, every session that runs `auto-push.sh` is one wrong branch name away from a silent rollback to Aug 11.

### P1-C: VENUE COUNT DRIFT — CLAUDE.md Says 404, Code Has 406

Content report 2026-10-10 added 2 venues (TFS + CHQ from the LAS/VPS note in v192), but CLAUDE.md still says 404. This makes every venue-count guard comparison wrong by 2.

**`.venue-baseline` check:**
```bash
cat scripts/.venue-baseline
```
If it shows 404, the auto-push guard will flag a false discrepancy when new venues are added.

**Fix:**
Update `CLAUDE.md` "Current State" section: `**404 venues** (134 skiing / 270 beach)` → confirm the split with `node -e "..."` eval, then update. Also update `scripts/.venue-baseline` if needed.

**Time: 5 minutes.**

---

## 4. Stale Remote Branches — 20 Branches Including Abandoned Cloud Agents

`git branch -r` shows **20 remote branches**: 15 `claude/*` abandoned worktrees, plus `fix-appjsx-final`, `restore-appjsx`, `test-small`, `master`. None are open PRs. All are dead weight.

This is not a security issue, but it's a P1 ops hygiene issue: any of these, if pushed to, triggers a GitHub Pages deploy via `deploy.yml`. The `fix-appjsx-final` and `restore-appjsx` names suggest they were used to emergency-restore code — if they're behind main, pushing to them deploys old code.

**Fix (Jack — 2 minutes, after confirming none have open PRs):**
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
  fix-appjsx-final \
  restore-appjsx \
  test-small
```

---

## 5. Medium Issues (P2)

### P2-A: Open-Meteo Rate Limiting at Scale

406 venues, BATCH_SIZE=50, batch every 2s. Each full cold-load is ~406 weather requests + ~270 marine requests (beach only) = ~676 requests per cold user. Open-Meteo's free tier is 10,000/day per IP. Because this is client-side (user browsers), each user has their own IP — so the per-IP limit is effectively not a concern at current scale. **The VPS proxy cache (P0-A) is still the right fix for latency, not rate limiting.**

Severity downgraded from P1 to P2 — the P0-A VPS redeploy makes this moot.

### P2-B: SRI Missing on CDN Scripts

No `integrity=` on `react`, `react-dom`, or `babel-standalone` CDN tags. A CDN compromise is silent. Low probability, medium blast radius.

```bash
# Generate SRI hashes for current pinned versions:
curl -s https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<hash>" crossorigin="anonymous"` to each script tag. **Time: ~30 min.**

---

## 6. Cost at Scale

| MAU | Infrastructure | Notes |
|-----|---------------|-------|
| Current (<100) | **$6/mo** | DO droplet + GH Pages free |
| 1K MAU | **$6/mo** | Supabase free tier (500MB), GH Pages free |
| 10K MAU | **$31/mo** | Supabase Pro $25 (5GB DB + 5GB egress) |
| 100K MAU | **$57/mo** | DO $12 (2GB RAM), Supabase Pro $25 + ~$20 egress |

No new cost concerns vs yesterday.

---

## 7. What Breaks First at Scale

**The scenario:** Jack posts to r/skiing on Nov 10 (Whistler opening day). 500 people open the app in the first 5 minutes. The VPS just restarted for the P0-A redeploy — `_wxCache` is cold (no disk persistence yet because P0-A hasn't shipped). 500 × 406 venues = 203,000 browser-side weather requests from 500 distinct IPs. Open-Meteo doesn't rate-block at the per-IP level, but their free-tier infrastructure degrades under aggregate load. Users see 15–30s spinners. Half bounce. Jack watches the Plausible dashboard in horror.

**The entire prevention is P0-A.** Disk-persisted cache in committed `proxy.js` means the cache survives the restart. The VPS warms up over the day before the post. First-user cache hits cost one Open-Meteo call; every subsequent user for that venue gets the cached response. 500 concurrent users = ~406 upstream calls total, not 203,000.

**P0-A ships in 5 minutes. It has been 79 days.**

---

## 8. Closed / Unchanged Items

- ✅ **Open #22 BASE_PRICES coverage** — 181 airports confirmed, all venue APs covered
- ✅ **Supabase delete-account** — SQL committed, UI ships graceful fallback
- ✅ **Sentry DSN** — configured and live
- ✅ **HTTPS everywhere** — no HTTP leaks in client code
- ✅ **Travelpayouts token off client** — TP_MARKER is public affiliate marker, server token stays server-side
- ✅ **GEAR_ITEMS** — 0 instances, Amazon cut holds

---

*Generated by automated DevOps agent — 2026-10-27 14:44 UTC*
