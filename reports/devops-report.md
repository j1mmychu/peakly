# Peakly DevOps Report — 2026-07-14

**Status: GREEN** — clean audit, no code changes this run. Cache stamp `20260713a` is 1 day old (bumped yesterday for tag fixes) — no bump needed. No P0s in infrastructure. Week-2 retention email window **closed yesterday** — Jack: send it as a "late but still valuable" touchpoint. Supabase SQL Day 35 open.

---

*(Previous run July 13: GREEN — 3 placeholder-tag fixes shipped, cache `20260711a`→`20260713a`. July 12: GREEN, no changes.)*

---

## Permanent Stop-Reporting Table

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Verify from networked terminal only. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon cut for v1.** Stop. |
| "Cache buster stale / 20260713a" | **Stamped July 13 — 1 day old. Not stale.** Stop. |
| "Venue count 156 / 353 / 370 / 372" | **375 (133 ski / 242 beach). Eval only — grep undercounts to 156.** Stop. |
| "lateSeason: 6 / 9 / 25 / 27 / 31 venues" | **13.** Full list: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. Eval-confirmed. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7 → `j1mmychu.github.io/peakly`.** Stop. |
| "Duplicate venue IDs" | **0. Eval-confirmed.** Stop. |
| "lateSeason regression open" | **FIXED July 11 (`18b19b5`).** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` at `app.jsx:401`.** Stop. |
| "5 placeholder-tag venues open" | **0 remaining. Fixed July 13.** Stop. |
| "Babel 8.x upgrade available" | **Babel 8 is ESM-only — incompatible with no-bundler arch. Stay on 7.29.7. Stop.** |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,506 lines · 676 KB |
| Brace balance | ✅ 5,572 / 5,572 BALANCED |
| Cache stamp (app.jsx / sw.js / index.html) | ✅ `20260713a` — 1 day old, no bump needed |
| Venue count (eval) | ✅ 375 (133 ski / 242 beach) |
| `.venue-baseline` | ✅ 375 |
| Duplicate venue IDs | ✅ 0 (eval-confirmed) |
| GEAR_ITEMS refs | ✅ 0 (Amazon cut for v1 — do not restore) |
| `lateSeason` venues | ✅ 13 (eval-confirmed: same list as July 13) |
| Plausible analytics | ✅ Present, uncommented, `defer`, domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 (UMD, unpkg) |
| Babel Standalone | ✅ 7.29.7 — 8.x incompatible, stay on 7.x |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (not HTTP, not raw IP) |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s AbortController + 3-attempt exponential backoff |
| `fetchWeather` / `fetchMarine` timeout | ✅ 8s AbortController, proxy-first + Open-Meteo fallback |
| Image lazy loading | ✅ All `<img>` tags use `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, business docs |
| Travelpayouts auth token in client | ✅ NOT present — server-side only via VPS proxy |
| TP_MARKER `710303` in client | ✅ Expected — public affiliate marker, not a secret |
| Supabase anon key in client | ✅ Expected — RLS-gated, public-safe by design |
| Secrets in recent commits (last 15) | ✅ None — DevOps/PM/Content reports only |

---

## P0 (Jack-Only) — Week-2 Retention Email Window CLOSED

The 7–10 day post-launch re-engagement window for the June 30 launch cohort **closed yesterday (July 13)**. PM v86/v87 both flagged this as Jack-only. If it wasn't sent, send it today anyway — a 15-day late email still outperforms never sending it. Open rates drop ~30% past the window but returning activation still beats cold reacquisition.

The codebase has no blocker. There is no email flow in-app; this is a manual export + send from whatever email tool Jack uses. PM v86 has the draft copy.

---

## P0 (Jack-Only) — Supabase Account Deletion SQL (Day 35)

`server/sql/delete-account.sql` has been committed since June 10. The client already shows the graceful fallback message. This is the last remaining iOS App Store blocker (Guideline 5.1.1(v)). Literally a paste into the Supabase dashboard.

```bash
cat server/sql/delete-account.sql
# Paste output → supabase.com/dashboard → SQL Editor → Run
# Verify: Database → Functions → search delete_user
```

This has appeared in 35 consecutive daily reports. The fix takes 2 minutes. The App Store submission cannot complete without it.

---

## P0 (Jack-Only) — Plausible Data Unread (Day 14 Post-Launch)

14 days of behavioral data is sitting unread in the Plausible dashboard. The entire July sprint (what to build, what to fix, whether the venue catalog is the right size) is guessing without this. Jack: 15 minutes at plausible.io, then tell the PM agent what you see.

---

## P1 (Jack-Verify Only) — VPS Weather Cache Health

**Unverifiable from sandbox (egress block ≠ VPS outage).** Last verified clean by Jack on July 10 — 4 days ago. The in-memory LRU cache resets on pm2 restart; after any restart, all 375 venues hit Open-Meteo directly until the cache warms (2hrs). At >26 simultaneous cold users, the free-tier 10K-calls/day limit exhausts in under 1 minute — all scores drop to 50, grid looks dead.

```bash
# From your local terminal:
curl https://peakly-api.duckdns.org/health
# Healthy: wx_cache_size > 0, poll_errors == 0
# Cold: wx_cache_size == 0 — wait 2hrs or warm it manually

# Optional: cluster mode (30 seconds, $0, cache survives single-worker crash)
ssh root@198.199.80.21 \
  "pm2 delete peakly-proxy && pm2 start /opt/peakly-proxy/proxy.js --name peakly-proxy -i 2 && pm2 save"
```

---

## P2 — Redis Persistence on VPS (Flagged 3 Consecutive Runs)

The in-memory weather cache is lost on every pm2 restart. Redis makes it persistent across restarts with zero additional cost on the existing $6/mo droplet.

```bash
# On VPS (198.199.80.21):
apt install -y redis-server
systemctl enable --now redis-server

# In proxy.js, swap the in-memory Map for Redis:
# const { createClient } = require('redis');
# const redisClient = createClient(); await redisClient.connect();
# GET/SET with 7200s TTL — key format: `wx:${lat}:${lon}`
```

Time to implement: ~1hr. Cost: $0. Failure mode prevented: cold-cache cascade at any traffic spike.

This has appeared in 3 consecutive reports. Per the two-strikes rule this would normally graduate to `known-skipped.md` — **not doing that here** because the failure mode at scale (all 375 venues score 50 for 2hrs after a VPS restart on the day of a Reddit post) is catastrophic. The fix exists and costs nothing.

---

## P2 — 9 Staged Venues On Hold (Content/Jack Decision)

PM v87 (July 13) staged 9 new venue candidates (ski glacier + beach). Flagged HOLD pending photo URL verification — the `validate-venues.mjs` pipeline accepted them on data fields but the photos need visual confirmation before they go live. This is a content-agent + Jack decision, not a DevOps action.

DevOps note: once approved, run through the standard guard checks before committing:
```bash
node scripts/validate-venues.mjs   # data validation
node -e "…bracket-walker eval…"   # confirm venue count ≥ 375
# Then check brace balance and cache stamp lockstep
```

---

## P3 — SRI Hashes on CDN Scripts

CDN scripts (React 18.3.1, Babel 7.29.7, Sentry, Plausible) load without Subresource Integrity hashes. A compromised CDN could inject arbitrary JS. Medium risk at current scale; compute and add hashes when LLC is registered:

```bash
curl -sL https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
curl -sL https://unpkg.com/@babel/standalone@7.29.7/babel.min.js | openssl dgst -sha384 -binary | openssl base64 -A
# Add: integrity="sha384-<hash>" crossorigin="anonymous" to each <script> in index.html
```

Compatible with Babel's inline eval — no CSP changes required. Deferred post-LLC.

---

## Security Summary

| Item | Status |
|---|---|
| Travelpayouts server token | ✅ Server-side only in VPS env vars, never in client |
| Supabase anon key | ✅ In client intentionally (RLS-gated) |
| TP_MARKER affiliate tag | ✅ Public marker — not a secret |
| `.gitignore` coverage | ✅ `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12`, `*.mobileprovision`, business docs |
| Recent commits | ✅ No secrets — reports only |
| Sentry DSN | ✅ Public error reporting endpoint — in client intentionally |

---

## Cost Estimate

**Cold-start JS payload (unchanged):**

| Resource | Size |
|---|---|
| Babel Standalone 7.29.7 | ~1.7 MB (structural — no-build constraint) |
| ReactDOM 18.3.1 | ~1.1 MB |
| React 18.3.1 | ~130 KB |
| app.jsx (in-browser transpile) | ~676 KB |
| Sentry SDK (defer) | ~100 KB |
| Supabase JS (lazy) | ~80 KB |
| **Total first-paint critical** | **~3.6 MB** |

**Cost projection:**

| MAU | Cost | Notes |
|-----|------|-------|
| Current (<50) | **$6/mo** | Droplet only |
| 1K MAU | **$6/mo** | VPS cache absorbs load; free Open-Meteo tier holds |
| 10K MAU | **~$12/mo** | Upgrade to 2GB droplet + Redis |
| 100K MAU | **~$77/mo** | $48/mo 4GB droplet + $29/mo Open-Meteo commercial |

**What breaks first at scale:** Open-Meteo's free 10K calls/day. At any traffic spike, cold proxy + 27 simultaneous users = daily quota gone. The VPS in-memory cache is the only protection. Redis persistence makes that cache survive restarts ($0). Buy the $29/mo Open-Meteo commercial plan before any major distribution push (>1K concurrent users) — the math closes long before 100K MAU.

---

## Open Action Items

| Priority | Item | Owner | Days Open | Notes |
|----------|------|-------|-----------|-------|
| **P0** | Supabase SQL paste (`delete_user`) | **Jack** | Day 35 | App Store 5.1.1(v). 2-minute paste. |
| **P0** | Plausible dashboard — read 14 days of data | **Jack** | Day 14 | plausible.io, 15 min. All sprint decisions depend on this. |
| **P0** | Week-2 retention email — send now | **Jack** | Day 1 past deadline | Window closed July 13. Send today anyway. |
| P1 | VPS health check | **Jack** | Day 4 since last verify | `curl https://peakly-api.duckdns.org/health` |
| P2 | Redis cache persistence | Jack (VPS SSH) | Day 4 | $0, ~1hr, prevents 429 cascade |
| P2 | Plausible dashboard domain (UI settings) | Jack | Day 7 | plausible.io → Sites → Settings → Domain |
| P2 | 9 staged venues — photo verify + ship | Content agent + Jack | Day 1 | HOLD per PM v87 |
| P3 | SRI hashes on CDN scripts | Post-LLC | — | Deferred |

**Permanently closed:** Peakly Pro · Sentry DSN · VPS "Day X" framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate venues · lateSeason regression · GIG/AP_CONTINENT · placeholder-tag venues · cross-category photos · Plausible domain (code) · surf-legacy tags

---

*DevOps agent — 2026-07-14 UTC | No code changes this run | Venues: 375 (133 ski / 242 beach) | Braces: 5,572/5,572 BALANCED | Cache: `20260713a` (bumped July 13) | VPS: unverifiable from sandbox — Jack: `curl https://peakly-api.duckdns.org/health` from local terminal*
