# Peakly PM Report — 2026-06-20 (v64)

> Supersedes v63 (June 19). **Status: ORANGE. Code clean, photo dedup invariant broken (3 fixes), Reddit post is P0 — today is the hard deadline. Day 16.**

---

## Prompt Corrections (permanent record — do not re-raise)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **361 venues, 2 categories.** Pre-pivot state. Stale prompt. |
| "Peakly Pro price $9/mo" | Pro UI removed April 16. No price in the product. |
| "Sentry DSN empty" | Active at `index.html:77`. Never empty. |
| "Cache buster stale" | Auto-bumps on every touch since June 17. |
| "S.America beach gap is P0" | **PERMANENTLY CLOSED.** In `known-skipped.md`. Stop re-raising. |

---

## Shipped Since v63 (2026-06-19 → 2026-06-20)

| What | Verdict |
|---|---|
| **Cache `20260619a` → `20260620a`** (DevOps today) | ✅ Routine. |
| **361 venues confirmed** — DevOps eval-counter, zero dup IDs, braces 5552/5552 | ✅ |
| **All v63 code items confirmed shipped** — Babel PRECACHE, SJU AIRPORT_COORDS, Cape Cod + Hamptons + PR venues | ✅ |
| **DevOps full invariant pass: GREEN** — GEAR_ITEMS 0, DEAL_WEIGHT 0.25, ALERTS_AVAILABLE gated, deleteAccount wired | ✅ |
| **Photo dedup violation** — Content caught 5× and 4× repeats; target is ≤3× | ❌ 3-line fix pending |

**Code state June 20:**
- `app.jsx`: 13,220 lines · cache `20260620a` · braces 5552/5552
- **361 venues** (130 skiing / 231 beach)
- GEAR_ITEMS: 0 ✅ · Sentry: active ✅ · DEAL_WEIGHT: 0.25 ✅ · Babel in PRECACHE ✅

---

## Bug Triage — June 20

| Bug | Severity | Days Open | Status |
|---|---|---|---|
| **Reddit post not live** | **P0 (business)** | **Day 16** | Jack. Today. Final deadline. |
| **Photo dedup: 5× and 4× violations** | **P1** | Day 1 | Agent fix — 3 URL swaps, see Decision 1. |
| **VPS unverified from sandbox** | **P0 pre-launch** | 10 days | Jack: `curl https://peakly-api.duckdns.org/health` before posting. Last confirmed June 13. |
| **Supabase account deletion SQL** | P0 (App Store gate, not Reddit gate) | 10 days | Jack: Supabase SQL editor, 2 min. |
| Caribbean airports (PUJ/CTG/NAS/GND/HAV) missing | P2 | Day 6 | DEFER Day 1 post-Reddit sprint. |
| 40 ski venues single-tag | P3 | Persistent | DEFER July sprint. |
| coronet-peak lateSeason redundant flag | P3 | 2 days | DEFER July sprint. |
| SRI on CDN scripts | P3 | 50+ days | DEFER post-launch. Final. |

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---|---|---|---|
| **Reddit post** | Users. Revenue. The whole goal. | 25 min | **Day 16** |
| **Photo dedup fix** (3 URL swaps) | Invariant integrity before launch | 5 min (agent) | Day 1 |
| **VPS SSH verify** | Launch spike survival confirmation | 5 min | 10 days |
| **Supabase SQL paste** | App Store 5.1.1(v) delete-account | 2 min | 10 days |
| Apple Developer enrollment | App Store queue | 1–2h + wait | 19+ days |
| LLC approval | REI/Backcountry/GYG +$8/K MAU | External | External |

---

## Explicit Product Decisions — June 20

### Decision 1: Photo dedup violations — FIX BEFORE REDDIT POST (agent task)

The June 13 dedup sprint locked in ≤3× per category. Content found two violations today:

- **5× pre-existing:** `photo-1544550581-` on beach_mauritius, lovina-beach-t15, wailea-beach-maui, praia-do-carvalho-algarve, langford-island-spit
- **4× regression:** `photo-1507525428034-` on beach_portdouglas, amalfi-beach, beau-vallon-mahe, beach_cape_cod (yesterday's add caused it)

**Three surgical fixes (paste into VENUES array):**
```
praia-do-carvalho-algarve  photo: "photo-1596422846543-5eb2a6e0e4e4"
langford-island-spit       photo: "photo-1617870952490-73034843bfc9"
beach_cape_cod             photo: "photo-1560903510-6c52aadbfd44"
```

These are zero-risk single-field swaps. No venue count change. No infrastructure. The Content or DevOps agent ships this in the next run, before the Reddit post goes live.

---

### Decision 2: Caribbean venues (PUJ, CTG, NAS, GND, HAV) — DEFER to Day 1 post-Reddit sprint

Five venues (Punta Cana, Cartagena, Nassau, Grenada, Varadero) require 5 new AIRPORT_COORDS + AP_CONTINENT entries before they can be added. Infrastructure additions on Reddit launch day carry unnecessary risk — a botched entry breaks the distance filter for all affected venues. Coverage gap is real; blast radius risk is real; defer wins.

**Post-Reddit sprint (Monday June 22):** Add airport entries first, run `validate-venues.mjs`, then paste 5 venue objects. One commit.

---

### Decision 3: Code freeze from this report until after the Reddit post goes live.

Photo dedup (Decision 1) is the only permitted agent code change today. No new venues. No airport entries. No scoring changes. No UI polish. The product at 361 venues + clean invariants + 7.58/K RPM is launch-ready. Shipping more code before the post adds risk with zero user-facing upside.

---

## This Week's Top 3 Priorities Only

**1. Jack: Reddit post — today, before noon PST. This is the last call.**

Pre-post checklist (5 min from a networked terminal, not this sandbox):
```bash
curl -s https://peakly-api.duckdns.org/health
# Expected: wx_cache_size > 0, poll_worker: running

curl -s -o /dev/null -w "%{http_code}" https://j1mmychu.github.io/peakly/
# Expected: 200
```

Post copy (first-person, don't use marketing voice):
> *"I built a free app that tells you the best ski resort or beach to fly to THIS weekend — based on actual weather + live flight prices from your home airport. It locks to Fri–Mon and shows a confidence score so it won't hype a trip when the forecast is shaky. 361 spots across skiing + beach. Brutal feedback welcome. [link]"*

Order: r/solotravel first → r/frugaltravel 1h later → r/skiing if account has karma there.
**Check account karma/age before top-level post.** Under 100 karma or under 60 days old → post in thread, not top-level.

**2. Agent: Photo dedup fix (3 URL swaps, Decision 1).** Land this before the post goes live. If the post goes first, it's still P1 — fix on the next agent run.

**3. Jack: Supabase SQL paste.** Not a Reddit gate but App Store submission is already 19 days stalled on enrollment. Two minutes. Do it today alongside the Reddit post.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---|---|---|
| Caribbean venues pre-Reddit | **DEFER Day 1 sprint (June 22)** | Infrastructure risk on launch day outweighs coverage gain. |
| Tag enrichment (40 ski venues) | **DEFER July** | P3. |
| lateSeason cleanup (coronet-peak) | **DEFER July** | No scoring impact. |
| Scoring algorithm changes | **REJECT until post-launch data** | No baseline. Audit required. Pre-launch blast radius. |
| SRI + CSP | **DEFER post-launch. Final.** | Babel unsafe-eval complicates SRI. |
| Hotels in deal score | **CUT. Final.** | v2 only. |
| Peakly Pro | **CUT for v1. Final.** | |
| Group coordination | **CUT for v1.** | |

---

## Pre-Launch Checklist — June 20

| # | Item | Status |
|---|---|---|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites) | ✅ |
| 3 | GEAR_ITEMS: 0 | ✅ |
| 4 | Sentry DSN non-empty | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (26 N-hem venues) | ✅ |
| 7 | S-hem ski venues in season (23) | ✅ |
| 8 | Cache stamp lockstep (auto-bumps) | ✅ |
| 9 | JSON-LD structured data | ✅ |
| 10 | Static H1 fallback | ✅ |
| 11 | ScoringExplainer | ✅ |
| 12 | Grid sorts by weekendScore | ✅ |
| 13 | Image lazy loading | ✅ |
| 14 | skiPass 100% on ski venues | ✅ |
| 15 | AP_CONTINENT complete | ✅ |
| 16 | Photo dedup (max ≤3×) | ❌ **3 fixes pending (Decision 1)** |
| 17 | `book_click` + ToS/Privacy links | ✅ |
| 18 | Supabase eager script removed | ✅ |
| 19 | AIRPORT_COORDS complete (no Caribbean gap) | ⏸ Caribbean DEFER — not a Reddit gate |
| 20 | Babel in PRECACHE | ✅ |
| 21 | Cape Cod + Hamptons + Puerto Rico | ✅ |
| 22 | DEAL_WEIGHT 0.25 | ✅ |
| 23 | **VPS `/health` green** | ❓ Jack: verify before posting |
| 24 | **Plausible domain validated** | ❓ Jack |
| 25 | **Reddit account karma/age check** | ❌ Jack: shadowban risk |
| 26 | **Reddit post live** | ❌ **Jack: TODAY** |
| 27 | **Pre-post mobile audit (incognito SFO)** | ❌ Jack: 5 min |
| 28 | **Account deletion SQL in Supabase** | ❌ Jack (App Store gate, not Reddit gate) |

**22 of 28 green. 3 are agent-fixable (photo dedup). 3 are Jack-only. Reddit post is the only P0.**

---

## Revenue Model — June 20

| Stream | Status | RPM/1K MAU |
|---|---|---|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live (VPS pending verify) | $0.14 |
| Amazon Associates | ❌ CUT for v1 | $0 |
| REI / Backcountry / GYG | LLC pending | +$8.00 unlocked |

**Live RPM: $7.58/1K MAU.** LLC approval unlocks +$8/K. Not moving pre-launch.

---

## 90-Day Projection

| Scenario | Users (90d) | What Has to Be True |
|---|---|---|
| Post today + VPS live | **3.5K–5.5K** | One day past optimal. Still summer peak, S-hem ski in season. |
| Post hits top 5 in r/solotravel + VPS live | **6K–8K** | Jack active in thread 3h, correct account karma, cross-post sequenced. |
| Post with VPS down | **<1K** | Grid throttles under 67 concurrent. Thread dies on "broken." |
| Launch slips past June 27 | **<3K** | S-hem ski still good. N-hem beach narrative weakens vs. peak period. |

**For 5K not 3.5K:** Post before noon PST, VPS confirmed, Jack in thread 3h. All in Jack's control.

---

## One Product Risk Nobody Is Talking About

**Photo quality has never been audited by a human against the actual destinations.**

The June 13 dedup sprint corrected repeat counts per category. But it worked by photo ID, not by visual relevance. Today Content caught a 5× violation that the sprint missed entirely — a "pre-existing" violation that persisted through the June 13 pass. That suggests the dedup process was less thorough than documented.

More importantly: no human has opened the live app on a phone and scrolled through 20 cards checking whether the photos feel authentic to each destination. A generic palm-tree shot on a Queenstown ski resort card. A European beach shot on a Caribbean venue. These aren't breaking bugs — they're trust signals that die in the first 10 seconds of a first visit.

One "the photos look generic" comment in the Reddit thread does more damage than 20 upvotes help. Jack should do a 10-minute scroll through the first 20 cards before posting, specifically looking for: (1) ski venues with beach photos or vice versa, (2) any two adjacent cards with visually identical shots, (3) any venue where the photo clearly doesn't match the location name.

This is a 10-minute audit, not a sprint. Do it on the phone in incognito, not the desktop.

---

*Written 2026-06-20 | PM v64 | Venues: 361 (130 ski / 231 beach) | Cache: 20260620a | Reddit: TODAY (Day 16)*
