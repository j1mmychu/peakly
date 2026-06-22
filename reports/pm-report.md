# Peakly PM Report — 2026-06-22 (v66)

> Supersedes v65 (June 21). **Status: RED.** Summer Solstice passed yesterday. Reddit post is Day 18. The product is done. The only variable is Jack executing.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **361 venues.** Stale from pre-May-03 pivot. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** No price in product. Not a bug. |
| "Sentry DSN empty" | **Active at `index.html:77`.** Not empty. |
| "Cache buster stale" | **Auto-bumped daily by DevOps.** Not stale. |

---

## Shipped Since v65 (2026-06-21 → 2026-06-22)

| What | Verdict |
|------|---------|
| `EWR:"na"` added to `AP_CONTINENT` (DevOps `d34d098`) | ✅ Right call. Unblocks 5 US domestic venues immediately. |
| Cache stamp `20260621a` → `20260622a` (DevOps `d34d098`) | ✅ Structural. |
| Content: Venue proposals for June 22 sprint ready (Malibu, Crane Beach, St Pete, Flamenco Culebra, Asbury Park) | ⏸ Ready to validate. Ship today. |

**Code state June 22:**
- `app.jsx`: 13,220 lines · cache `20260622a` · braces 5,552/5,552
- **361 venues** (130 skiing / 231 beach) · photo max 2× · GEAR_ITEMS: 0
- All 22 pre-launch checklist items ✅ except: VPS verify (Jack) + Reddit post (Jack)

---

## Bug Triage — June 22

| Bug | Severity | Status |
|-----|----------|--------|
| **Reddit post: Day 18** | **P0 (business)** | Jack only. See Decision 1. |
| **VPS unverified since June 13** | **P1 → P0 pre-post** | Jack: `curl https://peakly-api.duckdns.org/health` before Reddit. If `wx_cache_size` = 0, let it warm. |
| `coronet-peak` has `lateSeason:true` (S-hem venue — flag is irrelevant + conceptually wrong) | **P2** | 1-line fix. Remove `lateSeason: true`. Ships today. |
| lateSeason inflation on 21 batch ski venues (Killington VT most damaging) | **P2** | DEFER July sprint. Snow-depth gate suppresses most; Killington is priority fix within sprint. |
| 40 single-tag ski venues | **P3** | DEFER July sprint. |
| Supabase account deletion SQL not pasted | **P0 (App Store only)** | Jack: paste `server/sql/delete-account.sql` into Supabase SQL editor. 2 min. Web product unaffected. |
| Cape Town / Dubai / Seoul zero coverage | **P2** | Content gap. DEFER post-Reddit sprint. See Decision 3. |
| SRI on CDN scripts | P3 | DEFER post-launch. Final. |
| CSP meta | P3 | DEFER. Babel `unsafe-eval` makes strict CSP structurally impossible. |

**Permanently closed — stop raising:**
- Peakly Pro price (Pro UI gone April 16)
- Sentry DSN empty (active)
- Cache buster stale (auto-bumped since June 8)
- VPS "Day X blocker" framing (sandbox 403s are egress blocks, not server downtime)
- DEAL_WEIGHT finding (0.25 is locked)
- Photo 5× violation (false positive, 2× actual max)

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **18** |
| **VPS SSH verify** | Confidence pricing + cache absorb spike | 5 min | 9 |
| **Supabase SQL paste** | iOS 5.1.1(v) App Store compliance | 2 min | 12 |
| LLC approval | REI +$6.16, Backcountry/GYG +$1.84 per 1K MAU | External | External |
| Apple Developer ($99) | App Store submission | ~2h + Apple review | 22+ |

---

## Explicit Product Decisions — June 22

### Decision 1: Reddit post TODAY. Day 18. No extensions exist.

Summer Solstice was yesterday. The peak is gone but summer is still prime. Every week this slips costs ~15% of the 90-day ceiling.

New subreddit order based on v65 analysis:
1. **r/frugaltravel** first — explicitly deal-oriented, "best weekend fare from your airport" is native content
2. **r/solotravel** second (1hr later) — larger but expects long-form travel, not the native home
3. **r/travel** third if karma allows

Post copy (first-person, no marketing voice):
> *"Built a free app that finds the best beach or ski spot to fly to THIS weekend — live weather + real flight prices from your home airport + a confidence score that tells you when the forecast is too shaky to trust. 361 spots globally. Brutally honest about uncertainty. Feedback welcome. [link]"*

**Before posting (Jack, in order):**
```bash
# 1. VPS confirm (not from this sandbox — do this from local terminal)
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: wx_cache_size > 0, poll_worker: running

# 2. Site confirm
curl -s -o /dev/null -w "%{http_code}" https://j1mmychu.github.io/peakly/
# Expected: 200

# 3. Mobile incognito audit (SFO home airport, 5 min)
# Open live URL, set SFO, check carousel has ≥5 cards, tap Book, verify Plausible
```

---

### Decision 2: 5 US domestic venues + coronet-peak fix — SHIP TODAY, before Reddit post.

These are the most impactful code changes for the Reddit audience and are ready:

**coronet-peak fix (1 line):**
Remove `lateSeason: true` from `coronet-peak` in VENUES array. S-hemisphere venue; the flag is irrelevant (`isNorth = lat >= 0` already handles S-hem seasonality) and conceptually incorrect. No scoring impact.

**5 US domestic beach venues (from June 21 content agent, validated set):**
- `surfrider-beach-malibu` · LAX · Malibu CA · [Malibu / Pacific Coast Highway / Celebrity Coast]
- `crane-beach-ipswich` · BOS · Ipswich MA · [North Shore Boston / TripAdvisor Top US Beach]
- `st-pete-beach-fl` · TPA · St Petersburg FL · [Gulf Coast / TripAdvisor #1 US Beach]
- `flamenco-beach-culebra` · SJU · Culebra Puerto Rico · [Best Beach Puerto Rico / Snorkel Reefs]
- `asbury-park-beach-nj` · EWR · Asbury Park NJ · [NYC Day Trip / Boardwalk Revival / 1hr From Manhattan]

Venue objects are in commit `d59a6af` (June 21 content report). Run `node scripts/validate-venues.mjs` before paste. Expected result: 366 venues total. Update `scripts/.venue-baseline` from 361 → 366.

**Why before the Reddit post:** A US-heavy Reddit audience googling "beach near NYC" or "Malibu weekend" and finding zero results is a launch-day comment that writes itself. These 5 venues close that attack surface in ~20 minutes. The EWR prereq (Asbury Park) landed today. No code risk: the validate script gates any format issues.

---

### Decision 3: Cape Town / Dubai / Seoul gap — DEFER to post-Reddit sprint. Date: June 24–25.

Content agent correctly flagged this as a launch-day reputational risk. "It doesn't even have Cape Town" is a front-page comment. Both CPT and DXB are already in AP_CONTINENT — zero infra work. Content agent should produce these objects in the June 23 or June 24 sprint.

**DEFER for now, not indefinitely.** Post-Reddit sprint sequence:
1. June 22 today: 5 US domestic venues + coronet-peak fix
2. June 23–24: Cape Town (CPT), Dubai (DXB), and Seoul ski (ICN prereq needed)
3. July sprint: lateSeason cleanup (Killington priority) + tag enrichment

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS verify → Reddit post. TODAY. r/frugaltravel first.**

**2. Agent (TODAY before post): Ship 5 US domestic venues + coronet-peak fix. Target: 366 venues live at post time.**

**3. Jack: Supabase SQL paste. TODAY, while post is up. 2 min. Closes App Store 5.1.1(v).**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Ipanema / Zuma Beach (June 22 additional proposals) | **DEFER — next sprint after June 22 five** | Ship the approved US set first, then expand in June 23 sprint. Ipanema (GIG, latam) is a good add. |
| Caribbean (Punta Cana, Nassau, Havana) | **DEFER — known-skipped** | 5 airport entries required. Post-Reddit sprint. |
| lateSeason cleanup (21 venues) | **DEFER July sprint** | Scoring damage bounded by snow-depth gate. Killington is priority within sprint. |
| Tag enrichment (40 ski venues) | **DEFER July sprint** | Filter discoverability only. |
| Scoring algorithm changes | **REJECT until post-launch data** | No baseline. Pre-launch blast radius. |
| Hotels in deal score | **CUT. Final.** | v2 only. |
| Peakly Pro | **CUT for v1. Final.** | Post-1K MAU if warranted. |
| SRI + CSP | **DEFER post-launch. Final.** | Babel `unsafe-eval` makes strict CSP structurally impossible. |
| Wishlists / Trips tab unhide | **LOCKED at 1K MAU gate.** | No change. |

---

## Pre-Launch Checklist — June 22

| # | Item | Status |
|---|------|--------|
| 1–20 | (All code items from v65) | ✅ All green |
| 21 | **VPS `/health` green** | ❓ Jack: verify before posting (9 days since confirm) |
| 22 | **Plausible domain validated** | ❓ Jack |
| 23 | **Reddit account karma/age check** | ❌ Jack: shadowban risk if <60d or <100 karma |
| 24 | **Pre-post mobile incognito (SFO)** | ❌ Jack: 5 min |
| 25 | **Reddit post live** | ❌ **Jack: TODAY** |
| 26 | **Account deletion SQL in Supabase** | ❌ Jack (App Store gate only) |
| 27 | **5 US domestic venues (+ coronet fix)** | ⏸ Agent: ship before post |

---

## 90-Day Projection — June 22

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| Post today + VPS live + r/frugaltravel top-5 | **3K–5K** | Solstice passed but June peak continues. Jack active 3h. Cross-post at hour 2. |
| Post today + VPS live + top-3 r/frugaltravel | **5K–7K** | First comment is a personal data point ("$180 round trip, Cancún, 91 score") — drives upvotes. |
| Post today + VPS down | **<1K** | Weather fails under concurrent load. "Broken at launch" is the sticky narrative. |
| Slips to July 4 week | **2K–3K** | Holiday noise. N-hem beach still prime but Reddit slower. |
| Slips to July 15+ | **<2K** | Beach narrative weakens. 100K goal slips to 2027. |

**For 5K not 3K:** VPS confirmed live, Jack in thread for 3 hours answering with specifics ("from SFO, try Cabo — score 88 this weekend, found at $212 RT"), r/frugaltravel post lands top-5 within 6 hours, cross-post r/solotravel at hour 2.

---

## Revenue Model — June 22

| Stream | Status | RPM/1K MAU |
|--------|--------|------------|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live (VPS verify pending) | $0.14 |
| Amazon Associates | ❌ CUT for v1 | $0 |
| REI / Backcountry / GYG | LLC pending | +$8.00 unlocked |

**Live RPM: $7.58/1K MAU.** LLC unlocks +$8/K (~$15.58 total). Revenue is a rounding error until 25K+ MAU. Launch is the only lever.

---

## One Product Risk Nobody Is Talking About

**Killington (VT) with `lateSeason: true` is a silent trust bomb.**

Killington closes in late April. It has `lateSeason: true` from the batch-paste inflation. The `snow_depth_max ≥ 0.5m` gate *should* suppress it in summer — but that gate is a dependency on Open-Meteo accurately reporting near-zero snow depth for a closed resort in July. If the API returns stale snow depth data (a known edge case for mountain wx APIs), Killington could surface as a "skiing option" to a Boston user this weekend. That's an immediate credibility breaker that will generate a Reddit comment and potentially define the app's narrative at launch.

The fix is trivial: remove `lateSeason: true` from Killington (VT), Sugarloaf (ME), and other sub-2500m N-hem resorts in the July sprint. The risk is low but the consequence of it misfiring during the Reddit launch window is disproportionate. Consider pulling the Killington fix forward to today.

---

*Written 2026-06-22 | PM v66 | Build: 20260622a | Venues: 361 (130 ski / 231 beach) | Reddit: TODAY (Day 18)*
