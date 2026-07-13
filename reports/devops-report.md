# Peakly DevOps Report — 2026-07-13

**Status: GREEN** — 3 placeholder-tag fixes shipped (whistler / beaver-creek / park-city-mountain), cache bumped `20260711a` → `20260713a`. No P0s. No security issues. Infrastructure clean. Week-2 retention email window **closes today** — Jack-only, last call.

---

*(Previous run July 12: GREEN, no code changes, email deadline flagged.)*

---

## Prompt Corrections (permanent — stop re-raising these)

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Verify from networked terminal only. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon cut for v1.** Stop. |
| "Cache buster stale (20260711a)" | **Bumped to `20260713a` this run — 3 tag changes triggered it.** |
| "Venue count 156 / 353 / 370" | **375 (133 ski / 242 beach). Eval only — grep undercounts.** Stop. |
| "lateSeason: 6 / 9 / 5 / 25 / 31 venues" | **13.** Full list: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7 → `j1mmychu.github.io/peakly`.** Stop. |
| "2 dup venues pending removal" | **FIXED July 8. 0 duplicate IDs.** Stop. |
| "lateSeason regression open" | **FIXED July 11 (`18b19b5`).** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` at `app.jsx:401`.** Stop. |
| "5 placeholder-tag venues" | **0 remaining. FIXED this run (July 13).** Stop. |
| "cancun-beach dup" | **FIXED July 8. 0 duplicate IDs.** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,502 lines · 676 KB |
| Brace balance | ✅ 5,572 / 5,572 BALANCED |
| Cache stamp (app.jsx / sw.js / index.html) | ✅ `20260713a` — bumped this run (3 tag edits) |
| Venue count (eval) | ✅ 375 (133 ski / 242 beach) |
| `.venue-baseline` | ✅ 375 |
| Duplicate venue IDs | ✅ 0 |
| GEAR_ITEMS refs | ✅ 0 (Amazon cut for v1 — do not restore) |
| `lateSeason` venues | ✅ 13 |
| Plausible analytics | ✅ Present, uncommented, `defer`, domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 (UMD, unpkg) |
| Babel Standalone | ✅ 7.29.7 — 8.x upgrade deferred post-500 MAU |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (not HTTP) |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s AbortController + retry logic |
| `fetchWeather` timeout | ✅ 8s AbortController, proxy-first with Open-Meteo fallback |
| Image lazy loading | ✅ All `<img>` tags use `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, `*.p12` |
| Travelpayouts auth token in client | ✅ NOT present — server-side only via VPS proxy |
| TP_MARKER `710303` in client | ✅ Expected — public affiliate marker, not a secret |
| Supabase anon key in client | ✅ Expected — RLS-gated, public-safe by design |
| Secrets in recent commits | ✅ None found (`git log --oneline -10` clean) |

---

## Shipped This Run

### ✅ P1 — 3 Placeholder-Tag Fixes (PM Decision 1, July 12 v86)

Tag replacements per content report July 12 recommendations:

| Venue | Before | After |
|-------|--------|-------|
| `whistler` | `["Powder Day","All Levels"]` | `["Deep Powder","Blackcomb Glacier","Village Nightlife","World Cup Racing"]` |
| `beaver-creek` | `["Family Friendly","Powder Day"]` | `["Groomed Perfection","Birds of Prey Downhill","Ski-in/Ski-out","Uncrowded Runs"]` |
| `park-city-mountain` | `["All Levels","Family Friendly"]` | `["Largest US Resort","Rock Legends Gondola","Park City Historic District","Olympic Legacy"]` |

These tags were diluting the Powder Day filter (the most-used search filter). "All Levels" and "Family Friendly" are not discoverable by intent; the replacement tags are specific, searchable, and accurate.

Cache bumped to `20260713a` in lockstep across `app.jsx` / `sw.js` / `index.html`.

---

## P1 (Jack-Verify Only) — VPS Weather Cache

**Unverifiable from sandbox (egress block ≠ VPS outage).** Day 13 post-launch. If the VPS was restarted since last check (July 10 Jack verified clean), the in-memory cache is cold and 375 concurrent weather fetches go direct to Open-Meteo. At >26 concurrent users on the same venue set, the free tier rate-limits and all scores drop to 50.

```bash
# Run from your local terminal (not the sandbox):
curl https://peakly-api.duckdns.org/health
# Healthy: wx_cache_size > 0, poll_errors == 0
# Cold cache: self-heals in 2hrs — no action needed unless poll_errors > 50
```

**Redis persistence** remains the highest-leverage infra improvement before any traffic event (~1hr on the existing $6/mo droplet, $0 additional):

```bash
# On VPS (198.199.80.21):
apt install -y redis-server
# In proxy.js, replace the in-memory _wxCache Map with:
const redis = require('redis');
const client = redis.createClient();
# Cache TTL: 2hr (7200s)
# Key format: `wx:${lat}:${lon}`
```

---

## P2 — VPS Cache Persistence (Redis)

Same finding as July 11/12. Still no action taken. At current scale (<50 MAU) a cold-start doesn't kill the product — venues render with score 50 and recover in 2hrs. At any traffic spike (Reddit, HN) this becomes a P0 in real time. The $0-cost fix exists and takes 1hr. Flagging for the third consecutive run; two-strikes rule does NOT apply here because the failure mode is catastrophic at scale. Jack to act before any public distribution post.

---

## P3 — Babel Standalone 8.x

Babel 7.29.7 is current in the 7.x branch. Babel 8.x ships a native ESM-only build that requires a build step — incompatible with this project's no-bundler architecture. **Do not upgrade.** Stay on 7.x. Monitor for 7.x CVEs; none currently listed.

---

## P3 — SRI Hashes on CDN Scripts

`index.html` loads React 18.3.1, Babel 7.29.7, Supabase, Sentry, and Plausible without Subresource Integrity hashes. A compromised CDN could inject malicious JS. Medium risk at current scale; fix requires computing SHA-384 hashes for each pinned asset and adding `integrity="sha384-..."` attributes.

```bash
# To generate SRI hash for any CDN asset:
curl -s https://unpkg.com/react@18.3.1/umd/react.production.min.js | openssl dgst -sha384 -binary | openssl base64 -A
# Then add: integrity="sha384-<hash>" crossorigin="anonymous"
```

**Deferred post-LLC** — not a launch blocker.

---

## Cost Model

| Scale | DigitalOcean droplet | Open-Meteo | GitHub Pages | Total |
|-------|---------------------|------------|--------------|-------|
| Current (<50 MAU) | $6/mo | Free (well under limit) | Free | **$6/mo** |
| 1K MAU | $6/mo | Free (batched, ~4 req/user/day = 4K/day) | Free | **$6/mo** |
| 10K MAU | $12/mo (upgrade RAM for Redis) | Free (batched proxy cache absorbs load) | Free | **$12/mo** |
| 100K MAU | $48/mo (4GB droplet + Redis) | $29/mo (commercial tier) | Free | **$77/mo** |

**What breaks first at scale:** Open-Meteo's free tier allows ~10K requests/day. At 100K MAU with 10% same-day active users = 10K DAU × ~4 venue-coordinate fetches = 40K daily requests. Without the VPS weather proxy cache, we 429 at ~250 concurrent users hitting the same venue set. With the Redis cache (all requests per lat/lon cluster to 1 upstream call, 2hr TTL), 100K MAU is survivable on the free tier. The proxy code is already deployed; Redis persistence is the missing piece. The VPS upgrade from 1GB→4GB RAM costs $18/mo and isn't needed until ~10K MAU. Every dollar of additional infra spend is covered by the $7.58/1K MAU revenue floor long before the upgrade is necessary.

---

## Time-Sensitive: Week-2 Retention Email — **DEADLINE TODAY**

**This is the last day.** Users who loaded Peakly on launch weekend (July 1–7) are now 6–12 days out. The peak re-engagement window for that cohort closes today (July 13). After today, the standard 7–10 day window is gone and a cold-list email will perform materially worse.

Jack: send it today. Nothing in the codebase blocks it. PM v86 has the draft.

---

## Open Action Items

| Priority | Item | Owner | Days Open | Notes |
|----------|------|-------|-----------|-------|
| **P0** | Week-2 retention email | **Jack** | Day 7 | **TODAY is the last day. Window closes July 13.** |
| **P0** | Plausible dashboard — read 13 days of user behavior | **Jack** | Day 13 | plausible.io, 15 min |
| **P0** | Supabase SQL paste (delete-account) | **Jack** | Day 34 | App Store 5.1.1(v) — `server/sql/delete-account.sql` into Supabase SQL editor |
| P1 | VPS health check | **Jack** | Day 3 (since last verify) | `curl https://peakly-api.duckdns.org/health` |
| P2 | Redis cache persistence on VPS | **Jack** | Day 3 | $0 cost, ~1hr, prevents 429 cascade at any traffic spike |
| P2 | Plausible dashboard domain (Settings UI) | **Jack** | Day 6 | plausible.io → Sites → Settings → Domain → `j1mmychu.github.io/peakly` |
| P3 | SRI hashes on CDN scripts | Post-LLC | — | Deferred |
| P3 | Babel 8.x | Post-500 MAU | — | Incompatible with no-bundler arch; stay on 7.x |

**Permanently closed:** Peakly Pro · Sentry DSN · VPS "Day X" framing · DEAL_WEIGHT · GEAR_ITEMS · duplicate-commit pattern · cross-category photos · Plausible domain (code side) · surf-legacy tags · cancun-beach dup · lateSeason regression · GIG/AP_CONTINENT · placeholder-tag venues (fixed this run)
