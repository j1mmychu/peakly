# DevOps Report — 2026-10-07 (YELLOW)

**Status: 🟡 YELLOW — VPS Day 59 (Oct 4 deadline missed, still not deployed). Code freeze Day 23 clean. `origin/master` BACK on remote (false-alarm closure yesterday — branch is alive). 11 days to Oct 18 launch.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). All proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | **14,237 lines / 759 KB raw** (unchanged, code freeze Day 23) |
| VENUES (category grep) | **404 total — 134 skiing / 270 beach** ✅ |
| lateSeason:true venues | **15** ✅ (10 compact + 5 JSON format; grep-only returns 10, misleading — use eval) |
| Plausible analytics | ✅ present, uncommented (`index.html:32`) |
| Sentry DSN | ✅ configured and non-empty (`app.jsx:8`, `index.html:77`) |
| React 18.3.1 (cdnjs) | ✅ |
| Babel Standalone 7.24.7 (cdnjs) | ✅ dev-only; esbuild strips in production |
| `PEAKLY_BUILD` / `CACHE_NAME` stamp | ℹ️ `"20260914a"` — frozen Day 23 (expected: no app.jsx commits) |
| All API calls HTTPS | ✅ `FLIGHT_PROXY = "https://peakly-api.duckdns.org"` |
| Travelpayouts token in client | ✅ NOT present — `TP_MARKER="710303"` is affiliate marker only, not a secret |
| Supabase anon key in client | ✅ Intentional, public-safe (RLS-gated, JWT expires 2093) |
| No other credentials in client | ✅ Clean |
| `.gitignore` covers `.env`, `*.pem`, `*.p8`, `*.key` | ✅ Confirmed |
| Image lazy loading | ✅ 9 `loading="lazy"` tags confirmed |
| fetchTravelpayoutsPrice timeout | ✅ AbortController 4s (`app.jsx:6381`) |

**Zero code commits to app.jsx/sw.js/index.html in 23 days. Code freeze holds.**

---

## 2. ⚠️ P1 RE-OPENED: `origin/master` Footgun — Back on Remote

Yesterday's report closed this as RESOLVED — incorrect. Today's `git branch -r` shows `origin/master` is alive:

```
origin/master → b6dc033 "auto: terms.html"
```

That is a stale branch from early 2026 (auto-commits for terms.html/privacy.html). It sits 100+ commits behind `origin/main` and carries none of the current app.jsx.

**Why this is a P1:** A deploy.yml misconfiguration, GitHub Pages default-branch flip, or a panicked contributor pushing to "master" over "main" will resurrect stale code to production. This happened in the past (the CLAUDE.md master-footgun history). Pre-launch is the worst time for it.

**Fix (2 minutes, Jack on SSH or GitHub UI):**

Option A — Delete via GitHub UI:
> Settings → Branches → delete `master`

Option B — CLI:
```bash
git push origin --delete master
```

After deletion, confirm:
```bash
git fetch --prune && git branch -r | grep master
# Should return nothing
```

Also present: 15 stale `claude/*` branches + `fix-appjsx-final`, `restore-appjsx`, `test-small` all pointing at old commits. Not launch-blockers individually, but clutter. Clean them in one shot:

```bash
git push origin --delete \
  fix-appjsx-final \
  restore-appjsx \
  test-small \
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
```

**ETA: 3 minutes. Pre-launch hygiene.**

---

## 3. Flight Proxy Status — 🔴 RED (Day 59)

No change from prior reports. Committed but undeployed fixes in `server/proxy.js`:

| Fix | Impact |
|-----|--------|
| `forecast_days: 14` (currently 7) | Two-weekend scoring returns null for ALL 404 venues |
| `capacitor://localhost` in CORS | iOS native calls blocked outright |
| `DELETE` in `Allow-Methods` | Alert deletion silently fails (preflight blocked) |
| Rate limiter reads last X-Forwarded-For | Forgeable IP — anyone can bypass rate limiting |
| Weather cache disk persistence (Open #23) | Cold restart wipes cache; launch-day traffic spike → rate limit |

**11 days to launch. One 4-line SSH session unblocks all of it:**

```bash
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save"
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Verify: forecast_days:14, uptime <60s
```

**ETA: 2 minutes with SSH keys configured. This is the only infra blocker for launch.**

---

## 4. SW PRECACHE Babel Mismatch — P3 (Day 4)

`sw.js:4` caches: `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js`
`index.html:88` loads: `https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js`

Wrong CDN, wrong version. The cached entry is never hit. Production unaffected (no Babel in prod build). Not worth breaking code freeze for. Queue for first post-launch app.jsx commit:

```js
// sw.js line 3–5
const PRECACHE = []; // browser HTTP cache handles Babel fine
```

---

## 5. Security Audit — ✅ GREEN

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ NOT present |
| Supabase anon key | ✅ Intentional, RLS-gated |
| Sentry DSN | ✅ Intentional (front-end SDK design) |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.p8`, `*.key`, `*.pdf`, `*.pptx` |
| Recent git commits with secrets | ✅ Clean — 5 most recent are daily reports only |

---

## 6. Performance Analysis — ✅ GREEN

| Asset | Size |
|-------|------|
| app.jsx raw | 759 KB |
| dist/app.min.js (production esbuild) | ~439 KB minified |
| React 18 + ReactDOM UMD | ~140 KB gzipped |
| Babel Standalone (dev-only) | ~620 KB gzipped |
| Supabase JS (lazy-loaded) | ~80 KB gzipped |

**Production first load: ~580 KB gzipped** (app.min.js + React). Acceptable.
**Bottleneck:** Open-Meteo rate ceiling on cold-cache restart (see Cost/Scale section).
**Image lazy loading:** 9 `loading="lazy"` tags confirmed.

---

## 7. Cost Projection

| Scale | GitHub Pages | DigitalOcean VPS | Supabase | Open-Meteo | Total |
|-------|-------------|-----------------|----------|------------|-------|
| Current (<100 MAU) | $0 | $6/mo | $0 | $0 | **$6/mo** |
| 1K MAU | $0 | $6/mo | $0 (free tier) | $0 | **$6/mo** |
| 10K MAU | $0 | $12/mo (2GB) | ~$25/mo (Pro) | $0 | **~$37/mo** |
| 100K MAU | $0 | $48/mo | ~$25/mo | ~$20/mo | **~$93/mo** |

Revenue at $7.58/1K MAU covers infra from Day 1.

---

## What Breaks First at Scale

**Open-Meteo rate limiting on cold-cache restart.** The VPS deploy (required before launch) wipes the in-memory weather cache. A traffic spike in the first minutes after restart — exactly what happens when a Reddit post lands — sends all 404 venues' weather endpoints raw. Open-Meteo free tier: ~600 req/min. 30 concurrent users on Explore hits ~300 uncached coord pairs in 60 seconds. You'll hit the ceiling before the cache fills. Open #23 (disk-persisted cache, ~30 lines in `server/proxy.js`) prevents this. Bundle it with the VPS deploy. Without it, "conditions unavailable — pull to refresh" is the fallback — not a crash, but a bad first impression on Reddit Day 1.

---

## Open Items (priority order)

| # | Item | Status | Day count |
|---|------|--------|-----------|
| P0 | VPS redeploy (`proxy.js` → `198.199.80.21`) | ❌ UNDEPLOYED | **Day 59** |
| P1 | `origin/master` footgun | ❌ RE-OPENED (yesterday's close was incorrect) | **Day 14** |
| P2 | Open #23 — weather cache disk persistence | ❌ OPEN | Bundle with VPS |
| P3 | SW PRECACHE Babel CDN/version mismatch | ❌ OPEN | Day 4 |
| ℹ️ | Code stamp frozen at `20260914a` | Expected during freeze | Day 23 |

**11 days to Oct 18. VPS deploy is the only launch blocker. Re-open the master footgun.**
