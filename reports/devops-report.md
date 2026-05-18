# Peakly DevOps Report — 2026-05-18

**Status: 🟡 YELLOW**

No P0s. Two P1s — one is a 2-minute version bump, one is a 5-minute `index.html` edit. One P2 cluster around missing SRI + CSP that's been flagged before. VPS proxy redeploy is still unresolved and appears in every report — that's the operational debt that will bite hardest at launch.

---

## 1. LIVE SITE HEALTH

| Metric | Value | Status |
|--------|-------|--------|
| `app.jsx` lines | 8,837 | ✅ |
| `app.jsx` bytes | 524,394 (~512KB raw, ~120KB gzip est.) | ✅ |
| Cache buster | `20260513j` — 5 days stale (no code changes since then) | ⚠️ |
| Plausible analytics | Present, uncommented, `data-domain="j1mmychu.github.io"` | ✅ |
| All CDN deps HTTPS | ✅ | ✅ |
| Proxy URL (FLIGHT_PROXY) | `https://peakly-api.duckdns.org` — HTTPS ✅ | ✅ |
| Sentry DSN | Configured (`9416b032a46681d74645b056fcb08eb7`) | ✅ |
| React CDN | `18.3.1` (latest: `19.2.6`) | ⚠️ |

Cache buster `20260513j` is technically accurate — no code changes since 2026-05-13. But the moment any edit lands without bumping it, stale service workers will serve old code to every cached user. The bump must be part of every ship from here.

---

## 2. FLIGHT PROXY STATUS

| Check | Result |
|-------|--------|
| Proxy URL scheme | HTTPS ✅ |
| `fetchTravelpayoutsPrice` timeout | 5,000ms ✅ |
| AbortController wired | ✅ |
| Fallback on timeout | Returns `null` → UI shows estimate (`~$X`) ✅ |
| Travelpayouts TOKEN in client | NOT present ✅ (server-side env var only) |

Proxy is clean. The outstanding VPS redeploy (`git pull && pm2 restart peakly-proxy`) from 2026-05-04 — 14 days pending — means weekend-specific pricing and the Open-Meteo shared cache are **not live in production**. Every user is hitting Open-Meteo directly. The proxy cache that prevents Reddit-spike death is a no-op until that SSH session happens.

---

## 3. WEATHER & EXTERNAL API

| Check | Value |
|-------|-------|
| Open-Meteo free tier | 10,000 req/day |
| Beach venues | 86 |
| Skiing venues | 64 |
| Cold-load API calls (top 100 venues) | ~150 weather + ~86 marine = **~236 calls/load** |
| Break-even at free tier (no proxy) | **42 unique cold loads/day** |
| With 2hr client cache | ~6-8 concurrent users before problems |
| With VPS proxy cache (2hr shared) | 1 upstream call per (lat,lon) per 2hr — Reddit-spike safe |

**The math is tight without the proxy cache deployed.** At 42 cold loads/day = launch day Twitter burst is instant rate-limit. The VPS redeploy is the only fix. Open-Meteo commercial plan is €0.05/1K calls — budget $50/month post-10K MAU.

Batching logic (50/batch, 1s throttle between batches) is correct ✅. Client-side localStorage cache (2hr TTL, 6hr hard eviction) is correct ✅. The proxy fallback in `_tryProxyWx()` is wired correctly — 4s timeout, falls back to direct Open-Meteo cleanly ✅.

---

## 4. SECURITY AUDIT

| Check | Result |
|-------|--------|
| Travelpayouts API token in client | NOT present ✅ |
| Supabase anon key in client | Present (by design — RLS-gated, public-safe) ✅ |
| Sentry DSN in client | Present (by design — Sentry requires it) ✅ |
| TP_MARKER in client | Present (`710303`) — tracking marker, not a secret ✅ |
| `.gitignore` covers `.env` | ✅ |
| `.gitignore` covers `.p8`, `.pem`, `.key` | ✅ |
| SRI on React/ReactDOM | ❌ MISSING |
| SRI on Babel Standalone | ❌ MISSING |
| SRI on Supabase JS | ❌ MISSING |
| SRI on Sentry CDN | ❌ MISSING |
| SRI on Leaflet | ✅ (sha256 hashes present) |
| CSP meta tag | ❌ MISSING |
| Secrets in recent commits | None found ✅ |
| Business plan re-leak risk | `.gitignore` covers `*.pdf`, `*.pptx`, `.~lock.*` ✅ |

Missing SRI on 4 of 5 CDN scripts. Leaflet is the only one with integrity hashes — and it's the least dangerous of the five. If unpkg or Sentry CDN are compromised, malicious JS runs in the app with full DOM access. This has been flagged in previous reports and not acted on — documenting again.

---

## P1 — HIGH (fix before public launch)

---

### P1-A: Supabase JS pinned 61 minor versions behind (2.45.4 → 2.106.0)

**Current:** `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js`
**Latest:** `2.106.0`

61 minor releases is not a routine drift — that's ~6 months of patches including security fixes in `@supabase/auth-js`. Magic-link auth flows, RLS token handling, and realtime all live in this library. Running 2.45.4 while the latest is 2.106.0 is unnecessary risk.

**Fix — `index.html` line 85, 1-line change:**

```html
<!-- BEFORE -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>

<!-- AFTER -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.0/dist/umd/supabase.min.js"></script>
```

**Test:** Open Profile tab → tap "Sign in" → verify magic-link form renders → check console for Supabase errors. Magic-link redirect, session persistence, cloud sync upsert should all work. The API surface is stable across 2.x.

**Time to fix:** 5 minutes including test.

---

### P1-B: Babel Standalone pinned 5 minor versions behind (7.24.7 → 7.29.4)

**Current:** `https://unpkg.com/@babel/standalone@7.24.7/babel.min.js`
**Latest:** `7.29.4`

Babel Standalone is the single largest CDN dependency (850KB uncompressed). It parses and transpiles all 512KB of `app.jsx` on the main thread at cold load — this is already the app's biggest performance liability. Running a 5-version-old release means missing transpiler correctness fixes and parser improvements that reduce the parse overhead.

**Fix — `index.html` lines 92–93:**

```html
<!-- BEFORE -->
<link rel="preload" href="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js" as="script" crossorigin />
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>

<!-- AFTER -->
<link rel="preload" href="https://unpkg.com/@babel/standalone@7.29.4/babel.min.js" as="script" crossorigin />
<script src="https://unpkg.com/@babel/standalone@7.29.4/babel.min.js"></script>
```

**Test:** Full reload, check console for Babel parse errors. Babel 7.x is backward compatible — no JSX changes needed in `app.jsx`.

**Time to fix:** 3 minutes.

---

## P2 — MEDIUM (fix this sprint)

---

### P2-A: Missing SRI on React, Babel, Supabase, Sentry

Only Leaflet has integrity hashes. The four heaviest scripts — including Babel, which executes with full eval privileges — have no supply-chain protection.

CSP is blocked by Babel's `unsafe-eval` requirement (it uses `new Function()` internally for transpilation). That's a known architectural tradeoff. SRI is independent of CSP and doesn't require `unsafe-eval` — it just verifies the file hash on download.

**Fix — generate hashes and add `integrity` attributes:**

```bash
# Run these to get the SHA-384 SRI hashes for each script:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.4/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.0/dist/umd/supabase.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add to each tag:
```html
<script integrity="sha384-<HASH_FROM_ABOVE>" crossorigin="anonymous" src="..."></script>
```

**Time to fix:** 20 minutes (hash generation + verify each script loads correctly after adding integrity attribute).

---

### P2-B: Plausible `data-domain` will break on domain migration

```html
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```

When `peakly.app` goes live and traffic redirects, Plausible will stop recording events. Every DAU, page view, and conversion event from launch day will be silently lost. This is a 1-minute fix but must happen before or during domain migration, not after.

**Fix (do this when registering `peakly.app` in Plausible dashboard):**

```html
<!-- Add peakly.app as secondary domain in Plausible dashboard, then: -->
<script defer data-domain="peakly.app,j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>
```

The comma-separated format sends events to both domains during transition.

**Time to fix:** 5 minutes (requires Plausible dashboard access).

---

### P2-C: Cache buster discipline reminder

`PEAKLY_BUILD = "20260513j"` — last bumped 5 days ago. No code changes since, so it's technically valid. The `auto-push.sh` PostToolUse hook handles bump-on-commit. No code change needed — but verify the hook is firing correctly: after next deploy, confirm `PEAKLY_BUILD` in `app.jsx` matches the deployed version. If auto-push is silently misfiring, stale service workers will break updates for cached users without any error surface.

---

## 5. PERFORMANCE ANALYSIS

### CDN payload breakdown (cold load, no cache)

| Library | Approx. size (compressed) | Notes |
|---------|--------------------------|-------|
| **Babel Standalone 7.24.7** | **~350KB gzip** | Parses + transpiles 512KB JSX at runtime. Main-thread blocker. |
| React 18.3.1 + ReactDOM | ~55KB gzip | Fine |
| Supabase JS 2.45.4 | ~80KB gzip | Eager load even for anon visitors (in known-skipped.md) |
| Leaflet 1.9.4 | ~45KB gzip | Fine |
| Sentry CDN | ~30KB gzip | Fine |
| Google Fonts | ~30KB | Fine |
| app.jsx | ~120KB gzip | Transpiled at runtime by Babel |
| **Total** | **~710KB gzip / ~2MB raw** | |

**Single largest bottleneck:** Babel Standalone. 850KB raw library + 512KB JSX = ~1.4MB of JS that must parse and execute before React can mount. On a mid-tier Android on 4G, this is a 3-5 second blank screen. The only real fix is a build step that ships pre-transpiled `app.js` and drops Babel from the browser entirely.

**Image optimization:** All `<img>` tags use `loading="lazy"` ✅. Unsplash images use `?w=800&h=600&fit=crop` — consider `&q=75&auto=format` for WebP delivery when MAU > 100 (already in known-skipped.md, revisit at scale).

---

## 6. COST ESTIMATE

| Scale | Monthly Infra Cost | Notes |
|-------|-------------------|-------|
| Current (0–100 MAU) | **$6/month** | DigitalOcean 1GB droplet + GitHub Pages free |
| 1,000 MAU | **$6/month** | Proxy handles load. Open-Meteo free tier holds with proxy cache deployed. |
| 10,000 MAU | **$52/month** | Upgrade droplet to 2GB ($12) + Open-Meteo commercial (~€15) + Supabase Pro ($25) |
| 100,000 MAU | **$130–160/month** | 2× droplets + load balancer ($50) + CDN edge ($10) + Open-Meteo 1M calls ($50) + Supabase Pro ($25) |

**Optimization opportunities:**
1. Pre-transpile `app.jsx` with Babel CLI and ship `app.js` — eliminates 850KB Babel CDN load + 3-5s runtime transpile. Biggest perf+cost win available.
2. Lazy-load Supabase JS — saves ~80KB on cold load for 95%+ of users who don't sign in.
3. VPS redeploy (2 minutes of SSH) removes direct Open-Meteo dependency — the single highest-ROI infra action available right now.

---

## 7. WHAT BREAKS FIRST AT SCALE

**Open-Meteo rate limit (10K/day free tier) is the first thing that breaks**, and it breaks fast. A single Reddit post driving 500 concurrent users = 500 × ~236 API calls = 118,000 calls in minutes — 11.8× the daily free allowance consumed in hour one. The VPS proxy with shared in-memory cache is already written, already on the server, and already wired in the client as a fallback. The only missing step is `git pull && pm2 restart peakly-proxy` on 198.199.80.21. That's 2 minutes of SSH. It has been pending 14 days.

After that: Supabase free tier (500MB DB, 50K MAU) and DigitalOcean 1GB RAM are the next breakpoints — both in the 10K MAU range, both with clean upgrade paths.

---

## ACTIONS REQUIRED

| Priority | Action | Owner | Est. Time |
|----------|--------|-------|-----------|
| **P1 — TODAY** | SSH → `git pull && pm2 restart peakly-proxy` on 198.199.80.21 | Jack | 2 min |
| P1 | Bump Supabase JS `2.45.4 → 2.106.0` in `index.html:85` | AI | 5 min |
| P1 | Bump Babel `7.24.7 → 7.29.4` in `index.html:92-93` | AI | 3 min |
| P2 | Add SRI hashes to React, Babel, Supabase, Sentry scripts | AI | 20 min |
| P2 | Add `peakly.app` to Plausible `data-domain` before domain migration | Jack | 5 min |
| Future | Evaluate pre-transpiling `app.jsx` as deploy step | Discuss | 1hr |
