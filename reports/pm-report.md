# Peakly PM Report — 2026-06-17 (v61)

> Supersedes v60 (June 16). **Status: RED. Day 13 with no Reddit post. Beach peak window is closing. Two structural P1 fixes shipped this run (auto-push.sh root cause + 5 missing airport coords). Product is clean. Launch is Jack's call to make.**

---

## Prompt Corrections (permanent record — do not re-raise)

| Prompt Claim | Reality |
|---|---|
| "Peakly Pro price showing $9/mo" | Pro UI removed April 16. No price anywhere in the product. |
| "Sentry DSN empty" | Active at `app.jsx:7`. Never empty. |
| "Cache buster stale" | Auto-bumps on every Edit/Write touch (now fixed for remote sessions — see below). |
| "182 venues, 12 categories" | **358 venues, 2 categories (skiing / beach).** |
| "5× photo repeat (photo-15445505)" — Content June 17 | **HALLUCINATION.** That photo ID does not exist. Actual max repeat is 3× (confirmed via full URL grep). v60 fix was complete. Close permanently. |
| Airport coords TGD/OKA/SID/FUE/DJE "NOT A BUG" — DevOps v60 | **WRONG CALL.** DevOps confused `AP_CONTINENT` (lines 355+) with `AIRPORT_COORDS` (lines 6157+). These 5 codes were absent from the haversine lookup table. Now fixed this run. |

---

## Shipped Since v60 (2026-06-16 → 2026-06-17)

| What | Verdict |
|---|---|
| **DevOps June 17** — cache stamp `20260616b` → `20260617a` (1-day staleness, recurring root cause) | ✅ Fixed for this cycle; structural fix below. |
| **Content June 17** — data health 83/100; flagged phantom 5× and airport coords gap | ⚠️ Airport gap is real (fixed). Photo 5× is a hallucination (closed). |
| **auto-push.sh Mac path fixed (this run)** — replaced hardcoded `/Users/haydenb/peakly` with `git rev-parse --show-toplevel`; added CLAUDE.md guard. Now works on Mac, Linux, and all remote cloud sessions. | ✅ **ROOT CAUSE CLOSED.** 4 consecutive DevOps reports flagged this. Done. |
| **5 missing AIRPORT_COORDS added (this run)** — TGD (Montenegro), OKA (Okinawa), SID (Cape Verde), FUE (Fuerteventura), DJE (Djerba). These venues were bypassing the ≤Xhr flight-time filter. Brace balance: 5548/5548 ✅ | ✅ P2 closed. |

**Code state June 17 (post-this-run):**
- `app.jsx`: 13,197 lines · cache auto-bumps on next push · braces 5548/5548
- **358 venues** (130 skiing / 228 beach)
- **363 airport codes in AIRPORT_COORDS** (was 358 — 5 added)
- Photo max repeat: **≤3×** ✅ (v60 fix was complete; content agent hallucinated 5×)
- GEAR_ITEMS: 0 ✅ · Sentry: active ✅ · ALERTS_AVAILABLE gated ✅

---

## Bug Triage — June 17

| Bug | Severity | Days Open | Status |
|---|---|---|---|
| **Reddit post: not yet posted** | **P0 (business)** | **Day 13** | Jack only. Absolute deadline: Friday June 20. |
| **VPS unverified** | **P0 pre-launch** | 7 days | Jack: `ssh root@198.199.80.21 'pm2 status && curl -s localhost:3001/health'` — BEFORE posting. |
| **Open-Meteo rate ceiling at 14 users** | P1 | — | See risk section. VPS proxy is the only mitigation. Verify it's live. |
| **auto-push.sh Mac path** | P1 (recurring) | 4 reports | **FIXED this run.** Root cause of all recurring cache staleness. Closed. |
| **5 missing AIRPORT_COORDS** | P2 | 3 content reports | **FIXED this run.** TGD/OKA/SID/FUE/DJE now in haversine lookup. Closed. |
| **Supabase SQL paste** (`server/sql/delete-account.sql`) | P0 (App Store, not Reddit gate) | 7 days | Jack: Supabase SQL editor, 2 min. |
| **Content agent hallucinating photo IDs** | P2 (process) | 3 reports | See Decision 2 below. |
| 13 stale `claude/*` remote branches | P2 | 10 days | Jack, 15 min. Pre-Reddit hygiene. |
| SRI on CDN scripts | P3 | 40+ days | DEFER post-launch. Final. |
| CSP meta tag | P3 | 40+ days | DEFER. Babel `unsafe-eval` exemption required. |
| Tag depth (276/358 venues <3 tags) | P3 | Persistent | DEFER July sprint. |

**Closed permanently (do not re-raise):**
- auto-push.sh Mac path — fixed this run.
- AIRPORT_COORDS TGD/OKA/SID/FUE/DJE — fixed this run.
- Photo 5× (photo-15445505) — content agent hallucination; that ID doesn't exist; max is 3× and was correct since v60.

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---|---|---|---|
| **Jack posts to Reddit** | Users. Revenue. 100K goal. Everything. | 15 min | **Day 13** |
| **VPS SSH verify** | Spike-absorbing launch; rate ceiling safety net | 5 min | 7 days |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) compliance | 2 min | 7 days |
| Apple Developer enrollment | App Store submission queue | 1–2h + Apple wait | 16+ days |
| LLC approval | REI +$6.16/1K, Backcountry/GYG +$1.84/1K | External | External |

**Zero code blockers. All remaining blockers are Jack-manual actions.**

---

## Explicit Product Decisions — June 17

### Decision 1: Friday June 20 is the hard deadline for Reddit launch.

The beach-peak seasonal window closes in late July. Each week of delay costs 10–15% of the 90-day ceiling per the projection table. We are 13 days past the first "launch today" call (June 4), and 11 days past the official June 6 target.

There is no technical work left to do. The remaining items before posting are:
1. SSH to VPS and confirm `/health` shows `wx_cache_size > 0` (5 minutes)
2. Open app incognito on phone, set SFO as home airport, confirm ≥8 venue cards render with prices (3 minutes)
3. Post to r/solotravel before 11am PST, then r/frugaltravel 1–2 hours later (15 minutes)

**DECISION:** If the Reddit post is not live by end-of-day Friday June 20, the June launch is abandoned and the 90-day projection revises to 2K–4K. No more extensions.

---

### Decision 2: Content agent needs photo-check calibration.

Three consecutive reports (June 15, 16, 17) flagged a photo 5× issue with different, incorrect photo IDs each time. The correct way to check photo repeat is:

```bash
grep -o 'unsplash\.com/photo-[a-zA-Z0-9-]*' app.jsx | sed 's/?.*//;' | sort | uniq -c | sort -rn | head -5
```

This captures full photo IDs including the `-hash` suffix. A naive `grep -o "photo-[a-z0-9]*"` truncates at the `-` and conflates distinct photos. The content agent has been using the wrong grep for 3 days.

**DECISION:** Add the correct grep pattern to `tasks/agents/content-data.md` photo-check section. The agent should run this exact command to report photo max repeat. Until this is fixed, ignore all content-agent photo reports — the real max is ≤3× confirmed via the correct method.

---

### Decision 3: Open-Meteo rate ceiling is the launch-day single point of failure.

358 venues × 2 API calls = 716 upstream calls per cold user load. Free tier: 10K/day. Threshold: **14 simultaneous cold-loading users**. The VPS proxy (2hr shared cache) is the only mitigation. Without it, 15 simultaneous Reddit visitors trigger Open-Meteo throttling — partial venue degradation, no banner (the `weatherDown` banner only fires when ALL fetches fail), users see wrong scores with no explanation.

**DECISION:** VPS proxy verification is a hard gate before the Reddit post. If the proxy returns `wx_cache_size: 0` or is down, delay the post until it's back. This is not optional.

---

## This Week's Top 3 Priorities Only

**1. Jack: VPS verify + Reddit post. By Friday June 20.**
VPS first (5 min). Mobile incognito test (3 min). Post to r/solotravel before 11am PST. Stay in the thread 3h. Everything else is noise.

**2. Jack: Supabase SQL paste (2 min).**
`server/sql/delete-account.sql` → Supabase SQL editor → paste → run. Unblocks App Store 5.1.1(v). Takes 2 minutes. Has been open 7 days.

**3. Update content-data.md with correct photo grep command.**
One-line addition to the agent prompt. Prevents the 3-day false-alarm loop from repeating. Lower priority than the launch tasks but a fast fix.

---

## Features REJECTED This Week

| Feature | Decision | Reason |
|---|---|---|
| S.America beach batch (10 venues) | **REJECT — DEFER July** | Not a Reddit launch gate. N-hemisphere audience. No code changes until after launch. |
| Scoring algorithm overhaul (`claude/improve-scoring-system-XYGY6`) | **REJECT** | Requires six-hole audit per CLAUDE.md. No baseline data. Blast radius too high pre-launch. |
| SRI + CSP hardening | **DEFER post-launch** | Babel `unsafe-eval` exemption complicates SRI. Not a launch gate. |
| Hotels in deal score | **CUT. Final.** | v2 only. |
| Peakly Pro UI | **CUT for v1. Final.** | Post-1K MAU. |
| Tag enrichment (276 thin venues) | **DEFER July** | P3. No user-facing impact. |

---

## Pre-Launch Checklist — June 17

| # | Item | Status |
|---|---|---|
| 1 | SEO meta clean | ✅ |
| 2 | APNS Capacitor gate (3 sites) | ✅ |
| 3 | GEAR_ITEMS: 0 | ✅ |
| 4 | Sentry DSN non-empty | ✅ |
| 5 | Seasonal default beach N-hem June | ✅ |
| 6 | lateSeason flags (27 ski venues) | ✅ |
| 7 | Cache stamp lockstep (auto-bumps, now Linux-fixed) | ✅ |
| 8 | JSON-LD structured data | ✅ |
| 9 | Static H1 fallback | ✅ |
| 10 | ScoringExplainer (one-time card) | ✅ |
| 11 | Grid sorts by weekendScore | ✅ |
| 12 | Image lazy loading (all tags) | ✅ |
| 13 | OG/JSON-LD venue count `350+` | ✅ |
| 14 | skiPass 100% on ski venues | ✅ |
| 15 | AP_CONTINENT complete | ✅ |
| 16 | Photo dedup (max repeat ≤3×) | ✅ |
| 17 | `book_click` + ToS/Privacy links | ✅ |
| 18 | Eager Supabase script removed | ✅ |
| 19 | AIRPORT_COORDS complete (363 codes) | ✅ **(fixed this run)** |
| 20 | auto-push.sh works on Mac + Linux | ✅ **(fixed this run)** |
| 21 | **VPS `/health` green (wx_cache_size > 0)** | ❓ Jack: verify BEFORE posting (5 min) |
| 22 | **Plausible domain validated** | ❓ Jack: confirm in Plausible dashboard |
| 23 | **Reddit account karma/age check** | ❌ Jack: verify shadowban risk |
| 24 | **Reddit post written + posted** | ❌ Jack: by Friday June 20 |
| 25 | **Pre-launch incognito mobile audit** | ❌ Jack: set SFO, confirm ≥8 cards + prices |
| 26 | Account deletion SQL pasted in Supabase | ❌ Jack (App Store gate, not Reddit gate) |

**20 of 26 green. Zero code left to write. All remaining items are Jack-manual.**

---

## Revenue Model — June 17

| Stream | Status | RPM/1K MAU |
|---|---|---|
| Booking.com (`aid=2311236`) | ✅ Live | $6.90 |
| SafetyWing (`referenceID=peakly`) | ✅ Live | $0.54 |
| Travelpayouts (`TP_MARKER=710303`) | ✅ Live (VPS pending verify) | $0.14 |
| Amazon Associates | ❌ CUT for v1 | $0 |
| REI (Avantlink) | LLC pending | +$6.16 unlocked |
| Backcountry / GetYourGuide | LLC pending | +$1.84 unlocked |

**Live RPM: $7.58/1K MAU.** LLC approval → ~$15.58. Revenue is noise at <100 MAU. Do not touch.

---

## 90-Day Projection — June 17

| Scenario | Users (90d) | What Has to Be True |
|---|---|---|
| Post by Friday June 20 + VPS live | **5K–7K** | VPS confirmed live. Grid shows ≥8 strong beach cards. Jack in thread 3h post-posting. (Window slippage vs. June 16 targets costs ~1K ceiling.) |
| Post today + VPS down | **1K–2K** | Grid throttles at 14 users. "Broken" is the Reddit narrative. |
| Post slips to July | **2K–3K** | Beach window half-gone. 100K goal slips to 2027. |
| No 2026 launch | **<1K** | Organic SEO only. 100K goal is 2028 at earliest. |

**For 7K not 5K:** VPS confirmed today, post lands Friday before 11am PST, Jack active in comments for 3+ hours.

---

## One Product Risk Nobody Is Talking About

**The content agent is generating authoritatively wrong data quality reports.**

Three consecutive days, it has flagged a photo 5× issue with incorrect photo IDs (`photo-15445505` on June 17, different wrong IDs on June 15 and 16). It cited specific venue names and a specific fix. All hallucinated. The fix commands would have changed correct photo URLs to nonexistent ones.

The devops agent then compounded it: it categorically declared the airport coords finding "NOT A BUG" after mis-reading which data structure was being checked. That false reassurance let a real P2 (5 missing AIRPORT_COORDS) sit open for 3 reports before getting fixed today.

This is a trust calibration failure in the agent pipeline. The agents are generating confident, specific, plausible-sounding false findings. When Jack reads these reports, he has no way to distinguish real bugs from hallucinated ones without running the checks himself — which defeats the purpose of the agent team.

**What needs to happen:**
1. Add the correct grep command to content-data.md (Decision 2 above) so the agent uses reproducible, correct tooling.
2. Add an explicit "verify, don't trust, prior agents' conclusions" instruction to devops.md for cross-agent validation.
3. Jack: when a report says "NOT A BUG," that means "I checked and it's fine" — but always check WHAT the agent actually checked. In this case, DevOps checked the wrong object (AP_CONTINENT vs AIRPORT_COORDS).

The false-negative is more dangerous than a false-positive. A hallucinated bug wastes 5 minutes. A hallucinated "this is fine" leaves a real bug in prod.

---

*Written 2026-06-17 | PM v61 | Venues: 358 (130 ski / 228 beach) | Code fixes: auto-push.sh Mac path (structural), 5 missing AIRPORT_COORDS (P2 filter bypass closed)*
