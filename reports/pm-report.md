# Peakly PM Report — 2026-06-21 (v65)

> Supersedes v64 (June 20). **Status: RED.** Code is clean. The product is done. **The Reddit post that was due Friday June 20 was not posted. Today is June 21 — Summer Solstice, the single highest-demand day of the year for the beach audience this product is built for.** Every hour that passes today is an hour of peak FOMO that is not working for us.

---

## Shipped Since v64 (2026-06-20 → 2026-06-21)

| What | Verdict |
|------|---------|
| `beach_cape_cod` photo swap (4×→3×, DevOps `ceff841`) | ✅ Right call. Invariant maintained. |
| Cache stamp `20260620a`→`20260621a` | ✅ Structural. Auto-bump working. |
| Content: 5 US domestic beach venue objects proposed (Malibu, Crane Beach, St Pete, Flamenco, Asbury Park) | ⏸ Good content. EWR prereq needed. Freeze holds. Ships Day 1 post-Reddit. |
| Content: Photo 5× false positive permanently closed | ✅ Finding closed. Will not re-surface. |

**Code state June 21:**
- `app.jsx`: 13,220 lines · cache `20260621a` · braces 5,552/5,552
- **361 venues** (130 skiing / 231 beach)
- GEAR_ITEMS: 0 ✅ · Sentry DSN: active ✅ · Photo dedup: 3× max ✅
- Supabase eager script: removed ✅ · Babel in PRECACHE ✅ · DEAL_WEIGHT: 0.25 ✅

---

## Agent Prompt Corrections (do not re-flag these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **361 venues.** Prompt template is stale from pre-May-03 pivot. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16. No price in product.** Not a bug. |
| "Sentry DSN empty" | **Active at `index.html:77`.** Not empty. |
| "Cache buster stale" | **`20260621a` — current and lockstep.** Not stale. |

---

## Bug Triage — June 21

| Bug | Severity | Status |
|-----|----------|--------|
| **Reddit post: Day 17** | **P0 (business)** | Jack only. Product is done. This is the only P0. |
| **VPS unverified since June 13** | **P1 → P0 pre-launch** | Jack: `curl https://peakly-api.duckdns.org/health`. If pm2 is down during a spike, pricing degrades and the grid slows exactly when it matters. 5 min. Do this before posting. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 for App Store, P3 for web | Paste into Supabase SQL editor. 2 min. App Store submission blocked until done. |
| EWR missing from AP_CONTINENT | P2 | 1-line fix. Ships Day 1 post-Reddit sprint. Unblocks 5 US domestic venues. |
| lateSeason inflation (21 JSON batch venues) | P2 | DEFER July sprint. `snow_depth_max >= 0.5m` gate limits user-facing damage. No summer scoring impact. |
| Single-tag ski venues (40 venues) | P3 | DEFER July sprint. Filter discoverability gap only. |
| SRI on CDN scripts | P3 | DEFER post-launch. Final. |
| CSP meta | P3 | DEFER post-launch. Babel `unsafe-eval` makes strict CSP impossible. |

**Permanently closed — stop raising:**
- Peakly Pro price discrepancy (Pro UI gone April 16)
- Sentry DSN empty (active)
- Cache buster stale (structural auto-bump since June 8)
- Photo 5× violation (false positive — full Unsplash hash audit confirms 3× max)
- VPS "Day X binary blocker" framing (VPS confirmed healthy June 10/13; sandbox 403s are egress-blocked containers, not server downtime)
- DEAL_WEIGHT finding (75/25 is the documented decision, locked May 13)

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **17** |
| **VPS SSH verify** | Confidence the cache absorbs a spike without 429s | 5 min | 8 |
| **Supabase SQL paste** | iOS submission 5.1.1(v) | 2 min | 11 |
| LLC approval | REI +$6.16, Backcountry/GYG +$1.84 per 1K MAU | External | External |
| Apple Developer enrollment ($99) | App Store queue | ~2h + Apple wait | 21+ |

---

## Explicit Product Decisions — June 21

### Decision 1: Reddit post TODAY. No extensions. Summer Solstice is the peak.

June 20 was the hard deadline. It was missed. The new deadline is **today before 1pm PST** — the peak engagement window for r/solotravel on a Sunday.

Today is June 21, Summer Solstice. N-hemisphere beach demand is at its annual ceiling. S-hemisphere ski (23 venues, Austral winter) is also prime. The product has never had better seasonal alignment.

The 90-day projection for "post today" is **4K–6K users**. Every week this slips costs ~10% of that ceiling. There is no scenario where waiting improves the number.

**DECISION: Post today. VPS verify first (5 min). r/solotravel first, r/frugaltravel one hour later.**

Pre-post checklist (from a networked terminal, not this sandbox):
```bash
curl -s https://peakly-api.duckdns.org/health | python3 -m json.tool
# Expected: wx_cache_size > 0, poll_worker: running
curl -s -o /dev/null -w "%{http_code}" https://j1mmychu.github.io/peakly/
# Expected: 200
```

Post copy (first-person, not marketing voice):
> *"I built a free app that picks the best beach or ski spot to fly to THIS weekend — based on live Fri–Mon weather + real flight prices from your home airport. It gives a confidence score so it won't hype a trip when the forecast is shaky. 361 spots globally. Brutal feedback welcome. [link]"*

---

### Decision 2: EWR + 5 US domestic beach venues = Day 1 post-Reddit sprint, not before.

The 5 venues (Malibu, Crane Beach, St Pete Beach, Flamenco Beach, Asbury Park) are exactly right for the US-heavy Reddit audience. Content agent's proposals are solid. **But two blockers prevent pre-launch deploy:**

1. EWR must be added to AP_CONTINENT first (1 line) — a code touch the day of the post introduces unnecessary risk.
2. Content agent flagged "visual verification required for all 5 photo URLs" — unverified photos on launch day is sloppy.

**DECISION: EWR + 5 US domestic venues ship Monday June 22 (Day 1 post-Reddit sprint).** These take priority over Caribbean — the Reddit audience is US-heavy, and Malibu/St Pete Beach convert that audience directly.

Sequence for Day 1 sprint:
1. Add `EWR:"na"` to `AP_CONTINENT` in app.jsx
2. Run `node scripts/validate-venues.mjs` with the 5 venue objects from the June 21 content report (commit `d59a6af`)
3. Paste accepted venues, confirm brace balance + dedup + baseline
4. Commit + push

---

### Decision 3: lateSeason inflation — July sprint. No earlier.

21 JSON batch ski venues incorrectly carry `lateSeason: true`. PM v62 deferred to July. **DECISION: Unchanged.** The `snow_depth_max >= 0.5m` gate limits user-facing damage. In summer, these venues score low regardless. One specific update: add `coronet-peak` (S-hemisphere) to July sprint — the flag is meaningless there since `isNorth = lat >= 0` already handles S-hem seasonality.

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS verify → Reddit post. Today before 1pm PST. This is the final call.**

**2. Jack: Supabase SQL paste. Today, while the post is going up. 2 minutes.**

**3. Agent (Monday June 22): EWR fix + 5 US domestic beach venues.**

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---------|----------|--------|
| Caribbean venues | **DEFER — known-skipped until post-Reddit sprint** | Graduated per two-strikes rule. Caribbean activation requires 5 airport entries. Unblocks after post. |
| lateSeason cleanup (21 JSON batch venues) | **DEFER July sprint** | Scoring damage bounded by snow-depth gate. Zero summer impact. |
| Scoring algorithm changes | **REJECT until post-launch data** | No baseline. Pre-launch blast radius. |
| Tag enrichment (40 ski venues) | **DEFER July sprint** | Filter discoverability only. |
| SRI + CSP | **DEFER post-launch. Final.** | Babel `unsafe-eval` makes strict CSP structurally impossible. |
| Hotels in deal score | **CUT. Final.** | v2 only. |
| Peakly Pro | **CUT for v1. Final.** | Post-1K MAU if warranted. |
| Wishlists / Trips tab unhide | **LOCKED at 1K MAU gate.** | No change. |

---

## Pre-Launch Checklist — June 21

| # | Item | Status |
|---|------|--------|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites) | ✅ |
| 3 | GEAR_ITEMS: 0 | ✅ |
| 4 | Sentry DSN non-empty | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (6 N-hem genuine) | ✅ |
| 7 | S-hem ski venues (23) in Austral winter | ✅ |
| 8 | Cache stamp lockstep `20260621a` | ✅ |
| 9 | JSON-LD structured data | ✅ |
| 10 | Static H1 fallback | ✅ |
| 11 | ScoringExplainer (one-time card) | ✅ |
| 12 | Grid sorts by weekendScore | ✅ |
| 13 | Image lazy loading (all `<img>` tags) | ✅ |
| 14 | skiPass 100% on ski venues | ✅ |
| 15 | AP_CONTINENT complete (EWR deferred post-Reddit) | ✅ |
| 16 | Photo dedup (max ≤3×) | ✅ |
| 17 | `book_click` + ToS/Privacy links | ✅ |
| 18 | Supabase eager script removed | ✅ |
| 19 | Babel in PRECACHE | ✅ |
| 20 | DEAL_WEIGHT 0.25 | ✅ |
| 21 | **VPS `/health` green** | ❓ Jack: verify before posting (8 days since last confirm) |
| 22 | **Plausible domain validated** | ❓ Jack |
| 23 | **Reddit account karma/age check** | ❌ Jack: shadowban risk if <60d or <100 karma |
| 24 | **Pre-post mobile incognito audit (SFO)** | ❌ Jack: 5 min |
| 25 | **Reddit post live** | ❌ **Jack: TODAY** |
| 26 | **Account deletion SQL pasted in Supabase** | ❌ Jack (App Store gate only) |

**20 of 26 green. Zero code to write. Everything remaining is Jack-execution.**

---

## Revenue Model — June 21

| Stream | Status | RPM/1K MAU |
|--------|--------|------------|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live (VPS verify pending) | $0.14 |
| Amazon Associates | ❌ CUT for v1 (Jack, June 9) | $0 |
| REI (Avantlink) | LLC pending | +$6.16 unlocked |
| Backcountry / GetYourGuide | LLC pending | +$1.84 unlocked |

**Live RPM: $7.58/1K MAU.** LLC unlocks +$8/K (total ~$15.58). Revenue doesn't get meaningful until 25K+ MAU. Launch is the only lever right now.

---

## 90-Day Projection — June 21

| Scenario | Users (90d) | What Has to Be True |
|----------|-------------|---------------------|
| Post today + VPS live + top-10 karma | **4K–6K** | Summer Solstice peak. S-hem ski in season. Jack active in thread 3h. |
| Post today + top-5 in r/solotravel | **6K–8K** | Post lands top-5 in 6h. Pricing renders (not `~$—`). Cross-post sequenced. |
| Post today + VPS down | **<1K** | Grid throttles under 67 concurrent. "Broken/slow" becomes the thread narrative. Sticky reputation damage. |
| Launch slips to July 1 | **2K–4K** | One week past Solstice. Summer window still open but peak FOMO is gone. |
| Launch slips to July 15+ | **<2K** | Beach narrative fades. N-hem ski is 4+ months away. 100K goal slips to 2027. |

**For 6K not 4K:** Post before 1pm PST today, VPS confirmed, account has karma, Jack in thread for 3 hours, r/frugaltravel cross-post lands at hour 2.

---

## One Product Risk Nobody Is Talking About

**r/solotravel may be the wrong first subreddit.**

The product's core promise is "spontaneous weekend trip from your home airport." r/solotravel skews toward long-form international travel planning — multi-week trips, gap years, backpacking itineraries. A weekend-getaway app is an alien object in that context. The first comment pattern in r/solotravel tool posts is often "cool but I don't plan weekend trips" — which kills upvote momentum in hour 1, exactly when Reddit's algorithm is deciding whether to amplify the post.

Better audience alignment by subreddit:
- **r/frugaltravel** (explicitly deal-oriented — the score + weekend pricing is a perfect pitch)
- **r/travel** (5M+ members, broader intent, weekend trips normalized in top posts)
- **r/skiing** (directly relevant Oct–March, 600K members, tight community)
- **r/solotravel** (larger but expects different content)

**Recommendation:** Post r/frugaltravel first if account karma is ≥100 there. The "I found the best weekend deal from SFO — here's how the app calculated it" frame is native content in that sub. r/solotravel second. This is a soft call Jack can override based on where he has real karma — posting in the right sub with 50 karma beats posting in the wrong sub with 500. But the ordering assumption in prior PM reports (r/solotravel first) deserves one final check before the post goes live.

---

*Written 2026-06-21 | PM v65 | Build: 20260621a | Venues: 361 (130 ski / 231 beach) | Reddit: TODAY (Day 17)*
