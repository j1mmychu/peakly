# Peakly DevOps Report — 2026-06-13

**Status: 🟡 YELLOW**

VPS proxy P1 is **still open** for the third consecutive day — Jack has not SSH'd in. No new P0s. One fix shipped this run: stale `150+` venue count updated to `350+` in 3 places in `index.html` (OG description, JSON-LD featureList, noscript fallback). Code is healthy. Cache stamp correctly unchanged at `20260610af` — no app code has changed since June 10.

---

## Fix Shipped This Run

| Fix | File | Detail |
|-----|------|--------|
| `150+` → `350+` venues | `index.html` lines 11, 54, 395 | OG card, JSON-LD featureList, noscript root text — was lying to social crawlers and search engines for 4+ days since the venue batch landed |

**Impact:** Every Twitter/iMessage/Slack unfurl was saying "150+ venues" while the product has 353. Google's structured data parser had the same stale number. Fixed in this commit.

---

## 1. Live Site Health

| Check | Result |
|---|---|
| `app.jsx` size | 13,021 lines / 652KB raw (~163KB gzipped estimate) |
| Cache stamp | `20260610af` — lockstep across `app.jsx` / `sw.js` / `index.html` ✅ |
| Stamp staleness | 3 days since last app change (June 10) — **correct**; auto-push only bumps on app-bearing edits |
| Plausible analytics | `script.hash.js` — present, uncommented, deferred ✅ |
| Sentry DSN | Wired (`9416b032…`), initialized in `app.jsx:7` ✅ |
| GEAR_ITEMS | 0 — Amazon cut holds (`grep -c GEAR_ITEMS app.jsx` → 0) ✅ |
| VENUES | **353** (130 ski / 223 beach) — bracket-walk confirmed ✅ |
| OG venue count | Fixed `150+` → `350+` in this run ✅ |
| ALERTS_AVAILABLE iOS gate | Live — `APNS_LIVE = false` gates push promises off iOS ✅ |
| `deleteAccount()` | Wired in `useCloudSync`, UI at Profile → Delete account ✅ |
| `weatherDown` banner | Live (`app.jsx:8564`) — cold-start resilient ✅ |
| `ScoringExplainer` | Live (`app.jsx:8471`) — one-time dismissible ✅ |
| Image lazy loading | 9/9 `<img>` tags carry `loading="lazy"` ✅ |
| Brace balance | 5,509 / 5,509 — balanced ✅ |
| Supabase version | Both `index.html` (eager) and `app.jsx` (lazy-load fallback) → `2.106.2` ✅ |

**CDN dependency versions:**

| Library | Pinned version | SRI |
|---------|---------------|-----|
| React | 18.3.1 (current) | ❌ missing |
| ReactDOM | 18.3.1 (current) | ❌ missing |
| Supabase JS | 2.106.2 (current) | ❌ missing |
| Leaflet | 1.9.4 (current) | ✅ present |
| Babel Standalone | 7.29.7 (current) | ❌ missing (skip — Babel's eval requirement makes SRI noop) |

---

## 2. VPS Proxy Status — P1 🔴 (OPEN 3 DAYS)

Network egress from this cloud environment blocks `peakly-api.duckdns.org` — same restriction as June 11 and June 12. Cannot verify live from here.

**Last confirmed healthy state:** 2026-06-10 evening (Jack SSH'd in, verified `/health` post-reboot, per CLAUDE.md).

**SSH commands (run these, Jack):**

```bash
ssh root@198.199.80.21
pm2 status
curl -s http://localhost:3001/health | python3 -m json.tool
```

If pm2 shows the process is online and `/health` returns `wx_cache_size: N`, the proxy is fine. If pm2 shows stopped/errored:

```bash
cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save
```

**User impact while down:**
- All venue cards show `~$—` (flight pricing returns null)
- Weather cache inactive → 353 venues × N users = direct Open-Meteo hits → rate-limit risk at 66+ concurrent DAU
- Push token registration fails silently (`alert_register_failed` Plausible event fires)

This is a Jack-only action. 10 minutes.

---

## 3. Stale Remote Branches — P1 🟠 (UNCHANGED, DAY 3)

13 `claude/*` branches from cloud-agent sessions remain on origin. Still unchanged from June 11 and June 12.

**Review first, then delete:**

```bash
# Check scoring branch diff — review before deleting
git diff main origin/claude/improve-scoring-system-XYGY6

# Delete all claude/* branches in one shot (after review)
git branch -r | grep 'origin/claude/' | sed 's|origin/||' | xargs -I{} git push origin --delete {}

# Verify clean
git branch -r | grep claude/
```

---

## 4. Security Audit

| Check | Result |
|---|---|
| Travelpayouts token in client | Not present — server-side only ✅ |
| Supabase anon key | Exposed at `app.jsx:26` — **expected and safe** with RLS; this is Supabase's documented public-client pattern |
| `.gitignore` | Covers `.env`, `.env.*`, `*.pem`, `*.p8`, `*.key`, `*.mobileprovision` ✅ |
| Recent commit secrets scan | Clean — last 10 commits are report files only |
| SRI on React/ReactDOM/Supabase | ❌ Missing — P2 |
| CSP | ❌ Missing — Babel's `unsafe-eval` requirement makes it unenforceable anyway |

**P2 — Add SRI to React, ReactDOM, Supabase.** Generate hashes and patch `index.html`:

```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A

curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js \
  | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<HASH>"` to the three `<script>` tags in `index.html:80-85`. Time: ~20 minutes.

---

## 5. Performance Analysis

**Estimated cold-load payload (gzipped):**

| Asset | Gzipped estimate |
|-------|-----------------|
| React 18.3.1 prod | ~45KB |
| ReactDOM 18.3.1 prod | ~130KB |
| Babel Standalone 7.29.7 | ~220KB |
| Supabase JS 2.106.2 | ~80KB |
| Leaflet JS 1.9.4 | ~40KB |
| Plus Jakarta Sans (4 weights) | ~30KB |
| `app.jsx` (652KB raw) | ~163KB |
| **Total** | **~708KB** |

**Biggest single bottleneck:** Babel Standalone. 220KB download + browser parses + Babel transpiles 652KB of JSX at runtime. CPU cost: ~200–400ms modern device, ~800–1500ms mid-tier Android. This is the no-build-step tax. It's architectural — not fixable without a bundler. Acceptable for v1.

**Secondary bottleneck:** 353 venue `fetchWeather` calls on cold cache. Batched at 50/2s, but a first-time user on an empty localStorage waits for the whole queue before the grid fills. VPS proxy cache (cache hit <100ms vs ~2s direct) is the fix — which loops back to P1.

---

## 6. Cost Estimate

| Scale | Monthly cost | Bottleneck |
|-------|-------------|------------|
| Current (<1K MAU) | **$6** | Nothing |
| 10K MAU | **$6–12** | VPS LRU ceiling + Open-Meteo rate limits start at ~66 concurrent DAU |
| 100K MAU | **$60–120** | Node single-process OOM on 1GB + Open-Meteo 600 req/min ceiling |

**Quick wins (zero cost):** Cloudflare free tier in front of GitHub Pages — edge caching + DDoS protection, zero code changes. Enable before any Reddit/HN post.

---

## 7. Open Action Items

| Priority | Item | Owner | Status |
|---|---|---|---|
| **P1** | SSH to VPS → `pm2 status` + `curl localhost:3001/health` | **Jack** | **Open 3 days** |
| **P1** | Review scoring branch diff, delete all 13 `claude/*` + stale remote branches | **Jack** | Open (pre-App Store) |
| P2 | Paste `server/sql/delete-account.sql` into Supabase SQL editor (App Store 5.1.1(v)) | **Jack** | Open (pre-App Store) |
| P2 | Add SRI hashes to React, ReactDOM, Supabase in `index.html` | DevOps | ~20 min |
| P2 | Audit Supabase RLS on `user_data` + `shared_lists` | Jack | Pre-launch |
| ✅ Done | `150+` → `350+` in `index.html` OG/JSON-LD/noscript | DevOps | Fixed this run |
| Parked | No CSP (Open #10) — Babel `unsafe-eval` makes it moot | — | Post-launch |
| Parked | Babel cold-parse perf (requires build step) | — | Post-launch |

---

## What Breaks First at Scale

The single-process Node.js proxy on a 1GB DigitalOcean droplet is the first domino. At ~5,000 concurrent users hitting popular venues, the 4,000-entry LRU evicts and upstream Open-Meteo calls compound. Open-Meteo's free tier throttles at ~600 req/min per IP — with 353 venues potentially uncached, that ceiling hits around 60 simultaneous unique-venue requests. The client-side fallback then hits Open-Meteo directly from user IPs, making the rate-limit pressure distributed and unpredictable. Fix path: (1) Before Reddit/HN: SSH in, confirm the VPS is alive — 10 minutes, zero dollars. (2) At 1K MAU: add Redis to the VPS ($6/mo, 2hr work) so the weather cache survives restarts. (3) At 10K MAU: Cloudflare + 2GB droplet. The current architecture survives Product Hunt; it will not survive a Hacker News front page without step 1 done first.
