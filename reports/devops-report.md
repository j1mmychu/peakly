# Peakly DevOps Report — 2026-06-17

**Status: 🟡 YELLOW**

Cache stamp was 1 day stale (`20260616b`) — bumped to `20260617a` this run. All other core invariants are healthy: GEAR_ITEMS = 0 (Amazon cut holds), 358 venues verified, App Store readiness features present. Two standing P1s remain unresolved: `scripts/auto-push.sh` is hardcoded to a Mac path that silently no-ops in every remote/Linux session, and the Open-Meteo rate ceiling is getting tighter as the venue catalog grows (now triggers at ~14 simultaneous cold-loading users, down from 33 at launch). No P0s.

> **Sandbox note:** Outbound egress to `peakly-api.duckdns.org`, `github.io`, and Open-Meteo is blocked from this remote execution environment. VPS health and live-site smoke cannot be verified here. All findings are code-side only. A sandbox 403/timeout is never evidence the live service is down.

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache stamp `20260616b` → `20260617a` | `app.jsx:17` | 1 day stale |
| SW CACHE_NAME bump | `sw.js:2` | Evicts stale cached assets on next visit |
| Query string bump | `index.html:395` | Forces browser reload of updated app.jsx |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,189 lines / 662 KB raw (~175 KB gzip est.)** |
| CDN scripts | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, uncommented, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (pre-fix) | `20260616b` — 1 day stale |
| Cache stamp (post-fix) | `20260617a` — bumped this run ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260617a` ✅ |
| Sentry DSN | Configured at `index.html:77` (deferred, off critical path) ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — CDN-failure-safe ✅ |
| Venue count (eval) | **358** (130 skiing / 228 beach) ✅ |
| `.venue-baseline` | **358** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| Images | `loading="lazy"` on all venue card `<img>` tags ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live ✅ |
| `deleteAccount()` | Wired in `useCloudSync` ✅ |
| `weatherDown` banner | Live ✅ |
| `ScoringExplainer` | Live ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS via Caddy ✅ |
| Old HTTP IP (`104.131.82.242`) | Not present in client code ✅ |
| `fetchTravelpayoutsPrice` timeout | `AbortController` 8s timeout + graceful estimate fallback ✅ |
| `_tryProxyWx` timeout | 4s + null-return fallback → direct Open-Meteo ✅ |
| Travelpayouts token in client | **Not present** — `process.env.TRAVELPAYOUTS_TOKEN` server-side only ✅ |
| TP_MARKER in client | `"710303"` — public affiliate marker, not a secret ✅ |
| VPS health | **Not verifiable from sandbox** — last confirmed live June 10 per CLAUDE.md |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo base URLs | `api.open-meteo.com`, `marine-api.open-meteo.com` ✅ |
| Batch size | 100 venues/batch, 500ms inter-batch throttle ✅ |
| Rate limit math | **358 venues × 2 calls = 716 upstream calls per cold user load** |
| Free tier headroom | 10K calls/day ÷ 716 = **14 simultaneous cold-loading users = throttle** |
| VPS proxy mitigation | 2hr shared cache absorbs repeat coords — critical dependency |

The venue catalog grew from 156 → 358 since launch design. The original rate math assumed 33 simultaneous users; it's now **14**. Without the VPS proxy absorbing duplicate coordinate requests, a small Reddit mention hits the ceiling. The proxy is a single point of failure with no fallback caching.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | **Clean** — server-side `process.env` only ✅ |
| Supabase anon key | `app.jsx:26` — intentionally public, RLS-gated per Supabase design ✅ |
| APNS keys | Server-side env vars only (`process.env.APNS_KEY_ID`, etc.) ✅ |
| `.gitignore` | Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.pdf`, `*.pptx` ✅ |
| Sentry DSN | `index.html:77` — expected, Sentry DSNs are public-safe ✅ |
| `GEAR_ITEMS` | 0 — no Amazon code in client ✅ |
| Recent commits | Last 20 reviewed — no credential leaks ✅ |

### P2 — No SRI on CDN Scripts

Only Leaflet has `integrity=sha256-...`. Plausible, Sentry, React, ReactDOM, Babel, and Supabase have no subresource integrity check. If any CDN is compromised, arbitrary JS runs with full access to DOM + localStorage (including Supabase session tokens).

**Fix — generate and add `integrity=` to React + ReactDOM first:**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```
Then add `integrity="sha384-<hash>" crossorigin="anonymous"` to each `<script>` tag. Skip Babel — it varies per content negotiation and will break SRI. Prioritize Supabase next (holds auth tokens).

---

## 5. Performance Analysis

### CDN Bundle

| Library | Version | Gzip est. |
|---------|---------|-----------|
| Babel Standalone | 7.29.7 | **~884 KB** — dominant bottleneck |
| React | 18.3.1 | ~45 KB |
| ReactDOM | 18.3.1 | ~130 KB |
| Supabase JS | 2.106.2 | ~80 KB (lazy) |
| Leaflet JS | 1.9.4 | ~40 KB (lazy) |
| `app.jsx` (raw, Babel input) | — | **662 KB → ~175 KB gzip** |

**Estimated total initial payload: ~1.25 MB gzipped**

### Single Largest Bottleneck

**Babel Standalone (~884 KB gzip).** The browser must download, parse, and execute all of Babel before it can parse a single line of app.jsx. On 3G (1.5 Mbps) this is 4–5 seconds of blank screen. No fix without a build step (deliberately excluded by architecture). The existing `<link rel="preload">` is the correct mitigation — already in place.

**app.jsx has grown 47% since the last audit** (522 KB → 662 KB). Babel parse time scales linearly with input size. Set a soft size alarm at 750 KB raw.

### Image Loading

`loading="lazy"` on all venue card `<img>` tags ✅

---

## 6. Cost Estimate

| Scale | Infrastructure | Monthly Cost |
|-------|---------------|-------------|
| Current (<100 MAU) | GitHub Pages (free) + $6 DO VPS | **$6/mo** |
| 1K MAU | Same | **$6/mo** |
| 10K MAU | Open-Meteo paid ($29/mo for 10K req/hr) | **~$35/mo** |
| 100K MAU | Open-Meteo paid + $24/mo DO (4 GB VPS) | **~$180/mo** |

Supabase free tier handles 500 MB DB + 50K monthly active users ✅. GitHub Pages CDN is globally distributed and free ✅. Right-sized for current traffic.

---

## P1: Fix This Week

### P1-A — auto-push.sh Mac path fails silently in remote sessions (recurring, 4th report)

`scripts/auto-push.sh` line 11:
```bash
REPO=/Users/haydenb/peakly   # ← Mac absolute path — fails on every Linux/remote session
```

Every remote container resolves `GIT_TOP_REAL=/home/user/peakly`. The guard fires, script exits silently. Any remote agent that edits app.jsx without manually bumping the cache stamp ships stale assets. This has caused a stale stamp on June 3, 4, 16, and 17.

**Fix — 2-line change:**
```bash
# REMOVE:
REPO=/Users/haydenb/peakly
cd "$REPO"

# REPLACE WITH:
REPO="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$REPO"
```

Remove the subsequent `REPO_REAL`/`GIT_TOP_REAL` comparison block — it's redundant once `REPO` is always the git root.

**Also: install the missing crontab entry (Open #11, still not done):**
```
45 17 * * * cd ~/peakly && bash scripts/auto-push.sh
```

Until P1-A is fixed, any agent that modifies `app.jsx` must manually bump all three files in lockstep. Consider adding this as an explicit instruction to `tasks/agents/*.md`.

### P1-B — Open-Meteo rate ceiling at 14 simultaneous cold-loading users

Rate math: 358 venues × 2 API calls = 716 upstream calls per cold load. Free tier: 10K/day. **Threshold: 14 simultaneous cold-loading users.** This is survivable today but not after any public launch moment (Reddit, HN, App Store featuring). Confirm VPS proxy is live before any launch post: `curl https://peakly-api.duckdns.org/health` → confirm `wx_cache_size > 0`.

---

## P2: Fix This Sprint

### P2-A — SRI on React + ReactDOM + Supabase CDN scripts
See Section 4. Estimated time: 30 minutes. Reduces supply-chain attack surface.

### P2-B — app.jsx size ceiling
At 662 KB raw, one more big content sprint pushes through 750 KB. Babel parse time is the only end-user cost but it's non-trivial on mid-range mobile. Track `wc -c app.jsx` in the daily DevOps check and flag when it crosses 750 KB.

---

## Recurring Pattern: Cache Stamp Staleness After Remote Agent Edits

This is the **4th consecutive DevOps report** flagging a stale cache stamp caused by a remote agent editing app.jsx without bumping the stamp. Root cause: auto-push.sh Mac path. Fix: P1-A above (5 minutes). Until it's done, every agent touching app.jsx leaves users on a stale build for up to 24 hours.

---

## Scale Failure Prediction

**What breaks first:** Open-Meteo throttle at 14 simultaneous cold-loading users. Symptoms are silent — partial 429 degradation means some venues get weather data, others don't; scores partially flatten. The `weatherDown` banner only fires when ALL fetches fail, so partial degradation is invisible to users. They see a normal-looking Explore feed with wrong scores and no explanation. The VPS proxy is the only shield — single point of failure, no warm fallback. **Mitigation: verify proxy health before any launch push, and monitor `/health` after. Secondary option: Cloudflare Workers free tier as a caching layer in front of Open-Meteo if VPS reliability becomes a concern.**

---

*DevOps agent — 2026-06-17. Cache bumped: `20260616b` → `20260617a`.*
