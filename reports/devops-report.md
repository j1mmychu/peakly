# Peakly DevOps Report — 2026-06-19

**Status: 🟢 GREEN**

All core invariants pass. Cache stamp was 1 day stale (`20260618a`) — bumped to `20260619a` in this run. No P0s. Two P1s (Babel not in PRECACHE, SRI missing on React/Babel). Friday June 20 Reddit post deadline per PM v62 — confirm VPS health from a networked terminal before posting.

> **Sandbox note:** Outbound egress to `peakly-api.duckdns.org`, `github.io`, and Open-Meteo is blocked from this remote execution environment. VPS health and live-site smoke cannot be verified here. A sandbox 403/timeout is never evidence the live service is down. Last confirmed VPS healthy: June 13 (networked session). Jack: run `curl https://peakly-api.duckdns.org/health` manually before Friday's Reddit post.

---

## Fixes Applied This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache stamp `20260618a` → `20260619a` | `app.jsx:17` | 1 day stale |
| SW CACHE_NAME bump | `sw.js:2` | Evicts stale cached assets from user SW |
| Query string bump | `index.html:395` | Forces browser reload of updated app.jsx |

---

## Full Invariant Check

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,195 lines / 662 KB raw (~175 KB gzip est.)** |
| CDN scripts | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, uncommented, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (pre-fix) | `20260618a` — 1 day stale |
| Cache stamp (post-fix) | `20260619a` — bumped this run ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260619a` ✅ |
| Sentry DSN | Configured, `defer`'d at `index.html:77` ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — CDN-failure-safe ✅ |
| Venue count (eval) | **358** (130 skiing / 228 beach) ✅ |
| Duplicate IDs | **0** ✅ |
| Brace balance | **5548 open / 5548 close — BALANCED** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| Images | `loading="lazy"` on all venue card `<img>` tags ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live (line 12242) ✅ |
| `deleteAccount()` | Wired in `useCloudSync` (line 6674) ✅ |
| `weatherDown` banner | Live in ExploreTab (line 8736) ✅ |
| `ScoringExplainer` | Live (line 8643) ✅ |
| `DEAL_WEIGHT` | `0.25` (conditions 75% / price 25%) ✅ |
| `lateSeason: true` venues | **14** (6 original + 8 S. hemisphere batch) ✅ |
| Supabase eager script | **Removed** — lazy-loaded only ✅ |
| Leaflet eager script | **Removed** — lazy-loaded only ✅ |
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old HTTP IP (`104.131.82.242`) | Not present in client code ✅ |
| `fetchTravelpayoutsPrice` timeout | `AbortController` 5s + estimate fallback ✅ |
| `_tryProxyWx` timeout | 4s + null-return → direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | **Not present** — server-side only ✅ |
| `TP_MARKER` in client | `"710303"` — public affiliate marker, not a secret ✅ |
| `auto-push.sh` path | Dynamic (`git rev-parse --show-toplevel`) — fixed June 17 ✅ |
| PRECACHE | `[]` — Babel NOT cached in SW — see P1-1 below |
| SRI on React/Babel | Missing — see P1-2 below |

---

## Venue Count Note

CLAUDE.md says 353 venues; actual eval-count is **358** (the June 18 Content report added 5 S. America venues). CLAUDE.md venue count is stale by +5. Not a bug — the count is higher, which is better. Update CLAUDE.md's "353" references to "358" on the next manual session.

---

## P1 — Fix This Week

### P1-1: Babel Standalone Not Cached in Service Worker — Every Cold Visit Downloads 961KB

`PRECACHE = []`. Babel Standalone at 7.29.7 is ~961KB minified / ~290KB gzip. Every first-time visitor re-downloads it from unpkg even if they've visited before and the SW is active.

Caching Babel in PRECACHE means SW install pre-fetches it once at registration time, and all subsequent loads — including after cache-stamp-forced SW refreshes — serve Babel from disk.

**Fix in sw.js:**

```js
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];
```

One-line change. The existing `Promise.allSettled` install handler already handles the caching; this just populates the list. SW re-registers on the next stamp bump so the pre-fetch fires cleanly.

**Risk:** If unpkg has an outage at SW install time, `allSettled` (already in place) means the install succeeds anyway — Babel just serves from unpkg normally on that visit. Zero regression risk.

---

### P1-2: No SRI on React, ReactDOM, or Babel Script Tags

Leaflet has integrity hashes (`sha256-...`). React, ReactDOM, and Babel do not. A compromised unpkg response would execute with full access to localStorage (Supabase auth tokens, wishlists, profile data).

**Fix — generate hashes from a networked terminal:**

```bash
for url in \
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js" \
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" \
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"; do
  hash=$(curl -fsSL "$url" | openssl dgst -sha384 -binary | openssl base64 -A)
  echo "integrity=\"sha384-$hash\"  # $url"
done
```

Then add `integrity="sha384-<hash>" crossorigin="anonymous"` to each `<script>` tag in `index.html`.

**Time to fix:** 10 minutes. Blocker: needs a networked terminal (egress to unpkg blocked from this sandbox).

---

## P2 — Fix This Sprint

### P2-1: Sentry Sample Rate Low for Pre-Launch Traffic Volume

`tracesSampleRate: 0.05` at <100 DAU means 95% of errors evaporate before Sentry sees them. This is the wrong tradeoff at launch.

**Fix (app.jsx lines 9–10):**

```js
tracesSampleRate: 1.0,         // drop to 0.1 after MAU > 500
replaysSessionSampleRate: 0.5, // drop to 0.05 after MAU > 500
```

### P2-2: CDN Dependency Versions — Major Upgrades Available, Hold

| Dependency | Pinned | Latest | Action |
|---|---|---|---|
| React + ReactDOM | 18.3.1 | 19.2.7 | **Hold** — React 19 has breaking concurrent changes |
| Babel Standalone | 7.29.7 | 8.0.2 | **Hold** — Babel 8 may break JSX transform; no test harness |
| Supabase JS | 2.106.2 | Check npm | Safe to take minor patches; check changelog for auth fixes |
| Leaflet | 1.9.4 | 1.9.4 | Current ✅ |

React 18.3.1 and Babel 7.29.7 are the correct pins. Don't chase major versions without a test environment.

### P2-3: No Content Security Policy

Architecture constraint: `unsafe-eval` required for Babel's JSX runtime. CSP that disables `unsafe-eval` kills the app.

Deferred until after launch. When ready, minimum viable meta CSP:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://js.sentry-cdn.com https://plausible.io;
  connect-src 'self' https://*.supabase.co https://peakly-api.duckdns.org https://api.open-meteo.com https://marine-api.open-meteo.com https://tp.media;
  img-src 'self' https://images.unsplash.com data:;
  font-src 'self' https://fonts.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
">
```

---

## Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts auth token in client | **Not present** ✅ |
| Supabase anon key exposed | Yes — expected, RLS-gated, public-safe by design ✅ |
| No auth credentials beyond anon key + Sentry DSN | ✅ |
| `.gitignore` covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, business PDFs | ✅ |
| Recent commits scanned for secrets | No secrets found in last 10 commits ✅ |
| Bare HTTP IP in client fetch calls | None ✅ |

---

## JS Payload Estimate

| Asset | Minified | Gzip est. |
|---|---|---|
| React + ReactDOM (UMD) | ~130KB | ~42KB |
| Babel Standalone | ~961KB | ~290KB |
| app.jsx | ~522KB | ~160KB |
| Leaflet | ~142KB | ~47KB (lazy) |
| Supabase JS | ~450KB | ~150KB (lazy) |
| **Eager total (cold visit)** | **~1.6MB** | **~492KB** |

Leaflet and Supabase are now lazy-loaded — not part of the initial parse. First-visit eager payload: ~492KB gzip. Primary optimization lever: cache Babel in SW (P1-1 above) to eliminate repeat-visit re-download.

---

## Cost Projection

| Scale | DO VPS | GitHub Pages | Sentry | Open-Meteo | Total/mo |
|---|---|---|---|---|---|
| Now (<100 MAU) | $6 | $0 | Free | Free | **$6** |
| 1K MAU | $6 | $0 | Free | Free | **$6** |
| 10K MAU | $12 | $0 | ~$26 | Free | **~$38** |
| 100K MAU | $48 | $0 | ~$200 | Possible overage | **~$250+** |

**What breaks first at scale:** At ~66+ concurrent DAU hitting overlapping venue sets, Open-Meteo free-tier rate ceiling (10K/day, 600/min) starts returning 429s. VPS weather cache (in-memory 2hr, wx_cache_size confirmed 538 on June 13) is the mitigation. Verify cache is populated (`/health` → `wx_cache_size > 0`) from a networked terminal before any Reddit/HN post tomorrow. If the VPS went cold after the June 10 reboot restart and nobody has hit it since, the cache will be empty on first spike.

---

## Jack's Pre-Launch Checklist (Friday June 20)

1. ✅ Cache stamp `20260619a` — shipped in this commit
2. ⬜ **VPS health check** — `curl https://peakly-api.duckdns.org/health` (verify `wx_cache_size > 0`)
3. ⬜ **Supabase delete-account.sql** — paste into Supabase SQL editor (App Store 5.1.1(v))
4. ⬜ **SRI hashes for React/Babel** — 10 min, needs networked terminal (P1-2)
5. ⬜ **Babel in SW PRECACHE** — 1-line change (P1-1), low risk, high repeat-visit payoff
6. ⬜ **Sentry sample rate to 1.0** until MAU > 500 (P2-1)
7. ⬜ **Update CLAUDE.md venue count** 353 → 358 (cosmetic, not urgent)
