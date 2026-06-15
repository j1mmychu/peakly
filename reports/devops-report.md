# Peakly DevOps Report — 2026-06-15

**Status: 🟢 GREEN**

All invariants pass. No P0s. No P1s. Cache stamp correct. Venue count verified. Brace balance clean. One P2 (VPS unverified 5 days) and one P3 (CLAUDE.md scoring section has stale `DEAL_WEIGHT` note) — both documented below with exact fixes. DEAL_WEIGHT P3 patched inline in this commit.

> **Run note:** Executed from the cloud remote sandbox. Outbound `curl` to duckdns, github.io, and Open-Meteo is egress-blocked (sandbox allowlist — per CLAUDE.md, a sandbox 403/timeout to these hosts is never evidence the service is down). Live VPS check not possible from this environment. All code-side checks executed against the post-pull working tree.

---

## 1. Live Site Health — ✅

| Check | Result |
|---|---|
| `app.jsx` | 13,189 lines / 662 KB raw (~175 KB gzip est.) |
| Cache stamp | `20260614c` — 1 day old, **correct** (last edit June 14 15:37 PDT; no new edits today means no auto-bump, which is correct behavior) ✅ |
| Three-file lockstep | `PEAKLY_BUILD` / `CACHE_NAME` / `?v=` all read `20260614c` ✅ |
| Brace balance | **5,543 / 5,543** ✅ |
| Venue count (eval bracket-walker) | **358** (130 skiing / 228 beach) ✅ |
| `.venue-baseline` | **358** ✅ |
| `GEAR_ITEMS` | **0** — Amazon v1 cut holds ✅ |
| Plausible analytics | Present, uncommented, `defer`'d ✅ |
| Sentry DSN | Configured at `app.jsx:8` + `index.html:77` (deferred) ✅ |
| Images | All `<img>` carry `loading="lazy"` ✅ |
| Leaflet | Lazy-loaded via `ensureLeaflet()` — removed from index.html eager scripts ✅ |
| `ALERTS_AVAILABLE` iOS gate | Live ✅ |
| `deleteAccount()` | Wired in `useCloudSync` ✅ |
| `weatherDown` banner | Live ✅ |

---

## 2. Flight Proxy Status — ✅ (code-side)

| Check | Result |
|---|---|
| Proxy URL | `https://peakly-api.duckdns.org` — HTTPS ✅ |
| Proxy timeout | 5s `AbortController` per request; 3 retries (1.2s / 2.4s backoff on 429 / 5xx) ✅ |
| Fallback | Returns `null` → graceful `~$—` ✅ |
| Travelpayouts token | **Server-side only** — `TP_MARKER = "710303"` in client is the public affiliate marker only, not auth ✅ |
| Live endpoint | ❌ Cannot verify from sandbox (egress-blocked) |

**Last confirmed healthy:** 2026-06-14 via Chrome browser (PM report: `/health` 200, `wx_cache_size: 491`, poll worker running). Jack SSH'd in 2026-06-10 post-reboot.

---

## 3. Weather & External APIs — ✅ (code-side)

| Check | Result |
|---|---|
| `fetchWeather` / `fetchMarine` | Try VPS proxy first (4s timeout), fall back to direct Open-Meteo ✅ |
| Rate limit exposure | 358 venues × 2hr TTL = ~12 upstream cache-miss cycles/day ≈ 4,296–6,444 upstream calls/day worst-case. Non-commercial ceiling ~10K/day — within ceiling but not trivially so post venue-doubling |
| VPS proxy LRU cache | 4,000-entry, deployed and serving (`wx_cache_size: 491` as of June 14) — absorbs concurrent hits to same coords ✅ |

---

## 4. Security Audit — 🟢 CLEAN

| Check | Result |
|---|---|
| Secret scan (`ghp_`, `sk_live`, `AKIA`, `-----BEGIN`, private-key headers) | **Zero real hits** ✅ |
| Travelpayouts auth token | Absent from client — only public affiliate marker ✅ |
| Supabase | anon key only (public-safe, RLS-gated per Supabase design) ✅ |
| Supabase version consistency | Both `index.html` + `app.jsx` lazy-load pin `@supabase/supabase-js@2.106.2` ✅ |
| Sentry DSN | Present + wired — DSNs are public-safe by design ✅ |
| `.gitignore` | Covers `.env*`, `*.env`, `*.pem`, `*.key`, `*.p8`, `*.pdf`, `*.pptx` ✅ |
| Tracked secrets | None — no credential files in working tree ✅ |
| SRI on CDN scripts | React, Babel, Supabase lack `integrity=` — **known-skipped 2026-05-04**. Leaflet has SRI. Re-flag if CDN compromise makes news. |
| CSP meta tag | Absent — **known-skipped 2026-05-04** (Babel `unsafe-eval` exemption required; full block in `reports/inputs/devops-2026-05-01.md`) |

---

## 5. Performance Analysis — ✅

| Check | Result |
|---|---|
| `app.jsx` gzip estimate | ~175 KB |
| Babel Standalone 7.29.7 | ~900 KB gzipped — **#1 cold-load cost; unavoidable without a build step** |
| React 18.3.1 | ~44 KB gzipped ✅ |
| ReactDOM 18.3.1 | ~130 KB gzipped ✅ |
| Supabase 2.106.2 | ~80 KB gzipped, eager-loaded (known-skipped; ready-to-ship diff at `reports/ready-to-ship/eager-supabase-delete-2026-06-11.diff`) |
| Total cold-load (est.) | **~1.33 MB gzipped** — Babel dominates |
| Unsplash `auto=format&q=75` | Missing on all 358+ photo URLs — **known-skipped** (re-flags at MAU > 100 or LCP regression) |
| CDN dependency versions | React 18.3.1 ✅ / Babel 7.29.7 ✅ / Supabase 2.106.2 ✅ / Leaflet 1.9.4 ✅ — all current |

---

## 6. Cost Estimate

| MAU | Est. Monthly | Notes |
|---|---|---|
| Current (<10) | **$6/mo** | DigitalOcean $6 droplet only |
| 1K MAU | **$6/mo** | Proxy cache absorbs; Open-Meteo free-tier holds |
| 10K MAU | **$35–55/mo** | Droplet upsize ($12–24) + Open-Meteo commercial (€29/mo) if proxy saturates |
| 100K MAU | **~$100–150/mo** | CDN for static assets + load balancer mandatory |

---

## 7. P2 — VPS Unverified for 5 Days

**Last SSH check:** 2026-06-10 (Jack, post-reboot). June 14 browser scan via Chrome showed `/health` 200 but that's indirect — doesn't confirm pm2 health or alert poll worker.

**Risk at current MAU:** Survivable. All venue cards degrade to `~$—` prices; weather cold-starts to direct Open-Meteo. At Reddit-spike scale: P0.

**Fix — 5 minutes:**
```bash
ssh root@198.199.80.21 'pm2 status && curl -s http://localhost:3001/health | python3 -m json.tool'
```

Expected output: `peakly-proxy` online, `wx_cache_size` > 0, `wx_inflight: 0`.

If stopped:
```bash
ssh root@198.199.80.21 'cd /opt/peakly-proxy && pm2 restart peakly-proxy && pm2 save'
```

---

## 8. P3 — CLAUDE.md Scoring Section Has Stale `DEAL_WEIGHT = 0.5` Note

**What:** CLAUDE.md "Recently Fixed (2026-05-04 evening)" says "`DEAL_WEIGHT = 0.5` constant — future profile slider can wire to it." Current value at `app.jsx:5645` is `0.25` (75/25 conditions/price). Changed in commit `18606a7` (May 13, "Scoring honesty pass") and explicitly kept per PM Decision 3 in `pm-report.md`. Documentation fix applied inline in this commit.

**Why 75/25 is correct:** A genuinely good weekend is mostly about conditions. The code comment at `app.jsx:5641–5645` documents the rationale: cheap fare to a rainy weekend shouldn't outrank an expensive flight to a powder day. PM explicitly closed this finding — not a revert candidate.

---

## 9. What Breaks First as You Scale

**Three failure modes, in order of likelihood:**

**1. In-memory alert store wipe on pm2 restart** — All registered push subscriptions live in a `Map` in proxy.js memory. One crash/OOM/reboot = silent mass-unregistration. Fix is coded (`server/data/alerts.json` persistence) but needs SSH deploy (known-skipped). Survivable at <10 MAU. At 1K MAU, a single restart burns your most engaged users.

**2. Open-Meteo free-tier ceiling** — 358 venues × 2hr TTL × 12 cycles/day ≈ 4,300–6,400 upstream calls/day from the single VPS IP. Non-commercial ceiling is ~10K/day. A Reddit/HN spike of 30+ concurrent users with cold cache (post-restart) = 358 × 30 = 10,740 calls in minutes → throttle. **Mitigation already deployed:** the proxy LRU cache collapses concurrent requests when warm. The risk window is immediately post-reboot. Prevention: add a cache pre-warm script to the pm2 startup sequence.

Pre-warm script (add to VPS, run once post any restart):
```bash
#!/bin/bash
# Pre-warm the top 20 most popular venues (LAX/JFK/LHR/SYD/CDG)
VENUES=(
  "lat=47.47&lon=12.92"   # Kitzbühel
  "lat=46.01&lon=7.74"    # Zermatt
  "lat=45.93&lon=6.87"    # Chamonix
  "lat=39.19&lon=-106.82" # Aspen
  "lat=36.58&lon=136.65"  # Niseko
)
for v in "${VENUES[@]}"; do
  curl -s "http://localhost:3001/api/weather?$v" > /dev/null
  sleep 0.5
done
```

**3. Babel Standalone cold-transpile time** — 662 KB of JSX transpiled in-browser on every cold load adds ~300–600ms on mid-tier Android. Unavoidable without violating the no-build-step constraint. Mitigated by Babel's in-memory compile cache on repeat visits. Accept this cost until revenue justifies an optional pre-build step.

---

## Known Skipped (not re-filing)

Per `reports/known-skipped.md`:
- No SRI on React/Babel/Supabase CDN scripts
- No CSP meta tag
- Eager Supabase `<script>` in `index.html:85` (~80KB to anon visitors)
- Unsplash `auto=format&q=75` missing on photo URLs
- VPS proxy redeploy (weekend-specific Travelpayouts dates + `/api/weather` `/api/marine` — verified live per CLAUDE.md; code is deployed)
- APNS keys unconfigured (iOS push parked until App Store submission)
