# Peakly DevOps Report — 2026-07-12

**Status: GREEN** — code healthy, no P0s, no security issues, no new regressions. Cache `20260711a` is 1 day old and correct (no code changes since July 11). Commit gap closed by this push. Week-2 retention email deadline is **tomorrow July 13** — Jack-only action, time-sensitive.

---

*(Previous run July 11: two fixes shipped — cache stamp `20260708a`→`20260711a`, lateSeason regression closed, count 9→13.)*

---

## Prompt Corrections (permanent — stop re-raising these)

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Verify from networked terminal only. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon cut for v1.** Stop. |
| "Cache buster stale (20260711a)" | **No code changes since July 11 — stamp is correct. Don't bump without a code change.** |
| "Venue count 156 / 353 / 370" | **375 (133 ski / 242 beach). Eval only — grep undercounts.** Stop. |
| "lateSeason: 6 / 9 / 5 / 25 / 31 venues" | **13.** Full list: whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch. Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7 → `j1mmychu.github.io/peakly`.** Stop. |
| "2 dup venues pending removal" | **FIXED July 8. 0 duplicate IDs.** Stop. |
| "lateSeason regression open" | **FIXED July 11 (`18b19b5`).** Stop. |
| "GIG missing from AP_CONTINENT" | **FALSE. `GIG:"latam"` at `app.jsx:401`.** Stop. |
| "5 placeholder-tag venues" | **3 remaining** (whistler, beaver-creek, park-city-mountain). Stop saying 5. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,502 lines · 676 KB |
| Brace balance | ✅ 5,572 / 5,572 BALANCED |
| Cache stamp (app.jsx / sw.js / index.html) | ✅ `20260711a` — 1 day old, correct (no code changes since July 11) |
| Venue count (eval) | ✅ 375 (133 ski / 242 beach) |
| `.venue-baseline` | ✅ 375 |
| Duplicate venue IDs | ✅ 0 |
| Duplicate venue titles | ✅ 0 — "Riviera Maya" scan was false positive (location/subtitle fields, not a second venue) |
| GEAR_ITEMS refs | ✅ 0 |
| `lateSeason` venues | ✅ 13 (9 compact + 4 JSON-format) |
| Plausible analytics | ✅ Present, uncommented, `defer`, domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 (UMD, unpkg) |
| Babel Standalone | ✅ 7.29.7 — P2 upgrade to 8.x deferred post-500 MAU |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` |
| `fetchTravelpayoutsPrice` timeout | ✅ 5s AbortController + 3-attempt retry |
| `fetchWeather` timeout | ✅ 8s AbortController, proxy-first with Open-Meteo fallback |
| Image lazy loading | ✅ All `<img>` tags use `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, secrets |
| Travelpayouts token in client | ✅ NOT present — server-side only |
| Supabase anon key in client | ✅ Expected — RLS-gated, public-safe by design |
| TP_MARKER `710303` in client | ✅ Expected — public affiliate marker, not a secret |
| Secrets in recent commits | ✅ None found |
| Last commit before this run | July 11 16:xx UTC — 1-day gap, normal |

---

## Nothing to Fix in Code Today

Full audit ran clean. No P0s, no P1s. All previously-open DevOps items are resolved or held in known-skipped/Jack-only. This run's only action: commit the report to close the 1-day gap.

---

## Time-Sensitive: Week-2 Retention Email — Deadline Tomorrow (July 13)

Not a DevOps code item, but it's the highest-priority action in the project and no other agent is pushing today.

PM has flagged this as P0 for 5 consecutive days (July 7–11) with no confirmation it was sent. PM v85 deadline: **July 13 — tomorrow**.

**Why it matters:** Week-2 is the peak re-engagement window. Users who loaded Peakly on launch weekend are at their highest intent right now. Every day this email doesn't go out the list gets colder. At Day 12 post-launch this is the single biggest revenue-relevant action in the project.

**Jack: send it today or tomorrow.** Nothing in the codebase blocks it.

---

## P1 (Jack-Verify Only) — VPS Weather Cache

**Unverifiable from sandbox (egress block — not VPS outage).** Day 12 post-launch. Week-2 return-visitor window is live (July 11–13). If the VPS restarted and in-memory cache is cold, 375 weather fetches go direct to Open-Meteo and at >26 concurrent users the free tier 429s. All venues score 50.

```bash
curl https://peakly-api.duckdns.org/health
# Healthy: wx_cache_size > 0, uptime > 1d
# Cold (wx_cache_size = 0): self-heals in 2hrs — only act if poll_errors > 50
```

**VPS cache persistence** is the highest-leverage infrastructure improvement before any traffic event: Redis on the existing $6/mo droplet ($0 additional) prevents this failure class on restart. ~1hr of work.

---

## P2 — Babel Standalone 8.x (Deferred)

Babel 7.29.7 is current within the 7.x branch. Babel 8.x is a major release with potential JSX transform breaking changes. Test in a branch. **Defer post-500 MAU** — regression risk not worth it at current scale.

---

## Open Action Items

| Priority | Item | Owner | Days Open | Notes |
|---|---|---|---|---|
| **P0** | **Week-2 retention email** | **Jack** | **Day 5** | **Deadline July 13 — TOMORROW** |
| P0 (App Store) | Supabase SQL paste (`server/sql/delete-account.sql`) | Jack | Day 32 | 2 min. Blocks iOS 5.1.1(v). |
| P1 | Plausible dashboard read + VPS health check | Jack (local terminal) | Day 5 | Week-2 window is live now. |
| P2 | VPS: persist weather cache to disk (Redis) | Jack (VPS) | — | ~1hr. Prevents cold-restart blowout before any traffic event. |
| P2 | 4 staged venues → `validate-venues.mjs` + hand-paste | Content | Day 2 | alpe-d-huez, cortina-d-ampezzo, pipa-beach-brazil, +1 |
| P2 | 3 generic-tag ski venues (whistler/beaver-creek/park-city-mtn) | Content | Day 2 | Pure copy quality, no scoring impact |
| P3 | SRI on CDN scripts (Open #10) | — | — | Deferred post-LLC per standing decision |

---

## Security Audit

No issues. All clean:
- **Travelpayouts token:** Server-side only. ✅
- **Supabase anon key:** In client, expected — RLS-gated. ✅
- **TP_MARKER `710303`:** Public affiliate marker. ✅
- **Sentry DSN:** Intentionally public. ✅
- **`.gitignore`:** Covers all secrets. ✅
- **Recent git log (last 10):** Clean. ✅
- **SRI:** Still missing (Open #10) — deferred post-LLC as documented.

---

## What Breaks First At Scale

**Open-Meteo rate limits under a spike.** The VPS proxy's 2hr LRU cache means N concurrent users on the same cold venue = 1 upstream call. A Reddit post sending 5K visitors/hour with diverse venue sets floods the cache and triggers 429s from Open-Meteo's free tier. Client falls back to direct Open-Meteo, which also 429s under load. All venues score 50, "conditions unavailable" banner fires. Fix before any viral moment: (1) Redis cache persistence on VPS so a restart doesn't reset it, and (2) Open-Meteo commercial plan ($29/mo) for guaranteed rate headroom at scale. Do (1) first — it's free and takes an hour.

---

## Cost Projection

| Scale | Cost | Notes |
|---|---|---|
| Current (<1K MAU) | **$6/mo** | DO 1GB droplet; GitHub Pages free |
| 1K MAU | **$6/mo** | Proxy handles, Open-Meteo free tier holds |
| 10K MAU | **$12–18/mo** | 2GB DO droplet + Supabase Pro if sync traffic spikes |
| 100K MAU | **$50–100/mo** | 4GB DO + Cloudflare free + Supabase Pro ($25) + Open-Meteo paid ($29/mo) |
