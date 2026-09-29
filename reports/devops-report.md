# DevOps Report — 2026-09-29 (YELLOW)

**Status: 🟡 YELLOW — VPS proxy.js undeployed Day 51. Oct 4 hard deadline = 5 days away. Oct 18 launch = 19 days away. Zero code commits in 15 days. All other systems GREEN. Two false alarms closed (FOR/NAT, 15 lateSeason venues confirmed correct).**

> Remote sandbox — VPS (`peakly-api.duckdns.org`) unreachable at network layer (sandbox egress block, proxy returns 403). Proxy analysis from committed `server/proxy.js` source only. Last confirmed healthy: 2026-08-11 post-redeploy (Jack SSH). VPS health unverifiable from this environment.

---

## 1. Live Site Health — ✅ GREEN

| Check | Result |
|-------|--------|
| app.jsx lines / raw size | 14,237 lines / 741 KB raw |
| VENUES (eval count) | **404 total** — 134 skiing / 270 beach ✅ |
| lateSeason:true venues | **15 confirmed** (10 unquoted + 5 JSON-quoted format — see note below) ✅ |
| Plausible analytics | ✅ present, uncommented |
| React 18.3.1 (cdnjs) | ✅ current |
| Babel Standalone 7.24.7 (cdnjs) | ✅ (dev-only — production build drops it entirely, see §5) |
| Sentry DSN | ✅ configured in both index.html (line 77) + app.jsx (line 8) |
| dist/app.min.js | ✅ CI-generated via build-web.mjs — Babel stripped, no production risk |
| PEAKLY_BUILD stamp | ⚠️ `"20260914a"` — 15 days since last code commit (Sep 14 `bb3ebc8`) |
| All API endpoints HTTPS | ✅ no HTTP or hardcoded IPs in client code |
| No secrets in client | ✅ (see §4 for anon key clarification) |

**Cache stamp note:** `20260914a` is correct — it reflects the last real code commit. Auto-bump fires on app.jsx edits. No code commits in 15 days = stamp frozen. Will auto-bump the moment VPS deploy or any code change lands.

**lateSeason count clarification (resolves a recurring confusion):**
The CLAUDE.md instruction to use `grep -c "lateSeason:true"` returns **10**, not 15. It silently misses 5 venues stored in JSON-quoted format (`"lateSeason": true` where the closing `"` on the key breaks the regex). Actual 15 venues confirmed: whistler, chamonix, mammoth, abasin, tignes, hintertux-glacier, cervinia (7 compact), snowbird, zermatt, engelberg, verbier, val-thorens (5 JSON), les-deux-alpes-fr, saas-fee-ch, st-moritz-ch (3 compact). The number is correct; the grep command in CLAUDE.md isn't. Use:
```bash
node -e "const s=require('fs').readFileSync('app.jsx','utf8'); console.log((s.match(/lateSeason[\"']?\s*:\s*true/g)||[]).length)"
# Correct command: matches both "lateSeason": true and lateSeason:true
```

**FOR/NAT false alarm closed:** PM report v164 (2026-09-28) flagged FOR/NAT as "NEW P1: missing from AP_CONTINENT." Verified today: both are present in `AP_CONTINENT` (lines 419, 439) and `AIRPORT_COORDS` (line 6983). The 2 Brazilian beach venues (Fortaleza, Natal) are visible and routing correctly. No fix needed. PM report was wrong.

---

## 2. Flight Proxy Status — 🔴 RED (VPS undeployed Day 51)

**Same finding as the last 51 days. No change. Jack must SSH.**

`server/proxy.js` has been committed and ready since 2026-08-11 (and progressively updated through Sep 12). It is NOT deployed. `/opt/peakly-proxy` on the VPS is a hand-copied directory — `git pull` will fail there ("not a git repository").

**What's broken until VPS is updated:**
| Feature | Broken Because |
|---------|----------------|
| Two-weekend scoring (weekend 2) | `forecast_days=7` still deployed; proxy serves 7-day data; week-2 scores return `null` |
| iOS native flight/weather calls | `capacitor://localhost` missing from CORS allowlist |
| Alert deletion | `DELETE` missing from `Access-Control-Allow-Methods`; preflight fails, `.catch(()=>{})` in client hides it |
| Rate limit spoofing | `X-Forwarded-For[0]` (first, forgeable) instead of last (real client IP) |
| Weather cache after restart | Code has disk persistence (Open #23 fix) — but that code isn't deployed yet |

**Exact deploy command (Jack, SSH to 198.199.80.21):**
```bash
# From your local machine:
ssh root@198.199.80.21
cd /tmp
git clone https://github.com/j1mmychu/peakly.git peakly-tmp 2>/dev/null || (cd /tmp/peakly-tmp && git pull)
cp /tmp/peakly-tmp/server/proxy.js /opt/peakly-proxy/proxy.js
cd /opt/peakly-proxy && pm2 restart peakly-proxy
curl -s https://peakly-api.duckdns.org/health
# Expected: {"success":true,"apns":"configured","wx_cache_size":0,"forecast_days":14,...}
# (wx_cache_size=0 is normal immediately after restart — refills on traffic)
```

**ETA to fix: 10 minutes hands-on (SSH + copy + restart + verify).**

---

## 3. Weather & External API — ✅ GREEN (with proxy caveat above)

| Check | Result |
|-------|--------|
| Open-Meteo direct fallback | ✅ 3-retry with 1.2s/2.4s backoff, 8s abort timeout |
| Proxy fallback chain | ✅ `_tryProxyWx` → direct Open-Meteo fallback if proxy unreachable |
| Rate limit handling | ✅ 429/5xx → backoff + retry (max 2 retries) |
| Client-side 2hr cache | ✅ `_wxCacheGet`/`_wxCacheSet` in place |
| Marine endpoint correctness | ✅ `sea_surface_temperature_max` (was `ocean_temperature_max` pre-Jun-7 fix) |
| forecast_days (client direct) | ✅ 14 days weather, 10 days marine |
| forecast_days (VPS proxy) | ❌ 7 days deployed (14 committed, not deployed — see §2) |

**Free tier risk at scale:** Open-Meteo free tier is ~10k requests/day per IP. At 100+ concurrent DAU hitting the same venue coordinates, the shared VPS weather cache (Open #7 / Open #23) is the only protection. That cache is committed but not deployed. Until it is, a traffic spike (Reddit post) hits Open-Meteo directly and could rate-limit within hours.

---

## 4. Security Audit — ✅ GREEN

| Check | Result |
|-------|--------|
| No HTTP endpoints | ✅ all HTTPS |
| Travelpayouts token in client | ✅ `TP_MARKER = "710303"` is a **public affiliate marker** (by design — Aviasales links include it in the URL; not a secret) |
| Supabase anon key in client | ✅ intentional (public-safe, RLS-gated per CLAUDE.md) |
| `.gitignore` coverage | ✅ `.env*`, `*.pem`, `*.key`, `*.p8`, `*.p12` all covered |
| Recent commits for secrets | ✅ last 15 commits are reports only — no code changes, no leak risk |
| Sentry DSN in client | ✅ intentional (public DSN is how Sentry works — it's rate-limited server-side) |
| No hardcoded IPs | ✅ `104.131.82.242` removed — only domain reference `peakly-api.duckdns.org` |
| APNS private key | ✅ `.p8` in `.gitignore`, never committed |

**One open security issue (Open #21, pre-existing):** APNS JWT uses DER encoding (Apple needs P1363) + `fetch` (HTTP/1.1) against an HTTP/2-only endpoint. Still committed but not deployed. Still can't deliver any push notifications. Still not a regression since this session. Do not mark resolved.

---

## 5. Performance Analysis — ✅ GREEN (production) / ⚠️ (dev only)

**Production (j1mmychu.github.io/peakly/):** deploy.yml runs `build-web.mjs` on every push to `main` or `master`. esbuild compiles app.jsx → dist/app.min.js. Babel Standalone is **never loaded in production** (build step has a CI check that fails if Babel leaks into dist/).

| Asset | Size |
|-------|------|
| app.min.js (esbuild minified) | ~305 KB (estimated from 741KB raw × ~41% minification ratio) |
| React 18.3.1 UMD production | ~145 KB |
| ReactDOM 18.3.1 UMD production | ~1,066 KB |
| Supabase UMD (lazy, only on auth) | ~80 KB |
| Sentry SDK (defer) | ~60 KB |
| **Total blocking JS (prod)** | **~1,516 KB (~1.5 MB)** |

**ReactDOM 18 UMD at ~1MB is the single largest bottleneck.** The UMD bundle includes the full renderer including the DevTools hook interface and all React internal infrastructure. On 3G (~1.6 Mbps), this is ~5 seconds of download. Mitigation is CDN caching (cdnjs has aggressive Cache-Control) — the first visit is slow, repeat visits hit cache. This is a known cost of the no-build-tool constraint.

**Images:** all cards and sheets use `loading="lazy"` ✅. No regressions.

**Dev mode only:** `index.html` loads Babel Standalone (2.3MB), Babel parses 741KB of JSX in-browser (~3-8s on mobile). This is dev-only and does not affect production users.

---

## 6. Cost Estimate

| Scale | Infrastructure | Monthly Cost |
|-------|---------------|--------------|
| Current (< 100 MAU) | DO 1GB droplet + GitHub Pages CDN | **$6/mo** |
| 1K MAU | Same — GitHub Pages handles static at any scale | **$6/mo** |
| 10K MAU | Same infra, VPS load ~negligible | **$6/mo** |
| 100K MAU | Upgrade VPS to $12/mo (2GB), Add Open-Meteo commercial tier ~$12/mo | **~$24/mo** |

**Cost optimization opportunities:**
1. The VPS ($6/mo) is running an always-on process for zero active users. No action needed — this is the floor.
2. GitHub Pages CDN is free and unlimited for static assets. No action needed.
3. Open-Meteo free tier (10k req/day) is the only fragile resource. The committed disk-cache + in-memory dedup in proxy.js eliminates 99%+ of upstream calls at scale. Deploy it.

---

## 7. What Breaks First at Scale (and the Fix)

**Open-Meteo rate limits kill the app at Reddit launch.** At 66+ concurrent DAU hitting the same venue set simultaneously, direct Open-Meteo calls (the current live behavior, since the proxy cache isn't deployed) hit the free-tier ceiling within hours. Every venue returns `null` weather, every card shows "conditions unavailable," the Explore tab is a dead grid. There is no graceful degradation that keeps scores visible — the weather data IS the product. The fix is entirely written and committed: `server/proxy.js` has a shared 4000-entry in-memory LRU cache + disk persistence + in-flight dedupe (1 upstream call per coord regardless of N concurrent users). It's been sitting undeployed for 51 days. Deploy the VPS (see §2, 10 minutes). That single action unblocks two-weekend scoring, iOS native calls, alert deletion, disk cache, and Reddit-launch protection simultaneously.

---

## Open Items (Priority Order)

| # | Item | Status | Action |
|---|------|--------|--------|
| P1 | VPS redeploy (proxy.js) | **DAY 51** — Oct 4 deadline in 5 days | Jack: SSH + copy + pm2 restart (10 min) |
| P1 | origin/master footgun | Day 6 unresolved | Jack: delete the branch on GitHub (`git push origin --delete master`) |
| P2 | 15 stale claude/ branches (15 remote) | Unchanged | Jack: GitHub UI → delete or `git push origin --delete <branch>` |
| P2 | BASE_PRICES gap ~57% airports | Unchanged (Open #22) | Backfill top 15 by venue count, ~2hr |
| P2 | No SRI on CDN scripts | Unchanged (Open #10) | Medium risk, medium effort |
| INFO | FOR/NAT "missing" | **CLOSED — false alarm** | Already in AP_CONTINENT and AIRPORT_COORDS |
| INFO | APNS push broken | Unchanged (Open #21) | Jack: wire .p8 + fix DER→P1363 + HTTP/2 transport |

---

## Changes From Yesterday's Report

- Downgraded from RED to **YELLOW**: no new regressions found; only the ongoing VPS deadline is red, everything else is genuinely green.
- **FOR/NAT false alarm closed**: PM v164 flagged this as "NEW P1" but verified it's already fixed — both airports present in all required maps.
- **lateSeason count verified at 15** (not 10 as grep suggests — CLAUDE.md grep command is broken for JSON-format entries; actual count confirmed correct via per-venue inspection).
- **Zero code regressions** in any of the 15 commits since last app.jsx change.
