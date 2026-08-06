# DevOps Report — 2026-08-06 (RED) — Day 14 VPS Undeployed

**Status: 🔴 RED**

Day 14. The VPS hasn't been touched since July 23. `server/proxy.js` on the live server is running pre-July-23 code. Every fix shipped since then — HTTP/2 APNs transport, JWT P1363 encoding, disk-cache persistence for weather, CORS for iOS native, alert deletion, rate-limiter hardening — is inert. This is no longer a sprint item. It's the only thing standing between current state and a launch-ready stack, and it takes 3 minutes to fix.

**Action taken this run:** Cache stamp was 1 day stale (`20260805a` → `20260806a`), bumped in `app.jsx`, `sw.js`, and `index.html` in lockstep.

---

## Infrastructure Status

| Component | Status |
|---|---|
| GitHub Pages (frontend) | ✅ Auto-deploys on push via `deploy.yml` |
| esbuild production build | ✅ `dist/app.min.js` rebuilt by CI on each push; Babel stripped |
| Cache stamp | ✅ **Bumped this run** — `20260806a` (was `20260805a`, 1 day stale) |
| VPS proxy (198.199.80.21) | ❌ **Day 14 undeployed** — running pre-Jul-23 proxy.js |
| Disk cache persistence (Open #23) | ✅ Coded in `server/proxy.js` (lines 383–402) — inert until VPS deploy |
| APNs HTTP/2 + P1363 fix (Open #21) | ✅ Coded in `server/proxy.js` — inert until VPS deploy |
| Alert ID `crypto.randomUUID()` (Open #21) | ✅ Live in `app.jsx` |
| CORS: `capacitor://localhost` | ✅ Coded in `server/proxy.js` — inert until VPS deploy |
| `DELETE` in Allow-Methods | ✅ Coded in `server/proxy.js` — inert until VPS deploy |
| Rate limiter XFF last-entry fix | ✅ Coded in `server/proxy.js` — inert until VPS deploy |
| `forecast_days` 14 / marine 10 | ✅ Coded in `server/proxy.js` — inert until VPS deploy |
| APNS_LIVE flag | ✅ `false` in `app.jsx` — correct until .p8 is wired |
| Supabase cloud sync | ✅ Live, anon key wired, RLS active |
| Plausible analytics | ✅ Active — `data-domain="j1mmychu.github.io/peakly"`, defer-loaded, uncommented |
| Sentry error monitoring | ✅ Active DSN `9416b032...`, deferred CDN load |
| React 18.3.1 / Babel 7.29.7 | ✅ Current CDN versions |
| Open-Meteo direct (client fallback) | ✅ Active — batched 50/2s with 2hr localStorage cache |
| BASE_PRICES coverage | ❌ **10.3% (15/146 venue airports)** — 131 airports missing price data |
| Stale branches on origin | ⚠️ 18 branches (15 `claude/*` + 3 others) |

---

## P0 — Fix Today

### P0-1: VPS Proxy — Day 14 Undeployed (3 minutes, Jack only)

Every proxy.js fix since July 23 is sitting in git, not on the server. Until this runs, the following are broken in production:

- Two-weekend scoring is off (proxy serves 7-day forecasts; `forecast_days=14` is in committed code, not deployed)
- iOS native app calls to the proxy are blocked (CORS missing `capacitor://localhost`)
- Alert deletion silently fails (preflight blocks `DELETE`)
- Weather cache is wiped on every `pm2 restart` (disk persistence in committed code, not deployed)
- APNs JWT signing is wrong format (DER vs P1363) — no push delivery when enabled
- Rate limiter is forgeable (committed fix reads last XFF entry; deployed code reads first)

```bash
# One command. Run from your local machine.
scp server/proxy.js root@198.199.80.21:/opt/peakly-proxy/proxy.js && \
ssh root@198.199.80.21 "cd /opt/peakly-proxy && pm2 restart peakly-proxy && sleep 2 && curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool"
```

Verify the health response shows:
- `"apns": "unconfigured"` (expected until .p8 is wired)
- `"wx_cache_size": 0` (will refill on traffic)
- `"forecast_days": 14` (confirms the new proxy is live)
- `"disk_cache_enabled": true` (Open #23 confirmed)

**Estimated time: 3 minutes.** No excuses at Day 14.

---

## P1 — Fix This Week

### P1-1: BASE_PRICES — 89.7% of Venue Airports Missing Deal Score (2 hours)

Current coverage: **15 of 146 venue airports** have pricing data. The 15 covered: YVR, JFK, LAX, SFO, ORD, MIA, SEA, BOS, ATL, DEN, DFW, LAS, PHX, MSP, DTW. Missing: **131 airports**, including high-traffic beach destinations CUN, BOB, AUA, STT, SXM, AGP, HER, ACE, and every non-US ski destination.

When a user's home airport is in BASE_PRICES but the destination airport isn't (or vice versa), `getDealScore()` returns null and the deal badge doesn't render. The deal score is a headline feature. 89.7% of airport pairs produce no signal.

PM deadline (from v110): 10 days to Reddit. This is the second-biggest quality gap after photos.

Backfill the top 15 by venue count. Add these blocks to `BASE_PRICES` in `app.jsx`:

```javascript
// Top missing destinations — add to BASE_PRICES object (~line 6136)
CUN: { JFK: 320, LAX: 420, ORD: 280, MIA: 220, BOS: 350, ATL: 260, DFW: 300, SFO: 480, SEA: 450, DEN: 340 },
BOB: { JFK: 1800, LAX: 1400, SFO: 1350, ORD: 1900, BOS: 1850 },
AUA: { JFK: 350, MIA: 280, BOS: 380, ATL: 320, ORD: 420, DFW: 450 },
STT: { JFK: 380, MIA: 300, BOS: 410, ATL: 350, ORD: 480 },
SXM: { JFK: 420, MIA: 340, BOS: 440, ATL: 380, ORD: 510 },
AGP: { JFK: 680, LAX: 820, BOS: 640, ORD: 700, SFO: 860 },
HER: { JFK: 720, LAX: 860, BOS: 680, ORD: 740 },
ACE: { JFK: 710, LAX: 840, BOS: 670, ORD: 730 },
HKT: { JFK: 1100, LAX: 980, ORD: 1050, SFO: 940, BOS: 1150 },
MRU: { JFK: 1400, LAX: 1300, ORD: 1350 },
NCE: { JFK: 540, LAX: 760, ORD: 620, MIA: 590, BOS: 520, ATL: 610, DFW: 650, SFO: 800 },
IBZ: { JFK: 620, LAX: 780, ORD: 640, MIA: 580, BOS: 600, ATL: 660, DFW: 700, SFO: 820 },
GRU: { JFK: 820, MIA: 540, LAX: 980, SFO: 1020, ORD: 890 },
LIS: { JFK: 560, LAX: 780, BOS: 520, ORD: 640, MIA: 620, SFO: 820 },
VCE: { JFK: 580, LAX: 800, BOS: 540, ORD: 660, MIA: 630, SFO: 840 },
```

These are rough annual-mean estimates using public fare data. Seasonal multiplier (`getSeasonalMultiplier`) adjusts them at runtime. Better than null.

**Estimated time: 2 hours** (15 airport blocks + verify deal scores render in browser).

### P1-2: 18 Stale Branches on Origin (5 minutes)

15 `claude/*` branches + `fix-appjsx-final`, `restore-appjsx`, `test-small` are sitting on origin. They're dead weight in the remote listing and create confusion.

```bash
# Delete all claude/* branches
git branch -r | grep "origin/claude/" | sed 's|  origin/||' | \
  xargs -I{} git push origin --delete {}

# Delete the other three
git push origin --delete fix-appjsx-final restore-appjsx test-small
```

**Estimated time: 5 minutes.**

### P1-3: No SRI on CDN Scripts

React 18.3.1, ReactDOM 18.3.1, and Babel 7.29.7 loaded from unpkg without `integrity` attributes. If unpkg serves a tampered build, users run it undetected.

```bash
# Generate SHA-384 hashes for each CDN asset
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -s https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then add `integrity="sha384-<HASH>" crossorigin="anonymous"` to each `<script>` tag in `index.html`. Note: SRI + Babel inline-eval may require `Content-Security-Policy: script-src 'unsafe-eval'` — test in browser before shipping.

**Estimated time: 30 minutes.** Do this before Reddit post.

---

## P2 — Fix This Sprint

### P2-1: Waitlist IP Logger Takes First XFF Entry

`proxy.js` line ~877 reads `req.headers['x-forwarded-for']?.split(',')[0]` for IP logging in the waitlist endpoint. The rate limiter was hardened to take the last entry. The waitlist logger is inconsistent — low risk but easy fix.

```javascript
// proxy.js ~line 877 — change [0] to .pop()
ip: req.headers['x-forwarded-for']?.split(',').pop()?.trim() || req.socket.remoteAddress,
```

Ship with next proxy.js change. **Estimated time: 2 minutes.**

### P2-2: app.jsx at 13,724 Lines / 675 KB — Babel Parse Time on Mobile

Production path (via `dist/app.min.js`) is fine — esbuild compiles to ~439 KB, Babel stripped. Dev path (`index.html` → raw `app.jsx`) triggers Babel Standalone on a 675 KB file. On a mid-range phone that's 2–4s parse time per dev session.

No action needed until it hits 800 KB. At that point, extract the VENUES array to a JSON sidecar loaded via `<script src="venues.json">` and `window.VENUES`. The architecture constraint (single file, no build step) survives that extraction.

**Estimated time: 0 — watch it, don't fix it yet.**

---

## Security Summary

| Check | Result |
|---|---|
| Travelpayouts token in client code | ✅ None — server-side only via `process.env.TRAVELPAYOUTS_TOKEN` |
| Supabase anon key in client | ✅ Intentional — public-safe, RLS-gated; expected exposure |
| `.env` / `.p8` / `.pem` in `.gitignore` | ✅ Covered |
| Sentry DSN active | ✅ Active DSN at `app.jsx:8` — error reports flowing |
| Recent commits for secrets | ✅ Last 10 commits: reports + config only, no secrets |
| Alert IDs guessable | ✅ Fixed — `crypto.randomUUID()` via `newAlertId()` in app.jsx |
| APNs gate | ✅ `APNS_LIVE = false` — alerts tab hidden on iOS, no false promises |
| SRI on CDN scripts | ⚠️ P1 — React/Babel load without integrity hashes |

---

## Performance

| Metric | Value |
|---|---|
| `app.jsx` lines | 13,724 |
| `app.jsx` size | 675 KB raw |
| CDN scripts loaded | React 18 (~45 KB gz), ReactDOM 18 (~130 KB gz), Babel 7.29.7 (~250 KB gz), Sentry (~80 KB gz), Supabase (~80 KB gz lazy) |
| Total JS on first load | ~585 KB gzipped (production — no Babel), ~835 KB gzipped (dev path) |
| Lazy loading on images | ✅ `loading="lazy"` on all card images |
| Production build path | ✅ esbuild via `deploy.yml` — Babel stripped, ~439 KB minified |

---

## Cost Projection

| MAU | GitHub Pages | VPS Proxy | Open-Meteo | Supabase | Total/mo |
|---|---|---|---|---|---|
| <10 (now) | $0 | $6 | $0 | $0 | **$6** |
| 1K | $0 | $6 | $0 (VPS cache absorbs spikes) | $0 | **$6** |
| 10K | $0 | $12 (2 GB RAM) | $0–$20 (cache misses) | $25 (Pro) | **~$57** |
| 100K | $0 | $48 (4 GB RAM) | $50 | $25 | **~$123** |

---

## What Breaks First at Scale

**Open-Meteo.** The free tier allows ~10K API calls/day. A Reddit spike of 500 first-time users hitting 373 venues sends 186,500 direct Open-Meteo calls — 18× the daily limit — before the first cache entry is warm. The VPS weather cache collapses that to 373 calls per 2-hour cycle regardless of concurrency. Without the VPS redeploy, the app silently degrades to "conditions unavailable" for every new user during a traffic spike. This is the only scale failure mode that matters before 1K MAU. Everything else — Supabase, VPS RAM, rate limiting — has headroom to 10K+ users. **Deploy the VPS before any Reddit/HN post.** That's still the single prerequisite.

---

## Action Checklist for Jack

| # | Item | Time | Owner |
|---|---|---|---|
| ✅ | Cache stamp bumped `20260805a` → `20260806a` | — | Done this run |
| **[ ]** | **VPS redeploy** (P0 — Day 14) — `scp server/proxy.js ... && pm2 restart` | 3 min | Jack |
| **[ ]** | **BASE_PRICES top-15 backfill** (P1) — paste blocks above into `app.jsx` | 2 hr | Jack/DevOps |
| **[ ]** | Delete 18 stale origin branches (P1) | 5 min | Jack |
| **[ ]** | Supabase delete-account SQL — paste `server/sql/delete-account.sql` into Supabase editor | 2 min | Jack |
| [ ] | SRI hashes on CDN scripts (P1-3) | 30 min | Before Reddit |
