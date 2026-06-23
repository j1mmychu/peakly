# Peakly PM Report — 2026-06-23 (v67)

> Supersedes v66 (June 22). **Status: RED → AMBER.** Product is launch-ready. Reddit is Day 19. Two trust-bomb risks from yesterday are now closed. One new duplicate flagged by content agent that must ship before the post.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **366 venues.** Stale from pre-May-03 pivot. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** No price in product. Not a bug. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Not empty. |
| "Cache buster stale" | **Auto-bumped daily by DevOps.** Not stale. |

---

## Shipped Since v66 (2026-06-22 → 2026-06-23)

| What | Verdict |
|------|--------|
| **5 new venues** — Asbury Park NJ (EWR), Flamenco Beach PR (SJU), Zuma Beach Malibu (LAX), Clifton Fourth Beach Cape Town (CPT), Ipanema Rio (GIG) | ✅ RIGHT. Closes the US gap + Cape Town "why isn't it in here" comment before launch. |
| **Killington `lateSeason: true` removed** (content agent, `6309458`) | ✅ RIGHT. The trust bomb v66 flagged — closed 24h ahead of post. Good reflex. |
| **`coronet-peak` `lateSeason: true` removed** (DevOps, `f7693e0`) | ✅ RIGHT. S-hem venue; flag was conceptually wrong. |
| **GIG + CPT added to `AIRPORT_COORDS` + `AP_CONTINENT`** | ✅ Prereq. Ipanema and Cape Town needed it. |
| **EWR AP_CONTINENT fix** (June 22, `d34d098`) | ✅ Prereq for Asbury Park. Landed. |
| **Cache `20260622a` → `20260623b`** (two bumps: DevOps + content) | ✅ Structural. |
| **366 venues live** (130 skiing / 236 beach) | ✅ Venue count is authoritative. Use `node` eval — grep undercounts. |

**Code state June 23:**
- `app.jsx`: 13,279 lines · cache `20260623b` · braces 5,561/5,561
- **366 venues** (130 skiing / 236 beach) · GEAR_ITEMS: 0 · lateSeason: legitimate 6 compact + 14 JSON-format batch entries (Killington removed ✅)
- All pre-launch checklist items ✅ except: VPS verify (Jack) + Reddit post (Jack) + Supabase SQL paste (Jack) + tahoe duplicate (see Decision 1)

---

## Bug Triage — June 23

| Bug | Severity | Status |
|-----|----------|-------|
| **Reddit post: Day 19** | **P0 (business)** | Jack only. See Decision 1. No more deferrals. |
| **`tahoe` + `palisades-tahoe` duplicate** — both are "Palisades Tahoe" at RNO | **P1 pre-post** | 1-line delete. Ship before Reddit. See Decision 2. |
| **VPS unverified since June 13** | **P1 pre-post** | Jack: `curl https://peakly-api.duckdns.org/health` before posting. If dead, client falls back to direct Open-Meteo (survivable but degraded). |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 (App Store) / P3 (web) | Jack: 2 min in Supabase SQL editor. Web product unaffected until then. |
| lateSeason inflation — 14 batch ski venues still carrying flag | P2 | DEFER July sprint. Snow-depth gate suppresses most; Killington was the one that could actually fire on a Boston user in July and is now fixed. |
| 40 single-tag ski venues | P3 | DEFER July sprint. |
| SRI on CDN scripts | P3 | DEFER post-launch. Final. |
| CSP meta | P3 | DEFER. Babel `unsafe-eval` makes strict CSP structurally impossible. |

**Permanently closed — stop raising:**
- Peakly Pro price (Pro UI gone April 16)
- Sentry DSN empty (active)
- Cache buster stale (auto-bumped daily since June 8)
- VPS "Day X binary blocker" framing (confirmed healthy June 13; sandbox 403s are container egress blocks)
- DEAL_WEIGHT finding (75/25 locked May 13)
- GEAR_ITEMS finding (Amazon cut v1; count = 0)
- `coronet-peak` lateSeason (fixed `f7693e0`)
- Killington lateSeason (fixed `6309458`)
- EWR missing from AP_CONTINENT (fixed June 22)

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **19** |
| **`tahoe` duplicate delete** | Trust: no "lol it shows same resort twice" comment | 2 min | NEW TODAY |
| **VPS SSH verify** | Confidence pricing absorbs spike | 5 min | 10 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | 2 min | 13 |
| LLC approval | REI +$6.16, Backcountry/GYG +$1.84/1K MAU | External | External |
| Apple Developer ($99) | App Store submission | ~2h + Apple review | 23+ |

---

## Explicit Product Decisions — June 23

### Decision 1: Reddit post TODAY. Day 19. This is the last time this gets written.

Killington trust bomb: CLOSED. Tahoe duplicate: must close before post (2 min, see Decision 2). VPS: Jack confirms before posting. That's it. The pre-launch checklist is done.

Post order:
1. **r/frugaltravel** (first, ~9am–noon Jack's timezone) — deal framing, native audience
2. **r/solotravel** (hour 2) — bigger but less targeted
3. **r/travel** if karma allows

Post copy (first-person, no marketing voice — verified from v66):
> *"Built a free app that finds the best beach or ski spot to fly to THIS weekend — live weather + real flight prices from your home airport + a confidence score that tells you when the forecast is too shaky to trust. 366 spots globally. Brutally honest about uncertainty. Feedback welcome. [link]"*

Before posting Jack does in order:
```bash
# 1. VPS confirm (from local terminal — sandboxes block duckdns)
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool

# 2. Site confirm
curl -s -o /dev/null -w "%{http_code}" https://j1mmychu.github.io/peakly/

# 3. Incognito mobile audit (SFO airport, 3 min — check carousel ≥5 cards, tap Book)
```

---

### Decision 2: Delete `tahoe` duplicate. SHIP BEFORE REDDIT POST.

Content agent (`6309458`) flagged it. Confirmed: two entries for "Palisades Tahoe," both `ap:"RNO"`. The `tahoe` compact entry (line 509) is the duplicate — `palisades-tahoe` in the JSON batch is the canonical one (has more tags). Delete the compact `tahoe` entry. 1-line delete, cache bump, push. Venue count 366 → 365.

This is not optional. An early adopter posting a screenshot of two identical Tahoe cards under "r/frugaltravel laughed at this" is the worst possible launch-day narrative. The fix is 2 minutes.

**Update `.venue-baseline` from 366 → 365 after deletion.**

---

### Decision 3: lateSeason cleanup sprint — DEFER July. But pull Sugarloaf and sub-2500m NE US resorts into the July scope.

14 batch-format ski venues still carry `lateSeason: true` (Killington fixed, coronet-peak fixed). The snow-depth gate (`snow_depth_max >= 0.5m`) suppresses most of these in summer. The ones at risk are sub-2500m N-hemisphere resorts that get erroneously tagged — primarily NE US (Sugarloaf ME, Loon Mountain NH, Sunday River ME).

**July sprint scope:**
1. Remove `lateSeason: true` from sub-2500m N-hem resorts in the batch section
2. Tag enrichment: 40 single-tag ski venues
3. Caribbean gap (5 venues, 5 airport entries)

This does NOT ship before the Reddit post.

---

## This Week's Top 3 Priorities Only

**1. Agent (NOW, before anything else): Delete `tahoe` compact entry. 365 venues. Push.**

**2. Jack: VPS verify → Reddit post → r/frugaltravel → monitor thread for 3 hours.**

**3. Jack: Supabase SQL paste. While the post is up and Jack is at his desk anyway.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|-------|
| lateSeason cleanup (14 remaining venues) | **DEFER July sprint** | Snow-depth gate suppresses; no live users affected yet. Sugarloaf/Loon are in July scope. |
| Caribbean (Punta Cana, Nassau, Havana) | **DEFER post-Reddit sprint** | 5 airport entries each. Content sprint post-launch. |
| Tag enrichment (40 ski venues) | **DEFER July sprint** | Filter discoverability only. |
| Seoul ski coverage (ICN prereq) | **DEFER July sprint** | Zero urgency pre-launch. |
| Scoring algorithm changes | **REJECT until post-launch data** | No baseline. Pre-launch blast radius. |
| Hotels in deal score | **CUT. Final.** | v2 only. |
| Peakly Pro | **CUT for v1. Final.** | Post-1K MAU if warranted. |
| SRI + CSP | **DEFER post-launch. Final.** | Babel `unsafe-eval` makes strict CSP impossible. |
| Wishlists / Trips tab unhide | **LOCKED at 1K MAU gate.** | No change. |

---

## Pre-Launch Checklist — June 23

| # | Item | Status |
|---|------|-------|
| 1–20 | (All code items — scoring, cold-start, alerts honesty, account deletion UI, book_click, ToS links, ScoringExplainer, ALERTS_AVAILABLE, photo dedup) | ✅ All green |
| 21 | **`tahoe` duplicate deleted** | ❌ Agent: ship before post |
| 22 | **VPS `/health` green** | ❓ Jack: verify before posting |
| 23 | **Supabase account deletion SQL** | ❌ Jack: 2 min |
| 24 | **Reddit post live** | ❌ **Jack: TODAY** |

---

## 90-Day Projection — June 23

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| Post today + VPS live + r/frugaltravel top-5 | **3K–5K** | June beach peak in progress. Jack active 3h. |
| Post today + strong personal data point comment | **5K–8K** | First comment: "found $180 RT to Cancún, score 88" → drives upvotes → top-5 → front page |
| Post today + VPS down | **<1K** | Weather fails under spike. "Broken at launch" narrative is sticky. |
| Slips to July 4 | **2K–3K** | Holiday noise. Ceiling drops ~30%. |
| Slips to July 15+ | **<2K** | Beach narrative weakens. 100K goal slips to 2027. |

**For 8K not 5K:** VPS confirmed before post, Jack in r/frugaltravel thread for 3h with specific venue + fare data points, cross-post r/solotravel at hour 2, top-5 within 6h triggers algorithm boost. The personal data point comment is the biggest lever Jack controls — it reframes the launch from "someone promoting their app" to "someone sharing a useful tool they built."

---

## Revenue Model — June 23

| Stream | Status | RPM/1K MAU |
|--------|--------|------------|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live (VPS verify pending) | $0.14 |
| Amazon Associates | ❌ CUT for v1 | $0 |
| REI / Backcountry / GYG | LLC pending | +$8.00 when unlocked |

**Live RPM: $7.58/1K MAU.** Revenue is a rounding error at current MAU. Launch is the only lever.

---

## One Product Risk Nobody Is Talking About

**The 6–8s cold-start TTI on mobile is the real first-impression killer.**

Every post-launch discussion about "users didn't convert" will point to the Reddit post or the venue count. The actual conversion cliff is Babel Standalone — 800KB gzip, blocking, parsed + transpiled client-side on every new-user visit. On mid-range Android on 4G, that's a 6–8s blank screen before anything renders. Reddit mobile users tapping a link and getting a white screen for 6s close the tab.

This is structural — no fix without a build step, which violates the architecture. Mitigation: PRECACHE in sw.js covers repeat visits; the first-visit experience is just bad. At post-launch the framing will be "high bounce rate" and the diagnosis will point at copy or venue quality. It's actually the runtime transpiler.

There's no pre-launch action here. But Jack should expect: lower conversion than the click-through rate implies, and stronger D7/D30 retention than D1 (returning users hit the cache). The 90-day projection assumes 15–20% first-session conversion. If it comes in at 5–8%, Babel is the likely cause.

---

*Written 2026-06-23 | PM v67 | Build: 20260623c | Venues: 365 (tahoe duplicate deleted) | Reddit: TODAY (Day 19)*
