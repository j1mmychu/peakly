# Peakly DevOps Report — 2026-06-16

**Status: 🟡 YELLOW**

One P1 found and fixed in this commit: cache stamp was 2 days stale after the PM agent's June 15 app.jsx photo-swap bypassed auto-push.sh (remote cloud session committed directly via git, PostToolUse hook never fired). Cache stamp bumped to `20260616a` in all three files. No P0s. All other invariants pass.

> **Run note:** Executed from the cloud remote sandbox. Outbound `curl` to duckdns, github.io, and Open-Meteo is egress-blocked (sandbox allowlist — per CLAUDE.md, a sandbox 403/timeout to these hosts is never evidence the service is down). VPS health check not possible from this environment. All code-side checks executed against the merged working tree.

---

## 1. Live Site Health

| Check | Result |
|---|---|
| `app.jsx` | 13,189 lines / 662 KB raw (~175 KB gzip est.) |
| Cache stamp (pre-fix) | `20260614c` — **2 DAYS STALE** — PM agent June 15 edit bypassed auto-push ⚠️ |
| Cache stamp (post-fix) | `20260616a` — bumped in this commit ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all `20260616a` ✅ |
| Brace balance | **5,543 / 5,543** ✅ |
| Venue count (eval) | **358** (130 skiing / 228 beach) ✅ |
| `.venue-baseline` | **358** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| Plausible analytics | Present, uncommented, `defer`'d ✅ |
| Sentry DSN | Configured — `app.jsx:8` + `index.html:77` (deferred script) ✅ |
| Images | All 9 `<img>` carry `loading="lazy"` ✅ |
| Proxy URL | `https://peakly-api.duckdns.org` (HTTPS) ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live ✅ |
| `deleteAccount()` | Wired in `useCloudSync` ✅ |
| `weatherDown` banner | Live ✅ |

---

## 2. P1 — Cache Stamp Stale After Remote Agent Edit (FIXED)

**What happened:** Commit `a691e8b` (PM agent, June 15 16:13 UTC) changed two photo URLs in app.jsx (photo-dedup regression fix: Kirkwood + Anse Volbert Praslin). That commit was made from a remote cloud session that committed directly via `git` — it never went through `scripts/auto-push.sh`, so the cache stamp was not bumped. CACHE_NAME stayed `peakly-20260614c`. Any user whose service worker had already cached app.jsx against that CACHE_NAME would keep getting the old (pre-dedup-fix) photos until they hard-refreshed or the SW updated on its own (next visit after `sw.js` changes).

**Impact:** 2 venues showed a repeated photo instead of the deduped one. Low user impact at current MAU, but this is exactly the class of silent regression the auto-push guard was designed to catch.

**Root cause:** The PostToolUse hook (`scripts/auto-push.sh`) only fires when Claude Code's Edit/Write/MultiEdit tools are called in a LOCAL session. Remote cloud sessions commit directly via `git add / git commit / git push` — the hook is never invoked. This is the known gap documented in CLAUDE.md Open #11.

**Fix applied (this commit):**
```bash
# Bumped all three files in lockstep:
perl -pi -e 's/const PEAKLY_BUILD = "20260614c"/const PEAKLY_BUILD = "20260616a"/' app.jsx
perl -pi -e 's/const CACHE_NAME = "peakly-20260614c"/const CACHE_NAME = "peakly-20260616a"/' sw.js
perl -pi -e 's|app\.jsx\?v=20260614c|app.jsx?v=20260616a|' index.html
```

**Structural mitigation (for Jack):** The two-minute crontab entry in Open #11 is still not installed. Without it, every remote agent session that edits app.jsx risks the same stale-cache window. Add this to the local machine's crontab:
```
45 17 * * * cd ~/peakly && bash scripts/auto-push.sh
```
That's a 2-minute install. Until it's in, any remote agent editing app.jsx needs to manually bump the stamp.

---

## 3. Flight Proxy Status — ✅

- Proxy: `https://peakly-api.duckdns.org` (HTTPS, LETSENCRYPT via Caddy) ✅
- No raw IP (`104.131.82.242` or `198.199.80.21`) in any client-side file ✅
- `fetchTravelpayoutsPrice` has `AbortController` timeout (8s) + graceful fallback to estimate ✅
- `_tryProxyWx` has 4s timeout + null-return fallback → direct Open-Meteo ✅
- VPS health not reachable from sandbox — last verified live June 13 per CLAUDE.md

---

## 4. Security Audit — ✅

| Check | Result |
|---|---|
| Travelpayouts API token | **Not in client code** — only `TP_MARKER = "710303"` (affiliate marker, not secret) ✅ |
| Supabase anon key | Present in `app.jsx:26` — **expected, by design**. RLS-gated; Supabase anon keys are public-safe ✅ |
| Sentry DSN | In `app.jsx:8` — **expected, by design**. Sentry DSNs are public-safe client identifiers ✅ |
| `.env` / secrets | `.gitignore` covers `.env`, `.env.*`, `*.pem`, `*.key`, `*.p8`, `*.p12` ✅ |
| Recent commits | No secrets in `git log --oneline -20` commit messages ✅ |
| `GEAR_ITEMS` | 0 — no Amazon Associates token or affiliate code in client ✅ |

No exposed credentials. Clean.

---

## 5. Weather & External APIs — ✅

- Open-Meteo free tier: 10,000 calls/day. Current setup: VPS proxy with 2hr shared cache means upstream calls ≈ `(unique coords) / (2hr cache TTL)`. At 358 venues, worst-case cold boot = 358 upstream calls once per 2 hours. That's ~4,300/day theoretical max — comfortably under the 10K cap **even without any caching**. ✅
- Batch size: 100 venues per tick, 500ms throttle between batches ✅
- Priority tier (first 200 venues) fetches first and unblocks loading state before tail runs in background ✅
- Marine fetches gated to `category === "beach"` only (228 of 358 venues) ✅
- 3-retry logic on Open-Meteo with exponential backoff (1.2s, 2.4s) before giving up ✅

---

## 6. Performance Analysis — ⚠️ One bottleneck worth knowing

**Bundle sizes loaded on cold start:**
| Asset | Size (approx) |
|---|---|
| Babel Standalone 7.29.7 | ~2.1 MB raw / ~870 KB gzip |
| app.jsx (transpiled in-browser) | 662 KB raw / ~175 KB gzip |
| React 18.3.1 + ReactDOM | ~150 KB gzip |
| Supabase JS 2.106.2 | ~80 KB gzip |
| Total (approx) | **~1.3 MB gzip on cold start** |

**Biggest bottleneck:** Babel Standalone. It's not just download weight — it also burns ~200-400ms of main-thread JS on a mid-range Android to transpile 662 KB of JSX. This is a fixed architectural cost (no-build-step constraint). On fast devices and repeat visits (SW caches app.jsx), it's invisible. On cold-start low-end Android, users see the splash screen for 1-2 extra seconds. There's no fix within the current architecture.

**CDN versions in use:**
- React 18.3.1 — current stable (18.3.x) ✅
- Babel Standalone 7.29.7 — recent (7.x line) ✅
- Supabase JS 2.106.2 — recent ✅
- Plus Jakarta Sans — Google Fonts CDN, always-latest ✅

All images carry `loading="lazy"` — confirmed across all 9 `<img>` tags ✅.

---

## 7. Cost Estimate

| MAU | Monthly infra cost | Notes |
|---|---|---|
| Current (<100) | **$6/mo** | DO 1GB VPS + GitHub Pages (free) |
| 1K MAU | **~$6/mo** | VPS cache absorbs weather load; Pages handles static |
| 10K MAU | **~$12-18/mo** | May need DO 2GB ($12) for VPS memory; Pages still free |
| 100K MAU | **~$60-100/mo** | CDN (Cloudflare $20) + DO 4GB ($24) + Redis/Upstash for VPS + possible Pages limits |

**Cost optimization opportunities:**
1. Cloudflare free tier in front of GitHub Pages — zero cost, massive cache hit improvement, DDoS protection
2. VPS in-memory wx cache is capped at 4000 entries — if venue count grows past ~1000, switch to Redis (Upstash free tier: 10K cmd/day)
3. Supabase free tier (500MB DB, 50K MAU) covers launch comfortably; watch when MAU approaches 50K

---

## 8. What Breaks First at Scale

**The VPS proxy, not GitHub Pages.** At a Reddit/HN spike (10K concurrent users in 30 minutes), GitHub Pages handles the static files effortlessly — it's a CDN. But all 10K users simultaneously calling `peakly-api.duckdns.org/api/flights` (no shared cache, Travelpayouts matrix is per-request with coordinate deduplication only) will queue on the single 1GB DO droplet running Node + Caddy. The Open-Meteo proxy has the 2hr shared cache to absorb identical-coord floods, but the Travelpayouts flight endpoint returns per-origin pricing — 10 distinct home airports × 358 venues = 3,580 unique requests in 30 minutes is fine; 10K concurrent users all hitting "refresh" simultaneously is not. Prevention: add an in-memory flight cache to `proxy.js` (same TTL pattern as wx — 2hr, keyed on `origin+dest+depart_date`) so a Reddit spike serves from cache after the first hit per route. That's a ~25-line addition to the existing `_wxCache` pattern already in proxy.js.

---

## 9. Open Items (Carry-Forward)

| Priority | Item | Owner |
|---|---|---|
| P2 | VPS health unverified from sandbox (last confirmed live June 13) | Jack — SSH check `/health` |
| P2 | CLAUDE.md "Current State" section still says "353 venues" in the June 09 paragraph (stale) | Next update pass |
| P2 | Open #11: local crontab `45 17 * * *` for auto-push.sh still not installed — remote agent edits bypass the hook | Jack — 2-min install |
| P3 | SRI hashes missing on CDN `<script>` tags (security hardening) | Known/low urgency |
| P3 | CSP meta tag missing | Known/low urgency |
| Known-skip | APNS — `apns_configured: false`, iOS gate live, no action needed until App Store queue | Jack |
| Known-skip | Supabase delete-account SQL paste (App Store 5.1.1(v)) | Jack |

---

*DevOps agent — 2026-06-16 UTC*
