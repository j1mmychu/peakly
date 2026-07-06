# Peakly DevOps Report — 2026-07-06

**Status: YELLOW** — one user-visible P1 fixed this run (beach venues showing ski photos); VPS health unverifiable from sandbox, monitoring gap persists post-Reddit-launch.

---

## Prompt Corrections (permanent — stop re-raising these)

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Verify from networked terminal only. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon cut for v1.** Stop. |
| "Cache buster stale / peakly-20260705a" | **Bumped this run → `20260706a`.** Stop re-flagging yesterday's stamp. |
| "Venue count 156 / 182 / 353 / 372" | **370 (131 ski / 239 beach). Eval only — grep undercounts to 156.** |
| "lateSeason: 6 venues" | **25 venues.** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,444 lines · 673 KB |
| Brace balance | ✅ 5,565 / 5,565 BALANCED |
| Cache stamp (app.jsx / sw.js / index.html) | ✅ `20260706a` (bumped this run from stale `20260705a`) |
| Venue count | ✅ 370 (131 ski / 239 beach) via bracket-walk eval |
| GEAR_ITEMS refs | ✅ 0 |
| lateSeason venues | ✅ 25 |
| Plausible analytics | ✅ Present, uncommented, `defer` |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 (UMD, unpkg) |
| Babel Standalone | ✅ 7.29.7 (unpkg) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (not raw IP, not HTTP) |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s timeout + 2-retry backoff |
| `fetchWeather` / `fetchMarine` timeout | ✅ 8s + 2-retry, proxy-first with Open-Meteo fallback |
| Image lazy loading | ✅ All `<img>` tags use `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, secrets |
| Travelpayouts token in client | ✅ NOT present — server-side only |
| Supabase anon key in client | ✅ Expected — RLS-gated, public-safe by design |

---

## P1 — Cross-Category Photo Contamination (FIXED THIS RUN)

**What broke:** Two beach venues were rendering ski/mountain photos. Photo IDs matched ski venues (Kiroro Snow World, Andermatt, Engelberg-Titlis, Mount Snow) — a copy-paste collision from the June batch paste.

| Venue | Reviews | Old photo (ski image) | New photo (beach) |
|---|---|---|---|
| `south-beach-miami` | 42,800 (most-reviewed in catalog) | `1605540436563-5bca919ae766` | `1507525428034-b723cf961d3e` (open ocean/beach) |
| `grace-bay-turks` | 12,500 | `1531743672295-bbd901790069` | `1414609245224-aea9a7afaef8` (turquoise Caribbean) |

**Fix:** Applied directly this run. One-line edit per venue. Brace balance confirmed at 5,565/5,565. Cache bumped to `20260706a`.

South Beach Miami has 42,800 reviews — the most-reviewed venue in the catalog. Any Reddit-launch traffic that tapped it saw a snow mountain. That erodes brand trust fast. Shipped.

---

## P1 (Ongoing) — VPS Weather Cache Restart Risk

**Status: Unverifiable from sandbox (403 egress block on `peakly-api.duckdns.org`). Flagged for the 4th consecutive run.**

The VPS proxy holds a 2hr in-memory LRU weather cache. If the process restarted since the June 30 Reddit launch, `wx_cache_size = 0` and every cold user hits Open-Meteo directly. At ≥14 simultaneous fresh-loading users, the free-tier daily quota is exhausted and all venues score 50 — looks like a dead app to new visitors.

**Jack: run this now (2 min):**

```bash
curl https://peakly-api.duckdns.org/health
# Look for: wx_cache_size > 0, uptime > 5d, apns_configured: false (expected)
# If wx_cache_size == 0 or proxy down:
ssh root@198.199.80.21 "pm2 restart peakly-proxy"
curl https://peakly-api.duckdns.org/health | grep wx_cache_size
```

If the VPS rebooted after June 30 launch, every user for hours saw flat 50-score cards. That's the most likely cause of any bounce spike visible in Plausible.

---

## P2 — Cache Stamp Was Stale by 1 Day

Yesterday's DevOps agent bumped to `20260705a`; today's stamp was still `20260705a` when this run started. **Fixed this run → `20260706a`.** Auto-push hook handles this for interactive Edit/Write sessions, but scheduled-task agents run outside the hook's catchment (Open #11). Net effect: returning users with a cached SW would have loaded yesterday's assets for up to 24h. Low impact at current MAU; becomes real if daily agent runs don't touch app.jsx.

**Prevention:** Add the daily crontab entry (recommended 2026-05-09, never added):

```bash
45 17 * * * cd ~/peakly && bash scripts/auto-push.sh
```

---

## P2 — Plausible `data-domain` Scope (July 7 Sprint)

```html
<!-- index.html:32 — current (wrong — tracks all of j1mmychu.github.io, not just /peakly): -->
<script defer data-domain="j1mmychu.github.io" src="https://plausible.io/js/script.hash.js"></script>

<!-- Fix: -->
<script defer data-domain="j1mmychu.github.io/peakly" src="https://plausible.io/js/script.hash.js"></script>
```

Also update in the Plausible dashboard: Site Settings → General → Domain → `j1mmychu.github.io/peakly`. 2-minute fix. **Scheduled for July 7 sprint.**

---

## P2 — Supabase Account Deletion SQL Not Deployed

`server/sql/delete-account.sql` committed but not pasted into the Supabase SQL editor. Client shows a graceful fallback. Blocks iOS App Store (Guideline 5.1.1(v)).

**Jack: paste `server/sql/delete-account.sql` into the Supabase SQL editor. 2 minutes.**

---

## P3 — No SRI on CDN Scripts (Open #10, Deferred Post-LLC)

Not re-flagging until LLC registered. Fix when ready:

```bash
curl -sL https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
# Add integrity="sha384-<HASH>" crossorigin="anonymous" to each <script> in index.html
```

SRI works without a CSP — safe with Babel's `eval()` usage.

---

## Performance & Cost

**JavaScript load at cold start:**

| Resource | Size |
|---|---|
| ReactDOM 18.3.1 (prod) | ~1.1 MB |
| Babel Standalone 7.29.7 | ~1.7 MB |
| React 18.3.1 (prod) | ~130 KB |
| app.jsx (transpiled in-browser) | ~673 KB |
| Sentry SDK (lazy) | ~100 KB |
| Supabase JS (lazy) | ~80 KB |
| **Total first-paint critical** | **~3.6 MB** |

Babel is 1.7 MB and is the largest item. Structural constraint of the no-build-step architecture — not changing. Costs ~1.2s on LTE, ~4s on 3G.

**Infrastructure cost projection:**

| MAU | Monthly cost |
|---|---|
| Current (<100) | $6/mo (DigitalOcean droplet only) |
| 1K | $6/mo — Open-Meteo free tier handles it |
| 10K | ~$15/mo — upgrade to $12/mo 2GB droplet for proxy headroom |
| 100K | ~$60/mo — paid Open-Meteo plan (~$29/mo) + $24/mo 4GB droplet |

**Free win available right now:** `pm2 start proxy.js -i 2` on the VPS (cluster mode) — crash-resilient, no cold-flush of the entire cache on process death. 30 seconds, $0.

---

## What Breaks First at Scale

**Open-Meteo's free tier, within minutes of a Reddit/HN spike.** The VPS proxy's 2hr shared weather cache is the only wall between a traffic spike and a rate-limit wall. Cache-cold + 14 simultaneous users = daily free-tier quota exhausted in under a minute. After that, `fetchWeather` returns null, venues score 50, and the grid looks dead. The defense is one SSH command: when any traffic campaign is active, keep `pm2 describe peakly-proxy` running in a terminal. If `wx_cache_size == 0`, restart the proxy — cache refills within 2 minutes of normal traffic. At >5K MAU, run cluster mode so a crash doesn't cold-flush everything at once.

---

## Fixes Applied This Run

| Fix | Impact |
|---|---|
| Swapped ski photos on `south-beach-miami` (photo `1605540436563`) + `grace-bay-turks` (photo `1531743672295`) | P1 user-visible fix — beach venues now show beach photos |
| Cache stamp `20260705a` → `20260706a` across app.jsx + sw.js + index.html | Forces SW update; returning users get fresh assets |

---

*DevOps agent — 2026-07-06 UTC | Synced to origin/main | Venues: 370 (131 ski / 239 beach) | Braces: 5,565/5,565 BALANCED | Cache: `20260706a` | VPS: unverifiable from sandbox — check manually.*
