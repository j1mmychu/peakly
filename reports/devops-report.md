# DevOps Report — 2026-09-09 (YELLOW)

**Status: 🟡 YELLOW — Two prior false alarms corrected: BASE_PRICES is 100% covered (165/165 venue APs), not 91% gap. lateSeason count is 15 (10 unquoted + 5 JSON format), not 10 — both work identically at runtime. VPS Open #19/#21/#23 is Day 47 — pre-Reddit gate unchanged. 18 zombie branches static since May 2026. No new P0s.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Last confirmed healthy: 2026-08-11 post-redeploy. Treated as healthy per that prior verification. All proxy analysis is from committed source only.

---

## What Changed Since Yesterday

- **No app.jsx changes** since the Sep 7 AGP/AKL/GRU fix (commit `80e1721`). Venue count stable at **405** (134 ski / 271 beach) — matches `.venue-baseline` (405).
- **PM v144** corrected two false alarms from v143: BASE_PRICES gap and lateSeason regression both resolved as misdiagnoses. Confirmed here independently.
- **18 zombie branches** — unchanged for 119+ days (oldest from 2026-05-13).
- **VPS Open #19/#21/#23**: Day 47. Code committed. VPS still running Aug 11 build.
- **Cache stamp `20260907a`**: Day 3 with no app.jsx changes — normal, auto-push only bumps on edits.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| app.jsx lines | **14,152** (unchanged) |
| app.jsx bytes | **757,359** (~740 KB unminified) |
| dist/app.min.js | **495,408 bytes** (~484 KB, esbuild output, no Babel overhead) |
| Cache buster | `20260907a` — Day 3, no app.jsx edits, acceptable by policy |
| Plausible analytics | ✅ Active — `data-domain="j1mmychu.github.io/peakly"` `index.html:32` |
| Sentry DSN | ✅ Active — `9416b032...` wired `app.jsx:8` and `index.html:77` |
| React CDN | ✅ 18.3.1 from `cdnjs.cloudflare.com` (SLA-backed, pinned) |
| Babel CDN | ✅ 7.24.7 from `cdnjs.cloudflare.com` (dev-only — stripped by esbuild in prod) |
| Production build | ✅ `deploy.yml:40` runs `node scripts/build-web.mjs` on every push |
| Lazy loading | ✅ 9/9 `<img>` tags include `loading="lazy"` |
| VENUES count | ✅ **405** — matches `.venue-baseline` |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | ✅ HTTPS — `https://peakly-api.duckdns.org` (`app.jsx:6333`) |
| Travelpayouts token | ✅ Server-side only — `process.env.TRAVELPAYOUTS_TOKEN` (`proxy.js:13`) |
| CORS (committed code) | ✅ `capacitor://localhost` included; `DELETE` in Allow-Methods |
| Rate limiter XFF | ✅ `.pop()` (last entry) — forge bypass closed |
| `forecast_days` | ✅ 14 (weather), 10 (marine) in committed `proxy.js` |
| APNs transport | ✅ `http2.connect()` in committed code |
| APNs JWT signing | ✅ `dsaEncoding: 'ieee-p1363'` in committed code |
| Weather disk cache | ✅ `wx-cache.json` every 5min in committed code |

**⚠️ VPS REDEPLOY STILL PENDING (Day 47)** — `/opt/peakly-proxy` is NOT a git clone. Every fix above is in `server/proxy.js` on main but the live server is still the Aug 11 build with none of these fixes applied. The exact consequences in production right now:
- Two-weekend scoring broken (7-day forecast from old build → client's 2nd-weekend window gets no weather data)
- iOS native calls silently failing (no `capacitor://localhost` CORS on live server)
- Alert deletion silently failing (no `DELETE` in CORS Allow-Methods on live server)

**The deploy command:**
```bash
# SSH to 198.199.80.21 then:
cd /opt/peakly-proxy
# NOT a git clone — manually copy files:
curl -o proxy.js "https://raw.githubusercontent.com/j1mmychu/peakly/main/server/proxy.js"
npm install   # only if package.json changed — check first
pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
```

Time: 5 minutes. Zero code changes needed. This is a manual copy job.

---

## 3. Security Audit

| Check | Result |
|-------|--------|
| Exposed API keys/tokens | ✅ Clean — no secrets in `app.jsx` |
| Supabase anon key | ℹ️ `app.jsx:26` — public-safe anon key by design (RLS-gated). Expected. |
| Travelpayouts token | ✅ Server-side only |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` |
| Alert IDs | ✅ `crypto.randomUUID()` with `getRandomValues`/`Math.random` fallback (`app.jsx:10824`) |
| Recent commits | ✅ Clean — last 10 commits are reports only, no code changes |

---

## 4. BASE_PRICES Coverage — CONFIRMED 100% (CORRECTED)

Prior reports (including yesterday) stated 91% gap (15/165 airports covered). **This was wrong.** The original node one-liner used a single-line regex that only caught the first 15 entries before the `const BASE_PRICES = {` block's first multi-line pattern failed. The full count:

```
BASE_PRICES airports: 181
Venue APs in VENUES array: 165 unique
Venue APs missing from BASE_PRICES: 0
Coverage: 165/165 = 100.0%
```

The "100% backfill — 2026-08-24 (PM v129)" comment at `app.jsx:6614` was accurate all along. PM v144 corrected this; this audit confirms it. **Do not flag BASE_PRICES gap again — it is closed.**

---

## 5. lateSeason Flag — CONFIRMED 15 VENUES (CORRECTED)

Prior reports counted only the unquoted-key format (`lateSeason:true` — 10 venues). The VENUES array also contains JSON-format objects using `"lateSeason": true` (5 more). Both are syntactically valid JavaScript object properties and produce identical runtime behavior — `venue.lateSeason` evaluates to `true` for both. Content's regression claim was incorrect.

**Confirmed 15 lateSeason venues:**
- Unquoted format (10): whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch
- JSON format (5): snowbird, zermatt, engelberg, verbier, val-thorens

All 15 have the high-altitude profiles that justify the flag. Scoring logic at `app.jsx:5762` correctly reads `venue.lateSeason` for both formats. **CLAUDE.md's "14" count is stale — actual count is 15.** Do not flag this as a regression.

**One note on engelberg:** its JSON object ends with a trailing comma on the `lateSeason` line before the closing brace (`"lateSeason": true,`). This is valid JavaScript (trailing commas in object literals are legal ES5+) but could trip linters. Not a bug.

---

## 6. Open-Meteo Rate Limit Risk

Current: **405 venues** × ~2 API calls each = ~810 upstream requests per cold cache load, batched at 50 venues/2s (~32 seconds to fill from cold). At <10 MAU: zero risk. At 1K MAU simultaneous: proxy LRU cache (4000 entries, 2hr TTL) reduces this to ≈1 upstream call per unique coord pair.

**P0 on Reddit spike before VPS redeploy:** The live proxy (Aug 11 build) is missing the in-memory cache improvements. A 500-user Reddit spike hitting fresh at the same time could exceed Open-Meteo's ~10K calls/day free-tier ceiling within minutes. This is the entire reason the proxy exists. **VPS redeploy is the fix. It's been 47 days.**

---

## 7. Performance Analysis

| Metric | Value |
|--------|-------|
| Prod JS bundle (app.min.js) | 495 KB raw / ~130 KB gzip |
| React + ReactDOM (gzip) | ~172 KB combined |
| Total prod payload (gzip) | **~300 KB** |
| Babel (prod) | ✅ 0 KB — stripped by esbuild |
| Biggest bottleneck | Weather batch: 405 venues × 2 calls, 50/2s = ~32s cold load |
| Lazy loading | ✅ 9/9 img tags |
| CDN pinning | ✅ React 18.3.1, Babel 7.24.7 (dev) — exact versions |

The 32-second cold-cache weather fetch is the single largest performance issue visible from committed code. Users see skeleton loading states during this window. Mitigation: proxy cache (deployed) dramatically reduces this for returning users. First-load UX on a fresh deploy is the remaining gap.

---

## 8. Cost Estimate

| Tier | Infra Cost | Notes |
|------|-----------|-------|
| Current (<10 MAU) | **$6/month** | DO 1GB + GH Pages free + Supabase free |
| 1K MAU | **$6/month** | GH Pages handles static, Supabase free tier (500MB DB, 5GB bandwidth) holds |
| 10K MAU | **$18–24/month** | DO may need 2GB RAM ($12) + Supabase Pro ($25) if DB/bandwidth exceeds free tier |
| 100K MAU | **$60–120/month** | DO 4GB or 2× 2GB ($24) + Supabase Pro ($25) + CDN caching (Cloudflare free tier covers this) |

The jump from 10K→100K is not linear because GitHub Pages + Cloudflare CDN absorbs static asset traffic at zero cost. The bottleneck at 100K MAU is the VPS proxy's in-memory rate limiter (600 req/min per IP) — at that scale, switch to Redis-backed rate limiting. Cost: +$15/month.

---

## 9. Zombie Branches — Unchanged (Day 119+)

18 stale remote branches, all unchanged since 2026-05-13 or earlier:

```
claude/analyze-test-coverage-WVIsT    (2026-05-13)
claude/code-review-cleanup-HjoCS      (2026-05-13)
claude/condense-alert-page-jzdLo      (2026-05-13)
claude/enhance-loading-screen-rZ1dc   (2026-05-13)
claude/fix-app-jsx-content            (2026-06-23)
claude/implement-todo-lNL7W           (2026-05-13)
claude/improve-peakly-ui-UHCHG        (2026-05-13)
claude/improve-scoring-system-XYGY6   (2026-05-13)
claude/product-reliability-assessment-w0poL (2026-07-23)
claude/redesign-front-page-EndKs      (2026-05-13)
claude/review-peakly-UQ0Qu            (2026-05-13)
claude/simplify-alerts-page-2ejGB     (2026-05-13)
claude/simplify-profile-page-Bi2Tc    (2026-05-13)
claude/standardize-venue-data-CufiQ   (2026-05-13)
claude/streamline-onboarding-account-97XRR (2026-05-13)
fix-appjsx-final                      (2026-05-13)
restore-appjsx                        (2026-05-13)
test-small                            (2026-05-13)
```

**Delete them all (2-minute job, irreversible after push):**
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

## Priority Queue

1. **VPS redeploy (Open #19/#21/#23) — P1 pre-traffic gate, Day 47.** 5 minutes to do. Every day this waits is another day two-weekend scoring is broken, iOS native can't hit the proxy, and alert deletion silently fails. The command is above. **Stop calculating risk, do the copy.**

2. **CLAUDE.md lateSeason count update** — says "14", actual is **15**. One-line fix. Not blocking anything but causes false alarms every week.

3. **Zombie branch cleanup** — 18 branches polluting the remote. Command above. 2 minutes.

---

## What Breaks First at Scale

The VPS proxy is the single point of failure. At 1K MAU, if the proxy goes cold (restart, crash, OOM), every user hits Open-Meteo directly at full rate — 405 venues × 2 calls × N simultaneous users — and blows through the free-tier 10K/day ceiling in under a minute. The proxy disk cache (`wx-cache.json`) in committed code survives restarts; the live server (Aug 11 build) does NOT have it. So today, every `pm2 restart` wipes the weather cache and re-exposes the rate-limit risk. After the VPS redeploy (#19), a restart survives with the cached file. Until then, the proxy is more fragile than it looks. The second thing to break at scale is Supabase: the free tier's 5GB bandwidth cap and 500MB DB limit are comfortable at 1K MAU but get tight at 10K if users are aggressively syncing. Fix: Supabase Pro at $25/month when approaching limits.
