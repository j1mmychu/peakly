# DevOps Report — 2026-09-30 (YELLOW)

**Status: 🟡 YELLOW — VPS proxy.js undeployed Day 52. Oct 4 hard deadline = 4 days. Oct 18 launch = 18 days. Zero code commits in 17 days. `origin/master` footgun Day 8 undone. All other systems GREEN.**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH).

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | 14,237 lines / 759 KB raw |
| VENUES (category-grep count) | **404 total** — 134 skiing / 270 beach ✅ |
| lateSeason:true venues | **15 confirmed** ✅ |
| Plausible analytics | ✅ present, uncommented (index.html:32) |
| React 18.3.1 (cdnjs) | ✅ current |
| Babel Standalone 7.24.7 (cdnjs) | ✅ (dev-only; production build drops it — see §5) |
| Sentry DSN | ✅ configured (index.html:77 + app.jsx:8) |
| dist/app.min.js | ✅ CI-built via build-web.mjs on every push |
| PEAKLY_BUILD / CACHE_NAME stamp | ⚠️ `"20260914a"` — Day 17, frozen (auto-bumps on next code commit) |
| All API calls HTTPS | ✅ no bare HTTP or hardcoded IPs in client |
| Secrets in client | ✅ none (see §4) |

**Venue count note:** simple bracket-walk returns 406; category-grep returns 404 (134 ski + 270 beach). The 2-unit delta is a pre-existing artifact — nested `{}` objects inside venue entries are mis-counted by the bracket walker. Category grep is the authoritative method. **404 is correct.**

**lateSeason grep note (carry-forward):** `grep -c "lateSeason:true"` returns 10 (misses 5 JSON-quoted format `"lateSeason": true`). Use the regex-aware command:
```bash
node -e "const s=require('fs').readFileSync('app.jsx','utf8'); console.log((s.match(/lateSeason[\"']?\s*:\s*true/g)||[]).length)"
# Returns 15 — correct
```

---

## 2. Flight Proxy Status — 🔴 RED (VPS undeployed Day 52)

**Same finding as the last 52 days. Repeating once more because Oct 4 is 4 days away.**

`server/proxy.js` has been committed and ready since 2026-08-11 (updated through Sep 12). NOT deployed on the VPS. `/opt/peakly-proxy` on the VPS is a hand-copied directory — `git pull` will fail there.

**What breaks until VPS is updated:**

| Feature | Status |
|---------|--------|
| Two-weekend scoring (weekend 2) | ❌ Broken — `forecast_days=7` deployed; week-2 scores return null |
| iOS native flight/weather calls | ❌ Broken — `capacitor://localhost` missing from CORS |
| Alert deletion | ❌ Silently fails — `DELETE` missing from `Access-Control-Allow-Methods` |
| Rate limit spoofing | ❌ X-Forwarded-For[0] (forgeable) instead of last entry |
| Sep 9+10 fare-fallback fix | ❌ Undeployed — 270 beach venues show `~$X` instead of `$X LIVE` |

**The exact 4-command fix. Do this before Oct 4.**

```bash
ssh root@198.199.80.21
cd /tmp && git clone https://github.com/j1mmychu/peakly.git peakly-tmp 2>/dev/null || (cd /tmp/peakly-tmp && git pull)
cp /tmp/peakly-tmp/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health
```

Expected health output after restart: `{"status":"ok","apns":"configured","uptime_s":<N>,"wx_cache_size":0}`  
`wx_cache_size` starts at 0 post-restart and refills in ~30 min under traffic. That's normal.

---

## 3. Weather & External API — ✅ GREEN

- Open-Meteo called directly from client (primary path) and through VPS proxy (when healthy). Free tier = 10,000 calls/day per IP. At 404 venues × 1 weather call each = 404 calls/batch. **24 batches/day until rate limit.** At current traffic (pre-launch, ~single-digit MAU) this is nowhere near the ceiling.
- `fetchWeather` has 4s `AbortController` timeout and falls back gracefully.
- `fetchMarine` similarly guarded.
- VPS proxy has in-memory `_wxCache` with 2hr TTL that prevents duplicate upstream calls. Cache wipes on `pm2 restart` — normal cold-start behavior.
- **When this matters:** a Reddit/HN spike landing while VPS is cold (just restarted) will hit Open-Meteo directly for the first 2hrs. At ~66+ concurrent DAU on the same venue set, free tier ceiling becomes a risk. VPS disk cache (Open #23) mitigates this post-restart but is not yet deployed.

---

## 4. Security Audit — ✅ GREEN

| Check | Status |
|-------|--------|
| Travelpayouts auth token in client | ✅ Not present. Token is server-side only in VPS env vars. |
| `TP_MARKER = "710303"` in app.jsx:6667 | ✅ Expected — this is a public affiliate link marker, not an auth credential. Intentionally client-side per CLAUDE.md. |
| Supabase anon key in app.jsx:26 | ✅ Expected — anon keys are designed for client-side use, protected by RLS. |
| `.gitignore` covers secrets | ✅ `.env*`, `*.pem`, `*.key`, `*.p12`, `*.p8`, `*.mobileprovision` all gitignored. |
| Recent commits introducing secrets | ✅ Last 10 commits are report files only — no code changes. |
| Sentry DSN in index.html | ✅ Configured. DSN is intentionally public (error reporting). |
| APNS `.p8` key | ✅ gitignored, not in repo. |

No exposed credentials. No changes to security posture since 2026-08-11.

---

## 5. Performance Analysis — ✅ GREEN (production path)

**Production load (GitHub Pages → `dist/`):**

| Asset | Approx size | Notes |
|-------|------------|-------|
| `dist/app.min.js` | ~439 KB minified | esbuild-compiled by CI; Babel stripped entirely |
| React 18.3.1 (cdnjs, gzip) | ~43 KB gz | |
| ReactDOM 18.3.1 (cdnjs, gzip) | ~130 KB gz | |
| Supabase JS (lazy-loaded) | ~80 KB gz | Only fetches when user has a session or taps Sign In |
| **Total first-load** | ~250 KB gz | ~1.5s on 3G |

**Dev-only (local `index.html`):** Babel Standalone adds ~250 KB gz on top — dev only, never hits production users.

**Single biggest bottleneck at scale:** Babel-in-browser in dev is irrelevant to users. In production, the bottleneck is the 4-second weather fetch timeout × 404 parallel fetches at initial load. Each venue gets its own `fetchWeather` call; the client batches in groups of 50 with a 2s delay between batches to avoid Open-Meteo rate limits. On a cold load with no cached weather data, a user waits up to ~16 seconds for all weather to resolve. This is a UX issue, not an infra issue — the shimmer UI and instant score estimates cover it adequately until VPS proxy caching is deployed.

**Images:** Unsplash URLs used directly. No `loading="lazy"` audit done inline — this is a known P3 (see previous reports). At <10 MAU the LCP impact is unmeasurable.

---

## 6. Cost Estimate

| MAU | Infrastructure Cost | Notes |
|-----|--------------------|-|
| Current (<10) | ~$6/mo | DigitalOcean 1GB VPS only; GitHub Pages is free |
| 1K | ~$6/mo | Same VPS, well within headroom |
| 10K | ~$12–18/mo | Upgrade VPS to 2GB ($12/mo) for Open-Meteo proxy cache; Pages still free |
| 100K | ~$30–60/mo | VPS → $24 (4GB) + potential Open-Meteo API tier if requests exceed free tier; CDN edge caching recommended |

**Cost optimization opportunities:**
1. **Current:** Zero action needed. $6/mo is optimal for current traffic.
2. **At 1K MAU:** Add VPS disk cache for `_wxCache` (Open #23, ~30 lines). This eliminates Open-Meteo API risk on cold restarts, keeps cost at $6/mo.
3. **At 10K MAU:** Move to DigitalOcean 2GB droplet ($12/mo). Current 1GB droplet has no headroom for concurrent Open-Meteo proxying under a traffic spike.
4. **Biggest cost lever:** Supabase free tier covers 50K MAU (500MB DB, 2GB storage). No cost until well past launch targets.

---

## 7. Branch Hygiene — 🟡 YELLOW

| Issue | Count | Action |
|-------|-------|--------|
| Stale `claude/` branches on remote | 15 | Delete via GitHub UI or `git push origin --delete <branch>` |
| Other stale branches (`fix-appjsx-final`, `restore-appjsx`, `test-small`) | 3 | Delete via GitHub UI |
| `origin/master` footgun | 1 | **Day 8 undone** — `deploy.yml` deploys on push to `master`; this branch is 4 months stale |

**`origin/master` is the only dangerous one.** One accidental push there deploys June 2026 code to production. One command:

```bash
git push origin --delete master
```

---

## 8. Summary Table

| Priority | Issue | Days Open | Fix |
|----------|-------|-----------|-----|
| 🔴 P1 | VPS proxy.js undeployed | Day 52 | `ssh root@198.199.80.21` → copy + `pm2 restart` (4 commands above) |
| 🟡 P1 | `origin/master` footgun | Day 8 | `git push origin --delete master` (10 seconds) |
| 🟡 P2 | Open #23: `_wxCache` disk persistence | Day 36 | Bundle with VPS redeploy (~30 lines in `server/proxy.js`) |
| 🟡 P3 | 18 stale remote branches | Day 8 | GitHub UI → delete |

---

## What Breaks First at Scale

**The Open-Meteo free tier.** At 66+ concurrent DAU on the same venue set, the 404-venue weather fetch batch exceeds Open-Meteo's free tier (10K calls/day) within hours of a Reddit spike. The VPS proxy with `_wxCache` prevents this — one upstream call per coord per 2 hours regardless of concurrent users. The cache is already coded and deployed, but the VPS binary hasn't been updated in 52 days. This is why the VPS redeploy is the only real pre-launch gate: without it, a successful Reddit post that drives 100+ concurrent users can immediately throttle weather data and crater the app's core value proposition. The fix is a single SSH session. It has been a single SSH session for 52 days.
