# DevOps Report — 2026-08-05 (RED) — Day 13 VPS Undeployed

**Status: 🔴 RED**

One blocker dominates everything else: `server/proxy.js` has been committed to main for **13 consecutive days** without being copied to `/opt/peakly-proxy` on the VPS. Every fix in that file — HTTP/2 APNs transport, JWT P1363 encoding, disk-cache persistence, CORS for iOS native, alert deletion, rate-limiter hardening — is inert until one SSH session happens. That session is the only thing standing between current state and a healthy proxy.

**Action taken this run:** Cache stamp was 4 days stale (`20260801a` → `20260805a`), bumped in `app.jsx`, `sw.js`, and `index.html` and committed with this report. Users who've visited since August 1 will now receive fresh code on next visit.

---

## Infrastructure Status

| Component | Status |
|---|---|
| GitHub Pages (frontend) | ✅ Auto-deploys on push via deploy.yml |
| esbuild production build | ✅ `dist/app.min.js` rebuilt by CI on each push; Babel stripped |
| Cache stamp | ✅ **Bumped this run** — `20260805a` (was `20260801a`, 4 days stale) |
| VPS proxy (198.199.80.21) | ❌ **Day 13 undeployed** — running proxy.js from before Jul 23 |
| Disk cache persistence (Open #23) | ✅ In committed proxy.js — inert until VPS deploy |
| APNs HTTP/2 + P1363 fix (Open #21) | ✅ In committed proxy.js — inert until VPS deploy |
| Alert ID crypto.randomUUID (Open #21) | ✅ Live in app.jsx line 10238 |
| CORS: `capacitor://localhost` | ✅ In committed proxy.js — inert until VPS deploy |
| `DELETE` in Allow-Methods | ✅ In committed proxy.js — inert until VPS deploy |
| Rate limiter XFF (last entry) | ✅ In committed proxy.js — inert until VPS deploy |
| `forecast_days` 14 / marine 10 | ✅ In committed proxy.js — inert until VPS deploy |
| APNS_LIVE flag | ✅ `false` at app.jsx:12633 — correct; flip after VPS deploy + .p8 wired |
| Supabase cloud sync | ✅ Live, anon key wired, RLS active |
| Plausible analytics | ✅ `data-domain="j1mmychu.github.io/peakly"`, defer-loaded, uncommented |
| Sentry error monitoring | ✅ Active DSN `9416b032...`, deferred CDN load |
| React 18.3.1 / Babel 7.29.7 | ✅ Current CDN versions |
| `lazy` on all venue images | ✅ All 9 image render sites use `loading="lazy"` |
| Travelpayouts token client exposure | ✅ None — server-side only |
| Supabase anon key exposure | ✅ Intentional — public-safe per Supabase RLS design |
| `.gitignore` covers `.env`, `.p8`, `.pem` | ✅ Confirmed |
| Stale `claude/` branches on origin | ⚠️ 15 branches — noise, not a blocker |

---

## File Stats

| File | Lines | Size |
|---|---|---|
| `app.jsx` | 13,724 | 690 KB |
| `server/proxy.js` | 1,007+ | ~38 KB |
| `dist/app.min.js` | — | 457 KB (esbuild minified, last CI build) |

**CDN cold-load payload:** ~2.1 MB uncompressed (React 18 ~130 KB + ReactDOM ~1,000 KB + Babel 7.29.7 ~900 KB + app.jsx 690 KB). Production path (dist/) strips Babel and the raw app.jsx — cold load is ~590 KB.

**BASE_PRICES destination coverage:** 15 of 146 venue airports = **10.3% by airport count**. The 15 covered airports (YVR, JFK, LAX, SFO, ORD, MIA, SEA, BOS, ATL, DEN, DFW, LAS, PHX, MSP, DTW) are all North American — international venues get zero baseline pricing.

---

## P0 — Fix Today

### P0-1: VPS Proxy — Day 13 Undeployed (UNCHANGED FROM ALL PRIOR REPORTS)

Everything in the committed `server/proxy.js` is dead code on the live VPS. The VPS runs whatever was hand-copied before July 23. The delta includes:

- **Two-weekend scoring**: `forecast_days=7` on the live VPS silently disables it. `scoreWeekend` needs days 4–6 for reliable weekend #2. Live users see weekend #2 scores built on stale forecast tails.
- **iOS native dead**: `capacitor://localhost` missing from CORS on live VPS — every Capacitor fetch is CORS-blocked.
- **Alert deletion broken**: `DELETE` not in `Access-Control-Allow-Methods` on live VPS. The preflight 403s. `app.jsx`'s `.catch(()=>{})` buries it silently.
- **Rate limiter bypassable**: Live VPS reads XFF[0] (forgeable). Fixed code reads XFF[-1] (Caddy-appended, not forgeable).
- **APNs broken**: Live VPS uses `global.fetch` (HTTP/1.1) against an HTTP/2-only API. Every push attempt silently drops. P1363 JWT encoding also wrong.
- **Weather cache cold-starts**: Live VPS has no disk persistence — `pm2 restart` wipes everything. The fix (Open #23) is in committed code but not on the VPS.

```bash
# From your local machine — Jack, this is the one command you need:
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 3 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Expected `/health` response after redeploy:
```json
{
  "status": "ok",
  "wx_cache_size": 0,
  "apns": "unconfigured",
  "forecast_days": 14
}
```

If `wx_cache_size` is 0 and traffic hits immediately, the disk persistence will refill the cache from Open-Meteo without rate-limit risk (the cache writes to disk every 5 minutes). This is safe to run anytime.

**Estimated fix time: 3 minutes.**

---

### P0-2: Cache Stamp — FIXED THIS RUN

Was `20260801a` (4 days stale). Bumped to `20260805a` in `app.jsx`, `sw.js`, `index.html`. Users cached on the old SW will receive the new bundle on next visit. No action required.

---

## P1 — Fix This Week

### P1-1: BASE_PRICES Coverage — 10.3% (15 of 146 Venue Airports)

`getTypicalPrice` does `BASE_PRICES[venue.ap][homeAirport]`. BASE_PRICES has 15 destination-airport outer keys, all North American. 131 of 146 venue airports return `undefined` and fall back to a `~$estimate` label. The deal-score headline feature is partially blind.

**Top missing airports by venue count:**

| Airport | Venues affected |
|---|---|
| IBZ (Ibiza) | 6 |
| NCE (Nice) | 5 |
| MRU (Mauritius) | 5 |
| CUN (Cancún) | 5 |
| HKT (Phuket) | 5 |
| BTV (Burlington VT) | 4 |
| DLM (Dalaman, Turkey) | 4 |
| GOI (Goa) | 4 |
| PHL (Philadelphia) | 4 |
| ZNZ (Zanzibar) | 4 |
| JTR (Santorini) | 3 |
| SEZ (Seychelles) | 3 |
| PPP (Proserpine, AUS) | 3 |
| PMI (Palma Mallorca) | 3 |
| JNX (Naxos) | 3 |

Adding the top 15 missing airports eliminates the coverage gap for ~63 venues. **Estimated time: 2 hours** (research typical prices for each route, paste into BASE_PRICES as a new outer-key block). Format:

```javascript
// Add inside BASE_PRICES object — each key is destination AP, inner keys are home APs
IBZ: { JFK: 620, LAX: 780, ORD: 640, MIA: 580, BOS: 600, ATL: 660, DFW: 700, SFO: 820 },
NCE: { JFK: 540, LAX: 760, ORD: 620, MIA: 590, BOS: 520, ATL: 610, DFW: 650, SFO: 800 },
CUN: { JFK: 320, LAX: 420, ORD: 280, MIA: 220, BOS: 350, ATL: 260, DFW: 300, SFO: 480 },
HKT: { JFK: 1100, LAX: 980, ORD: 1050, SFO: 940, BOS: 1150 },
MRU: { JFK: 1400, LAX: 1300, ORD: 1350 },
```

### P1-2: No SRI on CDN Scripts

React 18.3.1, ReactDOM 18.3.1, and Babel 7.29.7 are loaded from unpkg without `integrity` attributes. If unpkg serves a tampered build (unlikely but possible), users run it without any verification.

```html
<!-- index.html — add integrity hashes. Generate with: -->
<!-- curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A -->

<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"
  integrity="sha384-COMPUTE_THIS"></script>
```

Not blocking launch. Add before Reddit post. **Estimated time: 30 minutes** (compute hashes, add to index.html, verify loads in browser).

### P1-3: Stale `claude/` Branches — 15 on Origin

```bash
# List them
git branch -r | grep "origin/claude/"

# Delete all in one shot (review first)
git branch -r | grep "origin/claude/" | sed 's|origin/||' | xargs -I{} git push origin --delete {}
```

Noise only. **Estimated time: 5 minutes.**

---

## P2 — Fix This Sprint

### P2-1: app.jsx at 690 KB — Babel Parse Wall Growing

Dev path (root `index.html`) loads Babel + raw 690 KB app.jsx. Production path (dist/) compiles to 457 KB via esbuild — no Babel hit. The dev-path parse time on a mid-range phone is 2–4 seconds. No fix needed for users; matters for dev iteration speed only.

**If the file hits 800 KB**, consider extracting VENUES array to a JSON file loaded at runtime (already injected via `<script>` in index.html) — keeps the architecture constraint without the parse wall. Hold this until it's actually painful.

### P2-2: `_rateMap` Memory Leak on Long Uptime

`setInterval` sweeps `_rateMap` every 60 seconds. At 100K MAU with distributed IPs, the map stays bounded. But VPS has only 1 GB RAM. At absurd MAU (1M+), this becomes a concern. Already fixed in committed code (sweep interval is healthy). Ship the VPS redeploy and revisit when MAU warrants it.

### P2-3: Waitlist `/api/waitlist` Uses `split(',')[0]` for IP Logging

Line 877 in proxy.js logs `req.headers['x-forwarded-for']?.split(',')[0]?.trim()` for the waitlist IP. The rate limiter correctly takes the last entry (hardened). The waitlist logger doesn't matter for security but is inconsistent. One-liner fix when convenient:

```javascript
// proxy.js line 877 — change [0] to .split(',').pop()
ip: req.headers['x-forwarded-for']?.split(',').pop()?.trim() || req.socket.remoteAddress,
```

**Estimated time: 2 minutes.** Ship with next proxy.js change.

---

## Cost Projection

| MAU | Frontend (GH Pages) | VPS Proxy | Open-Meteo | Supabase | Total/mo |
|---|---|---|---|---|---|
| Current (<10) | $0 | $6 | $0 (free) | $0 (free) | **$6** |
| 1K | $0 | $6 | $0 (free, VPS cache absorbs spikes) | $0 (free) | **$6** |
| 10K | $0 | $12 (need 2GB RAM) | $0 → $20 if cache misses | $25 (Pro) | **~$57** |
| 100K | $0 | $48 (4GB RAM) | $50 (burst above free tier) | $25 | **~$123** |

Open-Meteo free tier is 10K API calls/day. Without the VPS weather cache live, a Reddit spike of 2K concurrent users hitting 373 venues = 373K calls in minutes. **The VPS cache is the only thing preventing a rate-limit wall at launch.** It is not deployed.

**What breaks first at scale:** Open-Meteo. At 200+ concurrent first-time users, the client-side fallback sends 373 direct API calls per user. Without the VPS proxy cache, that's 74K+ upstream calls/hour from ~200 users — well past free-tier ceiling. The proxy's shared in-memory cache collapses that to 373 calls/2hr per cache cycle regardless of concurrent users. Deploy the VPS before any Reddit/HN post. After deployment, the next failure point is `_rateMap` exhaustion at ~50K MAU (mitigated by the sweep interval in committed code). After that, Supabase sync traffic at ~10K MAU (add Supabase Pro at that point, $25/mo).

---

## Security Summary

| Check | Result |
|---|---|
| Travelpayouts token in client code | ✅ None found |
| Supabase anon key in client | ✅ Intentional — public-safe, RLS-gated |
| `.env` / `.p8` in `.gitignore` | ✅ Covered |
| Sentry DSN active | ✅ Active DSN at app.jsx:8 |
| Secrets in recent git log | ✅ None — all 10 recent commits are report/config updates |
| Alert IDs guessable | ✅ Fixed — `crypto.randomUUID()` via `newAlertId()` at app.jsx:10238 |
| APNs auth APNS_LIVE gate | ✅ `false` — alerts tab hidden on iOS until .p8 configured |
| No SRI on CDN scripts | ⚠️ P1 — React/Babel loaded without integrity hashes |

---

## Action Checklist for Jack

1. **[ ] VPS redeploy** (P0 — 3 min):
   ```bash
   scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js
   ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && curl -s https://peakly-api.duckdns.org/health"
   ```
2. **[x] Cache stamp bumped** — done this run (`20260801a` → `20260805a`)
3. **[ ] BASE_PRICES top-15 backfill** (P1 — 2hr): add IBZ/NCE/CUN/HKT/MRU/PHL/GOI/DLM/ZNZ/BTV and 5 more to BASE_PRICES in app.jsx
4. **[ ] Supabase delete-account SQL** — paste `server/sql/delete-account.sql` into Supabase SQL editor (App Store 5.1.1(v))
