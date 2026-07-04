# Peakly DevOps Report — 2026-07-04

**Status: 🟢 GREEN**

Cache buster was 5 days stale (`20260629a`, last updated June 29) — bumped to `20260704a` this run. No new P0s. Structurally healthy: braces balanced, GEAR_ITEMS zero, Sentry live, no client-side secrets beyond the documented public-safe Supabase anon key. VPS unverifiable from sandbox (egress block) — Jack must confirm live before/after any Reddit traffic.

---

## Fixes Shipped This Run

| Fix | File | Line | Detail |
|-----|------|------|--------|
| Cache buster `20260629a` → `20260704a` | `app.jsx:17` | 17 | 5 days stale → current |
| SW CACHE_NAME `peakly-20260629a` → `peakly-20260704a` | `sw.js:2` | 2 | Forces service worker swap on next visit |
| Query string `?v=20260629a` → `?v=20260704a` | `index.html:395` | 395 | Forces browser reload of updated app.jsx |

---

## 1. Live Site Health

**Network unreachable from sandbox** — outbound HTTPS to `peakly-api.duckdns.org` returns HTTP 403 at the egress proxy. Per CLAUDE.md 2026-06-13: this is a sandbox egress allowlist block, not a server outage. Do NOT read this as VPS down.

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,443 lines / 673 KB raw** |
| `PEAKLY_BUILD` stamp | `20260629a` → **bumped to `20260704a`** this run |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260704a` ✅ |
| Brace balance | **5,565 / 5,565 — BALANCED** ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Sentry DSN | Active (`9416b032a4…@o4511108649058304.ingest.us.sentry.io`), `defer`'d ✅ |
| Venue count | **~370** (node bracket-walk) ✅ |
| GEAR_ITEMS | **0 occurrences** — Amazon cut holds ✅ |
| Eager Supabase `<script>` | **Not present** — correctly removed ✅ |
| All `<img>` tags | `loading="lazy"` on all instances ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| HTTP URLs in app.jsx | None — all external calls are HTTPS ✅ |
| `fetchTravelpayoutsPrice` timeout | 5,000ms `AbortController` timeout with `clearTimeout` ✅ |
| Proxy fallback | `_tryProxyWx()` with 4s timeout → falls back to direct Open-Meteo ✅ |
| VPS live check | **UNVERIFIABLE FROM SANDBOX** — last confirmed healthy 2026-06-13. Jack: `curl https://peakly-api.duckdns.org/health` — if `wx_cache_size > 0`, you're good. If zero or down, SSH and `pm2 restart peakly-proxy`. |

---

## 3. Weather & External APIs

| Check | Result |
|-------|--------|
| Open-Meteo endpoint | `https://api.open-meteo.com/v1` (no auth required) ✅ |
| Batch strategy | 100 venues/batch, 500ms throttle between batches; priority tier (first 200) blocks loading state, remaining 170 fire-and-forget in background ✅ |
| Marine fetches | Beach category only (`v.category === "beach"`) ✅ |
| 2hr client-side cache | Present — weather data cached in localStorage with TTL ✅ |
| Rate limit math | 370 venues × ~2 calls = ~740 calls/fresh load per user. Direct Open-Meteo free tier is ~10K calls/day → throttles at ~13 simultaneous fresh-load users. VPS proxy cache (2hr TTL, 4000-entry LRU) compresses this to ~1 upstream call per (venue, 2hr window). **VPS being up is the only thing protecting a Reddit spike.** |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | **NOT PRESENT** — `server/proxy.js` reads `process.env.TRAVELPAYOUTS_TOKEN`, client only has `TP_MARKER = "710303"` (Aviasales affiliate marker — public by design) ✅ |
| Supabase anon key | Present in `app.jsx:26` as `SUPABASE_ANON_KEY` — intentional and documented. Anon key is public-safe; all data access is RLS-gated. **Not a secret. Not a finding.** ✅ |
| `.gitignore` | Covers `.env`, `*.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision`, `*.pdf`, `*.pptx`, business docs ✅ |
| Recent commit history scan | Last 15 commits: daily reports and cache bumps only — no secrets introduced ✅ |
| HTTP URLs | Zero plain `http://` external API calls in `app.jsx` or `index.html` ✅ |
| Sentry DSN in client | Present in `app.jsx:8` and `index.html:77` — intentional (Sentry DSN is public-facing by design, not a secret) ✅ |

---

## 5. Performance Analysis

**Estimated cold-load payload:**

| Asset | Size (approx) |
|-------|--------------|
| React 18.3.1 UMD prod | ~130 KB gzipped |
| ReactDOM 18.3.1 UMD prod | ~40 KB gzipped |
| Babel Standalone 7.29.7 | ~280 KB gzipped |
| Sentry CDN bundle | ~70 KB gzipped |
| app.jsx (Babel-transpiled in browser) | ~673 KB raw → ~180 KB gzipped |
| **Total** | **~700 KB gzipped** |

**Single largest bottleneck: Babel Standalone.** A 280 KB gzipped JavaScript compiler that runs in the browser on every cold load just to transpile JSX. It's architectural — not removable without adding a build step — but it's 40% of the page load payload. At current scale it's acceptable; at 100K MAU it's a user-visible LCP penalty.

**All `<img>` tags** use `loading="lazy"` ✅

**CDN dependency versions:**

| Dep | Version | Notes |
|-----|---------|-------|
| React | 18.3.1 | Current stable ✅ |
| ReactDOM | 18.3.1 | Current stable ✅ |
| Babel Standalone | 7.29.7 | Recent ✅ |
| Sentry | Hash-pinned CDN bundle | ✅ |
| Supabase JS | Lazy-loaded via CDN | Loads only on auth ✅ |

---

## 6. Cost Estimate

**Current infrastructure:** DigitalOcean droplet ($6/month) + GitHub Pages (free).

| MAU | Open-Meteo calls/day (est.) | Cost |
|-----|-----------------------------|------|
| 1K MAU | ~700 calls/day — well under free tier with proxy cache | **$6/mo** |
| 10K MAU | ~4,440 upstream calls/day (370 venues × 12 cold calls/venue/day) | **$6/mo** |
| 100K MAU | Proxy absorbs. VPS needs 2 GB RAM + PM2 cluster mode. | **~$12–18/mo** |

**Cost optimization:** Only lever before 100K MAU is upgrading the $6 droplet to $12 (2 GB RAM) to run PM2 cluster mode. Single-worker 1 GB proxy becomes the bottleneck when the LRU cache fills under a concurrent spike.

---

## Open Issues (Persistent)

### P2 — No SRI on CDN scripts (Open #10)

**Risk:** If unpkg or the Sentry CDN is compromised, malicious JS runs in every user's browser undetected. Medium risk — unpkg has a track record; this is closure hygiene, not fire-drill.

**Fix (30 min):**
```bash
# Generate SRI hash for each CDN asset
curl -sL https://unpkg.com/react@18.3.1/umd/react.production.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

curl -sL https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A

curl -sL https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | \
  openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<HASH>"` to each `<script>` in `index.html`:
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH_HERE"></script>
```

Repeat for ReactDOM and Babel. SRI on script tags works without a CSP and doesn't break Babel's `eval()` usage. This has been Open #10 for months. Pre-launch was the right time. Still not shipped.

---

### P2 — Plausible `data-domain` too broad

**Risk:** Any other project deployed to `j1mmychu.github.io` pollutes Peakly's analytics.

**Fix (5 min):**
```html
<!-- Line 32, index.html — change: -->
<script defer data-domain="j1mmychu.github.io" ...></script>
<!-- To: -->
<script defer data-domain="j1mmychu.github.io/peakly" ...></script>
```
Update the Plausible dashboard domain to match. Doesn't affect historical event data.

---

### P3 — Babel Standalone cold-load cost

**Risk:** 280 KB gzipped compiler + 673 KB raw JSX file transpiled in-browser on every cold visit. Not removable without a build step (documented constraint).

**Mitigation (no build step required, 1 hour):** Pre-transpile `app.js` locally once, commit it, serve it on production instead of `type="text/babel"`. Keep `type="text/babel"` variant for local dev only. Saves the 280 KB Babel payload + client CPU for every production visitor. **Defer until post-launch.**

---

## What Breaks First at Scale

**Open-Meteo's free tier** is the single failure mode that looks like an app bug to users. Post goes up on Reddit, 200 users hit Explore in the first 10 minutes — each triggers a ~740-call weather batch before the VPS proxy cache is warm. That's 148,000 upstream calls in ~10 minutes, wiping the entire daily free-tier quota. After that, `fetchWeather` returns null, every venue scores 50, the grid renders as a flat uniform list with "~$X" everywhere. To a new user that looks like a broken app, not a rate limit.

**The defense is one command:** Before any viral post, `curl https://peakly-api.duckdns.org/health` and confirm `wx_cache_size > 0`. If the proxy went down after the June 30 post or never came back up, SSH in and run `pm2 restart peakly-proxy`. The entire protection layer runs on a $6 droplet. Have the SSH session open before posting.

---

## Post-Reddit Status (July 4)

Today is July 4. The Reddit post was scheduled for June 30. Status unknown from sandbox.

**Jack — verify from local terminal:**
- [ ] `curl https://peakly-api.duckdns.org/health` → confirm `wx_cache_size > 0`
- [ ] Live site loads: `https://j1mmychu.github.io/peakly/` → build `20260704a` in Profile footer
- [ ] Plausible dashboard: any traffic from the June 30 post window?
- [ ] If Reddit is live: check upvote count + top comments for UX signals
- [ ] Paste `server/sql/delete-account.sql` into Supabase SQL editor (App Store gate — 2 min, unblocks iOS submission)

---

*Report generated by DevOps agent — 2026-07-04. VPS health unverifiable from sandbox (403 egress block on `peakly-api.duckdns.org`); all other checks run against local repo. Cache buster bumped `20260629a` → `20260704a` this run.*
