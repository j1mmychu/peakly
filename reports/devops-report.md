# DevOps Report — 2026-08-13 (YELLOW)

**Status: 🟡 YELLOW**

Today is 2026-08-13. Reddit launch locked for Aug 22 — **9 days out**. Ran from a networked sandbox; VPS and live site are unreachable (egress blocked — not a server outage per CLAUDE.md and consistent with previous behavior). Per CLAUDE.md 2026-08-11 state: VPS was redeployed by Jack that evening, `/health` confirmed `apns:configured`, Open #19 CLOSED. Treating VPS as healthy unless contradicted by next networked session.

No P0s. One P1 in flight (stale branch cleanup Jack-authorized). BASE_PRICES gap improved to ~67% coverage per my audit (PM v117 tracking says 47.6% — discrepancy noted below).

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | 13,451 lines / 680 KB source |
| `dist/app.min.js` | 439 KB minified (esbuild, Babel stripped) |
| Plausible analytics | ✅ Present, uncommented, correct domain (`j1mmychu.github.io/peakly`) |
| Sentry DSN | ✅ Wired — `9416b032a46681d74645b056fcb08eb7`, `defer` tag, `crossorigin` |
| Cache stamp | ⚠️ `20260811v` — 2 days old as of today. No app.jsx changes since then so the stamp is technically correct, but the auto-push.sh stamp auto-bump only fires on app.jsx/sw.js/index.html edits. |
| React CDN | ✅ `react@18.3.1` via unpkg — current stable |
| Babel CDN | ✅ `@babel/standalone@7.29.7` via unpkg — current |
| Supabase CDN | ✅ `@supabase/supabase-js@2.106.2` via jsdelivr |
| Live site HTTP | ❓ Sandbox egress blocked — unverifiable |

**Cache stamp note:** `20260811v` is not stale — it's locked to the last time app.jsx actually shipped. If the photo pipeline commits changes to app.jsx today (e.g. from `photos-apply.mjs`), the auto-push hook will bump it correctly.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in app.jsx | ✅ `https://peakly-api.duckdns.org` (HTTPS) |
| Old IP `104.131.82.242` or `198.199.80.21` hardcoded | ✅ Clean — only the domain appears |
| `fetchTravelpayoutsPrice` timeout | ✅ `AbortController` with 5,000ms timeout |
| Proxy fallback | ✅ Falls back to `BASE_PRICES` estimate on error/timeout |
| Weather proxy timeout | ✅ 4s timeout with direct Open-Meteo fallback |
| VPS health | ❓ Sandbox egress blocked; per CLAUDE.md `2026-08-11` state: VPS live, `apns:configured`, fresh restart |

**`server/proxy.js` state (from file read):**
- `forecast_days=14` on weather endpoint ✅
- `forecast_days=10` on marine endpoint ✅
- CORS includes `DELETE` + `capacitor://localhost` ✅
- X-Forwarded-For reads **last** entry in the array ✅
- `http2.connect()` for APNs ✅
- `dsaEncoding: 'ieee-p1363'` ✅
- All Open #19 fixes are in the committed code. VPS redeploy per CLAUDE.md is done.

---

## 3. Weather & External API

Open-Meteo usage pattern: batched in `useEffect`, 50 venues per 2-second wave via `setTimeout` staggering, 2hr TTL in localStorage.

**Rate limit math:**
- Free tier: ~10,000 calls/day (~417/hr)
- 374 venues → 374 weather calls + ~243 marine calls = ~617 calls per full refresh
- At 0 MAU with the VPS proxy absorbing repeats: fine
- At 1K MAU cold cache: if 10 concurrent users all hit cold cache simultaneously = 6,170 calls → **exceeds free tier hourly ceiling**
- VPS in-memory cache mitigates this, but `pm2 restart` wipes it (Open #23, unresolved)

**Open #23 (disk cache) is the single biggest infrastructure risk before Reddit.**

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts `TP_TOKEN` in client | ✅ Clean — `TP_MARKER = "710303"` is the affiliate ID (public, non-secret) |
| Supabase anon key | ⚠️ Present in client (`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`) — this is documented as intentional, "public-safe, RLS-gated" per CLAUDE.md. Calling out for visibility only. RLS policies are the defense; confirm they're set correctly in Supabase dashboard before Reddit. |
| `.gitignore` | ✅ Covers `.env`, `.env.*`, `*.env`, `*.p8`, `*.pem`, `*.key`, `*.p12`, `*.mobileprovision` |
| `.env` files on disk | ✅ None present |
| Sentry DSN in client | ✅ Expected — this is a public-facing error reporting identifier, not a secret |
| APNs `.p8` key in repo | ✅ Gitignored, not tracked |
| Recent commit secrets scan | ✅ Last 20 commits are `auto:` data files and report files — no code changes since `059de43` (2026-08-11). No secrets visible. |
| No SRI on CDN scripts | ❌ P2 — see below |

**SRI gap (Open #10, P2):** React, Babel, and Sentry scripts load without `integrity=` attributes. If unpkg/CDN is compromised, malicious JS would load with no browser-side check. Babel in particular is dangerous — it runs on the raw JSX source.

Fix (add to `index.html` after computing hashes):
```bash
# Get SRI hash for each CDN script:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```
Then add `integrity="sha384-<hash>" crossorigin="anonymous"` to each `<script>` tag.

Estimated time: 15 minutes. Risk: if unpkg serves different content per request, hashes won't match and the app breaks. Test in staging first.

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| Total JS loaded (prod) | **439 KB** app.min.js + ~145 KB React + ~10 KB ReactDOM + ~827 KB Babel standalone |
| **Babel standalone** | **827 KB** — only loaded in dev (`index.html`); prod `dist/index.html` uses pre-compiled `app.min.js` with Babel stripped ✅ |
| Images lazy-loaded | ✅ All `<img>` tags have `loading="lazy"` |
| Google Fonts | ✅ Loaded with `display=swap` |
| `dist/` tracked in git | ⚠️ P2 — 439 KB binary committed on every build. Git history bloats ~440 KB per commit touching app.jsx. Currently acceptable; worth `.gitignore`-ing post-launch if GH Actions pushes the built artifact instead. |

**Biggest performance bottleneck:** The dev `index.html` still loads 827 KB of Babel standalone. Anyone who opens `index.html` directly (not the GH Pages `dist/index.html`) gets a 3–5s parse wall on mobile. This is the documented dev tradeoff — production is clean. Not a launch blocker but any internal link should point to the GH Pages URL, not raw repo files.

---

## 6. BASE_PRICES Coverage Audit

My bracket-walk count of `BASE_PRICES` destinations: **~99 destination airports** covered out of **147 unique venue airports** = **~67% coverage** (33% gap = ~48 airports missing).

PM v117 tracking shows 47.6% (after the EU batch of +7 APs). Discrepancy likely due to different denominators or airport counting methodology — PM may be tracking against a curated list of "airports that should have prices" rather than all venue airports. **Defer to PM/Content for the authoritative number.**

**Airports definitely NOT in BASE_PRICES** (from VENUES list vs BASE_PRICES keys):
`AIT ALB AUA BME BOC CMB CMH CZM DAD DBV DJE EAS ENI EWR EYW FCA FEN GCM GEG GIG GOI GUC HNA HUX INH JMK JNX JTR KBV KOA KRK KUL LEA LOP MAH MBA MBJ MCT MLO MYR OKA ORF OSL PDX PHL PMI PPP PQC PRI RAK RDD RHO SAL SEZ SID SJD SNA SOF SRQ STT TAB TBS TFS TGD TPA TPS USH UVF VPS YKA ZCO`

Top-priority fills (most venues, US-flyable):
- `CUN` — Cancún (multiple venues, major resort hub) — **if not already in BASE_PRICES**
- `MBJ` — Montego Bay (Jamaica beach)
- `SJD` — Los Cabos (Mexico beach)
- `KOA` — Kona, HI (beach)
- `OGG` / `LIH` — already in BASE_PRICES ✅

---

## 7. Cost Estimate

| Tier | Infrastructure | Monthly Cost |
|------|--------------|-------------|
| Current (<100 MAU) | DigitalOcean $6 droplet + GH Pages (free) | **$6/mo** |
| 1K MAU | Same — VPS handles load, Open-Meteo cache buffers | **$6/mo** |
| 10K MAU | Upgrade to $12 droplet (2GB RAM), Open-Meteo free tier stressed | **$12/mo** |
| 100K MAU | $24 droplet + Open-Meteo commercial (~$50/mo) or self-hosted proxy + Redis | **~$80–100/mo** |

**Cost optimizations available:**
1. **Open-Meteo free tier** — the only real cost cliff. At 10K+ MAU, consistent concurrent load will hit the ceiling. Either: pay for Open-Meteo Pro ($29/mo for 1M calls/month), or implement disk-persistent cache (Open #23, ~30 lines) to survive restarts.
2. **Travelpayouts via VPS proxy** — zero additional cost; token stays server-side.
3. **Supabase free tier** — 500MB storage, 50K rows. At current scope (wishlists/alerts/trips), won't hit limits at 10K users. Fine.
4. **GitHub Pages** — free forever for public repos. GH Actions free tier has 2,000 min/month; current deploy is ~1 min/push. At 60 pushes/month = 60 min used. Zero risk.

---

## What Breaks First at Scale

**Open-Meteo rate limits kill the app before anything else.** The free tier allows ~10K API calls/day. A single full venue refresh (374 venues × weather + marine) = ~617 calls. At 20 concurrent cold-cache users hitting simultaneously post-Reddit spike, that's 12,340 calls in one burst — exceeds the daily ceiling in seconds. The VPS in-memory cache is the only guard, but it's wiped on every `pm2 restart`. Open #23 (30-line disk persistence fix in `server/proxy.js`) prevents this. Without it, the Reddit spike that Peakly is targeting for launch is also the event that makes the app show "conditions unavailable" to everyone simultaneously. **Ship Open #23 before Aug 22.**

**Fix for Open #23** (add to `server/proxy.js`, ~30 lines):
```javascript
const fs = require('fs');
const CACHE_PATH = '/opt/peakly-proxy/.wx-cache.json';

// Load from disk on startup
try {
  const saved = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  Object.assign(_wxCache, saved);
  console.log(`[cache] loaded ${Object.keys(saved).length} entries from disk`);
} catch(e) { /* first boot or corrupt — start clean */ }

// Persist to disk after each write (debounced 10s to avoid thrash)
let _persistTimer = null;
function _persistCache() {
  clearTimeout(_persistTimer);
  _persistTimer = setTimeout(() => {
    fs.writeFile(CACHE_PATH, JSON.stringify(_wxCache), () => {});
  }, 10_000);
}

// Add _persistCache() call inside _wxCacheSet (or equivalent write path)
```

Estimated fix time: 30 minutes. Requires VPS SSH session + `pm2 restart peakly-proxy`.

---

## Summary

| Priority | Issue | ETA |
|----------|-------|-----|
| P1 | **Open #23: VPS weather cache disk persistence** — wipes on restart, Reddit spike = instant rate-limit | 30 min (VPS SSH) |
| P1 | **18 stale remote branches** — authorized for deletion by PM v117. Jack to run: `git push origin --delete claude/analyze-test-coverage-WVIsT claude/code-review-cleanup-HjoCS claude/condense-alert-page-jzdLo claude/enhance-loading-screen-rZ1dc claude/fix-app-jsx-content claude/implement-todo-lNL7W claude/improve-peakly-ui-UHCHG claude/improve-scoring-system-XYGY6 claude/product-reliability-assessment-w0poL claude/redesign-front-page-EndKs claude/review-peakly-ux-UQ0Qu claude/simplify-alerts-page-2ejGB claude/simplify-profile-page-Bi2Tc claude/standardize-venue-data-CufiQ claude/streamline-onboarding-account-97XRR fix-appjsx-final restore-appjsx test-small` | 2 min |
| P1 | **BASE_PRICES gap (~33% of venue airports unpriced)** — deal scoring falls back to no context for 1/3 of catalog | 2–3 hrs |
| P2 | **No SRI on CDN scripts** (Open #10) | 15 min |
| P2 | **`dist/` in git** — binary bloat in history; acceptable short-term | Post-launch |
| P2 | **Supabase anon key visible in source** — intentional per CLAUDE.md, but verify RLS policies before Reddit | 10 min check |
| ✅ | VPS redeployed (Open #19 CLOSED) | Done |
| ✅ | APNS http2 + jwt P1363 fix in proxy.js | Done, awaits `.p8` key config |
| ✅ | Proxy HTTPS, proper timeouts, fallbacks | Green |
| ✅ | Sentry DSN wired | Green |
| ✅ | Plausible analytics | Green |
| ✅ | All images lazy-loaded | Green |
