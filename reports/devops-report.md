# Peakly DevOps Report — 2026-07-11

**Status: GREEN** — two fixes shipped this run: (1) cache stamp 3 days stale → `20260711a`; (2) lateSeason regression P1 CLOSED — chamonix, mammoth, abasin, tignes all had `lateSeason:true` stripped by the July 9 Content trim and were scoring 8/100 "Off-season closed" for 48h. Restored. lateSeason count: 9 → **13**. No new P0s. No secrets exposure.

---

## Prompt Corrections (permanent — stop re-raising these)

| Claim | Reality |
|---|---|
| "VPS down / Day X binary blocker" | **Sandbox 403 = egress block. Not VPS outage.** Verify from networked terminal only. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "GEAR_ITEMS found" | **0 refs. Amazon cut for v1.** Stop. |
| "Cache buster stale / 20260708a" | **Bumped this run → `20260711a`.** Stop re-flagging yesterday's stamp. |
| "Venue count 156 / 353 / 370" | **375 (133 ski / 242 beach). Eval only — grep undercounts to 156.** |
| "lateSeason: 6 / 9 / 5 venues" | **13 — corrected this run. Previous counts were stale/miscounted.** Stop. |
| "Cross-category photo contamination" | **FIXED July 6.** Stop. |
| "Plausible data-domain wrong" | **FIXED July 7.** Stop. |
| "197 empty-tag venues" | **FALSE. All 375 have tags.** Stop. |
| "2 dup venues pending removal" | **FIXED July 8.** Stop. |
| "lateSeason regression open" | **FIXED this run (PM v84 Decision 1).** Stop. |

---

## Infrastructure Snapshot

| Check | Result |
|---|---|
| `app.jsx` size | 13,502 lines · 676 KB |
| Brace balance | ✅ 5,572 / 5,572 BALANCED |
| Cache stamp (app.jsx / sw.js / index.html) | ✅ `20260711a` (bumped this run from stale `20260708a`) |
| Venue count (eval) | ✅ **375** (133 ski / 242 beach) |
| `.venue-baseline` | ✅ 375 |
| Duplicate venue IDs | ✅ 0 |
| GEAR_ITEMS refs | ✅ 0 |
| `lateSeason` venues | ✅ **13** (restored 4 this run: chamonix, mammoth, abasin, tignes) |
| Plausible analytics | ✅ Present, uncommented, `defer`, domain `j1mmychu.github.io/peakly` |
| Sentry DSN | ✅ Active (`app.jsx:7`, `index.html:77`) |
| React version | ✅ 18.3.1 (UMD, unpkg) |
| Babel Standalone | ⚠️ 7.29.7 — Babel 8.x available (see P2) |
| Proxy URL | ✅ HTTPS `peakly-api.duckdns.org` (not raw IP, not HTTP) |
| `fetchTravelpayoutsPrice` timeout | ✅ AbortController + exponential backoff |
| `fetchWeather` / `fetchMarine` timeout | ✅ AbortController, proxy-first with Open-Meteo fallback |
| Image lazy loading | ✅ 9 `<img>` tags use `loading="lazy"` |
| `.gitignore` | ✅ Covers `.env`, `*.pem`, `*.key`, `*.p8`, secrets |
| Travelpayouts token in client | ✅ NOT present — server-side only |
| Supabase anon key in client | ✅ Expected — RLS-gated, public-safe by design |
| TP_MARKER `710303` in client | ✅ Expected — public affiliate link marker, not a secret |

---

## P1 — lateSeason Regression (FIXED THIS RUN)

**What was wrong:** The July 9 Content run over-trimmed `lateSeason:true`. 4 venues that legitimately need the flag had it stripped and were scoring 8/100 "Off-season — resort closed" during July 10–11 (48h).

| Venue | Why it needs `lateSeason:true` |
|---|---|
| `chamonix` | Chamonix-Mont-Blanc — summer off-piste on Vallée Blanche when snow_depth ≥ 0.5m |
| `mammoth` | Mammoth Mountain CA — historically open into August; tag says "Late Season" |
| `abasin` | Arapahoe Basin CO — "Longest Season CO" (their own tag), historically into July |
| `tignes` | Tignes / Val d'Isère — tag says "Summer Glacier", glacier skiing through July |

**Fix applied:** Added `lateSeason:true` to all 4. Count: 9 → **13**.

**Full 13-venue list:** whistler, chamonix, mammoth, abasin, tignes, cervinia, snowbird, zermatt, verbier, val-thorens, les-deux-alpes-fr, saas-fee-ch, st-moritz-ch.

**Note on PM v84 "target = 9":** PM said "fix restores to 9" based on Content's count of 5 current. Content was using grep (undercounts batch-format entries); actual was 9. After restoring 4, correct count is 13. PM's arithmetic was right (5 + 4 = 9) but the base was wrong. 13 is correct.

---

## P1 — Cache Stamp Stale 3 Days (FIXED THIS RUN)

**What was wrong:** All 3 load-bearing files frozen at `20260708a` since July 8. July 9 content changes (Tenerife, Crete, lateSeason edits) were invisible to returning users with the July 8 SW install.

**Fix applied:**
```
app.jsx  line 17:  const PEAKLY_BUILD = "20260711a"
sw.js    line 2:   const CACHE_NAME = "peakly-20260711a"
index.html line 395: src="./app.jsx?v=20260711a"
```

**Root cause:** `auto-push.sh` cache-bump fires only on local PostToolUse. Remote scheduled agents don't trigger it. Open #11 in CLAUDE.md.

**Fix the root cause (2-minute install):**
```bash
crontab -e
# add:
45 17 * * * cd ~/peakly && bash scripts/auto-push.sh
```

---

## P1 (Ongoing) — VPS Weather Cache: Jack-Verify Only

**Unverifiable from sandbox (egress block — not VPS outage).** Day 11 post-launch. **Week-2 return-visitor window is TODAY (July 11–13).** Cold cache → 375 weather fetches → Open-Meteo free-tier 429s at >66 concurrent users → all venues score 50.

```bash
curl https://peakly-api.duckdns.org/health
# Healthy: wx_cache_size > 0, uptime > 1d
# Cold (wx_cache_size = 0): self-heals in 2hrs — only act if poll_errors > 50
```

---

## P2 — Babel Standalone: Major Version Available (7.29.7 → 8.x)

Babel 8.x is a major release — JSX transform changes could blank the screen. Test in a branch before shipping. Post-500 MAU.

---

## Open Items (carry-forward)

| Item | Priority | Owner | Days Open | Notes |
|---|---|---|---|---|
| **VPS health verify** | P1 | Jack (local terminal) | Day 27 | Week-2 window is NOW. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 (App Store) | Jack only | Day 31 | 2 minutes. Blocks iOS 5.1.1(v). |
| **Local crontab for auto-push.sh** | P2 | Jack | — | `45 17 * * * cd ~/peakly && bash scripts/auto-push.sh` |
| 2 remaining glacier ski venues | P2 | Content agent | — | Alpe d'Huez + Cortina d'Ampezzo not in catalog (les-deux-alpes, saas-fee, st-moritz did land). |
| 3 generic-tag ski venues | P2 | Content agent | — | Per Content July 10 — low-signal tags. Enumerate IDs. |
| LatAm beach gap | P3 | Content agent | — | Peru, Ecuador, Colombia, Uruguay underrepresented. |
| Plausible dashboard domain | P2 | Jack | Day 4 | Code fixed. plausible.io → Sites → Settings → Domain → `j1mmychu.github.io/peakly`. |
| SRI on CDN scripts | P3 | — | — | Deferred post-LLC. |

---

## Security Audit

No issues. Permanent summary:
- **Travelpayouts token:** Server-side only. ✅
- **Supabase anon key:** In client, expected — RLS-gated. ✅
- **TP_MARKER `710303`:** Public affiliate marker. ✅
- **Sentry DSN:** Intentionally public. ✅
- **`.gitignore`:** Covers all secrets. ✅
- **Recent git log:** Clean. ✅

---

## What Breaks First At Scale

**Open-Meteo rate limits under a spike.** The VPS weather proxy's 2hr LRU cache means N concurrent users on the same venue = 1 upstream call. A Reddit post that sends 5K visitors/hour with diverse venue sets floods the cache with cold misses and triggers 429s from Open-Meteo's free tier (~10K req/hr limit). Client falls back to direct Open-Meteo, which also 429s. Venues score 50, "conditions unavailable" banner fires — graceful degradation but conditions are gone. Fix before any viral moment: Open-Meteo commercial plan ($29/mo, 10K req/hr guaranteed). Verify VPS health today — if `wx_cache_size == 0` on a cold start under the Week-2 return window, that's the exact failure mode.
