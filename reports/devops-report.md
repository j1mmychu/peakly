# DevOps Report — 2026-08-12 (YELLOW)

**Status: 🟡 YELLOW**

Day 20. Per CLAUDE.md, Jack SSH-deployed the VPS last night (2026-08-11 evening) — Open #19 marked CLOSED. Cannot independently confirm from this sandbox (403 = egress block, per documented sandbox behavior). Reddit deadline is **Aug 22 — 10 days**. No P0s in client code. BASE_PRICES gap (57% of destination airports unpriced) is the top remaining pre-launch quality hole.

---

## Fixes Applied This Run

None this run. Cache stamp is current (`20260811v`), no venue changes pending, EU batch was already blocked by prior DevOps run per data integrity audit. No code changes shipped.

---

## 1. LIVE SITE HEALTH

| Check | Result |
|-------|--------|
| `app.jsx` lines | 13,443 |
| `app.jsx` bytes | 679,775 (~664 KB raw) |
| Minified dist size | ~439 KB (per CLAUDE.md, esbuild output) |
| Cache stamp | `20260811v` — app.jsx / sw.js / index.html all in sync ✅ |
| dist/ committed stamp | `20260811r` — 4 commits stale (see P3 below) |
| Plausible analytics | ✅ present, uncommented — `data-domain="j1mmychu.github.io/peakly"` |
| Sentry DSN | ✅ live — `9416b032a46681d74645b056fcb08eb7` |
| Brace balance | 5437 / 5437 ✅ |
| Venue count | **376** (confirmed via eval, not grep) |
| lateSeason venues | 14 |
| CDN deps | React 18.3.1, Babel Standalone 7.29.7 (unpkg), both current |

---

## 2. FLIGHT PROXY STATUS

| Check | Result |
|-------|--------|
| Protocol | HTTPS ✅ — `https://peakly-api.duckdns.org` |
| Live health check | ⚠️ UNVERIFIABLE — sandbox egress blocked (403 from proxy, not VPS) |
| Per CLAUDE.md | Redeployed 2026-08-11 evening by Jack. `/health` confirmed `apns:configured`, fresh uptime. |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s AbortController timeout with fallback to BASE_PRICES estimate |
| `fetchWeather`/`fetchMarine` timeout | ✅ 4s timeout, falls back to direct Open-Meteo |

VPS status is **best-effort CLOSED per CLAUDE.md**. If Jack has not yet run the redeploy: `scp server/proxy.js ubuntu@198.199.80.21:/opt/peakly-proxy/ && ssh ubuntu@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy"`. Verify: `curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool`.

---

## 3. OPEN-METEO USAGE

- `forecast_days=14` for weather, `forecast_days=10` for marine ✅
- Client fetches directly to `api.open-meteo.com` with localStorage 2hr TTL cache
- Batching: 50 venues per 2s wave — protects free tier at small scale
- **Rate limit math:** 376 venues × (1 weather + 0.5 marine avg) ≈ 564 upstream calls per full cold refresh. At free tier limits (~10K/day), this allows ~17 full cold refreshes/day total across all users before throttling. With VPS cache live, simultaneous users collapse to 1 upstream call per lat/lon — Reddit-spike safe.

---

## 4. SECURITY AUDIT

| Check | Result |
|-------|--------|
| Travelpayouts token in client | ✅ ABSENT — `TP_MARKER = "710303"` is an affiliate marker, not an auth token. No server-side token leaked. |
| Supabase anon key in client | ✅ EXPECTED — public-safe by design, RLS-gated. `eyJhbGci...` on line 26. |
| Supabase service key | ✅ ABSENT |
| APNS private key | ✅ ABSENT — `.p8` in .gitignore |
| .env files | ✅ .gitignore covers `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`, `*.p12`, `*.p8` |
| Recent commits for secrets | ✅ Clean — last 20 commits are reports, CLAUDE.md updates, venue adds |
| Sentry DSN | ✅ Live, standard public DSN (client-side, expected) |

No secrets in client code. Security posture: clean.

---

## 5. PERFORMANCE ANALYSIS

**Biggest bottleneck: 376-venue cold-weather fetch.**

In dev mode (local `index.html`): Babel parses 664 KB of JSX on every cold load — 3-5s on mobile before first render. This is dev-only; production is fine.

In production: CI runs `node scripts/build-web.mjs` → esbuild pre-transpiles app.jsx → 439 KB minified. Babel eliminated entirely. Deploy via `deploy.yml` always runs fresh build from source regardless of committed dist/ state.

| Signal | Value |
|--------|-------|
| Image lazy loading | 9 `<img>` tags, all 9 have `loading="lazy"` ✅ |
| CDN scripts | 2 (React + Babel) via unpkg — no SRI attributes (known Open #10) |
| Weather batch | 50 venues / 2s — appropriate throttle |
| localStorage cache | 2hr TTL per venue lat/lon — reduces repeat fetches |

**Bottleneck on scale:** If cache misses coincide with a traffic spike (post-Reddit post), 376+ simultaneous Open-Meteo calls could hit the free tier. VPS weather cache (now deployed) collapses this — one upstream call per coord, shared across all users.

---

## 6. BASE_PRICES COVERAGE — P1

This is the largest remaining data quality hole.

```
Venue destination APs: 134 unique airports in VENUES[]
BASE_PRICES destination entries: 100 (many are home airports, not venue APs)
Venue APs MISSING from BASE_PRICES: 76 of 134 (56.7% gap)
```

**76 airports with no deal score data:**
`AIT, AUA, BEY, BME, BOB, BOC, CAG, CHQ, CMB, CZM, DAD, DBV, DJE, DLM, EAS, ENI, EWR, EYW, FAO, FCA, FEN, GCM, GEG, GIG, GOI, GUC, HNA, HUX, INH, JMK, JNX, JTR, KBV, KOA, KRK, KUL, LEA, LOP, MAH, MBA, MBJ, MCT, MLO, MPH, MYR, NAP, OKA, OSL, PDX, PMI, PPP, PQC, PRI, RAK, RDD, RHO, SEZ, SID, SJD, SNA, SOF, SPU, SRQ, STT, TAB, TBS, TFS, TGD, TPA, TPS, USH, USM, UVF, VPS, YKA, ZCO`

Any venue whose `ap` is in this list gets `getDealScore() → null`, which means the deal badge never fires and the sort-by-deal column has no data. This affects a majority of the catalog.

**Fix (2-3 hours):** Add entries for the top ~20 missing APs by venue count. Example block to add to `BASE_PRICES`:

```javascript
// High-traffic missing APs (add to BASE_PRICES object)
BOB: { JFK:2400, LAX:1900, SFO:1950, BOS:2500, CHI:2100 }, // Bora Bora — premium beach
CUN: { JFK:380,  LAX:450,  SFO:480,  BOS:420,  CHI:390  }, // Cancun — high-volume beach
KOA: { JFK:780,  LAX:310,  SFO:320,  BOS:820,  CHI:680  }, // Kona — Hawaii beach
TPA: { JFK:220,  LAX:350,  SFO:380,  BOS:230,  CHI:260  }, // Tampa — beach cluster
MBJ: { JFK:380,  LAX:650,  SFO:680,  BOS:420,  CHI:520  }, // Montego Bay
SJD: { JFK:510,  LAX:280,  SFO:310,  BOS:560,  CHI:450  }, // Los Cabos
GEG: { JFK:380,  LAX:200,  SFO:220,  BOS:420,  CHI:320  }, // Spokane ski
PMI: { JFK:820,  LAX:980,  SFO:960,  BOS:850,  CHI:900  }, // Palma de Mallorca
DBV: { JFK:900,  LAX:1050, SFO:1030, BOS:930,  CHI:960  }, // Dubrovnik
NAP: { JFK:760,  LAX:920,  SFO:900,  BOS:790,  CHI:850  }, // Naples IT
```

---

## 7. COST ESTIMATE

| MAU | Monthly Cost | Notes |
|-----|-------------|-------|
| Current (~0) | $6 | DigitalOcean 1GB droplet only. GitHub Pages + Open-Meteo free. |
| 1K MAU | $6 | No change. VPS cache absorbs weather load easily. |
| 10K MAU | $18–30 | May need $12 DO droplet (2GB). Supabase free tier: 500MB DB limit, 50K MAU auth — 10K is safe. |
| 100K MAU | $70–180 | DO $24-48 (4GB + block storage for weather cache disk). Open-Meteo commercial at $450/mo OR stay free if VPS cache is effective. Supabase Pro at $25/mo. Plausible Growth at $36/mo. |

**Cost optimization opportunities:**
1. Open-Meteo free tier survives indefinitely if VPS cache hit rate stays >95% — protect it by ensuring disk persistence (Open #23) lands before Reddit post.
2. Travelpayouts flight data is the only revenue-correlated API — no cost, no rate limit risk.
3. No image hosting costs (photos are hosted on Unsplash CDN via direct URLs).

---

## Critical Issues (P0)

**None.** Client code is clean, proxy is HTTPS, no secrets exposed, Sentry live.

---

## High Issues (P1)

### P1-A: BASE_PRICES — 76 of 134 venue airports unpriced (56.7% gap)

The deal score is a headline feature. 56.7% of destination airports produce no deal badge and no price comparison. This is a bad first impression when the Reddit post lands in 10 days.

**Time to fix:** 2-3 hours. Add top ~20 missing APs (see §6 above for the code block). Use real-world route pricing from Google Flights spot checks — the matrix only needs 3-5 origin cities per destination (JFK, LAX, SFO, BOS, ORD).

### P1-B: APNS / Push Alerts still non-functional (APNS_LIVE = false)

`APNS_LIVE = false` on line 12369. The HTTP/2 + JWT P1363 fix is committed in `server/proxy.js` (shipped 2026-08-11 with VPS redeploy). But `APNS_LIVE` in `app.jsx` still needs to be flipped to `true` once Jack confirms `/health` shows `apns:configured`.

**Exact fix (30 seconds once APNS is confirmed):**
```javascript
// app.jsx line 12369 — change:
const APNS_LIVE = false;
// to:
const APNS_LIVE = true;
```

Verify first: `curl -s https://peakly-api.duckdns.org/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('apns','not found'))"`

---

## Medium Issues (P2)

### P2-A: 18 stale remote branches

PM v116 authorized deletion. Clutter makes it hard to see real in-flight work.

```bash
# Delete all claude/* branches + known stale branches
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

**Time to fix:** 2 minutes.

### P2-B: dist/ tracked in git and perpetually stale

`dist/` is in `.gitignore` but files were force-added and are now tracked. CI always rebuilds from source (the committed dist/ is immediately overwritten), making the committed dist/ a dead artifact. Current state: `dist/` at `20260811r`, `app.jsx` at `20260811v` — a 4-commit gap.

This creates confusion: anyone cloning and opening `dist/index.html` locally gets 4-revision-old code. Not a live-site issue (CI rebuilds), but a trap for developers and a source of diff noise in every commit.

**Options:**
- Option A (recommended): Stop committing dist/ — remove from tracking, let CI own it entirely.
  ```bash
  git rm -r --cached dist/
  # Remove 'dist/' line from .gitignore (it's already there — that's why it was supposed to be ignored)
  git commit -m "stop tracking dist/ — CI builds it fresh on every push"
  ```
- Option B: Keep tracking dist/ but have auto-push.sh always run the build before committing.

Option A is cleaner. CI pipeline is the source of truth for dist/.

**Time to fix:** 10 minutes.

### P2-C: No SRI on CDN scripts (Open #10, long-standing)

React 18.3.1 and Babel 7.29.7 load from unpkg with no `integrity=` attribute. A supply-chain compromise of unpkg would execute arbitrary code in the app. Medium risk; the only mitigation today is pinned semver (`18.3.1` and `7.29.7` are exact, not range).

**Fix:**
```bash
# Generate SRI hashes
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<hash>" crossorigin="anonymous"` to each `<script>` tag in `index.html`. **Note:** Babel's inline eval of JSX requires a CSP `unsafe-eval` exception — do not add a CSP meta tag without testing Babel first.

**Time to fix:** 30 minutes.

---

## P3 Issues (Fix Later)

- **`TP_MARKER = "710303"` visible in source:** Affiliate marker only, not an auth token. No security risk. Cosmetically cleaner to env-var it but not worth the complexity in a single-file no-build-step SPA.
- **VPS weather cache disk persistence (Open #23):** In-memory `_wxCache` is wiped on `pm2 restart`. Jack may or may not have bundled the disk-persistence fix into the 2026-08-11 redeploy. Verify: `curl https://peakly-api.duckdns.org/health` and check if `wx_cache_size` recovers after a restart without a traffic spike.
- **Supabase account-deletion SQL:** Still needs a one-time paste into the SQL editor (App Store 5.1.1(v)). Blocked on Jack. Not a web-launch blocker.

---

## Scale: What Breaks First

**Open-Meteo free tier is the single most fragile dependency.** The client calls `api.open-meteo.com` directly (4s timeout, localStorage 2hr TTL) before trying the VPS proxy. If the VPS is cold (just restarted, cache empty) and a Reddit post drives 200 concurrent users, each user fetches weather independently, the 2hr localStorage cache provides zero cross-user protection, and Open-Meteo rate-limits or blocks the domain.

**Prevention:** Confirm the VPS disk-persistence fix (Open #23) is deployed. If it's not, a pm2 restart wipes the cache and leaves you vulnerable to a cold-cache spike for 30-60 minutes post-restart. Second line of defense: the client's `_tryProxyWx()` timeout is 4s — on a cold VPS miss, users fall back to direct Open-Meteo. The batching (50 venues / 2s) only applies to the client's own sequential fetching, not cross-user parallelism. At 100K MAU this becomes a real cost center: Open-Meteo commercial is $450/mo. The fix is ensuring the VPS cache is always warm.
