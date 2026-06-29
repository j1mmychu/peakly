# Peakly PM Report — 2026-06-29 (v73)

> Supersedes v72 (June 28). **Status: RED on distribution, GREEN on code.** Day 25 of "launch-ready." Reddit launch is tomorrow — Monday June 30. There is no next good window after July 4. This is it.

---

## Agent Prompt Corrections (permanent — stop raising these)

| Prompt Claim | Reality |
|---|---|
| "182 venues" | **370 venues.** Stale from pre-May pivot. Stop. |
| "Peakly Pro price $9/mo vs $79/yr" | **Pro UI removed April 16.** No price shows anywhere. Stop. |
| "Sentry DSN empty" | **Active at `app.jsx:7`.** Stop. |
| "Cache buster stale" | **Auto-bumped daily by DevOps.** Currently `20260629a`. Stop. |
| "VPS Day X binary blocker" | **VPS confirmed healthy June 13. Sandbox 403s = container egress block, not VPS outage. Stop.** |
| "DEAL_WEIGHT finding" | **Locked at 0.25 (75/25) since May 13.** Stop. |
| "GEAR_ITEMS" | **0 refs. Amazon cut for v1. Final.** |
| "Duplicate commit pattern" | **Known-skipped June 25 (second strike).** Stop. |
| "197 empty-tag venues" | **FALSE — all 370 venues have tags.** Stop. |
| "40 ski venues had 1 tag" | **FIXED June 26. All 370 ≥2 tags.** Stop. |
| "Plausible data-domain scoped wrong" | **Flagged v73. Known. `j1mmychu.github.io` → defer fix to week of July 7. Peakly is the only app on that subdomain so analytics are unaffected in practice.** |

---

## Shipped Since v72 (2026-06-28 → 2026-06-29)

| What | Verdict |
|------|---------|
| **DevOps June 29** (`6d6cf0f`) — cache buster `20260627a`→`20260629a`, Babel added to SW PRECACHE, VPS unverifiable from sandbox | ✅ Right call. Cache lag was 2 days; now current. Babel in PRECACHE is a real improvement — warm loads drop 2-3s on return visits. |
| **Content June 29** (`8025f64`) — verification pass, 0 changes, venue freeze honored, 370/131/239 confirmed | ✅ Clean. Nothing to add. |

**Zero app.jsx changes overnight.** The freeze is holding. No regressions. This is exactly right.

**Code state June 29:**
- `app.jsx`: 13,443 lines · build `20260629a`
- **370 venues** (131 skiing / 239 beach) · GEAR_ITEMS: 0 · lateSeason: 25
- Braces: 5,565/5,565 · Sentry DSN: active · Plausible: wired
- 138 unique photos · max repeat 3× · 0 empty-tag venues · 131/131 skiPass coverage

---

## Bug Triage — June 29

| Bug | Severity | Status |
|-----|----------|--------|
| **Reddit post: Day 25** | **P0 (business)** | Jack only. Tomorrow morning. Not negotiable. |
| **VPS health pre-post** | **P1 (pre-launch)** | Jack: `curl https://peakly-api.duckdns.org/health`. 30 sec. Do it before you write the Reddit post. |
| Plausible `data-domain="j1mmychu.github.io"` (too broad) | P2 | DEFER week of July 7. 2-min fix. No analytics loss in practice — Peakly is the only app on that subdomain. |
| SRI on CDN scripts (Open #10) | P3 | DEFER post-launch. 30 min + re-computation needed on every version bump. Medium security risk, low urgency. |
| **Supabase SQL paste** | P0 (App Store) · P3 (web) | `server/sql/delete-account.sql` into Supabase SQL editor. Graceful fallback active. Do after Reddit confirms demand. |
| 14 orphaned `claude/` branches on origin | P4 | Jack or GitHub UI batch-delete. Not blocking anything. |

**Permanently closed — stop raising:** Peakly Pro price · Sentry DSN · VPS "Day X blocker" · DEAL_WEIGHT · GEAR_ITEMS · lateSeason gaps · EWR AP_CONTINENT · duplicate-commit pattern · empty tag arrays

---

## Known Blockers

| Blocker | What It Unlocks | Effort | Days Stalled |
|---------|----------------|--------|-------------|
| **Jack posts to Reddit** | Users. Everything else is noise. | 15 min | **25** |
| **VPS SSH verify** | Confident weather proxy pre-spike | 30 sec | 16 |
| **Supabase SQL paste** | iOS App Store 5.1.1(v) | 2 min | 19 |
| LLC approval | REI +$6.16, Backcountry +$0.64, GYG +$1.20/1K MAU | External | External |
| Apple Developer ($99) | App Store submission | 2h + review | Post-Reddit |

---

## Explicit Product Decisions — June 29

### Decision 1: SHIP Reddit post Monday June 30, 9-11 AM Eastern. The July 4 window closes Tuesday.

The math is simple: July 4 weekend is Friday July 3–Monday July 6. Open-Meteo's reliable forecast window is 7 days. A Monday June 30 post shows July 3-6 at day 3-6 out — the highest-confidence zone. A Tuesday July 1 post shows the same weekend at day 2-5 out — slightly tighter window, smaller Reddit weekday audience for travel content. A Wednesday post or later means the July 4 weekend is already day 1-4 out when users check, and many will have already booked or committed.

After July 6:
- The next natural US launch hook is Labor Day (August 29–September 1)
- That's 9 weeks of 0 users
- The Southern Hemisphere ski season (the best angle for summer launch) peaks July–August and starts tapering September
- The beach narrative holds through August but without a holiday anchor, Reddit post momentum is lower

**Post Monday. 9-11 AM Eastern. r/frugaltravel first, then r/solotravel within 2 hours if the frugaltravel post gets traction.**

The post copy v72 suggested is good. Jack: lead with the July 4 weekend angle in your first comment. "I checked from [your home airport] — [specific venue] is showing [score] this weekend for [specific price]." Real data converts Reddit readers. Manufactured enthusiasm doesn't.

---

### Decision 2: DEFER Plausible domain scope fix (2 min) to July 7.

DevOps flagged that `data-domain="j1mmychu.github.io"` captures all pages under the subdomain rather than Peakly specifically. The fix is `j1mmychu.github.io/peakly`.

**Why defer:** Peakly is the only app on j1mmychu.github.io, so analytics are not contaminated. The freeze holds through July 3. Making any change to index.html 12 hours before Reddit introduces unnecessary risk. We will have clean data either way. Fix it the week of July 7 alongside the Supabase SQL paste.

**DEFER: Plausible domain scope. July 7.**

---

### Decision 3: DEFER SRI hashes on CDN scripts (Open #10) indefinitely post-launch.

Open #10 has been open for months. The security risk is real but the threat model is a CDN compromise on unpkg — a supply-chain attack that would affect thousands of apps simultaneously, not Peakly specifically. The fix requires computing SHA-384 hashes for each CDN-hosted file and re-computing them on every version pin update. This is a maintenance obligation, not a one-time fix.

Post-launch, if the LLC gets approved and REI/GYG affiliate programs go live, the security posture needs to harden. At that point SRI becomes appropriate. Right now it's low-priority.

**DEFER: SRI hashes. Post-LLC approval.**

---

## This Week's Top 3 Priorities Only

**1. Jack: Post to Reddit Monday June 30, 9-11 AM Eastern.**

The July 4 window closes Tuesday. 25 days of "launch-ready" with 0 users is not product-market fit testing — it's procrastination. The code is clean. The venue catalog is the best it's ever been. 23 southern-hemisphere ski venues at peak mid-season + 184 northern beach venues at summer peak = the strongest dual-category lineup Peakly has ever had. Ship.

**2. Jack: VPS health check from your local terminal before you write the post.**

`curl https://peakly-api.duckdns.org/health` → confirm `wx_cache_size > 0`. Then prime the cache: hit 5-10 popular venues manually. A cold-cache Reddit spike means 200 concurrent users all pulling fresh weather at once, blowing through Open-Meteo's free tier in minutes. The proxy cache prevents this — but only if it's warm when the spike hits. 5 minutes of prep before the post protects the entire launch.

**3. Jack: Supabase SQL paste the day after Reddit, once demand is confirmed.**

`server/sql/delete-account.sql` → Supabase SQL editor. This is the final iOS App Store gate (Guideline 5.1.1(v) — account deletion). The web product has a graceful fallback. Once Reddit validates real demand, the App Store submission path opens within 48 hours of this 2-minute action.

---

## Features REJECTED This Week

| Feature | Rejection Reason |
|---------|-----------------|
| SRI hashes on CDN scripts | Low urgency at current scale. Post-LLC. DEFER. |
| Plausible domain scope fix | Freeze holds. Non-issue in practice. DEFER to July 7. |
| Venue deep links / permalink pages | Build after Plausible shows which venues get >100 detail views/day. No demand data yet. DEFER. |
| New venue categories (climbing, surf, hiking) | 0 users have validated demand. CUT for v1. |
| JSON-LD structured data | SEO matters after you have content traffic. Zero users = zero ranking signal. DEFER post-launch. |
| Email automation / digest | Valid retention lever. Build infra after you know someone signed up. Manual founder email in Week 2 > automated empty list. DEFER code; SHIP as Jack-action week of July 7. |
| Hotel integrations in deal score | Deferred since v63. CUT for v1. |

---

## Success Criteria — What Has to Be True for 8K, Not 5K?

90-day projection: 5K–8K users. To hit 8K, not 5K:

1. **Reddit CTR ≥ 3%** — most travel posts hit 0.5–1.5%. 3% CTR on r/frugaltravel at 200 upvotes = ~6K visitors in 72h. Jack's real-data comment is the multiplier. Without it, expect 0.8% and ~1.6K visits.

2. **Week-1 retention ≥ 25%** — the Day 8 cliff kills most apps. A single manual email from Jack to everyone who signed up in Week 1 ("this weekend's top spots from your home airport") is worth 3–5 percentage points of retention. Do it manually before building automation.

3. **Beach narrative holds through August** — if Plausible shows US users clicking Skiing at >40% rate and bouncing on S-hemisphere content, there's a narrative mismatch. Build the "it's Southern Hemisphere winter" educational note immediately if Plausible confirms it. Don't pre-build.

4. **VPS stays live during the Reddit spike** — the cache is the protection. If VPS goes down mid-spike, all concurrent users pile onto Open-Meteo's free tier and you're throttled within minutes. Confirming VPS health before posting is not optional.

---

## One Product Risk Nobody Is Talking About

**Mobile first-load time will hurt Reddit conversion and there is no clean fix.**

Babel Standalone is 1.8MB. React + ReactDOM adds ~200KB. app.jsx is 657KB. Total first-load transfer: ~2.6MB. On mobile 4G (the majority of Reddit traffic), that's 5–10 seconds of spinner before a single card renders. Google data: a 2-second delay cuts conversion ~20%. A 5-second delay loses the majority.

The Babel-in-PRECACHE improvement DevOps shipped today helps returning users — it does not help cold Reddit visitors. There is no fix within the no-build constraint.

Three things to do before posting that cost nothing:
1. Open j1mmychu.github.io/peakly cold on your phone. If the spinner feels broken, the Reddit audience will interpret it the same way.
2. The post copy should set expectations: "takes a few seconds to load weather for 370 venues globally"
3. Accept lower mobile conversion than desktop. Don't optimize for a ceiling that requires a build step to raise.

If MAU stalls below 500 after Reddit and Plausible shows >80% bounce before first card render, the number-one lever is a build step (Vite/esbuild) shrinking the payload to ~200KB. That's a v2 architectural decision requiring Jack's explicit sign-off.

---

## Pre-Launch Checklist for Jack (Monday morning before posting)

- [ ] `curl https://peakly-api.duckdns.org/health` → `wx_cache_size > 0`
- [ ] Open j1mmychu.github.io/peakly cold on mobile — cards appear, no blank screen
- [ ] Check Sentry dashboard — zero new errors from `20260629a` build
- [ ] Check Plausible dashboard — tracking active
- [ ] Draft your personal comment (home airport + 2 real venues with real scores) before you post the main link

---

*Report written by PM agent — 2026-06-29 (v73). Reddit launch: tomorrow. If it's live by June 30 v74 is a launch metrics report. If not, we have a distribution problem, not a product problem.*
