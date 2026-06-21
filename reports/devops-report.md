# Peakly DevOps Report — 2026-06-21

**Status: 🟢 GREEN**

Cache stamp bumped `20260620a` → `20260621a`. One real photo dedup violation fixed (beach_cape_cod pushed `photo-1507525428034` to 4× — swapped to fresh URL, back to 3× max). The content agent's "5×" finding for `photo-1544550581` was a false positive from partial Unsplash ID matching — see §5. No P0 code issues. Business P0 remains: Reddit post is Day 17.

> **Sandbox note:** Outbound egress to `peakly-api.duckdns.org`, Open-Meteo, and GitHub Pages is blocked from this remote execution environment. A sandbox 403/timeout is NOT evidence of VPS downtime. Last confirmed VPS healthy: June 13 (networked session). Jack: run `curl https://peakly-api.duckdns.org/health` before posting.

---

## Fixes Applied This Run

| Fix | Files | Detail |
|-----|-------|--------|
| Cache stamp `20260620a` → `20260621a` | `app.jsx:17`, `sw.js:2`, `index.html:395` | 1 day stale — bumped in lockstep |
| `beach_cape_cod` photo swap | `app.jsx:4565` | `photo-1507525428034` was 4× (violates ≤3× max); replaced with `photo-1560903510` |

---

## Full Invariant Check

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,220 lines / 664 KB raw (~175 KB gzip est.)** |
| CDN scripts | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp (pre-fix) | `20260620a` — 1 day stale |
| Cache stamp (post-fix) | `20260621a` ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260621a` ✅ |
| Brace balance | **5552 open / 5552 close — BALANCED** ✅ |
| Sentry DSN | `9416b032a4...` at `index.html:77`, `defer`'d ✅ |
| Sentry init guard | `typeof Sentry !== "undefined"` — CDN-failure-safe ✅ |
| Venue count (eval) | **361** (130 skiing / 231 beach) ✅ |
| Venue baseline | `scripts/.venue-baseline` = 361 — no crater ✅ |
| Duplicate IDs | **0** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| `loading="lazy"` on images | All venue card `<img>` tags ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live ✅ |
| `deleteAccount()` | Wired in `useCloudSync` ✅ |
| `weatherDown` banner | Live in ExploreTab ✅ |
| `ScoringExplainer` | Live ✅ |
| `DEAL_WEIGHT` | `0.25` (conditions 75% / price 25%) ✅ |
| `lateSeason: true` venues | **29** ✅ |
| Supabase eager script | Removed — lazy-loaded only ✅ |
| Leaflet eager script | Removed — lazy-loaded only ✅ |
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Old HTTP IP (`104.131.82.242`) | Not present ✅ |
| `fetchTravelpayoutsPrice` timeout | `AbortController` 5s + 3-retry backoff ✅ |
| `_tryProxyWx` timeout | 4s + direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | **Not present** — server-side only. `TP_MARKER=710303` is public affiliate marker only ✅ |
| Supabase anon key in client | Present — expected, RLS-gated ✅ |
| Supabase service role key | **Not present** ✅ |
| `.gitignore` secrets coverage | `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, business docs — all covered ✅ |
| Babel in PRECACHE | `https://unpkg.com/@babel/standalone@7.29.7/babel.min.js` ✅ |
| Photo dedup max repeat (post-fix) | **3×** ✅ |

---

## 1. Security Audit

**CLEAN.** No credentials in client code.

| Check | Finding |
|-------|---------|
| Travelpayouts API token | Server-side env only ✅ |
| Supabase anon key | Public by design, RLS gates all data access ✅ |
| Supabase service key | Absent ✅ |
| Sentry DSN | Expected in client; DSNs are public-safe ✅ |
| Git history | Business PDF leak (May 9) scrubbed via `git-filter-repo` ✅ |
| SRI on CDN scripts | Leaflet only — React, Babel, Sentry missing SRI (P2 — deferred post-launch, PM v64 final call) |

---

## 2. Flight Proxy

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Timeout | `AbortController` at 5000ms ✅ |
| Retry | 3 attempts, 1.2s / 2.4s backoff ✅ |
| Rate-limit handling | 429 → backoff; 5xx → mark down, return null ✅ |
| Concurrency cap | Semaphore at 3 concurrent requests ✅ |
| VPS health | Unverifiable from sandbox — last confirmed June 13 ✅ |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo | Direct `api.open-meteo.com/v1` with proxy-first + fallback ✅ |
| Marine API | `marine-api.open-meteo.com/v1/marine` — beach venues only ✅ |
| Batch | 50 venues / 2s stagger ✅ |
| Rate-limit risk | ~66+ concurrent DAU saturates Open-Meteo free tier. VPS cache is the mitigation — ensure it stays up before Reddit post. |

---

## 4. Performance

| Asset | ~Gzip | Load mode |
|-------|-------|-----------|
| React 18.3.1 + ReactDOM | ~175 KB | blocking `<script>` |
| **Babel Standalone 7.29.7** | **~800 KB** | preload + blocking `<script>` |
| Supabase JS 2.106.2 | ~80 KB | lazy (JS dynamic load) ✅ |
| Leaflet 1.9.4 | ~40 KB | lazy (map open only) ✅ |
| Sentry CDN loader | ~10 KB | `defer`'d ✅ |
| `app.jsx` | ~175 KB | `text/babel` — parsed + transpiled client-side |
| **Cold-start total** | **~1.2 MB gzip** | — |

Babel is the ceiling. SW caches it after first visit (PRECACHE). Repeat visits skip the CDN fetch. Expected cold TTI on mid-range Android / 4G: 6–8s. Structural, not fixable without a build step.

CDN versions: React 18.3.1 ✅ · Babel 7.29.7 ✅ · Supabase 2.106.2 ✅ · Leaflet 1.9.4 ✅ — no updates needed.

---

## 5. Photo Dedup — Root Cause Analysis

**Content agent "5× violation" for `photo-1544550581` is a FALSE POSITIVE.**

The agent matched `photo-[0-9]*` which captures only the numeric prefix, ignoring the alphanumeric suffix. Two distinct Unsplash photos share prefix `1544550581`:

| Full photo URL | Venues using it | Count |
|---------------|-----------------|-------|
| `photo-1544550581-5f7ceaf7f992` | beach_mauritius, wailea-beach-maui, langford-island-spit | 3× ✅ |
| `photo-1544550581-1bcabf842b77` | lovina-beach-t15, praia-do-carvalho-algarve | 2× ✅ |

These are different photos. No violation. The only real violation was `photo-1507525428034-b723cf961d3e` at **4×** — fixed this run.

**Post-fix photo state:**

| Metric | Value |
|--------|-------|
| Max exact-URL repeat across all 361 venues | **3×** ✅ |
| Distinct photo URLs | 134 |
| Venues with photos | 361 |
| Violations (>3×) | **0** ✅ |

**Fix for content agent prompt** — swap grep pattern in `tasks/agents/content-data.md`:
```bash
# WRONG (current — false positives):
grep -o "photo-[0-9]*" app.jsx | sort | uniq -c | sort -rn

# CORRECT (full URL — no false positives):
grep -oE "images\.unsplash\.com/photo-[A-Za-z0-9]+-[A-Za-z0-9]+" app.jsx | sort | uniq -c | sort -rn
```

---

## 6. Cost Estimate

| Tier | MAU | DigitalOcean | Open-Meteo | Supabase | Total |
|------|-----|-------------|------------|----------|-------|
| Current | <50 | $6 | $0 free | $0 free | **$6/mo** |
| 1K MAU | 1,000 | $6 | $0 (VPS cache) | $0 free | **$6/mo** |
| 10K MAU | 10,000 | $12 (4GB) | $0 (VPS cache) | $0–25 | **$12–37/mo** |
| 100K MAU | 100,000 | $48 (8GB) | $0–200 (cache vs. miss) | $25–200 | **$73–248/mo** |

---

## Open Issues (Priority Order)

### P0 — Business (Jack-Only)

**Reddit post — Day 17. The hard deadline was yesterday.** Code is clean. 361 venues. Cache `20260621a`. Photo dedup fixed. Nothing blocking.

```bash
# 5-minute pre-post checklist from a networked terminal:

# VPS health
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expect: wx_cache_size > 0, poll_worker: running, apns_configured: false (expected)

# Live site HTTP 200
curl -s -o /dev/null -w "%{http_code}" https://j1mmychu.github.io/peakly/

# If both pass: open r/skiing + r/travel + r/solotravel and post.
```

**Supabase account-deletion SQL** — paste `server/sql/delete-account.sql` into Supabase dashboard → SQL Editor → Run. 2 minutes. Not a Reddit blocker; blocks App Store 5.1.1(v) compliance.

---

### P1 — Content Agent Regex Fix

Update `tasks/agents/content-data.md` photo-dedup grep to use full Unsplash URL (see §5). Prevents recurring false-positive findings. 2 minutes.

---

### P2 — Caribbean Airports Missing (Deferred — Day 1 Post-Reddit)

`PUJ`, `CTG`, `NAS`, `GND` absent from `AIRPORT_COORDS` + `AP_CONTINENT`. `HAV` absent from `AIRPORT_COORDS`. Blocks 5 priority Caribbean venues from distance filtering. PM v64: defer to post-Reddit sprint Day 1.

```js
// AIRPORT_COORDS additions:
PUJ: [18.5670, -68.3634],
CTG: [10.4424, -75.5130],
NAS: [25.0432, -77.4659],
GND: [12.0042, -61.7872],
HAV: [22.9892, -82.4091],

// AP_CONTINENT additions:
PUJ:"latam", CTG:"latam", NAS:"latam", GND:"latam", HAV:"latam",
```

5-minute fix, deferred by product decision.

---

### P2 — SRI on CDN Scripts (Permanently Deferred)

React, Babel, Sentry missing SRI hashes. Leaflet has them. PM v64 final call: do not re-raise before 1K MAU. Off the open issues list.

---

## What Breaks First at Scale

**Open-Meteo at ~66+ concurrent DAU.** 361 venues × 2 API calls = 722 upstream calls per full cold-start sweep across all simultaneous users. The VPS in-memory LRU cache collapses these to a few dozen real upstream calls per 2hr window — but only while the process is up. A VPS restart (e.g. kernel update) resets the cache; a Reddit spike that hits during a restart window sends 722 calls to Open-Meteo per concurrent user batch with no dedup.

Fix before Reddit post if possible (30 min on the VPS):
```bash
# Add Redis-backed cache to proxy.js — zero additional cost on the existing $6/mo droplet
apt install redis-server -y && systemctl enable --now redis-server
# Replace in-memory _wxCache in proxy.js with redis.get/setex (TTL 7200s)
# After: cache survives pm2 restarts, resets only on redis flush or TTL
```
---

## Summary

Code is healthy. One photo dedup violation identified (content agent false positive on 5× corrected; one real 4× fixed). Cache is current `20260621a`. **The only remaining action is the Reddit post.** Day 17. Post today.
