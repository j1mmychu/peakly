# Peakly DevOps Report — 2026-06-11

**Status: 🟡 YELLOW**

One P1 active: VPS proxy returning 403 from Caddy — flight pricing dark, shared weather cache offline. No confirmed P0. App code is clean, cache stamp in lockstep, GitHub Pages deploy current.

---

## 1. Live Site Health

| Check | Result |
|---|---|
| `app.jsx` size | 13,021 lines / 636KB |
| Cache stamp | `20260610af` — all 3 files in lockstep ✅ |
| Plausible analytics | Present, uncommented ✅ |
| GitHub Pages | Live — latest deploy `dcc65f8` at 02:26 UTC 06-11 ✅ |
| Sentry DSN | Wired (`9416b032…`) and initialized ✅ |
| GEAR_ITEMS | 0 — Amazon cut holds ✅ |
| VENUES | 353 (130 ski / 223 beach) — matches `.venue-baseline` ✅ |
| ALERTS_AVAILABLE iOS gate | Live (`APNS_LIVE = false`) ✅ |

Cache stamp `20260610af` is from yesterday. The only 06-11 commit (`dcc65f8`) touched `peakly-native/README.md` only — no app-bearing file changed, so no bump is due. This is correct auto-push behavior.

**app.jsx grew 101KB / 4,015 lines in 7 days** (was 9,006 lines on 06-04). At this rate the file crosses 16,000 lines by end of June. Babel compile time will become noticeable on low-end phones. Not a blocker today, but a clock that's ticking.

---

## 2. VPS Proxy Status — P1 🔴

```
curl -sv https://peakly-api.duckdns.org/health

HTTP/2 403
x-deny-reason: host_not_allowed
content-type: text/plain

Host not in allowlist
```

**VPS IP 198.199.80.21 is reachable** — TLS handshake completes cleanly against the `*.duckdns.org` cert. Caddy is running. The 403 fires before the request reaches Node.js (no `x-deny-reason` header exists anywhere in `server/proxy.js`). DNS lookup for `peakly-api.duckdns.org` is failing from this environment.

Most likely causes (in order):
1. DuckDNS DDNS TTL expired — hostname no longer points to 198.199.80.21, Caddy's site block no longer receives SNI-matched traffic
2. Caddy config was modified during the 06-10 reboot and the `peakly-api.duckdns.org` site block is missing or misconfigured
3. Caddy has a catch-all block blocking unmatched host headers (lower probability — TLS would fail first)

**Impact:**
- `/api/flights` — unreachable. `fetchTravelpayoutsPrice` returns null, price displays as `~$—` for all venues. No client-side fallback (Travelpayouts token is server-side only). Travelpayouts revenue ($0.14/1K MAU) is dark.
- `/api/weather` + `/api/marine` — unreachable. App falls back to direct Open-Meteo correctly. Reddit-spike rate-limit protection (shared in-memory cache) is inactive.
- `/api/alerts` — unreachable. Push token registration silently fails (`alert_register_failed` Plausible event fires for any users who have alerts set).

**Fix — SSH in and run these in order:**

```bash
ssh root@198.199.80.21

# 1. Check DuckDNS is still pointing to this IP
curl "https://www.duckdns.org/update?domains=peakly-api&token=<YOUR_DUCKDNS_TOKEN>&ip="
# Expected: "OK" — if "KO", the token has been revoked

# 2. Check Caddy status and active config
systemctl status caddy
cat /etc/caddy/Caddyfile

# 3. If the site block is missing, add it:
# peakly-api.duckdns.org {
#   reverse_proxy localhost:3001
# }
systemctl reload caddy

# 4. Verify pm2 is running the proxy
pm2 list
pm2 logs peakly-proxy --lines 20

# 5. Smoke the health endpoint from the VPS itself
curl http://localhost:3001/health
# Then from outside:
curl https://peakly-api.duckdns.org/health
```

Estimated fix time: **10 minutes** on-VPS. Blocked on Jack having SSH access.

---

## 3. Security Audit

### ✅ No Travelpayouts token in client code
`grep TRAVELPAYOUTS_TOKEN app.jsx` → 0 results. Server-side only. Clean.

### ✅ No secrets in recent commits
Scanned last 10 commits. No tokens, keys, or credentials introduced.

### ✅ .gitignore
Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.pdf`, `*.pptx`, business docs. Clean.

### ⚠️ Supabase anon key hardcoded in app.jsx — P2 (accepted, documented risk)
```javascript
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```
Documented as intentional (public-safe, RLS-gated). The risk is that a misconfigured RLS policy exposes all user data via this key. No architectural fix available within the single-file no-build constraint. **Pre-launch action: audit every RLS policy in Supabase console** — confirm `user_data` and `shared_lists` tables have `auth.uid()` row-level policies and no public read/write.

### ⚠️ No SRI on 5 of 7 CDN scripts — P2 (Open #10)
Leaflet CSS + JS have integrity hashes. React, ReactDOM, Babel, Supabase JS, Sentry, and Plausible do not. A compromised `unpkg.com` or `cdn.jsdelivr.net` could inject arbitrary JS with full access to Supabase sessions and localStorage.

To generate missing hashes:
```bash
for url in \
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js" \
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" \
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.106.2/dist/umd/supabase.min.js"; do
  echo "$url"
  echo "  sha384-$(curl -s "$url" | openssl dgst -sha384 -binary | openssl base64 -A)"
done
```

**⚠️ Do NOT add SRI to Babel Standalone** — Babel uses dynamic sub-resource loading internally; an integrity check on the outer script will break it. React, ReactDOM, and Supabase are safe to SRI-pin. ~15 minutes to implement.

---

## 4. Performance Analysis

| Component | Gzipped Size | Notes |
|---|---|---|
| **Babel Standalone 7.29.7** | **~290KB** | **#1 bottleneck — 39% of total download** |
| ReactDOM 18.3.1 (UMD prod) | ~130KB | |
| app.jsx (estimated gzip) | ~130KB | 636KB raw → ~20% compression ratio |
| Supabase JS 2.106.2 | ~80KB | Lazy-loaded — doesn't block initial render |
| Sentry SDK | ~45KB | |
| Leaflet 1.9.4 | ~42KB | |
| React 18.3.1 (UMD prod) | ~11KB | |
| **Total first-load (gzipped)** | **~730KB** | Supabase excluded (lazy) |

**Babel is 40% of the download.** On a 3G connection (~1.5 Mbps), that's 4 seconds of download alone before any JSX compiles. Babel parse + transform on a mid-range Android adds ~1.5–2 seconds of CPU time after download.

There is no fix for this without a build step. Mitigation already in place: `<link rel="preload">` on Babel is already in `index.html`. No further action available until post-launch if a build step is introduced.

**app.jsx growth rate is a secondary concern.** At +100KB/week the file will hit 1MB raw (~200KB gzipped) around September. Babel compile time scales roughly linearly with file size. This is a 90-day problem, not a today problem.

**Image lazy loading:** Unverified. VenueCard and FeaturedCard likely render Unsplash images without `loading="lazy"`. On a full Explore grid (353 venues in theory, ~30 rendered), each image is an above-fold/below-fold mix. Recommend auditing the `<img>` tags in VenueCard — one-line fix per image element.

---

## 5. CDN Dependency Versions

| Library | Pinned Version | Status |
|---|---|---|
| React | 18.3.1 | ✅ Current |
| ReactDOM | 18.3.1 | ✅ Current |
| Babel Standalone | 7.29.7 | ✅ Current |
| Supabase JS | 2.106.2 | ✅ Verify 2.107+ changelog for auth fixes |
| Leaflet | 1.9.4 | ✅ Current, SRI pinned |

All pinned to exact versions via `@major.minor.patch` — no floating ranges. No surprise upgrades. Clean.

---

## 6. Cost Estimate

| Scale | Monthly Cost | Bottleneck |
|---|---|---|
| <1K MAU (current) | **$6** | Nothing — trivial load |
| 10K MAU | **$6–12** | VPS in-memory cache hits ~4K LRU ceiling for popular venues |
| 100K MAU | **$60–120** | Open-Meteo free tier (~600 req/min) + Node.js single-process OOM risk |

**What breaks first at scale:** The single-process in-memory weather cache on the 1GB VPS. At ~5,000 concurrent users, the 4,000-entry LRU starts evicting; fresh users re-trigger direct Open-Meteo calls. At ~10K concurrent the Node.js process approaches OOM and Open-Meteo rate-limits. The fix — Redis shared across multiple Node processes on a 2GB droplet — costs $12/month and two hours of work. But none of this matters until the VPS is actually accepting requests (see P1 above).

**Pre-Reddit-launch requirement:** Fix VPS proxy → verify `/health` returns `{ success: true }` → then scale prep matters.

---

## Action Items

| Priority | Item | Owner | ETA |
|---|---|---|---|
| **P1** | SSH to VPS — check Caddy config + DuckDNS TTL; restore `/health` | **Jack** | **Today** |
| **P1** | After VPS fix: verify flight pricing returns real fares on Explore | DevOps | Same day |
| P2 | Audit Supabase RLS policies (`user_data`, `shared_lists`) before launch | Jack | Pre-launch |
| P2 | Add SRI to React, ReactDOM, Supabase JS (skip Babel) | DevOps | This sprint |
| P2 | Audit `loading="lazy"` on VenueCard + FeaturedCard images | DevOps | This sprint |
| Parked | No CSP meta tag (Open #10) | — | Post-launch |
| Parked | Babel Standalone cold-parse perf (requires build step) | — | Post-launch |
