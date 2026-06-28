# Peakly DevOps Report — 2026-06-28

**Status: 🟢 GREEN**

All structural invariants pass. Cache stamp is 1 day stale (`20260627a`) — will auto-bump next time app.jsx is touched. No new security issues. Venue count 370 confirmed via grep cross-check (197 quoted + 173 unquoted format = 370). No regressions. Duplicate-commit pattern from June 23 already graduated to `known-skipped`. VPS unverifiable from sandbox — last confirmed healthy June 13 (networked session, see prior reports).

---

## 1. Live Site Health

| Check | Result |
|-------|--------|
| `app.jsx` size | **13,443 lines / 657 KB raw / 157 KB gzip** |
| CDN scripts (index.html) | All HTTPS, exact versions pinned ✅ |
| Plausible analytics | Present, `defer`'d, `data-domain="j1mmychu.github.io"` ✅ |
| Cache stamp | `20260627a` — **1 day stale** (June 28 today) |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260627a` ✅ |
| Brace balance | **5565 open / 5565 close — BALANCED** ✅ |
| GEAR_ITEMS (Amazon) | `grep -c GEAR_ITEMS app.jsx` → **0** — cut confirmed ✅ |
| Sentry DSN | `9416b032a4…@o4511108649058304.ingest.us.sentry.io` in `index.html`, `defer`'d ✅ |
| Venue count | **370** (baseline `scripts/.venue-baseline` = 370; grep cross-check: 197 + 173 = 370) ✅ |

### Cache Stamp — Not Fixed This Run

Current: `20260627a`. Today: `20260628`. It is 1 day stale. The auto-push script will bump it to `20260628a` the next time `app.jsx`, `sw.js`, or `index.html` is edited. This report only touches `reports/devops-report.md`, which does not trigger the bump. No manual fix applied — the bump is imminent and the 1-day lag has no user-visible consequence (service worker respects `Cache-Control` on GitHub Pages, which sets `max-age=0` for HTML).

---

## 2. Flight Proxy Status

| Check | Result |
|-------|--------|
| Proxy URL | `https://peakly-api.duckdns.org` — **HTTPS only** ✅ |
| Client timeout | 5,000 ms AbortController on `fetchTravelpayoutsPrice` ✅ |
| Weather proxy timeout | 4 s (line ~5167 `_tryProxyWx`) ✅ |
| Proxy fallback | Direct Open-Meteo on proxy failure ✅ |
| Live VPS health | **UNVERIFIABLE FROM SANDBOX** — sandbox egress blocks duckdns. Last verified healthy June 13. Jack: `curl https://peakly-api.duckdns.org/health` before any Reddit/HN post. |

**No P0s.** Proxy has been HTTPS since `peakly-api.duckdns.org` was set up. The 104.131.82.242 bare-IP HTTP endpoint is not present in client code (grep clean).

---

## 3. Weather & External API

| Check | Result |
|-------|--------|
| Open-Meteo endpoints | `api.open-meteo.com/v1` + `marine-api.open-meteo.com/v1` — standard ✅ |
| Rate-limit protection | Proxy cache (in-memory 2hr LRU on VPS) shields Open-Meteo on concurrent hits ✅ |
| Fallback to direct | `_tryProxyWx` falls back to direct Open-Meteo if proxy returns non-success ✅ |
| Free-tier ceiling risk | At ~66+ concurrent DAU on same venue set, direct Open-Meteo throttles. Reddit spike = P0. The VPS cache is the prevention — confirm it's live before any viral post. |

---

## 4. Security Audit

| Check | Result |
|-------|--------|
| Travelpayouts token | **Not in client** — only `TP_MARKER = "710303"` (public affiliate ID, not a secret) ✅ |
| Supabase anon key | `eyJhbG...` in `app.jsx:26` — **by design**. Supabase anon keys are public-safe; access is RLS-gated. ✅ |
| `.gitignore` | Covers `.env`, `*.env`, `*.pem`, `*.key`, `*.p8`, PDF/PPTX, Claude worktrees ✅ |
| Sentry DSN | In `index.html` — DSN is a non-secret ingest endpoint (browser-safe by Sentry design) ✅ |
| No SRI on React/Babel/Supabase | **Open #10 — still unresolved.** See P2 below. |
| Recent commits scanned | No secrets in last 20 commits ✅ |
| GEAR_ITEMS / Amazon | `grep -c GEAR_ITEMS app.jsx` = 0 ✅ (cut holds for 3rd consecutive day) |

### P2: No SRI on React, Babel, Supabase, Sentry CDN scripts

Leaflet has SRI (`integrity="sha256-…"`). React, ReactDOM, Babel, Supabase, and Sentry do not. A compromised CDN (unpkg, jsdelivr, Sentry CDN) could inject arbitrary JS. Medium risk at current MAU; supply-chain attacks on unpkg are rare but real.

**Exact fix — add `integrity=` to each `<script>` in `index.html`:**

```bash
# 1. Get hashes (run locally, CDN has to serve the actual file)
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

```html
<!-- Then update each script tag, e.g.: -->
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
        integrity="sha384-<HASH_FROM_ABOVE>" crossorigin="anonymous"></script>
```

**Caveat:** Babel Standalone uses `eval()` for JSX transpilation. Adding SRI to Babel is safe, but note that a CSP with `'unsafe-eval'` would still be required. Adding SRI without CSP is a half-measure — worthwhile, but pair it with the CSP meta tag (Open #10) for full hardening. Estimated 30 min for all five hashes + tag updates.

---

## 5. Performance Analysis

| Metric | Value |
|--------|-------|
| `app.jsx` raw | 657 KB |
| `app.jsx` gzip | **157 KB** |
| React 18 prod gzip | ~45 KB |
| ReactDOM 18 prod gzip | ~130 KB |
| **Babel Standalone 7.29.7 gzip** | **~250 KB** |
| Supabase JS gzip | ~80 KB (lazy-loaded) |
| Leaflet gzip | ~40 KB |
| **Total cold-load transfer** | **~622 KB gzip** (excl. Supabase — lazy) |
| Images | All `loading="lazy"` ✅ |

### Biggest Single Performance Bottleneck: Babel Standalone

The client-side JSX transpilation via Babel Standalone (`@babel/standalone@7.29.7`, ~250 KB gzip) is the largest single cost item. It is loaded synchronously before `app.jsx` can run, blocking first paint by ~1–3 seconds on mid-tier mobile. At 100K MAU this is the number one bounce driver.

**Mitigation:** Pre-transpile `app.jsx` to vanilla JS as part of a build step and serve the transpiled artifact. This would eliminate Babel from the client payload entirely, cutting cold-load transfer by ~40% and removing the blocking transpile delay. However, this violates the "no build step" constraint and is a v2 decision. For v1, the current DX tradeoff is explicitly accepted.

**No action required this sprint.** Flagging for post-launch tech debt.

### CDN Version Audit

| Library | Pinned Version | Latest Stable | Status |
|---------|---------------|---------------|--------|
| React | 18.3.1 | 19.1.0 | Pin is fine — React 19 is a major with breaking changes |
| ReactDOM | 18.3.1 | 19.1.0 | Same |
| Babel Standalone | 7.29.7 | 7.29.x | ✅ Current |
| Supabase JS | 2.106.2 | 2.x latest | Check supabase-js releases if any auth changes ship |
| Leaflet | 1.9.4 | 1.9.4 | ✅ Current |

React 18.3.1 pin is intentional — React 19 requires opt-in migration. No action.

---

## 6. Cost Estimate

**Current infrastructure: $6/month (DigitalOcean 1GB droplet)**

| MAU | GitHub Pages | DigitalOcean VPS | Supabase | Open-Meteo | Total/mo |
|-----|-------------|-----------------|----------|------------|----------|
| 1K | $0 (free) | $6 | $0 (free) | $0 (free) | **$6** |
| 10K | $0 | $6 | $0 (500MB DB is ample) | $0 | **$6** |
| 100K | $0 (bandwidth well under 100GB/mo limit) | $12 (2GB RAM to handle alert polling + pm2 under load) | $25 (Pro — DB + bandwidth limits hit) | $0 | **~$37** |

**Cost optimization opportunities:**
1. **Supabase Pro timing** — free tier (500MB DB, 2GB bandwidth, 50K MAU) will last to ~10K MAU easily. No rush.
2. **VPS upgrade trigger** — if pm2 starts OOM-killing on traffic spikes, upgrade to 2GB RAM ($12/mo) before a Reddit post. Keep the droplet; don't build a fleet.
3. **GitHub Pages bandwidth** — at 100K MAU, a typical session loads ~622 KB gzip. 100K × 5 sessions/mo = 31 TB bandwidth. GitHub Pages free tier caps at 100 GB/month. **This is the cost cliff.** At serious scale (~15K active sessions/month peak), move static assets to Cloudflare Pages (free tier is generous) or add a CDN layer. Flag this before any HN front-page moment.

---

## 7. Recurring Issues

### Duplicate Commit Pattern (known-skipped since June 25)

The June 23 tahoe fix generated 3 identical commits (`1036a20`, `75bddc7`, `21ee1b9`) with the same message. This is the PostToolUse hook firing multiple times per multi-file edit session. PM + DevOps both second-striked it to `known-skipped` on June 25. **No action this run.**

Root cause for the record: the `auto-push.sh` lock (`mkdir "$REPO/.git/.auto-push.lock"`) prevents true races, but when Claude Code's PostToolUse fires for each individual file in a multi-file edit and the first run completes + releases the lock before the second fires, the second run sees an already-committed working tree and exits without committing — UNLESS a prior cache-stamp increment left residual dirty state. The triple commit on June 23 suggests the stamp logic fired across three hook invocations with slightly different timing.

**If it recurs:** The cleanest fix is a 30-second cooldown after a successful push (`echo $(date +%s) > /tmp/.peakly-last-push; [[ $(( $(date +%s) - $(cat /tmp/.peakly-last-push 2>/dev/null || echo 0) )) -lt 30 ]] && exit 0`). Deferred per known-skipped graduation.

---

## 8. What Breaks First at Scale

**The single biggest scaling failure mode is a Reddit/HN spike hitting Open-Meteo directly.**

The math: Peakly has 370 venues. On first load, every user triggers weather fetches for ~30 visible venues. At 1,000 simultaneous users (a small Reddit spike), that's 30,000 upstream Open-Meteo requests in <60 seconds. Open-Meteo's free tier doesn't publish a hard rate limit but starts throttling at sustained high volume. The VPS weather cache (2-hour LRU, in-flight dedupe) collapses 1,000 requests for the same Whistler coordinates into 1 upstream call — that's the defense.

**The prevention checklist, in order:**
1. Verify VPS is live (`curl https://peakly-api.duckdns.org/health`) the morning of any Reddit/HN post.
2. If `wx_cache_size` on `/health` is 0 (fresh restart), post a non-peak-hour traffic wave first to seed the cache before the spike.
3. If VPS goes down mid-spike, the client falls back to direct Open-Meteo — the app stays functional but latency spikes. No user-visible error.
4. If Open-Meteo itself throttles (504s), the `fetchWeather` fallback returns null, venues show score 50 + "conditions unavailable" banner. Acceptable degradation.

The secondary failure at 100K MAU is the GitHub Pages 100 GB/month bandwidth cap (see §6 above). Budget for Cloudflare Pages migration before any serious growth campaign.

---

## Sandbox Note

Outbound egress to `peakly-api.duckdns.org`, Open-Meteo, and GitHub Pages is blocked in this remote execution environment. All proxy/VPS health checks are skipped. A 403/timeout to duckdns is the egress allowlist, not a server outage. Last confirmed VPS healthy: June 13 (networked session). **Jack: run `curl https://peakly-api.duckdns.org/health` before posting to Reddit.**
