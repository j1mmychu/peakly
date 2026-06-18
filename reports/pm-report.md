# Peakly PM Report — 2026-06-18 (v62)

> Supersedes v61 (June 17). **Status: RED. Day 14 with no Reddit post. Friday June 20 is the hard deadline — set in v61. 48 hours left. Zero code blockers. All remaining blockers are Jack's hands on a keyboard.**

---

## Prompt Corrections (permanent record — do not re-raise)

| Prompt Claim | Reality |
|---|---|
| "182 venues, 12 categories" | **358 venues, 2 categories.** Pre-pivot state. Stale prompt. |
| "Peakly Pro price $9/mo" | Pro UI removed April 16. No price in the product. |
| "Sentry DSN empty" | Active at `index.html:77`. Never empty. |
| "Cache buster stale" | Auto-bumps on every touch. Fixed structurally June 17. |
| "S.America beach gap is P0" — Content June 15–18 | **Mislabeled.** P3 at most. 228 beach venues is not sparse. |
| "photo-15445505 at 5× repeat" — Content June 15–17 | **Content agent hallucination.** Photo ID does not exist. Max is 3×. Retracted June 18. Permanently closed. |

---

## Shipped Since v61 (2026-06-17 → 2026-06-18)

| What | Verdict |
|---|---|
| **Cache stamp `20260617a` → `20260618a`** (DevOps) | ✅ Routine. |
| **Content agent photo-audit regex fixed** (DevOps) — was truncating hex suffix, generating false positives for 3 days | ✅ Structural. False alarm loop closed. |
| **Photo 5× "finding" formally retracted** (Content June 18) — max is 3× and has been since June 13 dedup | ✅ Closed. Known-skipped. Don't re-raise. |
| **5 S.America/Caribbean venues proposed** (Content June 18) — Cartagena, Punta Cana, Puerto Rico, Tamarindo, Sint Maarten | ⏸ Staged. Not shipping pre-launch. See Decision 1. |

**Code state June 18:**
- `app.jsx`: 13,195 lines · cache `20260618a` · braces 5548/5548
- **358 venues** (130 skiing / 228 beach)
- **363 AIRPORT_COORDS** ✅ (5 added June 17)
- Photo max repeat: **3×** ✅
- GEAR_ITEMS: **0** ✅ · Sentry: active ✅ · ALERTS_AVAILABLE gated ✅

---

## Bug Triage — June 18

| Bug | Severity | Days Open | Status |
|---|---|---|---|
| **Reddit post not live** | **P0 (business)** | **Day 14** | Jack. Friday June 20 deadline. |
| **VPS unverified** | **P0 pre-launch** | 8 days | Jack: `ssh root@198.199.80.21 'pm2 status && curl -s localhost:3001/health'` before posting. Sandbox can't verify. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 (App Store, not Reddit gate) | 8 days | Jack: Supabase SQL editor, 2 min. Not a Reddit blocker. |
| lateSeason flag inflation (27 flags vs 6 documented) | P3 | Day 1 | **See Decision 2. No scoring impact. DEFER.** |
| 13 stale `claude/*` remote branches | P3 | 11 days | Jack, 10 min. Nice-to-have pre-Reddit hygiene. |
| S.America beach gap (0 Colombia/DR/Puerto Rico) | P3 | Day 5 | **See Decision 1. DEFER post-launch.** Not a launch gate. |
| SRI on CDN scripts | P3 | 40+ days | DEFER post-launch. Final. |
| CSP meta tag | P3 | 40+ days | DEFER. Babel `unsafe-eval` exemption required. |
| Tag depth (279/358 venues ≤2 tags) | P3 | Persistent | DEFER July sprint. |

**Closed permanently since v61:**
- auto-push.sh Mac path (fixed June 17)
- AIRPORT_COORDS TGD/OKA/SID/FUE/DJE (fixed June 17)
- photo-audit false-positive loop (regex fixed, content retracted)

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---|---|---|---|
| **Jack posts to Reddit** | Users. Revenue. The whole goal. | 15 min | **Day 14** |
| **VPS SSH verify** | Spike-absorbing launch; rate ceiling safety net | 5 min | 8 days |
| **Supabase SQL paste** | App Store 5.1.1(v) compliance | 2 min | 8 days |
| Apple Developer enrollment | App Store queue | 1–2h + Apple wait | 17+ days |
| LLC approval | REI +$6.16/K + Backcountry/GYG +$1.84/K | External | External |

**Zero code blockers.**

---

## Explicit Product Decisions — June 18

### Decision 1: S.America beach venues — DEFER post-launch. Not touching the catalog before Friday.

Content report has been calling this "P0" for 5 days. It's not P0. 228 beach venues is not sparse. The app has Bali, Maldives, Mykonos, Tulum, Bora Bora — it looks complete to a new user. Content agent's job is data quality; severity inflation wastes prioritization bandwidth.

Puerto Rico and Dominican Republic are genuinely high-demand US bucket-list destinations. Cartagena and Punta Cana are real gaps. But these are enhancements to a solid catalog — not a launch gate.

**DECISION: DEFER. First sprint after the Reddit post.** The 5 venue objects and 3 airport codes (CTG, PUJ, SJU) are staged in the June 18 content report. Apply June 21–22 after the first comment thread settles.

---

### Decision 2: lateSeason flag inflation — DEFER. No scoring impact. Cleanup item only.

27 venues carry `lateSeason: true`; CLAUDE.md documents 6. The 21 extras are S-hemisphere ski venues (NZ/AUS/Chile/Argentina) from the June 9 batch where the field was erroneously included.

DevOps confirmed zero scoring impact: `lateSeason` only activates when `snow_depth_max >= 0.5m`, and S-hem venues use independent hemisphere-aware in-season logic. No user-facing consequence.

**DECISION: DEFER.** Metadata cleanup, not a scoring bug. July sprint. DevOps strips `"lateSeason": true` from JSON-format S-hem ski venues post-launch.

---

### Decision 3: Friday June 20 deadline is final. No extension.

v61 set the deadline. This is the last report before it.

Beach-peak window (June–August) is already 18 days in. Each week of delay costs ~8–10% off the 90-day ceiling. The app has been launch-ready since June 10.

**THE LAUNCH SEQUENCE (Jack, ~25 minutes total):**
1. `ssh root@198.199.80.21 'pm2 status && curl -s localhost:3001/health'` — confirm `wx_cache_size > 0` (5 min)
2. Open `j1mmychu.github.io/peakly` incognito on phone, set SFO as home airport, confirm ≥8 venue cards with prices (3 min)
3. Post to r/solotravel before 11am PST Friday — "I built a free app that finds the best ski/beach weekend based on real weather + flight prices. Looking for brutal feedback." (7 min write, 1 min post)
4. Post to r/frugaltravel 1–2h later (1 min copy-paste)
5. Respond to every comment for 3 hours (15 min active)

If Reddit post is not live by end-of-day Friday June 20: **June beach window is abandoned.** 90-day projection revises from 5K–7K to 2K–3K. Next window is September.

---

## This Week's Top 3 Priorities Only

1. **Jack: VPS verify** (today — 5 min). Without this, a Reddit spike kills the app at 17 concurrent users.
2. **Jack: Reddit post** (Friday June 20 — 25 min total). Everything else is noise until this happens.
3. **Jack: Supabase SQL paste** (any time — 2 min). Not a Reddit gate. App Store submission can't open without it.

Nothing else before the Reddit post.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---|---|---|
| S.America venues (pre-launch) | **DEFER — post-launch sprint** | Not a launch gate. Catalog is not sparse at 228 beach. |
| lateSeason flag strip | **DEFER July** | No scoring impact. Cleanup item. |
| Tag enrichment (279 thin venues) | **DEFER July** | P3. Zero user-facing impact pre-launch. |
| Scoring overhaul (`claude/improve-scoring-system-XYGY6`) | **REJECT** | Algorithm audit required per CLAUDE.md. No baseline data. Pre-launch blast radius unacceptable. |
| SRI + CSP hardening | **DEFER post-launch. Final.** | Babel `unsafe-eval` complicates SRI. Not a user-facing feature. |

---

## Pre-Launch Checklist — June 18

| # | Item | Status |
|---|---|---|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites) | ✅ |
| 3 | GEAR_ITEMS: 0 | ✅ |
| 4 | Sentry DSN non-empty | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (6 N-hem ski venues) | ✅ |
| 7 | Cache stamp lockstep (auto-bumps) | ✅ (structural fix June 17) |
| 8 | JSON-LD structured data | ✅ |
| 9 | Static H1 fallback | ✅ |
| 10 | ScoringExplainer (one-time card) | ✅ |
| 11 | Grid sorts by weekendScore | ✅ |
| 12 | Image lazy loading | ✅ |
| 13 | OG/JSON-LD venue count `350+` | ✅ |
| 14 | skiPass 100% on ski venues | ✅ |
| 15 | AP_CONTINENT complete | ✅ |
| 16 | Photo dedup (max repeat ≤3×) | ✅ |
| 17 | `book_click` + ToS/Privacy links | ✅ |
| 18 | Eager Supabase script removed | ✅ |
| 19 | AIRPORT_COORDS complete (363 codes) | ✅ (fixed June 17) |
| 20 | auto-push.sh cross-platform | ✅ (fixed June 17) |
| 21 | **VPS `/health` green** | ❓ Jack: verify before posting (5 min) |
| 22 | **Plausible domain validated** | ❓ Jack: confirm in Plausible dashboard |
| 23 | **Reddit account karma/age check** | ❌ Jack: verify shadowban risk |
| 24 | **Reddit post live** | ❌ Jack: by Friday June 20 |
| 25 | **Pre-launch incognito mobile audit** | ❌ Jack: set SFO, confirm ≥8 cards + prices |
| 26 | **Account deletion SQL in Supabase** | ❌ Jack (App Store gate, not Reddit gate) |

**20 of 26 green. Same as v61. Zero code changes moved the needle today. Everything left is Jack.**

---

## Revenue Model — June 18

| Stream | Status | RPM/1K MAU |
|---|---|---|
| Booking.com | ✅ Live | $6.90 |
| SafetyWing | ✅ Live | $0.54 |
| Travelpayouts | ✅ Live (VPS pending verify) | $0.14 |
| Amazon Associates | ❌ CUT for v1 | $0 |
| REI / Backcountry / GYG | LLC pending | +$8.00 unlocked |

**Live RPM: $7.58/1K MAU.** Revenue is noise at <100 MAU. Do not touch.

---

## 90-Day Projection — June 18

| Scenario | Users (90d) | What Has to Be True |
|---|---|---|
| Post today + VPS confirmed | **5K–7K** | Best remaining outcome. |
| Post Friday June 20 + VPS confirmed | **4K–6K** | Window slippage costs ~1K/week vs. June 16 ceiling. |
| Post with VPS unverified | **500–1.5K** | Grid throttles at 17 concurrent users. "Broken" is the Reddit narrative. |
| Post slips to July | **2K–3K** | Beach window half-gone. 100K goal slips to 2027. |

**For 6K not 4K:** Post today (not Friday), VPS confirmed first, Jack active in thread 3+ hours.

---

## One Product Risk Nobody Is Talking About

**The agent pipeline is generating authoritatively wrong findings at an increasing rate, and the compounding effect is real.**

In the last 5 days: the content agent hallucinated a specific photo ID at 5× repeat across 3 consecutive reports, the devops agent called a real P2 "NOT A BUG" by checking the wrong data structure, and the content agent has labeled a P3 venue gap "P0" for 5 consecutive days. Each finding is specific, confident, and plausible-sounding.

The compound effect: Jack now has to re-verify every agent finding before acting. That's the opposite of what the agent team is for. At <100 MAU, the cost is wasted focus. Post-Reddit-launch with real user bugs in-flight, false agent findings are a critical distraction tax.

What to fix after Friday:
1. **Content agent prompt**: already has correct photo-check grep (DevOps fixed June 18). Still needs severity calibration — missing venues are P3 unless the category is structurally empty, not "P0 day N."
2. **DevOps agent prompt**: add explicit instruction to verify the specific object cited by a prior agent, not just the general domain. "NOT A BUG" requires showing the relevant field in the correct data structure.
3. **The pipeline's check-in loop**: if an agent flags the same finding 3+ days with no fix, the two-strikes → known-skipped rule needs to apply to *severity inflation* too, not just stale findings.

This is a process improvement for the July sprint. Not a launch blocker. But if the agent team is still calibrated this way when the app hits 1K MAU, the PM report will be noise.

---

*Written 2026-06-18 | PM v62 | Venues: 358 (130 ski / 228 beach) | Cache: 20260618a | 20 of 26 pre-launch checks green | Hard deadline: Friday June 20*
