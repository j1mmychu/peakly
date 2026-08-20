# DevOps Report — 2026-08-20 (YELLOW)

**Status: 🟡 YELLOW**

Today is 2026-08-20. Reddit launch window: **Aug 22 (tentative) / Aug 29 (safety)**. Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress proxy returns 403 — standard constraint, not a VPS failure). Per CLAUDE.md 2026-08-11 verified by Jack: VPS fully deployed, disk cache live, `forecast_days:14`, CORS fixed, `apns:configured`. Treating VPS healthy.

**Actions executed this run:** Cache stamp bumped `20260818a → 20260820a` across `sw.js`, `index.html`, and `PEAKLY_BUILD` in `app.jsx`. App.jsx was modified in 3 commits (`854bb1c`, `1e27990`, `d1bddb5`) since the last stamp bump on Aug 18 without a corresponding cache bump — dev-path browsers could serve stale app.jsx to returning testers. Production (CI-rebuilt `dist/app.min.js`) was unaffected. Fixed.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,741 lines / 727,065 bytes** (~710 KB raw; +15KB since yesterday's photo sprint) |
| `dist/app.min.js` | **449 KB** (local copy Aug 14 — gitignored; CI rebuilds fresh on every push to main ✅) |
| Cache stamp | **`20260820a`** ✅ — bumped this run (was stale at `20260818a` with 3 uncommitted app.jsx changes since) |
| `PEAKLY_BUILD` | **`20260820a`** ✅ — bumped this run (was stale at `20260816b` since Aug 16) |
| Plausible analytics | ✅ `defer data-domain="j1mmychu.github.io/peakly"` at `index.html:32` — present, uncommented |
| Sentry DSN | ✅ Live — `app.jsx:7–8` + `index.html:77`, `captureException` wired at `app.jsx:174` |
| Venue count | **394** (authoritative via awk over VENUES block) — matches `.venue-baseline` ✅ |
| Lazy images | ✅ All 9 `<img>` render sites include `loading="lazy"` |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` at `app.jsx:6256` ✅ HTTPS — no raw IP in client code |
| Timeout | ✅ `AbortController` 5s in `fetchTravelpayoutsPrice` (`app.jsx:6291`), 4s in `_tryProxyWx` |
| Concurrency cap | ✅ Semaphore, max 3 concurrent flight requests |
| Fallback | ✅ `getFlightDeal()` returns honest `~$X` estimate on any proxy failure |
| VPS health | ✅ Confirmed 2026-08-11 by Jack — disk cache, CORS, DELETE alerts, `apns:configured` |

No issues. Open #19 and #23 are CLOSED.

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo client | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| VPS proxy cache | ✅ Disk-persistent since 2026-08-11 redeploy (disk + 2hr in-memory LRU) |
| `forecast_days` | `=14` via proxy ✅ (two-weekend scoring active) |
| Client-side wx cache | 2hr localStorage TTL per-coord ✅ |
| Batch throttle | 50 venues / 2s ✅ — required for 394-venue cold load |
| Free-tier ceiling | LOW risk at current MAU; disk cache is the Reddit spike guard |

No issues.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | ✅ Only `TP_MARKER = "710303"` (public affiliate marker) — server-side auth token never in client |
| Supabase anon key | `eyJhbGci...` at `app.jsx:26` — **intentionally public by Supabase design**. RLS gates all writes; anon key is safe to expose |
| APNS keys in client | ✅ None. Push is server-only; `APNS_LIVE` gates iOS alert UI |
| Other credentials | ✅ No `.p8`, no service-role keys, no Stripe, no write keys in tracked files |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.mobileprovision` |
| Recent commits (last 10) | ✅ Photo URL strings, report files, hero-card fix — no credential-shaped strings |
| Sentry DSN | Public-safe for client-side Sentry — not a secret |
| Stale remote branches | 15 `claude/` branches on origin — unmerged exploratory sessions. No security risk, cosmetic. Jack's GitHub UI task (post-launch) |

**No security issues.**

---

## 5. Performance Analysis

| Metric | Value | Note |
|--------|-------|------|
| CDN load (dev path) | ~1.05 MB transferred | React 18 (~45KB gz) + ReactDOM (~130KB gz) + Babel standalone (~280KB gz) |
| Production bundle | **449 KB** (`dist/app.min.js`) | Babel stripped by esbuild; CI builds fresh on every push |
| Biggest perf bottleneck | **Babel standalone (~880KB raw, ~280KB gz)** in dev path only | Production route eliminates it entirely |
| Image lazy loading | ✅ All 9 `<img>` render sites | No eager off-screen loads |
| React version | `18.3.1` at `index.html:80–81` ✅ current |
| Babel version | `7.29.7` at `index.html:88` ✅ current |
| CDN SRI hashes | ❌ No SRI on any CDN script (known Open #10, medium risk, deferred) |

---

## 6. Cost Estimate

| Scale | Monthly | Breakdown |
|-------|---------|-----------|
| **Current (<10 MAU)** | **$6/mo** | DigitalOcean 1GB droplet ($6) |
| **1K MAU** | ~$6/mo | VPS handles weather cache; Open-Meteo free tier OK; GitHub Pages free |
| **10K MAU** | ~$12–18/mo | VPS upgrade to 2GB ($12–18); Cloudflare free CDN absorbs static asset load |
| **100K MAU** | ~$50–120/mo | 2–4GB VPS + potential Open-Meteo commercial license; Cloudflare free tier still handles static |

**Cost optimization outstanding:** Cloudflare free tier (Jack's 30-min browser task). Adds CDN in front of GitHub Pages at $0 marginal cost — critical pre-Reddit spike.

---

## 7. Issues

### P1 — Cloudflare CDN Not Set Up (Jack, 30 min, pre-post)

**Status: Outstanding. Flagged Aug 18, Aug 19. Still not done.**

Without it, a Reddit/HN spike hits GitHub Pages directly. At current MAU (<10) this doesn't matter. At the moment of posting, it matters: GitHub Pages can throttle at 5K+ concurrent connections. Fix is a DNS CNAME, zero code changes.

```
# Cloudflare setup (browser — ~30 minutes)
1. Add j1mmychu.github.io/peakly to Cloudflare (free tier)
   - Zone: peakly.app (or subdomain if using custom domain)
2. DNS: CNAME peakly → j1mmychu.github.io
3. SSL mode: Full (strict) in Cloudflare
4. Page rule: Cache Everything, Edge TTL = 1 hour for /peakly/*.js
5. Verify: curl -sI https://peakly.app | grep CF-RAY
```

This is Jack-only. Blocked until DNS control exists.

### P2 — Photo Dedup: 186 of 394 Venues Share Photos (47% unique)

**Status: Active sprint. PM set Aug 22 gate.**

Not infra, not security. User experience gap: the Explore grid looks like 4 different stock photos on rotation at current dedup rate. Content pipeline is the executor. DevOps can confirm photo URL distribution via:

```bash
node -e "
const code = require('fs').readFileSync('app.jsx','utf8');
const urls = [...code.matchAll(/photo:\s*[\"']([^\"']+)[\"']/g)].map(m=>m[1]);
const freq = {};
urls.forEach(u => freq[u] = (freq[u]||0)+1);
const dups = Object.entries(freq).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]);
console.log('Dup groups:', dups.length, 'Total duped venues:', dups.reduce((s,[,c])=>s+c,0));
console.log('Top 5:', dups.slice(0,5).map(([u,c])=>c+'x '+u.split('/').pop()));
"
```

### Noted — Not Re-Flagging

- **APNS_LIVE = false**: Intentional until .p8 wired. iOS v1 gates Alerts tab. Web unaffected.
- **Open #19 / #23**: CLOSED per CLAUDE.md 2026-08-11.
- **Supabase delete-account SQL**: Jack-only paste. Client ships graceful fallback.
- **No SRI on CDN scripts (Open #10)**: Medium risk, deferred. Not blocking launch.
- **15 stale `claude/` branches**: Post-launch cleanup, Jack's GitHub UI task.

---

## 8. What Breaks First at Scale

**The Travelpayouts batch queue is the first noticeable degradation — not the static site.** At 500+ concurrent users, 394 venues each request a flight price through the VPS proxy. The 3-request semaphore (`app.jsx:6260`) means venues queue sequentially: ~100ms × 394 ÷ 3 ≈ 13 seconds before the last price resolves. Users see honest `~$X` estimates instantly (correct and intentional), but the LIVE badge never appears for most venues during the spike window. This is by design and acceptable.

**The actual risk is Open-Meteo rate ceiling.** At 500+ concurrent cold-cache users, each unique coord fires upstream. 394 venues → ~300 distinct coords. The VPS disk cache absorbs repeat requests from the same server, but if the cache is cold (post-restart or first startup), 300 upstream calls fire in <2 seconds. Open-Meteo free tier tolerates burst, but a sustained HN frontpage (10K+ unique users over 24 hours) could hit the daily ceiling. Mitigations: (1) pre-warm the VPS cache the morning of posting by curling the `/api/weather` endpoint for a handful of popular venues, (2) Cloudflare in front of the static assets reduces concurrent unique sessions to the VPS. Both are Jack-only actions, no code changes needed.

---

*Report generated 2026-08-20. Cache stamp bumped `20260818a → 20260820a` (sw.js, index.html, PEAKLY_BUILD). Venue count: 394 confirmed. No P0s. Photo dedup at 47% is the Aug 22 gate. Cloudflare still outstanding (Jack, pre-post).*
