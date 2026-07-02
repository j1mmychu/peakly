# Peakly DevOps Report — 2026-07-02

**Status: 🟡 YELLOW**

Cache buster was 3 days stale (`20260629a`, set June 29) — bumped to `20260702a` this run across all three lockstep files. Everything else is structurally clean. VPS unverifiable from sandbox (known egress block — not a real outage). One persistent standing open: no SRI on CDN scripts (Open #10). Venue count 370, brace balance 5565/5565, GEAR_ITEMS 0, Sentry live, Travelpayouts token server-side only. All findings below.

---

## Fixes Shipped This Run

| Fix | File | Line | Detail |
|-----|------|------|--------|
| Cache buster `20260629a` → `20260702a` | `app.jsx:17` | 17 | 3 days stale → current |
| SW CACHE_NAME bumped | `sw.js:2` | 2 | Evicts stale cached assets on next visit |
| Query string bumped | `index.html:395` | 395 | Forces browser reload of updated app.jsx |

---

## 1. Live Site Health

**Network note:** outbound HTTPS to `j1mmychu.github.io` and `peakly-api.duckdns.org` times out from this sandbox (HTTP 000). Per CLAUDE.md 2026-06-13: sandbox egress block, not a server outage. GitHub raw content returned HTTP 200 (confirming GitHub itself is reachable; Pages domain is the blocked egress). VPS last confirmed healthy June 13.

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,443 lines / 657 KB raw** |
| `PEAKLY_BUILD` stamp | `20260629a` → **bumped to `20260702a`** ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260702a` ✅ |
| Brace balance | **5,565 open / 5,565 close — BALANCED** ✅ |
| Venue count (eval-based) | **370** (131 ski / 239 beach) ✅ |
| GEAR_ITEMS in app.jsx | `grep -c GEAR_ITEMS app.jsx` → **0** — Amazon cut confirmed ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Sentry DSN | `9416b032a4…@o4511108649058304.ingest.us.sentry.io`, configured + `defer`'d ✅ |
| Eager Supabase `<script>` | Removed — lazy-load contract intact ✅ |
| Images `loading="lazy"` | **9 of 9 `<img>` tags** use `loading="lazy"` ✅ |
| Console.log leaks | 1 `console.log` (push foreground notification — appropriate); rest are `console.warn` ✅ |

### Cache buster staleness — why it matters

Users who visited between June 29 and today had `peakly-20260629a` in their service worker. If any `app.jsx` changes shipped in that window, those users saw stale code until a hard refresh. The auto-push hook bumps the stamp on each Edit, but it only fires from Jack's local Claude Code session — remote scheduled agents that write files without triggering a hook leave the stamp stale. The `20260629a` → `20260702a` bump is the corrective action. **If the auto-push hook is not wired in this remote session, the stamp will drift again after the next agent write.** Jack: verify `~/.claude/settings.json` PostToolUse hook is active in any local session that touches the three lockstep files.

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS only, no bare IP ✅ |
| HTTP bare-IP (104.131.82.242) | **Not present in client code** ✅ |
| `fetchTravelpayoutsPrice` timeout | 5,000 ms `AbortController` + graceful fallback ✅ |
| Weather proxy timeout | 4 s `_tryProxyWx()` → direct Open-Meteo fallback ✅ |
| Travelpayouts token in client | **Not present** — server-side only ✅ |
| VPS `/health` live check | **UNVERIFIABLE FROM SANDBOX** — sandbox egress block (see note above) |

**Jack action required:** Run `curl https://peakly-api.duckdns.org/health` from any networked terminal before the next Reddit/HN post. Confirm `wx_cache_size > 0` and `pm2 status` shows `peakly-proxy` online. Last confirmed healthy: June 13 (uptime ~3.2d, post kernel reboot).

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo endpoints | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| Batch strategy | 50 venues / 2 s throttle ✅ |
| Rate-limit math | 370 venues × ~2 calls = **~740 calls per full fresh load** |
| Free-tier ceiling (no proxy cache) | ~10,000 calls/day → **breaks at ~13 simultaneous unprimed users** |
| With VPS cache warm | 1,000 concurrent users on same venue set = 1 upstream call ✅ |
| Marine calls | Beach venues only (239 of 370) ✅ |

**Risk at Reddit launch:** If the VPS cache is cold (fresh reboot, empty `wx_cache`), a simultaneous spike of 15+ users all loading fresh triggers ~11,000+ direct Open-Meteo calls within minutes. This hits the free-tier ceiling and starts returning 429s. The fix is already deployed on the VPS — just needs to be warm. Confirm `/health` shows `wx_cache_size > 0` before posting.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | **Not found** ✅ |
| AWS/GCP/Stripe keys | **Not found** ✅ |
| `.gitignore` `.env` coverage | `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`, `*.p8`, `*.p12` all covered ✅ |
| `.gitignore` business docs | `*.pdf`, `*.pptx`, `*.docx`, `Peakly-Business-Plan.*` covered (post-2026-05-09 scrub) ✅ |
| Git log secrets scan | Last 10 commits are report/content files — no credential changes ✅ |
| Supabase anon key in client | **Present (`eyJhbGci…`)** — INTENTIONAL. Anon key is public-safe by design; RLS on every table. This is the documented Supabase pattern. ✅ |
| SRI hashes on CDN scripts | **NOT PRESENT** — Open #10. React, ReactDOM, Babel, Sentry loaded without Subresource Integrity. |

### Open #10 — SRI Hashes (P2, standing open)

No SRI on four CDN scripts. A compromised CDN (unpkg, sentry-cdn, jsdelivr) could inject arbitrary JS into every user session with zero detection.

**Risk level:** Medium. These are reputable CDNs with their own integrity guarantees, but SRI is defense-in-depth and takes 10 minutes to add.

**Exact fix — add integrity attributes to `index.html`:**

```bash
# Generate SRI hashes for each CDN asset (run from any machine with curl + openssl)
curl -sL https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add to each `<script>` tag:
```html
<script crossorigin
  src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-<HASH_FROM_ABOVE>"
></script>
```

**Caveat:** Adding SRI to the Babel tag risks breaking Babel's internal inline eval (CSP `unsafe-eval` interaction). Test in a private tab after applying. Sentry CDN loader purposely cannot have SRI (it self-updates the loaded bundle). **Add SRI to React + ReactDOM first — zero eval risk.**

**Time to fix:** 15 minutes.

---

## 5. Performance Analysis

| Component | Estimated Transfer (gzipped) |
|-----------|------------------------------|
| React 18.3.1 | ~42 KB |
| ReactDOM 18.3.1 | ~130 KB |
| **Babel Standalone 7.29.7** | **~384 KB** ← single biggest item |
| Sentry CDN loader | ~10 KB |
| `app.jsx` (raw → browser transpile) | ~200 KB gzipped estimate |
| Supabase JS (lazy, deferred) | ~80 KB gzipped (only on auth) |
| Google Fonts (Plus Jakarta Sans) | ~25 KB |
| **Total first-load estimate** | **~791 KB gzipped** |

**Babel Standalone is the dominant bottleneck.** It accounts for ~49% of first-load transfer and forces JSX transpilation to happen in the main thread on every page load. On a mid-tier Android device on 4G this adds ~600–900 ms to Time-to-Interactive on cold load.

**This is a known, accepted architectural constraint** (single-file no-build-step requirement). The mitigation in place is the Babel preload tag in `index.html:87` — browser fetches it in parallel with other resources. A service worker caching Babel after first visit would eliminate the cost on repeat loads, but PRECACHE is currently empty (`[]`).

**Quick win — cache Babel in service worker:**
```js
// sw.js — add to PRECACHE array
const PRECACHE = [
  "https://unpkg.com/@babel/standalone@7.29.7/babel.min.js"
];
```
This trades a ~400 KB cache entry for zero Babel download cost on every return visit. **Risk:** if the CDN URL ever changes (version bump), the old cached Babel gets served indefinitely until cache eviction. Pin the exact version (already done in the URL) and bump in lockstep with `CACHE_NAME`.

**Time to implement:** 5 minutes. Recommend.

**Other perf checks:**
- All 9 `<img>` tags: `loading="lazy"` ✅
- No `console.log` spam in hot paths ✅
- Weather fetch batching (50/2s) prevents UI jank on initial load ✅

### CDN version audit

| Library | Pinned | Latest stable (approx) | Action |
|---------|--------|------------------------|--------|
| React | 18.3.1 | 18.3.1 | ✅ current |
| ReactDOM | 18.3.1 | 18.3.1 | ✅ current |
| Babel Standalone | 7.29.7 | ~7.29.x | ✅ likely current |
| Supabase JS | 2.106.2 | ~2.106.x | ✅ likely current |
| Sentry | CDN loader (auto-updates) | N/A | ✅ |

Verify latest Babel: `npm info @babel/standalone version` — if 7.29.7 is behind, bump before next sprint.

**Duplicate Babel tag note:** `index.html` has both a `<link rel="preload">` and a `<script src>` for the same Babel URL. This is correct and intentional — preload kicks off the download, the script tag executes it. Not a bug.

---

## 6. Cost Estimate

| Tier | MAU | DigitalOcean VPS | GitHub Pages | Open-Meteo | Supabase | Total/mo |
|------|-----|-----------------|--------------|------------|----------|----------|
| Now | <100 | $6 (1 GB) | $0 | $0 (free) | $0 (free, 500 MB) | **$6** |
| 1K MAU | 1,000 | $6 | $0 | $0 (proxy cache absorbs) | $0 | **$6** |
| 10K MAU | 10,000 | $12 (2 GB — proxy OOM risk at 1 GB) | $0 | $0 | $0–$25 (at ~500 MB row limit) | **$12–$37** |
| 100K MAU | 100,000 | $48–96 (4–8 GB + load balancer) | $0 or $CDN | Consider paid tier | $25 | **$73–$146** |

**Cost optimization opportunities:**
1. **Supabase free tier ceiling:** Free plan caps at 500 MB DB + 50,000 MAU for auth. At 10K MAU with active cloud sync, row counts grow. Monitor `Settings → Usage` — migrate to $25/mo Pro before hitting the wall or you get hard-blocked.
2. **VPS memory:** 1 GB RAM with Node.js + in-memory wx cache (4,000 entries) is tight. At sustained load, the cache will consume ~200–400 MB. If pm2 starts OOMing, upgrade to $12 (2 GB) before it crashes at launch. Command: `pm2 monit` on the VPS to check memory headroom.
3. **Open-Meteo rate limits (no-proxy path):** Direct open-meteo.com free tier allows 10,000 calls/day. At 100K MAU with VPS cache miss rate of even 5%, you're at 37,000 calls/day → 29s rate-limit windows and degraded scores. Solution: paid Open-Meteo plan (~$10–30/mo) or aggressive cache TTL extension (currently 2hr — fine for now).

---

## 7. What Breaks First at Scale

**The VPS.** It is a single, non-redundant 1 GB droplet with no auto-restart beyond pm2, no load balancer, no health check that triggers a page, and no alerting if it goes down. Right now `app.jsx` has a graceful direct Open-Meteo fallback, so a VPS crash degrades flight pricing to "estimate" but doesn't break the app. However: at a Reddit spike of 500+ users, Direct Open-Meteo call volume would hit ~370,000 calls in the first hour (500 users × 370 venues × 2 calls) and get rate-limited within minutes. Scores would freeze at stale or "unavailable." Mitigation path:

1. **Before Reddit post (Jack, 10 min):** SSH in, run `pm2 monit` — verify `peakly-proxy` is running and RSS memory is under 400 MB. If over 700 MB, restart now: `pm2 restart peakly-proxy`.
2. **After 1K MAU (1 sprint, ~$0 cost):** Enable DigitalOcean Droplet Monitoring + email alert on CPU >80% or RAM >90%. Free feature, just needs enabling in DO console.
3. **Before 10K MAU (one upgrade):** Move VPS to $12/mo 2 GB droplet: `doctl compute droplet-action resize <id> --size s-1vcpu-2gb --resize-disk=false`. Zero downtime with a disk-resize=false resize.

---

## Pre-Launch Checklist (Jack manual actions)

- [ ] `curl https://peakly-api.duckdns.org/health` — confirm `wx_cache_size > 0` and `pm2 status` shows online
- [ ] `pm2 monit` on VPS — confirm memory RSS < 400 MB
- [ ] Paste `server/sql/delete-account.sql` into Supabase SQL editor (App Store Guideline 5.1.1(v))
- [ ] Update Plausible `data-domain` to `peakly.app` when domain goes live (currently `j1mmychu.github.io`)

---

## Persistent Known Issues (not re-flagged per two-strikes rule)

| # | Issue | Status |
|---|-------|--------|
| 10 | No SRI on CDN scripts | P2, standing open — see §4 for exact fix |
| 9 | APNS unconfigured (iOS push) | Gated behind `isNativePlatform()`, not a web blocker |
| 6/7 | VPS redeploy (weekend pricing / wx cache) | LIVE as of June 13 — endpoints healthy |
