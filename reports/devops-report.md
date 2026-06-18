# Peakly DevOps Report — 2026-06-18

**Status: 🟢 GREEN**

All core invariants pass. Cache stamp was 1 day stale (`20260617a`) — bumped to `20260618a` this run. The previously recurring P1-A (auto-push.sh Mac path) was fixed by PM v61 on June 17 — no longer re-flagging. New finding this run: **the content agent's photo duplicate audit has had a regex bug for 3+ days generating false-positive "5× regression" reports** — prompt corrected in `tasks/agents/content-data.md`. Photo dedup from June 13 is actually holding at max 3× in real venue slots. No P0s.

> **Sandbox note:** Outbound egress to `peakly-api.duckdns.org`, `github.io`, and Open-Meteo is blocked from this remote execution environment. VPS health and live-site smoke cannot be verified here. A sandbox 403/timeout is never evidence the live service is down. Last confirmed VPS healthy: June 13 (networked session, CLAUDE.md §Current State 2026-06-13).

---

## Fixes Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| Cache stamp `20260617a` → `20260618a` | `app.jsx:17` | 1 day stale |
| SW CACHE_NAME bump | `sw.js:2` | Evicts stale cached assets |
| Query string bump | `index.html:395` | Forces browser reload of updated app.jsx |
| Content agent photo-audit regex fixed | `tasks/agents/content-data.md` | Was `photo-[0-9]+` (strips hex suffix → false positives); now `photo-[a-f0-9]+-[a-f0-9]+\?` (full Unsplash ID). Also added node eval-counter instruction and post-pivot category note (2 categories only). |

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,195 lines / 662 KB raw (~175 KB gzip est.)** |
| CDN scripts | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, uncommented, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (pre-fix) | `20260617a` — 1 day stale |
| Cache stamp (post-fix) | `20260618a` — bumped this run ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260618a` ✅ |
| Sentry DSN | Configured at `index.html:77` (deferred, off critical path) ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — CDN-failure-safe ✅ |
| Venue count (eval) | **358** (130 skiing / 228 beach) ✅ |
| `.venue-baseline` | **358** ✅ |
| Brace balance | **5548 open / 5548 close — balanced** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| Images | `loading="lazy"` on all venue card `<img>` tags ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live ✅ |
| `deleteAccount()` | Wired in `useCloudSync` ✅ |
| `weatherDown` banner | Live ✅ |
| `ScoringExplainer` | Live ✅ |
| `DEAL_WEIGHT` | `0.25` (conditions 75% / price 25%) ✅ |
| `lateSeason: true` venues | **6** (Whistler, Chamonix, Mammoth, Tignes, Cervinia, Arapahoe Basin) ✅ |
| `AIRPORT_COORDS` | 363 codes, complete per PM v61 ✅ |
| `AP_CONTINENT` | Complete ✅ |
| Photo dedup max (real) | **3× per full Unsplash photo ID** — June 13 dedup holds ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS via Caddy ✅ |
| Old HTTP IP (`104.131.82.242`) | Not present in client code ✅ |
| `fetchTravelpayoutsPrice` timeout | `AbortController` 5s timeout + graceful estimate fallback ✅ |
| `_tryProxyWx` timeout | 4s + null-return fallback → direct Open-Meteo ✅ |
| Travelpayouts token in client | **Not present** — `process.env.TRAVELPAYOUTS_TOKEN` server-side only ✅ |
| TP_MARKER in client | `"710303"` — public affiliate marker, not a secret ✅ |
| VPS health | **Cannot verify from sandbox** — last confirmed June 13. Jack: `curl https://peakly-api.duckdns.org/health` before Friday Reddit post |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo base URLs | `api.open-meteo.com`, `marine-api.open-meteo.com` ✅ |
| Batch size / throttle | 100 venues/batch, 500ms inter-batch throttle ✅ |
| Rate limit math | **130 ski × 1 call + 228 beach × 2 calls = 586 upstream calls per cold user** |
| Free tier headroom | 10K calls/day ÷ 586 = **17.1 simultaneous cold-loading users = throttle** |
| VPS proxy | 2hr shared cache absorbs repeat-coord hits — single point of failure |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | **Clean** — server-side `process.env` only ✅ |
| Supabase anon key | `app.jsx:26` — intentionally public, RLS-gated per Supabase design ✅ |
| APNS keys | Server-side env vars only ✅ |
| `.gitignore` | Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.pdf`, `*.pptx` ✅ |
| Sentry DSN | `index.html:77` — Sentry DSNs are public-safe ✅ |
| `GEAR_ITEMS` | 0 — no Amazon code in client ✅ |
| Recent commits | Last 10 reviewed — no credential leaks ✅ |

### P2 — No SRI on CDN Scripts

React, ReactDOM, Babel, Sentry, and Supabase lack `integrity=sha384-...` attributes. A compromised CDN can inject arbitrary JS with full localStorage access (including Supabase session tokens). Babel can't have SRI (content negotiation changes the response hash); React + ReactDOM + Supabase can.

**Fix — generate hashes and add integrity attributes:**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```
Add `integrity="sha384-<hash>" crossorigin="anonymous"` to each `<script>` tag in `index.html`. Do Supabase next (holds auth session tokens). Skip Babel — SRI breaks it. ~30 minutes.

---

## 5. New Finding: Content Agent Photo Audit Has a Regex Bug (Fixed This Run)

**Three consecutive days of false-positive "5× photo regression" reports.** The content agent's photo audit command was:

```bash
grep -oE 'photo-[0-9]+' app.jsx | sort | uniq -c | sort -rn
```

Unsplash URLs have the form `photo-1544550581-5f7ceaf7f992`. The `[0-9]+` pattern captures only the first numeric segment (`photo-1544550581`), stripping the unique `-5f7ceaf7f992` hex suffix. Two completely different photos like `photo-1544550581-5f7ceaf7f992` and `photo-1544550581-1bcabf842b77` appear identical, inflating every repeat count.

**Actual state — verified this run with the correct regex:**
```bash
grep -oE 'photo-[a-f0-9]+-[a-f0-9]+\?' app.jsx | sed 's/\?$//' | sort | uniq -c | sort -rn | head -5
```
```
4 photo-1507525428034-b723cf961d3e
3 photo-1740597191367-640c3f0d176b
3 photo-1738489886397-f1101f1637f8
...
```

`photo-1507525428034-b723cf961d3e` appears 4 times but one is the default fallback in `getVenuePhoto` at line 6425 (not a rendered venue card). **Real venue-card repeat: 3× — within the ≤3× ceiling set by the June 13 photo dedup. The dedup is holding.** The content agent's "5× regression" was 100% false for all 3 days it was reported.

**Fix applied this run:** `tasks/agents/content-data.md` updated with:
1. Correct photo-audit regex using full Unsplash ID
2. Instruction to exclude the `getVenuePhoto` fallback constant at ~line 6425 from the venue-card count
3. Node eval-counter instruction for venue counting (replaces stale grep)
4. Post-pivot note: 2 categories only (skiing + beach) since 2026-05-03

**Pipeline implication (PM v61 trust calibration warning is correct):** When cross-validating another agent's finding, run the underlying check from first principles. Never accept a prior agent's "this is fine" or "this is broken" as ground truth — confirm the grep command itself is correct. The AIRPORT_COORDS false-negative on June 16 (DevOps declared "NOT A BUG" after checking the wrong data structure) is the same failure mode.

---

## 6. Performance Analysis

### CDN Bundle

| Library | Version | Gzip est. |
|---------|---------|-----------|
| Babel Standalone | 7.29.7 | **~884 KB** — dominant bottleneck |
| React | 18.3.1 | ~45 KB |
| ReactDOM | 18.3.1 | ~130 KB |
| Supabase JS | 2.106.2 | ~80 KB (lazy-loaded on demand) |
| Leaflet JS | 1.9.4 | ~40 KB (lazy-loaded on demand) |
| `app.jsx` (raw, Babel input) | — | **662 KB → ~175 KB gzip** |

**Estimated total initial payload: ~1.25 MB gzipped** (Supabase + Leaflet excluded from critical path)

### Bottlenecks

1. **Babel Standalone (~884 KB gzip)** — browser downloads, parses, and executes all of Babel before any JSX runs. On 3G (~1.5 Mbps) = 4–5 seconds of blank screen. The `<link rel="preload">` in `index.html:87` is the correct mitigation and is live. Unfixable without a build step.

2. **Weather batch load time** — 4 batches × 500ms inter-batch delay = ~1.5s minimum mandatory wait after first batch renders. Acceptable for the use case; first batch (priority venues) renders to users before the delay runs.

3. **app.jsx size trend** — 662 KB raw. Set a soft ceiling at 750 KB; flag if crossed. Babel parse time scales linearly with input size.

### Image Loading

`loading="lazy"` on all venue card `<img>` tags ✅

---

## 7. Cost Estimate

| Scale | Infrastructure | Monthly Cost |
|-------|---------------|-------------|
| Current (<100 MAU) | GitHub Pages (free) + $6 DO VPS | **$6/mo** |
| 1K MAU | Same | **$6/mo** |
| 10K MAU | Open-Meteo paid (~$29/mo for 10K req/hr tier) + same VPS | **~$35/mo** |
| 100K MAU | Open-Meteo paid + $24/mo DO 4 GB VPS | **~$180/mo** |

Supabase free tier covers 500 MB DB + 50K MAU ✅. GitHub Pages CDN is globally distributed and free ✅.

---

## P1: Confirm Before Friday Reddit Post

### P1-A — VPS proxy health must be verified before any launch post

**Cannot check from this sandbox.** From a networked machine:
```bash
curl https://peakly-api.duckdns.org/health
```
Must return: `{"status":"ok","wx_cache_size":N}` where `N > 0`. At 17 simultaneous cold-loading users, Open-Meteo's free tier throttles and the proxy is the only buffer. If the proxy is cold (wx_cache_size = 0) when the Reddit post lands, the first wave of users will hit Open-Meteo directly and exhaust the daily quota within minutes. This is PM checklist item 21.

---

## P2: Fix This Sprint

### P2-A — SRI on React + ReactDOM + Supabase CDN scripts
See Section 4. ~30 minutes. Medium supply-chain risk.

### P2-B — app.jsx size ceiling
662 KB raw → flag at 750 KB. No action today.

---

## Scale Failure Prediction

**What breaks first:** Open-Meteo throttle at 17 simultaneous cold-loading users. Silent partial degradation — some venues show real weather scores, others show estimates with `~$X` prices. The `weatherDown` banner only fires when ALL fetches fail, so partial throttling is invisible to users. They see a normal-looking Explore feed with mixed real/estimated scores and no indication anything is wrong. The VPS proxy is the only shield — single point of failure, no warm fallback. **Verify proxy live before any Reddit/HN post, and watch `/health` in the first hour after posting.**

---

*DevOps agent — 2026-06-18. Cache bumped: `20260617a` → `20260618a`. Content agent photo-audit regex corrected in `tasks/agents/content-data.md`.*
