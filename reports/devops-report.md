# Peakly DevOps Report — 2026-07-24

**Status: GREEN** — No P0 or P1 issues. Day 10 code freeze (last code change July 20 jackson-hole dedup). Venue count 374 matches baseline. Cache stamp `20260720a` is 4 days old and accurate. esbuild CI pipeline operational, Babel eliminated from production. PM v95's "Jul 24 pre-compile CI deadline" was already met on June 20 (commit `8ba0ca3`) — nothing to act on today.

---

## Permanent Stop-Reporting Table

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block, not VPS outage. Never flag from sandbox.** |
| "Sentry DSN empty" | **Active at `app.jsx:8` and `index.html:77`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon CUT for v1.** Stop. |
| "Travelpayouts token in client" | **Server-side only. `TP_MARKER=710303` is public affiliate suffix, not a secret.** Stop. |
| "Supabase anon key exposed" | **Expected. RLS-gated. Public-safe by design (`app.jsx:24`).** Stop. |
| "Cache buster stale" | **Auto-bumps on code changes only. `20260720a` = last code change. Age alone ≠ stale.** Stop. |
| "Venue count 156 / 353 / 370 / 372 / 375 / 376 / 377" | **374 via category grep (132 ski / 242 beach). Bracket-walker false positive closed July 21. Stop permanently.** |
| "lateSeason: any count other than 14" | **14. Use `grep -c "lateSeason.*true" app.jsx`. Stop.** |
| "AP_CONTINENT gaps" | **PERMANENTLY CLOSED. 280 entries, all 146 venue `ap` codes present.** Stop. |
| "Babel mobile parse wall is unresolved / P1" | **RESOLVED. `build-web.mjs` + `deploy.yml` ships esbuild-compiled `app.min.js`. Babel not present in production. CLOSED. Stop.** |
| "jacksonhole / jackson-hole ghost dup" | **FIXED July 20 (`e2f02cd`).** Stop. |
| "poolPrimary: true = 25 venues" | **FALSE. 0 venues use poolPrimary.** Stop. |
| "venue-baseline drift" | **ROOT CAUSE CLOSED July 21. Real count = 374. Baseline = 374. Both match. Stop.** |
| "Cross-category photo contamination" | **FIXED July 6 (`73db399`).** Stop. |
| "Plausible domain wrong" | **FIXED July 7.** Stop. |
| "retention email unsent" | **COHORT CLOSED per PM v94. Stop.** |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` lines | 13,499 |
| `app.jsx` raw size | 675,826 bytes (659 KB) |
| Brace balance | 5,571 / 5,571 ✅ |
| `PEAKLY_BUILD` | `20260720a` |
| `sw.js` CACHE_NAME | `peakly-20260720a` |
| `index.html` `?v=` param | `20260720a` |
| All 3 stamps in lockstep | ✅ |
| Days since last stamp bump | 4 (July 20 → July 24) |
| Venue count (category grep) | **374** (132 ski / 242 beach) ✅ |
| Venue baseline | `374` ✅ matches |
| lateSeason venues | **14** (`grep -c "lateSeason.*true" app.jsx`) |
| Plausible analytics | ✅ Present, uncommented, correct domain (`j1mmychu.github.io/peakly`) |
| Sentry DSN | ✅ Active (`app.jsx:8`, `index.html:77`) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (no HTTP endpoints) |
| Travelpayouts token in client | ✅ None — server-side only |
| GEAR_ITEMS refs | ✅ 0 |
| Images lazy-loaded | ✅ 9 `loading="lazy"` sites |
| `.gitignore` covers secrets | ✅ `.env`, `*.pem`, `*.p8`, `*.key`, `*.pdf` all covered |
| React CDN | 18.3.1 ✅ |
| Babel CDN (source only) | 7.29.7 (production: **not loaded** — esbuild replaces it) |
| esbuild pipeline | ✅ `build-web.mjs` → `dist/app.min.js` (~439 KB, 33% smaller) |
| Babel in `dist/` | ✅ 0 references (build script asserts this with `process.exit(1)` on leak) |
| Flight proxy timeout | 5,000 ms + AbortController ✅ |
| Weather proxy timeout | 4,000 ms + AbortController ✅ |
| Supabase JS | Lazy-loaded ✅ |
| VPS health | ⚠️ Cannot verify from sandbox (egress blocked — documented behavior; last verified healthy July 22) |

---

## P0 — Critical (Fix Today)

**None.**

---

## P1 — High (Fix This Week)

**None.**

---

## P2 — Medium (Fix This Sprint)

### P2-A: No SRI Hashes on CDN Scripts (Persistent, Day 10+)

**Risk:** Unpkg CDN compromise → XSS into every Peakly user. Low probability but non-zero; affects React 18.3.1 and Babel 7.29.7 (source). Without `integrity=` attributes, the browser accepts whatever the CDN serves.

**Why not done yet:** Requires a one-time hash fetch. Babel 8 is ESM-only and incompatible — stay on 7.29.7 in source. Production doesn't load Babel at all (esbuild), so Babel SRI is low-value; React SRI is the real fix.

**Exact fix — fetch the hash once and paste into `index.html`:**

```bash
# Run locally or in CI. Generates the sha384 integrity hash for each CDN script.
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A | \
  awk '{print "sha384-" $0}'

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A | \
  awk '{print "sha384-" $0}'
```

Then update `index.html` lines 80–81:
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>" crossorigin="anonymous"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>" crossorigin="anonymous"></script>
```

**Time:** 5 minutes. **Priority:** Do before Reddit/HN post.

---

### P2-B: No CSP Meta Header

**Risk:** Without a Content Security Policy, any XSS (from SRI miss, compromised CDN, or Sentry/Supabase injection) has full access to localStorage, including the Supabase session token. A leaked session token → attacker reads/writes the user's synced wishlists and profile.

**Status change from prior reports:** Previously listed as "medium risk to apply (could break Babel inline eval)." With esbuild in production, `unsafe-eval` is no longer needed in the production bundle. CSP is now viable. This is the consequence of closing the Babel P1.

**Exact fix — add to `index.html` `<head>` after the charset meta:**

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://unpkg.com https://js.sentry-cdn.com https://plausible.io https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' https://images.unsplash.com data:;
  connect-src 'self' https://peakly-api.duckdns.org https://wsoqcfwkvvemtlddcgfc.supabase.co https://api.open-meteo.com https://marine-api.open-meteo.com https://plausible.io https://o4511108649058304.ingest.us.sentry.io;
  worker-src 'self';
">
```

**Note:** `'unsafe-inline'` is required for styles (inline `style={{}}` objects in JSX) and cannot be avoided without a full refactor. The high-value wins are locking `script-src` and `connect-src` — those prevent the worst-case token exfil.

**Time:** 15 minutes (add + test in browser that nothing breaks). **Priority:** Before App Store submission.

---

## Cost Projection

| MAU | GitHub Pages | VPS | Total/mo | Notes |
|-----|-------------|-----|----------|-------|
| Current (<100) | $0 | $6 | **$6** | VPS 1 GB RAM, plenty of headroom |
| 1K | $0 | $6 | **$6** | In-memory cache handles it comfortably |
| 10K | $0 | $12 | **$12** | Upgrade to 2 GB RAM ($12/mo) if weather cache evictions spike |
| 100K | $0 | $24–48 | **$24–48** | 2–4 GB RAM VPS OR Redis sidecar. GitHub Pages CDN eats all frontend load at $0. |

**Optimization opportunities:**
1. Open-Meteo is free-tier — at 100K MAU with high concurrency on popular venues, the shared VPS weather cache is the only protection. It already has 4000-entry LRU. At $0 cost, this is the highest-leverage infra already in place.
2. Travelpayouts flight pricing has a 3-attempt retry + 1.2s backoff and semaphore capping concurrent requests at 3. No cost risk.
3. Supabase free tier: 500 MB DB, 2 GB bandwidth. At 1K MAU with SYNCED_KEYS only (small payloads), this lasts well past 10K users before hitting limits.

---

## What Breaks First at Scale

**The VPS in-memory weather cache.** At ~500 concurrent DAU hammering the Explore tab simultaneously (think: Reddit/HN post goes viral on a Friday morning), venue weather fetches hit the VPS in a 374-venue burst. The current 4000-entry LRU covers every venue twice over, so cache hits are nearly guaranteed on repeat requests. The single failure mode is **VPS restart** — the cache evaporates, and 374 uncached venues each fan out to Open-Meteo in a ~50/2s batched burst. If Open-Meteo throttles at the free tier, half the Explore grid shows estimates. The fix is already in the client: `fetchWeather` falls back to direct Open-Meteo if the proxy is down, so user experience degrades gracefully (slower) rather than crashing. Real prevention: `pm2` auto-restarts the process; cache refills within 30 minutes of organic traffic. Or add a startup script that pre-warms the cache on the 10 most-popular venues. Cost: $0. Time: 30 minutes.

---

## July 24 Note: PM-Assigned "Pre-Compile CI Deadline"

PM v95 set today (July 24) as the deadline for "pre-compile CI." This is **already complete** — `scripts/build-web.mjs` has been running in `deploy.yml` since June 20 (`commit 8ba0ca3`). The production site at `j1mmychu.github.io/peakly` has been serving `app.min.js` (esbuild, no Babel) for 34 days. No action required. PM should close this item in the next report cycle.
