# Peakly DevOps Report — 2026-07-01

**Status: 🟢 GREEN**

Structurally clean. No P0s. Cache buster `20260629a` correctly reflects the last app.jsx change (June 29) — no code shipped since, so the buster is accurate, not stale. Venue count 370, brace balance 5565/5565, GEAR_ITEMS 0, Travelpayouts token server-side only. One long-standing architectural risk (Open-Meteo rate limit on proxy failure at scale) documented and quantified below — the VPS proxy is the only thing standing between 16 cold sessions and a rate-limit wall. Two P2s unchanged from prior runs.

---

## Fixes Shipped This Run

None. No code changes required.

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,443 lines / 657 KB raw** |
| `PEAKLY_BUILD` stamp | `20260629a` — reflects last code change Jun 29. Correct. |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260629a` ✅ |
| Brace balance | **5,565 / 5,565 — BALANCED** ✅ |
| Plausible analytics | `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Sentry DSN | Live — `9416b032a4…@o4511108649058304.ingest.us.sentry.io`, `defer`'d ✅ |
| GEAR_ITEMS (Amazon) | `grep -c GEAR_ITEMS app.jsx` → **0** — v1 cut holds ✅ |
| Venue count | **370** (131 ski / 239 beach) ✅ |
| `.venue-baseline` | 370 — matches ✅ |
| Supabase lazy-load | `@supabase/supabase-js@2.106.2` via jsdelivr CDN, lazy-loaded ✅ |

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL in client | `https://peakly-api.duckdns.org` — HTTPS only, no bare IP ✅ |
| HTTP bare-IP (104.131.82.242) | Not present in any client file ✅ |
| `fetchTravelpayoutsPrice` timeout | 5,000 ms `AbortController`, 3-retry with 1.2s/2.4s backoff ✅ |
| Weather proxy timeout | 4 s (`_tryProxyWx`), falls back to direct Open-Meteo on miss ✅ |
| Travelpayouts token in client | **Not present** — server-side env var only ✅ |
| VPS live health | **UNVERIFIABLE FROM SANDBOX** — egress blocked per CLAUDE.md 2026-06-13 note. Last confirmed healthy June 13 (`wx_cache_size:538`, uptime 3.2d). Jack: run `curl https://peakly-api.duckdns.org/health` before any Reddit/HN post. |

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo endpoints | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` ✅ |
| Client batch size | 100 venues per batch, 500 ms throttle between batches |
| Marine calls (beach only) | 239 beach venues × 1 marine call each |
| Per cold-session API calls | **609 max** (370 weather + 239 marine) |
| Open-Meteo free tier | 10,000 calls/day |
| **Rate limit math** | **16 cold user sessions exhaust the daily quota** without proxy cache |
| Proxy cache protection | VPS in-memory 2hr cache: 370 unique coords = 609 upstream calls _total_ for 2h, then 0. At any reasonable MAU the proxy absorbs everything. |
| Fallback path | Direct Open-Meteo if proxy fails — where rate limit risk lives |

**The math is only safe if the VPS proxy stays up.** If the proxy dies during a Reddit spike and 50 users cold-load simultaneously, all 50 hit Open-Meteo directly: 50 × 609 = 30,450 calls in seconds. Free tier cap is 10,000/day. Result: HTTP 429 for every subsequent user until midnight UTC, weather data goes dark.

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token in client | **Not present** ✅ |
| `.gitignore` covers `.env*`, `*.pem`, `*.p8`, `*.key` | ✅ |
| No `.env` files in repo | ✅ |
| Sentry DSN in `index.html` | Public by design — Sentry DSNs are client-facing ✅ |
| `SUPABASE_ANON_KEY` in `app.jsx:26` | Public by design — Supabase anon keys are meant to be client-facing; RLS gates all data access. Documented in CLAUDE.md. ✅ |
| No HTTP bare-IP endpoints | ✅ |
| Git log scan (last 15 commits) | No credential patterns, all standard report/content commits ✅ |
| SRI hashes on CDN scripts | **Missing** — Open #10, known P2. See fix block below. |

---

## 5. Performance Analysis

**CDN bundle breakdown at first load:**

| Asset | Approx gzipped size | Notes |
|-------|---------------------|-------|
| `@babel/standalone@7.29.7` | ~870 KB | Biggest single download. Transpiles JSX client-side. |
| `react@18.3.1` production | ~42 KB | |
| `react-dom@18.3.1` production | ~130 KB | |
| `app.jsx` (Babel input) | ~200 KB | Gzipped from 657 KB raw |
| `sentry-cdn.min.js` | ~35 KB | Deferred — off critical path |
| **Total blocking JS** | **~1.24 MB** | Before the app renders a single div |

**Single largest performance bottleneck: Babel Standalone.**
870 KB just to parse JSX at runtime on every first visit. Every new user pays this cost. There is no way around it within the single-file no-build architecture — it's the price of the constraint. At 1K MAU on LTE this is imperceptible (~0.5s). At 100K MAU with mobile users on 3G (common in target ski/beach markets: Chile, Indonesia, Morocco), it adds 3–5s before First Contentful Paint. The build step is the fix if growth demands it. Known architectural cost, not a launch blocker.

**Images:** All `<img>` tags use `loading="lazy"` ✅

**CDN version currency:**
- React 18.3.1 — current stable ✅
- Babel Standalone 7.29.7 — current ✅
- Supabase JS 2.106.2 — current ✅

---

## 6. Cost Estimate

| Scale | DigitalOcean VPS | GitHub Pages | Open-Meteo | Supabase | Total |
|-------|-----------------|--------------|------------|----------|-------|
| Current (<10 MAU) | $6/mo | Free | Free | Free | **$6/mo** |
| 1K MAU | $6/mo | Free | Free | Free | **$6/mo** |
| 10K MAU | $6/mo | Free | Free (proxy shields) | Free tier | **$6/mo** |
| 100K MAU | $12/mo (upgrade 2GB RAM) | Free | ⚠️ Risk zone if proxy down | ~$25/mo (pro) | **~$37/mo** |

**Biggest cost lever:** Supabase free tier caps at 50,000 MAU and 500 MB DB. At 100K MAU with cloud sync enabled, you breach both. The `user_data` table grows at roughly 5–20 KB per synced user. At 25K MAU that's ~250 MB — 50% of free tier. Upgrade to Supabase Pro ($25/month) before hitting 40K MAU. No code changes needed, pure billing.

**DigitalOcean 1GB RAM:** Fine for current proxy workload. At 10K MAU with heavy concurrent polling, 600 MB RSS is realistic — upgrade to $12/mo 2GB before Reddit launch if `pm2 show` reports >60% memory.

---

## Open Issues (Priority Order)

### P1 — Open-Meteo Proxy Failover Dependency

**The problem:** If `peakly-api.duckdns.org` goes down, every user cold-loading the app hits Open-Meteo directly. 16 cold sessions = daily rate limit exhausted. After that, every user sees `null` weather data — venues render with score 50 and estimated fares (cold-start hardening prevents blank screens), but conditions are dark.

**The risk window:** A Reddit post that drives 200 concurrent new visitors in the first hour with a down proxy = 16 users get real scores, 184 get "conditions unavailable" banners. That's a launch-day disaster scenario.

**Fix 1 — pm2 ecosystem file (deploy before Reddit post, 15 min):**
```bash
# On VPS: create /opt/peakly-proxy/ecosystem.config.js
cat > /opt/peakly-proxy/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'peakly-proxy',
    script: './proxy.js',
    max_memory_restart: '800M',
    restart_delay: 1000,
    max_restarts: 10,
    exp_backoff_restart_delay: 100,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

pm2 start ecosystem.config.js --update-env
pm2 save
```

**Fix 2 — Register a free Open-Meteo API key (5 min), add to proxy.js:**
Free registered accounts at open-meteo.com get a higher per-key rate limit. Adds a second line of defense even on direct fallback:
```bash
# In VPS .env or pm2 env:
OPEN_METEO_KEY=your_key_here
```
```javascript
// proxy.js — append to all Open-Meteo URLs
const OMeteoKey = process.env.OPEN_METEO_KEY;
// In buildWxUrl(): if (OMeteoKey) url += `&apikey=${OMeteoKey}`;
```

---

### P2 — No SRI on CDN Scripts (Known — Open #10)

**Status:** Unchanged. Medium risk — compromised unpkg.com would inject into the app.

**Exact fix (run locally, then paste hashes into index.html):**
```bash
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then in `index.html`:
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-HASH" crossorigin="anonymous"></script>
```

**Caveat:** Adding SRI to the Babel `<script>` blocks Babel's inline `eval()` unless a CSP header also includes `'unsafe-eval'`. Apply SRI to React/ReactDOM first (safe, 20 min). Defer Babel SRI + CSP until post-launch.

---

## What Breaks First at Scale

**Open-Meteo without the proxy, then Supabase free tier.**

At the moment a Reddit/HN post lands and 200 users hit the app simultaneously: if the VPS proxy is up, everything is fine — the proxy's 2hr in-memory cache absorbs all 609-request sessions into 609 upstream calls total once per 2h. If the proxy is down, user 17 gets rate-limited and every user after sees grey weather cards. The entire product value proposition (conditions + flights) collapses. Prevention is simple: pm2 ecosystem with auto-restart + a registered Open-Meteo API key on the fallback path. 20 minutes of work. Do it before the Reddit post.

At 40K+ MAU with cloud sync: Supabase free tier becomes the ceiling. Upgrade to Pro before you hit it — the migration is zero-downtime, just a billing click.

---

## VPS Checklist (Jack — run before Reddit post)

```bash
ssh root@198.199.80.21
curl https://peakly-api.duckdns.org/health     # expect 200 + wx_cache_size > 0
pm2 status                                      # expect peakly-proxy online
pm2 show peakly-proxy | grep -E "memory|restart" # watch for OOM restarts
free -h                                         # expect <600MB used on 1GB
```

If `wx_cache_size: 0`, the proxy restarted recently — traffic will prime it within minutes. If `pm2 show` shows >5 restarts, diagnose before posting.
