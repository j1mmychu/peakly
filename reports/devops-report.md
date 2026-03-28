# Peakly DevOps Report — 2026-03-27

**Overall Status: YELLOW**
No outages. HTTPS proxy live. Sentry live. Weather cache live. Three issues requiring immediate action: (1) TP_MARKER still placeholder — earning $0 on all flight affiliate clicks, (2) photo duplication is severe — CLAUDE.md "0% duplication" claim is false, and (3) app.jsx grew 43% overnight and is now 1.25 MB raw, degrading Babel parse time on mobile.

---

## Summary Scorecard

| Check | Status | Notes |
|---|---|---|
| Live site health | ⚠️ YELLOW | 8,695 lines / 1.25 MB — grew 43% since yesterday |
| Cache-buster | ✅ CONFIRMED | Remote already had `v=20260327v1` — current and correct |
| HTTPS proxy | ✅ GREEN | `https://peakly-api.duckdns.org` — HTTPS confirmed |
| Proxy timeout/fallback | ✅ GREEN | 5s AbortController timeout, null fallback |
| Plausible analytics | ✅ GREEN | Present, uncommented, firing |
| Weather cache | ✅ GREEN | 30-min TTL confirmed in code |
| Sentry DSN | ✅ GREEN | Live — `9416b032a46681d74645b056fcb08eb7` in both index.html and app.jsx |
| Secrets in client code | ✅ GREEN | No tokens exposed. Travelpayouts token server-side only. |
| .gitignore | ✅ GREEN | Covers .env, *.pem, *.key, *.bak |
| TP_MARKER | ❌ PLACEHOLDER | `"YOUR_TP_MARKER"` — all flight affiliate clicks earning $0 |
| Photo duplication | ❌ CRITICAL | Top photo reused 203×. "0% duplication" claim in CLAUDE.md is false. |
| React/ReactDOM CDN | ⚠️ UNPINNED | `react@18` floats — supply chain risk |
| Plausible domain | ⚠️ STALE | `j1mmychu.github.io` — must update to `peakly.app` before domain switch |

---

## P0 — Fix Today

### P0.1 — TP_MARKER Is a Placeholder (All Flight Affiliate Revenue = $0)

`app.jsx` line 3666: `const TP_MARKER = "YOUR_TP_MARKER";`

`buildFlightUrl()` at line 3672 correctly falls back to a direct Aviasales link when the marker isn't set — so flight links still work and take users to Aviasales. But no commission is being earned on any booking. Every "View Flights" CTA across all 2,226 venues is live traffic going unrewarded.

**Fix (Jack, 5 minutes):**
1. Log in to Travelpayouts → dashboard.travelpayouts.com
2. Programs → Aviasales → Your marker ID
3. Set in `app.jsx` line 3666:

```javascript
const TP_MARKER = "YOUR_ACTUAL_MARKER_ID"; // e.g. "597254"
```

No other code changes needed. The conditional at line 3685 handles the redirect wrapping automatically.

**Estimated fix time: 5 minutes, Jack only.**

---

### P0.2 — Photo Duplication Is Severe (CLAUDE.md "0% Duplication" Is Wrong)

The venue expansion to 2,226 entries reused the same Unsplash photo IDs across hundreds of venues. This is not a minor issue — users scrolling the venue list see the same photo repeated back-to-back.

**Actual duplication counts from audit:**

| Unsplash Photo ID | Times Reused | Categories Affected |
|---|---|---|
| `photo-1529961482160` | **203 venues** | Ski/snow |
| `photo-1523819088009` | **202 venues** | Kayak/water |
| `photo-1578001647043` | 110 venues | MTB |
| `photo-1512541405516` | 92 venues | MTB/bikes |
| `photo-1544551763` | 88 venues | Diving/water |
| `photo-1559288804` | 77 venues | Surf |
| `photo-1519904981063` | 73 venues | Climbing |
| `photo-1578508461229` | 72 venues | Various |
| `photo-1559291001` | 69 venues | Various |

203 venues sharing one photo ID means ~9% of the entire venue list shows the same image. This destroys visual credibility.

**Real fix:** Run a content agent pass to assign unique Unsplash photo IDs to all 2,226 venues. The original 192-venue set was done correctly; the expansion was not. Update CLAUDE.md once fixed.

**Estimated fix time: 2–4 hours dev (content pass on 2,226 venues).**

---

## P1 — Fix This Week

### P1.1 — app.jsx Is Now 1.25 MB Raw (43% Growth Overnight)

Yesterday: 6,072 lines / ~395 KB
Today: **8,695 lines / 1,313,397 bytes (1.25 MB)**

Babel Standalone must parse this entire file on every cold first load. There is no minification, no code-splitting, and no build step.

**Estimated first-paint impact:**

| Device | Cold Babel parse time |
|---|---|
| iPhone 15 Pro | ~1.5s |
| Mid-range Android (2022) | ~4–6s |
| Low-end Android (budget) | ~10–15s |

The growth is expected given 2,226 venues are now hardcoded. There is no fix without a build step or server-side venue serving. **This is an accepted architectural trade-off per CLAUDE.md.** But it must be tracked — the next major content expansion should be deferred until the bundle cost is re-evaluated.

**Monitoring action (no code change):** Watch Plausible for bounce rate increase vs. pre-expansion baseline. If mobile bounce increases >15%, treat as P0.

### P1.2 — React/ReactDOM CDN Unpinned

`index.html` lines 80–81 load `react@18` / `react-dom@18`. A breaking upstream 18.x patch auto-applies silently to all users.

**Fix (2 minutes):**
```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
```

---

## P2 — Fix This Sprint

### P2.1 — Plausible Domain Will Break on peakly.app Launch

`index.html` line 32: `data-domain="j1mmychu.github.io"` — analytics stop recording silently the moment traffic moves to `peakly.app`. No error, just data loss.

**Fix (30 seconds, before domain switch):**
```html
<script defer data-domain="peakly.app" src="https://plausible.io/js/script.hash.js"></script>
```
Also add `j1mmychu.github.io` as an additional domain in Plausible dashboard to catch traffic during DNS transition.

### P2.2 — No Rate Limiting on Flight Proxy Endpoint

The VPS Node.js flight proxy at `peakly-api.duckdns.org` has client-side concurrency capping (semaphore of 3) but no server-side rate limiting or auth. Anyone who finds the proxy URL can hit the Travelpayouts API using Peakly's server-side token without limit.

**Fix — add IP-based rate limiting in Caddy config on VPS (SSH to 198.199.80.21):**

Edit `/etc/caddy/Caddyfile`:
```
peakly-api.duckdns.org {
    reverse_proxy localhost:3001 {
        transport http {
            dial_timeout 10s
        }
    }

    # Rate limit: 60 requests per minute per IP
    rate_limit {
        zone peakly_api {
            key {remote_host}
            events 60
            window 1m
        }
    }
}
```

Install plugin:
```bash
sudo caddy add-package github.com/mholt/caddy-ratelimit
sudo systemctl restart caddy
```

**Estimated fix time: 20 minutes on VPS.**

---

## Security Audit

| Check | Result |
|---|---|
| Travelpayouts token in client code | ✅ CLEAN — only `YOUR_TP_MARKER` placeholder in client |
| Sentry DSN in client | ✅ ACCEPTABLE — public DSN by design (browser SDK requires it) |
| API keys / bearer tokens in app.jsx | ✅ CLEAN — none found |
| .gitignore coverage | ✅ GOOD — covers .env, *.env, *.pem, *.key, *.p12 |
| Recent commits (git log -10) | ✅ CLEAN — no secrets in messages or diffs |
| Flight proxy auth | ⚠️ NONE — see P2.2 above |

**Note on Sentry DSN exposure:** The DSN `https://9416b032a46681d74645b056fcb08eb7@o4511108649058304.ingest.us.sentry.io/4511108673765376` is visible in both `index.html` and `app.jsx`. This is **intentional and correct** for browser SDKs — the Sentry DSN is a write-only ingest key. Anyone who finds it can send errors to your project but cannot read your data. Sentry's own documentation says this is expected for client-side use.

---

## Performance Analysis

| Asset | Size | Notes |
|---|---|---|
| Babel Standalone 7.24.7 | ~2.0 MB | Largest single asset — blocks parse |
| ReactDOM 18 UMD prod | ~1.1 MB | Required |
| React 18 UMD prod | ~130 KB | Required |
| **app.jsx (raw JSX, today)** | **1.25 MB** | Up from 395 KB yesterday — +216% |
| **Total first-load JS** | **~4.5 MB** | Up from ~3.6 MB yesterday |

**Image lazy loading:** ✅ Verified on all `<img>` tags — `loading="lazy"` present on ListingCard, CompactCard, FeaturedCard, VenueDetailSheet, and hero card.

---

## Cost Projections

| MAU | Monthly infra cost | Notes |
|---|---|---|
| Current (~0) | $6/mo | VPS only |
| 1K MAU | $6/mo | Weather cache + free tier Open-Meteo holds |
| 5K MAU (post-Reddit) | $12/mo | Upgrade VPS to 2GB RAM ($12); Open-Meteo still free |
| 10K MAU | $18–35/mo | Open-Meteo commercial tier (~$29/mo) + 2GB VPS |
| 100K MAU | $80–150/mo | CDN (Cloudflare Pro $20) + larger VPS + Open-Meteo commercial |

**Open-Meteo free tier (10K calls/day) capacity with weather cache:**
- Cold load: ~100 venues fetched per user session (top 100 by score)
- 30-min cache TTL means returning users = 0 calls within the window
- Safe to ~300 daily active users before approaching free tier limit
- At 1K MAU with 10% DAU = 100 DAU = ~10,000 calls/day — **right at the limit**
- Fix before growth push: move to Open-Meteo commercial ($29/mo) at 500+ DAU

---

## What Breaks First at Scale

The single highest-risk silent failure is Open-Meteo hitting 10K calls/day at ~100 DAU. When this happens, weather data stops loading, venue scores go blank, and the entire value proposition of the app disappears — with no error shown to users. The fix before any growth push: add a server-side weather proxy on the existing VPS (Node.js, ~20 lines, uses the same in-memory Map pattern as the existing flight price semaphore). One VPS fetch per venue per 30 minutes serves all users from cache instead of each browser calling Open-Meteo directly — reduces daily API calls by ~99% regardless of MAU. After that, the next failure point is the Babel 2 MB parse on low-end Android, measurable in Plausible as high mobile bounce rates and fixable only by adding a one-time pre-compile step to eliminate Babel Standalone from production.

---

## Action Items

| Priority | Owner | Action | Est. Time | Status |
|---|---|---|---|---|
| P0 | Jack | Set real TP_MARKER in app.jsx (Travelpayouts dashboard) | 5 min | ⏳ PENDING |
| P0 | Dev | Fix photo duplication across 2,226-venue expansion | 2–4 hrs | ⏳ PENDING |
| P1 | Dev | Pin React/ReactDOM to 18.3.1 in index.html | 2 min | ⏳ PENDING |
| P2 | Dev | Add rate limiting to VPS Caddy config | 20 min | ⏳ PENDING |
| P2 | Dev | Update Plausible domain to peakly.app before DNS switch | 30 sec | BLOCKED (domain) |
| Future | Dev | Server-side weather cache proxy on VPS (pre-growth) | 2 hrs | ⏳ PENDING |

---

## Carried Forward From Previous Reports (Status Update)

| Item | Previous Status | Today Status |
|---|---|---|
| Sentry DSN | Reported empty in v1 | ✅ LIVE — confirmed in code |
| buildFlightUrl → Aviasales | Was Google Flights | ✅ SHIPPED — Aviasales format live |
| TP_MARKER placeholder | First flagged today | ❌ STILL PLACEHOLDER — P0 |
| React unpinned | ⏳ PENDING | ⏳ STILL PENDING |
| Plausible domain | ⏳ PENDING | ⏳ STILL PENDING |
| VPS Node.js flight LRU cache | ⏳ PENDING | ⏳ STILL PENDING |
| Photo duplication | Claimed 0% in CLAUDE.md | ❌ FALSE — 203× worst case |
